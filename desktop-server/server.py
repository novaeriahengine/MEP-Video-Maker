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
    1783: "world_1783.geojson",
    1800: "world_1800.geojson",
    1815: "world_1815.geojson",
    1914: "world_1914.geojson",
    1920: "world_1920.geojson",
    1938: "world_1938.geojson",
    1945: "world_1945.geojson",
    1960: "world_1960.geojson",
    1994: "world_1994.geojson",
}
MAP_SOURCES = [
    "https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/",
    "https://cdn.jsdelivr.net/gh/aourednik/historical-basemaps@master/geojson/",
]

app = Flask(__name__, template_folder=str(BASE / "templates"), static_folder=str(BASE / "static"))

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
        for folder in ("css", "js", "presets"):
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
        wanted = ("index.html", "css/", "js/", "presets/")
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


def synthesize(text: str, voice: str = DEFAULT_VOICE, speed: float = DEFAULT_SPEED):
    text = (text or "").strip()
    if not text:
        raise ValueError("Text is empty.")
    voice_ids = {v["id"] for v in BRITISH_VOICES}
    if voice not in voice_ids:
        voice = DEFAULT_VOICE
    speed = max(0.6, min(1.4, float(speed or DEFAULT_SPEED)))
    pipeline = get_pipeline()
    chunks = []
    with _pipeline_lock:
        for _graphemes, _phonemes, audio in pipeline(text, voice=voice, speed=speed):
            chunks.append(np.asarray(audio, dtype=np.float32))
    if not chunks:
        raise RuntimeError("Kokoro returned no audio.")
    audio = np.concatenate(chunks)
    duration = len(audio) / 24000.0
    buf = io.BytesIO()
    sf.write(buf, audio, 24000, format="WAV", subtype="PCM_16")
    buf.seek(0)
    return buf, duration


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
    if peak:
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
        items.append({
            "title": title,
            "thumbUrl": thumb,
            "originalUrl": info.get("url") or thumb,
            "descriptionUrl": info.get("descriptionurl") or "",
            "license": license_name or "License listed on Wikimedia Commons",
            "artist": re.sub(r"<[^>]+>", "", str((meta.get("Artist") or {}).get("value") or ""))[:180],
            "credit": re.sub(r"<[^>]+>", "", str((meta.get("Credit") or {}).get("value") or ""))[:180],
            "description": re.sub(r"<[^>]+>", "", str((meta.get("ImageDescription") or {}).get("value") or ""))[:500],
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


@app.get("/")
def dashboard():
    return render_template(
        "dashboard.html",
        ip=local_ip(),
        port=PORT,
        default_voice=DEFAULT_VOICE,
        voices=BRITISH_VOICES,
    )


@app.get("/app/")
def local_editor():
    root = editor_root()
    if not (root / "index.html").exists():
        return redirect("/")
    return send_from_directory(root, "index.html")


@app.get("/app/<path:path>")
def local_editor_assets(path: str):
    if not path.startswith(("css/", "js/", "presets/")):
        return "Not found", 404
    return send_from_directory(editor_root(), path)


@app.get("/api/health")
def health():
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
        editorReady=(editor_root() / "index.html").exists(),
        editorLocalCopy=(LOCAL_EDITOR / "index.html").exists(),
        espeakAvailable=bool(shutil.which("espeak-ng") or shutil.which("espeak")),
        localEditor=f"http://{local_ip()}:{PORT}/app/",
    )


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


@app.post("/api/tts")
def tts():
    data = request.get_json(silent=True) or {}
    text = str(data.get("text", "")).strip()
    voice = str(data.get("voice") or DEFAULT_VOICE)
    speed = data.get("speed", DEFAULT_SPEED)
    title = str(data.get("title") or "MEP narration")
    short_id = str(data.get("shortId") or "")
    try:
        audio, duration = synthesize(text, voice, speed)
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
                audio, duration = synthesize(text, voice, speed)
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


def open_dashboard():
    time.sleep(1.2)
    webbrowser.open(f"http://127.0.0.1:{PORT}/")


if __name__ == "__main__":
    print("=" * 68)
    print("MEP Video Maker - Local Kokoro Voice Server")
    print(f"Dashboard:    http://127.0.0.1:{PORT}/")
    print(f"Phone editor: http://{local_ip()}:{PORT}/app/")
    print("Keep this window open while using the local AI voice server.")
    print("=" * 68)
    threading.Thread(target=open_dashboard, daemon=True).start()
    serve(app, host=HOST, port=PORT, threads=4)
