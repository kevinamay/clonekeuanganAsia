import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import CommandPalette from './CommandPalette';
import AnnouncementModal from './AnnouncementModal';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

export default function Layout() {
  const { user } = useAuth();
  
  // Desktop sidebar default open, mobile drawer default closed
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Close mobile drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileDrawerOpen]);

  // If not logged in, show exact login page
  if (!user) {
    return <LoginModal />;
  }

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileDrawerOpen(prev => !prev);
    } else {
      setSidebarOpen(prev => !prev);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex text-slate-900 font-sans">
      {/* Desktop Sidebar: can be smoothly collapsed/opened via hamburger button */}
      <aside
        className={`hidden shrink-0 border-r border-slate-100 bg-white transition-[width] duration-200 lg:block ${
          sidebarOpen ? 'w-60' : 'w-0 overflow-hidden border-none'
        }`}
      >
        <div className="sticky top-0 h-screen w-60">
          <Sidebar />
        </div>
      </aside>

      {/* Mobile / Tablet Drawer: appears when hamburger button is clicked */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop overlay (dismissible on click anywhere) */}
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs animate-fade-in cursor-pointer transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          {/* Drawer Panel */}
          <div className="relative z-10 w-64 border-r border-slate-200 bg-white shadow-2xl flex flex-col h-full animate-slide-right">
            <Sidebar onClose={() => setMobileDrawerOpen(false)} isMobile={true} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col bg-white">
        <Header onMenuClick={toggleSidebar} />
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 max-w-[1580px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Command Palette Search Modal */}
      <CommandPalette />

      {/* System Announcement / Notification Popup */}
      <AnnouncementModal />
    </div>
  );
}
