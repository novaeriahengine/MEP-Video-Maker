@echo off
cd /d "%~dp0"
py -3 -m venv .venv
if errorlevel 1 (echo Install Python 3.11 64-bit first.& pause& exit /b 1)
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
pause
