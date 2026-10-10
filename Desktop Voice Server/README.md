# MEP Offline Voice Server (Windows)
1. Install Python 3.11 **64-bit** (enable Add to PATH).
2. Double-click `setup_windows.bat` (internet required only for dependencies).
3. Double-click `download_voice.bat` to fetch British English Piper voice (one time).
4. Double-click `start_windows.bat`. A browser UI opens at http://127.0.0.1:8765.
5. Generate narration and **Download WAV**, then import into MEP Video Maker.
6. After setup and voice download, synthesis works **offline**. Do not expose port 8765 to the internet.
7. A QR code is shown, but localhost QR works only on the laptop. For phone LAN access set `MEP_HOST=0.0.0.0`, use the laptop's LAN IP in the QR URL, and restrict firewall access to your own LAN. Browser API calls from a public HTTPS site require a secure HTTPS endpoint.
8. API: POST /api/synthesize with JSON `{"text":"Hello","model":"en_GB-alan-medium","speed":1}` and header `Authorization: Bearer <token shown in terminal>`. Output: WAV. This is **not** a public cloud API.
9. For better-quality British male voices, use the separate Google Colab Kokoro notebook and import WAVs.
10. Never commit generated voice files, model weights, API tokens, or personal audio.

## Desktop editor
The Flask dashboard includes **Open the full MEP Video Maker editor locally** at `/editor/`. Download the **entire repository ZIP** (not just this folder) so the editor's `index.html`, `js/`, `css/` and `presets/` directories are available. Basic canvas editing and local browser saves work without internet; cloud sync, AI services and remote historical GeoJSON map fetches do not. The QR image can be downloaded as PNG. In default localhost mode the QR is only useful on the laptop.

## Website integration
Voice Studio → Neural AI Narration can POST to this Flask server when the API is reachable over an **authenticated HTTPS address**. Use the token shown in the Flask terminal. Do not store that token in GitHub or Firebase. The safer offline workflow is to generate and download WAV locally, then use **Import WAV** in the web editor.

## Known limitations
The browser app currently stores voiceover assets in its project data; long uncompressed WAV files can exceed browser storage limits and Firestore document limits. Keep a downloaded copy of each generated WAV and use a short test first. Large recordings need a future IndexedDB/audio-storage upgrade. Automatic alignment of audio length to scene timings is not implemented.
