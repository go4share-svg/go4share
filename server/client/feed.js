"use strict";

// URL backendu
const API_BASE = "http://localhost:5000";

// Pomocná funkce pro zobrazení chyb
function showError(msg) {
  console.error(msg);
  var box = document.getElementById("videoContainer");
  if (box) {
    box.textContent = msg;
  }
}

// Vykreslení jedné karty videa (bez šablonových stringů)
function renderVideoCard(container, video) {
  var card = document.createElement("div");
  card.className = "video-card";

  var vid = document.createElement("video");
  vid.setAttribute("controls", "");
  vid.setAttribute("preload", "metadata");
  vid.src = video.url || "";
  card.appendChild(vid);

  var h3 = document.createElement("h3");
  h3.textContent = video.title || "Untitled";
  card.appendChild(h3);

  var p = document.createElement("p");
  var views = typeof video.views === "number" ? video.views : 0;
  var tokens = typeof video.tokensEarned === "number" ? video.tokensEarned : 0;
  p.textContent = "👁️ " + views + " views • 🎁 " + tokens + " X-tokens";
  card.appendChild(p);

  container.appendChild(card);
}

// Načtení videí z backendu
async function loadVideos() {
  try {
    var res = await fetch(API_BASE + "/api/videos/list", { method: "GET" });
    if (!res.ok) {
      throw new Error("HTTP " + res.status + " " + res.statusText);
    }

    var videos = await res.json();
    if (!Array.isArray(videos)) {
      throw new Error("Server vrátil neočekávaný formát (čekám pole).");
    }

    var container = document.getElementById("videoContainer");
    if (!container) {
      console.warn("#videoContainer nebyl nalezen v HTML.");
      return;
    }

    container.innerHTML = "";
    if (videos.length === 0) {
      container.textContent = "Žádná videa zatím nejsou k dispozici.";
      return;
    }

    for (var i = 0; i < videos.length; i++) {
      renderVideoCard(container, videos[i]);
    }
  } catch (err) {
    showError("Nepodařilo se načíst videa: " + err.message);
  }
}

// Spusť po načtení DOMu
window.addEventListener("DOMContentLoaded", function () {
  loadVideos();
});