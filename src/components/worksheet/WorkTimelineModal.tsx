import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Zap,
  CheckSquare,
  Rocket,
  Code2,
  CalendarDays,
} from 'lucide-react';
import { WorkItem, WorkDates } from '../../types';
import { WorkTypeIcon } from '../common/Icons';

interface WorkTimelineModalProps {
  workId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WorkTimelineModal: React.FC<WorkTimelineModalProps> = ({
  workId,
  isOpen,
  onClose,
}) => {
  const { workItems, updateWorkItem, sprints } = useApp();

  const item = workItems.find((w) => w.id === workId);

  // Planned dates state
  const [plannedDevStart, setPlannedDevStart] = useState('');
  const [plannedDevEnd, setPlannedDevEnd] = useState('');
  const [plannedQaStart, setPlannedQaStart] = useState('');
  const [plannedQaEnd, setPlannedQaEnd] = useState('');
  const [plannedUatStart, setPlannedUatStart] = useState('');
  const [plannedUatEnd, setPlannedUatEnd] = useState('');
  const [plannedRelease, setPlannedRelease] = useState('');

  // Actual dates state
  const [actualDevStart, setActualDevStart] = useState('');
  const [actualDevEnd, setActualDevEnd] = useState('');
  const [actualQaStart, setActualQaStart] = useState('');
  const [actualQaEnd, setActualQaEnd] = useState('');
  const [actualUatStart, setActualUatStart] = useState('');
  const [actualUatEnd, setActualUatEnd] = useState('');
  const [actualRelease, setActualRelease] = useState('');

  const [savedToast, setSavedToast] = useState(false);
  const [showActuals, setShowActuals] = useState(false);

  useEffect(() => {
    if (item?.dates) {
      setPlannedDevStart(item.dates.plannedDevStart || '');
      setPlannedDevEnd(item.dates.plannedDevEnd || '');
      setPlannedQaStart(item.dates.plannedQaStart || '');
      setPlannedQaEnd(item.dates.plannedQaEnd || '');
      setPlannedUatStart(item.dates.plannedUatStart || '');
      setPlannedUatEnd(item.dates.plannedUatEnd || '');
      setPlannedRelease(item.dates.plannedRelease || '');

      setActualDevStart(item.dates.actualDevStart || '');
      setActualDevEnd(item.dates.actualDevEnd || '');
      setActualQaStart(item.dates.actualQaStart || '');
      setActualQaEnd(item.dates.actualQaEnd || '');
      setActualUatStart(item.dates.actualUatStart || '');
      setActualUatEnd(item.dates.actualUatEnd || '');
      setActualRelease(item.dates.actualRelease || '');
    }
  }, [item?.id, item?.dates]);

  if (!isOpen || !item) return null;

  // Helper date add
  const addDays = (dateStr: string, days: number): string => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  // Preset 1: Standard 2-week cycle from starting date
  const applyStandardCycle = (startDateStr: string = '2026-10-08') => {
    const devStart = startDateStr;
    const devEnd = addDays(devStart, 6); // 7 days dev
    const qaStart = addDays(devEnd, 1);
    const qaEnd = addDays(qaStart, 3); // 4 days QA
    const uatStart = addDays(qaEnd, 1);
    const uatEnd = addDays(uatStart, 3); // 4 days UAT
    const release = addDays(uatEnd, 1);

    setPlannedDevStart(devStart);
    setPlannedDevEnd(devEnd);
    setPlannedQaStart(qaStart);
    setPlannedQaEnd(qaEnd);
    setPlannedUatStart(uatStart);
    setPlannedUatEnd(uatEnd);
    setPlannedRelease(release);
  };

  // Preset 2: Fast-track Hotfix (3-4 days total)
  const applyHotfixCycle = (startDateStr: string = '2026-10-10') => {
    const devStart = startDateStr;
    const devEnd = addDays(devStart, 1);
    const qaStart = addDays(devEnd, 1);
    const qaEnd = qaStart;
    const uatStart = addDays(qaEnd, 1);
    const uatEnd = uatStart;
    const release = addDays(uatEnd, 1);

    setPlannedDevStart(devStart);
    setPlannedDevEnd(devEnd);
    setPlannedQaStart(qaStart);
    setPlannedQaEnd(qaEnd);
    setPlannedUatStart(uatStart);
    setPlannedUatEnd(uatEnd);
    setPlannedRelease(release);
  };

  // Preset 3: Match Assigned Sprint
  const applySprintDates = () => {
    const sp = sprints.find((s) => s.id === item.sprintId) || sprints.find((s) => s.status === 'Active') || sprints[0];
    if (sp) {
      applyStandardCycle(sp.startDate);
    }
  };

  // Sequence validation check
  const getValidationWarning = (): string | null => {
    if (plannedDevEnd && plannedQaStart && plannedQaStart < plannedDevEnd) {
      return 'Warning: QA Start Date is before Dev End Date.';
    }
    if (plannedQaEnd && plannedUatStart && plannedUatStart < plannedQaEnd) {
      return 'Warning: UAT Start Date is before QA End Date.';
    }
    if (plannedUatEnd && plannedRelease && plannedRelease < plannedUatEnd) {
      return 'Warning: Target Release Date is before UAT End Date.';
    }
    return null;
  };

  const warning = getValidationWarning();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedDates: WorkDates = {
      ...item.dates,
      plannedDevStart: plannedDevStart || undefined,
      plannedDevEnd: plannedDevEnd || undefined,
      plannedQaStart: plannedQaStart || undefined,
      plannedQaEnd: plannedQaEnd || undefined,
      plannedUatStart: plannedUatStart || undefined,
      plannedUatEnd: plannedUatEnd || undefined,
      plannedRelease: plannedRelease || undefined,
      actualDevStart: actualDevStart || undefined,
      actualDevEnd: actualDevEnd || undefined,
      actualQaStart: actualQaStart || undefined,
      actualQaEnd: actualQaEnd || undefined,
      actualUatStart: actualUatStart || undefined,
      actualUatEnd: actualUatEnd || undefined,
      actualRelease: actualRelease || undefined,
    };

    updateWorkItem(item.id, {
      dates: updatedDates,
    });

    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-100 font-sans">
      <div className="w-full max-w-2xl bg-[#0C1017] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-white/[0.08] bg-[#0E121A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Calendar size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <WorkTypeIcon type={item.type} size={14} />
                <span className="font-mono text-xs font-bold text-slate-300">{item.id}</span>
                <span className="text-slate-500">·</span>
                <span className="text-xs font-bold text-white truncate max-w-[280px]">
                  {item.title}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Configure delivery timelines: Dev End, QA window, UAT window, and Target Release.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Quick Presets Toolbar */}
          <div className="p-3 bg-[#111624] border border-blue-500/20 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span className="font-semibold flex items-center gap-1.5 text-blue-300">
                <Sparkles size={12} className="text-amber-400" />
                <span>Quick PM Delivery Presets</span>
              </span>
              <span className="text-slate-500">1-click auto-distribute dates</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyStandardCycle(plannedDevStart || '2026-10-08')}
                className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 border border-blue-500/30 font-medium transition-colors cursor-pointer"
              >
                Standard 2-Week Sprint Track
              </button>
              <button
                type="button"
                onClick={() => applyHotfixCycle(plannedDevStart || '2026-10-10')}
                className="px-2.5 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-200 border border-amber-500/30 font-medium transition-colors cursor-pointer"
              >
                Fast-track / Hotfix Track (3-4 Days)
              </button>
              <button
                type="button"
                onClick={applySprintDates}
                className="px-2.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/30 font-medium transition-colors cursor-pointer"
              >
                Align with Active Sprint
              </button>
            </div>
          </div>

          {/* Interactive Pipeline Visual Preview */}
          <div className="p-4 bg-black/40 border border-white/[0.06] rounded-xl space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Timeline Pipeline Visual
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
              {/* Development */}
              <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-500/40 text-blue-300 space-y-1">
                <div className="flex items-center justify-center gap-1 font-bold">
                  <Code2 size={12} />
                  <span>Development</span>
                </div>
                <div className="font-mono text-slate-200">
                  {plannedDevStart || '—'} → {plannedDevEnd || '—'}
                </div>
                <div className="text-[9px] text-blue-400 font-semibold uppercase">
                  Dev End: {plannedDevEnd || 'Not set'}
                </div>
              </div>

              {/* QA Verification */}
              <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 space-y-1">
                <div className="flex items-center justify-center gap-1 font-bold">
                  <Zap size={12} />
                  <span>QA Verification</span>
                </div>
                <div className="font-mono text-slate-200">
                  {plannedQaStart || '—'} → {plannedQaEnd || '—'}
                </div>
                <div className="text-[9px] text-cyan-400 font-semibold uppercase">
                  QA Window: {plannedQaStart && plannedQaEnd ? `${plannedQaStart} to ${plannedQaEnd}` : 'Not set'}
                </div>
              </div>

              {/* Business UAT */}
              <div className="p-2.5 rounded-lg bg-teal-950/40 border border-teal-500/40 text-teal-300 space-y-1">
                <div className="flex items-center justify-center gap-1 font-bold">
                  <CheckSquare size={12} />
                  <span>Business UAT</span>
                </div>
                <div className="font-mono text-slate-200">
                  {plannedUatStart || '—'} → {plannedUatEnd || '—'}
                </div>
                <div className="text-[9px] text-teal-400 font-semibold uppercase">
                  UAT Window: {plannedUatStart && plannedUatEnd ? `${plannedUatStart} to ${plannedUatEnd}` : 'Not set'}
                </div>
              </div>

              {/* Release */}
              <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/40 text-indigo-300 space-y-1">
                <div className="flex items-center justify-center gap-1 font-bold">
                  <Rocket size={12} />
                  <span>Deployment</span>
                </div>
                <div className="font-mono text-slate-200">
                  {plannedRelease || '—'}
                </div>
                <div className="text-[9px] text-indigo-400 font-semibold uppercase">
                  Release: {plannedRelease || 'Not set'}
                </div>
              </div>
            </div>
          </div>

          {/* Validation warning if out of order */}
          {warning && (
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0 text-amber-400" />
              <span>{warning}</span>
            </div>
          )}

          {/* Planned Dates Inputs Form */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CalendarDays size={14} className="text-blue-400" />
              <span>Planned Delivery Schedule (PM / Lead)</span>
            </h4>

            {/* Development Stage */}
            <div className="p-3.5 rounded-xl bg-[#0F1420] border border-white/[0.08] space-y-2.5">
              <div className="flex items-center justify-between text-blue-300 font-semibold text-xs">
                <span className="flex items-center gap-1.5">
                  <Code2 size={13} />
                  <span>1. Engineering &amp; Development Phase</span>
                </span>
                <span className="text-[10px] text-slate-400">Includes code complete &amp; unit tests</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Planned Dev Start</label>
                  <input
                    type="date"
                    value={plannedDevStart}
                    onChange={(e) => setPlannedDevStart(e.target.value)}
                    className="w-full bg-[#141B2B] border border-white/[0.12] rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-bold text-blue-300">
                    Planned Dev End (Dev Cutoff) *
                  </label>
                  <input
                    type="date"
                    value={plannedDevEnd}
                    onChange={(e) => setPlannedDevEnd(e.target.value)}
                    className="w-full bg-[#141B2B] border border-blue-500/50 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* QA Stage */}
            <div className="p-3.5 rounded-xl bg-[#0F1420] border border-white/[0.08] space-y-2.5">
              <div className="flex items-center justify-between text-cyan-300 font-semibold text-xs">
                <span className="flex items-center gap-1.5">
                  <Zap size={13} />
                  <span>2. QA Verification Phase</span>
                </span>
                <span className="text-[10px] text-slate-400">Test scenario execution &amp; defect checks</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-bold text-cyan-300">
                    Planned QA Start Date *
                  </label>
                  <input
                    type="date"
                    value={plannedQaStart}
                    onChange={(e) => setPlannedQaStart(e.target.value)}
                    className="w-full bg-[#141B2B] border border-cyan-500/50 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-bold text-cyan-300">
                    Planned QA End Date (Freeze) *
                  </label>
                  <input
                    type="date"
                    value={plannedQaEnd}
                    onChange={(e) => setPlannedQaEnd(e.target.value)}
                    className="w-full bg-[#141B2B] border border-cyan-500/50 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Business UAT Stage */}
            <div className="p-3.5 rounded-xl bg-[#0F1420] border border-white/[0.08] space-y-2.5">
              <div className="flex items-center justify-between text-teal-300 font-semibold text-xs">
                <span className="flex items-center gap-1.5">
                  <CheckSquare size={13} />
                  <span>3. Business UAT Acceptance Phase</span>
                </span>
                <span className="text-[10px] text-slate-400">Operations &amp; business stakeholder review</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-bold text-teal-300">
                    Planned UAT Start Date *
                  </label>
                  <input
                    type="date"
                    value={plannedUatStart}
                    onChange={(e) => setPlannedUatStart(e.target.value)}
                    className="w-full bg-[#141B2B] border border-teal-500/50 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-bold text-teal-300">
                    Planned UAT End Date (Signoff) *
                  </label>
                  <input
                    type="date"
                    value={plannedUatEnd}
                    onChange={(e) => setPlannedUatEnd(e.target.value)}
                    className="w-full bg-[#141B2B] border border-teal-500/50 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Target Release */}
            <div className="p-3.5 rounded-xl bg-[#0F1420] border border-white/[0.08] space-y-2.5">
              <div className="flex items-center justify-between text-indigo-300 font-semibold text-xs">
                <span className="flex items-center gap-1.5">
                  <Rocket size={13} />
                  <span>4. Target Production Release</span>
                </span>
                <span className="text-[10px] text-slate-400">Live deployment date</span>
              </div>
              <div>
                <label className="text-slate-400 block mb-1 font-bold text-indigo-300">
                  Planned Release Date *
                </label>
                <input
                  type="date"
                  value={plannedRelease}
                  onChange={(e) => setPlannedRelease(e.target.value)}
                  className="w-full bg-[#141B2B] border border-indigo-500/50 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Toggle for Actual Timestamps */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowActuals(!showActuals)}
              className="text-[11px] text-slate-400 hover:text-slate-200 underline font-medium cursor-pointer"
            >
              {showActuals ? '— Hide Actual Recorded Timestamps' : '+ Show Actual Execution Timestamps'}
            </button>

            {showActuals && (
              <div className="mt-3 p-4 bg-black/40 border border-white/[0.08] rounded-xl space-y-3">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  Actual Recorded Timestamps
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Actual Dev End</label>
                    <input
                      type="date"
                      value={actualDevEnd}
                      onChange={(e) => setActualDevEnd(e.target.value)}
                      className="w-full bg-[#121622] border border-white/[0.1] rounded-lg p-2 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Actual QA End</label>
                    <input
                      type="date"
                      value={actualQaEnd}
                      onChange={(e) => setActualQaEnd(e.target.value)}
                      className="w-full bg-[#121622] border border-white/[0.1] rounded-lg p-2 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Actual UAT End</label>
                    <input
                      type="date"
                      value={actualUatEnd}
                      onChange={(e) => setActualUatEnd(e.target.value)}
                      className="w-full bg-[#121622] border border-white/[0.1] rounded-lg p-2 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Actual Release</label>
                    <input
                      type="date"
                      value={actualRelease}
                      onChange={(e) => setActualRelease(e.target.value)}
                      className="w-full bg-[#121622] border border-white/[0.1] rounded-lg p-2 text-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
            {savedToast ? (
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs animate-fade-in">
                <CheckCircle2 size={14} />
                <span>Task Timelines Updated!</span>
              </div>
            ) : (
              <div className="text-slate-500 text-[11px]">
                Changes will reflect instantly across Board, Gantt, and Inspector.
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-white font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Save Timelines</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
