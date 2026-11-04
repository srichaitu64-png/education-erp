import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Play,
  Layers,
  BookOpen,
  CreditCard
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Features', href: '/features' },
    { label: 'Modules', href: '/modules' },
    { label: 'Live Demo', href: '/demo', highlight: true },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Testimonials', href: '/testimonials' },
    { label: 'FAQ', href: '/faq' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-1.5">
              EduOmni <span className="text-xs uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-extrabold border border-blue-200">SaaS</span>
            </span>
            <span className="text-[11px] text-gray-500 block font-medium">Enterprise Education ERP</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'text-blue-600 bg-blue-50/80 font-bold'
                    : link.highlight
                    ? 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.highlight && <Play className="w-3.5 h-3.5 fill-indigo-600" />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/book-demo"
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:text-blue-600 hover:bg-gray-50 border border-gray-200 transition-all"
          >
            Book a Demo
          </Link>
          <Link
            to="/login"
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 rounded-xl text-sm font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all flex items-center gap-2"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="lg:hidden flex items-center gap-2">
          <Link
            to="/demo"
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 flex items-center gap-1 border border-indigo-200"
          >
            <Play className="w-3 h-3 fill-indigo-600" /> Demo
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="p-2 rounded-xl text-gray-600 hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-3 shadow-xl">
          <div className="grid grid-cols-2 gap-2 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1.5"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-2.5">
            <Link
              to="/book-demo"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl text-sm font-bold border border-gray-300 text-gray-700"
            >
              Book 1-on-1 Demo
            </Link>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl text-sm font-bold bg-gray-100 text-gray-800"
            >
              Sign In to ERP
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-xl text-sm font-extrabold bg-blue-600 text-white shadow-md shadow-blue-500/20"
            >
              Start 30-Day Free Trial
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

