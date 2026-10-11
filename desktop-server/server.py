from __future__ import annotations

import io
import json
import os
import re
import socket
import shutil
import threading
import time
import urllib.request
import urllib.parse
import hashlib
import mimetypes
import webbrowser
import zipfile
from pathlib import Path

import numpy as np
import qrcode
import soundfile as sf
from flask import Flask, jsonify, redirect, render_template, request, send_file, send_from_directory
from waitress import serve

from local_llm import LocalLLM

BASE = Path(__file__).resolve().parent
REPO_ROOT = BASE.parent
LOCAL_EDITOR = BASE / "editor"
OUTPUTS = BASE / "outputs"
CACHE = BASE / "cache"
MAP_CACHE = CACHE / "maps"
PHOTO_CACHE = CACHE / "historical-photos"
HF_CACHE = CACHE / "huggingface"
OUTPUTS.mkdir(exist_ok=True)
MAP_CACHE.mkdir(parents=True, exist_ok=True)
PHOTO_CACHE.mkdir(parents=True, exist_ok=True)
HF_CACHE.mkdir(parents=True, exist_ok=True)

os.environ.setdefault("HF_HOME", str(HF_CACHE))
os.environ.setdefault("HUGGINGFACE_HUB_CACHE", str(HF_CACHE / "hub"))

HOST = os.environ.get("MEP_HOST", "0.0.0.0")
PORT = int(os.environ.get("MEP_PORT", "7860"))
DEFAULT_VOICE = os.environ.get("MEP_VOICE", "bm_george")
DEFAULT_SPEED = float(os.environ.get("MEP_SPEED", "0.95"))

BRITISH_VOICES = [
    {"id": "bm_george", "name": "George", "description": "Classic British male"},
    {"id": "bm_daniel", "name": "Daniel", "description": "Polished British male"},
    {"id": "bm_fable", "name": "Fable", "description": "Storytelling British male"},
    {"id": "bm_lewis", "name": "Lewis", "description": "Modern British male"},
]

MAP_FILES = {
    1000: "world_1000.geojson", 1100: "world_1100.geojson", 1200: "world_1200.geojson",
    1279: "world_1279.geojson", 1300: "world_1300.geojson", 1400: "world_1400.geojson",
    1492: "world_1492.geojson", 1500: "world_1500.geojson", 1530: "world_1530.geojson",
    1600: "world_1600.geojson", 1650: "world_1650.geojson", 1700: "world_1700.geojson",
    1715: "world_1715.geojson", 1783: "world_1783.geojson", 1800: "world_1800.geojson",
    1815: "world_1815.geojson", 1878: "world_1878.geojson", 1880: "world_1880.geojson",
    1900: "world_1900.geojson", 1914: "world_1914.geojson", 1920: "world_1920.geojson",
    1930: "world_1930.geojson", 1938: "world_1938.geojson", 1945: "world_1945.geojson",
    1960: "world_1960.geojson", 1994: "world_1994.geojson", 2000: "world_2000.geojson",
    2010: "world_2010.geojson",
}
MAP_SOURCES = [
    "https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/",
    "https://cdn.jsdelivr.net/gh/aourednik/historical-basemaps@master/geojson/",
]

app = Flask(__name__, template_folder=str(BASE / "templates"), static_folder=str(BASE / "static"))
local_llm = LocalLLM(BASE)

_pipeline = None
_pipeline_lock = threading.Lock()
_model_error = None


def local_ip() -> str:
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        try:
            return socket.gethostbyname(socket.gethostname())
        except Exception:
            return "127.0.0.1"


def editor_root() -> Path:
    if (LOCAL_EDITOR / "index.html").exists():
        return LOCAL_EDITOR
    if (REPO_ROOT / "index.html").exists():
        return REPO_ROOT
    return LOCAL_EDITOR


