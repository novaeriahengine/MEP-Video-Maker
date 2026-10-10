from __future__ import annotations
import os
import subprocess
import sys
import venv
from pathlib import Path

BASE = Path(__file__).resolve().parent
VENV = BASE / ".venv"
REQ = BASE / "requirements.txt"

def venv_python() -> Path:
    if os.name == "nt":
        return VENV / "Scripts" / "python.exe"
    return VENV / "bin" / "python"

def main():
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
    main()
