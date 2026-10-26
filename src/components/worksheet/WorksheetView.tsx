import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { WorksheetGrid } from './WorksheetGrid';
import { WorksheetTimeline } from './WorksheetTimeline';
import { WorksheetBoard } from './WorksheetBoard';
import { SprintTimelineModal } from '../sprint/SprintTimelineModal';
import { WorkItem, ViewMode, SavedViewTab, WorkStatus, PriorityLevel } from '../../types';
import {
  Search,
  Filter,
  Layers,
  Table2,
  Calendar,
  LayoutGrid,
  Download,
  Upload,
  Plus,
  X,
  RotateCcw,
  Check,
  Archive,
  Clock,
  Sparkles,
  Zap,
  CheckSquare,
  Rocket,
  Ticket,
  Bug,
  RefreshCw,
  Bus,
  Lock,
} from 'lucide-react';

interface WorksheetViewProps {
  initialSavedTab?: SavedViewTab;
  onOpenQuickAdd: () => void;
  onOpenExportModal?: () => void;
  onOpenBulkImport?: () => void;
}

export const WorksheetView: React.FC<WorksheetViewProps> = ({
  initialSavedTab,
  onOpenQuickAdd,
  onOpenExportModal,
  onOpenBulkImport,
}) => {
  const {
    workItems,
    config,
    sprints,
    currentUser,
    activeTab: globalActiveTab,
    setActiveTab: setGlobalActiveTab,
    bulkUpdateWorkItems,
    archiveWorkItem,
    unarchiveWorkItem,
    selectedProjectId,
    currentRole,
  } = useApp();

  const isBusinessTeam = currentRole === 'Business' || currentRole === 'UAT';

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Definition of "New Works": Intake and Triage items not yet divided and not in a sprint
  const isNewWork = (w: WorkItem) =>
    (w.status === 'Intake' || w.status === 'Triage') &&
    !w.sprintId &&
    (!w.deliverables || w.deliverables.length === 0);

  // Definition of "Developer": Items actively in development or verification, assigned to a sprint or divided
  const isDeveloperWork = (w: WorkItem) =>
    w.status !== 'Intake' &&
    w.status !== 'Triage' &&
    w.status !== 'Released' &&
    w.status !== 'Archived' &&
    w.status !== 'Cancelled' &&
    w.status !== 'Backlog' &&
    (!!w.sprintId || (w.deliverables && w.deliverables.length > 0));

  const newWorksCount = useMemo(() => {
    return workItems.filter(isNewWork).length;
  }, [workItems]);

  const developerCount = useMemo(() => {
    return workItems.filter(isDeveloperWork).length;
  }, [workItems]);

  // Derive active tab from props or globalActiveTab
  const [activeTab, setActiveTabState] = useState<SavedViewTab>(() => {
    if (initialSavedTab) return initialSavedTab;
    if (globalActiveTab === 'new-works') return 'new-works';
    if (globalActiveTab === 'developer') return 'developer';
    if (globalActiveTab === 'my-work') return 'my-work';
    if (globalActiveTab === 'backlog') return 'backlog';
    if (globalActiveTab === 'archived') return 'archived';
    return 'all';
  });

  // Keep synced with global activeTab
  useEffect(() => {
    if (globalActiveTab === 'new-works') {
      setActiveTabState('new-works');
    } else if (globalActiveTab === 'developer') {
      setActiveTabState('developer');
    } else if (globalActiveTab === 'my-work') {
      setActiveTabState('my-work');
    } else if (globalActiveTab === 'backlog') {
      setActiveTabState('backlog');
    } else if (globalActiveTab === 'archived') {
      setActiveTabState('archived');
    } else if (globalActiveTab === 'all-work' || globalActiveTab === 'worksheet') {
      setActiveTabState('all');
    }
  }, [globalActiveTab]);

  // View mode supports 'board' | 'grid' | 'timeline' (Mirrors modern ClickUp / Linear workspace)
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);

  // Quick Stage / Workflow Filter
  const [quickFilter, setQuickFilter] = useState<'all' | 'qa' | 'uat' | 'releases' | 'tickets' | 'bugs' | 'cr' | 'features'>('all');

  // Filter state
  const [filterArea, setFilterArea] = useState<string>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSprint, setFilterSprint] = useState<string>('all');
  const [filterOperator, setFilterOperator] = useState<string>('all');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Grouping and Sorting
  const [groupBy, setGroupBy] = useState<'none' | 'sprint' | 'area' | 'operator' | 'status' | 'priority' | 'type'>('none');
  const [sortColumn, setSortColumn] = useState<keyof WorkItem | 'sprint' | 'operator'>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Available operators list from current items
  const availableOperators = useMemo(() => {
    const ops = new Set<string>();
    workItems.forEach((w) => {
      if (w.operatorName) ops.add(w.operatorName);
    });
    return Array.from(ops);
  }, [workItems]);

  // Handle Primary Tabs (All Work, Intake, Developer, My Work, Product Backlog, Archived)
  const filteredByTab = useMemo(() => {
    switch (activeTab) {
      case 'new-works':
        return workItems.filter(isNewWork);
      case 'developer':
        return workItems.filter(isDeveloperWork);
      case 'my-work':
        return workItems.filter(
          (w) =>
            w.owner?.name?.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0]) ||
            w.reporter?.name?.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0]) ||
            w.requesterName?.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0])
        );
      case 'backlog':
        return workItems.filter(
          (w) => w.status === 'Backlog'
        );
      case 'archived':
        return workItems.filter((w) => w.status === 'Archived');
      case 'all':
      default:
        return workItems.filter((w) => w.status !== 'Archived');
    }
  }, [workItems, activeTab, currentUser]);

  // Handle Quick Stage Filters (QA, UAT, Releases, Tickets, Bugs, CRs) and search/dropdown filters
  const processedItems = useMemo(() => {
    let result = filteredByTab;

    // Quick Stage Filters
    if (quickFilter === 'qa') {
      result = result.filter(
        (item) => item.status === 'Ready for QA' || item.status === 'In QA' || item.status === 'QA Failed'
      );
    } else if (quickFilter === 'uat') {
      result = result.filter(
        (item) =>
          item.status === 'Ready for UAT' ||
          item.status === 'In UAT' ||
          item.status === 'UAT Failed' ||
          (item.deliverables &&
            item.deliverables.length > 0 &&
            item.deliverables.every((d) => d.status === 'Ready for UAT' || d.status === 'Done'))
      );
    } else if (quickFilter === 'releases') {
      // Releases should specifically be UAT passed features (Full) that are ready to be released or shipped
      result = result.filter(
        (item) =>
          item.status === 'Ready for Release' ||
          item.status === 'Released' ||
          (item.uatCases && item.uatCases.length > 0 && item.uatCases.every((c) => c.result === 'Pass'))
      );
    } else if (quickFilter === 'tickets') {
      result = result.filter(
        (item) =>
          item.isTicket ||
          item.originTicketId ||
          item.tags?.includes('ticket') ||
          item.status === 'Intake' ||
          item.status === 'Triage' ||
          item.source === 'Call Center' ||
          item.source === 'Operations' ||
          !!item.ticketMetadata
      );
    } else if (quickFilter === 'bugs') {
      result = result.filter((item) => item.type === 'Bug');
    } else if (quickFilter === 'cr') {
      result = result.filter((item) => item.type === 'CR');
    } else if (quickFilter === 'features') {
      result = result.filter((item) => item.type === 'Feature');
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.id.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.productArea.some((a) => a.toLowerCase().includes(q)) ||
          item.owner?.name?.toLowerCase().includes(q) ||
          item.platform.some((p) => p.toLowerCase().includes(q)) ||
          (item.operatorName && item.operatorName.toLowerCase().includes(q)) ||
          (item.figmaUrl && item.figmaUrl.toLowerCase().includes(q))
      );
    }

    // Dropdown filters
    if (filterArea !== 'all') {
      result = result.filter(
        (item) => item.productArea.includes(filterArea) || item.productArea.includes('All')
      );
    }
    if (filterPlatform !== 'all') {
      result = result.filter(
        (item) => item.platform.includes(filterPlatform) || item.platform.includes('All')
      );
    }
    if (filterOperator !== 'all') {
      result = result.filter((item) => item.operatorName === filterOperator);
    }
    if (filterType !== 'all') {
      result = result.filter((item) => item.type === filterType);
    }
    if (filterPriority !== 'all') {
      result = result.filter((item) => item.priority === filterPriority);
    }
    if (filterStatus !== 'all') {
      result = result.filter((item) => item.status === filterStatus);
    }
    if (filterSprint !== 'all') {
      if (filterSprint === 'none') {
        result = result.filter((item) => !item.sprintId);
      } else {
        result = result.filter((item) => item.sprintId === filterSprint);
      }
    }
    if (selectedProjectId && selectedProjectId !== 'all') {
      result = result.filter((item) => item.projectId === selectedProjectId);
    }

    // Sort
    result = [...result].sort((a, b) => {
      let valA: any = a[sortColumn as keyof WorkItem];
      let valB: any = b[sortColumn as keyof WorkItem];

      if (sortColumn === 'sprint') {
        valA = a.sprintId || '';
        valB = b.sprintId || '';
      } else if (sortColumn === 'operator') {
        valA = a.operatorName || '';
        valB = b.operatorName || '';
      } else if (sortColumn === 'priority') {
        const weight: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        valA = weight[a.priority as string] || 0;
        valB = weight[b.priority as string] || 0;
      } else if (sortColumn === 'status') {
        const statusOrder = [
          'Intake', 'Triage', 'Backlog', 'To Do', 'In Development',
          'Ready for QA', 'In QA', 'QA Failed', 'Ready for UAT',
          'In UAT', 'UAT Failed', 'Ready for Release', 'Released', 'Archived'
        ];
        valA = statusOrder.indexOf(a.status);
        valB = statusOrder.indexOf(b.status);
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      if (typeof valA === 'string') {
        const cmp = valA.localeCompare(valB || '');
        return sortDirection === 'asc' ? cmp : -cmp;
      }

      return 0;
    });

    return result;
  }, [
    filteredByTab,
    quickFilter,
    searchQuery,
    filterArea,
    filterPlatform,
    filterOperator,
    filterType,
    filterPriority,
    filterStatus,
    filterSprint,
    sortColumn,
    sortDirection,
  ]);

  const handleSort = (col: keyof WorkItem | 'sprint' | 'operator') => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  const hasActiveFilters =
    quickFilter !== 'all' ||
    filterArea !== 'all' ||
    filterPlatform !== 'all' ||
    filterOperator !== 'all' ||
    filterType !== 'all' ||
    filterPriority !== 'all' ||
    filterStatus !== 'all' ||
    filterSprint !== 'all';

  const clearAllFilters = () => {
    setQuickFilter('all');
    setFilterArea('all');
    setFilterPlatform('all');
    setFilterOperator('all');
    setFilterType('all');
    setFilterPriority('all');
    setFilterStatus('all');
    setFilterSprint('all');
    setSearchQuery('');
  };

  // Bulk Actions
  const handleBulkChangeSprint = (sprintId: string) => {
    const ids = Array.from(selectedRowIds);
    bulkUpdateWorkItems(ids, { sprintId: sprintId || undefined });
    setSelectedRowIds(new Set());
  };

  const handleBulkChangeStatus = (status: WorkStatus) => {
    const ids = Array.from(selectedRowIds);
    bulkUpdateWorkItems(ids, { status });
    setSelectedRowIds(new Set());
  };

  const handleBulkArchive = () => {
    Array.from(selectedRowIds).forEach((id) => archiveWorkItem(id));
    setSelectedRowIds(new Set());
  };

  const handleBulkUnarchive = () => {
    Array.from(selectedRowIds).forEach((id) => unarchiveWorkItem(id));
    setSelectedRowIds(new Set());
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090C] overflow-hidden relative font-sans">
      {/* Mobile Streamlined iOS Header (Clean, saves vertical screen space!) */}
      <div className="md:hidden bg-[#0E121A] border-b border-white/[0.08] p-2.5 space-y-2 shrink-0">
        <div className="flex items-center justify-between gap-2">
          {/* iOS Segmented View Mode */}
          <div className="flex items-center bg-[#121622] p-0.5 rounded-xl border border-white/[0.08] text-xs">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'board' ? 'bg-[#007AFF] text-white shadow-sm' : 'text-slate-400'
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'grid' ? 'bg-[#007AFF] text-white shadow-sm' : 'text-slate-400'
              }`}
            >
              Sheet
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'timeline' ? 'bg-[#007AFF] text-white shadow-sm' : 'text-slate-400'
              }`}
            >
              Gantt
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className={`p-1.5 rounded-xl border text-xs font-semibold transition-all ${
                mobileFiltersOpen || hasActiveFilters
                  ? 'bg-[#007AFF]/20 border-[#007AFF] text-[#007AFF]'
                  : 'bg-[#121622] border-white/[0.08] text-slate-300'
              }`}
              title="Search & Filters"
            >
              <Filter size={14} />
            </button>
            <button
              onClick={onOpenQuickAdd}
              className="px-3 py-1.5 bg-[#007AFF] hover:bg-[#0066D6] text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm active:scale-95"
            >
              <Plus size={13} />
              <span>Work</span>
            </button>
          </div>
        </div>

        {/* Collapsible Mobile Search & Filter Panel */}
        {mobileFiltersOpen && (
          <div className="p-2.5 bg-[#121622] rounded-2xl border border-white/[0.08] space-y-2 animate-in fade-in duration-150">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search work..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#090C13] border border-white/[0.1] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none"
              />
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[11px] text-slate-400 font-semibold">Scope:</span>
              <div className="flex items-center gap-1">
                {(['all', 'my-work', 'backlog'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTabState(tab);
                      setGlobalActiveTab(tab === 'all' ? 'all-work' : tab);
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                      activeTab === tab ? 'bg-[#007AFF] text-white' : 'text-slate-400 bg-white/[0.04]'
                    }`}
                  >
                    {tab === 'all' ? 'All' : tab === 'my-work' ? 'My Work' : 'Backlog'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Stage Filter Horizontal Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[10px]">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'qa', label: 'QA Verification' },
            { id: 'uat', label: 'Business UAT' },
            { id: 'features', label: 'Features' },
            { id: 'bugs', label: 'Bugs' },
          ].map((qf) => (
            <button
              key={qf.id}
              onClick={() => setQuickFilter(qf.id as any)}
              className={`px-2.5 py-1 rounded-lg font-bold shrink-0 border whitespace-nowrap ${
                quickFilter === qf.id
                  ? 'bg-[#007AFF] text-white border-[#007AFF]'
                  : 'bg-[#121622] text-slate-400 border-white/[0.08]'
              }`}
            >
              {qf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Toolbars (Preserved exactly as-is on web) */}
      <div className="hidden md:block shrink-0">
      {/* Secondary Clean View Tabs Bar */}
      <div className="bg-[#090C13] border-b border-white/[0.08] px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* View Mode Buttons with colorful punchy icons (Exact ClickUp style) */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.06] text-xs shrink-0">
            {/* Board View (User Screenshot's Primary View) */}
            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'board'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <LayoutGrid size={14} className="text-blue-400" />
              <span>Board</span>
            </button>

            {/* Grid / Spreadsheet View */}
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Table2 size={14} className="text-purple-400" />
              <span>Worksheet</span>
            </button>

            {/* Timeline / Gantt View */}
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-rose-600 text-white shadow-sm shadow-rose-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Calendar size={14} className="text-rose-400" />
              <span>Gantt</span>
            </button>
          </div>

          <span className="w-px h-5 bg-white/[0.08] mx-1 shrink-0" />

          {/* Scope Filters: All Work, Assigned to Me, Backlog, Archived */}
          <div className="flex items-center gap-1 text-xs shrink-0">
            <button
              onClick={() => {
                setActiveTabState('all');
                setGlobalActiveTab('all-work');
              }}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white/[0.1] text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Work
            </button>

            <button
              onClick={() => {
                setActiveTabState('my-work');
                setGlobalActiveTab('my-work');
              }}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'my-work'
                  ? 'bg-white/[0.1] text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Assigned to Me
            </button>

            <button
              onClick={() => {
                setActiveTabState('backlog');
                setGlobalActiveTab('backlog');
              }}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'backlog'
                  ? 'bg-white/[0.1] text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Backlog
            </button>

            <button
              onClick={() => {
                setActiveTabState('archived');
                setGlobalActiveTab('archived');
              }}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'archived'
                  ? 'bg-rose-950/40 text-rose-300 font-bold border border-rose-800/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Archived
            </button>
          </div>
        </div>

        {/* Right side sub-actions: Filter toggle, Search, Add */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
              isFilterPanelOpen || hasActiveFilters
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                : 'bg-white/[0.03] text-slate-400 border-white/[0.08] hover:text-white'
            }`}
          >
            <Filter size={13} />
            <span className="hidden sm:inline">Filter</span>
            {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 ml-0.5" />}
          </button>

          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-blue-900/40 cursor-pointer"
          >
            <Plus size={13} className="stroke-[2.5]" />
            <span>Add Work</span>
          </button>
        </div>
      </div>

      {/* Quick Stage Filters Bar */}
      <div className="bg-[#0A0D15] border-b border-white/[0.06] px-4 py-1.5 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mr-1">
          Stage Filter:
        </span>

        {[
          { id: 'all', label: 'All Items', icon: Layers },
          { id: 'qa', label: 'QA Verification', icon: Zap, color: 'text-cyan-400' },
          { id: 'uat', label: 'Business UAT', icon: CheckSquare, color: 'text-teal-400' },
          { id: 'releases', label: 'Releases & Deploy', icon: Rocket, color: 'text-indigo-400' },
          { id: 'tickets', label: 'Tickets & Intake', icon: Ticket, color: 'text-amber-400' },
          { id: 'bugs', label: 'Bugs Only', icon: Bug, color: 'text-rose-400' },
          { id: 'cr', label: 'Change Requests', icon: RefreshCw, color: 'text-orange-400' },
          { id: 'features', label: 'Features', icon: Sparkles, color: 'text-purple-400' },
        ].map((qf) => {
          const Icon = qf.icon;
          const isSelected = quickFilter === qf.id;
          return (
            <button
              key={qf.id}
              onClick={() => setQuickFilter(qf.id as any)}
              className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-[#121622] text-slate-300 border-white/[0.08] hover:text-white hover:bg-[#161c2b]'
              }`}
            >
              <Icon size={12} className={isSelected ? 'text-white' : qf.color || 'text-slate-400'} />
              <span>{qf.label}</span>
            </button>
          );
        })}
      </div>

      {/* Control Bar: Search, Filters, Grouping, Import, Export, and ONLY ONE [+ Add Work] in the bottom right */}
      <div className="p-3 bg-[#0D111A] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
          <div className="relative w-full">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search work, ID, owner, operator (Hanif, Modhumoti), Figma..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121622] border border-white/[0.12] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Filter, Group & Actions Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
              hasActiveFilters
                ? 'bg-blue-950/60 border-blue-500 text-blue-300'
                : 'bg-[#121622] border-white/[0.12] text-slate-300 hover:bg-[#161c2b] hover:text-white'
            }`}
          >
            <Filter size={13} />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
            )}
          </button>

          {/* Grouping select */}
          <div className="flex items-center gap-1.5 bg-[#121622] border border-white/[0.12] rounded-lg px-2.5 py-1">
            <Layers size={13} className="text-slate-400" />
            <span className="text-slate-400 text-[11px] font-semibold">Group:</span>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="bg-transparent border-0 text-xs font-medium text-slate-200 focus:ring-0 cursor-pointer py-0 pl-0 pr-4"
            >
              <option value="none">None</option>
              <option value="sprint">Sprint</option>
              <option value="area">Product Area</option>
              <option value="operator">Bus / Ship Operator</option>
              <option value="status">Status</option>
              <option value="priority">Priority</option>
              <option value="type">Work Type</option>
            </select>
          </div>

          {/* Bulk Import Button */}
          {onOpenBulkImport && (
            <button
              onClick={onOpenBulkImport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#121622] hover:bg-[#161c2b] text-blue-400 hover:text-blue-300 border border-white/[0.12] rounded-lg font-bold transition-colors cursor-pointer"
              title="Bulk import from Excel/CSV with demo template"
            >
              <Upload size={13} />
              <span>Import</span>
            </button>
          )}

          {/* Export Button */}
          {onOpenExportModal && (
            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#121622] hover:bg-[#161c2b] text-slate-300 hover:text-white border border-white/[0.12] rounded-lg font-bold transition-colors cursor-pointer"
            >
              <Download size={13} />
              <span>Export</span>
            </button>
          )}

          {/* Single [+ Add Work] kept right here at bottom right of toolbar (Prompt: "Keep the one thats in the bottom right") */}
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg font-bold transition-all shadow-sm shadow-blue-900/40 cursor-pointer"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span>Add Work</span>
          </button>
        </div>
      </div>
      </div>

      {/* Removable Filter Chips */}
      {hasActiveFilters && (
        <div className="px-4 py-1.5 bg-black/40 border-b border-white/[0.06] flex items-center gap-2 flex-wrap text-[11px]">
          <span className="text-slate-400 font-semibold">Active Filters:</span>
          {quickFilter !== 'all' && (
            <span className="flex items-center gap-1 bg-[#141824] text-blue-300 px-2 py-0.5 rounded border border-blue-900/60 font-semibold">
              <span>Stage: {quickFilter.toUpperCase()}</span>
              <X size={11} className="cursor-pointer hover:text-white" onClick={() => setQuickFilter('all')} />
            </span>
          )}
          {filterArea !== 'all' && (
            <span className="flex items-center gap-1 bg-[#141824] text-amber-300 px-2 py-0.5 rounded border border-amber-900/60 font-semibold">
              <span>Area: {filterArea}</span>
              <X size={11} className="cursor-pointer hover:text-white" onClick={() => setFilterArea('all')} />
            </span>
          )}
          {filterOperator !== 'all' && (
            <span className="flex items-center gap-1 bg-[#141824] text-emerald-300 px-2 py-0.5 rounded border border-emerald-900/60 font-semibold">
              <span>Operator: {filterOperator}</span>
              <X size={11} className="cursor-pointer hover:text-white" onClick={() => setFilterOperator('all')} />
            </span>
          )}
          {filterPlatform !== 'all' && (
            <span className="flex items-center gap-1 bg-[#141824] text-blue-300 px-2 py-0.5 rounded border border-blue-900/60 font-semibold">
              <span>Platform: {filterPlatform}</span>
              <X size={11} className="cursor-pointer hover:text-white" onClick={() => setFilterPlatform('all')} />
            </span>
          )}
          {filterType !== 'all' && (
            <span className="flex items-center gap-1 bg-[#141824] text-slate-200 px-2 py-0.5 rounded border border-white/[0.1] font-semibold">
              <span>Type: {filterType}</span>
              <X size={11} className="cursor-pointer hover:text-white" onClick={() => setFilterType('all')} />
            </span>
          )}
          {filterStatus !== 'all' && (
            <span className="flex items-center gap-1 bg-[#141824] text-slate-200 px-2 py-0.5 rounded border border-white/[0.1] font-semibold">
              <span>Status: {filterStatus}</span>
              <X size={11} className="cursor-pointer hover:text-white" onClick={() => setFilterStatus('all')} />
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-blue-400 hover:text-blue-300 ml-1 underline cursor-pointer font-bold"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Filter Dropdown Popover */}
      {isFilterPanelOpen && (
        <div className="p-4 bg-[#0D111A] border-b border-white/[0.1] shadow-2xl grid grid-cols-2 md:grid-cols-7 gap-3 text-xs shrink-0 animate-in fade-in duration-100">
          <div>
            <label className="text-slate-400 font-semibold block mb-1">Product Area</label>
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="w-full bg-[#121622] border border-white/[0.12] rounded-lg px-2.5 py-1.5 text-slate-200 cursor-pointer"
            >
              <option value="all">All Areas</option>
              {config.productAreas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Bus / Ship Operator</label>
            <select
              value={filterOperator}
              onChange={(e) => setFilterOperator(e.target.value)}
              className="w-full bg-[#121622] border border-white/[0.12] rounded-lg px-2.5 py-1.5 text-slate-200 cursor-pointer"
            >
              <option value="all">All Operators</option>
              {availableOperators.map((op) => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Platform</label>
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="w-full bg-[#121622] border border-white/[0.12] rounded-lg px-2.5 py-1.5 text-slate-200 cursor-pointer"
            >
              <option value="all">All Platforms</option>
              {config.platforms.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-[#121622] border border-white/[0.12] rounded-lg px-2.5 py-1.5 text-slate-200 cursor-pointer"
            >
              <option value="all">All Types</option>
              {config.workTypes.map((t) => (
                <option key={t.name} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full bg-[#121622] border border-white/[0.12] rounded-lg px-2.5 py-1.5 text-slate-200 cursor-pointer"
            >
              <option value="all">All Priorities</option>
              {config.priorities.map((pr) => (
                <option key={pr.name} value={pr.name}>{pr.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-[#121622] border border-white/[0.12] rounded-lg px-2.5 py-1.5 text-slate-200 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              {[
                'Intake',
                'Triage',
                'Backlog',
                'To Do',
                'In Development',
                'Ready for QA',
                'In QA',
                'QA Failed',
                'Ready for UAT',
                'In UAT',
                'UAT Failed',
                'Ready for Release',
                'Released',
              ].map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Sprint</label>
            <select
              value={filterSprint}
              onChange={(e) => setFilterSprint(e.target.value)}
              className="w-full bg-[#121622] border border-white/[0.12] rounded-lg px-2.5 py-1.5 text-slate-200 cursor-pointer"
            >
              <option value="all">All Sprints</option>
              <option value="none">Backlog (No Sprint)</option>
              {sprints.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Main View Area: Board (Matches ClickUp Kanban screenshot), Grid (Spreadsheet) or Timeline (Gantt) */}
      {viewMode === 'board' && (
        <WorksheetBoard items={processedItems} onOpenQuickAdd={onOpenQuickAdd} />
      )}

      {viewMode === 'grid' && (
        <WorksheetGrid
          items={processedItems}
          selectedRowIds={selectedRowIds}
          setSelectedRowIds={setSelectedRowIds}
          groupBy={groupBy}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          activeAreaFilter={filterArea !== 'all' ? filterArea : undefined}
          activePlatformFilter={filterPlatform !== 'all' ? filterPlatform : undefined}
          activeSprintFilter={filterSprint !== 'all' && filterSprint !== 'none' ? filterSprint : undefined}
        />
      )}

      {viewMode === 'timeline' && <WorksheetTimeline items={processedItems} />}

      {/* Floating Bulk Actions Bar */}
      {selectedRowIds.size > 0 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-[#0E131D]/95 backdrop-blur-md border border-white/[0.15] rounded-xl shadow-2xl px-4 py-2.5 flex items-center gap-3 z-40 text-xs animate-in slide-in-from-bottom-3 duration-150">
          <span className="font-semibold text-slate-200 whitespace-nowrap">
            {selectedRowIds.size} selected
          </span>

          <span className="text-slate-600">|</span>

          <select
            onChange={(e) => handleBulkChangeSprint(e.target.value)}
            className="bg-[#121622] border border-white/[0.12] rounded-lg px-2 py-1 text-xs text-slate-200 cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>Move to Sprint...</option>
            <option value="">Move to Backlog</option>
            {sprints.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
            ))}
          </select>

          {isBusinessTeam ? (
            <span
              className="text-[11px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 flex items-center gap-1 font-mono"
              title="Status locked: Business team cannot change work item status"
            >
              <Lock size={11} /> Status Locked for Business
            </span>
          ) : (
            <select
              onChange={(e) => handleBulkChangeStatus(e.target.value as WorkStatus)}
              className="bg-[#121622] border border-white/[0.12] rounded-lg px-2 py-1 text-xs text-slate-200 cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled>Set Status...</option>
              {[
                'To Do',
                'In Development',
                'Ready for QA',
                'In QA',
                'Ready for UAT',
                'In UAT',
                'Ready for Release',
                'Released',
              ].map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          )}

          {activeTab === 'archived' ? (
            <button
              onClick={handleBulkUnarchive}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/50 border border-emerald-800/60 rounded transition-colors cursor-pointer"
              title="Restore / Unarchive Selected"
            >
              <RotateCcw size={13} />
              <span>Unarchive</span>
            </button>
          ) : (
            <button
              onClick={handleBulkArchive}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-950/50 border border-amber-800/60 rounded transition-colors cursor-pointer"
              title="Archive Selected"
            >
              <Archive size={13} />
              <span>Archive</span>
            </button>
          )}

          <button
            onClick={() => setSelectedRowIds(new Set())}
            className="p-1 text-slate-400 hover:text-white cursor-pointer"
            title="Clear Selection"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Sprint Timelines Definition Modal */}
      <SprintTimelineModal
        isOpen={isSprintModalOpen}
        onClose={() => setIsSprintModalOpen(false)}
      />
    </div>
  );
};
