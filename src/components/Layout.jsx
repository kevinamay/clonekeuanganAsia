import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import CommandPalette from './CommandPalette';
import AnnouncementModal from './AnnouncementModal';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

export default function Layout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If not logged in, show exact login page
  if (!user) {
    return <LoginModal />;
  }

  return (
    <div className="min-h-screen bg-slate-50/70 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
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
