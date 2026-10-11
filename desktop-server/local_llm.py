"""Optional local GGUF runner for MEP Video Maker.

This module deliberately has no dependency on Kokoro or Flask.  The video
maker can keep generating narration when a model is absent, downloading, or
has crashed.  It talks to a separately installed llama.cpp server over the
standard OpenAI-compatible local API.
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import threading
import time
import urllib.parse
import urllib.request
import uuid
from pathlib import Path


class LocalLLM:
    def __init__(self, base: Path):
        self.base = base
        self.models_dir = base / "models"
        self.models_dir.mkdir(exist_ok=True)
        self.config_path = base / "llm-config.json"
        self.downloads: dict[str, dict] = {}
        self.process: subprocess.Popen | None = None
        self.lock = threading.RLock()
        self.config = self._load_config()

    @staticmethod
    def catalog() -> list[dict]:
        return [
            {
                "id": "qwen25-3b-q4km",
                "name": "Qwen2.5 3B Instruct · Q4_K_M",
                "size": "about 2.1 GB",
                "description": "Balanced local writing and Short scripting model.",
                "url": "https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF/resolve/main/qwen2.5-3b-instruct-q4_k_m.gguf?download=true",
                "filename": "qwen2.5-3b-instruct-q4_k_m.gguf",
            },
            {
                "id": "qwen3-4b-q4km",
                "name": "Qwen3 4B · Q4_K_M",
                "size": "about 2.5 GB",
                "description": "A newer general-purpose local assistant; needs more memory.",
                "url": "https://huggingface.co/Qwen/Qwen3-4B-GGUF/resolve/main/Qwen3-4B-Q4_K_M.gguf?download=true",
                "filename": "Qwen3-4B-Q4_K_M.gguf",
            },
        ]

    def _load_config(self) -> dict:
        defaults = {"modelsFolder": str(self.models_dir), "runner": "", "model": "", "port": 8081, "context": 4096, "gpuLayers": 0}
        try:
            loaded = json.loads(self.config_path.read_text(encoding="utf-8"))
            return {**defaults, **(loaded if isinstance(loaded, dict) else {})}
        except Exception:
            return defaults

    def _save_config(self) -> None:
        self.config_path.write_text(json.dumps(self.config, indent=2), encoding="utf-8")

    @staticmethod
    def _safe_folder(value: str) -> Path:
        path = Path(value).expanduser().resolve()
        if not path.exists() or not path.is_dir():
            raise ValueError("Choose an existing model folder.")
        return path

    def models_folder(self) -> Path:
        try:
            return self._safe_folder(str(self.config.get("modelsFolder") or self.models_dir))
        except ValueError:
            return self.models_dir

    def set_folder(self, folder: str) -> dict:
        path = self._safe_folder(folder)
        self.config["modelsFolder"] = str(path)
        self._save_config()
        return self.status()

    def pick_folder(self) -> dict:
        # This intentionally runs only after an explicit button press in the
        # local dashboard.  A browser cannot otherwise ask Windows for a
        # server-side directory.
        try:
            import tkinter as tk
            from tkinter import filedialog
            root = tk.Tk()
            root.withdraw()
            root.attributes("-topmost", True)
            chosen = filedialog.askdirectory(initialdir=str(self.models_folder()), title="Choose your GGUF model folder")
            root.destroy()
        except Exception as exc:
            raise RuntimeError(f"Windows folder picker could not open: {exc}") from exc
        if chosen:
            return self.set_folder(chosen)
        return self.status()

    def scan(self) -> list[dict]:
        root = self.models_folder()
        rows = []
        for path in root.rglob("*.gguf"):
            try:
                stat = path.stat()
                rows.append({"path": str(path), "name": path.name, "bytes": stat.st_size, "modified": int(stat.st_mtime)})
            except OSError:
                continue
        return sorted(rows, key=lambda item: item["name"].lower())

    def _find_runner(self) -> str:
        configured = str(self.config.get("runner") or "").strip()
        candidates = [configured] if configured else []
        candidates += [
            shutil.which("llama-server") or "", shutil.which("llama-server.exe") or "",
            str(self.base / "llama.cpp" / "llama-server.exe"),
            str(self.base / "llama.cpp" / "llama-server"),
        ]
        for candidate in candidates:
            if candidate and Path(candidate).is_file():
                return str(Path(candidate))
        return ""

    def set_runner(self, runner: str) -> dict:
        runner = str(runner or "").strip()
        if runner and not Path(runner).expanduser().is_file():
            raise ValueError("llama-server executable was not found at that path.")
        self.config["runner"] = str(Path(runner).expanduser()) if runner else ""
        self._save_config()
        return self.status()

    def start_download(self, catalog_id: str) -> dict:
        item = next((x for x in self.catalog() if x["id"] == catalog_id), None)
        if not item:
            raise ValueError("That model is not in the approved download list.")
        job_id = uuid.uuid4().hex
        destination = self.models_folder() / item["filename"]
        job = {"id": job_id, "name": item["name"], "state": "queued", "downloaded": 0, "total": 0, "error": None, "path": str(destination)}
        with self.lock:
            self.downloads[job_id] = job
        threading.Thread(target=self._download, args=(job_id, item["url"], destination), daemon=True).start()
        return job.copy()

    def _download(self, job_id: str, url: str, destination: Path) -> None:
        job = self.downloads[job_id]
        try:
            host = urllib.parse.urlparse(url).hostname or ""
            if host not in {"huggingface.co", "hf.co"}:
                raise ValueError("Only the built-in Hugging Face model links are allowed.")
            part = destination.with_suffix(destination.suffix + ".part")
            req = urllib.request.Request(url, headers={"User-Agent": "MEP-Video-Maker/1.0"})
            job["state"] = "downloading"
            with urllib.request.urlopen(req, timeout=60) as response, part.open("wb") as output:
                job["total"] = int(response.headers.get("Content-Length") or 0)
                while True:
                    block = response.read(1024 * 1024)
                    if not block:
                        break
                    output.write(block)
                    job["downloaded"] += len(block)
            if job["downloaded"] < 1024 * 1024:
                raise RuntimeError("The model download was unexpectedly small.")
            part.replace(destination)
            job["state"] = "complete"
        except Exception as exc:
            job["state"] = "error"
            job["error"] = str(exc)

    def download_status(self, job_id: str | None = None) -> list[dict] | dict:
        with self.lock:
            if job_id:
                if job_id not in self.downloads:
                    raise ValueError("Download was not found.")
                return self.downloads[job_id].copy()
            return [item.copy() for item in self.downloads.values()]

    def start(self, model: str, runner: str = "", port: int = 8081, context: int = 4096, gpu_layers: int = 0) -> dict:
        if self.process and self.process.poll() is None:
            raise RuntimeError("The local GGUF server is already running. Stop it before changing models.")
        model_path = Path(model).expanduser().resolve()
        if model_path.suffix.lower() != ".gguf" or not model_path.is_file():
            raise ValueError("Select a real .gguf model file.")
        if runner:
            self.set_runner(runner)
        executable = self._find_runner()
        if not executable:
            raise RuntimeError("llama-server was not found. Install llama.cpp with `winget install llama.cpp`, then restart MEP, or choose llama-server.exe.")
        port = max(1024, min(65535, int(port)))
        context = max(512, min(32768, int(context)))
        gpu_layers = max(0, min(999, int(gpu_layers)))
        command = [executable, "-m", str(model_path), "--host", "127.0.0.1", "--port", str(port), "-c", str(context), "-ngl", str(gpu_layers)]
        flags = subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0
        self.process = subprocess.Popen(command, cwd=str(model_path.parent), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, creationflags=flags)
        self.config.update({"model": str(model_path), "port": port, "context": context, "gpuLayers": gpu_layers})
        self._save_config()
        return self.status()

    def stop(self) -> dict:
        if self.process and self.process.poll() is None:
            self.process.terminate()
            try:
                self.process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.process.kill()
        self.process = None
        return self.status()

    def status(self) -> dict:
        running = bool(self.process and self.process.poll() is None)
        return {
            "enabled": True,
            "running": running,
            "pid": self.process.pid if running else None,
            "modelsFolder": str(self.models_folder()),
            "models": self.scan(),
            "catalog": self.catalog(),
            "runner": self._find_runner(),
            "configuredRunner": str(self.config.get("runner") or ""),
            "model": str(self.config.get("model") or ""),
            "port": int(self.config.get("port") or 8081),
            "context": int(self.config.get("context") or 4096),
            "gpuLayers": int(self.config.get("gpuLayers") or 0),
            "downloads": self.download_status(),
        }

    def chat(self, messages: list[dict], max_tokens: int = 550, temperature: float = 0.7) -> dict:
        if not self.process or self.process.poll() is not None:
            raise RuntimeError("The local GGUF server is not running. Voice tools are still available.")
        cleaned = []
        for item in messages[-12:]:
            role = str(item.get("role") or "user")
            content = str(item.get("content") or "")[:8000]
            if role in {"system", "user", "assistant"} and content:
                cleaned.append({"role": role, "content": content})
        if not cleaned:
            raise ValueError("Write a message for the local model.")
        payload = json.dumps({"model": "local-gguf", "messages": cleaned, "max_tokens": max(32, min(2048, int(max_tokens))), "temperature": max(0, min(2, float(temperature))) }).encode("utf-8")
        url = f"http://127.0.0.1:{int(self.config.get('port') or 8081)}/v1/chat/completions"
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"}, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=180) as response:
                result = json.loads(response.read().decode("utf-8"))
        except Exception as exc:
            raise RuntimeError(f"Local GGUF request failed: {exc}") from exc
        choice = (result.get("choices") or [{}])[0]
        message = choice.get("message") or {}
        return {"text": str(message.get("content") or "").strip(), "raw": result}

    def open_folder(self) -> None:
        folder = self.models_folder()
        if os.name == "nt":
            os.startfile(str(folder))  # type: ignore[attr-defined]
        else:
            subprocess.Popen(["xdg-open", str(folder)])

