function uploadVideo() {
  const fileInput = document.getElementById("videoFile");
  const caption = document.getElementById("caption").value.trim();
  const status = document.getElementById("uploadStatus");

  if (!fileInput.files.length) {
    status.textContent = "Please select a video.";
    return;
  }

  const file = fileInput.files[0];
  const fileName = file.name;
  const sizeMB = (file.size / 1024 / 1024).toFixed(1);

  if (sizeMB > 200) {
    status.textContent = "File is too large (max 200 MB).";
    return;
  }

  // Demo – uloží video jen lokálně do simulovaného feedu
  let feed = JSON.parse(localStorage.getItem("demoFeed")) || [];
  feed.unshift({
    username: localStorage.getItem("loggedUser") || "you",
    video: URL.createObjectURL(file),
    caption: caption || "New video",
    views: 0,
    tokensEarned: 0
  });
  localStorage.setItem("demoFeed", JSON.stringify(feed));

  status.textContent = "Video uploaded successfully!";
  setTimeout(() => {
    window.location.href = "feed.html";
  }, 1500);
}

function goBack() {
  window.location.href = "feed.html";
}