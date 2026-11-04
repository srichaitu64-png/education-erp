import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 selection:bg-blue-600 selection:text-white">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

