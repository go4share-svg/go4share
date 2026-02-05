// @ts-nocheck

// Pomocné funkce pro práci s localStorage
function getUserEmail() {
  return localStorage.getItem("loggedUser") || "you@example.com";
}
function getUserKey() {
  return "user_" + getUserEmail();
}
function readUser() {
  try { return JSON.parse(localStorage.getItem(getUserKey())) || {}; }
  catch (_) { return {}; }
}
function writeUser(data) {
  localStorage.setItem(getUserKey(), JSON.stringify(data));
}

function updateDisplay() {
  const user = readUser();
  const demoFeed = JSON.parse(localStorage.getItem("demoFeed") || "[]");

  // výdělky jako autor (z demo feedu)
  let creatorEarnings = 0;
  const me = getUserEmail();
  for (const v of demoFeed) {
    if (v.username === me) {
      creatorEarnings += Number(v.tokensEarned || 0);
    }
  }

  const tok = Number(user.tokens || 0);
  const balSpan = document.getElementById("tokenBalance");
  const earnSpan = document.getElementById("earnings");
  if (balSpan) balSpan.textContent = tok.toFixed(2);
  if (earnSpan) earnSpan.textContent = creatorEarnings.toFixed(2);
}

function buyTokens() {
  const sel = document.getElementById("buyAmount");
  const amount = parseFloat(sel ? sel.value : "0");
  if (isNaN(amount) || amount <= 0) {
    alert("Select a valid amount.");
    return;
  }
  const user = readUser();
  user.tokens = Number(user.tokens || 0) + amount;
  writeUser(user);

  alert("Purchased ${amount} X tokens!");
  updateDisplay();
}

function requestPayout() {
  const msg = document.getElementById("payoutStatus");
  const user = readUser();
  const tokens = Number(user.tokens || 0);

  if (tokens < 50) {
    if (msg) msg.textContent = "You need at least 50 X tokens to withdraw.";
    return;
  }

  const amountCZK = tokens * 10; // 1 X = 10 Kč (demo pravidlo)
  user.tokens = 0;
  writeUser(user);

  if (msg) msg.textContent = "Payout requested – ${amountCZK} Kč will be sent.";
  updateDisplay();
}

function goBack() {
  window.location.href = "feed.html";
}

window.onload = updateDisplay;