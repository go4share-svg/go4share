import React, { useState } from "react";
import MainLayout from "./layout/MainLayout";
import AddVideoModal from "./components/AddVideoModal.jsx";
import SettingsHub from "./components/SettingsHub.jsx";
import { Menu } from "lucide-react";
import Sidebar from "./components/Sidebar";
import { useLocation } from "react-router-dom";

export default function App() {
  const [showAdd, setShowAdd] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");


  return (
    <>
      {/* 🍔 HAMBURGER – jen na mobil */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden text-cyan-400 text-2xl"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu />
      </button>

      {/* 📱 SIDEBAR */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* 🧱 HLAVNÍ LAYOUT */}
      <MainLayout
        onOpenAddModal={() => setShowAdd(true)}
        onOpenSettings={() => setShowSettings(true)}
      />

      {sidebarOpen && (
  <div className="fixed inset-0 z-50 bg-black/70 md:hidden">
    <Sidebar onClose={() => setSidebarOpen(false)} />
  </div>
)}

      {/* ➕ MODÁLY */}
      {showAdd && <AddVideoModal onClose={() => setShowAdd(false)} />}
      {showSettings && <SettingsHub onClose={() => setShowSettings(false)} />}


    </>
  );
}