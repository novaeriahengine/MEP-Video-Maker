# Google Colab Kokoro batch generation
1. Open [Google Colab](https://colab.research.google.com/) and sign into your Google account **there**.
2. Upload `Noveria_Kokoro_Batch.ipynb` (File → Upload notebook). You can optionally save a copy to your own Google Drive.
3. In MEP Video Maker click **Download Narration Batch JSON** and upload that file when prompted in the notebook.
4. Run cells top-to-bottom. Default Kokoro voice: British male `bm_george`, speed `0.95`.
5. Download `noveria-narrations.zip`; unzip, then import each WAV to the corresponding Short in the editor.
6. This notebook runs interactively, not as an always-on API. No Google OAuth credentials belong in this GitHub repository.
7. Free Colab may disconnect or have no GPU; generating 10 videos per batch is a reasonable experiment, not guaranteed performance.
8. Audio generation is a separate step; exported video needs the imported WAV to be selected as voice source.
