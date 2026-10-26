import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
} from 'lucide-react';
import { WorkItem, WorkType, PriorityLevel, WorkStatus } from '../../types';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose }) => {
  const { addWorkItem, currentUser, config } = useApp();

  const [dragActive, setDragActive] = useState(false);
  const [parsedItems, setParsedItems] = useState<Partial<WorkItem>[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Generates and downloads the Demo Template CSV / Excel file
  const handleDownloadDemoTemplate = () => {
    const csvHeader = 'Title,Type,ProductAreas,Platforms,Priority,SprintId,FigmaUrl,Estimate,RequirementDetails,Status\n';
    const sampleRows = [
      '"Dynamic Seat Selection Map","Feature","Bus; Flash Deals","Web; Android; iOS","High","SP-24","https://figma.com/file/seat-map-v2","5 pts","<p>Allow passengers to choose seats interactively from a live coach layout with real-time seat lock.</p>","In Development"',
      '"Fix Call Center Session Timeout","Bug","Bus","Call Center; Admin/CMS","Critical","SP-24","","2 pts","<p>Resolve socket reset when agents process phone cancellations under heavy load.</p>","To Do"',
      '"SMS Travel Pass Receipt Confirmation","CR","Ship; All","Mobile Web; Web","Medium","SP-25","https://figma.com/file/travel-pass-sms","3 pts","<p>Dispatch instant boarding pass SMS confirmation with deep link to QR code ticket.</p>","Backlog"',
      '"Payment Gateway Timeout Fallback Webhook","Technical","Checkout","Backend/System; API","High","SP-24","","3 pts","<p>Implement retry worker for asynchronous payment status callbacks.</p>","In Development"',
    ].join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvHeader + sampleRows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', 'ProductRail_Demo_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCsvText = (text: string) => {
    try {
      const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
      if (lines.length < 2) {
        setErrorMsg('File appears empty or does not contain data rows.');
        return;
      }

      // Simple CSV line parser respecting quotes
      const parseLine = (line: string): string[] => {
        const result: string[] = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              cur += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = '';
          } else {
            cur += char;
          }
        }
        result.push(cur.trim());
        return result;
      };

      const headers = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z]/g, ''));
      const items: Partial<WorkItem>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseLine(lines[i]);
        if (values.length < 2 || !values[0]) continue;

        const rowMap: Record<string, string> = {};
        headers.forEach((h, idx) => {
          rowMap[h] = values[idx] || '';
        });

        const title = rowMap['title'] || values[0];
        const type = (rowMap['type'] || 'Feature') as WorkType;
        const areasRaw = rowMap['productareas'] || rowMap['productarea'] || rowMap['areas'] || 'All';
        const platformsRaw = rowMap['platforms'] || rowMap['targetplatforms'] || rowMap['platform'] || 'Web';
        const priority = (rowMap['priority'] || 'Medium') as PriorityLevel;
        const sprintId = rowMap['sprintid'] || rowMap['sprint'] || undefined;
        const figmaUrl = rowMap['figmaurl'] || rowMap['figma'] || undefined;
        const estimate = rowMap['estimate'] || '3 pts';
        const requirementDetails = rowMap['requirementdetails'] || rowMap['requirements'] || rowMap['requirement'] || '';
        const status = (rowMap['status'] || (sprintId ? 'To Do' : 'Backlog')) as WorkStatus;

        const productArea = areasRaw.split(';').map((a) => a.trim()).filter(Boolean);
        const platform = platformsRaw.split(';').map((p) => p.trim()).filter(Boolean);

        items.push({
          title,
          type,
          productArea: productArea.length > 0 ? productArea : ['All'],
          platform: platform.length > 0 ? platform : ['Web'],
          priority,
          sprintId,
          figmaUrl,
          estimate,
          requirementDetails,
          status,
          designRequired: !!figmaUrl,
        });
      }

      if (items.length === 0) {
        setErrorMsg('Could not find valid rows in the CSV. Please check formatting.');
        setParsedItems([]);
      } else {
        setErrorMsg(null);
        setParsedItems(items);
      }
    } catch (err: any) {
      setErrorMsg(`Failed to parse file: ${err.message || 'Check CSV format'}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) parseCsvText(content);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) parseCsvText(content);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (parsedItems.length === 0) return;

    parsedItems.forEach((item) => {
      addWorkItem(item);
    });

    setSuccessMsg(`Successfully imported ${parsedItems.length} work items!`);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="w-full max-w-3xl bg-[#0D111A] border border-white/[0.12] rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto font-sans">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Bulk Import Work Items</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                  Excel &amp; CSV
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload your team’s spreadsheet or download our pre-filled template to get started instantly.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        {/* Step 1: Demo Template Download Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-[#101726] to-indigo-950/40 border border-blue-800/40 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" />
              <span>Need the standard template?</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Download our ready-to-fill demo template containing sample Features, Bugs, CRs, Figma links, and product areas.
            </p>
          </div>
          <button
            onClick={handleDownloadDemoTemplate}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-900/30 transition-all shrink-0 cursor-pointer"
          >
            <Download size={14} />
            <span>Download Demo Excel Template</span>
          </button>
        </div>

        {/* Step 2: Upload Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
            dragActive
              ? 'border-blue-500 bg-blue-950/30'
              : 'border-white/[0.12] bg-[#10141e] hover:border-slate-500 hover:bg-[#121724]'
          }`}
        >
          <input
            type="file"
            accept=".csv, .xlsx, .tsv, text/csv"
            id="bulkFileInput"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label htmlFor="bulkFileInput" className="cursor-pointer space-y-2 block">
            <Upload size={28} className="mx-auto text-blue-400" />
            <div className="text-xs font-bold text-white">
              Click to browse or drop your CSV/Excel file here
            </div>
            <div className="text-[11px] text-slate-400">
              Supports standard CSV and spreadsheet exports. Columns mapped automatically.
            </div>
          </label>
        </div>

        {/* Status feedback */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Step 3: Parsed Data Preview Table */}
        {parsedItems.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">
                Preview Rows to Import ({parsedItems.length} items ready)
              </span>
              <span className="text-[11px] text-slate-400">
                Verify titles, types, and areas before importing
              </span>
            </div>

            <div className="max-h-56 overflow-y-auto border border-white/[0.1] rounded-xl overflow-hidden bg-black/40 text-[11px]">
              <table className="w-full text-left">
                <thead className="bg-[#141926] text-slate-400 border-b border-white/[0.08] sticky top-0">
                  <tr>
                    <th className="p-2">Title</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">Areas</th>
                    <th className="p-2">Platforms</th>
                    <th className="p-2">Priority</th>
                    <th className="p-2">Sprint</th>
                    <th className="p-2">Figma</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-slate-300">
                  {parsedItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="p-2 font-medium text-white max-w-[200px] truncate">
                        {item.title}
                      </td>
                      <td className="p-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/[0.06] font-semibold">
                          {item.type}
                        </span>
                      </td>
                      <td className="p-2 truncate max-w-[120px] text-amber-300">
                        {item.productArea?.join(', ')}
                      </td>
                      <td className="p-2 truncate max-w-[120px] text-blue-300">
                        {item.platform?.join(', ')}
                      </td>
                      <td className="p-2 font-semibold">
                        {item.priority}
                      </td>
                      <td className="p-2 font-mono text-[10px] text-slate-400">
                        {item.sprintId || 'Backlog'}
                      </td>
                      <td className="p-2 text-pink-400 truncate max-w-[90px]">
                        {item.figmaUrl ? 'Yes' : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            {parsedItems.length > 0 && (
              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-colors"
              >
                Import {parsedItems.length} Work Items
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
