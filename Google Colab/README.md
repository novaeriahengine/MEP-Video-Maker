# Google Colab — MEP Kokoro Final Narration

Use this folder when Chrome TTS is good enough for editing, but you want Kokoro-82M for the final narration.

## Recommended workflow

1. In MEP Video Maker, use Chrome voice while editing.
2. When the Shorts are ready, click **Download Colab Narration Batch**.
3. Open `Noveria_Kokoro_Batch.ipynb` in Google Colab.
4. Run the setup cell.
5. Upload the narration batch JSON from MEP.
6. Generate with a British male Kokoro voice such as `bm_george`.
7. Download `mep_voice_pack.json`.
8. Back in MEP Video Maker, use **Import Colab Voice Pack**.
9. The generated WAV narration is attached to the matching Shorts and used for final export.

The notebook also creates `mep_voice_wavs.zip` if you want the individual WAV files.

## Google account / Google Drive

You do **not** give MEP Video Maker your Google password.

Colab runs under your Google account. The notebook includes an optional Google Drive mount:

```python
from google.colab import drive
drive.mount('/content/drive')
```

Google shows its own authorization screen. If enabled, the notebook saves results under:

`MyDrive/MEP-Video-Maker/voices/`

That is the simplest Google-account sync for this workflow. No Google OAuth secret belongs in this public repository.

## Free Colab limitation

Free Colab is useful for interactive batch generation, but it is not a dependable always-on API. Google says free managed runtimes prioritize notebook interaction, resource limits fluctuate, runtimes time out, and using a separate web UI as the primary way to control a free runtime may be terminated.

For that reason:

- **Colab = interactive batch generator**
- **Laptop Flask server = direct API**

## British male voices

- `bm_george` — classic British male
- `bm_daniel` — polished British male
- `bm_fable` — storytelling British male
- `bm_lewis` — modern British male

The notebook uses `KPipeline(lang_code='b')` for British English.

## First Colab setup

The notebook installs Kokoro and soundfile and installs `espeak-ng` in the Colab VM. The model is already trained; this is inference only.
