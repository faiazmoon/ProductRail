import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  ExternalLink,
  Plus,
  Send,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  Bug,
  RefreshCw,
  GitBranch,
  Layers,
  MessageSquare,
  History,
  FileText,
  Figma,
  Zap,
  CheckSquare,
  Shield,
  ArrowRight,
  Lightbulb,
  Archive,
  RotateCcw,
  AlertTriangle,
  MapPin,
  ClipboardPaste,
  Lock,
} from 'lucide-react';
import { WorkTypeIcon, PriorityIcon, StatusIndicator } from '../common/Icons';
import { WorkStatus, PriorityLevel, WorkType } from '../../types';
import { RichTextEditor } from '../common/RichTextEditor';
import { BulkTestCaseModal } from '../common/BulkTestCaseModal';
import { WorkChatBox } from './WorkChatBox';

export const WorkDetailModal: React.FC = () => {
  const {
    detailModalWorkId,
    setDetailModalWorkId,
    workItems,
    updateWorkItem,
    archiveWorkItem,
    unarchiveWorkItem,
    currentRole,
    currentUser,
    config,
    sprints,
    users,
    updateDeliverableStatus,
    addDeliverable,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'deliverables' | 'requirements' | 'design' | 'quality' | 'activity'>('overview');
  const [newComment, setNewComment] = useState('');
  const [newScenario, setNewScenario] = useState('');
  const [newExpected, setNewExpected] = useState('');
  const [showAddQaCase, setShowAddQaCase] = useState(false);
  const [bulkModal, setBulkModal] = useState<{ mode: 'QA' | 'UAT'; tab: 'paste' | 'grid' | 'ac' } | null>(null);

  // Deliverable creation
  const [newDelivTitle, setNewDelivTitle] = useState('');
  const [newDelivDev, setNewDelivDev] = useState(users[1]?.name || 'Rahim Chowdhury');
  const [newDelivEst, setNewDelivEst] = useState('2 pts');

  if (!detailModalWorkId) return null;

  const item = workItems.find((w) => w.id === detailModalWorkId);
  if (!item) return null;

  const isDeveloper = currentRole === 'Developer';
  const isBusinessTeam = currentRole === 'Business' || currentRole === 'UAT';
  const canChangeStatus =
    !isBusinessTeam &&
    (currentRole === 'Project Manager' ||
      currentRole === 'Product Owner' ||
      currentRole === 'Super Admin' ||
      isDeveloper ||
      currentRole === 'Engineering Lead' ||
      currentRole === 'QA');
  const canEditRequirement =
    currentRole === 'Product Owner' ||
    currentRole === 'Super Admin' ||
    currentRole === 'Project Manager';

  const deliverables = item.deliverables || [];
  const readyUatCount = deliverables.filter((d) => d.status === 'Ready for UAT' || d.status === 'Done').length;
  const isFullFeatureUatReady = deliverables.length > 0 && readyUatCount === deliverables.length;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const commentObj = {
      id: `c-${Date.now()}`,
      author: currentUser.name,
      role: currentUser.role,
      content: newComment.trim(),
      createdAt: now,
    };

    updateWorkItem(item.id, {
      comments: [...(item.comments || []), commentObj],
    });
    setNewComment('');
  };

  const handleAddQaCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScenario.trim()) return;

    const newCase = {
      id: `TC-${String((item.qaCases?.length || 0) + 1).padStart(2, '0')}`,
      workId: item.id,
      scenario: newScenario.trim(),
      expected: newExpected.trim() || 'Verified functionality',
      result: 'Untested' as const,
    };

    updateWorkItem(item.id, {
      qaCases: [...(item.qaCases || []), newCase],
    });
    setNewScenario('');
    setNewExpected('');
    setShowAddQaCase(false);
  };

  const handleCreateDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDelivTitle.trim()) return;

    addDeliverable(item.id, {
      title: newDelivTitle.trim(),
      assignedDeveloper: newDelivDev,
      status: 'To Do',
      estimate: newDelivEst,
    });

    setNewDelivTitle('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#0C1017] border border-white/[0.1] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] bg-[#0E121A] flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <WorkTypeIcon type={item.type} size={18} />
              <span className="font-mono text-sm font-bold text-slate-200">{item.id}</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400 capitalize">{item.type}</span>
              <span className="text-slate-600">·</span>
              <div className="flex items-center gap-1">
                {item.productArea.map((a) => (
                  <span key={a} className="bg-amber-950/60 text-amber-300 border border-amber-900/60 px-1.5 py-0.2 rounded text-[11px] font-medium">
                    {a}
                  </span>
                ))}
              </div>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">{item.platform.join(', ')}</span>
            </div>
            <h1 className="text-lg font-semibold text-white">{item.title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (item.status === 'Archived') {
                  unarchiveWorkItem(item.id);
                  setDetailModalWorkId(null);
                } else {
                  if (confirm(`Archive work item ${item.id} ("${item.title}")?`)) {
                    archiveWorkItem(item.id);
                    setDetailModalWorkId(null);
                  }
                }
              }}
              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-950/30 rounded-md transition-colors cursor-pointer"
              title={item.status === 'Archived' ? 'Unarchive Work Item' : 'Archive Work Item'}
            >
              {item.status === 'Archived' ? <RotateCcw size={16} /> : <Archive size={16} />}
            </button>
            <button
              onClick={() => setDetailModalWorkId(null)}
              className="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 border-b border-white/[0.08] bg-[#0A0D14] text-xs">
          {[
            { id: 'overview', label: 'Overview', icon: Layers },
            { id: 'deliverables', label: `Deliverables (${deliverables.length})`, icon: Zap },
            { id: 'requirements', label: 'Requirements', icon: FileText },
            { id: 'design', label: 'Design & Figma', icon: Figma },
            { id: 'quality', label: `QA & UAT (${(item.qaCases?.length || 0) + (item.uatCases?.length || 0)})`, icon: CheckSquare },
            { id: 'activity', label: `Activity (${item.activity?.length || 0})`, icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2.5 font-medium transition-colors border-b-2 -mb-[1px] ${
                  isActive
                    ? 'border-blue-500 text-blue-400 bg-white/[0.03] font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm font-sans">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Properties Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-black/40 border border-white/[0.08]">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">Status</span>
                    {isBusinessTeam && (
                      <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1" title="Status locked for Business team">
                        <Lock size={10} /> Locked
                      </span>
                    )}
                  </div>
                  <select
                    value={item.status}
                    disabled={!canChangeStatus}
                    title={
                      isBusinessTeam
                        ? 'Business team cannot change status. Status is advanced via delivery & UAT workflow.'
                        : undefined
                    }
                    onChange={(e) => updateWorkItem(item.id, { status: e.target.value as WorkStatus })}
                    className={`w-full bg-[#121620] border border-white/[0.1] rounded px-2.5 py-1 text-xs text-slate-200 ${
                      !canChangeStatus ? 'opacity-60 cursor-not-allowed bg-slate-900/60' : ''
                    }`}
                  >
                    {[
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
                      'Archived',
                    ].map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-xs text-slate-500 block mb-1">Priority</span>
                  <select
                    value={item.priority}
                    onChange={(e) => updateWorkItem(item.id, { priority: e.target.value as PriorityLevel })}
                    className="w-full bg-[#121620] border border-white/[0.1] rounded px-2.5 py-1 text-xs text-slate-200"
                  >
                    {['Critical', 'High', 'Medium', 'Low'].map((pr) => (
                      <option key={pr} value={pr}>
                        {pr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-xs text-slate-500 block mb-1">Sprint</span>
                  <select
                    value={item.sprintId || ''}
                    onChange={(e) => updateWorkItem(item.id, { sprintId: e.target.value || undefined })}
                    className="w-full bg-[#121620] border border-white/[0.1] rounded px-2.5 py-1 text-xs text-slate-200"
                  >
                    <option value="">(Product Backlog)</option>
                    {sprints.map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.name} ({sp.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-xs text-slate-500 block mb-1">Owner</span>
                  <input
                    type="text"
                    value={item.owner?.name || ''}
                    onChange={(e) =>
                      updateWorkItem(item.id, {
                        owner: { name: e.target.value, role: item.owner?.role || 'Developer' },
                      })
                    }
                    placeholder="Unassigned"
                    className="w-full bg-[#121620] border border-white/[0.1] rounded px-2.5 py-1 text-xs text-slate-200"
                  />
                </div>
              </div>

              {/* Feature UAT Rollup state */}
              {deliverables.length > 0 && (
                <div
                  className={`p-4 rounded-xl border text-xs font-mono flex items-center justify-between ${
                    isFullFeatureUatReady
                      ? 'bg-teal-950/40 border-teal-500/60 text-teal-300'
                      : 'bg-black/50 border-white/[0.08] text-amber-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className={isFullFeatureUatReady ? 'text-teal-400' : 'text-amber-400'} />
                    <span className="font-sans font-semibold text-white">Feature UAT Readiness State:</span>
                  </div>
                  <strong className="text-sm font-bold">
                    {isFullFeatureUatReady
                      ? 'FULL FEATURE IS UAT READY (All items ready)'
                      : `${readyUatCount}/${deliverables.length} Items UAT Ready (${Math.round(
                          (readyUatCount / deliverables.length) * 100
                        )}%)`}
                  </strong>
                </div>
              )}

              {/* Delivery Phase Timelines (Dev, QA, UAT, Release) */}
              <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-2">
                    <Clock size={15} className="text-blue-400" />
                    <span>Specific Delivery Timelines (Dev, QA, UAT, Release)</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Directly synced with Worksheet Board &amp; Gantt
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Dev Phase */}
                  <div className="p-3 bg-[#101524] border border-blue-500/30 rounded-xl space-y-2">
                    <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
                      <Zap size={12} />
                      <span>Development</span>
                    </span>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Planned Dev Start</label>
                      <input
                        type="date"
                        value={item.dates?.plannedDevStart || ''}
                        onChange={(e) => updateWorkItem(item.id, { dates: { ...item.dates, plannedDevStart: e.target.value || undefined } })}
                        className="w-full bg-[#141B2B] border border-white/[0.1] rounded p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-blue-300 font-bold block mb-1">Planned Dev End *</label>
                      <input
                        type="date"
                        value={item.dates?.plannedDevEnd || ''}
                        onChange={(e) => updateWorkItem(item.id, { dates: { ...item.dates, plannedDevEnd: e.target.value || undefined } })}
                        className="w-full bg-[#141B2B] border border-blue-500/60 rounded p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* QA Phase */}
                  <div className="p-3 bg-[#101524] border border-cyan-500/30 rounded-xl space-y-2">
                    <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      <span>QA Verification</span>
                    </span>
                    <div>
                      <label className="text-[10px] text-cyan-300 font-bold block mb-1">QA Start Date *</label>
                      <input
                        type="date"
                        value={item.dates?.plannedQaStart || ''}
                        onChange={(e) => updateWorkItem(item.id, { dates: { ...item.dates, plannedQaStart: e.target.value || undefined } })}
                        className="w-full bg-[#141B2B] border border-cyan-500/60 rounded p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-cyan-300 font-bold block mb-1">QA End Date *</label>
                      <input
                        type="date"
                        value={item.dates?.plannedQaEnd || ''}
                        onChange={(e) => updateWorkItem(item.id, { dates: { ...item.dates, plannedQaEnd: e.target.value || undefined } })}
                        className="w-full bg-[#141B2B] border border-cyan-500/60 rounded p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* UAT Phase */}
                  <div className="p-3 bg-[#101524] border border-teal-500/30 rounded-xl space-y-2">
                    <span className="text-[11px] font-bold text-teal-400 flex items-center gap-1">
                      <CheckSquare size={12} />
                      <span>Business UAT</span>
                    </span>
                    <div>
                      <label className="text-[10px] text-teal-300 font-bold block mb-1">UAT Start Date *</label>
                      <input
                        type="date"
                        value={item.dates?.plannedUatStart || ''}
                        onChange={(e) => updateWorkItem(item.id, { dates: { ...item.dates, plannedUatStart: e.target.value || undefined } })}
                        className="w-full bg-[#141B2B] border border-teal-500/60 rounded p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-teal-300 font-bold block mb-1">UAT End Date *</label>
                      <input
                        type="date"
                        value={item.dates?.plannedUatEnd || ''}
                        onChange={(e) => updateWorkItem(item.id, { dates: { ...item.dates, plannedUatEnd: e.target.value || undefined } })}
                        className="w-full bg-[#141B2B] border border-teal-500/60 rounded p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Target Release */}
                  <div className="p-3 bg-[#101524] border border-indigo-500/30 rounded-xl space-y-2">
                    <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                      <Calendar size={12} />
                      <span>Target Release</span>
                    </span>
                    <div>
                      <label className="text-[10px] text-indigo-300 font-bold block mb-1">Planned Release *</label>
                      <input
                        type="date"
                        value={item.dates?.plannedRelease || ''}
                        onChange={(e) => updateWorkItem(item.id, { dates: { ...item.dates, plannedRelease: e.target.value || undefined } })}
                        className="w-full bg-[#141B2B] border border-indigo-500/60 rounded p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div className="pt-2 text-[10px] text-slate-400">
                      Synchronized with Releases hub and sprint calendar.
                    </div>
                  </div>
                </div>
              </div>

              {/* Administration & Categorization */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Administration & Categorization
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Bus / Ship Operator</label>
                    <select
                      value={item.operatorName || ''}
                      onChange={(e) => updateWorkItem(item.id, { operatorName: e.target.value || undefined })}
                      className="w-full bg-[#121620] border border-white/[0.1] rounded px-2.5 py-1.5 text-xs text-emerald-400 font-semibold"
                    >
                      <option value="">— None —</option>
                      {config.operators.map((op) => (
                        <option key={op.id} value={op.name} className="bg-slate-900 text-slate-200">
                          {op.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Estimation</label>
                    <input
                      type="text"
                      value={item.estimate || ''}
                      onChange={(e) => updateWorkItem(item.id, { estimate: e.target.value })}
                      placeholder="e.g. 5 pts, 3d"
                      className="w-full bg-[#121620] border border-white/[0.1] rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Product Areas</label>
                    <div className="flex flex-wrap gap-1.5">
                      {config.productAreas.map((area) => {
                        const isSelected = item.productArea.includes(area);
                        return (
                          <button
                            key={area}
                            onClick={() => {
                              const next = isSelected
                                ? item.productArea.filter((a) => a !== area)
                                : [...item.productArea, area];
                              updateWorkItem(item.id, { productArea: next.length > 0 ? next : ['All'] });
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                              isSelected
                                ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                                : 'bg-white/[0.03] text-slate-500 border-white/[0.06] hover:text-slate-300'
                            }`}
                          >
                            {area}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Target Platforms</label>
                    <div className="flex flex-wrap gap-1.5">
                      {config.platforms.map((p) => {
                        const isSelected = item.platform.includes(p);
                        return (
                          <button
                            key={p}
                            onClick={() => {
                              const next = isSelected
                                ? item.platform.filter((plt) => plt !== p)
                                : [...item.platform, p];
                              updateWorkItem(item.id, { platform: next.length > 0 ? next : ['All'] });
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                              isSelected
                                ? 'bg-blue-950/60 text-blue-300 border-blue-800/60'
                                : 'bg-white/[0.03] text-slate-500 border-white/[0.06] hover:text-slate-300'
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirement Summary */}
              {item.requirementDetails && (
                <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-2 text-xs">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider block">
                    Requirement Summary
                  </span>
                  <p className="text-slate-200 leading-relaxed">{item.requirementDetails}</p>
                </div>
              )}
            </div>
          )}

          {/* Deliverables Tab (Dividing work to developers) */}
          {activeTab === 'deliverables' && (
            <div className="space-y-6">
              <div className="p-4 bg-black/40 rounded-xl border border-white/[0.08] space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                  Divide New Deliverable to Developer
                </h3>
                <form onSubmit={handleCreateDeliverable} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <input
                    type="text"
                    placeholder="Deliverable title..."
                    value={newDelivTitle}
                    onChange={(e) => setNewDelivTitle(e.target.value)}
                    required
                    className="sm:col-span-2 bg-[#121620] border border-white/[0.1] rounded px-3 py-2 text-white"
                  />
                  <select
                    value={newDelivDev}
                    onChange={(e) => setNewDelivDev(e.target.value)}
                    className="bg-[#121620] border border-white/[0.1] rounded px-2.5 py-2 text-white"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold text-xs"
                  >
                    + Add Deliverable
                  </button>
                </form>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Divided Deliverables ({deliverables.length})
                </h3>

                <div className="divide-y divide-white/[0.06] border border-white/[0.08] rounded-xl overflow-hidden bg-black/40 text-xs">
                  {deliverables.map((deliv) => (
                    <div key={deliv.id} className="p-4 flex flex-wrap items-center justify-between gap-3 hover:bg-white/[0.02]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-semibold text-white">
                          <span className="font-mono text-slate-400">{deliv.id}</span>
                          <span>{deliv.title}</span>
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          Assigned Developer: <strong className="text-slate-200">{deliv.assignedDeveloper}</strong> · Est: {deliv.estimate || '2 pts'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                            deliv.status === 'Ready for UAT' || deliv.status === 'Done'
                              ? 'bg-teal-950 text-teal-400 border border-teal-800'
                              : deliv.status === 'Ready for QA'
                              ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {deliv.status}
                        </span>

                        {deliv.status !== 'Ready for QA' && deliv.status !== 'Ready for UAT' && (
                          <button
                            onClick={() => updateDeliverableStatus(item.id, deliv.id, 'Ready for QA')}
                            className="px-2.5 py-1 text-xs font-semibold bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 rounded"
                          >
                            Mark QA Ready
                          </button>
                        )}

                        {deliv.status !== 'Ready for UAT' && (
                          <button
                            onClick={() => updateDeliverableStatus(item.id, deliv.id, 'Ready for UAT')}
                            className="px-2.5 py-1 text-xs font-semibold bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-700 rounded"
                          >
                            Mark UAT Ready
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {deliverables.length === 0 && (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      No separate deliverables divided yet. Use the form above to break this feature down.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requirements' && (
            <div className="space-y-6">
              {!canEditRequirement && isDeveloper && (
                <div className="p-3 bg-amber-950/30 border border-amber-900/60 rounded text-xs text-amber-300 flex items-center gap-2">
                  <Shield size={14} className="shrink-0" />
                  <span>
                    Requirement Governance: Developers cannot modify approved business requirements.
                    You may add comments, technical notes, or suggest changes below.
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Requirement Details (Rich Text)
                </label>
                <RichTextEditor
                  value={item.requirementDetails || ''}
                  onChange={(val) => updateWorkItem(item.id, { requirementDetails: val })}
                  disabled={!canEditRequirement}
                  placeholder="Describe the problem, request, or business specification using formatting tools..."
                  minHeight="140px"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Acceptance Criteria
                </label>
                <div className="space-y-2">
                  {(item.acceptanceCriteria || []).map((crit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 p-2.5 bg-black/40 rounded-lg border border-white/[0.06]">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span>{crit}</span>
                    </div>
                  ))}
                  {canEditRequirement && (
                    <button
                      onClick={() => {
                        const crit = prompt('Enter new Acceptance Criterion:');
                        if (crit) {
                          updateWorkItem(item.id, {
                            acceptanceCriteria: [...(item.acceptanceCriteria || []), crit],
                          });
                        }
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium mt-1"
                    >
                      <Plus size={13} />
                      <span>Add Acceptance Criterion</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'design' && (
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-black/40 border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Figma size={18} className="text-pink-400" />
                    <span className="font-semibold text-white text-xs">Figma Design Component</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono">
                    Status: {item.designStatus || 'Dev Ready'}
                  </span>
                </div>

                {item.figmaUrl ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[#121620] rounded-lg border border-white/[0.06]">
                      <span className="text-xs font-medium text-slate-300 truncate">
                        {item.designTitle || 'UI Specification'}
                      </span>
                      <a
                        href={item.figmaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-400 hover:underline"
                      >
                        <span>Open in Figma</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    No design link attached for this work item.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'quality' && (
            <div className="space-y-6">
              {/* QA Cases */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Zap size={14} />
                    <span>QA Test Scenarios</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBulkModal({ mode: 'QA', tab: 'ac' })}
                      className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded cursor-pointer"
                    >
                      <Sparkles size={11} />
                      <span>⚡ AC</span>
                    </button>
                    <button
                      onClick={() => setBulkModal({ mode: 'QA', tab: 'paste' })}
                      className="text-xs text-cyan-300 hover:text-cyan-200 flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded cursor-pointer"
                    >
                      <ClipboardPaste size={11} />
                      <span>Bulk Add</span>
                    </button>
                    <button
                      onClick={() => setShowAddQaCase(!showAddQaCase)}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>Add Case</span>
                    </button>
                  </div>
                </div>

                {showAddQaCase && (
                  <form onSubmit={handleAddQaCase} className="p-3 bg-black/60 rounded-lg border border-white/[0.1] space-y-2">
                    <input
                      type="text"
                      placeholder="Scenario description..."
                      value={newScenario}
                      onChange={(e) => setNewScenario(e.target.value)}
                      className="w-full bg-[#121620] border border-white/[0.1] rounded px-2.5 py-1.5 text-xs text-slate-200"
                    />
                    <input
                      type="text"
                      placeholder="Expected outcome..."
                      value={newExpected}
                      onChange={(e) => setNewExpected(e.target.value)}
                      className="w-full bg-[#121620] border border-white/[0.1] rounded px-2.5 py-1.5 text-xs text-slate-200"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddQaCase(false)}
                        className="px-2.5 py-1 text-xs text-slate-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold"
                      >
                        Save Case
                      </button>
                    </div>
                  </form>
                )}

                <div className="divide-y divide-white/[0.06] border border-white/[0.08] rounded-xl overflow-hidden bg-black/40">
                  {(item.qaCases || []).map((tc) => (
                    <div
                      key={tc.id}
                      className="p-3 flex items-start justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-300">{tc.id}</span>
                          <span className="text-slate-200 font-medium">{tc.scenario}</span>
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          <strong>Expected:</strong> {tc.expected}
                        </div>
                        {tc.actual && (
                          <div className="text-slate-300 text-[11px]">
                            <strong>Actual:</strong> {tc.actual}
                          </div>
                        )}
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                          tc.result === 'Pass'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : tc.result === 'Fail'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {tc.result}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Business UAT Acceptance Scenarios & Visual Verification */}
              <div className="space-y-3 pt-3 border-t border-white/[0.08]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                    <CheckSquare size={14} />
                    <span>Business UAT Acceptance Scenarios</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBulkModal({ mode: 'UAT', tab: 'ac' })}
                      className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded cursor-pointer"
                    >
                      <Sparkles size={11} />
                      <span>⚡ AC</span>
                    </button>
                    <button
                      onClick={() => setBulkModal({ mode: 'UAT', tab: 'paste' })}
                      className="text-xs text-teal-300 hover:text-teal-200 flex items-center gap-1 bg-teal-500/10 border border-teal-500/30 px-2 py-0.5 rounded cursor-pointer"
                    >
                      <ClipboardPaste size={11} />
                      <span>Bulk Add</span>
                    </button>
                    <span className="text-xs text-slate-400 font-mono">
                      {item.uatCases?.length || 0} Scenarios
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-white/[0.06] border border-white/[0.08] rounded-xl overflow-hidden bg-black/40">
                  {(item.uatCases || []).map((uc) => (
                    <div
                      key={uc.id}
                      className={`p-3.5 space-y-2 text-xs transition-colors ${
                        uc.requiresAttention ? 'bg-amber-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-300">{uc.id}</span>
                            <span className="text-slate-200 font-medium">{uc.scenario}</span>
                            {uc.requiresAttention && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500 text-black flex items-center gap-1">
                                <AlertTriangle size={10} className="fill-black" />
                                <span>Requires Attention</span>
                              </span>
                            )}
                            {uc.annotations && uc.annotations.length > 0 && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800 flex items-center gap-1">
                                <MapPin size={10} />
                                <span>{uc.annotations.length} Visual Pins</span>
                              </span>
                            )}
                          </div>
                          <div className="text-slate-400 text-[11px]">
                            <strong>Expected:</strong> {uc.expected}
                          </div>
                          {uc.requiresAttention && uc.attentionReason && (
                            <div className="text-amber-300 text-[11px] bg-amber-950/40 p-2 rounded border border-amber-800/40">
                              <strong>Attention Reason:</strong> {uc.attentionReason}
                            </div>
                          )}
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded text-[11px] font-semibold shrink-0 ${
                            uc.result === 'Pass'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : uc.result === 'Fail'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {uc.result}
                        </span>
                      </div>
                    </div>
                  ))}

                  {(!item.uatCases || item.uatCases.length === 0) && (
                    <div className="p-4 text-center text-slate-500 text-xs">
                      No UAT scenarios defined for this work item yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <History size={14} />
                  <span>Activity &amp; Audit Log</span>
                </h3>
                <div className="space-y-2">
                  {(item.activity || []).map((act) => (
                    <div
                      key={act.id}
                      className="p-3 bg-black/40 rounded-lg border border-white/[0.06] text-xs flex items-start gap-3"
                    >
                      <span className="font-mono text-[10px] text-slate-500 whitespace-nowrap pt-0.5">
                        {act.timestamp}
                      </span>
                      <div>
                        <span className="font-semibold text-white">{act.actor}</span>{' '}
                        <span className="text-slate-300">{act.action}</span>
                        {act.details && (
                          <div className="text-[11px] text-slate-400 mt-0.5">{act.details}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Role-Attributed Discussions & Chat */}
              <div className="border-t border-white/[0.08] pt-4">
                <WorkChatBox
                  workId={item.id}
                  comments={item.comments || []}
                  onAddComment={(newComment) => {
                    updateWorkItem(item.id, {
                      comments: [...(item.comments || []), newComment],
                      activity: [
                        ...(item.activity || []),
                        {
                          id: `act-${Date.now()}`,
                          timestamp: newComment.createdAt,
                          actor: newComment.author,
                          action: `Posted discussion (${newComment.tag || 'general'})`,
                        },
                      ],
                    });
                  }}
                  onDeleteComment={(commentId) => {
                    updateWorkItem(item.id, {
                      comments: (item.comments || []).filter((c) => c.id !== commentId),
                    });
                  }}
                  onTogglePin={(commentId) => {
                    updateWorkItem(item.id, {
                      comments: (item.comments || []).map((c) =>
                        c.id === commentId ? { ...c, isPinned: !c.isPinned } : c
                      ),
                    });
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {bulkModal && item && (
        <BulkTestCaseModal
          isOpen={true}
          onClose={() => setBulkModal(null)}
          work={item}
          mode={bulkModal.mode}
          initialTab={bulkModal.tab}
        />
      )}
    </div>
  );
};
