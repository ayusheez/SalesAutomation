import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark text-white font-sans selection:bg-primary selection:text-white">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <main className="transition-all duration-300 md:ml-64 ml-0 pt-16 min-h-screen bg-[#131229]">
        <div className="p-4 md:p-6 max-w-[1920px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};