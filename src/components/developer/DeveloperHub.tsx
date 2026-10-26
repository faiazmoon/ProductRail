import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkItem, WorkStatus, FeatureDeliverable } from '../../types';
import { WorkTypeIcon, PriorityIcon, StatusIndicator } from '../common/Icons';
import {
  Code2,
  GitBranch,
  Play,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
  Search,
  Filter,
  Check,
  Zap,
  CheckSquare,
  Sparkles,
  User,
  Clock,
  ArrowRight,
  ChevronRight,
  Maximize2,
  Table2,
  Plus,
} from 'lucide-react';

export const DeveloperHub: React.FC = () => {
  const {
    workItems,
    updateWorkItem,
    updateDeliverableStatus,
    users,
    currentUser,
    currentRole,
    sprints,
    setSelectedWorkId,
    setIsInspectorOpen,
    setActiveTab,
  } = useApp();

  // Find default developer (or current user if dev)
  const defaultDevName = useMemo(() => {
    if (currentUser.role === 'Developer') return currentUser.name;
    const firstDev = users.find((u) => u.role === 'Developer');
    return firstDev?.name || 'Rahim Chowdhury';
  }, [currentUser, users]);

  const [selectedDeveloper, setSelectedDeveloper] = useState<string>(defaultDevName);
  const [selectedSprintId, setSelectedSprintId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  // Filter items assigned to developer or team deliverables
  const developerItems = useMemo(() => {
    return workItems.filter((w) => {
      // Exclude intake/triage items not yet moved/divided by PM
      if (w.status === 'Intake' || w.status === 'Triage' || w.status === 'Archived') {
        return false;
      }

      // Check owner assignment or divided deliverable assignment
      const matchesDev =
        selectedDeveloper === 'all' ||
        w.owner?.name?.toLowerCase().includes(selectedDeveloper.toLowerCase().split(' ')[0]) ||
        (w.deliverables &&
          w.deliverables.some((d) =>
            d.assignedDeveloper.toLowerCase().includes(selectedDeveloper.toLowerCase().split(' ')[0])
          ));

      if (!matchesDev) return false;

      // Sprint filter
      if (selectedSprintId !== 'all') {
        if (selectedSprintId === 'backlog' && w.sprintId) return false;
        if (selectedSprintId !== 'backlog' && w.sprintId !== selectedSprintId) return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          w.id.toLowerCase().includes(q) ||
          w.title.toLowerCase().includes(q) ||
          w.productArea.some((a) => a.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [workItems, selectedDeveloper, selectedSprintId, searchQuery]);

  // Group into logical Developer Stages
  const stages = useMemo(() => {
    // 1. To Do / Assigned
    const todo = developerItems.filter(
      (w) => w.status === 'Backlog' || w.status === 'To Do'
    );

    // 2. In Development (Active WIP)
    const inDev = developerItems.filter((w) => w.status === 'In Development');

    // 3. Rework Needed (QA Failed or UAT Failed)
    const rework = developerItems.filter(
      (w) =>
        w.status === 'QA Failed' ||
        w.status === 'UAT Failed' ||
        w.type === 'Bug' && (w.status === 'To Do' || w.status === 'In Development')
    );

    // 4. In Verification (Ready for QA, In QA, Ready for UAT, In UAT) - LOCKED FOR DEVELOPERS
    const inVerification = developerItems.filter(
      (w) =>
        w.status === 'Ready for QA' ||
        w.status === 'In QA' ||
        w.status === 'Ready for UAT' ||
        w.status === 'In UAT'
    );

    // 5. Done / Ready for Release / Released
    const completed = developerItems.filter(
      (w) => w.status === 'Ready for Release' || w.status === 'Released'
    );

    return { todo, inDev, rework, inVerification, completed };
  }, [developerItems]);

  // Developer Action 1: Start Development
  const handleStartDevelopment = (item: WorkItem) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    updateWorkItem(item.id, {
      status: 'In Development',
      dates: {
        ...item.dates,
        actualDevStart: now,
      },
      activity: [
        ...(item.activity || []),
        {
          id: `act-${Date.now()}`,
          timestamp: now,
          actor: currentUser.name,
          action: 'Started Development',
          details: 'Moved to In Development',
        },
      ],
    });
  };

  // Developer Action 2: Submit for QA Verification
  const handleCompleteDevelopmentAndSubmitQA = (item: WorkItem) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    updateWorkItem(item.id, {
      status: 'Ready for QA',
      dates: {
        ...item.dates,
        actualDevEnd: now,
      },
      activity: [
        ...(item.activity || []),
        {
          id: `act-${Date.now()}`,
          timestamp: now,
          actor: currentUser.name,
          action: 'Development Completed',
          details: 'Submitted for QA Verification',
        },
      ],
    });
  };

  // Developer Action 3: Retest requested after fixing bug
  const handleRequestRetest = (item: WorkItem) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    updateWorkItem(item.id, {
      status: 'Ready for QA',
      activity: [
        ...(item.activity || []),
        {
          id: `act-${Date.now()}`,
          timestamp: now,
          actor: currentUser.name,
          action: 'Fix Deployed — Retest Requested',
          details: 'Defect resolved by developer, waiting for QA re-verification',
        },
      ],
    });
  };

  const handleOpenInspector = (id: string) => {
    setSelectedWorkId(id);
    setIsInspectorOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090C] overflow-hidden font-sans select-none">
      {/* Developer Hub Top Bar */}
      <div className="bg-[#090C13] border-b border-white/[0.08] px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
            <Code2 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white tracking-tight">
                Developer Hub
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-mono">
                ENGINEERING EXECUTION
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Code and submit deliverables for verification. QA and UAT acceptance are certified by their respective teams.
            </p>
          </div>
        </div>

        {/* Developer Selector & Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Developer Filter */}
          <div className="flex items-center gap-1.5 bg-[#101420] border border-white/[0.1] rounded-lg px-2.5 py-1 text-xs">
            <User size={13} className="text-emerald-400" />
            <select
              value={selectedDeveloper}
              onChange={(e) => setSelectedDeveloper(e.target.value)}
              className="bg-transparent text-white font-semibold text-xs border-0 outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Developers</option>
              {users
                .filter((u) => u.role === 'Developer' || u.role === 'Engineering Lead' || u.role === 'Super Admin')
                .map((u) => (
                  <option key={u.id} value={u.name} className="bg-slate-900">
                    {u.name} ({u.role})
                  </option>
                ))}
            </select>
          </div>

          {/* Sprint Filter */}
          <select
            value={selectedSprintId}
            onChange={(e) => setSelectedSprintId(e.target.value)}
            className="bg-[#101420] border border-white/[0.1] rounded-lg px-2.5 py-1 text-xs text-slate-200 font-semibold cursor-pointer outline-none"
          >
            <option value="all">All Sprints</option>
            {sprints.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.status})
              </option>
            ))}
            <option value="backlog">Backlog (No Sprint)</option>
          </select>

          {/* View in Worksheet Button */}
          <button
            onClick={() => setActiveTab('all-work')}
            className="flex items-center gap-1 px-2.5 py-1 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-white/[0.08]"
            title="Switch to Worksheet Grid"
          >
            <Table2 size={13} />
            <span>Worksheet View</span>
          </button>
        </div>
      </div>

      {/* Rules Banner (Clear UX from Senior PM) */}
      <div className="bg-[#0C101A] border-b border-white/[0.06] px-4 py-2 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
        <div className="flex items-center gap-2">
          <Lock size={12} className="text-amber-400 shrink-0" />
          <span>
            <strong className="text-slate-200">Engineering Protocol:</strong> Developers submit code to <span className="text-cyan-300 font-bold">QA Verification</span>. Once submitted, QA and Business UAT perform independent acceptance testing.
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span className="text-slate-500">Active Work: <strong className="text-white">{developerItems.length}</strong></span>
          <span className="text-rose-400">Rework Needed: <strong>{stages.rework.length}</strong></span>
        </div>
      </div>

      {/* Primary Developer Swimlanes */}
      <div className="flex-1 p-4 overflow-x-auto overflow-y-hidden">
        <div className="flex items-start gap-4 h-full min-w-[1100px]">
          {/* COLUMN 1: Assigned / To Do */}
          <div className="flex-1 flex flex-col h-full bg-[#0A0D15] rounded-xl border border-white/[0.08] overflow-hidden">
            <div className="p-3 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Assigned &amp; To Do
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/[0.08] text-slate-300 font-bold">
                  {stages.todo.length}
                </span>
              </div>
            </div>

            <div className="flex-1 p-2 space-y-2.5 overflow-y-auto">
              {stages.todo.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenInspector(item.id)}
                  className="p-3 bg-[#101420] hover:bg-[#141928] border border-white/[0.06] hover:border-blue-500/40 rounded-xl space-y-2 transition-all cursor-pointer shadow-sm group"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-mono font-bold text-blue-400">
                      <WorkTypeIcon type={item.type} size={13} />
                      <span>{item.id}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <PriorityIcon priority={item.priority} size={11} />
                      <span>{item.estimate || '—'}</span>
                    </div>
                  </div>

                  <div className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors line-clamp-2">
                    {item.title}
                  </div>

                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {item.productArea.slice(0, 2).map((a) => (
                      <span key={a} className="bg-amber-950/60 text-amber-300 px-1.5 py-0.2 rounded border border-amber-900/40">
                        {a}
                      </span>
                    ))}
                    {item.platform.slice(0, 2).map((p) => (
                      <span key={p} className="bg-blue-950/60 text-blue-300 px-1.5 py-0.2 rounded border border-blue-900/40">
                        {p}
                      </span>
                    ))}
                  </div>

                  {/* Action Button: Start Work */}
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.sprintId || 'Backlog'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartDevelopment(item);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-blue-900/40 cursor-pointer"
                    >
                      <Play size={11} className="fill-white" />
                      <span>Start Dev</span>
                    </button>
                  </div>
                </div>
              ))}

              {stages.todo.length === 0 && (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No pending work assigned.
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 2: In Development (Active WIP) */}
          <div className="flex-1 flex flex-col h-full bg-[#0A0D15] rounded-xl border border-blue-500/30 overflow-hidden shadow-lg shadow-blue-950/20">
            <div className="p-3 border-b border-blue-500/20 bg-blue-500/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  In Development
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800/60 font-bold">
                  {stages.inDev.length}
                </span>
              </div>
            </div>

            <div className="flex-1 p-2 space-y-2.5 overflow-y-auto">
              {stages.inDev.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenInspector(item.id)}
                  className="p-3.5 bg-[#0F1424] hover:bg-[#13192E] border border-blue-500/30 rounded-xl space-y-2.5 transition-all cursor-pointer shadow-md group"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-mono font-bold text-blue-300">
                      <WorkTypeIcon type={item.type} size={13} />
                      <span>{item.id}</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800">
                      CODING
                    </span>
                  </div>

                  <div className="text-xs font-bold text-white group-hover:text-blue-200 transition-colors">
                    {item.title}
                  </div>

                  {/* Git Branch Hint */}
                  <div className="p-1.5 bg-black/40 rounded border border-white/[0.06] flex items-center justify-between font-mono text-[10px] text-slate-400">
                    <div className="flex items-center gap-1 truncate">
                      <GitBranch size={11} className="text-purple-400 shrink-0" />
                      <span className="truncate">feature/{item.id.toLowerCase()}-{item.title.toLowerCase().replace(/\s+/g, '-').slice(0, 16)}</span>
                    </div>
                  </div>

                  {/* Divided Deliverables (if any) */}
                  {item.deliverables && item.deliverables.length > 0 && (
                    <div className="space-y-1 pt-1 border-t border-white/[0.06]" onClick={(e) => e.stopPropagation()}>
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        Deliverables ({item.deliverables.filter((d) => d.status === 'Ready for QA' || d.status === 'Done').length}/{item.deliverables.length}):
                      </div>
                      <div className="space-y-1">
                        {item.deliverables.map((deliv) => (
                          <div
                            key={deliv.id}
                            className="p-1.5 bg-black/30 rounded flex items-center justify-between text-[11px] border border-white/[0.04]"
                          >
                            <span className="text-slate-300 truncate max-w-[140px]">{deliv.title}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              deliv.status === 'Ready for QA'
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                : 'bg-slate-900 text-slate-400'
                            }`}>
                              {deliv.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Primary Action Button: Submit for QA */}
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Owner: {item.owner?.name?.split(' ')[0] || 'Me'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCompleteDevelopmentAndSubmitQA(item);
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-cyan-900/40 cursor-pointer"
                    >
                      <Check size={12} className="stroke-[3]" />
                      <span>Submit for QA</span>
                    </button>
                  </div>
                </div>
              ))}

              {stages.inDev.length === 0 && (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No tasks currently in progress. Start a task from "To Do".
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 3: Rework Needed (QA Failed or UAT Failed) */}
          <div className="flex-1 flex flex-col h-full bg-[#0A0D15] rounded-xl border border-rose-500/30 overflow-hidden">
            <div className="p-3 border-b border-rose-500/20 bg-rose-500/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-rose-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Rework &amp; Defects
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800/60 font-bold">
                  {stages.rework.length}
                </span>
              </div>
            </div>

            <div className="flex-1 p-2 space-y-2.5 overflow-y-auto">
              {stages.rework.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenInspector(item.id)}
                  className="p-3 bg-[#181119] hover:bg-[#201522] border border-rose-500/40 rounded-xl space-y-2 transition-all cursor-pointer shadow-md group"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-mono font-bold text-rose-400">
                      <WorkTypeIcon type={item.type} size={13} />
                      <span>{item.id}</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800 animate-pulse">
                      {item.status}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-white group-hover:text-rose-200 transition-colors">
                    {item.title}
                  </div>

                  {/* Failure reason explanation */}
                  <div className="p-2 bg-rose-950/40 border border-rose-800/40 rounded text-[11px] text-rose-200 leading-snug">
                    <span className="font-bold text-rose-300 block mb-0.5">Verification Feedback:</span>
                    <span className="line-clamp-2">
                      {item.requirementDetails?.slice(0, 140) || 'Defect reported during verification. Fix required.'}
                    </span>
                  </div>

                  {/* Action: Fix Applied -> Request Retest */}
                  <div className="pt-2 border-t border-rose-900/40 flex items-center justify-between">
                    <span className="text-[10px] text-rose-400 font-mono">
                      Priority: {item.priority}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRequestRetest(item);
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-rose-900/40 cursor-pointer"
                    >
                      <Zap size={11} className="fill-white" />
                      <span>Request Retest</span>
                    </button>
                  </div>
                </div>
              ))}

              {stages.rework.length === 0 && (
                <div className="py-12 text-center text-slate-500 text-xs">
                  Clean state! No QA or UAT defects pending rework.
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 4: In Verification (QA Testing & Business UAT) - LOCKED FOR DEVELOPERS */}
          <div className="flex-1 flex flex-col h-full bg-[#0A0D15] rounded-xl border border-white/[0.08] overflow-hidden opacity-90">
            <div className="p-3 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock size={13} className="text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Under Verification
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-bold">
                  {stages.inVerification.length}
                </span>
              </div>
            </div>

            <div className="flex-1 p-2 space-y-2.5 overflow-y-auto">
              {stages.inVerification.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenInspector(item.id)}
                  className="p-3 bg-[#0E121C] hover:bg-[#121624] border border-cyan-900/40 rounded-xl space-y-2 transition-all cursor-pointer shadow-sm group"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-mono font-bold text-cyan-400">
                      <WorkTypeIcon type={item.type} size={13} />
                      <span>{item.id}</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {item.status}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-200 transition-colors line-clamp-2">
                    {item.title}
                  </div>

                  {/* Verification Status Banner */}
                  <div className="p-2 bg-black/40 rounded border border-white/[0.05] text-[10px] text-slate-400 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Testing Team:</span>
                      <strong className="text-cyan-300 font-medium">
                        {item.status.includes('QA') ? 'QA Specialists' : 'Business / UAT Users'}
                      </strong>
                    </div>
                    <div className="text-slate-500 italic">
                      🔒 Developer status change locked during verification
                    </div>
                  </div>
                </div>
              ))}

              {stages.inVerification.length === 0 && (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No deliverables currently in QA or UAT queue.
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 5: Verified & Ready for Release */}
          <div className="flex-1 flex flex-col h-full bg-[#0A0D15] rounded-xl border border-white/[0.08] overflow-hidden">
            <div className="p-3 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Verified &amp; Released
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-bold">
                  {stages.completed.length}
                </span>
              </div>
            </div>

            <div className="flex-1 p-2 space-y-2.5 overflow-y-auto">
              {stages.completed.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenInspector(item.id)}
                  className="p-3 bg-[#0D1318] hover:bg-[#111A20] border border-emerald-950 rounded-xl space-y-1.5 transition-all cursor-pointer opacity-85 hover:opacity-100"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-400">
                      <WorkTypeIcon type={item.type} size={13} />
                      <span>{item.id}</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {item.status}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-300 line-clamp-1">
                    {item.title}
                  </div>

                  <div className="text-[10px] text-emerald-400/80 font-mono">
                    ✓ All acceptance criteria verified
                  </div>
                </div>
              ))}

              {stages.completed.length === 0 && (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No completed work yet in this filter.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
