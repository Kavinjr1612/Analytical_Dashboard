'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Gauge, TrendingUp, BarChart3, CheckCircle, Table, 
  Settings, ChevronLeft, ChevronRight, UploadCloud, 
  Map, Users, ShieldAlert, LineChart 
} from 'lucide-react';
import { useDashboardContext } from '../context/DashboardContext';

interface NavSection {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const SECTIONS: NavSection[] = [
  { path: '/', label: 'Data Intake', icon: <UploadCloud size={16} /> },
  { path: '/overview', label: 'Overview', icon: <Gauge size={16} /> },
  { path: '/revenue', label: 'Revenue', icon: <TrendingUp size={16} /> },
  { path: '/markets', label: 'Markets', icon: <BarChart3 size={16} /> },
  { path: '/regions', label: 'Regions', icon: <Map size={16} /> },
  { path: '/customers', label: 'Customers', icon: <Users size={16} /> },
  { path: '/risk', label: 'Risk Analytics', icon: <ShieldAlert size={16} /> },
  { path: '/ledger', label: 'Ledger', icon: <Table size={16} /> },
  { path: '/forecast', label: 'Forecast', icon: <LineChart size={16} /> },
];

export const NavigationRail: React.FC = () => {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useDashboardContext();
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
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll, pathname]);

  return (
    <>
      {/* Desktop: Collapsible Sidebar */}
      <nav 
        className={`sidebar-nav ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'} hidden lg:flex`}
        aria-label="Dashboard sections"
      >
        {/* Sidebar Logo Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-7 h-7 rounded bg-[var(--accent-color)] flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow-md">
              A
            </div>
            {!isSidebarCollapsed && (
              <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--text-primary)] transition-opacity duration-200">
                Auro Analytics
              </span>
            )}
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded hover:bg-[rgba(148,163,184,0.1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
          >
            {isSidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        {/* Section Links */}
        <div className="flex-1 flex flex-col justify-between py-6 px-3">
          <div className="space-y-1.5">
            {SECTIONS.map((section) => {
              const isActive = pathname === section.path;
              return (
                <Link
                  key={section.path}
                  href={section.path}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  title={section.label}
                >
                  <span className="flex-shrink-0">{section.icon}</span>
                  {!isSidebarCollapsed && (
                    <span className="truncate text-xs font-semibold tracking-wide transition-opacity duration-200">
                      {section.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Bottom Settings Link */}
          <Link
            href="/settings"
            className={`sidebar-link ${pathname === '/settings' ? 'active' : ''}`}
            title="Settings"
          >
            <Settings size={16} />
            {!isSidebarCollapsed && (
              <span className="truncate text-xs font-semibold tracking-wide">
                Settings
              </span>
            )}
          </Link>
        </div>

        {/* Scroll Progress Fill track */}
        <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-transparent pointer-events-none">
          <div 
            className="bg-[var(--accent-color)] transition-all duration-150"
            style={{ 
              height: `${scrollProgress}%`, 
              width: '2px',
              boxShadow: '0 0 6px var(--accent-color)'
            }}
          />
        </div>
      </nav>

      {/* Mobile: Horizontal Nav Bar */}
      <nav className="nav-mobile sticky top-[64px] z-45 border-b border-[var(--border-color)] bg-[var(--surface-color)]/95 backdrop-blur-md overflow-x-auto lg:hidden" aria-label="Dashboard sections mobile">
        <div className="flex items-center gap-1 px-3 py-2 min-w-max">
          {SECTIONS.map((section) => {
            const isActive = pathname === section.path;
            return (
              <Link
                key={section.path}
                href={section.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[var(--accent-glow)] text-[var(--text-primary)] border border-[var(--accent-color)]/20'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'
                }`}
              >
                {section.icon}
                {section.label}
              </Link>
            );
          })}
          <Link
            href="/settings"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
              pathname === '/settings'
                ? 'bg-[var(--accent-glow)] text-[var(--text-primary)] border border-[var(--accent-color)]/20'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'
            }`}
          >
            <Settings size={16} />
            Settings
          </Link>
        </div>
      </nav>
    </>
  );
};
