'use client';

import React, { useState } from 'react';
import { 
  Database, Trash2, ShieldCheck, AlertTriangle, 
  Settings, RefreshCw, CheckCircle 
} from 'lucide-react';
import { useDashboardContext } from '../../context/DashboardContext';

export default function SettingsPage() {
  const { datasets, removeDataset, loading, refetchAll } = useDashboardContext();
  const [dbResetSuccess, setDbResetSuccess] = useState(false);
  const [dbResetLoading, setDbResetLoading] = useState(false);

  const handleClearAll = async () => {
    if (!window.confirm('WARNING: This will drop ALL database records, schemas, and uploaded datasets. Are you sure you want to proceed?')) {
      return;
    }
    setDbResetLoading(true);
    try {
      for (const d of datasets) {
        await removeDataset(d.id);
      }
      setDbResetSuccess(true);
      await refetchAll();
      setTimeout(() => setDbResetSuccess(false), 3000);
    } catch (e) {
      console.error('Reset failed:', e);
      alert('Failed to reset database.');
    } finally {
      setDbResetLoading(false);
    }
  };

  return (
    <div className="shell-container tab-transition max-w-[900px] mx-auto pt-6 flex flex-col gap-6">
      
      <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-color)]">
        <Settings size={18} className="text-[var(--accent-color)]" />
        <h2 className="text-sm font-extrabold text-[var(--text-primary)]">System Settings & Data Node</h2>
      </div>

      {dbResetSuccess && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-2">
          <CheckCircle size={14} />
          Database reset complete. All active transaction telemetry dropped.
        </div>
      )}

      {/* Datasets Manager */}
      <div className="fintech-card flex flex-col gap-4">
        <div>
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Active Ingested Datasets</h3>
          <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
            Switch, review, or delete active database nodes.
          </p>
        </div>

        <div className="space-y-3.5 mt-2">
          {datasets.length === 0 ? (
            <div className="text-center text-xs text-[var(--text-secondary)] py-8 border border-dashed border-[var(--border-color)] rounded-xl">
              No datasets found in Supabase database. Upload data on the Intake panel.
            </div>
          ) : (
            datasets.map((d) => (
              <div 
                key={d.id} 
                className="flex justify-between items-center text-xs p-3.5 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] group hover:border-[var(--accent-color)]/25 transition"
              >
                <div>
                  <p className="font-extrabold text-[var(--text-primary)] break-all max-w-[400px]">
                    {d.name}
                  </p>
                  <div className="flex items-center gap-3.5 text-[10px] text-[var(--text-secondary)] font-semibold mt-1.5 uppercase">
                    <span>{d.rowCount.toLocaleString()} rows</span>
                    <span>•</span>
                    <span>Imported: {new Date(d.importedAt).toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => removeDataset(d.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-500 transition opacity-0 group-hover:opacity-100 cursor-pointer flex-shrink-0"
                  title="Remove from database"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Operations Maintenance */}
      <div className="fintech-card flex flex-col gap-4 border-red-500/10">
        <div>
          <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider">Operational Maintenance</h3>
          <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
            Reset operations, wipe configurations, and purge databases.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2">
            <AlertTriangle className="text-red-500 flex-shrink-0" size={16} />
            <div>
              <p className="text-xs font-bold text-[var(--text-primary)]">Purge Database Records</p>
              <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                Drops all transaction ledger rows and active dataset references. Action is irreversible.
              </p>
            </div>
          </div>
          <button
            onClick={handleClearAll}
            disabled={dbResetLoading || datasets.length === 0}
            className="btn-secondary hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 py-2 px-4 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
          >
            {dbResetLoading ? <RefreshCw className="animate-spin" size={12} /> : <Trash2 size={12} />}
            Purge All Datasets
          </button>
        </div>
      </div>

      {/* System Telemetry Metadata */}
      <div className="fintech-card flex flex-col gap-4">
        <div>
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">System Telemetry Metadata</h3>
          <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
            Connection parameters and database configurations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)]">
            <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase">Database Node Provider</span>
            <p className="text-xs font-extrabold text-[var(--text-primary)] mt-1">PostgreSQL (Supabase Cloud)</p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)]">
            <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase">Secure Protocol</span>
            <p className="text-xs font-extrabold text-emerald-500 mt-1 flex items-center gap-0.5">
              <ShieldCheck size={13} /> SSL SECURE CONNECTION
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
