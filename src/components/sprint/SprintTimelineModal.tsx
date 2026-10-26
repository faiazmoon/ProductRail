import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  X,
  Check,
  Zap,
  CheckSquare,
  Rocket,
  FileCode,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Sprint } from '../../types';

interface SprintTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  sprintId?: string;
}

export const SprintTimelineModal: React.FC<SprintTimelineModalProps> = ({
  isOpen,
  onClose,
  sprintId = 'SP-24',
}) => {
  const { sprints, updateSprint, updateSprintMilestones, workItems } = useApp();

  const sprint = sprints.find((s) => s.id === sprintId) || sprints[0];

  const [startDate, setStartDate] = useState(sprint?.startDate || '2026-10-08');
  const [endDate, setEndDate] = useState(sprint?.endDate || '2026-10-21');
  const [devCutoff, setDevCutoff] = useState(
    sprint?.milestones?.devCutoffDate || '2026-10-14'
  );
  const [qaFreeze, setQaFreeze] = useState(
    sprint?.milestones?.qaFreezeDate || '2026-10-17'
  );
  const [uatStart, setUatStart] = useState(
    sprint?.milestones?.uatWindowStart || '2026-10-18'
  );
  const [uatEnd, setUatEnd] = useState(
    sprint?.milestones?.uatWindowEnd || '2026-10-20'
  );
  const [releaseTarget, setReleaseTarget] = useState(
    sprint?.milestones?.releaseTargetDate || '2026-10-21'
  );
  const [capacityPoints, setCapacityPoints] = useState(
    sprint?.capacityPoints || 48
  );

  if (!isOpen || !sprint) return null;

  // Calculate duration in days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const calculatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 14;
  const workingDays = Math.max(1, Math.round(calculatedDays * (5 / 7)));

  // Committed points in sprint
  const sprintItems = workItems.filter((w) => w.sprintId === sprint.id);
  const totalCommittedPoints = sprintItems.reduce((acc, w) => {
    const pts = parseInt(w.estimate?.replace(/\D/g, '') || '0', 10);
    return acc + (isNaN(pts) ? 0 : pts);
  }, 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    updateSprint(sprint.id, {
      startDate,
      endDate,
      durationDays: calculatedDays,
      workingDays,
      capacityPoints,
    });

    updateSprintMilestones(sprint.id, {
      devCutoffDate: devCutoff,
      qaFreezeDate: qaFreeze,
      uatWindowStart: uatStart,
      uatWindowEnd: uatEnd,
      releaseTargetDate: releaseTarget,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="w-full max-w-2xl bg-[#0C1017] border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[#0E121A] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Define Sprint Timelines &amp; Delivery Milestones
              </h2>
              <p className="text-xs text-slate-400">
                Configure cadence, phase handoff cutoffs, QA freeze, and UAT acceptance windows for {sprint.name}.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 text-xs font-sans">
          {/* Visual Cadence Bar */}
          <div className="p-4 bg-black/40 rounded-xl border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">
                Phase Cadence Bar (Oct 08 – Oct 21)
              </span>
              <span className="text-[11px] font-mono text-amber-400">
                {calculatedDays} Days ({workingDays} Working Days)
              </span>
            </div>

            {/* Segmented Phase Bar */}
            <div className="h-4 rounded-full overflow-hidden flex text-[10px] font-bold text-black border border-white/[0.08]">
              <div
                style={{ width: '45%' }}
                className="bg-blue-400 flex items-center justify-center truncate px-1"
                title="Dev Phase: Oct 08 - Oct 14"
              >
                Dev (6d)
              </div>
              <div
                style={{ width: '25%' }}
                className="bg-cyan-300 flex items-center justify-center truncate px-1"
                title="QA Phase: Oct 14 - Oct 17"
              >
                QA (3d)
              </div>
              <div
                style={{ width: '20%' }}
                className="bg-teal-300 flex items-center justify-center truncate px-1"
                title="UAT Window: Oct 18 - Oct 20"
              >
                UAT (3d)
              </div>
              <div
                style={{ width: '10%' }}
                className="bg-indigo-400 flex items-center justify-center truncate px-1 text-white"
                title="Release: Oct 21"
              >
                Rel
              </div>
            </div>

            {/* Capacity vs Commitment */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
              <span>
                Committed Work: <strong className="text-white">{sprintItems.length} items</strong> ({totalCommittedPoints} pts)
              </span>
              <span>
                Target Capacity: <strong className="text-white">{capacityPoints} pts</strong>
              </span>
            </div>
          </div>

          {/* Sprint Date Ranges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Sprint Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full bg-[#121620] border border-white/[0.1] rounded-md px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Sprint End Date *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full bg-[#121620] border border-white/[0.1] rounded-md px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Phase Handoff Milestones */}
          <div className="space-y-3 pt-2 border-t border-white/[0.08]">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Info size={14} className="text-blue-400" />
              <span>Phase Handoff Dates &amp; Freezes</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 block mb-1 flex items-center gap-1">
                  <FileCode size={12} className="text-blue-400" />
                  <span>Development Cutoff Date (QA Ready)</span>
                </label>
                <input
                  type="date"
                  value={devCutoff}
                  onChange={(e) => setDevCutoff(e.target.value)}
                  className="w-full bg-[#121620] border border-white/[0.1] rounded-md px-3 py-2 text-white font-mono text-xs"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Developers must mark all deliverables QA Ready.
                </span>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 flex items-center gap-1">
                  <Zap size={12} className="text-cyan-400" />
                  <span>QA Freeze Date (UAT Ready)</span>
                </label>
                <input
                  type="date"
                  value={qaFreeze}
                  onChange={(e) => setQaFreeze(e.target.value)}
                  className="w-full bg-[#121620] border border-white/[0.1] rounded-md px-3 py-2 text-white font-mono text-xs"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  QA marks items UAT Ready to qualify features for UAT.
                </span>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 flex items-center gap-1">
                  <CheckSquare size={12} className="text-teal-400" />
                  <span>UAT Window Window (Start → End)</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={uatStart}
                    onChange={(e) => setUatStart(e.target.value)}
                    className="w-full bg-[#121620] border border-white/[0.1] rounded-md px-2 py-2 text-white font-mono text-[11px]"
                  />
                  <span className="text-slate-500">→</span>
                  <input
                    type="date"
                    value={uatEnd}
                    onChange={(e) => setUatEnd(e.target.value)}
                    className="w-full bg-[#121620] border border-white/[0.1] rounded-md px-2 py-2 text-white font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 flex items-center gap-1">
                  <Rocket size={12} className="text-indigo-400" />
                  <span>Target Production Release Date</span>
                </label>
                <input
                  type="date"
                  value={releaseTarget}
                  onChange={(e) => setReleaseTarget(e.target.value)}
                  className="w-full bg-[#121620] border border-white/[0.1] rounded-md px-3 py-2 text-white font-mono text-xs"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Scheduled release version v2.14 deployment.
                </span>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold shadow-sm transition-colors"
            >
              Save Sprint Timelines
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
