function registerUser() {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !email || !password) {
        alert("Please fill all fields.");
        return;
    }

    const user = {
        username,
        email,
        password,
        tokens: 0,
        views: 0,
        videos: []
    };

    // Store in localStorage for demo
    localStorage.setItem("user_" + email, JSON.stringify(user));
    localStorage.setItem("loggedUser", email);

    window.location.href = "feed.html"; // Go to main feed
}