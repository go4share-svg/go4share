// admin.js — Go4Share Admin (clean, no errors)

// ---------- Helpers ----------
function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getFeed() {
  try {
    return JSON.parse(localStorage.getItem("demoFeed") || "[]");
  } catch (_) {
    return [];
  }
}

function setFeed(arr) {
  localStorage.setItem("demoFeed", JSON.stringify(arr || []));
}

function goFeed() {
  window.location.href = "feed.html";
}

// každých 10 views = 0.5 X
function earningsForViews(views) {
  var v = Number(views || 0);
  return Math.floor(v / 10) * 0.5;
}

// ---------- Seed / Clear ----------
function seedDemo() {
  var arr = [];
  for (var i = 1; i <= 50; i++) {
    arr.push({
      username: "demo_user_" + String(i).padStart(2, "0"),
      video: "demo_video.mp4", // uprav na URL, pokud chceš
      caption: "Funny demo clip #" + i,
      views: Math.floor(Math.random() * 400),
      tokensEarned: 0
    });
  }
  // přepočet odměn pro jistotu
  for (var j = 0; j < arr.length; j++) {
    arr[j].tokensEarned = earningsForViews(arr[j].views);
  }
  setFeed(arr);
  render();
}

function clearDemo() {
  if (confirm("Clear all demo posts?")) {
    setFeed([]);
    render();
  }
}

// ---------- Render ----------
function render() {
  var feed = getFeed();

  // Stats
  var posts = feed.length;
  var views = 0;
  var rewards = 0;
  for (var i = 0; i < feed.length; i++) {
    views += Number(feed[i].views || 0);
    rewards += earningsForViews(feed[i].views);
  }

  var statPosts = document.getElementById("statPosts");
  var statViews = document.getElementById("statViews");
  var statRewards = document.getElementById("statRewards");
  if (statPosts) statPosts.textContent = String(posts);
  if (statViews) statViews.textContent = String(views);
  if (statRewards) statRewards.textContent = rewards.toFixed(2);

  // Top creators
  var topCreators = document.getElementById("topCreators");
  if (topCreators) {
    var sorted = feed.slice().sort(function (a, b) {
      return (Number(b.views || 0) - Number(a.views || 0));
    }).slice(0, 5);

    var htmlTop = "<h3>Top creators</h3>";
    for (var t = 0; t < sorted.length; t++) {
      htmlTop +=
        '<div class="muted">@' +
        escapeHtml(sorted[t].username) +
        " • " +
        Number(sorted[t].views || 0) +
        " views • " +
        earningsForViews(sorted[t].views) +
        " X</div>";
    }
    topCreators.innerHTML = htmlTop;
  }

  // Posts table
  var holder = document.getElementById("posts");
  if (!holder) return;
  holder.innerHTML = "";

  for (var k = 0; k < feed.length; k++) {
    var p = feed[k];
    var row = document.createElement("div");
    row.className = "tr";
    row.innerHTML =
      '<div class="muted">@' + escapeHtml(p.username) + "</div>" +
      '<div>' +
        '<input class="captionInput" value="' + escapeHtml(p.caption) + '"' +
        ' oninput="updateCaption(' + k + ', this.value)" />' +
      "</div>" +
      '<div><span class="badge">' + Number(p.views || 0) + " views</span></div>" +
      '<div><span class="badge">' + earningsForViews(p.views) + " X</span></div>" +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<button class="btn" onclick="simulateView(' + k + ', 1)">+1 view</button>' +
        '<button class="btn" onclick="simulateView(' + k + ', 10)">+10</button>' +
        '<button class="btn" onclick="playPost(\'' + escapeHtml(p.video) + '\')">▶ play</button>' +
        '<button class="btn" onclick="deletePost(' + k + ')">🗑 delete</button>' +
      "</div>";
    holder.appendChild(row);
  }
}

// ---------- Post actions ----------
function playPost(src) {
  var w = window.open("", "_blank");
  if (!w) return;
  var safeSrc = String(src);
  w.document.write(
    '<video src="' +
      safeSrc +
      '" controls autoplay style="width:100%;height:100vh;object-fit:contain;background:#000"></video>'
  );
}

function updateCaption(index, value) {
  var feed = getFeed();
  if (feed[index]) {
    feed[index].caption = String(value || "");
    setFeed(feed);
  }
}

function simulateView(index, plus) {
  var feed = getFeed();
  if (!feed[index]) return;
  var inc = Number(plus || 1);
  feed[index].views = Number(feed[index].views || 0) + inc;
  feed[index].tokensEarned = earningsForViews(feed[index].views);
  setFeed(feed);
  render();
}

function deletePost(index) {
  var feed = getFeed();
  feed.splice(index, 1);
  setFeed(feed);
  render();
}

// ---------- Wallet (uživatelé z register.html) ----------
function adjustWallet() {
  var emailEl = document.getElementById("walletEmail");
  var deltaEl = document.getElementById("walletDelta");
  var info = document.getElementById("walletInfo");
  var email = emailEl ? String(emailEl.value || "").trim() : "";
  var delta = deltaEl ? parseFloat(deltaEl.value || "0") : 0;

  if (!email) {
    if (info) info.textContent = "Enter user e-mail.";
    return;
  }
  var key = "user_" + email;
  var user;
  try {
    user = JSON.parse(localStorage.getItem(key) || "{}");
  } catch (_) {
    user = {};
  }
  user.tokens = Number(user.tokens || 0) + (isNaN(delta) ? 0 : delta);
  localStorage.setItem(key, JSON.stringify(user));
  if (info) info.textContent = "Set: " + email + " now has " + Number(user.tokens || 0).toFixed(2) + " X";
}

// ---------- Export / Import ----------
function exportUsers() {
  var out = {};
  for (var i = 0; i < localStorage.length; i++) {
    var k = localStorage.key(i);
    if (k && k.indexOf("user_") === 0) {
      out[k] = localStorage.getItem(k);
    }
  }
  return out;
}

function exportData() {
  var data = {
    demoFeed: getFeed(),
    users: exportUsers()
  };
  var blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = "go4share_export.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importData(evt) {
  var file = evt && evt.target && evt.target.files ? evt.target.files[0] : null;
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function (e) {
    try {
      var data = JSON.parse(e.target.result);
      if (data.demoFeed) setFeed(data.demoFeed);
      if (data.users) {
        for (var k in data.users) {
          if (Object.prototype.hasOwnProperty.call(data.users, k)) {
            localStorage.setItem(k, data.users[k]);
          }
        }
      }
      render();
      alert("Import OK");
    } catch (err) {
      alert("Import error: " + err.message);
    }
  };
  reader.readAsText(file);
}

// ---------- Make functions accessible from HTML ----------
window.goFeed = goFeed;
window.seedDemo = seedDemo;
window.clearDemo = clearDemo;
window.exportData = exportData;
window.importData = importData;
window.adjustWallet = adjustWallet;
window.render = render;
window.playPost = playPost;
window.updateCaption = updateCaption;
window.simulateView = simulateView;
window.deletePost = deletePost;

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", render);