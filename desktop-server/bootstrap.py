from __future__ import annotations
import os
import subprocess
import sys
import venv
from pathlib import Path

BASE = Path(__file__).resolve().parent
# Kept separate from any older .venv left by an interrupted install.  The
# launcher owns this directory and can reliably resume its own setup.
VENV = BASE / "runtime"
REQ = BASE / "requirements.txt"
MIN_PYTHON = (3, 10)
MAX_PYTHON = (3, 13)

def venv_python() -> Path:
    if os.name == "nt":
        return VENV / "Scripts" / "python.exe"
    return VENV / "bin" / "python"

def supported_python() -> bool:
    return MIN_PYTHON <= sys.version_info[:2] < MAX_PYTHON


def main():
    if not supported_python():
        minimum = ".".join(map(str, MIN_PYTHON))
        maximum = ".".join(map(str, (MAX_PYTHON[0], MAX_PYTHON[1] - 1)))
        print(f"MEP Local Voice Server requires Python {minimum} through {maximum} (64-bit).")
        print(f"This launcher is using Python {sys.version.split()[0]}.")
        print("Install a supported Python version, then run START_WINDOWS.bat again.")
        return 2
    py = venv_python()
    if not py.exists():
        print("Creating MEP local Python environment...")
        venv.EnvBuilder(with_pip=True).create(VENV)
    marker = VENV / ".mep_requirements_ready"
    if not marker.exists() or REQ.stat().st_mtime > marker.stat().st_mtime:
        print("Installing/updating Python packages. First setup can take a while...")
        subprocess.check_call([str(py), "-m", "pip", "install", "--upgrade", "pip"])
        subprocess.check_call([str(py), "-m", "pip", "install", "-r", str(REQ)])
        marker.touch()
    print("Starting MEP Local Voice Server...")
    os.execv(str(py), [str(py), str(BASE / "server.py")])

if __name__ == "__main__":
    raise SystemExit(main())

