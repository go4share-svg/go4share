"use strict";

// URL backendu Go4Share
const API_URL = "http://localhost:4000/api/auth";

// 🧩 Funkce pro zobrazení zpráv
function showMessage(msg, isError) {
  const el = document.getElementById("message");
  if (!el) return;
  el.textContent = msg;
  el.style.color = isError ? "red" : "limegreen";
}

// 🧩 Registrace nového uživatele
async function registerUser() {
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !email || !password) {
    showMessage("Vyplň prosím všechna pole.", true);
    return;
  }

  try {
    const res = await fetch(API_URL + "/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registrace selhala.");

    showMessage("✅ Registrace úspěšná! Nyní se přihlaš.", false);
  } catch (err) {
    showMessage("❌ " + err.message, true);
  }
}

// 🧩 Přihlášení uživatele
async function loginUser() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    showMessage("Vyplň přihlašovací údaje.", true);
    return;
  }

  try {
    const res = await fetch(API_URL + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Přihlášení selhalo.");

    showMessage("✅ Přihlášení úspěšné!", false);

    // ✅ Ulož token a přesměruj na feed
    if (data.token) {
      localStorage.setItem("token", data.token);
      window.location.href = "feed.html";
    }
  } catch (err) {
    showMessage("❌ " + err.message, true);
  }
}

// 🧩 Přiřazení tlačítek (spouští funkce po kliknutí)
window.addEventListener("DOMContentLoaded", function () {
  const regBtn = document.getElementById("registerBtn");
  const logBtn = document.getElementById("loginBtn");

  if (regBtn) regBtn.addEventListener("click", registerUser);
  if (logBtn) logBtn.addEventListener("click", loginUser);
});