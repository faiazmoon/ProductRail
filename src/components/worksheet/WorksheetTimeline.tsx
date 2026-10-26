import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkItem, WorkType } from '../../types';
import { WorkTypeIcon, PriorityIcon } from '../common/Icons';
import {
  Calendar,
  Clock,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Code2,
  Zap,
  CheckSquare,
  Rocket,
  ChevronRight,
  Maximize2,
  AlertTriangle,
} from 'lucide-react';
import { WorkTimelineModal } from './WorkTimelineModal';

interface WorksheetTimelineProps {
  items: WorkItem[];
}

export const WorksheetTimeline: React.FC<WorksheetTimelineProps> = ({ items }) => {
  const { setSelectedWorkId, setIsInspectorOpen, sprints } = useApp();

  const [timelineModalWorkId, setTimelineModalWorkId] = useState<string | null>(null);
  const [timelineRangeMode, setTimelineRangeMode] = useState<'sprint' | 'horizon' | 'month'>('horizon');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Days range configuration
  const days = useMemo(() => {
    let startDay = 6;
    let totalDays = 21; // horizon (Oct 6 - Oct 26)

    if (timelineRangeMode === 'sprint') {
      startDay = 8;
      totalDays = 14; // Oct 8 - Oct 21
    } else if (timelineRangeMode === 'month') {
      startDay = 1;
      totalDays = 31; // Oct 1 - Oct 31
    }

    return Array.from({ length: totalDays }, (_, i) => {
      const d = startDay + i;
      const dateStr = `2026-10-${String(d).padStart(2, '0')}`;
      const dayOfWeek = new Date(2026, 9, d).toLocaleDateString('en-US', { weekday: 'narrow' });
      const isWeekend = dayOfWeek === 'F' || dayOfWeek === 'S'; // Friday & Saturday in region
      const isToday = d === 8; // October 8, 2026

      return {
        dayNum: d,
        dateStr,
        label: `${d}`,
        weekday: dayOfWeek,
        isWeekend,
        isToday,
      };
    });
  }, [timelineRangeMode]);

  const minDayNum = days[0]?.dayNum || 6;

  const getColIndex = (dateStr?: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length < 3) return null;
    const day = parseInt(parts[2], 10);
    const idx = day - minDayNum;
    if (idx < 0 || idx >= days.length) return null;
    return idx;
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.id.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.owner?.name?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [items, searchQuery, typeFilter]);

  return (
    <div className="flex-1 flex flex-col bg-[#08090C] overflow-hidden select-none font-sans">
      {/* Top Controls & Gantt Toolbar */}
      <div className="p-3 bg-[#0C1018] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Calendar size={15} />
            </div>
            <span className="font-bold text-white tracking-tight">Worksheet Gantt</span>
          </div>

          {/* Phase Legend */}
          <div className="hidden lg:flex items-center gap-3 pl-3 border-l border-white/[0.08] text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-blue-500 shadow-sm shadow-blue-500/50" />
              <span>Development</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-cyan-400 shadow-sm shadow-cyan-400/50" />
              <span>QA Verification</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-teal-400 shadow-sm shadow-teal-400/50" />
              <span>Business UAT</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-indigo-500 shadow-sm shadow-indigo-500/50" />
              <span>Release</span>
            </span>
          </div>
        </div>

        {/* Right side: Range switcher & search */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search size={12} className="text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Gantt..."
              className="bg-black/30 border border-white/[0.1] rounded-lg pl-7 pr-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-36 sm:w-44"
            />
          </div>

          {/* View Range Buttons */}
          <div className="flex items-center bg-[#121622] p-0.5 rounded-lg border border-white/[0.08]">
            <button
              onClick={() => setTimelineRangeMode('sprint')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                timelineRangeMode === 'sprint'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sprint 24 (14d)
            </button>
            <button
              onClick={() => setTimelineRangeMode('horizon')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                timelineRangeMode === 'horizon'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Horizon (21d)
            </button>
            <button
              onClick={() => setTimelineRangeMode('month')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                timelineRangeMode === 'month'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Full Month (31d)
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Gantt Viewport */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <div style={{ minWidth: `${320 + days.length * 38}px` }} className="h-full flex flex-col">
          {/* Header Row: Work Item Details Column + Day Columns */}
          <div
            style={{ gridTemplateColumns: `320px repeat(${days.length}, minmax(36px, 1fr))` }}
            className="grid bg-[#0D111A] border-b border-white/[0.08] text-[10px] font-mono sticky top-0 z-20 shadow-sm"
          >
            {/* Left Header */}
            <div className="p-2.5 px-4 font-bold border-r border-white/[0.08] text-slate-300 flex items-center justify-between">
              <span>Work Item &amp; Delivery Track</span>
              <span className="text-slate-500 font-normal text-[10px]">
                {filteredItems.length} items
              </span>
            </div>

            {/* Day Columns */}
            {days.map((d) => (
              <div
                key={d.dateStr}
                className={`py-2 px-1 text-center border-r border-white/[0.06] flex flex-col items-center justify-center transition-colors ${
                  d.isToday
                    ? 'bg-blue-950/50 text-blue-300 font-bold border-blue-500/40'
                    : d.isWeekend
                    ? 'bg-black/40 text-slate-500'
                    : 'text-slate-400'
                }`}
              >
                <span className="text-[9px] uppercase tracking-tighter opacity-70">
                  {d.weekday}
                </span>
                <span className="font-bold text-xs">{d.label}</span>
                {d.isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-0.5 animate-pulse" />
                )}
              </div>
            ))}
          </div>

          {/* Rows List */}
          <div className="divide-y divide-white/[0.06] flex-1 bg-[#090C12]">
            {filteredItems.map((item) => {
              const dates = item.dates || {};

              // Phase Col Indices
              const devStartCol = getColIndex(dates.actualDevStart || dates.plannedDevStart);
              const devEndCol = getColIndex(dates.actualDevEnd || dates.plannedDevEnd);

              const qaStartCol = getColIndex(dates.actualQaStart || dates.plannedQaStart);
              const qaEndCol = getColIndex(dates.actualQaEnd || dates.plannedQaEnd);

              const uatStartCol = getColIndex(dates.actualUatStart || dates.plannedUatStart);
              const uatEndCol = getColIndex(dates.actualUatEnd || dates.plannedUatEnd);

              const relCol = getColIndex(dates.actualRelease || dates.plannedRelease);

              const hasAnyDates =
                devStartCol !== null ||
                devEndCol !== null ||
                qaStartCol !== null ||
                qaEndCol !== null ||
                uatStartCol !== null ||
                uatEndCol !== null ||
                relCol !== null;

              return (
                <div
                  key={item.id}
                  style={{ gridTemplateColumns: `320px repeat(${days.length}, minmax(36px, 1fr))` }}
                  className="grid h-14 hover:bg-white/[0.02] transition-colors text-xs items-center group relative"
                >
                  {/* Left Work Item Card */}
                  <div className="px-3.5 border-r border-white/[0.08] h-full flex items-center justify-between gap-2 overflow-hidden bg-[#0B0E16]/80 group-hover:bg-[#0E131E] transition-colors">
                    <div
                      onClick={() => {
                        setSelectedWorkId(item.id);
                        setIsInspectorOpen(true);
                      }}
                      className="flex items-center gap-2 min-w-0 cursor-pointer flex-1"
                    >
                      <WorkTypeIcon type={item.type} size={14} />
                      <div className="min-w-0 truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-400 group-hover:text-blue-400 text-[11px]">
                            {item.id}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {item.estimate ? `· ${item.estimate}` : ''}
                          </span>
                        </div>
                        <h4 className="truncate text-slate-200 font-semibold text-xs leading-tight">
                          {item.title}
                        </h4>
                      </div>
                    </div>

                    {/* Quick Button to Set/Edit Dates */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTimelineModalWorkId(item.id);
                      }}
                      className="p-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/30 text-blue-400 border border-blue-500/20 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                      title="Set/Edit Phase Timelines"
                    >
                      <Clock size={11} />
                      <span className="hidden sm:inline">Dates</span>
                    </button>
                  </div>

                  {/* Day cells with rendered schedule bars */}
                  {days.map((d, colIndex) => {
                    const isDev =
                      devStartCol !== null &&
                      devEndCol !== null &&
                      colIndex >= devStartCol &&
                      colIndex <= devEndCol;

                    const isDevEnd = colIndex === devEndCol;

                    const isQa =
                      qaStartCol !== null &&
                      qaEndCol !== null &&
                      colIndex >= qaStartCol &&
                      colIndex <= qaEndCol;

                    const isUat =
                      uatStartCol !== null &&
                      uatEndCol !== null &&
                      colIndex >= uatStartCol &&
                      colIndex <= uatEndCol;

                    const isRelease = relCol !== null && colIndex === relCol;

                    return (
                      <div
                        key={d.dateStr}
                        onClick={() => setTimelineModalWorkId(item.id)}
                        className={`h-full border-r border-white/[0.04] relative flex items-center justify-center p-0.5 cursor-pointer hover:bg-white/[0.04] transition-colors ${
                          d.isToday ? 'bg-blue-950/10' : d.isWeekend ? 'bg-black/20' : ''
                        }`}
                      >
                        {/* Development Phase Segment */}
                        {isDev && (
                          <div
                            className={`w-full h-5 rounded-sm flex items-center justify-center text-[9px] font-mono font-bold text-white shadow-sm transition-transform hover:scale-y-110 ${
                              isDevEnd
                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 border-r-2 border-cyan-400'
                                : 'bg-blue-600/90'
                            }`}
                            title={`${item.id} Development Phase: Ends ${dates.plannedDevEnd}`}
                          >
                            {colIndex === devStartCol && (
                              <span className="truncate px-1 text-[8px] opacity-90 hidden xl:inline">
                                Dev
                              </span>
                            )}
                          </div>
                        )}

                        {/* QA Verification Segment */}
                        {isQa && (
                          <div
                            className="w-full h-5 bg-cyan-500/90 hover:bg-cyan-400 rounded-sm flex items-center justify-center text-[9px] font-mono font-bold text-slate-900 shadow-sm transition-transform hover:scale-y-110"
                            title={`${item.id} QA Phase: ${dates.plannedQaStart} to ${dates.plannedQaEnd}`}
                          >
                            {colIndex === qaStartCol && (
                              <span className="truncate px-1 text-[8px] font-black hidden xl:inline">
                                QA
                              </span>
                            )}
                          </div>
                        )}

                        {/* Business UAT Segment */}
                        {isUat && (
                          <div
                            className="w-full h-5 bg-teal-400/90 hover:bg-teal-300 rounded-sm flex items-center justify-center text-[9px] font-mono font-bold text-slate-900 shadow-sm transition-transform hover:scale-y-110"
                            title={`${item.id} UAT Phase: ${dates.plannedUatStart} to ${dates.plannedUatEnd}`}
                          >
                            {colIndex === uatStartCol && (
                              <span className="truncate px-1 text-[8px] font-black hidden xl:inline">
                                UAT
                              </span>
                            )}
                          </div>
                        )}

                        {/* Production Release Milestone Marker */}
                        {isRelease && (
                          <div
                            className="w-5 h-5 rounded-md bg-indigo-500 hover:bg-indigo-400 text-white flex items-center justify-center shadow-md shadow-indigo-500/50 z-10 transition-transform hover:scale-125"
                            title={`${item.id} Target Release: ${dates.plannedRelease}`}
                          >
                            <Rocket size={11} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="py-16 text-center text-slate-500 text-xs italic">
                No work items match filter.
              </div>
            )}
          </div>
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
