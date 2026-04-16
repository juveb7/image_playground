from __future__ import annotations

import os
import tempfile

import whisper

_model = whisper.load_model("tiny")


def transcribe(audio_bytes: bytes, filename: str = "audio") -> dict:
    """
    Transcribe audio bytes using Whisper tiny.

    Parameters
    ----------
    audio_bytes : bytes
        Raw audio file contents.
    filename : str
        Original filename, used to preserve the file extension so ffmpeg
        can detect the format correctly.

    Returns
    -------
    dict with keys:
        text      : str   — full transcript
        language  : str   — detected language code, e.g. "en"
        segments  : list[dict] — each has "start" (float), "end" (float), "text" (str)
    """
    suffix = os.path.splitext(filename)[1] or ".mp3"

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        result = _model.transcribe(tmp_path)
    finally:
        os.unlink(tmp_path)

    return {
        "text": result["text"].strip(),
        "language": result["language"],
        "segments": [
            {
                "start": round(seg["start"], 2),
                "end": round(seg["end"], 2),
                "text": seg["text"].strip(),
            }
            for seg in result["segments"]
        ],
    }
