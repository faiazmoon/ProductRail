import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  History,
  Search,
  Filter,
  User,
  Clock,
  ArrowRight,
  Zap,
  CheckSquare,
  Bug,
  FileCode,
  Rocket,
  Layers,
} from 'lucide-react';

export const ActivityLogView: React.FC = () => {
  const { globalActivity, setSelectedWorkId, setIsInspectorOpen, setActiveTab } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActor, setSelectedActor] = useState('all');

  const actors = Array.from(new Set(globalActivity.map((a) => a.actor)));

  const filteredLogs = globalActivity.filter((log) => {
    const matchesSearch =
      searchQuery === '' ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.workId && log.workId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.workTitle && log.workTitle.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesActor = selectedActor === 'all' || log.actor === selectedActor;

    return matchesSearch && matchesActor;
  });

  const getActionIcon = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('qa ready') || act.includes('qa verification')) {
      return <Zap size={14} className="text-cyan-400 shrink-0" />;
    }
    if (act.includes('uat ready') || act.includes('uat') || act.includes('accepted')) {
      return <CheckSquare size={14} className="text-teal-400 shrink-0" />;
    }
    if (act.includes('bug') || act.includes('fail') || act.includes('discovery')) {
      return <Bug size={14} className="text-rose-400 shrink-0" />;
    }
    if (act.includes('dev') || act.includes('deliverable')) {
      return <FileCode size={14} className="text-blue-400 shrink-0" />;
    }
    if (act.includes('release') || act.includes('shipped')) {
      return <Rocket size={14} className="text-indigo-400 shrink-0" />;
    }
    return <Clock size={14} className="text-slate-400 shrink-0" />;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090C] overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-[#0D1017] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <History size={18} className="text-blue-400" />
            <h1 className="text-base font-bold text-white tracking-tight">
              Enterprise Activity &amp; Audit Trail
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable log of all developer handoffs, QA test executions, UAT sign-offs, and discoveries.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 text-xs">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search actions, ID, details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black/60 border border-white/[0.1] rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-56"
            />
          </div>

          <select
            value={selectedActor}
            onChange={(e) => setSelectedActor(e.target.value)}
            className="bg-[#121620] border border-white/[0.1] rounded-md px-2.5 py-1.5 text-xs text-slate-200"
          >
            <option value="all">All Team Members</option>
            {actors.map((actor) => (
              <option key={actor} value={actor}>{actor}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Log Feed */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-4xl space-y-3 font-sans">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            onClick={() => {
              if (log.workId) {
                setSelectedWorkId(log.workId);
                setIsInspectorOpen(true);
                setActiveTab('worksheet');
              }
            }}
            className="p-3.5 bg-[#0D1017] hover:bg-[#121622] border border-white/[0.06] hover:border-white/[0.12] rounded-lg transition-colors cursor-pointer text-xs flex items-start gap-3 group"
          >
            <div className="p-1.5 rounded bg-black/40 border border-white/[0.05] mt-0.5">
              {getActionIcon(log.action)}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">{log.actor}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-300 font-medium">{log.action}</span>
                </div>
                <span className="font-mono text-[11px] text-slate-500">
                  {log.timestamp}
                </span>
              </div>

              {log.workId && (
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="font-mono font-bold text-blue-400 group-hover:underline">
                    {log.workId}
                  </span>
                  {log.workTitle && (
                    <span className="text-slate-400 truncate max-w-md">
                      {log.workTitle}
                    </span>
                  )}
                </div>
              )}

              {log.details && (
                <p className="text-[11px] text-slate-400 leading-relaxed bg-black/30 p-2 rounded border border-white/[0.03]">
                  {log.details}
                </p>
              )}
            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="py-16 text-center text-slate-500 text-xs">
            No activity matches the current query.
          </div>
        )}
      </div>
    </div>
  );
};
