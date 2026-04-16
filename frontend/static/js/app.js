"use strict";

// ── DOM references ──────────────────────────────────────────────────────────
const dropZone     = document.getElementById("drop-zone");
const fileInput    = document.getElementById("file-input");
const resultSec    = document.getElementById("result-section");
const preview      = document.getElementById("preview");
const overlay      = document.getElementById("overlay");
const resultsList  = document.getElementById("results-list");
const countBadge   = document.getElementById("detection-count");
const statusMsg    = document.getElementById("status-msg");
const resultsLabel = document.getElementById("results-label");
const tabs         = document.querySelectorAll(".tab");
const clearBtn     = document.getElementById("clear-btn");

// ── Persisted file ───────────────────────────────────────────────────────────
let currentFile = null;

// Color palette — cycles if there are more results than colors
const COLORS = [
  "#0071e3", "#34c759", "#ff9f0a", "#ff3b30",
  "#af52de", "#5ac8fa", "#ff6b35", "#1ac8db",
];

// ── Feature selection ────────────────────────────────────────────────────────
let currentFeature = "detection";

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    currentFeature = tab.dataset.feature;
    if (currentFile) {
      handleFile(currentFile);
    } else {
      clearResults();
      resultSec.setAttribute("hidden", "");
      setStatus("");
    }
  });
});

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

// ── Clear button ─────────────────────────────────────────────────────────────
clearBtn.addEventListener("click", () => {
  currentFile = null;
  preview.src = "";
  clearResults();
  resultSec.setAttribute("hidden", "");
  fileInput.value = "";
  setStatus("");
});

// ── Core flow ─────────────────────────────────────────────────────────────────
async function handleFile(file) {
  if (!file.type.startsWith("image/")) {
    setStatus("Please upload an image file.", true);
    return;
  }

  if (file !== currentFile) {
    currentFile = file;
    const objectUrl = URL.createObjectURL(file);
    preview.src = objectUrl;
    preview.onload = () => URL.revokeObjectURL(objectUrl);
  }

  clearResults();
  resultSec.removeAttribute("hidden");

  if (currentFeature === "detection") {
    resultsLabel.textContent = "Detections";
    setStatus("Detecting objects…");
    await runDetection(file);
  } else {
    resultsLabel.textContent = "Segments";
    setStatus("Segmenting image…");
    await runSegmentation(file);
  }
}

async function runDetection(file) {
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

async function runSegmentation(file) {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await fetch("/api/segment", { method: "POST", body: formData });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail ?? "Server error");
    }
    const data = await res.json();
    drawSegments(data);
    populateList(data.segments);
    setStatus(`Found ${data.segments.length} segment(s).`);
  } catch (err) {
    setStatus(`Error: ${err.message}`, true);
  }
}

// ── Canvas drawing — detections ───────────────────────────────────────────────
function drawDetections({ detections, image_width, image_height }) {
  requestAnimationFrame(() => {
    const rect = preview.getBoundingClientRect();
    const displayW = rect.width;
    const displayH = rect.height;

    overlay.width  = displayW;
    overlay.height = displayH;

    const ctx = overlay.getContext("2d");
    ctx.clearRect(0, 0, displayW, displayH);

    const scaleX = displayW / image_width;
    const scaleY = displayH / image_height;

    detections.forEach(({ label, confidence, bbox }, i) => {
      const color = COLORS[i % COLORS.length];
      const x = bbox.x * scaleX;
      const y = bbox.y * scaleY;
      const w = bbox.width  * scaleX;
      const h = bbox.height * scaleY;

      ctx.strokeStyle = color;
      ctx.lineWidth   = 2.5;
      ctx.strokeRect(x, y, w, h);

      drawLabelChip(ctx, color, label, confidence, x, y);
    });
  });
}

// ── Canvas drawing — segmentation ─────────────────────────────────────────────
function drawSegments({ segments, image_width, image_height }) {
  requestAnimationFrame(() => {
    const rect = preview.getBoundingClientRect();
    const displayW = rect.width;
    const displayH = rect.height;

    overlay.width  = displayW;
    overlay.height = displayH;

    const ctx = overlay.getContext("2d");
    ctx.clearRect(0, 0, displayW, displayH);

    const scaleX = displayW / image_width;
    const scaleY = displayH / image_height;

    segments.forEach(({ label, confidence, bbox, mask }, i) => {
      const color = COLORS[i % COLORS.length];

      if (mask && mask.length > 0) {
        ctx.beginPath();
        ctx.moveTo(mask[0][0] * scaleX, mask[0][1] * scaleY);
        for (let j = 1; j < mask.length; j++) {
          ctx.lineTo(mask[j][0] * scaleX, mask[j][1] * scaleY);
        }
        ctx.closePath();
        ctx.fillStyle   = color + "44"; // ~27% opacity fill
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth   = 2;
        ctx.stroke();
      }

      const x = bbox.x * scaleX;
      const y = bbox.y * scaleY;
      drawLabelChip(ctx, color, label, confidence, x, y);
    });
  });
}

// ── Shared label chip ─────────────────────────────────────────────────────────
function drawLabelChip(ctx, color, label, confidence, x, y) {
  const text  = `${label} ${Math.round(confidence * 100)}%`;
  ctx.font    = "bold 13px system-ui, sans-serif";
  const textW = ctx.measureText(text).width;
  const padX  = 6;
  const padY  = 4;
  const chipH = 20;
  const chipY = y > chipH + padY ? y - chipH - padY : y + padY;

  ctx.fillStyle = color;
  ctx.fillRect(x - 1, chipY, textW + padX * 2, chipH);
  ctx.fillStyle = "#fff";
  ctx.fillText(text, x + padX - 1, chipY + chipH - padY);
}

// ── Results list ──────────────────────────────────────────────────────────────
function populateList(items) {
  countBadge.textContent = items.length;
  items.forEach(({ label, confidence }, i) => {
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
  resultsList.innerHTML  = "";
  countBadge.textContent = "";
  const ctx = overlay.getContext("2d");
  ctx.clearRect(0, 0, overlay.width, overlay.height);
}

function setStatus(msg, isError = false) {
  statusMsg.textContent = msg;
  statusMsg.className   = isError ? "error" : "";
}
