import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkItem, QaTestCase } from '../../types';
import { WorkTypeIcon, PriorityIcon } from '../common/Icons';
import {
  Zap,
  CheckCircle2,
  AlertOctagon,
  XCircle,
  Plus,
  ArrowRight,
  Bug,
  Upload,
  User,
  ExternalLink,
  RotateCcw,
  Sparkles,
  ClipboardPaste,
  ShieldCheck,
  Search,
  Filter,
  Check,
  Edit2,
  Trash2,
  Table,
  CheckCheck,
  AlertTriangle,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { BulkTestCaseModal } from '../common/BulkTestCaseModal';
import { QaPromoteModal } from './QaPromoteModal';

export const QaWorkspace: React.FC = () => {
  const {
    workItems,
    updateQaCaseResult,
    deleteQaTestCase,
    updateQaTestCase,
    createBugFromQaFail,
    setSelectedWorkId,
    setIsInspectorOpen,
    currentUser,
    updateWorkItem,
    promoteQaToUat,
  } = useApp();

  // Primary filters & search
  const [activeFilter, setActiveFilter] = useState<'ready' | 'testing' | 'failed' | 'retest' | 'passed' | 'all'>('ready');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [selectedProductArea, setSelectedProductArea] = useState<string>('All');

  // Modals state
  const [failingModalCase, setFailingModalCase] = useState<{ work: WorkItem; testCase: QaTestCase } | null>(null);
  const [bugTitle, setBugTitle] = useState('');
  const [bugActualText, setBugActualText] = useState('');

  // Bulk Modal state
  const [bulkModalState, setBulkModalState] = useState<{
    work: WorkItem;
    tab: 'paste' | 'grid' | 'ac';
  } | null>(null);

  // Promote Modal state
  const [promoteModalWork, setPromoteModalWork] = useState<WorkItem | null>(null);

  // Inline Quick Add state
  const [addingCaseForId, setAddingCaseForId] = useState<string | null>(null);
  const [quickScenario, setQuickScenario] = useState('');
  const [quickExpected, setQuickExpected] = useState('');

  // Inline Edit Test Case state
  const [editingCase, setEditingCase] = useState<{
    workId: string;
    caseId: string;
    scenario: string;
    expected: string;
  } | null>(null);

  // Global "Add Test Cases to Any Work Item" dropdown
  const [isItemSelectorOpen, setIsItemSelectorOpen] = useState(false);

  // Filter items relevant to QA
  const filteredQaItems = useMemo(() => {
    return workItems.filter((w) => {
      const hasCases = (w.qaCases?.length || 0) > 0;
      const isQaStage =
        w.status === 'Ready for QA' ||
        w.status === 'In QA' ||
        w.status === 'QA Failed' ||
        w.status === 'Ready for UAT';

      // Status filter
      let matchesStatus = true;
      if (activeFilter === 'ready') matchesStatus = w.status === 'Ready for QA';
      else if (activeFilter === 'testing') matchesStatus = w.status === 'In QA';
      else if (activeFilter === 'failed') matchesStatus = w.status === 'QA Failed' || (w.qaCases || []).some((c) => c.result === 'Fail');
      else if (activeFilter === 'retest') matchesStatus = w.type === 'Bug' && (w.status === 'In QA' || w.status === 'Ready for QA');
      else if (activeFilter === 'passed') matchesStatus = (w.qaCases || []).length > 0 && (w.qaCases || []).every((c) => c.result === 'Pass');
      else if (activeFilter === 'all') matchesStatus = hasCases || isQaStage;

      if (!matchesStatus) return false;

      // Platform filter
      if (selectedPlatform !== 'All' && !w.platform.includes(selectedPlatform)) {
        return false;
      }

      // Product Area filter
      if (selectedProductArea !== 'All' && !w.productArea.includes(selectedProductArea)) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = w.title.toLowerCase().includes(query);
        const matchesId = w.id.toLowerCase().includes(query);
        const matchesScenarios = (w.qaCases || []).some(
          (c) => c.scenario.toLowerCase().includes(query) || c.expected.toLowerCase().includes(query)
        );
        if (!matchesTitle && !matchesId && !matchesScenarios) return false;
      }

      return true;
    });
  }, [workItems, activeFilter, selectedPlatform, selectedProductArea, searchQuery]);

  // Aggregate Quality Metrics
  const metrics = useMemo(() => {
    let totalScenarios = 0;
    let passedScenarios = 0;
    let failedScenarios = 0;
    let blockedScenarios = 0;
    let untestedScenarios = 0;
    let itemsReadyForUat = 0;

    workItems.forEach((w) => {
      if (w.status === 'Ready for UAT') itemsReadyForUat++;
      (w.qaCases || []).forEach((c) => {
        totalScenarios++;
        if (c.result === 'Pass') passedScenarios++;
        else if (c.result === 'Fail') failedScenarios++;
        else if (c.result === 'Blocked') blockedScenarios++;
        else untestedScenarios++;
      });
    });

    const passRate = totalScenarios > 0 ? Math.round((passedScenarios / totalScenarios) * 100) : 0;

    return {
      totalScenarios,
      passedScenarios,
      failedScenarios,
      blockedScenarios,
      untestedScenarios,
      passRate,
      itemsReadyForUat,
    };
  }, [workItems]);

  const handleAddQuickTestCase = (workId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!quickScenario.trim()) return;

    const work = workItems.find((w) => w.id === workId);
    if (!work) return;

    const newCase: QaTestCase = {
      id: `TC-${String((work.qaCases?.length || 0) + 1).padStart(2, '0')}`,
      workId,
      scenario: quickScenario.trim(),
      expected: quickExpected.trim() || 'Verified functionality',
      result: 'Untested',
    };

    updateWorkItem(workId, {
      qaCases: [...(work.qaCases || []), newCase],
    });

    setQuickScenario('');
    setQuickExpected('');
    setAddingCaseForId(null);
  };

  const handleOpenFailModal = (work: WorkItem, tc: QaTestCase) => {
    setFailingModalCase({ work, testCase: tc });
    setBugTitle(`${tc.scenario} failed [Bug from ${work.id}]`);
    setBugActualText(tc.actual || 'Behavior did not match expected criteria');
  };

  const handleConfirmFailAndCreateBug = (e: React.FormEvent) => {
    e.preventDefault();
    if (!failingModalCase) return;

    updateQaCaseResult(
      failingModalCase.work.id,
      failingModalCase.testCase.id,
      'Fail',
      'failure_trace_log.txt',
      bugActualText
    );

    createBugFromQaFail(
      failingModalCase.work.id,
      failingModalCase.testCase.id,
      bugTitle,
      bugActualText
    );

    setFailingModalCase(null);
  };

  const handlePassAllUntested = (work: WorkItem) => {
    const cases = work.qaCases || [];
    cases.forEach((tc) => {
      if (tc.result === 'Untested' || tc.result === 'Blocked') {
        updateQaCaseResult(work.id, tc.id, 'Pass');
      }
    });
  };

  const handleResetAllCases = (work: WorkItem) => {
    const cases = work.qaCases || [];
    cases.forEach((tc) => {
      updateQaCaseResult(work.id, tc.id, 'Untested');
    });
  };

  const handleSaveEditCase = () => {
    if (!editingCase || !editingCase.scenario.trim()) return;
    updateQaTestCase(editingCase.workId, editingCase.caseId, {
      scenario: editingCase.scenario.trim(),
      expected: editingCase.expected.trim() || 'Verified functionality',
    });
    setEditingCase(null);
  };

  // Available work items to add test cases to
  const allEligibleWorks = useMemo(() => {
    return workItems.filter(
      (w) => w.status !== 'Released' && w.status !== 'Archived' && w.status !== 'Cancelled'
    );
  }, [workItems]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090d] overflow-hidden text-slate-100 font-sans">
      {/* QA Header & Controls */}
      <div className="p-4 bg-[#0c1017] border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-cyan-400" />
            <h1 className="text-base font-bold text-white tracking-tight">
              QA Verification &amp; Test Suite
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-xs font-semibold">
              {metrics.passRate}% Pass Rate
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Verify implementations, bulk paste test matrices, generate from PO acceptance criteria, and promote to Business UAT.
          </p>
        </div>

        {/* Global Action: Add Test Cases to Any Work Item */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setIsItemSelectorOpen(!isItemSelectorOpen)}
              className="px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Table size={13} />
              <span>Bulk Create Tests for Item...</span>
              <ChevronDown size={13} />
            </button>

            {isItemSelectorOpen && (
              <div className="absolute right-0 mt-1.5 w-80 bg-[#0c1017] border border-cyan-800/80 rounded-xl shadow-2xl p-2 z-50 text-xs space-y-1">
                <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Work Item to Prepare Tests:
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-white/[0.05]">
                  {allEligibleWorks.slice(0, 15).map((w) => (
                    <button
                      key={w.id}
                      onClick={() => {
                        setIsItemSelectorOpen(false);
                        setBulkModalState({ work: w, tab: 'paste' });
                      }}
                      className="w-full text-left p-2 rounded hover:bg-cyan-950/40 hover:text-cyan-300 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <div className="truncate">
                        <span className="font-mono text-slate-400 font-semibold mr-1.5">
                          {w.id}
                        </span>
                        <span className="text-slate-200">{w.title}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 whitespace-nowrap">
                        {w.status}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 px-4 py-2.5 bg-[#090d14] border-b border-slate-800 text-xs shrink-0">
        <div className="px-3 py-1.5 bg-black/40 border border-white/[0.05] rounded-lg">
          <span className="text-[10px] text-slate-500 font-mono uppercase block">Total Scenarios</span>
          <span className="text-sm font-bold text-white font-mono">{metrics.totalScenarios}</span>
        </div>
        <div className="px-3 py-1.5 bg-black/40 border border-white/[0.05] rounded-lg">
          <span className="text-[10px] text-emerald-400/80 font-mono uppercase block">Passed</span>
          <span className="text-sm font-bold text-emerald-400 font-mono">
            {metrics.passedScenarios} ({metrics.passRate}%)
          </span>
        </div>
        <div className="px-3 py-1.5 bg-black/40 border border-white/[0.05] rounded-lg">
          <span className="text-[10px] text-rose-400/80 font-mono uppercase block">Failed / Bugs</span>
          <span className="text-sm font-bold text-rose-400 font-mono">{metrics.failedScenarios}</span>
        </div>
        <div className="px-3 py-1.5 bg-black/40 border border-white/[0.05] rounded-lg">
          <span className="text-[10px] text-amber-400/80 font-mono uppercase block">Blocked</span>
          <span className="text-sm font-bold text-amber-400 font-mono">{metrics.blockedScenarios}</span>
        </div>
        <div className="px-3 py-1.5 bg-black/40 border border-white/[0.05] rounded-lg">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Untested</span>
          <span className="text-sm font-bold text-slate-300 font-mono">{metrics.untestedScenarios}</span>
        </div>
        <div className="px-3 py-1.5 bg-black/40 border border-white/[0.05] rounded-lg">
          <span className="text-[10px] text-teal-400/80 font-mono uppercase block">UAT Ready / Handoff</span>
          <span className="text-sm font-bold text-teal-400 font-mono">{metrics.itemsReadyForUat}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-[#0a0e16] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
        {/* Stage Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
          {[
            { id: 'ready', label: 'Ready for QA' },
            { id: 'testing', label: 'In QA' },
            { id: 'failed', label: 'Failed' },
            { id: 'retest', label: 'Retests' },
            { id: 'passed', label: 'Passed' },
            { id: 'all', label: 'All Items' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search & Facets */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2 text-slate-500" />
            <input
              type="text"
              placeholder="Search ID, title, scenario..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black/50 border border-white/[0.1] rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 w-44 md:w-56"
            />
          </div>

          {/* Platform Facet */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="bg-black/50 border border-white/[0.1] rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="All">All Platforms</option>
            <option value="Android">Android</option>
            <option value="iOS">iOS</option>
            <option value="Web">Web</option>
            <option value="Admin/CMS">Admin/CMS</option>
            <option value="Backend/System">Backend/System</option>
            <option value="API">API</option>
          </select>

          {/* Product Area Facet */}
          <select
            value={selectedProductArea}
            onChange={(e) => setSelectedProductArea(e.target.value)}
            className="bg-black/50 border border-white/[0.1] rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="All">All Areas</option>
            <option value="Bus">Bus</option>
            <option value="Ship">Ship</option>
            <option value="Air">Air</option>
            <option value="Hotel">Hotel</option>
          </select>
        </div>
      </div>

      {/* QA Work Cards List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredQaItems.map((work) => {
          const testCases = work.qaCases || [];
          const passCount = testCases.filter((c) => c.result === 'Pass').length;
          const failCount = testCases.filter((c) => c.result === 'Fail').length;
          const blockedCount = testCases.filter((c) => c.result === 'Blocked').length;
          const untestedCount = testCases.filter((c) => c.result === 'Untested').length;
          const allPassed = testCases.length > 0 && passCount === testCases.length;

          return (
            <div
              key={work.id}
              className={`bg-[#0d111a] border rounded-xl p-4 md:p-5 space-y-4 shadow-sm transition-all ${
                allPassed
                  ? 'border-emerald-700/50 bg-gradient-to-b from-[#0d151c] to-[#0d111a]'
                  : failCount > 0
                  ? 'border-rose-900/60 bg-gradient-to-b from-[#160e14] to-[#0d111a]'
                  : 'border-slate-800'
              }`}
            >
              {/* Header row of Work Item */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <WorkTypeIcon type={work.type} size={15} />
                    <span className="font-mono text-xs font-bold text-slate-300">{work.id}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-slate-400">{work.productArea.join(', ')}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-slate-400">{work.platform.join(', ')}</span>
                    {work.sprintId && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="text-xs font-mono text-amber-300">{work.sprintId}</span>
                      </>
                    )}
                    {work.qaSignOff && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="text-teal-400 font-sans font-semibold text-[11px] flex items-center gap-1">
                          <ShieldCheck size={12} />
                          QA Verified by {work.qaSignOff.tester}
                        </span>
                      </>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-white">{work.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right text-xs font-mono">
                    <div className="text-slate-300 font-semibold">
                      {passCount}/{testCases.length} Passed
                    </div>
                    {failCount > 0 && (
                      <div className="text-rose-400 font-bold">{failCount} Failed</div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedWorkId(work.id);
                      setIsInspectorOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                    title="Open Inspector"
                  >
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>

              {/* Requirement Summary */}
              {work.requirementDetails && (
                <div className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400 font-semibold block mb-0.5">Verification Target:</span>
                  <div className="line-clamp-2">{work.requirementDetails}</div>
                </div>
              )}

              {/* QA Test Cases Suite Toolbar */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="uppercase tracking-wider">Test Scenarios ({testCases.length})</span>
                    {allPassed && (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[10px] font-bold">
                        100% QA VERIFIED
                      </span>
                    )}
                  </div>

                  {/* Actions for this Work Item */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* 1. Generate from AC button */}
                    <button
                      onClick={() => setBulkModalState({ work, tab: 'ac' })}
                      className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Generate test scenarios directly from Acceptance Criteria & requirements"
                    >
                      <Sparkles size={12} className="text-amber-400" />
                      <span>⚡ Generate from AC</span>
                    </button>

                    {/* 2. Bulk Add / Paste button */}
                    <button
                      onClick={() => setBulkModalState({ work, tab: 'paste' })}
                      className="px-2.5 py-1 bg-cyan-600/15 hover:bg-cyan-600/25 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Paste test matrix from Excel, Sheets, or Notion"
                    >
                      <ClipboardPaste size={12} />
                      <span>Bulk Add / Paste</span>
                    </button>

                    {/* 3. Inline Single Add */}
                    <button
                      onClick={() => setAddingCaseForId(addingCaseForId === work.id ? null : work.id)}
                      className="text-slate-400 hover:text-white flex items-center gap-1 font-semibold text-xs px-2 py-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>{addingCaseForId === work.id ? 'Cancel' : 'Quick Single'}</span>
                    </button>

                    {/* 4. Pass All Untested shortcut */}
                    {untestedCount > 0 && (
                      <button
                        onClick={() => handlePassAllUntested(work)}
                        className="text-emerald-400 hover:text-emerald-300 text-[11px] font-medium px-2 py-1 hover:bg-emerald-950/40 rounded transition-colors cursor-pointer"
                        title="Mark all untested scenarios as Passed"
                      >
                        Pass Remaining ({untestedCount})
                      </button>
                    )}

                    {/* 5. PROMOTE TO UAT BUTTON */}
                    <button
                      onClick={() => setPromoteModalWork(work)}
                      className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                        allPassed || work.status === 'Ready for UAT'
                          ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-teal-950/40'
                          : 'bg-teal-950/80 hover:bg-teal-900 text-teal-300 border border-teal-700/80'
                      }`}
                    >
                      <ShieldCheck size={13} />
                      <span>
                        {work.status === 'Ready for UAT'
                          ? 'Promoted to UAT (Handoff)'
                          : 'Promote QA to UAT'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Inline Quick Add Test Scenario Form */}
                {addingCaseForId === work.id && (
                  <form
                    onSubmit={(e) => handleAddQuickTestCase(work.id, e)}
                    className="p-3 bg-black/60 border border-cyan-900/60 rounded-xl space-y-2 text-xs animate-in fade-in duration-100"
                  >
                    <div className="font-semibold text-cyan-300 text-[11px]">
                      New QA Test Scenario for {work.id}:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Scenario (e.g. Verify lock is released when user cancels)..."
                        value={quickScenario}
                        onChange={(e) => setQuickScenario(e.target.value)}
                        required
                        className="bg-[#121620] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-500"
                      />
                      <input
                        type="text"
                        placeholder="Expected Result (e.g. Seats return to available in real time)..."
                        value={quickExpected}
                        onChange={(e) => setQuickExpected(e.target.value)}
                        className="bg-[#121620] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setAddingCaseForId(null)}
                        className="px-2.5 py-1 text-slate-400 hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold text-xs cursor-pointer"
                      >
                        Save Test Scenario
                      </button>
                    </div>
                  </form>
                )}

                {/* Scenarios Table */}
                <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                  {testCases.map((tc) => {
                    const isEditing =
                      editingCase?.workId === work.id && editingCase?.caseId === tc.id;

                    return (
                      <div
                        key={tc.id}
                        className="p-3 flex flex-wrap sm:flex-nowrap items-start justify-between gap-4 text-xs hover:bg-slate-900/40 transition-colors"
                      >
                        {isEditing ? (
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={editingCase.scenario}
                              onChange={(e) =>
                                setEditingCase({ ...editingCase, scenario: e.target.value })
                              }
                              className="w-full bg-black/60 border border-cyan-500 rounded-lg px-2.5 py-1.5 text-white text-xs"
                            />
                            <input
                              type="text"
                              value={editingCase.expected}
                              onChange={(e) =>
                                setEditingCase({ ...editingCase, expected: e.target.value })
                              }
                              placeholder="Expected result..."
                              className="w-full bg-black/60 border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-slate-300 text-xs"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingCase(null)}
                                className="px-2 py-0.5 text-slate-400 hover:text-white text-xs"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveEditCase}
                                className="px-2.5 py-0.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-semibold text-xs"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-400 text-[11px]">
                                {tc.id}
                              </span>
                              <span className="text-slate-100 font-medium">{tc.scenario}</span>
                            </div>
                            <div className="text-slate-400 text-[11px]">
                              <strong className="text-slate-300">Expected:</strong> {tc.expected}
                            </div>
                            {tc.actual && (
                              <div className="text-slate-300 text-[11px]">
                                <strong className="text-slate-400">Actual:</strong> {tc.actual}
                              </div>
                            )}
                            {tc.tester && (
                              <div className="text-slate-500 text-[10px]">
                                Verified by {tc.tester} on {tc.testedAt || 'recent run'}
                              </div>
                            )}
                            {tc.linkedBugId && (
                              <div className="flex items-center gap-1.5 text-rose-400 font-mono text-[11px] pt-0.5">
                                <Bug size={12} />
                                <span>Linked Bug: {tc.linkedBugId}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Inline Edit & Delete controls */}
                          {!isEditing && (
                            <>
                              <button
                                onClick={() =>
                                  setEditingCase({
                                    workId: work.id,
                                    caseId: tc.id,
                                    scenario: tc.scenario,
                                    expected: tc.expected,
                                  })
                                }
                                className="p-1 text-slate-500 hover:text-slate-300 rounded cursor-pointer"
                                title="Edit scenario text"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                onClick={() => deleteQaTestCase(work.id, tc.id)}
                                className="p-1 text-slate-500 hover:text-rose-400 rounded cursor-pointer mr-1"
                                title="Delete test case"
                              >
                                <Trash2 size={12} />
                              </button>
                            </>
                          )}

                          {/* Pass Button */}
                          <button
                            onClick={() => updateQaCaseResult(work.id, tc.id, 'Pass')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                              tc.result === 'Pass'
                                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                                : 'bg-slate-900 hover:bg-emerald-950/60 hover:text-emerald-400 text-slate-400 border border-slate-700'
                            }`}
                          >
                            <CheckCircle2 size={13} />
                            <span>Pass</span>
                          </button>

                          {/* Fail Button */}
                          <button
                            onClick={() => handleOpenFailModal(work, tc)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                              tc.result === 'Fail'
                                ? 'bg-rose-600 text-white shadow-sm font-bold'
                                : 'bg-slate-900 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 border border-slate-700'
                            }`}
                          >
                            <XCircle size={13} />
                            <span>Fail</span>
                          </button>

                          {/* Blocked Button */}
                          <button
                            onClick={() => updateQaCaseResult(work.id, tc.id, 'Blocked')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                              tc.result === 'Blocked'
                                ? 'bg-amber-600 text-white shadow-sm font-bold'
                                : 'bg-slate-900 hover:bg-amber-950/60 hover:text-amber-400 text-slate-400 border border-slate-700'
                            }`}
                          >
                            <span>Blocked</span>
                          </button>

                          {/* Untested reset */}
                          {tc.result !== 'Untested' && (
                            <button
                              onClick={() => updateQaCaseResult(work.id, tc.id, 'Untested')}
                              className="p-1 text-slate-500 hover:text-slate-300 rounded cursor-pointer"
                              title="Reset to Untested"
                            >
                              <RotateCcw size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {testCases.length === 0 && (
                    <div className="p-6 text-center text-slate-500 text-xs space-y-2">
                      <p>No test cases defined for this work item yet.</p>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setBulkModalState({ work, tab: 'ac' })}
                          className="px-3 py-1.5 bg-amber-600/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer hover:bg-amber-600/30"
                        >
                          <Sparkles size={13} />
                          <span>Generate from Acceptance Criteria</span>
                        </button>
                        <button
                          onClick={() => setBulkModalState({ work, tab: 'paste' })}
                          className="px-3 py-1.5 bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer hover:bg-cyan-600/30"
                        >
                          <ClipboardPaste size={13} />
                          <span>Paste from Spreadsheet</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredQaItems.length === 0 && (
          <div className="py-16 text-center text-slate-400 text-xs space-y-3">
            <Zap size={28} className="mx-auto text-slate-600" />
            <p className="font-semibold text-slate-300 text-sm">No items found matching this filter</p>
            <p className="text-slate-500 max-w-sm mx-auto">
              Work items automatically populate here once Development is marked completed or test scenarios are created.
            </p>
          </div>
        )}
      </div>

      {/* Fail Modal: Spawns Bug inheriting context */}
      {failingModalCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="w-full max-w-lg bg-[#0c1017] border border-rose-900/80 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertOctagon size={18} />
                <h3 className="font-bold text-sm text-white">Record QA Failure &amp; Create Bug</h3>
              </div>
              <button
                onClick={() => setFailingModalCase(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <XCircle size={18} />
              </button>
            </div>

            <div className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="font-medium text-slate-200">
                Failing Case: {failingModalCase.testCase.id} · {failingModalCase.testCase.scenario}
              </div>
              <div className="text-slate-400">
                <strong>Expected:</strong> {failingModalCase.testCase.expected}
              </div>
              <div className="text-amber-400 text-[11px] pt-1">
                Context inherited: {failingModalCase.work.productArea.join(', ')} · {failingModalCase.work.platform.join(', ')} · {failingModalCase.work.sprintId}
              </div>
            </div>

            <form onSubmit={handleConfirmFailAndCreateBug} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Bug Work Title</label>
                <input
                  type="text"
                  value={bugTitle}
                  onChange={(e) => setBugTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">What Actually Happened? (Evidence/Details)</label>
                <textarea
                  value={bugActualText}
                  onChange={(e) => setBugActualText(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-rose-500"
                  placeholder="Describe failure symptoms, logs, or error stack trace..."
                />
              </div>

              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Evidence Log Attached: failure_trace_log.txt</span>
                <span className="text-emerald-400 font-mono">Auto-linked</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setFailingModalCase(null)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Bug size={13} />
                  <span>Create Linked Bug &amp; Fail Case</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Test Case Modal (Supports Smart Paste & AC Generation) */}
      {bulkModalState && (
        <BulkTestCaseModal
          isOpen={true}
          onClose={() => setBulkModalState(null)}
          work={bulkModalState.work}
          mode="QA"
          initialTab={bulkModalState.tab}
        />
      )}

      {/* QA Promotes to UAT Modal */}
      {promoteModalWork && (
        <QaPromoteModal
          isOpen={true}
          onClose={() => setPromoteModalWork(null)}
          work={promoteModalWork}
        />
      )}
    </div>
  );
};
