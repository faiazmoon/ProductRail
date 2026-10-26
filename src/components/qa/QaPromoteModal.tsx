import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkItem, QaTestCase } from '../../types';
import {
  X,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  User,
  Calendar,
  FileText,
  Sparkles,
  Layers,
} from 'lucide-react';

interface QaPromoteModalProps {
  work: WorkItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const QaPromoteModal: React.FC<QaPromoteModalProps> = ({
  work,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { promoteQaToUat, currentUser } = useApp();

  const qaCases = work.qaCases || [];
  const passedCases = qaCases.filter((c) => c.result === 'Pass');
  const failedCases = qaCases.filter((c) => c.result === 'Fail');

  // Pre-select all passed cases, or all cases if none failed
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>(
    passedCases.length > 0 ? passedCases.map((c) => c.id) : qaCases.map((c) => c.id)
  );

  const [signOffNotes, setSignOffNotes] = useState(
    `QA verification completed on ${new Date().toISOString().slice(0, 10)}. Core functionality and criteria verified without blocker defects. Ready for Business UAT.`
  );

  const [markReadyForUat, setMarkReadyForUat] = useState(true);

  if (!isOpen) return null;

  const toggleSelectCase = (id: string) => {
    setSelectedCaseIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedCaseIds.length === qaCases.length) {
      setSelectedCaseIds([]);
    } else {
      setSelectedCaseIds(qaCases.map((c) => c.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCaseIds.length === 0) return;

    promoteQaToUat(work.id, {
      selectedCaseIds,
      signOffNotes: signOffNotes.trim(),
      markReadyForUat,
    });

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#0c1017] border border-teal-800/80 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100 font-sans">
        {/* Header */}
        <div className="px-5 py-4 bg-[#0e1420] border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  QA Verification Sign-Off &amp; UAT Promotion
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 font-semibold">
                  {work.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Handoff verified technical test scenarios to Business Acceptance (UAT)
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Work Summary Banner */}
          <div className="p-3.5 bg-black/50 border border-white/[0.08] rounded-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-white">{work.title}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {work.productArea.join(', ')} · {work.platform.join(', ')} · Owner: {work.owner?.name || 'Assigned Dev'}
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                {passedCases.length}/{qaCases.length} Passed
              </span>
              {failedCases.length > 0 && (
                <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                  {failedCases.length} Failed
                </span>
              )}
            </div>
          </div>

          {/* Failure Warning if any cases are marked Fail */}
          {failedCases.length > 0 && (
            <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl flex items-start gap-2.5 text-amber-300">
              <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-400" />
              <div>
                <strong className="block font-semibold">Unresolved Failures Detected</strong>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  This work item contains {failedCases.length} failing test scenario(s). You can choose to promote only passed scenarios, or ensure all critical defects are resolved before business acceptance.
                </p>
              </div>
            </div>
          )}

          {/* Scenarios to promote */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span>Select Scenarios to Hand Off to UAT ({selectedCaseIds.length}/{qaCases.length})</span>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-teal-400 hover:text-teal-300 text-[11px] cursor-pointer"
              >
                {selectedCaseIds.length === qaCases.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="divide-y divide-white/[0.06] border border-white/[0.08] rounded-xl overflow-hidden bg-black/40 max-h-48 overflow-y-auto">
              {qaCases.map((tc) => {
                const isChecked = selectedCaseIds.includes(tc.id);
                return (
                  <div
                    key={tc.id}
                    onClick={() => toggleSelectCase(tc.id)}
                    className={`p-3 flex items-start gap-3 cursor-pointer transition-colors ${
                      isChecked ? 'bg-teal-500/[0.04]' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 rounded border-slate-700 text-teal-500 focus:ring-0 cursor-pointer"
                    />

                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400 font-bold text-[11px]">{tc.id}</span>
                        <span className="text-white font-medium">{tc.scenario}</span>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        <strong>Expected:</strong> {tc.expected}
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        tc.result === 'Pass'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : tc.result === 'Fail'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {tc.result}
                    </span>
                  </div>
                );
              })}

              {qaCases.length === 0 && (
                <div className="p-4 text-center text-slate-500 text-xs">
                  No QA test cases defined yet. Use Bulk Add or Generate from Acceptance Criteria first.
                </div>
              )}
            </div>
          </div>

          {/* QA Sign-off Notes */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-semibold">
              QA Sign-off Statement &amp; Handoff Notes
            </label>
            <textarea
              value={signOffNotes}
              onChange={(e) => setSignOffNotes(e.target.value)}
              rows={3}
              placeholder="State test scope, build/version verified, environment, and remarks for business reviewers..."
              className="w-full bg-black/60 border border-white/[0.1] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          {/* Signer Info & Readiness Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-950/60 border border-white/[0.08] rounded-xl">
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 block font-semibold">Signing QA Lead / Tester:</span>
              <div className="flex items-center gap-2 text-white font-medium">
                <User size={14} className="text-teal-400" />
                <span>{currentUser.name}</span>
                <span className="text-slate-500 text-[11px]">({currentUser.role})</span>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                <input
                  type="checkbox"
                  checked={markReadyForUat}
                  onChange={(e) => setMarkReadyForUat(e.target.checked)}
                  className="rounded border-slate-700 text-teal-500 focus:ring-0 cursor-pointer"
                />
                <span className="font-semibold text-xs">Update status to 'Ready for UAT'</span>
              </label>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={selectedCaseIds.length === 0}
              className="px-5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-teal-950 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ShieldCheck size={14} />
              <span>Promote {selectedCaseIds.length} Scenarios to UAT</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
