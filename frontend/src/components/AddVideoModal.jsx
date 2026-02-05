import React, { useState } from "react";
import API_BASE from "../api";
import { useUser } from "../context/UserContext";


const AddVideoModal = ({ onClose }) => {
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [uploadedPath, setUploadedPath] = useState(null);
  const [file, setFile] = useState(null); // ✅ jediný zdroj souboru
  const { user } = useUser();

  // 🎞️ výběr souboru
  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // ✅ opraveno
  };

  // 🚀 odeslání videa
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) return alert("Vyber prosím video!"); // ✅ místo videoFile

    const formData = new FormData();
    formData.append("video", file);
    formData.append("title", title);
    formData.append("author", user.username);

    try {
      setUploading(true);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE}/api/upload`);

      // 💫 real-time progress bar
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setProgress(percent);
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200 || xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
          setProgress(100);

          setUploadedPath(`${API_BASE}/${response.filePath}`);
          await new Promise((r) => setTimeout(r, 800));
          setSuccess(true);
          setUploading(false);

          // 🔔 refresh feed
          window.dispatchEvent(new Event("videoUploaded"));

          console.log("✅ Upload hotov:", response);
        } else {
          console.error("❌ Upload failed:", xhr.responseText);
          alert(`Upload selhal: ${xhr.status}`);
          setUploading(false);
        }
      };

      xhr.onerror = () => {
        console.error("❌ Upload network error");
        alert("Chyba při nahrávání videa.");
        setUploading(false);
      };

      xhr.send(formData);
    } catch (err) {
      console.error("❌ Upload error:", err);
      alert("Chyba při nahrávání videa.");
      setUploading(false);
    }
  };

  // ✨ UI komponenty
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#0f0f1a] border border-cyan-500/20 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.3)] p-6 w-[500px] max-w-[90%] relative animate-fadeIn">
        {/* ✖️ Zavření */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-cyan-400 mb-4 text-center">
          🎥 Přidat video
        </h2>

        {!success ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Autor</label>
              <input
  type="text"
  value={user?.username || ""}
  disabled
  className="w-full bg-[#1b1b2a] text-gray-200 rounded-lg px-3 py-2 outline-none border border-cyan-500/20"
/>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Název videa
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Zadej název..."
                className="w-full bg-[#1b1b2a] text-gray-200 rounded-lg px-3 py-2 outline-none border border-cyan-500/20 focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Soubor videa
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 
                  file:rounded-lg file:border-0 file:text-sm 
                  file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700 cursor-pointer"
              />
            </div>

            {uploading && (
              <div className="w-full bg-[#1b1b2a] rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 h-2 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="mt-2 bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:opacity-90 transition-all duration-300 rounded-lg py-2 font-semibold"
            >
              {uploading ? "Nahrávám..." : "Nahrát"}
            </button>
          </form>
        ) : (
          <div className="text-center text-green-400 font-semibold py-6">
            ✅ Video úspěšně nahráno!
            {uploadedPath && (
              <video
                src={uploadedPath}
                controls
                className="mt-4 mx-auto rounded-lg shadow-lg max-h-64 border border-cyan-500/30"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddVideoModal;