def prepare_editor() -> Path:
    LOCAL_EDITOR.mkdir(parents=True, exist_ok=True)
    if (REPO_ROOT / "index.html").exists():
        shutil.copy2(REPO_ROOT / "index.html", LOCAL_EDITOR / "index.html")
        for folder in ("assets", "css", "js", "presets", "maps", "historical-maps"):
            src = REPO_ROOT / folder
            dst = LOCAL_EDITOR / folder
            if src.exists():
                shutil.copytree(src, dst, dirs_exist_ok=True)
        return LOCAL_EDITOR
    archive_url = "https://github.com/novaeriahengine/MEP-Video-Maker/archive/refs/heads/main.zip"
    with urllib.request.urlopen(archive_url, timeout=90) as response:
        data = io.BytesIO(response.read())
    with zipfile.ZipFile(data) as z:
        prefix = "MEP-Video-Maker-main/"
        wanted = ("index.html", "assets/", "css/", "js/", "presets/", "maps/", "historical-maps/")
        for name in z.namelist():
            if not name.startswith(prefix):
                continue
            rel = name[len(prefix):]
            if not rel or not any(rel == w or rel.startswith(w) for w in wanted):
                continue
            target = LOCAL_EDITOR / rel
            if name.endswith("/"):
                target.mkdir(parents=True, exist_ok=True)
            else:
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(z.read(name))
    if not (LOCAL_EDITOR / "index.html").exists():
        raise RuntimeError("Offline editor download did not contain index.html")
    return LOCAL_EDITOR


def safe_name(value: str, fallback: str = "mep-narration") -> str:
    value = re.sub(r"[^a-zA-Z0-9._-]+", "-", value or "").strip("-._")
    return (value or fallback)[:100]


def get_pipeline():
    global _pipeline, _model_error
    if _pipeline is not None:
        return _pipeline
    with _pipeline_lock:
        if _pipeline is not None:
            return _pipeline
        try:
            from kokoro import KPipeline
            _pipeline = KPipeline(lang_code="b")
            _model_error = None
            return _pipeline
        except Exception as exc:
            _model_error = str(exc)
            raise


PHOTO_PACK_QUERIES = [
    "World War I Western Front trenches 1916",
    "World War I Eastern Front 1915",
    "Pearl Harbor attack December 1941",
    "Battle of Midway June 1942",
    "Normandy landings D-Day 1944",
    "American Revolution Lexington Concord historical",
    "French Revolution Bastille 1789 historical",
    "Battle of Waterloo 1815 painting",
    "Cuban Missile Crisis 1962 historical",
    "Berlin Wall 1989 historical",
]

def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", str(text or "")).strip()
    return text.replace("—", ", ").replace("–", ", ")

