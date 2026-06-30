'use client';

import React from 'react';
import { X, BookOpen, HelpCircle } from 'lucide-react';

interface GlossaryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TermDefinition {
  term: string;
  category: string;
  definition: string;
  interpretation: string;
}

const DICTIONARY: TermDefinition[] = [
  {
    term: 'Linear Regression Trend Line',
    category: 'Financial Analytics',
    definition: 'A statistical model that fits a straight line (y = mx + b) through historical data points to identify the overall growth or decline slope.',
    interpretation: 'Look at the direction of the dotted trend line. A positive slope confirms healthy sales growth, ignoring daily peaks and troughs.'
  },
  {
    term: 'Growth Velocity Index',
    category: 'Geographical Analytics',
    definition: 'Calculates the rate of sales acceleration by comparing the total revenue in the second half of the date range against the first half.',
    interpretation: 'A positive percentage means sales are speeding up in that region. A negative percentage flags deceleration and potential market weakness.'
  },
  {
    term: 'MoM Cohort Retention',
    category: 'Client Behavior',
    definition: 'Measures what percentage of unique customers from a specific cohort (Month 1) returned to make additional purchases in subsequent months.',
    interpretation: 'A flatter retention curve indicates high customer loyalty and successful product-market fit. A steep drop-off signals a churn concern.'
  },
  {
    term: 'Forecast Uncertainty Cone',
    category: 'Predictive Analytics',
    definition: 'A shaded region representing a 95% statistical confidence boundary based on the Standard Error of Estimate of historical linear slopes.',
    interpretation: 'The cone expands as it projects further into the future because predictions naturally become less certain over longer horizons.'
  },
  {
    term: 'SLA Risk Score',
    category: 'Operations & Risk',
    definition: 'A custom weight calculation index: (Cancelled Orders * 1.5 + Pending Orders * 0.8) / Total Orders * 100.',
    interpretation: 'Under 12% is healthy. Between 12% and 30% indicates moderate operational friction. Exceeding 30% flags a high backlog or processing bottleneck.'
  },
  {
    term: 'Average Order Value (AOV)',
    category: 'Financial Analytics',
    definition: 'The average revenue generated per individual transaction (Total Revenue / Total Orders).',
    interpretation: 'Use AOV to understand buyer ticket sizes. Increasing AOV through bundles or cross-selling is an efficient way to grow revenue without acquiring new customers.'
  },
  {
    term: 'Telemetry Confidence Rating',
    category: 'Data Quality',
    definition: 'A score indicating the statistical soundness of summaries, calculated from record counts and data completeness metrics.',
    interpretation: 'Scores above 90% confirm a clean, rich dataset. Scores below 70% suggest missing data fields or low volume, requiring cautious execution.'
  }
];

export const GlossaryDrawer: React.FC<GlossaryDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
      />

      {/* Slide out Panel */}
      <div className="relative w-full max-w-[460px] h-full bg-[var(--surface-color)] border-l border-[var(--border-color)] shadow-2xl flex flex-col z-10 tab-transition">
        
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--border-color)] bg-[var(--bg-color)]/50">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-[var(--accent-color)]" />
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Data Dictionary & Glossary</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[rgba(148,163,184,0.1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed italic">
            This glossary defines all the technical calculations and metrics used across the analytical dashboard. Check here to interpret the visualizations.
          </p>

          <div className="space-y-5">
            {DICTIONARY.map((item) => (
              <div 
                key={item.term} 
                className="p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/20 transition flex flex-col gap-2.5"
              >
                <div className="flex justify-between items-baseline gap-2">
                  <h4 className="text-xs font-extrabold text-[var(--text-primary)]">
                    {item.term}
                  </h4>
                  <span className="text-[8.5px] font-extrabold text-[var(--accent-color)] uppercase tracking-wider bg-[var(--accent-glow)] px-2 py-0.5 rounded border border-[var(--accent-color)]/10">
                    {item.category}
                  </span>
                </div>
                
                <div>
                  <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase block">Technical Definition</span>
                  <p className="text-[11px] text-[var(--text-primary)] leading-relaxed mt-0.5">
                    {item.definition}
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--border-color)]/50">
                  <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase block flex items-center gap-1">
                    <HelpCircle size={10} className="text-[var(--accent-color)]" />
                    How to Interpret
                  </span>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mt-0.5 italic">
                    {item.interpretation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
