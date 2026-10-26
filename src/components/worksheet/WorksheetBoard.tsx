import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkItem, WorkStatus, PriorityLevel, WorkType } from '../../types';
import { WorkTypeIcon, PriorityIcon, StatusIndicator } from '../common/Icons';
import {
  User,
  Calendar,
  AlertTriangle,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Clock,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { WorkTimelineModal } from './WorkTimelineModal';

interface WorksheetBoardProps {
  items: WorkItem[];
  onOpenQuickAdd?: (initialStatus?: WorkStatus) => void;
}

interface ColumnConfig {
  status: WorkStatus;
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  accentColor: string;
}

export const WorksheetBoard: React.FC<WorksheetBoardProps> = ({ items, onOpenQuickAdd }) => {
  const {
    setSelectedWorkId,
    setIsInspectorOpen,
    updateWorkItem,
    currentRole,
  } = useApp();

  const [timelineModalWorkId, setTimelineModalWorkId] = useState<string | null>(null);
  const [mobileColumnStatus, setMobileColumnStatus] = useState<string>('To Do');

  const isDeveloper = currentRole === 'Developer';
  const isBusinessTeam = currentRole === 'Business' || currentRole === 'UAT';

  // Columns definition matching ClickUp 3.0 / modern Kanban anatomy
  const columns: ColumnConfig[] = [
    {
      status: 'To Do',
      label: 'OPEN',
      badgeBg: 'bg-slate-800/80',
      badgeText: 'text-slate-300',
      badgeBorder: 'border-slate-700/80',
      accentColor: 'border-slate-500',
    },
    {
      status: 'In Development',
      label: 'IN PROGRESS',
      badgeBg: 'bg-blue-600',
      badgeText: 'text-white',
      badgeBorder: 'border-blue-500',
      accentColor: 'border-blue-500',
    },
    {
      status: 'Ready for QA',
      label: 'TESTING (QA)',
      badgeBg: 'bg-purple-600',
      badgeText: 'text-white',
      badgeBorder: 'border-purple-500',
      accentColor: 'border-purple-500',
    },
    {
      status: 'Ready for UAT',
      label: 'UAT ACCEPTANCE',
      badgeBg: 'bg-teal-600',
      badgeText: 'text-white',
      badgeBorder: 'border-teal-500',
      accentColor: 'border-teal-500',
    },
    {
      status: 'Ready for Release',
      label: 'RELEASE READY',
      badgeBg: 'bg-emerald-600',
      badgeText: 'text-white',
      badgeBorder: 'border-emerald-500',
      accentColor: 'border-emerald-500',
    },
    {
      status: 'Released',
      label: 'DONE',
      badgeBg: 'bg-indigo-600',
      badgeText: 'text-white',
      badgeBorder: 'border-indigo-500',
      accentColor: 'border-indigo-500',
    },
  ];

  // Collapsed columns state (like the vertical blue "IN PROGRESS" tab in user's image!)
  const [collapsedCols, setCollapsedCols] = useState<Set<string>>(new Set());

  const toggleColumnCollapse = (status: string) => {
    setCollapsedCols((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  // Drag and Drop simulation
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedItemId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: WorkStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedItemId;
    if (!id) return;

    // Enforce role restrictions
    if (isBusinessTeam) {
      alert('Restricted: Business team cannot change work item status. Advance delivery via UAT acceptance.');
      setDraggedItemId(null);
      return;
    }

    if (isDeveloper && (targetStatus === 'Ready for UAT' || targetStatus === 'Ready for Release' || targetStatus === 'Released')) {
      alert('Restricted: Developers cannot move items directly to UAT or Release. Submit to QA first.');
      setDraggedItemId(null);
      return;
    }

    updateWorkItem(id, { status: targetStatus });
    setDraggedItemId(null);
  };

  // Helper to format short date string like "Oct 14"
  const formatShortDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Helper to extract clean mock date like "Jul 20"
  const getFormattedDate = (item: WorkItem) => {
    if (item.dates?.plannedDevEnd) {
      return formatShortDate(item.dates.plannedDevEnd);
    }
    // Fallback date based on item ID hash
    const num = parseInt(item.id.replace(/\D/g, ''), 10) || 20;
    const day = (num % 28) + 1;
    return `Oct ${day}`;
  };

  // Get mock avatar initials & color
  const getAvatarInitials = (name?: string) => {
    if (!name || name === 'Unassigned') return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarBg = (name?: string) => {
    if (!name || name === 'Unassigned') return 'bg-slate-700 text-slate-300';
    const colors = [
      'bg-amber-600 text-amber-100',
      'bg-emerald-600 text-emerald-100',
      'bg-blue-600 text-blue-100',
      'bg-purple-600 text-purple-100',
      'bg-rose-600 text-rose-100',
      'bg-cyan-600 text-cyan-100',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return colors[hash % colors.length];
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090C] select-none overflow-hidden">
      {/* Role Banner for Business Team */}
      {isBusinessTeam && (
        <div className="bg-[#121622]/80 border-b border-white/[0.08] px-4 py-2 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="p-1 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Lock size={12} />
            </span>
            <span>
              <strong>Business Team Mode:</strong> Board status movements are read-only. Status transitions are driven by development completion and UAT acceptance testing.
            </span>
          </div>
          {onOpenQuickAdd && (
            <button
              onClick={() => onOpenQuickAdd('To Do')}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#007AFF] hover:bg-[#0066D6] text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus size={12} />
              <span>Add Work Item</span>
            </button>
          )}
        </div>
      )}

      {/* Mobile iOS Column Switcher */}
      <div className="md:hidden bg-[#0E121A] border-b border-white/[0.08] p-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
        {columns.map((col) => {
          const colItems = items.filter((item) => {
            if (col.status === 'Ready for QA') {
              return item.status === 'Ready for QA' || item.status === 'In QA' || item.status === 'QA Failed';
            }
            if (col.status === 'Ready for UAT') {
              return item.status === 'Ready for UAT' || item.status === 'In UAT' || item.status === 'UAT Failed';
            }
            return item.status === col.status;
          });
          const isSelected = mobileColumnStatus === col.status;
          return (
            <button
              key={col.status}
              onClick={() => setMobileColumnStatus(col.status)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all ${
                isSelected
                  ? 'bg-[#007AFF] text-white shadow-sm'
                  : 'bg-[#121622] text-slate-400 border border-white/[0.06]'
              }`}
            >
              <span>{col.label}</span>
              <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-black/40 text-slate-400'}`}>
                {colItems.length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-3 md:p-6">
        <div className="flex items-start gap-4 h-full min-h-[600px]">
        {columns.map((col) => {
          const colItems = items.filter((item) => {
            if (col.status === 'Ready for QA') {
              return item.status === 'Ready for QA' || item.status === 'In QA' || item.status === 'QA Failed';
            }
            if (col.status === 'Ready for UAT') {
              return item.status === 'Ready for UAT' || item.status === 'In UAT' || item.status === 'UAT Failed';
            }
            return item.status === col.status;
          });

          const isCollapsed = collapsedCols.has(col.status);

          // Render Collapsed Vertical Spine (Exact matching feature from user's image!)
          if (isCollapsed) {
            return (
              <div
                key={col.status}
                onClick={() => toggleColumnCollapse(col.status)}
                className={`w-10 h-full rounded-2xl flex flex-col items-center justify-between py-4 cursor-pointer transition-all hover:brightness-110 shadow-lg ${col.badgeBg} text-white shrink-0`}
                title={`Expand ${col.label} column`}
              >
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                  {colItems.length}
                </div>
                <div className="[writing-mode:vertical-lr] rotate-180 text-xs font-black tracking-widest uppercase py-4">
                  {col.label}
                </div>
                <ChevronRight size={14} />
              </div>
            );
          }

          const isMobileVisible = mobileColumnStatus === col.status;

          return (
            <div
              key={col.status}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.status)}
              className={`w-full md:w-80 shrink-0 flex flex-col h-full bg-[#0D1017]/90 rounded-2xl border border-white/[0.08] shadow-xl overflow-hidden transition-all duration-200 ${
                isMobileVisible ? 'flex' : 'hidden md:flex'
              }`}
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <div
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${col.badgeBg} ${col.badgeText} border ${col.badgeBorder}`}
                  >
                    <span>{col.label}</span>
                    <span className="font-mono text-[10px] opacity-90">{colItems.length}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-slate-400">
                  <button
                    onClick={() => toggleColumnCollapse(col.status)}
                    className="p-1 hover:text-white hover:bg-white/[0.06] rounded transition-colors"
                    title="Collapse Column"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <button
                    onClick={() => onOpenQuickAdd && onOpenQuickAdd(col.status)}
                    className="p-1 hover:text-white hover:bg-white/[0.06] rounded transition-colors"
                    title="Add task to this column"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Cards Scroll Container */}
              <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto min-h-[220px]">
                {colItems.map((item) => {
                  const isFailing = item.status === 'QA Failed' || item.status === 'UAT Failed';

                  return (
                    <div
                      key={item.id}
                      draggable={!isBusinessTeam}
                      onDragStart={(e) => {
                        if (isBusinessTeam) {
                          e.preventDefault();
                          return;
                        }
                        handleDragStart(e, item.id);
                      }}
                      onClick={() => {
                        setSelectedWorkId(item.id);
                        setIsInspectorOpen(true);
                      }}
                      className={`p-3.5 bg-[#121622] hover:bg-[#161B2B] active:bg-[#1A2133] border border-white/[0.08] hover:border-blue-500/50 rounded-xl shadow-md transition-all space-y-2.5 group relative ${
                        isBusinessTeam ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
                      }`}
                    >
                      {/* Top Row: Type, ID, Priority */}
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <WorkTypeIcon type={item.type} size={13} />
                          <span className="font-mono font-bold text-slate-400 group-hover:text-blue-400 transition-colors">
                            {item.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <PriorityIcon priority={item.priority} size={11} />
                          <span className="text-[10px] font-medium">{item.priority}</span>
                        </div>
                      </div>

                      {/* Card Title (Clear & Prominent typography like the screenshot!) */}
                      <h4 className="text-xs md:text-sm font-bold text-white group-hover:text-blue-200 transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h4>

                      {/* Failure / Defect Banner (If QA or UAT failed) */}
                      {isFailing && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-rose-950/50 border border-rose-800/60 text-rose-300 text-[10px] font-semibold">
                          <AlertTriangle size={11} className="text-rose-400 shrink-0" />
                          <span className="truncate">
                            {item.status === 'QA Failed' ? 'QA Verification Defect' : 'UAT Rejected'}
                          </span>
                        </div>
                      )}

                      {/* Delivery Phase Timelines (Dev End, QA, UAT, Release) */}
                      <div
                        className="pt-2 border-t border-white/[0.06] space-y-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.dates?.plannedDevEnd || item.dates?.plannedQaStart || item.dates?.plannedUatStart || item.dates?.plannedRelease ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                                <Clock size={10} className="text-blue-400" />
                                <span>Phase Timelines</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setTimelineModalWorkId(item.id)}
                                className="text-blue-400 hover:text-blue-300 hover:underline font-semibold flex items-center gap-0.5 text-[10px] cursor-pointer"
                                title="Edit Delivery Timelines"
                              >
                                <span>Edit Dates</span>
                              </button>
                            </div>

                            {/* Phase Badges Row */}
                            <div className="flex flex-wrap items-center gap-1 text-[9px] font-mono">
                              {item.dates?.plannedDevEnd && (
                                <span
                                  className="px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/60"
                                  title={`Dev Phase: ${item.dates.plannedDevStart || 'Start'} → ${item.dates.plannedDevEnd}`}
                                >
                                  Dev End: {formatShortDate(item.dates.plannedDevEnd)}
                                </span>
                              )}
                              {item.dates?.plannedQaEnd && (
                                <span
                                  className="px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/60"
                                  title={`QA Window: ${item.dates.plannedQaStart || ''} → ${item.dates.plannedQaEnd}`}
                                >
                                  QA: {formatShortDate(item.dates.plannedQaStart)} - {formatShortDate(item.dates.plannedQaEnd)}
                                </span>
                              )}
                              {item.dates?.plannedUatEnd && (
                                <span
                                  className="px-1.5 py-0.5 rounded bg-teal-950/60 text-teal-300 border border-teal-800/60"
                                  title={`UAT Window: ${item.dates.plannedUatStart || ''} → ${item.dates.plannedUatEnd}`}
                                >
                                  UAT: {formatShortDate(item.dates.plannedUatStart)} - {formatShortDate(item.dates.plannedUatEnd)}
                                </span>
                              )}
                              {item.dates?.plannedRelease && (
                                <span
                                  className="px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/60"
                                  title={`Target Release: ${item.dates.plannedRelease}`}
                                >
                                  Rel: {formatShortDate(item.dates.plannedRelease)}
                                </span>
                              )}
                            </div>

                            {/* Mini Visual Pipeline Progress Bar */}
                            <div className="grid grid-cols-4 gap-1 h-1 rounded-full overflow-hidden bg-black/40 mt-1">
                              <div
                                className={`h-full ${
                                  item.dates?.actualDevEnd || item.status !== 'To Do'
                                    ? 'bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)]'
                                    : 'bg-slate-700'
                                }`}
                                title="Development"
                              />
                              <div
                                className={`h-full ${
                                  item.dates?.actualQaEnd ||
                                  item.status === 'Ready for UAT' ||
                                  item.status === 'In UAT' ||
                                  item.status === 'Ready for Release' ||
                                  item.status === 'Released'
                                    ? 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]'
                                    : item.status === 'In QA' || item.status === 'Ready for QA'
                                    ? 'bg-cyan-400/50'
                                    : 'bg-slate-700'
                                }`}
                                title="QA"
                              />
                              <div
                                className={`h-full ${
                                  item.dates?.actualUatEnd ||
                                  item.status === 'Ready for Release' ||
                                  item.status === 'Released'
                                    ? 'bg-teal-400 shadow-[0_0_6px_rgba(45,212,191,0.6)]'
                                    : item.status === 'In UAT' || item.status === 'Ready for UAT'
                                    ? 'bg-teal-400/50'
                                    : 'bg-slate-700'
                                }`}
                                title="UAT"
                              />
                              <div
                                className={`h-full ${
                                  item.status === 'Released'
                                    ? 'bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.6)]'
                                    : 'bg-slate-700'
                                }`}
                                title="Release"
                              />
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setTimelineModalWorkId(item.id)}
                            className="w-full py-1 px-2 rounded-lg bg-blue-950/20 hover:bg-blue-900/30 border border-dashed border-blue-500/30 text-blue-300 text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <Clock size={11} />
                            <span>+ Set Timelines (Dev, QA, UAT)</span>
                          </button>
                        )}
                      </div>

                      {/* Bottom Row: Assignee Avatars & Due Date */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[11px] text-slate-400">
                        {/* Overlapping Assignee Avatars */}
                        <div className="flex items-center -space-x-1.5">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] border-2 border-[#121622] shadow-sm ${getAvatarBg(
                              item.owner?.name
                            )}`}
                            title={item.owner?.name || 'Unassigned'}
                          >
                            {getAvatarInitials(item.owner?.name)}
                          </div>
                          {item.reporter?.name && item.reporter.name !== item.owner?.name && (
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] border-2 border-[#121622] shadow-sm ${getAvatarBg(
                                item.reporter.name
                              )} opacity-80`}
                              title={`Reporter: ${item.reporter.name}`}
                            >
                              {getAvatarInitials(item.reporter.name)}
                            </div>
                          )}
                        </div>

                        {/* Due Date with Calendar icon */}
                        <div className="flex items-center gap-1.5 font-medium text-slate-300 text-[11px]">
                          <Calendar size={12} className="text-slate-400" />
                          <span>{getFormattedDate(item)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {colItems.length === 0 && (
                  <div className="py-12 text-center text-slate-500 text-xs italic">
                    No work in this stage
                  </div>
                )}

                {/* + Add Task Button at bottom of column (Matches screenshot!) */}
                <button
                  type="button"
                  onClick={() => onOpenQuickAdd && onOpenQuickAdd(col.status)}
                  className="w-full py-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.04] rounded-xl border border-dashed border-white/[0.1] transition-all cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add task</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      </div>

      {/* Quick Task Timeline Editor Modal */}
      <WorkTimelineModal
        workId={timelineModalWorkId}
        isOpen={Boolean(timelineModalWorkId)}
        onClose={() => setTimelineModalWorkId(null)}
      />
    </div>
  );
};
