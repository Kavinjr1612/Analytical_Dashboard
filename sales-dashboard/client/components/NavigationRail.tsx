'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Gauge, TrendingUp, BarChart3, CheckCircle, Table } from 'lucide-react';

interface NavSection {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const SECTIONS: NavSection[] = [
  { id: 'zone-overview', label: 'Overview', icon: <Gauge size={16} /> },
  { id: 'zone-revenue', label: 'Revenue', icon: <TrendingUp size={16} /> },
  { id: 'zone-markets', label: 'Markets', icon: <BarChart3 size={16} /> },
  { id: 'zone-fulfillment', label: 'Fulfillment', icon: <CheckCircle size={16} /> },
  { id: 'zone-transactions', label: 'Transactions', icon: <Table size={16} /> },
];

export const NavigationRail: React.FC = () => {
  const [activeSection, setActiveSection] = useState('zone-overview');
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track active section via IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
              setActiveSection(id);
            }
          });
        },
        { threshold: [0.2, 0.5], rootMargin: '-80px 0px -30% 0px' }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  // Track scroll progress
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
  }, [handleScroll]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`nav-rail-item ${activeSection === section.id ? 'active' : ''}`}
              title={section.label}
            >
              {section.icon}
              <span className="nav-rail-label">{section.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile: Horizontal Bar */}
      <nav className="nav-mobile sticky top-[64px] z-40 border-b border-white/5 bg-[#0A0A0A]/90 backdrop-blur-md overflow-x-auto" aria-label="Dashboard sections mobile">
        <div className="flex items-center gap-1 px-3 py-2 min-w-max">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
                activeSection === section.id
                  ? 'bg-[#C6A96B]/10 text-[#C6A96B] border border-[#C6A96B]/20'
                  : 'text-[#7E786F] hover:text-[#B8B2A8] border border-transparent'
              }`}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </div>
        {/* Mobile progress bar */}
        <div className="h-[2px] bg-white/2 relative">
          <div
            className="absolute left-0 top-0 h-full bg-[#C6A96B]/30 transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </nav>
    </>
  );
};
