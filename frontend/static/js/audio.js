"use strict";

// ── DOM references ────────────────────────────────────────────────────────────
const dropZone      = document.getElementById("drop-zone");
const fileInput     = document.getElementById("file-input");
const resultSec     = document.getElementById("result-section");
const statusMsg     = document.getElementById("status-msg");
const clearBtn      = document.getElementById("clear-btn");

const audioEl       = document.getElementById("audio-el");
const playBtn       = document.getElementById("play-btn");
const iconPlay      = document.getElementById("icon-play");
const iconPause     = document.getElementById("icon-pause");
const progressTrack = document.getElementById("progress-track");
const progressFill  = document.getElementById("progress-fill");
const progressThumb = document.getElementById("progress-thumb");
const timeDisplay   = document.getElementById("time-display");
const fileNameEl    = document.getElementById("file-name");

const langBadge     = document.getElementById("lang-badge");
const transcriptText = document.getElementById("transcript-text");
const segmentsList  = document.getElementById("segments-list");

let currentObjectUrl = null;

// ── Drop zone ─────────────────────────────────────────────────────────────────
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("drag-over");
});
["dragleave", "dragend"].forEach((ev) =>
  dropZone.addEventListener(ev, () => dropZone.classList.remove("drag-over"))
);
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("drag-over");
  const file = e.dataTransfer?.files[0];
  if (file) handleFile(file);
});
dropZone.addEventListener("click", () => fileInput.click());
dropZone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") fileInput.click();
});
fileInput.addEventListener("change", () => {
  if (fileInput.files[0]) handleFile(fileInput.files[0]);
});

// ── Clear ─────────────────────────────────────────────────────────────────────
clearBtn.addEventListener("click", () => {
  audioEl.pause();
  audioEl.src = "";
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
  fileInput.value = "";
  resultSec.setAttribute("hidden", "");
  resetPlayer();
  clearTranscript();
  setStatus("");
});

// ── Play / Pause ──────────────────────────────────────────────────────────────
playBtn.addEventListener("click", () => {
  if (audioEl.paused) {
    audioEl.play();
  } else {
    audioEl.pause();
  }
});

// Spacebar toggles play/pause when focused anywhere on the page
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && e.target === document.body) {
    e.preventDefault();
    if (!audioEl.src) return;
    audioEl.paused ? audioEl.play() : audioEl.pause();
  }
});

audioEl.addEventListener("play", () => {
  iconPlay.setAttribute("hidden", "");
  iconPause.removeAttribute("hidden");
});
audioEl.addEventListener("pause", () => {
  iconPause.setAttribute("hidden", "");
  iconPlay.removeAttribute("hidden");
});
audioEl.addEventListener("ended", () => {
  iconPause.setAttribute("hidden", "");
  iconPlay.removeAttribute("hidden");
});

// ── Progress bar ──────────────────────────────────────────────────────────────
audioEl.addEventListener("timeupdate", updateProgress);
audioEl.addEventListener("loadedmetadata", updateProgress);

function updateProgress() {
  if (!audioEl.duration) return;
  const pct = (audioEl.currentTime / audioEl.duration) * 100;
  progressFill.style.width = pct + "%";
  progressThumb.style.left = pct + "%";
  timeDisplay.textContent =
    `${formatTime(audioEl.currentTime)} / ${formatTime(audioEl.duration)}`;
  highlightActiveSegment(audioEl.currentTime);
}

function seekTo(e) {
  if (!audioEl.duration) return;
  const rect = progressTrack.getBoundingClientRect();
  const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  audioEl.currentTime = pct * audioEl.duration;
}

progressTrack.addEventListener("click", seekTo);

// Drag seeking
let dragging = false;
progressTrack.addEventListener("mousedown", (e) => {
  dragging = true;
  seekTo(e);
});
document.addEventListener("mousemove", (e) => { if (dragging) seekTo(e); });
document.addEventListener("mouseup",   ()  => { dragging = false; });

// Keyboard seeking on the progress track (left/right arrows)
progressTrack.addEventListener("keydown", (e) => {
  if (!audioEl.duration) return;
  if (e.key === "ArrowRight") audioEl.currentTime = Math.min(audioEl.duration, audioEl.currentTime + 5);
  if (e.key === "ArrowLeft")  audioEl.currentTime = Math.max(0, audioEl.currentTime - 5);
});

// ── Segment highlighting ──────────────────────────────────────────────────────
function highlightActiveSegment(currentTime) {
  const items = segmentsList.querySelectorAll("li");
  items.forEach((li) => {
    const start = parseFloat(li.dataset.start);
    const end   = parseFloat(li.dataset.end);
    li.classList.toggle("active", currentTime >= start && currentTime < end);
  });
}

// ── Core flow ─────────────────────────────────────────────────────────────────
async function handleFile(file) {
  if (!file.type.startsWith("audio/") && file.type !== "video/webm") {
    setStatus("Please upload an audio file (MP3, WAV, M4A, OGG, FLAC).", true);
    return;
  }

  // Set up player immediately so user can listen while waiting for transcript
  if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
  currentObjectUrl = URL.createObjectURL(file);
  audioEl.src = currentObjectUrl;
  fileNameEl.textContent = file.name;

  clearTranscript();
  resetPlayer();
  resultSec.removeAttribute("hidden");
  setStatus("Transcribing… this may take a moment on first run while the model loads.");

  await runTranscription(file);
}

async function runTranscription(file) {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await fetch("/api/transcribe", { method: "POST", body: formData });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail ?? "Server error");
    }
    const data = await res.json();
    displayTranscript(data);
    setStatus("");
  } catch (err) {
    setStatus(`Error: ${err.message}`, true);
  }
}

// ── Transcript rendering ──────────────────────────────────────────────────────
function displayTranscript(data) {
  langBadge.textContent = data.language ? data.language.toUpperCase() : "";
  transcriptText.textContent = data.text || "No speech detected.";

  segmentsList.innerHTML = "";
  data.segments.forEach((seg) => {
    const li = document.createElement("li");
    li.dataset.start = seg.start;
    li.dataset.end   = seg.end;
    li.innerHTML = `
      <span class="seg-time">${formatTime(seg.start)}</span>
      <span class="seg-text">${escapeHtml(seg.text)}</span>
    `;
    li.addEventListener("click", () => {
      audioEl.currentTime = seg.start;
      if (audioEl.paused) audioEl.play();
    });
    segmentsList.appendChild(li);
  });
}

function clearTranscript() {
  langBadge.textContent    = "";
  transcriptText.textContent = "";
  segmentsList.innerHTML   = "";
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function resetPlayer() {
  progressFill.style.width = "0%";
  progressThumb.style.left = "0%";
  timeDisplay.textContent  = "0:00 / 0:00";
  iconPause.setAttribute("hidden", "");
  iconPlay.removeAttribute("hidden");
}

function formatTime(seconds) {
  if (!isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function setStatus(msg, isError = false) {
  statusMsg.textContent = msg;
  statusMsg.className   = isError ? "error" : "";
}
