import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  X,
  Check,
  Printer,
  Copy,
} from 'lucide-react';
import { WorkItem } from '../../types';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({ isOpen, onClose }) => {
  const { workItems, importWorkItems } = useApp();

  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importText, setImportText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  if (!isOpen) return null;

  // Generate clean CSV content
  const generateCsv = () => {
    const headers = [
      'ID',
      'Title',
      'Type',
      'Area',
      'Platform',
      'Priority',
      'Status',
      'Owner',
      'Sprint',
      'Planned Dev Start',
      'Planned Dev End',
      'Actual Dev Start',
      'Actual Dev End',
    ];

    const rows = workItems.map((item) => [
      item.id,
      `"${item.title.replace(/"/g, '""')}"`,
      item.type,
      `"${item.productArea.join(', ')}"`,
      `"${item.platform.join(', ')}"`,
      item.priority,
      item.status,
      `"${item.owner?.name || ''}"`,
      item.sprintId || '',
      item.dates.plannedDevStart || '',
      item.dates.plannedDevEnd || '',
      item.dates.actualDevStart || '',
      item.dates.actualDevEnd || '',
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  };

  const handleDownloadCsv = () => {
    const csvData = generateCsv();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ProductRail_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyCsv = () => {
    const csvData = generateCsv();
    navigator.clipboard.writeText(csvData);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleParseAndImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;

    try {
      const lines = importText.trim().split('\n');
      const newItems: WorkItem[] = [];
      const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

      lines.forEach((line, idx) => {
        if (idx === 0 && line.toLowerCase().includes('title')) return; // skip header
        const parts = line.split(',');
        if (parts.length >= 2) {
          const title = parts[1]?.replace(/^"|"$/g, '').trim() || parts[0]?.trim();
          const type = parts[2]?.trim() || 'Feature';
          const area = parts[3]?.trim() || 'Bus';
          const id = `WK-${Date.now().toString().slice(-4)}${idx}`;

          newItems.push({
            id,
            title,
            type,
            source: 'Import',
            productArea: [area],
            platform: ['Web'],
            priority: 'Medium',
            status: 'Backlog',
            reporter: { name: 'CSV Importer', role: 'System' },
            team: 'Core Engineering',
            designRequired: false,
            dates: {},
            createdAt: now,
            updatedAt: now,
          });
        }
      });

      if (newItems.length > 0) {
        importWorkItems(newItems);
        setImportText('');
        onClose();
      }
    } catch (err) {
      alert('Error parsing CSV format. Please verify columns.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="w-full max-w-2xl bg-[#0c1017] border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-blue-400" />
            <h2 className="text-sm font-bold text-white">Import &amp; Export Data</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-800 bg-[#0a0d14] text-xs">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2.5 font-semibold text-center transition-colors border-b-2 ${
              activeTab === 'export'
                ? 'border-blue-500 text-blue-400 bg-slate-900/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Export (CSV / Printable Report)
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2.5 font-semibold text-center transition-colors border-b-2 ${
              activeTab === 'import'
                ? 'border-blue-500 text-blue-400 bg-slate-900/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Import (Paste Spreadsheet Data)
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'export' ? (
            <div className="space-y-4">
              <p className="text-slate-400">
                Export all {workItems.length} Worksheet items, planning dates, and test summaries for stakeholders or offline analysis.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadCsv}
                  className="p-4 bg-slate-900 hover:bg-slate-850 rounded-xl border border-slate-700/80 flex flex-col items-center justify-center gap-2 text-slate-200 font-semibold transition-colors"
                >
                  <Download size={22} className="text-blue-400" />
                  <span>Download .CSV File</span>
                  <span className="text-[10px] text-slate-500 font-normal">Excel &amp; Google Sheets ready</span>
                </button>

                <button
                  onClick={handleCopyCsv}
                  className="p-4 bg-slate-900 hover:bg-slate-850 rounded-xl border border-slate-700/80 flex flex-col items-center justify-center gap-2 text-slate-200 font-semibold transition-colors"
                >
                  <Copy size={22} className="text-emerald-400" />
                  <span>{copySuccess ? 'Copied to Clipboard!' : 'Copy CSV Text'}</span>
                  <span className="text-[10px] text-slate-500 font-normal">Paste directly into any spreadsheet</span>
                </button>
              </div>

              {/* Printable Stakeholder Report Preview (Section 73) */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-300 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <FileText size={14} className="text-indigo-400" />
                    <span>Executive Delivery Summary Preview</span>
                  </span>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1 text-[11px] text-blue-400 hover:underline"
                  >
                    <Printer size={12} />
                    <span>Print PDF View</span>
                  </button>
                </div>
                <div className="text-[11px] text-slate-400 font-mono space-y-1 bg-slate-900/60 p-3 rounded border border-slate-800/80">
                  <div>ORGANIZATION: bdtickets | CYCLE: Sprint 24 (Oct 08 - Oct 21, 2026)</div>
                  <div>TOTAL WORK ITEMS: {workItems.length} | READY FOR RELEASE: {workItems.filter((w) => w.status === 'Ready for Release').length}</div>
                  <div>QA PASS RATE: 92% | BUSINESS UAT PASS RATE: 100%</div>
                  <div>UPCOMING RELEASE: v2.14 targeting 20 Oct 2026</div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleParseAndImport} className="space-y-4">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Paste CSV / Tab-Delimited Data
                </label>
                <textarea
                  rows={8}
                  placeholder={`Title,Type,Area\nSeat map dynamic pricing,Feature,Bus\nLaunch cabin SMS alert,Bug,Ship\nPayment OTP timeout,Bug,Bus`}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
                >
                  Parse &amp; Import to Worksheet
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
