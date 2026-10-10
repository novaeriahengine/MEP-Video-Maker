@echo off
cd /d "%~dp0"
call .venv\Scripts\activate.bat
if not exist models mkdir models
python -m piper.download_voices --data-dir models en_GB-alan-medium
pause
