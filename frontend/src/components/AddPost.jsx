import React, { useState } from "react";
import API_BASE from "../api";

const AddPost = ({ onPostAdded }) => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    image: "",
    authorAvatar: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("Odesílám data:", formData);

      const res = await fetch("http://localhost:4000/api/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Příspěvek úspěšně přidán!");
        setFormData({
          title: "",
          author: "",
          description: "",
          image: "",
          authorAvatar: "",
        });
        // 🔥 Zavolá funkci z parentu pro obnovení feedu
        onPostAdded();
      } else {
        console.error("Chyba:", data);
        setMessage(`❌ ${data.error || "Nepodařilo se přidat příspěvek"}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Server nedostupný");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
     className="bg-white p-6 mt-10 rounded-xl shadow-md mb-6"
      
    >
      <h2 className="text-xl font-bold mb-4">Přidat příspěvek</h2>

      <input
        type="text"
        name="title"
        placeholder="Název"
        value={formData.title}
        onChange={handleChange}
        className="w-full border p-2 mb-3 rounded"
        required
      />
      <input
        type="text"
        name="author"
        placeholder="Autor"
        value={formData.author}
        onChange={handleChange}
        className="w-full border p-2 mb-3 rounded"
        required
      />
      <input
        type="text"
        name="image"
        placeholder="URL obrázku"
        value={formData.image}
        onChange={handleChange}
        className="w-full border p-2 mb-3 rounded"
      />
      <input
        type="text"
        name="authorAvatar"
        placeholder="URL avataru"
        value={formData.authorAvatar}
        onChange={handleChange}
        className="w-full border p-2 mb-3 rounded"
      />
      <textarea
        name="description"
        placeholder="Popis"
        value={formData.description}
        onChange={handleChange}
        className="w-full border p-2 mb-3 rounded"
      />

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Přidat
      </button>

      {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
    </form>
  );
};

export default AddPost;

