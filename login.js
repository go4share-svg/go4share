// Simple demo login – later replaced with full backend
function loginUser() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (email === "" || password === "") {
        alert("Please fill in all fields.");
        return;
    }

    // Demo only – always logs you in
    localStorage.setItem("loggedUser", email);
    window.location.href = "feed.html"; // Main feed
}