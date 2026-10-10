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
6. Your browser opens the local dashboard.
7. Click **Cache Offline Editor** once while online. If you downloaded the full repository it copies the editor locally; if you downloaded only this folder it downloads the current editor files into `desktop-server/editor/`.
8. Click **Download / Load Kokoro** once while online.
9. Click **Download Map Pack** once while online.
10. Use **Open MEP Video Maker** or scan the QR code from your phone.

The first setup downloads Python packages and model files, so it can take a while. Later starts reuse `.venv/` and `cache/`.

## Offline use

After the editor, Kokoro, and map pack are cached, the local server, editor, generated WAV files, and historical maps are local. Do not delete:

- `desktop-server/.venv/`
- `desktop-server/cache/`
- `desktop-server/editor/`

Kokoro may need internet again only if a missing model/voice file was never cached.

## Phone access

The phone and laptop should be on the same Wi-Fi. The dashboard shows a LAN URL and a QR code. If Windows Firewall asks whether Python may accept private-network connections, allow **Private networks**.

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
