import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  AlertTriangle,
  Zap,
  CheckSquare,
  Bug,
  Rocket,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  User,
  ShieldAlert,
  Headphones,
  TrendingUp,
} from 'lucide-react';
import { WorkTypeIcon, StatusIndicator } from '../common/Icons';
import { SprintBurndownChart } from './SprintBurndownChart';

export const DashboardView: React.FC = () => {
  const {
    workItems,
    sprints,
    releases,
    tickets,
    currentRole,
    currentUser,
    setSelectedWorkId,
    setIsInspectorOpen,
    setActiveTab,
  } = useApp();

  const currentSprint = sprints.find((s) => s.id === 'SP-24') || sprints[0];
  const sprintItems = workItems.filter((w) => w.sprintId === currentSprint?.id);

  const doneCount = sprintItems.filter(
    (w) => w.status === 'Released' || w.status === 'Ready for Release'
  ).length;

  const blockedCount = sprintItems.filter(
    (w) => w.status === 'QA Failed' || w.status === 'UAT Failed'
  ).length;

  const inProgressCount = sprintItems.filter(
    (w) => w.status === 'In Development' || w.status === 'In QA' || w.status === 'In UAT'
  ).length;

  const remainingCount = sprintItems.length - doneCount;
  const progressPercent = sprintItems.length > 0 ? Math.round((doneCount / sprintItems.length) * 100) : 0;

  // Critical issues needing attention
  const criticalBugs = workItems.filter((w) => w.type === 'Bug' && w.priority === 'Critical');
  const uatFailures = workItems.filter((w) => w.status === 'UAT Failed');
  const qaWaiting = workItems.filter((w) => w.status === 'Ready for QA');
  const uatWaiting = workItems.filter((w) => w.status === 'Ready for UAT');

  const isBusinessTeam = currentRole === 'Business' || currentRole === 'UAT';

  // Role tailored actions
  const myAssignedWork = isBusinessTeam
    ? workItems.filter(
        (w) =>
          w.status === 'Ready for UAT' ||
          w.status === 'In UAT' ||
          w.status === 'UAT Failed' ||
          (w.uatCases && w.uatCases.some((c) => c.result === 'Pending' || c.requiresAttention))
      )
    : workItems.filter(
        (w) =>
          w.owner?.name?.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0]) ||
          (currentRole === 'Developer' && w.team.includes('Engineering') && w.status === 'In Development')
      );

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#08090d] space-y-6">
      {/* Greeting & Subtitle */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Operational Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Role: <strong className="text-slate-200">{currentRole}</strong> · Focus: {currentUser.team}
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Target Cycle: Sprint 24 (08 Oct – 21 Oct 2026)
        </div>
      </div>

      {/* 1. NEEDS ATTENTION BANNER (Section 50) */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-[#0e131d] border border-rose-900/50 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle size={15} />
            <span>Needs Attention Today</span>
          </div>
          <button
            onClick={() => setActiveTab('worksheet')}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium"
          >
            <span>Review All in Worksheet</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div
            onClick={() => {
              setSelectedWorkId('WK-143');
              setIsInspectorOpen(true);
              setActiveTab('worksheet');
            }}
            className="p-3 bg-slate-900/80 hover:bg-slate-800 rounded-lg border border-rose-900/40 cursor-pointer transition-colors space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-rose-300">1 Critical Bug</span>
              <span className="text-[10px] font-mono text-rose-400 font-bold">WK-143</span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              Refund status not updating after counter ticket cancellation
            </p>
          </div>

          <div
            onClick={() => setActiveTab('qa')}
            className="p-3 bg-slate-900/80 hover:bg-slate-800 rounded-lg border border-amber-900/40 cursor-pointer transition-colors space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-amber-300">3 Items Blocked / In QA</span>
              <Zap size={14} className="text-cyan-400" />
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              Includes TC-03 background GPS socket timeout regression
            </p>
          </div>

          <div
            onClick={() => setActiveTab('uat')}
            className="p-3 bg-slate-900/80 hover:bg-slate-800 rounded-lg border border-teal-900/40 cursor-pointer transition-colors space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-teal-300">2 Items Awaiting UAT</span>
              <CheckSquare size={14} className="text-teal-400" />
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              WK-142 Vehicle Tracking &amp; WK-148 Hotel Voucher QR
            </p>
          </div>
        </div>
      </div>

      {/* 2. CURRENT SPRINT & MY ACTIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Sprint Progress Card */}
        <div className="lg:col-span-2 bg-[#0d111a] border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold text-sm font-mono uppercase tracking-tighter">Sprint {currentSprint.name}</span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-400">Oct 08–21</span>
              </div>
              <p className="text-xs text-slate-300">{currentSprint.goal}</p>
            </div>
            <span className="text-xs font-mono text-amber-300 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded">
              6 days remaining
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>{sprintItems.length} Scoped Work</span>
              <span>{doneCount} Done ({progressPercent}%)</span>
              <span className="text-rose-400">{blockedCount} Blocked</span>
              <span>{remainingCount} Remaining</span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
              <div
                style={{ width: `${progressPercent}%` }}
                className="bg-emerald-500 transition-all duration-300"
              />
              <div
                style={{ width: `${Math.round((blockedCount / sprintItems.length) * 100)}%` }}
                className="bg-rose-500 transition-all duration-300"
              />
              <div
                style={{ width: `${Math.round((inProgressCount / sprintItems.length) * 100)}%` }}
                className="bg-blue-500 transition-all duration-300"
              />
            </div>
          </div>

          {/* Scope Breakdown: Committed vs Added vs Completed vs Deferred */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Committed at Start</span>
              <span className="font-mono text-slate-200 font-semibold">4 Items (21 pts)</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Added Unplanned</span>
              <span className="font-mono text-amber-400 font-semibold">+2 Items (WK-145, WK-147)</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Verified Done</span>
              <span className="font-mono text-emerald-400 font-semibold">{doneCount} Items</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Unfinished Dest.</span>
              <span className="text-slate-300">Product Backlog</span>
            </div>
          </div>
        </div>

        {/* My Actions Box (Role Tailored) */}
        <div className="bg-[#0d111a] border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                {isBusinessTeam ? <CheckSquare size={14} className="text-teal-400" /> : <User size={14} className="text-blue-400" />}
                <span>{isBusinessTeam ? 'UAT Acceptance Queue' : 'My Active Work'}</span>
              </h3>
              <span className={`text-xs font-mono ${isBusinessTeam ? 'text-teal-400' : 'text-blue-400'}`}>
                {myAssignedWork.length}
              </span>
            </div>

            <div className="space-y-2">
              {myAssignedWork.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedWorkId(item.id);
                    setIsInspectorOpen(true);
                  }}
                  className="p-2.5 bg-slate-950/70 hover:bg-slate-900 border border-slate-800 rounded-lg cursor-pointer transition-colors text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-300">{item.id}</span>
                    <span className="text-[10px] text-slate-400 capitalize">{item.status}</span>
                  </div>
                  <div className="text-slate-200 font-medium truncate">{item.title}</div>
                </div>
              ))}

              {myAssignedWork.length === 0 && (
                <div className="py-6 text-center text-slate-500 text-xs">
                  No pending action items assigned directly to you.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveTab(isBusinessTeam ? 'uat' : 'worksheet')}
            className={`w-full py-1.5 text-xs rounded border transition-colors font-semibold ${
              isBusinessTeam
                ? 'bg-teal-950/60 hover:bg-teal-900/80 text-teal-300 border-teal-800/60'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700/80'
            }`}
          >
            {isBusinessTeam ? 'Open Business UAT Workspace' : 'View My Worksheet Tasks'}
          </button>
        </div>
      </div>

      {/* 2.5 SPRINT BURNDOWN CHART (Recharts) */}
      <SprintBurndownChart sprintId={currentSprint?.id} />

      {/* 3. UPCOMING DATES, PRODUCT HEALTH & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upcoming Dates & Releases */}
        <div className="bg-[#0d111a] border border-slate-800 rounded-xl p-5 space-y-3 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Calendar size={14} className="text-indigo-400" />
            <span>Upcoming Milestones</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="font-mono text-slate-400 text-[11px] block">15 Oct 2026</span>
                <span className="text-slate-200 font-medium">Vehicle Tracking UAT Final</span>
              </div>
              <CheckSquare size={14} className="text-teal-400" />
            </div>

            <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="font-mono text-slate-400 text-[11px] block">18 Oct 2026</span>
                <span className="text-slate-200 font-medium">Payment Gateway QA Stress Test</span>
              </div>
              <Zap size={14} className="text-cyan-400" />
            </div>

            <div
              onClick={() => setActiveTab('releases')}
              className="p-2.5 bg-indigo-950/30 hover:bg-indigo-950/50 rounded border border-indigo-900/50 flex items-center justify-between cursor-pointer transition-colors"
            >
              <div>
                <span className="font-mono text-indigo-300 text-[11px] block">20 Oct 2026</span>
                <span className="text-white font-semibold">Production Release v2.14</span>
              </div>
              <Rocket size={14} className="text-indigo-400" />
            </div>
          </div>
        </div>

        {/* Product Health (Section 50) */}
        <div className="bg-[#0d111a] border border-slate-800 rounded-xl p-5 space-y-3 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <TrendingUp size={14} className="text-emerald-400" />
            <span>Product Area Health</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800/80 flex items-center justify-between">
              <span className="font-medium text-slate-200">Bus</span>
              <span className="text-amber-400 text-[11px] font-semibold flex items-center gap-1">
                <AlertTriangle size={12} />
                <span>Needs Attention</span>
              </span>
            </div>

            <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800/80 flex items-center justify-between">
              <span className="font-medium text-slate-200">Ship</span>
              <span className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>On Track</span>
              </span>
            </div>

            <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800/80 flex items-center justify-between">
              <span className="font-medium text-slate-200">Air</span>
              <span className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>On Track</span>
              </span>
            </div>

            <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800/80 flex items-center justify-between">
              <span className="font-medium text-slate-200">Hotel</span>
              <span className="text-slate-400 text-[11px]">◌ Planning Phase</span>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-[#0d111a] border border-slate-800 rounded-xl p-5 space-y-3 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Clock size={14} className="text-slate-400" />
            <span>Recent Activity</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-2 rounded bg-slate-950/40 border border-slate-800/60 space-y-0.5">
              <div className="text-slate-200 font-medium">WK-142 passed QA retest</div>
              <div className="text-[10px] text-slate-500 font-mono">14 Oct · Karim Ullah</div>
            </div>

            <div className="p-2 rounded bg-slate-950/40 border border-slate-800/60 space-y-0.5">
              <div className="text-slate-200 font-medium">WK-145 fix merged by Rahim</div>
              <div className="text-[10px] text-slate-500 font-mono">14 Oct · Mobile Engineering</div>
            </div>

            <div className="p-2 rounded bg-slate-950/40 border border-slate-800/60 space-y-0.5">
              <div className="text-slate-200 font-medium">TKT-1043 auto-routed to Adnan</div>
              <div className="text-[10px] text-slate-500 font-mono">10 Oct · Smart Routing Rule 3</div>
            </div>

            <div className="p-2 rounded bg-slate-950/40 border border-slate-800/60 space-y-0.5">
              <div className="text-slate-200 font-medium">Sprint 24 received 2 unplanned items</div>
              <div className="text-[10px] text-slate-500 font-mono">09 Oct · Scope Change</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
