@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  py -3.12 -c "import sys" >nul 2>nul && py -3.12 bootstrap.py && goto :done
  py -3.11 -c "import sys" >nul 2>nul && py -3.11 bootstrap.py && goto :done
  py -3.10 -c "import sys" >nul 2>nul && py -3.10 bootstrap.py && goto :done
  py -3 bootstrap.py
) else (
  python bootstrap.py
)
:done
pause
