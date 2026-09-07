'use client';

import React from 'react';
import Link from 'next/link';
import { Database, UploadCloud } from 'lucide-react';
import { useDashboardContext } from '../context/DashboardContext';

interface EmptyStateProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export const EmptyStateWrapper: React.FC<EmptyStateProps> = ({
  title = 'No active datasets loaded',
  description = 'Please ingest a CSV or Excel business dataset in the Data Intake node to enable investigative analytics.',
  children
}) => {
  const { datasets, loading } = useDashboardContext();

  if (loading.datasets) {
    return (
      <div className="shell-container flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-color)]"></div>
        <p className="text-xs text-[var(--text-secondary)] mt-3 font-semibold uppercase tracking-wider">
          Initializing Analytics Core...
        </p>
      </div>
    );
  }

  if (datasets.length === 0) {
    return (
      <div className="shell-container max-w-[600px] mx-auto pt-16 text-center">
        <div className="fintech-card p-10 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[var(--accent-glow)] flex items-center justify-center text-[var(--accent-color)] mb-4">
            <Database size={22} />
          </div>
          <h3 className="text-sm font-extrabold text-[var(--text-primary)] mb-2">
            {title}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm leading-relaxed mb-6">
            {description}
          </p>
          <Link href="/" className="btn-primary flex items-center gap-1.5 text-xs font-bold shadow-md">
            <UploadCloud size={14} />
            Ingest Spreadsheet File
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
