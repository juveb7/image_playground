"use strict";

// ── DOM references ──────────────────────────────────────────────────────────
const dropZone    = document.getElementById("drop-zone");
const fileInput   = document.getElementById("file-input");
const resultSec   = document.getElementById("result-section");
const preview     = document.getElementById("preview");
const overlay     = document.getElementById("overlay");
const resultsList = document.getElementById("results-list");
const countBadge  = document.getElementById("detection-count");
const statusMsg   = document.getElementById("status-msg");

// Color palette — cycles if there are more detections than colors
const COLORS = [
  "#0071e3", "#34c759", "#ff9f0a", "#ff3b30",
  "#af52de", "#5ac8fa", "#ff6b35", "#1ac8db",
];

// ── Drag & drop ──────────────────────────────────────────────────────────────
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

// ── Click to browse ──────────────────────────────────────────────────────────
dropZone.addEventListener("click", () => fileInput.click());
dropZone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") fileInput.click();
});
fileInput.addEventListener("change", () => {
  if (fileInput.files[0]) handleFile(fileInput.files[0]);
});

// ── Core flow ─────────────────────────────────────────────────────────────────
async function handleFile(file) {
  if (!file.type.startsWith("image/")) {
    setStatus("Please upload an image file.", true);
    return;
  }

  // Show a local preview immediately — no waiting for the API
  const objectUrl = URL.createObjectURL(file);
  preview.src = objectUrl;
  preview.onload = () => URL.revokeObjectURL(objectUrl);

  clearResults();
  resultSec.removeAttribute("hidden");
  setStatus("Detecting objects…");

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/detect", { method: "POST", body: formData });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail ?? "Server error");
    }
    const data = await res.json();
    drawDetections(data);
    populateList(data.detections);
    setStatus(`Found ${data.detections.length} object(s).`);
  } catch (err) {
    setStatus(`Error: ${err.message}`, true);
  }
}

// ── Canvas drawing ────────────────────────────────────────────────────────────
function drawDetections({ detections, image_width, image_height }) {
  // Use requestAnimationFrame so the img element has its final rendered dimensions
  requestAnimationFrame(() => {
    const rect = preview.getBoundingClientRect();
    const displayW = rect.width;
    const displayH = rect.height;

    // Set canvas coordinate space to match the displayed image size
    overlay.width  = displayW;
    overlay.height = displayH;

    const ctx = overlay.getContext("2d");
    ctx.clearRect(0, 0, displayW, displayH);

    // Scale factors: original image pixels -> displayed pixels
    const scaleX = displayW / image_width;
    const scaleY = displayH / image_height;

    detections.forEach(({ label, confidence, bbox }, i) => {
      const color = COLORS[i % COLORS.length];
      const x = bbox.x * scaleX;
      const y = bbox.y * scaleY;
      const w = bbox.width  * scaleX;
      const h = bbox.height * scaleY;

      // Bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth   = 2.5;
      ctx.strokeRect(x, y, w, h);

      // Label chip
      const text   = `${label} ${Math.round(confidence * 100)}%`;
      ctx.font     = "bold 13px system-ui, sans-serif";
      const textW  = ctx.measureText(text).width;
      const padX   = 6;
      const padY   = 4;
      const chipH  = 20;

      // Keep the chip inside the canvas top edge
      const chipY = y > chipH + padY ? y - chipH - padY : y + padY;

      ctx.fillStyle = color;
      ctx.fillRect(x - 1, chipY, textW + padX * 2, chipH);

      ctx.fillStyle = "#fff";
      ctx.fillText(text, x + padX - 1, chipY + chipH - padY);
    });
  });
}

// ── Results list ──────────────────────────────────────────────────────────────
function populateList(detections) {
  countBadge.textContent = detections.length;
  detections.forEach(({ label, confidence }, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="det-label" style="color:${COLORS[i % COLORS.length]}">${label}</span>
      <span class="det-confidence">${Math.round(confidence * 100)}%</span>
    `;
    resultsList.appendChild(li);
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function clearResults() {
  resultsList.innerHTML = "";
  countBadge.textContent = "";
  const ctx = overlay.getContext("2d");
  ctx.clearRect(0, 0, overlay.width, overlay.height);
}

function setStatus(msg, isError = false) {
  statusMsg.textContent = msg;
  statusMsg.className   = isError ? "error" : "";
}
