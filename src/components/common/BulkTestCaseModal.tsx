import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkItem } from '../../types';
import {
  X,
  Sparkles,
  ClipboardPaste,
  Table,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  Info,
} from 'lucide-react';

interface BulkTestCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  work: WorkItem;
  mode: 'QA' | 'UAT';
  initialTab?: 'paste' | 'grid' | 'ac';
  onSuccess?: () => void;
}

interface ParsedCase {
  id: string;
  scenario: string;
  expected: string;
  selected?: boolean;
}

export const BulkTestCaseModal: React.FC<BulkTestCaseModalProps> = ({
  isOpen,
  onClose,
  work,
  mode,
  initialTab = 'paste',
  onSuccess,
}) => {
  const { addQaTestCasesBulk, addUatTestCasesBulk } = useApp();
  const [activeTab, setActiveTab] = useState<'paste' | 'grid' | 'ac'>(initialTab);

  // Raw paste area state
  const [rawText, setRawText] = useState('');
  // Editable cases state
  const [testCases, setTestCases] = useState<ParsedCase[]>([
    { id: '1', scenario: '', expected: '' },
  ]);

  // When opening or switching work item, sync initial tab
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      if (initialTab === 'ac' || (!work.qaCases?.length && work.acceptanceCriteria?.length)) {
        // can auto generate AC
      }
    }
  }, [isOpen, initialTab, work]);

  // Parse acceptance criteria from the work item
  const acCandidates = useMemo<ParsedCase[]>(() => {
    const list: ParsedCase[] = [];
    let counter = 1;

    // 1. From acceptanceCriteria array
    if (work.acceptanceCriteria && work.acceptanceCriteria.length > 0) {
      work.acceptanceCriteria.forEach((ac) => {
        const cleaned = ac.trim();
        if (cleaned) {
          list.push({
            id: `ac-${counter++}`,
            scenario: `Verify: ${cleaned.replace(/^[-*•\d.]+\s*/, '')}`,
            expected: cleaned.replace(/^[-*•\d.]+\s*/, ''),
            selected: true,
          });
        }
      });
    }

    // 2. From requirementDetails if empty or has lines
    if (list.length === 0 && work.requirementDetails) {
      const lines = work.requirementDetails
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 5);

      lines.forEach((line) => {
        // Check if looks like a bullet or requirement
        if (/^[-*•\d.]/.test(line) || line.toLowerCase().includes('should') || line.toLowerCase().includes('must')) {
          const content = line.replace(/^[-*•\d.]+\s*/, '');
          list.push({
            id: `req-${counter++}`,
            scenario: `Verify requirement: ${content}`,
            expected: content,
            selected: true,
          });
        }
      });
    }

    // Default fallback if no criteria found
    if (list.length === 0) {
      list.push({
        id: `fallback-1`,
        scenario: `Verify ${work.title} primary flow on ${work.platform.join(', ')}`,
        expected: `Successfully completes with expected outcome on ${work.productArea.join(', ')}`,
        selected: true,
      });
      list.push({
        id: `fallback-2`,
        scenario: `Verify error handling and edge cases for ${work.title}`,
        expected: `Graceful fallback with informative validation feedback`,
        selected: true,
      });
    }

    return list;
  }, [work]);

  const [acSelections, setAcSelections] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    const initial: { [id: string]: boolean } = {};
    acCandidates.forEach((c) => {
      initial[c.id] = true;
    });
    setAcSelections(initial);
  }, [acCandidates]);

  // Smart Parser for pasted text
  const parsePastedContent = (text: string): ParsedCase[] => {
    if (!text.trim()) return [];

    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const parsed: ParsedCase[] = [];

    lines.forEach((line, index) => {
      // Ignore header row if it looks like "Scenario \t Expected"
      if (
        index === 0 &&
        (line.toLowerCase().includes('scenario') || line.toLowerCase().includes('test case')) &&
        (line.toLowerCase().includes('expected') || line.toLowerCase().includes('outcome'))
      ) {
        return;
      }

      let scenario = '';
      let expected = '';

      if (line.includes('\t')) {
        // Tab-separated (Excel / Google Sheets)
        const parts = line.split('\t').map((p) => p.trim());
        scenario = parts[0] || '';
        expected = parts.slice(1).join(' - ') || 'Expected behavior matches requirement';
      } else if (line.includes('|')) {
        // Pipe-separated
        const parts = line.split('|').map((p) => p.trim()).filter(Boolean);
        scenario = parts[0] || '';
        expected = parts[1] || 'Expected behavior matches requirement';
      } else if (/^case\s*\d*[:.-]/i.test(line) || /^\d+[\).]\s*/.test(line)) {
        // Numbered item
        const cleaned = line.replace(/^\d+[\).]\s*/, '').replace(/^case\s*\d*[:.-]\s*/i, '');
        if (cleaned.includes('->') || cleaned.includes('=>')) {
          const parts = cleaned.split(/->|=>/).map((p) => p.trim());
          scenario = parts[0];
          expected = parts[1] || 'Verified functionality';
        } else {
          scenario = cleaned;
          expected = 'Verified functionality as expected';
        }
      } else {
        // Generic single line
        scenario = line.replace(/^[-*•]\s*/, '');
        expected = 'Verified functionality without regression';
      }

      if (scenario) {
        parsed.push({
          id: `case-${Date.now()}-${index}`,
          scenario,
          expected: expected || 'Verified functionality as expected',
        });
      }
    });

    return parsed;
  };

  const handleApplyPaste = () => {
    const parsed = parsePastedContent(rawText);
    if (parsed.length > 0) {
      setTestCases(parsed);
      setActiveTab('grid');
    }
  };

  const handleLoadSample = (sampleType: 'tsv' | 'gherkin' | 'pipe') => {
    if (sampleType === 'tsv') {
      const sample = `Verify promo code application\tBanner discounts booking total by 25% instantly\nVerify expired coupon behavior\tDisplays friendly error: "Promo expired" without charging\nVerify concurrent checkout lock\tSeat remains reserved for 10 minutes then auto-releases\nVerify payment failure rollback\tTicket status reverts to Pending and inventory is restored`;
      setRawText(sample);
    } else if (sampleType === 'gherkin') {
      const sample = `Given user selects seat on Hanif Enterprise -> When payment succeeds -> Then booking confirmed\nGiven user applies invalid coupon code -> When clicking apply -> Then error displayed\nGiven network drops during seat lock -> When reconnected -> Then session state preserved`;
      setRawText(sample);
    } else {
      const sample = `Check OTP delivery via SMS | SMS received within 15 seconds with 6-digit code\nCheck OTP retry rate limiting | "Resend" button disabled for 60 seconds\nCheck 3 invalid attempts | Account locked for 15 minutes with security notification`;
      setRawText(sample);
    }
  };

  const handleAddGridRow = () => {
    setTestCases((prev) => [
      ...prev,
      { id: `case-${Date.now()}-${prev.length}`, scenario: '', expected: '' },
    ]);
  };

  const handleDuplicateRow = (index: number) => {
    const target = testCases[index];
    if (!target) return;
    const next = [...testCases];
    next.splice(index + 1, 0, {
      ...target,
      id: `case-${Date.now()}-${Math.random()}`,
      scenario: `${target.scenario} (Copy)`,
    });
    setTestCases(next);
  };

  const handleDeleteRow = (index: number) => {
    setTestCases((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateRow = (index: number, field: 'scenario' | 'expected', value: string) => {
    setTestCases((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleImportFromAC = () => {
    const selectedCases = acCandidates
      .filter((c) => acSelections[c.id])
      .map((c) => ({
        id: c.id,
        scenario: c.scenario,
        expected: c.expected,
      }));

    if (selectedCases.length === 0) return;
    setTestCases(selectedCases);
    setActiveTab('grid');
  };

  const handleFinalSubmit = () => {
    // Filter valid rows
    const validCases = testCases
      .map((c) => ({
        scenario: c.scenario.trim(),
        expected: c.expected.trim() || 'Verified functionality as expected',
      }))
      .filter((c) => c.scenario.length > 0);

    if (validCases.length === 0) return;

    if (mode === 'QA') {
      addQaTestCasesBulk(work.id, validCases);
    } else {
      addUatTestCasesBulk(work.id, validCases);
    }

    if (onSuccess) onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  const validRowCount = testCases.filter((c) => c.scenario.trim().length > 0).length;
  const parsedPreviewCount = parsePastedContent(rawText).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-[#0c1017] border border-cyan-900/60 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100 font-sans">
        {/* Header */}
        <div className="px-5 py-4 bg-[#0e1420] border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                mode === 'QA'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
              }`}
            >
              {mode === 'QA' ? <Table size={18} /> : <CheckCircle2 size={18} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Bulk {mode === 'QA' ? 'QA Test Scenarios' : 'Business UAT Scenarios'}
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/[0.06] text-slate-300 font-semibold">
                  {work.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                {work.title} · {work.productArea.join(', ')} · {work.platform.join(', ')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 py-2.5 bg-[#090d14] border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('paste')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'paste'
                  ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <ClipboardPaste size={14} />
              <span>Smart Paste &amp; Parse</span>
            </button>

            <button
              onClick={() => setActiveTab('grid')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'grid'
                  ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <Table size={14} />
              <span>Interactive Table ({testCases.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('ac')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'ac'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-white/[0.04]'
              }`}
            >
              <Sparkles size={14} className="text-amber-400" />
              <span>Generate from Acceptance Criteria ({acCandidates.length})</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            {validRowCount} ready to import into {mode}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: PASTE */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-950/70 border border-white/[0.08] rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-300 font-semibold">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <FileSpreadsheet size={15} />
                    <span>Paste Test Matrix from Spreadsheet / Notion / Jira / Text</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-slate-400">Try sample:</span>
                    <button
                      type="button"
                      onClick={() => handleLoadSample('tsv')}
                      className="px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 cursor-pointer"
                    >
                      TSV (Sheets)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadSample('pipe')}
                      className="px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 cursor-pointer"
                    >
                      Pipe (|)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadSample('gherkin')}
                      className="px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 cursor-pointer"
                    >
                      Given/When
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Copy rows from Excel or Google Sheets (Columns:{' '}
                  <strong className="text-slate-300 font-mono">Scenario [Tab] Expected Outcome</strong>
                  ), or enter one scenario per line. The parser will automatically format them.
                </p>
              </div>

              <div className="relative">
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`Paste spreadsheet rows or text here...\nExample:\nVerify OTP login\tUser receives SMS and enters dashboard\nVerify invalid phone\tError message displayed below input`}
                  rows={9}
                  className="w-full bg-[#080b11] border border-white/[0.12] rounded-xl p-3.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-600"
                />

                {rawText.trim() && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-black/80 border border-white/[0.1] text-[11px] font-mono text-cyan-300">
                      {parsedPreviewCount} cases detected
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">
                  Clicking parse will transfer scenarios to the editable table review.
                </span>
                <button
                  type="button"
                  onClick={handleApplyPaste}
                  disabled={parsedPreviewCount === 0}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-950 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Parse into Table ({parsedPreviewCount})</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE GRID */}
          {activeTab === 'grid' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <div className="text-slate-400">
                  Review and refine scenarios before importing into{' '}
                  <strong className="text-white">{mode} Workspace</strong>.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddGridRow}
                    className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Add Row</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestCases([{ id: '1', scenario: '', expected: '' }])}
                    className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white text-xs transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-[#090c13]">
                <div className="grid grid-cols-12 gap-2 p-3 bg-white/[0.03] border-b border-white/[0.06] text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  <div className="col-span-1 text-center">#</div>
                  <div className="col-span-6">Scenario Description *</div>
                  <div className="col-span-4">Expected Business Outcome</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>

                <div className="divide-y divide-white/[0.05] max-h-[46vh] overflow-y-auto">
                  {testCases.map((tc, index) => (
                    <div
                      key={tc.id || index}
                      className="grid grid-cols-12 gap-2 p-2.5 items-center hover:bg-white/[0.02] text-xs transition-colors"
                    >
                      <div className="col-span-1 text-center font-mono text-slate-500 text-[11px]">
                        {index + 1}
                      </div>

                      <div className="col-span-6">
                        <input
                          type="text"
                          value={tc.scenario}
                          onChange={(e) => handleUpdateRow(index, 'scenario', e.target.value)}
                          placeholder="e.g. Verify promo code applies 25% discount"
                          className="w-full bg-black/50 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      </div>

                      <div className="col-span-4">
                        <input
                          type="text"
                          value={tc.expected}
                          onChange={(e) => handleUpdateRow(index, 'expected', e.target.value)}
                          placeholder="e.g. Total updates in real-time"
                          className="w-full bg-black/50 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      </div>

                      <div className="col-span-1 flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleDuplicateRow(index)}
                          className="p-1 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                          title="Duplicate"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(index)}
                          disabled={testCases.length === 1}
                          className="p-1 text-slate-500 hover:text-rose-400 disabled:opacity-30 rounded transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GENERATE FROM ACCEPTANCE CRITERIA */}
          {activeTab === 'ac' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-950/20 border border-amber-500/30 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <Sparkles size={15} />
                  <span>Product Owner Requirements &amp; Acceptance Criteria</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  ProductRail extracted {acCandidates.length} verifiable criteria from{' '}
                  <strong className="text-white font-mono">{work.id}</strong> specifications. Select the
                  scenarios you want to test and import them directly.
                </p>
              </div>

              <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-[#090c13] divide-y divide-white/[0.06]">
                {acCandidates.map((cand, i) => {
                  const isChecked = !!acSelections[cand.id];
                  return (
                    <div
                      key={cand.id}
                      onClick={() =>
                        setAcSelections((prev) => ({ ...prev, [cand.id]: !prev[cand.id] }))
                      }
                      className={`p-3 flex items-start gap-3 cursor-pointer transition-colors ${
                        isChecked ? 'bg-amber-500/[0.04]' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-1 rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                      />
                      <div className="flex-1 space-y-1 text-xs">
                        <div className="font-semibold text-white flex items-center gap-2">
                          <span>{cand.scenario}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          <strong className="text-slate-300">Expected:</strong> {cand.expected}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-400">
                  {Object.values(acSelections).filter(Boolean).length} of {acCandidates.length} criteria selected
                </div>
                <button
                  type="button"
                  onClick={handleImportFromAC}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-950 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>Load Selected into Table</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#0e1420] border-t border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Info size={14} className="text-slate-500" />
            <span>
              Cases will be assigned sequential IDs (e.g.{' '}
              <strong className="font-mono text-slate-300">
                {mode === 'QA' ? 'TC-01' : `UAT-${work.id.replace('WK-', '')}-01`}
              </strong>
              )
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={validRowCount === 0}
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                mode === 'QA'
                  ? 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-950/50 disabled:opacity-50'
                  : 'bg-teal-600 hover:bg-teal-500 shadow-teal-950/50 disabled:opacity-50'
              }`}
            >
              <Check size={14} />
              <span>
                Add {validRowCount} Test Case{validRowCount === 1 ? '' : 's'} to {mode}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
