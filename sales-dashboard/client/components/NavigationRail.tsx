'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gauge, TrendingUp, BarChart3, CheckCircle, Table } from 'lucide-react';

interface NavSection {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const SECTIONS: NavSection[] = [
  { path: '/', label: 'Overview', icon: <Gauge size={16} /> },
  { path: '/revenue', label: 'Revenue', icon: <TrendingUp size={16} /> },
  { path: '/markets', label: 'Markets', icon: <BarChart3 size={16} /> },
  { path: '/fulfillment', label: 'Fulfillment', icon: <CheckCircle size={16} /> },
  { path: '/transactions', label: 'Transactions', icon: <Table size={16} /> },
];

export const NavigationRail: React.FC = () => {
  const pathname = usePathname();
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track scroll progress of the active page
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
    setScrollProgress(progress);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Reset/re-trigger scroll progress on mount and pathname change
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll, pathname]);

  return (
    <>
      {/* Desktop: Vertical Rail */}
      <nav className="nav-rail" aria-label="Dashboard sections">
        {/* Scroll Progress Track */}
        <div className="nav-rail-progress">
          <div
            className="nav-rail-progress-fill"
            style={{ height: `${scrollProgress}%` }}
          />
        </div>

        {/* Section Links */}
        <div className="flex flex-col items-center gap-1 mt-2">
          {SECTIONS.map((section) => {
            const isActive = pathname === section.path;
            return (
              <Link
                key={section.path}
                href={section.path}
                className={`nav-rail-item ${isActive ? 'active' : ''}`}
                title={section.label}
              >
                {section.icon}
                <span className="nav-rail-label">{section.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile: Horizontal Bar */}
      <nav className="nav-mobile sticky top-[64px] z-45 border-b border-white/5 bg-[#0e1524]/95 backdrop-blur-md overflow-x-auto" aria-label="Dashboard sections mobile">
        <div className="flex items-center gap-1 px-3 py-2 min-w-max">
          {SECTIONS.map((section) => {
            const isActive = pathname === section.path;
            return (
              <Link
                key={section.path}
                href={section.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20'
                    : 'text-[#64748b] hover:text-[#94a3b8] border border-transparent'
                }`}
              >
                {section.icon}
                {section.label}
              </Link>
            );
          })}
        </div>
        {/* Mobile progress bar */}
        <div className="h-[2px] bg-white/2 relative w-full">
          <div
            className="absolute left-0 top-0 h-full bg-[#3b82f6]/30 transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </nav>
    </>
  );
};
