from __future__ import annotations

import os
from pathlib import Path

import uvicorn


if __name__ == "__main__":
    project_root = Path(__file__).resolve().parent.parent.parent
    candidate_ffmpeg_paths = [
        project_root / "web" / "resources" / "ffmpeg" / "ffmpeg.exe",
        project_root / "resources" / "ffmpeg" / "ffmpeg.exe",
    ]
    if not os.getenv("FFMPEG_PATH"):
        for local_ffmpeg in candidate_ffmpeg_paths:
            if local_ffmpeg.exists():
                os.environ["FFMPEG_PATH"] = str(local_ffmpeg)
                break

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="127.0.0.1", port=port, log_level="info")
