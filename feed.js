// ===== DEMO USERS =====
let demoUsers = [];
for (let i = 1; i <= 50; i++) {
    demoUsers.push({
        username: "demo_user_" + i,
        video: "demo_video.mp4", // nahraj si vlastní video do projektu
        views: 0,
        tokensEarned: 0
    });
}

localStorage.setItem("demoFeed", JSON.stringify(demoUsers));


// ===== FEED RENDER =====
function loadFeed() {
    const feedDiv = document.getElementById("feed");
    const demo = JSON.parse(localStorage.getItem("demoFeed"));

    feedDiv.innerHTML = "";

    demo.forEach((item, index) => {
        let card = `
        <div class="video-card">
            <div class="user-info">@${item.username}</div>
            <video src="${item.video}" controls onclick="videoWatched(${index})"></video>
            <div class="actions">
                <button onclick="likeVideo(${index})">❤️ Like</button>
                <button onclick="shareVideo(${index})">↻ Share</button>
                <button onclick="report(${index})">⚠ Report</button>
            </div>
        </div>
        `;
        feedDiv.innerHTML += card;
    });
}

window.onload = loadFeed;


// ===== WATCH HANDLING + TOKENS =====
let watchTimers = {};

function videoWatched(id) {
    let user = JSON.parse(localStorage.getItem("loggedUser"));
    let demo = JSON.parse(localStorage.getItem("demoFeed"));

    if (!watchTimers[id]) {
        watchTimers[id] = true;

        setTimeout(() => {
            // po 5s se začíná počítat token
            addToken(id);
        }, 5000);
    }
}

function addToken(id) {
    let demo = JSON.parse(localStorage.getItem("demoFeed"));
    let creator = demo[id];

    creator.views++;

    // tvůrce získává 0.5 tokenu za 10 shlédnutí
    if (creator.views % 10 === 0) {
        creator.tokensEarned += 0.5;
    }

    localStorage.setItem("demoFeed", JSON.stringify(demo));
}


// ===== MULTILANGUAGE =====
function changeLanguage() {
    const lang = document.getElementById("langSelect").value;
    localStorage.setItem("lang", lang);
    alert("Language changed to " + lang.toUpperCase());
}


// ===== OTHER ACTIONS =====

function likeVideo(id) {
    alert("Liked!");
}

function shareVideo(id) {
    alert("Shared!");
}

function report(id) {
    alert("Video reported.");
}

function logout() {
    localStorage.removeItem("loggedUser");
    window.location.href = "login.html";
}

function goUpload() {
    window.location.href = "upload.html";
}

function goTokens() {
    window.location.href = "tokens.html";
}