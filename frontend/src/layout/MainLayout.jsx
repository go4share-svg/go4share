import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar";
import WarpStatusHUD from "../components/WarpStatusHUD";
import WarpBackground from "../components/WarpBackground";
import Sidebar from "../components/Sidebar";
import SettingsHub from "../components/SettingsHub";
import AddVideoModal from "../components/AddVideoModal";
import VideoFeed from "../components/VideoFeed";
import ProfilePage from "../pages/ProfilePage";
import LoginModal from "../components/auth/LoginModal";
import RegisterModal from "../components/auth/RegisterModal";
import AdminPanel from "../pages/AdminPanel";
import ForgotPasswordModal from "../components/auth/ForgotPasswordModal";
import ResetPassword from "../pages/ResetPassword";
import UserStatsPage from "../pages/UserStatsPage";
import VideoModal from "../components/VideoModal";
import RightSidebar from "../components/RightSidebar";
import StripeSuccess from "../pages/StripeSuccess";




const MainLayout = () => {
 
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const [showForgot, setShowForgot] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const [activeVideo, setActiveVideo] = useState(null);



  return (
    <div className="relative min-h-screen bg-[#070713] text-white overflow-hidden">
      {/* 🌌 Background */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <WarpBackground active={false} />
      </div>

      {/* 🔝 NAVBAR – předáme handler */}
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />

      <div className="flex relative z-10">
        {/* ⬅️ SIDEBAR */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}

        />

       {/* 📄 MAIN */}
        <main className="flex-1 pt-20 px-4 md:ml-60 md:mr-72 min-h-screen">
          <Routes>
                       <Route
  path="/"
  element={
    <VideoFeed
      activeVideo={activeVideo}
      setActiveVideo={setActiveVideo}
    />
  }
/>
            <Route path="/settings" element={<SettingsHub />} />
            <Route
              path="/add"
              element={<AddVideoModal onClose={() => window.history.back()} />}
            />
            <Route path="/profile/:username" element={<ProfilePage />} />
           
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/stats" element={<UserStatsPage />} />
            <Route path="/stripe-success" element={<StripeSuccess />} />
            
          </Routes>
        </main>

        {/* ➡️ RIGHT SIDEBAR */}
    
     
        <RightSidebar onSelectVideo={setActiveVideo} />
      </div>


      <div className="pointer-events-none">
        <WarpStatusHUD />
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} />}
        {showForgot && (<ForgotPasswordModal onClose={() => setShowForgot(false)} />)}
{showStats && (
  <UserStatsPanel onClose={() => setShowStats(false)} />
)}

{activeVideo && (
  <VideoModal
    video={activeVideo}
    onClose={() => setActiveVideo(null)}
  />
)}

      <footer className="relative z-10 text-center py-6 text-sm md:ml-60 md:mr-72 border-t border-cyan-500/10">
        ©️ 2025 Go4Share — Made by Jay and team 
      </footer>
    </div>
  );
};

export default MainLayout;