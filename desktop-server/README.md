# MEP Video Maker — Local Kokoro Voice Server

This folder turns the downloaded repository into a local/offline MEP Video Maker plus a Kokoro-82M narration server.

## What you get

- Local MEP editor at `http://127.0.0.1:7860/app/`
- Phone/LAN editor at `http://YOUR-LAPTOP-IP:7860/app/`
- British Kokoro voices: George, Daniel, Fable, Lewis
- WAV narration generation
- A local dashboard with model status, a TTS tester, and a downloadable QR code
- Historical-map caching for the years used by the 10 ready Shorts
- Batch TTS endpoint at `POST /api/tts/batch`

## Windows quick start

1. Install Python 3.10 or 3.11.
2. Install **eSpeak-NG for Windows** once. Kokoro's English G2P layer uses it.
3. Download/clone the full MEP Video Maker repository.
4. Open this `desktop-server` folder.
5. Double-click `START_WINDOWS.bat`.
6. Python starts the server and opens **MEP Video Maker itself** in your default browser. No API URL or token is required when you use this local tab.
7. Server setup/status is available at `http://127.0.0.1:7860/server/`.
8. Click **Cache Offline Editor** once while online. If you downloaded the full repository it copies the editor locally; if you downloaded only this folder it downloads the current editor files into `desktop-server/editor/`.
9. Click **Download / Load Kokoro** once while online.
10. Click **Download Map Pack** once while online.
11. Click **Download Historical Photos** if you want a starter cache of license-safe historical images.
12. Use the browser tab Python opened, or scan the QR code from your phone.

The first setup downloads Python packages and model files, so it can take a while. Later starts reuse `.venv/` and `cache/`.

## Offline use

After the editor, Kokoro, and map pack are cached, the local server, editor, generated WAV files, and historical maps are local. Do not delete:

- `desktop-server/.venv/`
- `desktop-server/cache/`
- `desktop-server/editor/`

Kokoro may need internet again only if a missing model/voice file was never cached.

## Phone access

The phone and laptop should be on the same Wi-Fi. The setup page shows a LAN URL and a QR code. When MEP is opened from this Python server, the Kokoro API connects automatically. If Windows Firewall asks whether Python may accept private-network connections, allow **Private networks**.

## API

### Health

`GET /api/health`

### Voices

`GET /api/voices`

### Generate one WAV

`POST /api/tts`

Example JSON:

```json
{
  "text": "The Western Front became a line of trenches.",
  "voice": "bm_george",
  "speed": 1.0,
  "title": "western-front",
  "shortId": "example-id"
}
```

### Generate a ZIP batch

`POST /api/tts/batch`

Use the same narration-batch structure exported by MEP Video Maker.

## Important browser note

The public GitHub Pages site is HTTPS. Browsers commonly block an HTTPS page from calling a plain HTTP laptop server. That is why this server hosts a **local copy of the editor at /app/**. Scan the QR or open the local editor when using your laptop backend.

## Security

This is intended for your private LAN. Do not port-forward 7860 or expose it directly to the public internet.

## Historical photos

The local editor has a **Historical Photos** tool inside MEP Tools. It searches Wikimedia Commons through the Python server, filters results to Public Domain / Creative Commons licenses, caches the selected image locally, and applies it to the current scene. The active background shows the stored license label.
