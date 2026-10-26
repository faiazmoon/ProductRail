import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  CheckCircle2,
  Plus,
  Settings,
  TrendingUp,
  Layers,
  Check,
  Trash2,
  Clock,
  ArrowRight,
  AlertOctagon,
  X,
  ChevronDown,
  Archive,
  ArrowUpRight,
  Filter,
  Search,
  CheckSquare,
  Zap,
  RotateCcw,
  AlertTriangle,
  Flame,
  ShieldCheck,
  FolderGit2,
} from 'lucide-react';
import { WorkItem, Sprint, SprintMilestones } from '../../types';
import { SprintBurndownChart } from '../dashboard/SprintBurndownChart';
import { WorkTypeIcon, PriorityIcon } from '../common/Icons';
import { calculateWorkingDaysExcludingFriSat } from '../../utils/dateUtils';

export const SprintsView: React.FC = () => {
  const {
    sprints,
    workItems,
    createSprint,
    updateSprint,
    deleteSprint,
    closeSprint,
    updateSprintMilestones,
    updateWorkItem,
    setSelectedWorkId,
    setIsInspectorOpen,
    setActiveTab,
    createRelease,
  } = useApp();

  // Selected Sprint ID (defaults to active sprint or first sprint)
  const [selectedSprintId, setSelectedSprintId] = useState<string>(() => {
    const active = sprints.find((s) => s.status === 'Active');
    return active ? active.id : sprints[0]?.id || 'SP-24';
  });

  const [isSprintDropdownOpen, setIsSprintDropdownOpen] = useState(false);
  const sprintDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sprintDropdownRef.current && !sprintDropdownRef.current.contains(event.target as Node)) {
        setIsSprintDropdownOpen(false);
      }
    };
    if (isSprintDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSprintDropdownOpen]);

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'config' | 'all-sprints'>('overview');
  const [configSavedToast, setConfigSavedToast] = useState(false);

  // Modals state
  const [isCloseSprintModalOpen, setIsCloseSprintModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Table filter state
  const [tableFilter, setTableFilter] = useState<'all' | 'in-progress' | 'qa' | 'uat' | 'completed' | 'added'>('all');
  const [tableSearch, setTableSearch] = useState('');

  const selectedSprint = useMemo(() => {
    return sprints.find((s) => s.id === selectedSprintId) || sprints[0];
  }, [sprints, selectedSprintId]);

  // Configuration form state
  const [formName, setFormName] = useState(selectedSprint?.name || '');
  const [formGoal, setFormGoal] = useState(selectedSprint?.goal || '');
  const [formStatus, setFormStatus] = useState<Sprint['status']>(selectedSprint?.status || 'Active');
  const [formStartDate, setFormStartDate] = useState(selectedSprint?.startDate || '');
  const [formEndDate, setFormEndDate] = useState(selectedSprint?.endDate || '');
  const [formCapacity, setFormCapacity] = useState(selectedSprint?.capacityPoints || 48);
  const [formWorkingDays, setFormWorkingDays] = useState(
    selectedSprint?.workingDays ||
      calculateWorkingDaysExcludingFriSat(selectedSprint?.startDate || '', selectedSprint?.endDate || '') ||
      10
  );

  // Keep form in sync when selected sprint changes
  useEffect(() => {
    if (selectedSprint) {
      setFormName(selectedSprint.name);
      setFormGoal(selectedSprint.goal);
      setFormStatus(selectedSprint.status);
      setFormStartDate(selectedSprint.startDate);
      setFormEndDate(selectedSprint.endDate);
      setFormCapacity(selectedSprint.capacityPoints || 48);
      const calculated = calculateWorkingDaysExcludingFriSat(selectedSprint.startDate, selectedSprint.endDate);
      setFormWorkingDays(calculated > 0 ? calculated : selectedSprint.workingDays || 10);
    }
  }, [selectedSprint?.id]);

  const handleStartDateChange = (dateVal: string) => {
    setFormStartDate(dateVal);
    const autoCalc = calculateWorkingDaysExcludingFriSat(dateVal, formEndDate);
    if (autoCalc > 0) {
      setFormWorkingDays(autoCalc);
    }
  };

  const handleEndDateChange = (dateVal: string) => {
    setFormEndDate(dateVal);
    const autoCalc = calculateWorkingDaysExcludingFriSat(formStartDate, dateVal);
    if (autoCalc > 0) {
      setFormWorkingDays(autoCalc);
    }
  };

  // Work items for this sprint
  const sprintWorkItems = useMemo(() => {
    if (!selectedSprint) return [];
    return workItems.filter((w) => w.sprintId === selectedSprint.id);
  }, [workItems, selectedSprint?.id]);

  const completedItems = useMemo(() => {
    return sprintWorkItems.filter(
      (w) => w.status === 'Released' || w.status === 'Ready for Release'
    );
  }, [sprintWorkItems]);

  const inQaItems = useMemo(() => {
    return sprintWorkItems.filter((w) => w.status === 'Ready for QA' || w.status === 'In QA');
  }, [sprintWorkItems]);

  const inUatItems = useMemo(() => {
    return sprintWorkItems.filter((w) => w.status === 'Ready for UAT' || w.status === 'In UAT');
  }, [sprintWorkItems]);

  const inProgressItems = useMemo(() => {
    return sprintWorkItems.filter(
      (w) =>
        w.status === 'In Development' ||
        w.status === 'To Do' ||
        w.status === 'In QA' ||
        w.status === 'Ready for QA' ||
        w.status === 'In UAT' ||
        w.status === 'Ready for UAT'
    );
  }, [sprintWorkItems]);

  const unfinishedItems = useMemo(() => {
    return sprintWorkItems.filter(
      (w) => w.status !== 'Released' && w.status !== 'Ready for Release' && w.status !== 'Cancelled'
    );
  }, [sprintWorkItems]);

  const addedMidSprintItems = useMemo(() => {
    if (!selectedSprint?.addedWorkIds) return [];
    return sprintWorkItems.filter((w) => selectedSprint.addedWorkIds.includes(w.id));
  }, [sprintWorkItems, selectedSprint?.addedWorkIds]);

  const calculateTotalPoints = (items: WorkItem[]) => {
    return items.reduce((acc, item) => {
      const pts = parseInt(item.estimate || '0', 10);
      return acc + (isNaN(pts) ? 0 : pts);
    }, 0);
  };

  const totalCommittedPoints = calculateTotalPoints(sprintWorkItems);
  const completedPoints = calculateTotalPoints(completedItems);
  const unfinishedPoints = calculateTotalPoints(unfinishedItems);
  const progressPercent = totalCommittedPoints > 0 ? Math.round((completedPoints / totalCommittedPoints) * 100) : 0;

  // Filtered items in table
  const filteredSprintItems = useMemo(() => {
    return sprintWorkItems.filter((item) => {
      // Search
      if (tableSearch.trim()) {
        const query = tableSearch.toLowerCase();
        const ownerName = typeof item.owner === 'object' ? item.owner?.name : (item.owner || '');
        const matchesQuery =
          item.id.toLowerCase().includes(query) ||
          item.title.toLowerCase().includes(query) ||
          ownerName.toLowerCase().includes(query) ||
          item.type.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // Filter
      if (tableFilter === 'in-progress') {
        return inProgressItems.some((i) => i.id === item.id);
      }
      if (tableFilter === 'qa') {
        return inQaItems.some((i) => i.id === item.id);
      }
      if (tableFilter === 'uat') {
        return inUatItems.some((i) => i.id === item.id);
      }
      if (tableFilter === 'completed') {
        return completedItems.some((i) => i.id === item.id);
      }
      if (tableFilter === 'added') {
        return addedMidSprintItems.some((i) => i.id === item.id);
      }

      return true;
    });
  }, [sprintWorkItems, tableFilter, tableSearch, inProgressItems, inQaItems, inUatItems, completedItems, addedMidSprintItems]);

  // Handle Save Sprint Configuration
  const handleSaveConfiguration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSprint) return;

    // Check if status is transitioning to Completed/Closed with unfinished work
    if (
      (formStatus === 'Completed' || formStatus === 'Closed') &&
      selectedSprint.status !== 'Completed' &&
      selectedSprint.status !== 'Closed' &&
      unfinishedItems.length > 0
    ) {
      setIsCloseSprintModalOpen(true);
      return;
    }

    const start = new Date(formStartDate);
    const end = new Date(formEndDate);
    const durationDays = !isNaN(start.getTime()) && !isNaN(end.getTime())
      ? Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
      : 14;

    updateSprint(selectedSprint.id, {
      name: formName,
      goal: formGoal,
      status: formStatus,
      startDate: formStartDate,
      endDate: formEndDate,
      durationDays,
      capacityPoints: Number(formCapacity),
      workingDays: Number(formWorkingDays),
    });

    setConfigSavedToast(true);
    setTimeout(() => setConfigSavedToast(false), 2500);
  };

  const handleDeleteSprint = (sprintIdToDelete: string, sprintNameToDelete: string) => {
    if (
      confirm(
        `Are you sure you want to delete sprint "${sprintNameToDelete}" (${sprintIdToDelete})?\n\nAll committed work items will be safely unassigned and returned to the Product Backlog.`
      )
    ) {
      deleteSprint(sprintIdToDelete);
      const remaining = sprints.filter((s) => s.id !== sprintIdToDelete);
      if (remaining.length > 0) {
        setSelectedSprintId(remaining[0].id);
      }
      setActiveSubTab('all-sprints');
    }
  };

  const handleUnassignItem = (itemId: string, itemTitle: string) => {
    if (confirm(`Unassign "${itemTitle}" (${itemId}) from sprint ${selectedSprint?.name}? It will return to the backlog.`)) {
      updateWorkItem(itemId, { sprintId: undefined, status: 'Backlog' });
      // Update addedWorkIds or committedWorkIds
      if (selectedSprint) {
        updateSprint(selectedSprint.id, {
          committedWorkIds: (selectedSprint.committedWorkIds || []).filter((id) => id !== itemId),
          addedWorkIds: (selectedSprint.addedWorkIds || []).filter((id) => id !== itemId),
        });
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090C] overflow-hidden text-slate-100 font-sans">
      {/* Sprints Navigation Bar */}
      <div className="bg-[#0C1018] border-b border-white/[0.08] px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Calendar size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Active Sprint Suite
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="font-mono text-xs text-slate-300">
                {selectedSprint?.startDate} → {selectedSprint?.endDate}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5" ref={sprintDropdownRef}>
              {/* Custom Sprint Dropdown Switcher (Image 2 Best Practice) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSprintDropdownOpen(!isSprintDropdownOpen)}
                  className="group flex items-center gap-2 px-2.5 py-1 -ml-2.5 rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer text-left focus:outline-none"
                  aria-expanded={isSprintDropdownOpen}
                  title="Click to switch sprint"
                >
                  <span className="font-extrabold text-base text-white tracking-tight group-hover:text-amber-400 transition-colors">
                    {selectedSprint?.name} ({selectedSprint?.id})
                  </span>
                  <ChevronDown
                    size={15}
                    className={`text-slate-400 transition-transform duration-200 group-hover:text-amber-400 ${
                      isSprintDropdownOpen ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      selectedSprint?.status === 'Active'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                        : selectedSprint?.status === 'Planning'
                        ? 'bg-blue-950/80 text-blue-300 border-blue-700/80'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {selectedSprint?.status}
                  </span>
                </button>

                {/* Dropdown Menu Popover */}
                {isSprintDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 z-50 w-80 max-w-[90vw] bg-[#161D2B] border border-white/[0.12] rounded-2xl shadow-2xl shadow-black/80 backdrop-blur-xl p-1.5 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Select Sprint</span>
                      <span className="text-[10px] text-slate-500 font-mono">{sprints.length} available</span>
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-0.5 py-1 pr-0.5 custom-scrollbar">
                      {sprints.map((s) => {
                        const isSelected = s.id === selectedSprint?.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setSelectedSprintId(s.id);
                              setIsSprintDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500/15 text-white border border-amber-500/30'
                                : 'text-slate-300 hover:bg-white/[0.06] hover:text-white border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                  s.status === 'Active'
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : s.status === 'Planning'
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {s.status === 'Active' ? (
                                  <Zap size={14} />
                                ) : s.status === 'Planning' ? (
                                  <Clock size={14} />
                                ) : (
                                  <CheckCircle2 size={14} />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-bold text-white truncate">{s.name}</span>
                                  <span className="text-xs font-mono text-slate-400 shrink-0">({s.id})</span>
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono truncate">
                                  {s.startDate} → {s.endDate}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                                  s.status === 'Active'
                                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                                    : s.status === 'Planning'
                                    ? 'bg-blue-950/80 text-blue-300 border-blue-700/80'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                {s.status}
                              </span>
                              {isSelected && <Check size={15} className="text-amber-400" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Divider & Action Footer */}
                    <div className="border-t border-white/[0.08] my-1" />
                    <div className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSubTab('config');
                          setIsSprintDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                      >
                        <Settings size={14} className="text-slate-400" />
                        <span>Sprint Configuration &amp; Details</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const newId = `SP-${sprints.length + 24}`;
                          const startStr = '2026-11-05';
                          const endStr = '2026-11-18';
                          const workingDays = calculateWorkingDaysExcludingFriSat(startStr, endStr);
                          createSprint({
                            id: newId,
                            name: `Sprint ${sprints.length + 24}`,
                            goal: 'Define key sprint deliverables and objectives.',
                            startDate: startStr,
                            endDate: endStr,
                            capacityPoints: 50,
                            workingDays: workingDays > 0 ? workingDays : 10,
                            status: 'Planning',
                          });
                          setSelectedSprintId(newId);
                          setIsSprintDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Create New Sprint</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Action Controls: Quick Actions & Sub-view Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Add Work to Sprint */}
          {selectedSprint?.status !== 'Closed' && (
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm"
              title="Add backlog work items to this sprint"
            >
              <Plus size={13} />
              <span>Add Backlog Work</span>
            </button>
          )}

          {/* Complete / Close Sprint Button */}
          {selectedSprint?.status === 'Active' && (
            <button
              onClick={() => setIsCloseSprintModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm"
              title="End this sprint and manage unfinished work items"
            >
              <CheckCircle2 size={13} />
              <span>Complete Sprint</span>
            </button>
          )}

          {/* Sub-view Switcher */}
          <div className="flex items-center gap-1 bg-[#121622] p-1 rounded-xl border border-white/[0.08] text-xs">
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeSubTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp size={13} />
              <span>Overview &amp; Work Items</span>
            </button>

            <button
              onClick={() => setActiveSubTab('config')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeSubTab === 'config'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings size={13} />
              <span>Sprint Configuration</span>
            </button>

            <button
              onClick={() => setActiveSubTab('all-sprints')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeSubTab === 'all-sprints'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers size={13} />
              <span>All Sprints ({sprints.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {/* SUB-TAB 1: Overview & Items */}
        {activeSubTab === 'overview' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#0D111A] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider">Sprint Timeline</span>
                  <Calendar size={14} className="text-amber-400" />
                </div>
                <div className="text-sm font-bold text-white">
                  {selectedSprint?.startDate} <span className="text-slate-500 font-normal">→</span> {selectedSprint?.endDate}
                </div>
                <div className="text-xs text-slate-400 flex items-center justify-between pt-1 border-t border-white/[0.06]">
                  <span>Duration: {selectedSprint?.durationDays || 14} days</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {selectedSprint?.workingDays || 10} working days (excl. Fri &amp; Sat)
                  </span>
                </div>
              </div>

              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  totalCommittedPoints > (selectedSprint?.capacityPoints || 48)
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : 'bg-[#0D111A] border-white/[0.08]'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider">Capacity &amp; Velocity</span>
                  <TrendingUp
                    size={14}
                    className={
                      totalCommittedPoints > (selectedSprint?.capacityPoints || 48)
                        ? 'text-rose-400'
                        : 'text-blue-400'
                    }
                  />
                </div>
                <div className="text-base font-bold text-white flex items-baseline gap-1.5">
                  <span
                    className={
                      totalCommittedPoints > (selectedSprint?.capacityPoints || 48)
                        ? 'text-rose-400'
                        : ''
                    }
                  >
                    {totalCommittedPoints} pts committed
                  </span>
                  <span className="text-xs text-slate-400 font-normal">
                    / {selectedSprint?.capacityPoints || 48} cap
                  </span>
                </div>
                <div className="space-y-1 pt-1 border-t border-white/[0.06]">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Progress: {progressPercent}%</span>
                    {totalCommittedPoints > (selectedSprint?.capacityPoints || 48) ? (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <AlertOctagon size={10} />
                        <span>OVER CAPACITY</span>
                      </span>
                    ) : (
                      <span>{completedPoints} pts done</span>
                    )}
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        totalCommittedPoints > (selectedSprint?.capacityPoints || 48)
                          ? 'bg-rose-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(100, progressPercent)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0D111A] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider">Committed Work Items</span>
                  <CheckCircle2 size={14} className="text-emerald-400" />
                </div>
                <div className="text-lg font-bold text-white flex items-baseline gap-2">
                  <span>{sprintWorkItems.length} items</span>
                  <span className="text-xs text-emerald-400 font-semibold font-mono">
                    {completedItems.length} completed
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-white/[0.06] flex items-center justify-between">
                  <span>In Progress: {unfinishedItems.length}</span>
                  <div className="flex items-center gap-3">
                    {completedItems.length > 0 && selectedSprint?.status === 'Active' && (
                      <button
                        onClick={() => {
                          const relName = `${selectedSprint.name} Deployment`;
                          createRelease({
                            name: relName,
                            includedWorkIds: completedItems.map((i) => i.id),
                            status: 'Planning',
                            targetDate: selectedSprint.endDate,
                          });
                          setActiveTab('releases');
                        }}
                        className="text-emerald-400 hover:text-emerald-300 underline font-medium cursor-pointer"
                      >
                        Create Release
                      </button>
                    )}
                    <button
                      onClick={() => setActiveSubTab('config')}
                      className="text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer"
                    >
                      Configure Dates
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0D111A] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider">QA &amp; UAT Pipeline</span>
                  <Clock size={14} className="text-cyan-400" />
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">In QA Verification:</span>
                    <span className="font-mono text-cyan-300 font-bold">{inQaItems.length} items</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">In Business UAT:</span>
                    <span className="font-mono text-teal-300 font-bold">{inUatItems.length} items</span>
                  </div>
                  <div className="flex justify-between text-slate-300 pt-1 border-t border-white/[0.06]">
                    <span className="text-slate-400">Goal:</span>
                    <span className="text-slate-200 truncate max-w-[130px]">
                      {selectedSprint?.goal || 'In Progress'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Burndown Chart Card */}
            <div className="p-5 rounded-2xl bg-[#0D111A] border border-white/[0.08]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <Flame size={16} className="text-amber-400" />
                    <span>{selectedSprint?.name} Burndown &amp; Ideal Velocity</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Remaining committed story points vs. ideal linear trajectory across {selectedSprint?.workingDays || 10} working days.
                  </p>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-blue-950/60 text-blue-300 border border-blue-800">
                  Capacity: {selectedSprint?.capacityPoints || 48} pts
                </span>
              </div>
              <SprintBurndownChart />
            </div>

            {/* Committed Work Items Section */}
            <div className="rounded-2xl bg-[#0D111A] border border-white/[0.08] overflow-hidden">
              <div className="px-5 py-3.5 bg-[#101522] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">
                    Committed Work Items ({sprintWorkItems.length})
                  </h3>
                  <span className="text-xs text-slate-400">· Click any row to inspect &amp; edit</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Search in sprint */}
                  <div className="relative">
                    <Search size={12} className="text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search sprint work..."
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                      className="bg-black/30 border border-white/[0.1] rounded-lg pl-7 pr-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-44"
                    />
                  </div>

                  <button
                    onClick={() => setIsAssignModalOpen(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    <Plus size={12} />
                    <span>Assign Work</span>
                  </button>
                </div>
              </div>

              {/* Quick Filter Tabs */}
              <div className="px-4 py-2 bg-[#0C101A] border-b border-white/[0.06] flex items-center gap-1.5 overflow-x-auto text-xs">
                <button
                  onClick={() => setTableFilter('all')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    tableFilter === 'all'
                      ? 'bg-blue-600/30 text-blue-300 font-bold border border-blue-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All ({sprintWorkItems.length})
                </button>
                <button
                  onClick={() => setTableFilter('in-progress')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    tableFilter === 'in-progress'
                      ? 'bg-blue-600/30 text-blue-300 font-bold border border-blue-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  In Progress ({inProgressItems.length})
                </button>
                <button
                  onClick={() => setTableFilter('qa')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    tableFilter === 'qa'
                      ? 'bg-cyan-600/30 text-cyan-300 font-bold border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  In QA ({inQaItems.length})
                </button>
                <button
                  onClick={() => setTableFilter('uat')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    tableFilter === 'uat'
                      ? 'bg-teal-600/30 text-teal-300 font-bold border border-teal-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  In UAT ({inUatItems.length})
                </button>
                <button
                  onClick={() => setTableFilter('completed')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    tableFilter === 'completed'
                      ? 'bg-emerald-600/30 text-emerald-300 font-bold border border-emerald-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Completed ({completedItems.length})
                </button>
                <button
                  onClick={() => setTableFilter('added')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    tableFilter === 'added'
                      ? 'bg-amber-600/30 text-amber-300 font-bold border border-amber-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Scope Additions ({addedMidSprintItems.length})
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#121724] text-slate-400 border-b border-white/[0.08] font-semibold">
                    <tr>
                      <th className="py-2.5 px-4 w-28">ID</th>
                      <th className="py-2.5 px-4">Title &amp; Requirements</th>
                      <th className="py-2.5 px-4 w-24">Type</th>
                      <th className="py-2.5 px-4 w-36">Commitment Origin</th>
                      <th className="py-2.5 px-4 w-32">Status</th>
                      <th className="py-2.5 px-4 w-24">Priority</th>
                      <th className="py-2.5 px-4 w-20">Pts</th>
                      <th className="py-2.5 px-4 w-36">Owner</th>
                      <th className="py-2.5 px-4 w-20 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] text-slate-300">
                    {filteredSprintItems.map((item) => {
                      const isAddedMidSprint = selectedSprint?.addedWorkIds?.includes(item.id);
                      return (
                        <tr
                          key={item.id}
                          onClick={() => {
                            setSelectedWorkId(item.id);
                            setIsInspectorOpen(true);
                          }}
                          className="hover:bg-white/[0.03] cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-4 font-mono font-bold text-blue-400">
                            {item.id}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white truncate max-w-md">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-sm mt-0.5">
                              {item.acceptanceCriteria || item.requirementDetails || 'No acceptance criteria recorded'}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <WorkTypeIcon type={item.type} size={14} />
                              <span className="text-slate-300 font-medium">{item.type}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {isAddedMidSprint ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/70 text-amber-300 border border-amber-700/60 flex items-center gap-1 w-fit">
                                <span>⚡ Added Mid-Sprint</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-950/50 text-blue-300 border border-blue-800/40 w-fit inline-block">
                                Original Commitment
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                                item.status === 'Released' || item.status === 'Ready for Release'
                                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                                  : item.status === 'Ready for UAT' || item.status === 'In UAT'
                                  ? 'bg-teal-950/80 text-teal-300 border-teal-700/80'
                                  : item.status === 'Ready for QA' || item.status === 'In QA'
                                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700/80'
                                  : item.status === 'In Development'
                                  ? 'bg-blue-950/80 text-blue-300 border-blue-700/80'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <PriorityIcon priority={item.priority} size={13} />
                              <span className="text-slate-300">{item.priority}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-300">
                            {item.estimate || '—'}
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {typeof item.owner === 'object' ? item.owner?.name : (item.owner || 'Unassigned')}
                          </td>
                          <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleUnassignItem(item.id, item.title)}
                              className="p-1 rounded text-slate-500 hover:text-amber-400 hover:bg-white/[0.05] transition-colors"
                              title="Unassign from sprint (return to backlog)"
                            >
                              <RotateCcw size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredSprintItems.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-500">
                          {sprintWorkItems.length === 0 ? (
                            <div className="space-y-2">
                              <p>No work items committed to this sprint yet.</p>
                              <button
                                onClick={() => setIsAssignModalOpen(true)}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                              >
                                <Plus size={13} />
                                <span>Assign Backlog Items Now</span>
                              </button>
                            </div>
                          ) : (
                            <p>No work items match filter "{tableFilter}"</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 2: Sprint Configuration */}
        {activeSubTab === 'config' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl bg-[#0D111A] border border-white/[0.08] space-y-5">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <Settings size={18} className="text-blue-400" />
                    <span>
                      Sprint Configuration: {formName || selectedSprint?.name} ({selectedSprint?.id})
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Define sprint goals, dates, story point capacity, and auto-calculated working days.
                  </p>
                </div>
                {configSavedToast && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-semibold animate-fade-in">
                    <Check size={14} />
                    <span>Configuration &amp; Milestones Saved!</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSaveConfiguration} className="space-y-5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Sprint Name</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                      className="w-full bg-[#121622] border border-white/[0.12] rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Sprint Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full bg-[#121622] border border-white/[0.12] rounded-lg p-2.5 text-white cursor-pointer focus:outline-none focus:border-blue-500"
                    >
                      <option value="Planning">Planning</option>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Sprint Goal</label>
                  <textarea
                    rows={2}
                    value={formGoal}
                    onChange={(e) => setFormGoal(e.target.value)}
                    placeholder="Specify the key business outcome and delivery focus of this sprint..."
                    className="w-full bg-[#121622] border border-white/[0.12] rounded-lg p-2.5 text-white leading-relaxed focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Dates & Capacity with Auto-calculated Working Days */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formStartDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      required
                      className="w-full bg-[#121622] border border-white/[0.12] rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">End Date</label>
                    <input
                      type="date"
                      value={formEndDate}
                      onChange={(e) => handleEndDateChange(e.target.value)}
                      required
                      className="w-full bg-[#121622] border border-white/[0.12] rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Capacity (Pts)</label>
                    <input
                      type="number"
                      value={formCapacity}
                      onChange={(e) => setFormCapacity(Number(e.target.value))}
                      min={1}
                      className="w-full bg-[#121622] border border-white/[0.12] rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      Working Days
                    </label>
                    <input
                      type="number"
                      value={formWorkingDays}
                      onChange={(e) => setFormWorkingDays(Number(e.target.value))}
                      min={1}
                      className="w-full bg-[#121622] border border-emerald-500/50 rounded-lg p-2.5 text-white font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Helper Card for Auto-calculation */}
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span className="text-slate-300">
                      Auto-calculated from Start &amp; End dates:{' '}
                      <strong className="text-emerald-300">{formWorkingDays} Working Days</strong> (excluding Fridays &amp; Saturdays).
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const auto = calculateWorkingDaysExcludingFriSat(formStartDate, formEndDate);
                      if (auto > 0) setFormWorkingDays(auto);
                    }}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-semibold cursor-pointer"
                  >
                    Recalculate
                  </button>
                </div>

                {/* Actions: Save & Delete Sprint */}
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => handleDeleteSprint(selectedSprint.id, selectedSprint.name)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-lg font-bold transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Delete Sprint</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('overview')}
                      className="px-4 py-2.5 text-slate-400 hover:text-white font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all cursor-pointer"
                    >
                      Save Sprint Configuration
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SUB-TAB 3: All Sprints Directory */}
        {activeSubTab === 'all-sprints' && (
          <div className="max-w-6xl mx-auto space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">All Organization Sprints</h3>
                <p className="text-xs text-slate-400">
                  Select any sprint below to inspect deliverables, burndown velocity, or update configuration.
                </p>
              </div>
              <button
                onClick={() => {
                  const newId = `SP-${sprints.length + 24}`;
                  const startStr = '2026-11-05';
                  const endStr = '2026-11-18';
                  const workingDays = calculateWorkingDaysExcludingFriSat(startStr, endStr);
                  createSprint({
                    id: newId,
                    name: `Sprint ${sprints.length + 24}`,
                    goal: 'Define key sprint deliverables and objectives.',
                    startDate: startStr,
                    endDate: endStr,
                    durationDays: 14,
                    workingDays: workingDays || 10,
                    capacityPoints: 50,
                    status: 'Planning',
                    team: 'Core Delivery Team',
                    committedWorkIds: [],
                    addedWorkIds: [],
                  });
                  setSelectedSprintId(newId);
                  setActiveSubTab('config');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>Create New Sprint</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sprints.map((sprint) => {
                const isSelected = sprint.id === selectedSprintId;
                const itemsCount = workItems.filter((w) => w.sprintId === sprint.id).length;
                return (
                  <div
                    key={sprint.id}
                    onClick={() => {
                      setSelectedSprintId(sprint.id);
                      setActiveSubTab('overview');
                    }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? 'bg-[#101726] border-blue-500 shadow-xl shadow-blue-950/40 ring-1 ring-blue-500'
                        : 'bg-[#0D111A] border-white/[0.08] hover:border-slate-500 hover:bg-[#121622]'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-blue-400">
                          {sprint.id}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              sprint.status === 'Active'
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                                : sprint.status === 'Planning'
                                ? 'bg-blue-950/80 text-blue-300 border-blue-700/80'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {sprint.status}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSprint(sprint.id, sprint.name);
                            }}
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                            title="Delete Sprint"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-white leading-snug">
                        {sprint.name}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {sprint.goal || 'No goal statement'}
                      </p>
                    </div>

                    <div className="space-y-2 text-xs pt-3 border-t border-white/[0.06]">
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Timeline:</span>
                        <span className="text-slate-200 font-mono">
                          {sprint.startDate} → {sprint.endDate}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Working Days:</span>
                        <span className="text-emerald-400 font-mono font-semibold">
                          {sprint.workingDays || calculateWorkingDaysExcludingFriSat(sprint.startDate, sprint.endDate) || 10} days
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Capacity:</span>
                        <span className="text-slate-200 font-mono font-semibold">
                          {sprint.capacityPoints || 48} pts · {itemsCount} items
                        </span>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <span className="text-xs text-blue-400 font-bold flex items-center gap-1">
                          <span>{isSelected ? 'Currently Viewing' : 'Select Sprint'}</span>
                          <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SPRINT CLOSURE MODAL (End-to-End PM Governance on Unfinished Work) */}
      {isCloseSprintModalOpen && (
        <SprintClosureModal
          sprint={selectedSprint}
          completedItems={completedItems}
          unfinishedItems={unfinishedItems}
          otherSprints={sprints.filter((s) => s.id !== selectedSprint?.id)}
          onClose={() => setIsCloseSprintModalOpen(false)}
          onConfirm={(action, nextSprintId) => {
            if (selectedSprint) {
              closeSprint(selectedSprint.id, action, nextSprintId);
              setIsCloseSprintModalOpen(false);
              setActiveSubTab('all-sprints');
            }
          }}
        />
      )}

      {/* ASSIGN WORK TO SPRINT MODAL */}
      {isAssignModalOpen && (
        <AssignWorkModal
          sprint={selectedSprint}
          workItems={workItems}
          onClose={() => setIsAssignModalOpen(false)}
          onAssign={(selectedIds) => {
            if (!selectedSprint || selectedIds.length === 0) return;
            selectedIds.forEach((id) => {
              updateWorkItem(id, { sprintId: selectedSprint.id, status: 'In Development' });
            });
            // Record as addedWorkIds if active sprint, or committed if planning
            if (selectedSprint.status === 'Active') {
              updateSprint(selectedSprint.id, {
                addedWorkIds: Array.from(new Set([...(selectedSprint.addedWorkIds || []), ...selectedIds])),
              });
            } else {
              updateSprint(selectedSprint.id, {
                committedWorkIds: Array.from(new Set([...(selectedSprint.committedWorkIds || []), ...selectedIds])),
              });
            }
            setIsAssignModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

// ==========================================
// SPRINT CLOSURE MODAL COMPONENT
// ==========================================
interface SprintClosureModalProps {
  sprint: Sprint;
  completedItems: WorkItem[];
  unfinishedItems: WorkItem[];
  otherSprints: Sprint[];
  onClose: () => void;
  onConfirm: (action: 'backlog' | 'next-sprint' | 'cancel', nextSprintId?: string) => void;
}

const SprintClosureModal: React.FC<SprintClosureModalProps> = ({
  sprint,
  completedItems,
  unfinishedItems,
  otherSprints,
  onClose,
  onConfirm,
}) => {
  const [closureAction, setClosureAction] = useState<'backlog' | 'next-sprint' | 'cancel'>('backlog');
  const [selectedNextSprint, setSelectedNextSprint] = useState<string>(otherSprints[0]?.id || '');

  const completedPoints = completedItems.reduce((acc, i) => acc + (parseInt(i.estimate || '0', 10) || 0), 0);
  const unfinishedPoints = unfinishedItems.reduce((acc, i) => acc + (parseInt(i.estimate || '0', 10) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-100 font-sans">
      <div className="w-full max-w-2xl bg-[#0C1018] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-[#0E131F] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Complete Sprint: {sprint.name} ({sprint.id})
              </h2>
              <p className="text-xs text-slate-400">
                Senior PM Governance: Review completed deliverables and decide the fate of unfinished work.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-400">Completed &amp; Released</span>
              <div className="text-lg font-bold text-white">
                {completedItems.length} items <span className="text-xs text-emerald-300 font-mono">({completedPoints} pts)</span>
              </div>
              <p className="text-[11px] text-slate-400">Ready or shipped to customers.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-400">Unfinished Work</span>
              <div className="text-lg font-bold text-white">
                {unfinishedItems.length} items <span className="text-xs text-amber-300 font-mono">({unfinishedPoints} pts)</span>
              </div>
              <p className="text-[11px] text-slate-400">In Dev, QA, or UAT at sprint cutoff.</p>
            </div>
          </div>

          {/* Unfinished items preview */}
          {unfinishedItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span>Unfinished Items Requiring Routing:</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  Never silently moved without PM confirmation
                </span>
              </div>
              <div className="max-h-36 overflow-y-auto rounded-lg border border-white/[0.08] divide-y divide-white/[0.06] bg-black/30">
                {unfinishedItems.map((item) => (
                  <div key={item.id} className="p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate max-w-sm">
                      <WorkTypeIcon type={item.type} size={13} />
                      <span className="font-mono text-blue-400 font-bold">{item.id}</span>
                      <span className="text-slate-200 truncate">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                        {item.status}
                      </span>
                      <span className="font-mono text-slate-400 text-[11px]">{item.estimate || '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Decision Radio Group */}
          <div className="space-y-3 pt-2">
            <span className="font-bold text-white block">
              How should the {unfinishedItems.length} unfinished work items be handled?
            </span>

            <div className="space-y-2">
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  closureAction === 'backlog'
                    ? 'bg-blue-600/10 border-blue-500 text-white ring-1 ring-blue-500/50'
                    : 'bg-[#101420] border-white/[0.08] text-slate-300 hover:border-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="closureAction"
                  checked={closureAction === 'backlog'}
                  onChange={() => setClosureAction('backlog')}
                  className="mt-0.5 text-blue-600"
                />
                <div>
                  <strong className="block text-white font-semibold">
                    Return to Product Backlog (Recommended)
                  </strong>
                  <span className="text-[11px] text-slate-400">
                    Unassign from this sprint and place into the product backlog for reprioritization during next sprint planning.
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  closureAction === 'next-sprint'
                    ? 'bg-blue-600/10 border-blue-500 text-white ring-1 ring-blue-500/50'
                    : 'bg-[#101420] border-white/[0.08] text-slate-300 hover:border-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="closureAction"
                  checked={closureAction === 'next-sprint'}
                  onChange={() => setClosureAction('next-sprint')}
                  className="mt-0.5 text-blue-600"
                />
                <div className="flex-1">
                  <strong className="block text-white font-semibold">
                    Rollover to Next Sprint
                  </strong>
                  <span className="text-[11px] text-slate-400 block mb-2">
                    Explicitly roll over unfinished items into the next committed sprint cadence.
                  </span>
                  {closureAction === 'next-sprint' && otherSprints.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-medium">Target Sprint:</span>
                      <select
                        value={selectedNextSprint}
                        onChange={(e) => setSelectedNextSprint(e.target.value)}
                        className="bg-[#090C13] border border-white/[0.12] rounded-lg px-2.5 py-1 text-white text-xs"
                      >
                        {otherSprints.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.id}) — {s.status}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  closureAction === 'cancel'
                    ? 'bg-rose-600/10 border-rose-500 text-white ring-1 ring-rose-500/50'
                    : 'bg-[#101420] border-white/[0.08] text-slate-300 hover:border-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="closureAction"
                  checked={closureAction === 'cancel'}
                  onChange={() => setClosureAction('cancel')}
                  className="mt-0.5 text-rose-600"
                />
                <div>
                  <strong className="block text-white font-semibold">
                    Cancel Unfinished Work
                  </strong>
                  <span className="text-[11px] text-slate-400">
                    Deprecate and close unfinished scope as no longer required.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0E131F] border-t border-white/[0.08] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(closureAction, selectedNextSprint)}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-lg shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Check size={14} />
            <span>Complete &amp; Archive Sprint</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// ASSIGN WORK MODAL COMPONENT
// ==========================================
interface AssignWorkModalProps {
  sprint: Sprint;
  workItems: WorkItem[];
  onClose: () => void;
  onAssign: (selectedIds: string[]) => void;
}

const AssignWorkModal: React.FC<AssignWorkModalProps> = ({
  sprint,
  workItems,
  onClose,
  onAssign,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState('all');

  // Candidate items: items not currently in this sprint
  const candidates = useMemo(() => {
    return workItems.filter(
      (w) =>
        w.sprintId !== sprint.id &&
        w.status !== 'Released' &&
        w.status !== 'Archived' &&
        w.status !== 'Cancelled'
    );
  }, [workItems, sprint.id]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((item) => {
      if (areaFilter !== 'all' && !item.productArea?.includes(areaFilter)) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          item.id.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [candidates, areaFilter, searchTerm]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedCount = selectedIds.size;
  const selectedPoints = Array.from(selectedIds).reduce((acc, id) => {
    const it = workItems.find((w) => w.id === id);
    return acc + (parseInt(it?.estimate || '0', 10) || 0);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-100 font-sans">
      <div className="w-full max-w-2xl bg-[#0C1018] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 bg-[#0E131F] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Plus size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Assign Work Items to {sprint.name}
              </h2>
              <p className="text-xs text-slate-400">
                {sprint.status === 'Active'
                  ? 'Note: Assigning to an active sprint will record items as Scope Additions (Added Mid-Sprint).'
                  : 'Items will be committed to the sprint scope.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X size={16} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-[#0A0D15] border-b border-white/[0.06] flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={13} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#121622] border border-white/[0.1] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="bg-[#121622] border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-white cursor-pointer focus:outline-none"
          >
            <option value="all">All Areas</option>
            <option value="Air">Air</option>
            <option value="Hotel">Hotel</option>
            <option value="Bus">Bus</option>
            <option value="Ship">Ship</option>
            <option value="Landing Page">Landing Page</option>
          </select>
        </div>

        {/* Candidate List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1 text-xs divide-y divide-white/[0.06]">
          {filteredCandidates.map((item) => {
            const isSelected = selectedIds.has(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleSelect(item.id)}
                className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-600/15 border border-blue-500/50'
                    : 'hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // handled by parent onClick
                    className="rounded border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <WorkTypeIcon type={item.type} size={15} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-blue-400 font-bold">{item.id}</span>
                      <span className="font-medium text-white truncate max-w-sm">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{Array.isArray(item.productArea) ? item.productArea.join(', ') : item.productArea}</span>
                      <span>·</span>
                      <span>{Array.isArray(item.platform) ? item.platform.join(', ') : item.platform}</span>
                      <span>·</span>
                      <span>Status: {item.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <PriorityIcon priority={item.priority} size={12} />
                    <span className="text-slate-300 text-[11px]">{item.priority}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-200 bg-white/[0.05] px-2 py-0.5 rounded text-[11px]">
                    {item.estimate || '—'}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredCandidates.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              No available candidate work items found.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0E131F] border-t border-white/[0.08] flex items-center justify-between text-xs">
          <div className="text-slate-400">
            Selected: <strong className="text-white">{selectedCount} items</strong> ({selectedPoints} pts)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={selectedCount === 0}
              onClick={() => onAssign(Array.from(selectedIds))}
              className={`px-5 py-2 font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5 ${
                selectedCount > 0
                  ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Check size={14} />
              <span>Commit {selectedCount} Items to Sprint</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
