from __future__ import annotations

import os
from pathlib import Path

import uvicorn


if __name__ == "__main__":
    project_root = Path(__file__).resolve().parent.parent.parent
    local_ffmpeg = project_root / "desktop" / "resources" / "ffmpeg" / "ffmpeg.exe"
    if local_ffmpeg.exists() and not os.getenv("FFMPEG_PATH"):
        os.environ["FFMPEG_PATH"] = str(local_ffmpeg)

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="127.0.0.1", port=port, log_level="info")
