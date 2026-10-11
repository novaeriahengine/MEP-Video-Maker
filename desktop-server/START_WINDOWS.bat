@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  py -3.12 -c "import sys" >nul 2>nul && py -3.12 bootstrap.py && goto :done
  py -3.11 -c "import sys" >nul 2>nul && py -3.11 bootstrap.py && goto :done
  py -3.10 -c "import sys" >nul 2>nul && py -3.10 bootstrap.py && goto :done
)
set "MEP_CODEX_PY=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
if exist "%MEP_CODEX_PY%" "%MEP_CODEX_PY%" bootstrap.py && goto :done
echo.
echo MEP needs Python 3.10, 3.11, or 3.12. Python 3.9 is too old for Kokoro.
echo Install Python 3.12 from https://www.python.org/downloads/ then run this file again.
echo.
:done
pause

