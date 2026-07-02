'use client';

import React, { useState } from 'react';
import { 
  UploadCloud, AlertTriangle, CheckCircle, Database, 
  Play, FileText, Trash2, Calendar, RefreshCw 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useDashboardContext } from '../context/DashboardContext';

// Types for validation report
interface ValidationReport {
  missingValues: number;
  duplicateRows: number;
  invalidDates: number;
  negativeValues: number;
  malformedStatuses: number;
  totalRows: number;
}

// Inferred field mapping types
interface ColumnMapping {
  customerName: string;
  productName: string;
  category: string;
  region: string;
  amount: string;
  status: string;
  transactionDate: string;
}

export default function DataIntakePage() {
  const { 
    datasets, uploadDataset, removeDataset, 
    setDatasetFilter, loading, filters 
  } = useDashboardContext();

  const [file, setFile] = useState<File | null>(null);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [inferredMapping, setInferredMapping] = useState<ColumnMapping>({
    customerName: '',
    productName: '',
    category: '',
    region: '',
    amount: '',
    status: '',
    transactionDate: '',
  });

  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Datasets auto-load via useDashboard; no manual refetch needed on mount

  // Schema profiles (saved mappings in localStorage)
  const saveSchemaProfile = (headers: string[], mapping: ColumnMapping) => {
    try {
      const profiles = JSON.parse(localStorage.getItem('analytics-schema-profiles') || '[]');
      // Create a signature based on sorted headers
      const signature = [...headers].sort().join(',');
      const profile = { signature, mapping, timestamp: new Date().getTime() };
      
      // Filter out existing profile with same signature
      const updatedProfiles = profiles.filter((p: any) => p.signature !== signature);
      updatedProfiles.push(profile);
      localStorage.setItem('analytics-schema-profiles', JSON.stringify(updatedProfiles));
    } catch (e) {
      console.error('Failed to save schema profile:', e);
    }
  };

  const findSchemaProfile = (headers: string[]): ColumnMapping | null => {
    try {
      const profiles = JSON.parse(localStorage.getItem('analytics-schema-profiles') || '[]');
      const signature = [...headers].sort().join(',');
      const match = profiles.find((p: any) => p.signature === signature);
      return match ? match.mapping : null;
    } catch (e) {
      console.error('Failed to load schema profiles:', e);
      return null;
    }
  };

  // Automated Mapping Inference Heuristics
  const inferSchema = (headers: string[], rows: any[]): ColumnMapping => {
    const mapping: ColumnMapping = {
      customerName: '',
      productName: '',
      category: '',
      region: '',
      amount: '',
      status: '',
      transactionDate: '',
    };

    const headerLower = headers.map(h => h.toLowerCase());

    const findMatch = (keys: string[]) => {
      for (const key of keys) {
        const index = headerLower.findIndex(h => h.includes(key));
        if (index !== -1) return headers[index];
      }
      return '';
    };

    mapping.amount = findMatch(['revenue', 'amount', 'price', 'sales', 'value', 'total', 'amt']);
    mapping.category = findMatch(['category', 'dept', 'group', 'class', 'cat']);
    mapping.region = findMatch(['region', 'city', 'state', 'country', 'location', 'reg']);
    mapping.customerName = findMatch(['customer', 'client', 'buyer', 'name']);
    mapping.productName = findMatch(['product', 'item', 'sku', 'desc', 'prod']);
    mapping.status = findMatch(['status', 'state', 'sla']);
    mapping.transactionDate = findMatch(['date', 'time', 'created', 'timestamp', 'txn']);

    // Fallbacks
    if (!mapping.amount) {
      // Find first numeric header
      for (const h of headers) {
        if (rows[0] && !isNaN(Number(rows[0][h]))) {
          mapping.amount = h;
          break;
        }
      }
    }

    return mapping;
  };

  // Perform pre-import data quality validation
  const validateData = (mapping: ColumnMapping, rows: any[]) => {
    const report: ValidationReport = {
      missingValues: 0,
      duplicateRows: 0,
      invalidDates: 0,
      negativeValues: 0,
      malformedStatuses: 0,
      totalRows: rows.length,
    };

    const rowStrings = new Set<string>();

    rows.forEach(row => {
      // 1. Missing values check in mapped columns
      Object.values(mapping).forEach(colHeader => {
        if (colHeader && (row[colHeader] === undefined || row[colHeader] === null || String(row[colHeader]).trim() === '')) {
          report.missingValues++;
        }
      });

      // 2. Duplicate rows check (hash row values)
      const rowHash = JSON.stringify(row);
      if (rowStrings.has(rowHash)) {
        report.duplicateRows++;
      } else {
        rowStrings.add(rowHash);
      }

      // 3. Invalid dates check
      if (mapping.transactionDate && row[mapping.transactionDate]) {
        const d = new Date(row[mapping.transactionDate]);
        if (isNaN(d.getTime())) {
          report.invalidDates++;
        }
      }

      // 4. Negative values check in amount
      if (mapping.amount && row[mapping.amount]) {
        const val = Number(row[mapping.amount]);
        if (!isNaN(val) && val < 0) {
          report.negativeValues++;
        }
      }

      // 5. Malformed statuses check (must map to standard SLA states)
      if (mapping.status && row[mapping.status]) {
        const s = String(row[mapping.status]).trim().toLowerCase();
        if (s !== 'completed' && s !== 'pending' && s !== 'cancelled') {
          report.malformedStatuses++;
        }
      }
    });

    setValidationReport(report);
  };

  // Parse Excel / CSV Files using SheetJS
  const handleFileParse = (uploadedFile: File) => {
    setFile(uploadedFile);
    setErrorMsg(null);
    setUploadSuccess(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON array
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        
        if (rows.length === 0) {
          setErrorMsg('The selected spreadsheet contains no data rows.');
          return;
        }

        // Get headers
        const headers = Object.keys(rows[0]);
        setParsedHeaders(headers);
        setParsedRows(rows);

        // Check if we have an existing schema profile
        const savedMatch = findSchemaProfile(headers);
        let activeMapping: ColumnMapping;

        if (savedMatch) {
          activeMapping = savedMatch;
        } else {
          activeMapping = inferSchema(headers, rows);
        }

        setInferredMapping(activeMapping);
        validateData(activeMapping, rows);
      } catch (err) {
        console.error(err);
        setErrorMsg('Error parsing the uploaded file. Please make sure it is a valid CSV or Excel file.');
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileParse(e.dataTransfer.files[0]);
    }
  };

  // Map updates manually modified by user
  const handleMappingChange = (field: keyof ColumnMapping, val: string) => {
    const updated = { ...inferredMapping, [field]: val };
    setInferredMapping(updated);
    validateData(updated, parsedRows);
  };

  // Trigger Backend Import
  const handleImport = async () => {
    if (!file || parsedRows.length === 0) return;

    // Check if amount and date are mapped (mandatory fields)
    if (!inferredMapping.amount || !inferredMapping.transactionDate) {
      setErrorMsg('Mandatory mappings (Revenue/Amount and Date) are missing. Please map these columns.');
      return;
    }

    try {
      // Map transactions rows to database fields
      const formattedTransactions = parsedRows.map(row => ({
        customerName: inferredMapping.customerName ? String(row[inferredMapping.customerName]) : 'Unknown Customer',
        productName: inferredMapping.productName ? String(row[inferredMapping.productName]) : 'Standard Item',
        category: inferredMapping.category ? String(row[inferredMapping.category]) : 'General',
        region: inferredMapping.region ? String(row[inferredMapping.region]) : 'National',
        amount: Number(row[inferredMapping.amount]) || 0,
        status: inferredMapping.status ? String(row[inferredMapping.status]) : 'Completed',
        transactionDate: inferredMapping.transactionDate ? new Date(row[inferredMapping.transactionDate]).toISOString() : new Date().toISOString(),
      }));

      // Save column mapping profile for future matching structures
      saveSchemaProfile(parsedHeaders, inferredMapping);

      await uploadDataset(file.name, formattedTransactions);
      setUploadSuccess(true);
      setFile(null);
      setParsedHeaders([]);
      setParsedRows([]);
      setValidationReport(null);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Import failed. Please verify database availability.');
    }
  };

  const handleDatasetSwitch = (id: string) => {
    setDatasetFilter(id);
    window.location.href = '/overview';
  };

  // Compute Quick Stats
  const totalAccumulatedRows = datasets.reduce((sum, d) => sum + d.rowCount, 0);
  const avgDatasetRows = datasets.length > 0 ? Math.round(totalAccumulatedRows / datasets.length) : 0;
  const latestDataset = datasets.length > 0 
    ? [...datasets].sort((a, b) => new Date(b.importedAt).getTime() - new Date(a.importedAt).getTime())[0] 
    : null;

  return (
    <div className="shell-container tab-transition max-w-[1700px] mx-auto pt-6">
      
      {/* Dynamic Alert Info */}
      {errorMsg && (
        <div className="mb-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle size={14} />
          {errorMsg}
        </div>
      )}

      {uploadSuccess && (
        <div className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-2">
          <CheckCircle size={14} />
          Dataset imported successfully! Navigate to routes in the sidebar to review metrics.
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column (col-span-7): Upload Node & Mapping Controls */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          
          {/* Uploader Card */}
          <div className="fintech-card flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Spreadsheet Upload Node</h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider mb-4">
                Parse local CSV/Excel transactions into memory
              </p>
            </div>
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border border-dashed rounded-xl p-8 text-center transition ${
                isDragOver ? 'border-[var(--accent-color)] bg-[var(--accent-glow)]' : 'border-[var(--border-color)]'
              }`}
            >
              <UploadCloud className="mx-auto text-[var(--text-secondary)] mb-3 opacity-60" size={32} />
              <p className="text-xs font-semibold text-[var(--text-primary)] mb-1">
                Drag & drop your CSV or Excel file here
              </p>
              <p className="text-[9px] text-[var(--text-secondary)] mb-4 font-semibold uppercase tracking-wider">
                Supports CSV, XLSX, XLS
              </p>
              <input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => e.target.files && handleFileParse(e.target.files[0])}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="btn-secondary h-10 px-5 text-xs font-semibold cursor-pointer inline-flex items-center justify-center"
              >
                Browse Files
              </label>
            </div>
            {file && (
              <p className="text-[11px] font-semibold text-[var(--accent-color)] mt-3 flex items-center gap-1.5 justify-center bg-[var(--accent-glow)] py-1.5 px-3 rounded-lg border border-[var(--accent-color)]/10">
                <FileText size={12} /> Active Ingestion Socket: {file.name}
              </p>
            )}
          </div>

          {/* Validation & Mapping (renders only when file is active) */}
          {file && parsedRows.length > 0 && (
            <div className="fintech-card flex flex-col gap-5">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                  Dynamic Schema Mapping
                </h3>
                <p className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider">
                  Align ingested spreadsheet headers with ledger database attributes
                </p>
              </div>
              
              {/* Mapper Fields */}
              <div className="grid grid-cols-2 gap-4">
                {Object.keys(inferredMapping).map((field) => {
                  const isMandatory = field === 'amount' || field === 'transactionDate';
                  return (
                    <div key={field} className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
                        {field.replace(/([A-Z])/g, ' $1')} {isMandatory && <span className="text-rose-500">*</span>}
                      </label>
                      <select
                        value={inferredMapping[field as keyof ColumnMapping] || ''}
                        onChange={(e) => handleMappingChange(field as keyof ColumnMapping, e.target.value)}
                        className="fintech-select h-10 py-0 px-3 text-xs font-medium w-full"
                      >
                        <option value="">-- Do Not Map --</option>
                        {parsedHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  );
                })}
              </div>

              {/* Data Quality validation board */}
              {validationReport && (
                <div className="p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]">
                  <h4 className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CheckCircle size={12} className="text-emerald-500" />
                    Pre-Import Data Integrity Analysis
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                    <div className="p-2.5 rounded-lg bg-[var(--surface-color)] border border-[var(--border-color)]">
                      <p className="text-[9px] text-[var(--text-secondary)] font-semibold uppercase">Missing</p>
                      <p className={`text-sm font-semibold mt-1 ${validationReport.missingValues > 0 ? 'text-amber-500' : 'text-[var(--text-primary)]'}`}>
                        {validationReport.missingValues}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--surface-color)] border border-[var(--border-color)]">
                      <p className="text-[9px] text-[var(--text-secondary)] font-semibold uppercase">Duplicates</p>
                      <p className={`text-sm font-semibold mt-1 ${validationReport.duplicateRows > 0 ? 'text-amber-500' : 'text-[var(--text-primary)]'}`}>
                        {validationReport.duplicateRows}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--surface-color)] border border-[var(--border-color)]">
                      <p className="text-[9px] text-[var(--text-secondary)] font-semibold uppercase">Bad Dates</p>
                      <p className={`text-sm font-semibold mt-1 ${validationReport.invalidDates > 0 ? 'text-rose-500' : 'text-[var(--text-primary)]'}`}>
                        {validationReport.invalidDates}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--surface-color)] border border-[var(--border-color)]">
                      <p className="text-[9px] text-[var(--text-secondary)] font-semibold uppercase">Negatives</p>
                      <p className={`text-sm font-semibold mt-1 ${validationReport.negativeValues > 0 ? 'text-amber-500' : 'text-[var(--text-primary)]'}`}>
                        {validationReport.negativeValues}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--surface-color)] border border-[var(--border-color)]">
                      <p className="text-[9px] text-[var(--text-secondary)] font-semibold uppercase">Bad Status</p>
                      <p className={`text-sm font-semibold mt-1 ${validationReport.malformedStatuses > 0 ? 'text-rose-500' : 'text-[var(--text-primary)]'}`}>
                        {validationReport.malformedStatuses}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleImport}
                disabled={loading.importing}
                className="btn-primary w-full h-11 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {loading.importing ? (
                  <>
                    <RefreshCw className="animate-spin" size={12} /> Importing Data telemetry...
                  </>
                ) : (
                  <>
                    <Play size={12} /> Execute Database Schema Import
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right Column (col-span-5): Preview grid or Quick Stats Dashboard */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          
          {/* Data preview (renders when file is active) */}
          {file && parsedRows.length > 0 ? (
            <div className="fintech-card flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1 flex items-center justify-between">
                  <span>Data Ingestion Telemetry Preview</span>
                  <span className="text-[9px] font-semibold text-[var(--text-secondary)] uppercase bg-[var(--bg-color)] px-2 py-0.5 rounded border border-[var(--border-color)]">
                    First 6 Rows of {parsedRows.length.toLocaleString()}
                  </span>
                </h3>
                <p className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider">
                  Raw preview vectors before ingestion index
                </p>
              </div>

              <div className="overflow-x-auto border border-[var(--border-color)] rounded-lg custom-scrollbar">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-[var(--bg-color)] border-b border-[var(--border-color)]">
                      {parsedHeaders.slice(0, 4).map(h => (
                        <th key={h} className="py-2.5 px-3 font-semibold text-[var(--text-secondary)] uppercase tracking-wider truncate max-w-[90px]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 6).map((row, idx) => (
                      <tr key={idx} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-color)] transition">
                        {parsedHeaders.slice(0, 4).map(h => (
                          <td key={h} className="py-2.5 px-3 text-[var(--text-primary)] truncate max-w-[90px] font-medium">
                            {String(row[h])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[9px] text-[var(--text-secondary)] italic">
                Column mapping must include amount and date fields to activate import node.
              </p>
            </div>
          ) : (
            /* Premium Database Stats cards & Expected Schema guide (renders when NO file is active) */
            <div className="flex flex-col gap-6">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="fintech-card p-4 flex flex-col justify-between h-[100px]">
                  <span className="metric-label">Active Nodes</span>
                  <p className="text-xl font-bold mt-1 text-[var(--text-primary)]">{datasets.length}</p>
                  <p className="text-[9px] text-[var(--text-secondary)] font-semibold uppercase">Imported telemetry spreadsheets</p>
                </div>
                <div className="fintech-card p-4 flex flex-col justify-between h-[100px]">
                  <span className="metric-label">Total Logs Indexed</span>
                  <p className="text-xl font-bold mt-1 text-[var(--accent-color)]">{totalAccumulatedRows.toLocaleString()}</p>
                  <p className="text-[9px] text-[var(--text-secondary)] font-semibold uppercase">Total database ledger rows</p>
                </div>
                <div className="fintech-card p-4 flex flex-col justify-between h-[100px]">
                  <span className="metric-label">Mean Density</span>
                  <p className="text-xl font-bold mt-1 text-emerald-500">{avgDatasetRows.toLocaleString()}</p>
                  <p className="text-[9px] text-[var(--text-secondary)] font-semibold uppercase">Average rows per index period</p>
                </div>
                <div className="fintech-card p-4 flex flex-col justify-between h-[100px]">
                  <span className="metric-label">Latest Activity</span>
                  <p className="text-[11px] font-semibold mt-2.5 text-[var(--text-primary)] truncate">
                    {latestDataset ? latestDataset.name : 'No Active Logs'}
                  </p>
                  <p className="text-[9px] text-[var(--text-secondary)] font-semibold uppercase">
                    {latestDataset ? new Date(latestDataset.importedAt).toLocaleDateString() : 'System Idle'}
                  </p>
                </div>
              </div>

              {/* Ingestion Expected Schema Guide */}
              <div className="fintech-card flex flex-col gap-3">
                <div>
                  <h3 className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Database size={13} className="text-[var(--accent-color)]" />
                    Ingestion Schema Guidelines
                  </h3>
                  <p className="text-[9px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider mt-0.5">
                    Target schema specifications for custom spreadsheet tables
                  </p>
                </div>

                <div className="space-y-1.5 text-[10px] mt-1 font-medium">
                  <div className="flex justify-between items-center py-1 border-b border-[var(--border-color)]/40">
                    <span className="text-[var(--text-primary)]">Revenue / Amount <span className="text-rose-500">*</span></span>
                    <span className="text-[var(--text-secondary)] uppercase text-[9px] font-semibold bg-[var(--bg-color)] px-1.5 py-0.5 rounded">Numeric (float)</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[var(--border-color)]/40">
                    <span className="text-[var(--text-primary)]">Transaction Date <span className="text-rose-500">*</span></span>
                    <span className="text-[var(--text-secondary)] uppercase text-[9px] font-semibold bg-[var(--bg-color)] px-1.5 py-0.5 rounded">Date format</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[var(--border-color)]/40">
                    <span className="text-[var(--text-primary)]">Customer Name</span>
                    <span className="text-[var(--text-secondary)] uppercase text-[9px] font-semibold bg-[var(--bg-color)] px-1.5 py-0.5 rounded">String (text)</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[var(--border-color)]/40">
                    <span className="text-[var(--text-primary)]">Product Name</span>
                    <span className="text-[var(--text-secondary)] uppercase text-[9px] font-semibold bg-[var(--bg-color)] px-1.5 py-0.5 rounded">String (text)</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[var(--border-color)]/40">
                    <span className="text-[var(--text-primary)]">Category / Sector</span>
                    <span className="text-[var(--text-secondary)] uppercase text-[9px] font-semibold bg-[var(--bg-color)] px-1.5 py-0.5 rounded">String (text)</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[var(--text-primary)]">Status</span>
                    <span className="text-[var(--text-secondary)] uppercase text-[9px] font-semibold bg-[var(--bg-color)] px-1.5 py-0.5 rounded">completed/pending/cancelled</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Imports Timeline Database */}
          <div className="fintech-card min-h-[220px] flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1 pb-2 border-b border-[var(--border-color)] flex items-center justify-between">
                <span>Recent Imports Database Log</span>
                <span className="text-[9px] font-semibold text-[var(--text-secondary)] bg-[var(--bg-color)] px-2 py-0.5 rounded border border-[var(--border-color)] uppercase">
                  {datasets.length} Active Nodes
                </span>
              </h3>
              
              <div className="space-y-2 mt-3 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                {datasets.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[var(--text-secondary)] font-medium">
                    No active datasets. Upload a spreadsheet to trigger intelligence views.
                  </div>
                ) : (
                  datasets.map((d) => {
                    return (
                      <div 
                        key={d.id} 
                        className="flex justify-between items-center text-xs p-3 rounded-lg border bg-[var(--bg-color)] border-[var(--border-color)] hover:border-[var(--accent-color)]/20 transition group"
                      >
                        <div className="flex flex-col gap-0.5 truncate mr-3 cursor-pointer" onClick={() => handleDatasetSwitch(d.id)}>
                          <span className="font-semibold text-[var(--text-primary)] truncate max-w-[190px]">
                            {d.name}
                          </span>
                          <div className="flex items-center gap-2 text-[9px] text-[var(--text-secondary)] font-semibold uppercase">
                            <span className="text-[var(--accent-color)]">{d.rowCount.toLocaleString()} rows</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Calendar size={9} /> {new Date(d.importedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeDataset(d.id)}
                            className="p-1.5 rounded hover:bg-rose-500/10 text-[var(--text-secondary)] hover:text-rose-500 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Delete dataset"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
