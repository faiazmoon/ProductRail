import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  LayoutGrid,
  ExternalLink,
  Calendar,
  User,
  Clock,
  Layers,
  Sparkles,
  Bug,
  GitBranch,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  Maximize2,
  CheckCircle2,
  FileCode,
  Zap,
  CheckSquare,
  Rocket,
  Plus,
  Archive,
  RotateCcw,
  Send,
  MessageSquare,
  AtSign,
  Bell,
  Figma,
  Edit2,
  Bus,
  Ship,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { WorkTypeIcon, PriorityIcon, StatusIndicator } from '../common/Icons';
import { WorkStatus, CommentItem, UserProfile } from '../../types';
import { RichTextEditor } from '../common/RichTextEditor';
import { WorkTimelineModal } from './WorkTimelineModal';
import { WorkChatBox } from './WorkChatBox';

export const WorkInspector: React.FC = () => {
  const {
    selectedWorkId,
    setSelectedWorkId,
    workItems,
    updateWorkItem,
    setDetailModalWorkId,
    setActiveTab,
    sprints,
    users,
    currentUser,
    sendNotification,
    updateDeliverableStatus,
    addDeliverable,
    archiveWorkItem,
    unarchiveWorkItem,
    currentRole,
  } = useApp();

  const isDeveloper = currentRole === 'Developer';
  const isPM = currentRole === 'Project Manager' || currentRole === 'Super Admin';
  const isBusiness = currentRole === 'Business' || currentRole === 'Super Admin';
  const isUAT = currentRole === 'UAT' || currentRole === 'Super Admin';
  const isBusinessTeam = currentRole === 'Business' || currentRole === 'UAT';
  const canChangeStatus =
    !isBusinessTeam &&
    (isPM ||
      currentRole === 'Product Owner' ||
      isDeveloper ||
      currentRole === 'Engineering Lead' ||
      currentRole === 'QA');

  const [isAddDelivOpen, setIsAddDelivOpen] = useState(false);
  const [newDelivTitle, setNewDelivTitle] = useState('');
  const [newDelivDev, setNewDelivDev] = useState(users[1]?.name || 'Rahim Chowdhury');
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);

  // Mention system in comments
  const [commentText, setCommentText] = useState('');
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionMatchIndex, setMentionMatchIndex] = useState<number>(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [activeTab, setActiveTabLocal] = useState<'overview' | 'delivery' | 'verification' | 'history'>('overview');

  if (!selectedWorkId) return null;

  const item = workItems.find((w) => w.id === selectedWorkId);
  if (!item) return null;

  const currentSprint = sprints.find((s) => s.id === item.sprintId);
  const deliverables = item.deliverables || [];
  const readyUatCount = deliverables.filter((d) => d.status === 'Ready for UAT' || d.status === 'Done').length;
  const isFullFeatureUatReady = deliverables.length > 0 && readyUatCount === deliverables.length;

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const cursorPos = e.target.selectionStart;
    setCommentText(val);

    // Look back from cursor to find if we're inside an '@' token
    const textBeforeCursor = val.slice(0, cursorPos);
    const lastAtPos = textBeforeCursor.lastIndexOf('@');

    if (lastAtPos !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtPos + 1);
      if (!/\s/.test(textAfterAt)) {
        setMentionQuery(textAfterAt);
        setMentionMatchIndex(lastAtPos);
        return;
      }
    }
    setMentionQuery(null);
    setMentionMatchIndex(-1);
  };

  const handleSelectMentionUser = (selectedUser: UserProfile) => {
    if (mentionMatchIndex === -1) return;
    const before = commentText.slice(0, mentionMatchIndex);
    const after = commentText.slice(mentionMatchIndex + 1 + (mentionQuery?.length || 0));
    const newText = `${before}@${selectedUser.name} ${after}`;
    setCommentText(newText);
    setMentionQuery(null);
    setMentionMatchIndex(-1);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    // Find mentioned users
    const mentionedUsers = users.filter((u) => commentText.includes(`@${u.name}`));
    const mentionedNames = mentionedUsers.map((u) => u.name);

    // Trigger in-app notification for each mentioned user
    mentionedUsers.forEach((u) => {
      sendNotification({
        recipientName: u.name,
        senderName: currentUser.name,
        message: `${currentUser.name} mentioned you in ${item.id}: "${commentText.trim()}"`,
        workId: item.id,
        workTitle: item.title,
        type: 'mention',
      });
    });

    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      author: currentUser.name,
      role: currentUser.role,
      content: commentText.trim(),
      createdAt: now,
      mentions: mentionedNames,
    };

    updateWorkItem(item.id, {
      comments: [...(item.comments || []), newComment],
      activity: [
        ...(item.activity || []),
        {
          id: `act-${Date.now()}`,
          timestamp: now,
          actor: currentUser.name,
          action:
            mentionedNames.length > 0
              ? `Commented & mentioned ${mentionedNames.map((n) => `@${n}`).join(', ')}`
              : `Added comment`,
          details: commentText.trim(),
        },
      ],
    });

    setCommentText('');
    setMentionQuery(null);
    setMentionMatchIndex(-1);
  };

  const filteredMentionUsers = users.filter((u) =>
    u.name.toLowerCase().includes((mentionQuery || '').toLowerCase())
  );

  const handleAddDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDelivTitle.trim()) return;

    addDeliverable(item.id, {
      title: newDelivTitle.trim(),
      assignedDeveloper: newDelivDev,
      status: 'To Do',
      estimate: '2 pts',
    });

    setNewDelivTitle('');
    setIsAddDelivOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-150"
        onClick={() => setSelectedWorkId(null)}
      />

      <aside className="fixed inset-y-0 right-0 w-full sm:w-[420px] md:relative md:w-84 lg:w-96 bg-[#0C1017] border-l border-white/[0.08] flex flex-col h-full overflow-hidden shrink-0 shadow-2xl z-50 md:z-30 animate-in slide-in-from-right duration-150">
        {/* Inspector Header */}
      <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#0E121A]">
        <div className="flex items-center gap-2">
          <WorkTypeIcon type={item.type} size={16} />
          <span className="font-mono text-xs font-semibold text-slate-300">{item.id}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDetailModalWorkId(item.id)}
            className="p-1.5 text-slate-400 hover:text-white rounded transition-colors"
            title="Open Full Details Modal"
          >
            <Maximize2 size={14} />
          </button>
          <button
            onClick={() => {
              if (item.status === 'Archived') {
                unarchiveWorkItem(item.id);
              } else {
                if (confirm(`Archive work item ${item.id} ("${item.title}")?`)) {
                  archiveWorkItem(item.id);
                  setSelectedWorkId(null);
                }
              }
            }}
            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-950/30 rounded transition-colors cursor-pointer"
            title={item.status === 'Archived' ? 'Unarchive Work Item' : 'Archive Work Item'}
          >
            {item.status === 'Archived' ? <RotateCcw size={14} /> : <Archive size={14} />}
          </button>
          <button
            onClick={() => setSelectedWorkId(null)}
            className="p-1.5 text-slate-400 hover:text-white rounded transition-colors"
            title="Close Inspector"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Internal Tabs for Information Architecture */}
      <div className="flex items-center border-b border-white/[0.06] px-2 bg-[#0E121A]">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutGrid },
          { id: 'delivery', label: 'Engineering', icon: FileCode },
          { id: 'verification', label: 'QA / UAT', icon: ShieldCheck },
          { id: 'history', label: 'Timeline', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTabLocal(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 ${
                isActive
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon size={12} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Inspector Body */}
      <div className="flex-1 overflow-y-auto p-4 text-xs text-slate-300 font-sans custom-scrollbar">
        {activeTab === 'overview' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Title */}
            <div>
              <h2 className="text-sm font-bold text-white leading-snug">{item.title}</h2>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {item.productArea.map((area) => (
                  <span key={area} className="bg-amber-950/60 text-amber-300 border border-amber-900/60 px-2 py-0.5 rounded text-[10px] font-medium">{area}</span>
                ))}
                {item.platform.map((p) => (
                  <span key={p} className="bg-blue-950/60 text-blue-300 border border-blue-900/60 px-2 py-0.5 rounded text-[10px] font-medium">{p}</span>
                ))}
              </div>
            </div>

            {/* Lifecycle Controls */}
            <div className="grid grid-cols-2 gap-3 bg-black/40 p-3 rounded-xl border border-white/[0.06]">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Status</span>
                  {isBusinessTeam && (
                    <span
                      className="text-[9px] text-amber-400 font-mono flex items-center gap-1"
                      title="Status is read-only for Business team"
                    >
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
                  className={`w-full bg-[#121622] text-white py-1 px-2 text-[11px] font-bold border border-white/[0.08] rounded-md outline-none ${
                    !canChangeStatus ? 'opacity-60 cursor-not-allowed bg-slate-900/60' : 'cursor-pointer focus:border-blue-500'
                  }`}
                >
                  {['Backlog', 'To Do', 'In Development', 'Ready for QA', 'In QA', 'Ready for UAT', 'In UAT', 'UAT Failed', 'Ready for Release', 'Released', 'Archived'].map(st => {
                    // Restriction for Developers: Cannot move to Verification/Release stages
                    const restrictedForDev = isDeveloper && (
                      st === 'In QA' || 
                      st === 'Ready for UAT' || 
                      st === 'In UAT' || 
                      st === 'Ready for Release' || 
                      st === 'Released' || 
                      st === 'Archived'
                    );
                    
                    if (restrictedForDev) return null;

                    return (
                      <option key={st} value={st}>{st}</option>
                    );
                  })}
                </select>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Priority</span>
                <select
                  value={item.priority}
                  onChange={(e) => updateWorkItem(item.id, { priority: e.target.value as any })}
                  className="w-full bg-[#121622] text-white py-1 px-2 text-[11px] font-bold border border-white/[0.08] rounded-md focus:border-blue-500 outline-none cursor-pointer"
                >
                  {['Critical', 'High', 'Medium', 'Low'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Owner</span>
                <select
                  value={item.owner?.name || 'Unassigned'}
                  onChange={(e) => {
                    const u = users.find(usr => usr.name === e.target.value);
                    updateWorkItem(item.id, { owner: { name: e.target.value, role: u?.role || 'Developer' } });
                  }}
                  className="w-full bg-[#121622] text-white py-1 px-2 text-[11px] border border-white/[0.08] rounded-md focus:border-blue-500 outline-none cursor-pointer"
                >
                  <option value="Unassigned">Unassigned</option>
                  {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Sprint</span>
                <select
                  value={item.sprintId || ''}
                  onChange={(e) => updateWorkItem(item.id, { sprintId: e.target.value || undefined })}
                  className="w-full bg-[#121622] text-amber-300 py-1 px-2 text-[11px] font-mono border border-white/[0.08] rounded-md focus:border-blue-500 outline-none cursor-pointer"
                >
                  <option value="">Backlog</option>
                  {sprints.map(s => <option key={s.id} value={s.id}>{s.id}</option>)}
                </select>
              </div>
            </div>

            {/* Requester & Metadata */}
            <div className="p-3 bg-[#0d111a] rounded-xl border border-white/[0.04] space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Requester</span>
                <span className="text-white font-medium">{item.requesterName || item.reporter?.name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Created</span>
                <span className="text-slate-400 font-mono">{item.createdAt}</span>
              </div>
              {item.operatorName && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Operator</span>
                  <span className="text-emerald-400 font-bold">{item.operatorName}</span>
                </div>
              )}
            </div>

            {/* Design Link */}
            <div className="p-3 bg-pink-950/20 border border-pink-900/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-pink-400 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                  <Figma size={13} />
                  <span>Figma Design</span>
                </span>
                {item.figmaUrl && (
                  <a href={item.figmaUrl} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300">
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
              {item.figmaUrl ? (
                <div className="text-[10px] text-slate-300 font-mono truncate">{item.figmaUrl}</div>
              ) : (
                <span className="text-slate-500 italic">No design link attached</span>
              )}
            </div>

            {/* Delivery Timelines (Dev, QA, UAT, Release) */}
            <div className="p-3 bg-blue-950/20 border border-blue-900/40 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-300 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                  <Clock size={13} className="text-blue-400" />
                  <span>Phase Timelines (Dev, QA, UAT)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsTimelineModalOpen(true)}
                  className="text-blue-400 hover:text-blue-300 font-bold text-[10px] underline cursor-pointer"
                >
                  Edit Dates
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-black/40 rounded-lg border border-white/[0.04]">
                  <span className="text-slate-500 text-[9px] uppercase font-bold block">Planned Dev End</span>
                  <span className="text-blue-300 font-mono font-bold">
                    {item.dates?.plannedDevEnd || 'Not scheduled'}
                  </span>
                </div>
                <div className="p-2 bg-black/40 rounded-lg border border-white/[0.04]">
                  <span className="text-slate-500 text-[9px] uppercase font-bold block">QA Window</span>
                  <span className="text-cyan-300 font-mono font-bold">
                    {item.dates?.plannedQaStart && item.dates?.plannedQaEnd
                      ? `${item.dates.plannedQaStart.slice(5)} → ${item.dates.plannedQaEnd.slice(5)}`
                      : 'Not scheduled'}
                  </span>
                </div>
                <div className="p-2 bg-black/40 rounded-lg border border-white/[0.04]">
                  <span className="text-slate-500 text-[9px] uppercase font-bold block">UAT Window</span>
                  <span className="text-teal-300 font-mono font-bold">
                    {item.dates?.plannedUatStart && item.dates?.plannedUatEnd
                      ? `${item.dates.plannedUatStart.slice(5)} → ${item.dates.plannedUatEnd.slice(5)}`
                      : 'Not scheduled'}
                  </span>
                </div>
                <div className="p-2 bg-black/40 rounded-lg border border-white/[0.04]">
                  <span className="text-slate-500 text-[9px] uppercase font-bold block">Target Release</span>
                  <span className="text-indigo-300 font-mono font-bold">
                    {item.dates?.plannedRelease || 'Not scheduled'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsTimelineModalOpen(true)}
                className="w-full py-1.5 px-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Calendar size={12} />
                <span>Configure Specific Task Timelines</span>
              </button>
            </div>

            {/* Requirement Snapshot */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Requirement Details</span>
                <button onClick={() => setDetailModalWorkId(item.id)} className="text-blue-400 hover:text-blue-300 font-bold">Edit Full</button>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-white/[0.04] max-h-32 overflow-hidden relative">
                <div className="prose prose-invert prose-xs" dangerouslySetInnerHTML={{ __html: item.requirementDetails || '<p class="italic text-slate-500">No details provided.</p>' }} />
                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0C1017] to-transparent" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'delivery' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Divided Deliverables Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Divided Deliverables</h3>
                <button
                  onClick={() => setIsAddDelivOpen(!isAddDelivOpen)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-[10px] font-bold"
                >
                  + Add Item
                </button>
              </div>

              {isAddDelivOpen && (
                <form onSubmit={handleAddDeliverable} className="p-3 bg-slate-900 border border-blue-500/30 rounded-xl space-y-3">
                  <input
                    type="text"
                    placeholder="Item title..."
                    value={newDelivTitle}
                    onChange={(e) => setNewDelivTitle(e.target.value)}
                    className="w-full bg-black border border-white/[0.1] rounded p-2 text-xs"
                    required
                  />
                  <select
                    value={newDelivDev}
                    onChange={(e) => setNewDelivDev(e.target.value)}
                    className="w-full bg-black border border-white/[0.1] rounded p-2 text-xs"
                  >
                    {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                  </select>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setIsAddDelivOpen(false)} className="text-slate-400 px-2 py-1">Cancel</button>
                    <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded font-bold">Save</button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {deliverables.map((deliv) => (
                  <div key={deliv.id} className="p-3 bg-black/40 border border-white/[0.04] rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-slate-500 font-bold">{deliv.id}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${deliv.status === 'Ready for UAT' ? 'bg-teal-900 text-teal-300' : 'bg-slate-800 text-slate-400'}`}>{deliv.status}</span>
                    </div>
                    <div className="text-white font-medium leading-snug">{deliv.title}</div>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between">
                      <span>Dev: <strong className="text-slate-300">{deliv.assignedDeveloper}</strong></span>
                      <div className="flex gap-1">
                        {!isBusinessTeam && deliv.status !== 'Ready for UAT' && (
                          <button onClick={() => updateDeliverableStatus(item.id, deliv.id, 'Ready for UAT')} className="text-teal-400 hover:text-teal-300 font-bold">Mark Done</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {deliverables.length === 0 && <div className="text-center py-8 text-slate-600 italic">No deliverables divided yet.</div>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'verification' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* QA Summary */}
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <Zap size={14} />
                <span>QA Verification</span>
              </h3>
              <div className="p-4 bg-cyan-950/10 border border-cyan-900/30 rounded-xl space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Test Scenarios</span>
                  <span className="text-white font-bold">{item.qaCases?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pass Rate</span>
                  <span className="text-emerald-400 font-bold">
                    {Math.round(((item.qaCases?.filter(c => c.result === 'Pass').length || 0) / (item.qaCases?.length || 1)) * 100)}%
                  </span>
                </div>
                <button onClick={() => setActiveTab('qa')} className="w-full mt-2 py-1.5 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-400 border border-cyan-800/40 rounded-lg font-bold transition-colors">
                  Open QA Workspace
                </button>
              </div>
            </div>

            {/* UAT Summary */}
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold text-teal-400 uppercase tracking-widest flex items-center gap-2">
                <CheckSquare size={14} />
                <span>Business UAT Status</span>
              </h3>
              <div className="p-4 bg-teal-950/10 border border-teal-900/30 rounded-xl space-y-3">
                <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/[0.05]">
                  <div style={{ width: `${(readyUatCount / (deliverables.length || 1)) * 100}%` }} className="h-full bg-teal-500 transition-all duration-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Deliverable Readiness</span>
                  <span className="text-teal-400 font-bold">{readyUatCount} / {deliverables.length} Ready</span>
                </div>
                {item.uatCases && item.uatCases.length > 0 && (
                  <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">UAT Scenarios</span>
                      <span className="text-white font-bold">{item.uatCases.length}</span>
                    </div>
                    {item.uatCases.some((c) => c.requiresAttention) && (
                      <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold bg-amber-950/40 px-2 py-1 rounded border border-amber-800/40">
                        <span className="flex items-center gap-1">
                          <AlertTriangle size={11} className="text-amber-400" />
                          <span>Requires Attention</span>
                        </span>
                        <span>{item.uatCases.filter((c) => c.requiresAttention).length}</span>
                      </div>
                    )}
                  </div>
                )}
                <button onClick={() => setActiveTab('uat')} className="w-full py-1.5 bg-teal-950/40 hover:bg-teal-900/60 text-teal-400 border border-teal-800/40 rounded-lg font-bold transition-colors">
                  Open Acceptance Suite
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-in fade-in duration-200 h-full flex flex-col">
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
        )}
      </div>

      {/* Inspector Footer */}
      <div className="p-3 border-t border-white/[0.08] bg-[#0E121A]">
        <button
          onClick={() => setDetailModalWorkId(item.id)}
          className="w-full py-2 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-900/20 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <span>Open Full Editor</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </aside>

    {/* Task Timeline Configuration Modal */}
    <WorkTimelineModal
      workId={item.id}
      isOpen={isTimelineModalOpen}
      onClose={() => setIsTimelineModalOpen(false)}
    />
    </>
  );
};
