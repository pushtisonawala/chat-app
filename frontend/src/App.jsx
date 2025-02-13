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
    checkAuth(); 
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
     
      <Navbar />

      <Routes>
        
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        
      
        <Route path="/signup" element={authUser ? <Navigate to="/" /> : <SignUpPage />} />
        
        
        <Route path="/login" element={authUser ? <Navigate to="/" /> : <LoginPage />} />
        
       
        <Route path="/settings" element={authUser ? <SettingsPage /> : <Navigate to="/login" />} />
        
       
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
