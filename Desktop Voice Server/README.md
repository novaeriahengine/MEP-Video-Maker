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
