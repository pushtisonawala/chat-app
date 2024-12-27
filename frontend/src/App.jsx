import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import HomePage from './pages/HomePage.jsx';
import SignUpPage from './pages/SignUpPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import { useAuthStore } from '../store/useAuthStore.js';
import { Loader } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

const App = () => {
  const { authUser, checkAuth, isCheckingAuth,onlineUsers } = useAuthStore();

  // Apply theme when the app loads
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'; // Retrieve the saved theme
    document.documentElement.setAttribute('data-theme', savedTheme); // Apply theme to the <html> tag
  }, []);

  useEffect(() => {
    checkAuth(); // Check authentication status when the app loads
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Navbar is always displayed */}
      <Navbar />

      <Routes>
        {/* HomePage is accessible only if the user is logged in */}
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        
        {/* SignUpPage is accessible only if the user is not logged in */}
        <Route path="/signup" element={authUser ? <Navigate to="/" /> : <SignUpPage />} />
        
        {/* LoginPage is accessible only if the user is not logged in */}
        <Route path="/login" element={authUser ? <Navigate to="/" /> : <LoginPage />} />
        
        {/* SettingsPage is accessible only if the user is authenticated */}
        <Route path="/settings" element={authUser ? <SettingsPage /> : <Navigate to="/login" />} />
        
        {/* ProfilePage is accessible only if the user is authenticated */}
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