def polish_audio(audio: np.ndarray) -> np.ndarray:
    audio = np.asarray(audio, dtype=np.float32)
    if not len(audio):
        return audio
    audio = audio - float(np.mean(audio))
    fade = min(int(24000 * 0.02), len(audio) // 4)
    if fade > 1:
        ramp = np.linspace(0.0, 1.0, fade, dtype=np.float32)
        audio[:fade] *= ramp
        audio[-fade:] *= ramp[::-1]
    peak = float(np.max(np.abs(audio))) or 1.0
    audio *= min(1.0, 0.92 / peak)
    return np.clip(audio, -0.98, 0.98)

def commons_search(query: str, limit: int = 8):
    params = {
        "action": "query", "format": "json", "generator": "search",
        "gsrsearch": query, "gsrnamespace": "6", "gsrlimit": max(1, min(20, int(limit))),
        "prop": "imageinfo", "iiprop": "url|extmetadata|mime", "iiurlwidth": "1200",
    }
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": "MEP-Video-Maker/1.0 historical-photo-tool"})
    with urllib.request.urlopen(req, timeout=35) as response:
        payload = json.loads(response.read().decode("utf-8"))
    items = []
    for page in (payload.get("query", {}).get("pages", {}) or {}).values():
        info = (page.get("imageinfo") or [{}])[0]
        meta = info.get("extmetadata") or {}
        mime = info.get("mime") or ""
        if not mime.startswith("image/"):
            continue
        license_name = str((meta.get("LicenseShortName") or {}).get("value") or "")
        allowed = ("public domain", "cc0", "cc by", "cc-by", "cc by-sa", "cc-by-sa")
        if not any(x in license_name.lower() for x in allowed):
            continue
        thumb = info.get("thumburl") or info.get("url")
        if not thumb:
            continue
        title = str(page.get("title") or "Historical image").replace("File:", "", 1)
        strip_tags = lambda v: re.sub(r"<[^>]+>", "", str(v or ""))
        items.append({
            "title": title,
            "thumbUrl": thumb,
            "originalUrl": info.get("url") or thumb,
            "descriptionUrl": info.get("descriptionurl") or "",
            "license": license_name or "License listed on Wikimedia Commons",
            "artist": strip_tags((meta.get("Artist") or {}).get("value"))[:180],
            "credit": strip_tags((meta.get("Credit") or {}).get("value"))[:180],
            "description": strip_tags((meta.get("ImageDescription") or {}).get("value"))[:500],
        })
    return items

def cached_photo(url: str) -> Path:
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme != "https" or parsed.hostname not in {"upload.wikimedia.org", "commons.wikimedia.org"}:
        raise ValueError("Only Wikimedia Commons image URLs are allowed.")
    digest = hashlib.sha256(url.encode("utf-8")).hexdigest()[:20]
    ext = Path(parsed.path).suffix.lower()
    if ext not in {".jpg", ".jpeg", ".png", ".webp"}:
        ext = ".jpg"
    target = PHOTO_CACHE / f"{digest}{ext}"
    if target.exists() and target.stat().st_size > 1000:
        return target
    req = urllib.request.Request(url, headers={"User-Agent": "MEP-Video-Maker/1.0 historical-photo-tool"})
    with urllib.request.urlopen(req, timeout=60) as response:
        data = response.read(16 * 1024 * 1024 + 1)
    if len(data) > 16 * 1024 * 1024:
        raise ValueError("Historical image is larger than 16 MB.")
    target.write_bytes(data)
    return target

def trim_trailing_silence(audio: np.ndarray, max_trim_ms: float = 100.0) -> np.ndarray:
    if audio.size < 10 or max_trim_ms <= 0:
        return audio
    max_trim = min(len(audio) - 1, int(24000 * max_trim_ms / 1000.0))
    if max_trim <= 0:
        return audio
    tail = np.abs(audio[-max_trim:])
    voiced = np.where(tail > 0.0035)[0]
    if voiced.size == 0:
        return audio[:-max_trim]
    keep_from_end = max_trim - int(voiced[-1]) - 1
    trim = min(max_trim, max(0, keep_from_end - int(24000 * 0.025)))
    return audio[:-trim] if trim > 0 else audio


def synthesize(text: str, voice: str = DEFAULT_VOICE, speed: float = DEFAULT_SPEED, pause_ms: float = 70.0, tail_trim_ms: float = 100.0):
    text = clean_text(text)
    if not text:
        raise ValueError("Text is empty.")
    voice_ids = {v["id"] for v in BRITISH_VOICES}
    if voice not in voice_ids:
        voice = DEFAULT_VOICE
    speed = max(0.6, min(1.4, float(speed or DEFAULT_SPEED)))
    pause_ms = max(0.0, min(450.0, float(pause_ms or 0)))
    tail_trim_ms = max(0.0, min(500.0, float(tail_trim_ms or 0)))
    pipeline = get_pipeline()
    chunks = []
    with _pipeline_lock:
        generated = list(pipeline(text, voice=voice, speed=speed))
        for index, (graphemes, _phonemes, audio) in enumerate(generated):
            arr = np.asarray(audio, dtype=np.float32)
            if not arr.size:
                continue
            chunks.append(arr)
            if index < len(generated) - 1 and pause_ms > 0:
                punctuation = bool(re.search(r"[.!?][\"'”’)]?\s*$", str(graphemes or "")))
                pause = pause_ms * (1.25 if punctuation else 0.65)
                chunks.append(np.zeros(int(24000 * pause / 1000.0), dtype=np.float32))
    if not chunks:
        raise RuntimeError("Kokoro returned no audio.")
    audio = np.concatenate(chunks)
    audio = trim_trailing_silence(audio, tail_trim_ms)
    audio = polish_audio(audio)
    duration = len(audio) / 24000.0
    buf = io.BytesIO()
    sf.write(buf, audio, 24000, format="WAV", subtype="PCM_16")
    buf.seek(0)
    return buf, duration

def download_map(filename: str) -> Path:
    if filename not in MAP_FILES.values():
        raise ValueError("Unknown historical map file.")
    target = MAP_CACHE / filename
    if target.exists() and target.stat().st_size > 1000:
        return target
    last = None
    for base in MAP_SOURCES:
        try:
            with urllib.request.urlopen(base + filename, timeout=45) as response:
                target.write_bytes(response.read())
            return target
        except Exception as exc:
            last = exc
    raise RuntimeError(f"Could not download {filename}: {last}")


@app.get("/server/")
def dashboard():
    return render_template(
        "dashboard.html",
        ip=local_ip(),
        port=PORT,
        default_voice=DEFAULT_VOICE,
        voices=BRITISH_VOICES,
    )


@app.get("/")
def home():
    root = editor_root()
    if (root / "index.html").exists():
        return redirect("/app/")
    return redirect("/server/")

@app.get("/app/")
def local_editor():
    root = editor_root()
    if not (root / "index.html").exists():
        return redirect("/server/")
    return send_from_directory(root, "index.html")


@app.get("/app/<path:path>")
def local_editor_assets(path: str):
    if not path.startswith(("assets/", "css/", "js/", "presets/", "maps/", "historical-maps/")):
        return "Not found", 404
    return send_from_directory(editor_root(), path)


@app.get("/api/health")
def health():
    llm_status = local_llm.status()
    return jsonify(
        ok=True,
        engine="Kokoro-82M",
        modelLoaded=_pipeline is not None,
        modelError=_model_error,
        defaultVoice=DEFAULT_VOICE,
        voices=BRITISH_VOICES,
        outputDir=str(OUTPUTS),
        offlineMaps=sum((MAP_CACHE / f).exists() for f in MAP_FILES.values()),
        offlineMapsTotal=len(MAP_FILES),
        offlinePhotos=len([p for p in PHOTO_CACHE.iterdir() if p.is_file() and p.name != "manifest.json"]),
        editorReady=(editor_root() / "index.html").exists(),
        editorLocalCopy=(LOCAL_EDITOR / "index.html").exists(),
        espeakAvailable=bool(shutil.which("espeak-ng") or shutil.which("espeak")),
        localEditor=f"http://{local_ip()}:{PORT}/app/",
        localLlm={"running": llm_status["running"], "port": llm_status["port"]},
    )


@app.get("/api/local-llm/status")
def local_llm_status():
    return jsonify(ok=True, **local_llm.status())


@app.post("/api/local-llm/folder/pick")
def local_llm_pick_folder():
    try:
        return jsonify(ok=True, **local_llm.pick_folder())
    except Exception as exc:
        return jsonify(ok=False, error=str(exc)), 400


@app.post("/api/local-llm/folder")
def local_llm_set_folder():
    try:
        return jsonify(ok=True, **local_llm.set_folder(str((request.get_json(silent=True) or {}).get("folder") or "")))
    except Exception as exc:
        return jsonify(ok=False, error=str(exc)), 400


@app.post("/api/local-llm/folder/open")
def local_llm_open_folder():
    try:
        local_llm.open_folder()
        return jsonify(ok=True)
    except Exception as exc:
        return jsonify(ok=False, error=str(exc)), 400


@app.post("/api/local-llm/runner")
def local_llm_runner():
    try:
        return jsonify(ok=True, **local_llm.set_runner(str((request.get_json(silent=True) or {}).get("runner") or "")))
    except Exception as exc:
        return jsonify(ok=False, error=str(exc)), 400


@app.post("/api/local-llm/download")
def local_llm_download():
    try:
        data = request.get_json(silent=True) or {}
        return jsonify(ok=True, download=local_llm.start_download(str(data.get("catalogId") or "")))
    except Exception as exc:
        return jsonify(ok=False, error=str(exc)), 400


@app.get("/api/local-llm/download/<job_id>")
def local_llm_download_status(job_id: str):
    try:
        return jsonify(ok=True, download=local_llm.download_status(job_id))
    except Exception as exc:
        return jsonify(ok=False, error=str(exc)), 404


@app.post("/api/local-llm/start")
def local_llm_start():
    try:
        data = request.get_json(silent=True) or {}
        return jsonify(ok=True, **local_llm.start(
            str(data.get("model") or ""), str(data.get("runner") or ""),
            data.get("port", 8081), data.get("context", 4096), data.get("gpuLayers", 0),
        ))
    except Exception as exc:
        return jsonify(ok=False, error=str(exc)), 400


@app.post("/api/local-llm/stop")
def local_llm_stop():
    return jsonify(ok=True, **local_llm.stop())


@app.post("/api/local-llm/chat")
def local_llm_chat():
    try:
        data = request.get_json(silent=True) or {}
        return jsonify(ok=True, **local_llm.chat(data.get("messages") or [], data.get("maxTokens", 550), data.get("temperature", 0.7)))
    except Exception as exc:
        return jsonify(ok=False, error=str(exc)), 503


@app.get("/api/voices")
def voices():
    return jsonify(engine="Kokoro-82M", default=DEFAULT_VOICE, voices=BRITISH_VOICES)


@app.post("/api/prepare")
def prepare():
    try:
        get_pipeline()
        return jsonify(ok=True, modelLoaded=True, message="Kokoro is loaded and cached.")
    except Exception as exc:
        return jsonify(ok=False, error=str(exc)), 500



@app.post("/api/prepare/editor")
def prepare_editor_api():
    try:
        root = prepare_editor()
        return jsonify(ok=True, editorReady=True, path=str(root))
    except Exception as exc:
        return jsonify(ok=False, error=str(exc)), 500

@app.post("/api/prepare/maps")
def prepare_maps():
    ready = []
    errors = []
    for year, filename in MAP_FILES.items():
        try:
            path = download_map(filename)
            ready.append({"year": year, "file": filename, "bytes": path.stat().st_size})
        except Exception as exc:
            errors.append({"year": year, "file": filename, "error": str(exc)})
    return jsonify(ok=not errors, ready=ready, errors=errors)


@app.get("/api/maps/<path:filename>")
def historical_map(filename: str):
    try:
        return send_file(download_map(filename), mimetype="application/geo+json", conditional=True)
    except Exception as exc:
        return jsonify(error=str(exc)), 404


@app.get("/api/history/photos/search")
def history_photo_search():
    query = clean_text(request.args.get("q", ""))[:180]
    if not query:
        return jsonify(error="Search query is empty."), 400
    try:
        return jsonify(ok=True, query=query, items=commons_search(query, int(request.args.get("limit", "8"))))
    except Exception as exc:
        return jsonify(error=str(exc)), 502


@app.get("/api/research")
def research():
    """Small, source-linked research helper for the local writing workflow.

    It uses Wikipedia's public search/summary service rather than silently
    scraping arbitrary pages.  The result stays reviewable before it is sent
    to a local model or turned into a Short.
    """
    query = clean_text(request.args.get("q", ""))[:180]
    if not query:
        return jsonify(error="Research query is empty."), 400
    try:
        params = {"action": "query", "format": "json", "list": "search", "srsearch": query, "srlimit": 5, "srprop": "snippet"}
        url = "https://en.wikipedia.org/w/api.php?" + urllib.parse.urlencode(params)
        req = urllib.request.Request(url, headers={"User-Agent": "MEP-Video-Maker/1.0 research helper"})
        with urllib.request.urlopen(req, timeout=25) as response:
            data = json.loads(response.read().decode("utf-8"))
        items = []
        for row in data.get("query", {}).get("search", []):
            title = str(row.get("title") or "")
            items.append({
                "title": title,
                "snippet": re.sub(r"<[^>]+>", "", str(row.get("snippet") or "")),
                "url": "https://en.wikipedia.org/wiki/" + urllib.parse.quote(title.replace(" ", "_")),
            })
        return jsonify(ok=True, query=query, source="Wikipedia search", items=items)
    except Exception as exc:
        return jsonify(error=f"Research request failed: {exc}"), 502


@app.get("/api/history/photos/proxy")
def history_photo_proxy():
    try:
        path = cached_photo(request.args.get("url", ""))
        return send_file(path, mimetype=mimetypes.guess_type(path.name)[0] or "image/jpeg", conditional=True)
    except Exception as exc:
        return jsonify(error=str(exc)), 400


@app.post("/api/prepare/photos")
def prepare_photos():
    ready, errors = [], []
    for query in PHOTO_PACK_QUERIES:
        try:
            found = commons_search(query, 4)
            if not found:
                raise RuntimeError("No license-safe image found")
            item = found[0]
            path = cached_photo(item["thumbUrl"])
            ready.append({"query": query, "title": item["title"], "license": item["license"], "url": item["thumbUrl"], "file": path.name})
        except Exception as exc:
            errors.append({"query": query, "error": str(exc)})
    manifest = {"schema": "mep-historical-photo-pack-v1", "createdAt": time.time(), "items": ready, "errors": errors}
    (PHOTO_CACHE / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return jsonify(ok=not errors, ready=ready, errors=errors)


@app.post("/api/tts")
def tts():
    data = request.get_json(silent=True) or {}
    text = str(data.get("text", "")).strip()
    voice = str(data.get("voice") or DEFAULT_VOICE)
    speed = data.get("speed", DEFAULT_SPEED)
    pause_ms = data.get("pauseMs", 70)
    tail_trim_ms = data.get("tailTrimMs", 100)
    title = str(data.get("title") or "MEP narration")
    short_id = str(data.get("shortId") or "")
    try:
        audio, duration = synthesize(text, voice, speed, pause_ms, tail_trim_ms)
        filename = safe_name(title) + ".wav"
        saved = OUTPUTS / filename
        saved.write_bytes(audio.getvalue())
        audio.seek(0)
        response = send_file(audio, mimetype="audio/wav", as_attachment=False, download_name=filename)
        response.headers["X-MEP-Duration"] = f"{duration:.3f}"
        response.headers["X-MEP-Voice"] = voice
        response.headers["X-MEP-Short-Id"] = short_id
        return response
    except Exception as exc:
        return jsonify(error=str(exc)), 500


@app.post("/api/tts/batch")
def tts_batch():
    data = request.get_json(silent=True) or {}
    items = data.get("shorts") or []
    if not isinstance(items, list) or not items:
        return jsonify(error="Expected a non-empty shorts array."), 400
    archive = io.BytesIO()
    manifest = {"schema": "mep-kokoro-batch-v1", "createdAt": time.time(), "engine": "Kokoro-82M", "items": []}
    try:
        with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as z:
            for index, item in enumerate(items, 1):
                text = str(item.get("narration") or item.get("text") or "").strip()
                if not text:
                    continue
                title = str(item.get("title") or f"short-{index}")
                voice = str(item.get("voice") or DEFAULT_VOICE)
                speed = float(item.get("speed") or DEFAULT_SPEED)
                pause_ms = float(item.get("pauseMs", 70))
                tail_trim_ms = float(item.get("tailTrimMs", 100))
                audio, duration = synthesize(text, voice, speed, pause_ms, tail_trim_ms)
                filename = f"{index:02d}-{safe_name(title)}.wav"
                z.writestr(filename, audio.getvalue())
                manifest["items"].append({"id": item.get("id"), "title": title, "file": filename, "voice": voice, "duration": duration})
            z.writestr("manifest.json", json.dumps(manifest, indent=2))
        archive.seek(0)
        return send_file(archive, mimetype="application/zip", as_attachment=True, download_name="mep-kokoro-voices.zip")
    except Exception as exc:
        return jsonify(error=str(exc)), 500


@app.get("/api/qr.png")
def qr_png():
    target = request.args.get("url") or f"http://{local_ip()}:{PORT}/app/"
    img = qrcode.make(target)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return send_file(buf, mimetype="image/png", as_attachment=request.args.get("download") == "1", download_name="mep-local-editor-qr.png")


@app.get("/api/outputs/<path:filename>")
def output_file(filename: str):
    return send_from_directory(OUTPUTS, filename, as_attachment=True)


def open_editor_tab():
    time.sleep(1.2)
    target = f"http://127.0.0.1:{PORT}/app/" if (editor_root() / "index.html").exists() else f"http://127.0.0.1:{PORT}/server/"
    webbrowser.open(target)


if __name__ == "__main__":
    print("=" * 68)
    print("MEP Video Maker - Local Kokoro Voice Server")
    print(f"Editor:       http://127.0.0.1:{PORT}/app/")
    print(f"Server setup: http://127.0.0.1:{PORT}/server/")
    print(f"Phone editor: http://{local_ip()}:{PORT}/app/")
    print("Keep this window open while using the local AI voice server.")
    print("=" * 68)
    threading.Thread(target=open_editor_tab, daemon=True).start()
    serve(app, host=HOST, port=PORT, threads=4)

