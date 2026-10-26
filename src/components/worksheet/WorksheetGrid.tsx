import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkItem, WorkStatus, PriorityLevel, WorkType, FeatureDeliverable } from '../../types';
import { WorkTypeIcon, PriorityIcon, StatusIndicator } from '../common/Icons';
import {
  User,
  Plus,
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronRight,
  Layers,
  Sparkles,
  Bug,
  RefreshCw,
  MoreHorizontal,
  ExternalLink,
  Zap,
  CheckSquare,
  Archive,
  RotateCcw,
  Bus,
  Ship,
  Lock,
} from 'lucide-react';

interface WorksheetGridProps {
  items: WorkItem[];
  selectedRowIds: Set<string>;
  setSelectedRowIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  groupBy: 'none' | 'sprint' | 'area' | 'operator' | 'status' | 'priority' | 'type';
  sortColumn: keyof WorkItem | 'sprint' | 'operator';
  sortDirection: 'asc' | 'desc';
  onSort: (col: keyof WorkItem | 'sprint' | 'operator') => void;
  activeAreaFilter?: string;
  activePlatformFilter?: string;
  activeSprintFilter?: string;
}

export const WorksheetGrid: React.FC<WorksheetGridProps> = ({
  items,
  selectedRowIds,
  setSelectedRowIds,
  groupBy,
  sortColumn,
  sortDirection,
  onSort,
  activeAreaFilter,
  activePlatformFilter,
  activeSprintFilter,
}) => {
  const {
    updateWorkItem,
    selectedWorkId,
    setSelectedWorkId,
    setIsInspectorOpen,
    config,
    sprints,
    users,
    addWorkItem,
    updateDeliverableStatus,
    addDeliverable,
    archiveWorkItem,
    unarchiveWorkItem,
    setActiveTab,
    currentRole,
  } = useApp();

  const isPM = currentRole === 'Project Manager' || currentRole === 'Super Admin';
  const isPO = currentRole === 'Product Owner' || currentRole === 'Super Admin';
  const isBusiness = currentRole === 'Business' || currentRole === 'Super Admin';
  const isUAT = currentRole === 'UAT' || currentRole === 'Super Admin';
  const isDeveloper = currentRole === 'Developer';
  const isBusinessTeam = currentRole === 'Business' || currentRole === 'UAT';
  const canChangeStatus =
    !isBusinessTeam &&
    (isPM ||
      isPO ||
      isDeveloper ||
      currentRole === 'Engineering Lead' ||
      currentRole === 'QA');
  const canManageSprint = isPM || isPO;
  const canDivideWork = isPM;

  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [inlineValue, setInlineValue] = useState<string>('');
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const [expandedFeatureIds, setExpandedFeatureIds] = useState<Set<string>>(new Set(['WK-142', 'WK-150']));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const toggleFeatureExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFeatureIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStartEdit = (id: string, field: string, currentValue: any) => {
    setEditingCell({ id, field });
    setInlineValue(String(currentValue || ''));
  };

  const handleCommitEdit = (id: string, field: string) => {
    if (!editingCell || editingCell.id !== id || editingCell.field !== field) return;
    if (field === 'title') {
      updateWorkItem(id, { title: inlineValue.trim() || 'Untitled Work Item' });
    } else if (field === 'estimate') {
      updateWorkItem(id, { estimate: inlineValue.trim() });
    }
    setEditingCell(null);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRowIds(new Set(items.map((i) => i.id)));
    } else {
      setSelectedRowIds(new Set());
    }
  };

  const handleToggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddTitle.trim()) return;

    const newItem = addWorkItem({
      title: quickAddTitle.trim(),
      productArea: activeAreaFilter ? [activeAreaFilter] : ['Landing Page', 'Bus'],
      platform: activePlatformFilter ? [activePlatformFilter] : ['Web', 'Mobile Web'],
      sprintId: activeSprintFilter,
      status: activeSprintFilter ? 'To Do' : 'Backlog',
      type: 'Feature',
      priority: 'Medium',
    });

    setQuickAddTitle('');
    setSelectedWorkId(newItem.id);
    setIsInspectorOpen(true);
  };

  const renderRow = (item: WorkItem) => {
    const isSelected = selectedRowIds.has(item.id);
    const isFocused = selectedWorkId === item.id;
    const deliverables = item.deliverables || [];
    const isExpanded = expandedFeatureIds.has(item.id);

    const readyUatCount = deliverables.filter((d) => d.status === 'Ready for UAT' || d.status === 'Done').length;
    const isFullFeatureUatReady = deliverables.length > 0 && readyUatCount === deliverables.length;

    return (
      <React.Fragment key={item.id}>
        {/* Desktop Spreadsheet Row */}
        <tr
          onClick={() => {
            setSelectedWorkId(item.id);
            setIsInspectorOpen(true);
          }}
          className={`hidden md:table-row group cursor-pointer text-xs border-b border-white/[0.06] transition-colors ${
            isFocused
              ? 'bg-blue-950/40 text-white'
              : isSelected
              ? 'bg-white/[0.05] text-slate-100'
              : 'hover:bg-white/[0.02] text-slate-300'
          }`}
        >
          {/* Checkbox */}
          <td className="w-10 px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => handleToggleSelectRow(item.id, e as any)}
              className="rounded border-slate-700 bg-black/60 text-blue-600 focus:ring-0 cursor-pointer"
            />
          </td>

          {/* ID with deliverable expand toggle */}
          <td className="w-28 px-3 py-2.5 font-mono font-semibold text-slate-400 group-hover:text-blue-400 whitespace-nowrap">
            <div className="flex items-center gap-1.5">
              {deliverables.length > 0 ? (
                <button
                  onClick={(e) => toggleFeatureExpand(item.id, e)}
                  className="p-0.5 hover:text-white rounded"
                  title="Toggle Divided Deliverables"
                >
                  {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </button>
              ) : (
                <span className="w-3.5" />
              )}
              <span>{item.id}</span>
            </div>
          </td>

          {/* Title (Inline editable) */}
          <td
            className="min-w-[280px] px-3 py-2.5"
            onDoubleClick={(e) => {
              e.stopPropagation();
              handleStartEdit(item.id, 'title', item.title);
            }}
          >
            {editingCell?.id === item.id && editingCell.field === 'title' ? (
              <input
                ref={inputRef}
                type="text"
                value={inlineValue}
                onChange={(e) => setInlineValue(e.target.value)}
                onBlur={() => handleCommitEdit(item.id, 'title')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCommitEdit(item.id, 'title');
                  if (e.key === 'Escape') setEditingCell(null);
                }}
                className="w-full bg-black border border-blue-500 rounded px-1.5 py-0.5 text-xs text-white outline-none"
              />
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-slate-200 truncate group-hover:text-white">
                  {item.title}
                </span>

                {/* Bus / Ship Operator Name Tag */}
                {item.operatorName && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 shrink-0">
                    {item.operatorName.includes('Ship') || item.operatorName.includes('Launch') || item.productArea.includes('Ship') ? (
                      <Ship size={11} className="text-emerald-400" />
                    ) : (
                      <Bus size={11} className="text-emerald-400" />
                    )}
                    <span>{item.operatorName}</span>
                  </span>
                )}

                {/* Full Feature UAT Ready badge rollup */}
                {isFullFeatureUatReady && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded font-bold bg-teal-950 text-teal-300 border border-teal-700/80">
                    FEATURE UAT READY ({readyUatCount}/{deliverables.length})
                  </span>
                )}
                {!isFullFeatureUatReady && deliverables.length > 0 && readyUatCount > 0 && (
                  <span className="text-[10px] font-mono text-amber-400">
                    ({readyUatCount}/{deliverables.length} UAT ready)
                  </span>
                )}
              </div>
            )}
          </td>

          {/* Type */}
          <td className="w-28 px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-1.5">
              <WorkTypeIcon type={item.type} size={14} />
              <select
                value={item.type}
                onChange={(e) => updateWorkItem(item.id, { type: e.target.value as WorkType })}
                className="grid-select border-slate-800 text-slate-300"
              >
                {config.workTypes.map((t) => (
                  <option key={t.name} value={t.name} className="bg-slate-900 text-slate-200">
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </td>

          {/* Operator Dropdown */}
          <td className="w-32 px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
            <select
              value={item.operatorName || ''}
              onChange={(e) => updateWorkItem(item.id, { operatorName: e.target.value || undefined })}
              className="grid-select border-emerald-900/40 text-emerald-400 font-bold max-w-[120px]"
            >
              <option value="" className="bg-slate-900 text-slate-400">— None —</option>
              {config.operators.map((op) => (
                <option key={op.id} value={op.name} className="bg-slate-900 text-slate-200">
                  {op.name}
                </option>
              ))}
            </select>
          </td>

          {/* Product Areas (Multi-area support) */}
          <td className="w-36 px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-1 flex-wrap">
              {item.productArea.slice(0, 2).map((area) => (
                <span
                  key={area}
                  className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-[#141824] text-amber-300 border border-amber-900/40"
                >
                  {area}
                </span>
              ))}
              {item.productArea.length > 2 && (
                <span className="text-[10px] text-slate-500 font-mono">
                  +{item.productArea.length - 2}
                </span>
              )}
            </div>
          </td>

          {/* Target Platforms (Multi-platform support) */}
          <td className="w-36 px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-1 flex-wrap">
              {item.platform.slice(0, 2).map((p) => (
                <span
                  key={p}
                  className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-[#141824] text-blue-300 border border-blue-900/40"
                >
                  {p}
                </span>
              ))}
              {item.platform.length > 2 && (
                <span className="text-[10px] text-slate-500 font-mono">
                  +{item.platform.length - 2}
                </span>
              )}
            </div>
          </td>

          {/* Priority */}
          <td className="w-28 px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-1.5">
              <PriorityIcon priority={item.priority} size={13} />
              <select
                value={item.priority}
                onChange={(e) =>
                  updateWorkItem(item.id, { priority: e.target.value as PriorityLevel })
                }
                className="grid-select border-slate-800 text-slate-300"
              >
                {config.priorities.map((p) => (
                  <option key={p.name} value={p.name} className="bg-slate-900 text-slate-200">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </td>

          {/* Estimate (Inline editable) */}
          <td
            className="w-28 px-3 py-2.5 font-mono"
            onDoubleClick={(e) => {
              e.stopPropagation();
              handleStartEdit(item.id, 'estimate', item.estimate);
            }}
          >
            {editingCell?.id === item.id && editingCell.field === 'estimate' ? (
              <input
                ref={inputRef}
                type="text"
                value={inlineValue}
                onChange={(e) => setInlineValue(e.target.value)}
                onBlur={() => handleCommitEdit(item.id, 'estimate')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCommitEdit(item.id, 'estimate');
                  if (e.key === 'Escape') setEditingCell(null);
                }}
                className="w-full bg-black border border-blue-500 rounded px-1.5 py-0.5 text-xs text-white outline-none"
              />
            ) : (
              <span className="text-slate-300 group-hover:text-white">
                {item.estimate || '—'}
              </span>
            )}
          </td>

          {/* Owner */}
          <td className="w-32 px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
            <select
              value={item.owner?.name || 'Unassigned'}
              disabled={!isPM}
              onChange={(e) => {
                const u = users.find((usr) => usr.name === e.target.value);
                updateWorkItem(item.id, {
                  owner: {
                    name: e.target.value,
                    role: u?.role || 'Developer',
                  },
                });
              }}
              className="grid-select border-slate-800 text-slate-300 max-w-[120px]"
            >
              <option value="Unassigned" className="bg-slate-900 text-slate-400">
                Unassigned
              </option>
              {users.map((u) => (
                <option key={u.id} value={u.name} className="bg-slate-900 text-slate-200">
                  {u.name}
                </option>
              ))}
            </select>
          </td>

          {/* Requester */}
          <td className="w-32 px-3 py-2.5 text-slate-400 font-medium truncate">
            {item.requesterName || item.reporter?.name || '—'}
          </td>

          {/* Sprint */}
          <td className="w-32 px-3 py-2.5 font-mono" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-1 group/sprint">
              <select
                value={item.sprintId || ''}
                disabled={!canManageSprint}
                onChange={(e) =>
                  updateWorkItem(item.id, { sprintId: e.target.value || undefined })
                }
                className="grid-select border-amber-900/30 text-amber-300/90 font-mono max-w-[90px]"
              >
                <option value="" className="bg-slate-900 text-slate-400">
                  — (B/L)
                </option>
                {sprints.map((sp) => (
                  <option key={sp.id} value={sp.id} className="bg-slate-900 text-slate-200">
                    {sp.id}
                  </option>
                ))}
              </select>
              {item.sprintId && (
                <button
                  onClick={() => setActiveTab('sprints')}
                  className="opacity-0 group-hover/sprint:opacity-100 p-0.5 text-amber-500 hover:text-amber-300 transition-opacity"
                  title="View Sprint Details"
                >
                  <ExternalLink size={10} />
                </button>
              )}
            </div>
          </td>

          {/* Figma Design Link Column */}
          <td className="w-24 px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
            {item.figmaUrl ? (
              <a
                href={item.figmaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold text-pink-400 hover:text-pink-300 bg-pink-950/40 hover:bg-pink-900/60 border border-pink-800/60 transition-colors"
                title={`Open Figma design: ${item.figmaUrl}`}
              >
                <span>Figma</span>
                <ExternalLink size={10} />
              </a>
            ) : (
              <span className="text-slate-600 text-xs">—</span>
            )}
          </td>

          {/* Status */}
          <td className="w-36 px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-1.5">
              <StatusIndicator status={item.status} size={12} />
              <div className="relative flex items-center">
                <select
                  value={item.status}
                  disabled={!canChangeStatus}
                  title={
                    isBusinessTeam
                      ? 'Business team cannot change status. Status is advanced via delivery & UAT workflow.'
                      : undefined
                  }
                  onChange={(e) => updateWorkItem(item.id, { status: e.target.value as WorkStatus })}
                  className={`grid-select border-slate-800 text-slate-200 font-bold max-w-[140px] ${
                    !canChangeStatus ? 'opacity-60 cursor-not-allowed bg-slate-900/40' : ''
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
                ].map((st) => {
                  // Restriction for Developers: Cannot move to Verification/Release/Archive stages directly from grid
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
                    <option key={st} value={st} className="bg-slate-900 text-slate-200">
                      {st}
                    </option>
                  );
                })}
              </select>
              {isBusinessTeam && (
                <span
                  className="ml-1 text-amber-400 shrink-0"
                  title="Status locked: Business team cannot change status. Status is advanced via UAT & delivery."
                >
                  <Lock size={11} />
                </span>
              )}
            </div>
            </div>
          </td>

          {/* Row Action: Archive / Unarchive */}
          <td className="w-16 px-2 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
            {item.status === 'Archived' ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  unarchiveWorkItem(item.id);
                }}
                className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/40 rounded transition-colors cursor-pointer"
                title="Unarchive / Restore Work Item"
              >
                <RotateCcw size={13} />
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Archive work item ${item.id} ("${item.title}")?`)) {
                    archiveWorkItem(item.id);
                  }
                }}
                className="p-1 text-slate-500 hover:text-amber-400 hover:bg-amber-950/40 rounded transition-colors cursor-pointer"
                title="Archive Work Item"
              >
                <Archive size={13} />
              </button>
            )}
          </td>
        </tr>

        {/* Divided Deliverables Sub-Rows under Parent Feature */}
        {deliverables.length > 0 && isExpanded && (
          deliverables.map((deliv) => (
            <tr
              key={deliv.id}
              className="hidden md:table-row bg-black/40 text-xs border-b border-white/[0.04] text-slate-400 hover:bg-black/60"
            >
              <td />
              <td className="px-3 py-2 pl-8 font-mono text-[11px] text-slate-500">
                ↳ {deliv.id}
              </td>
              <td className="px-3 py-2 text-slate-300">
                <span>{deliv.title}</span>
              </td>
              <td className="px-3 py-2 text-[11px] text-slate-500">Deliverable</td>
              <td colSpan={2} className="px-3 py-2 text-[11px] text-slate-400">
                Developer: <strong className="text-slate-300">{deliv.assignedDeveloper}</strong>
              </td>
              <td className="px-3 py-2 font-mono text-[11px]">{deliv.estimate || '—'}</td>
              <td colSpan={2} className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      deliv.status === 'Ready for UAT' || deliv.status === 'Done'
                        ? 'bg-teal-950 text-teal-400 border border-teal-800'
                        : deliv.status === 'Ready for QA'
                        ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                        : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {deliv.status}
                  </span>

                  {/* Fast Action Buttons: Developer marks QA Ready, QA marks UAT Ready */}
                  {!isBusinessTeam && deliv.status !== 'Ready for UAT' && deliv.status !== 'Done' && (
                    <>
                      {deliv.status !== 'Ready for QA' && (
                        <button
                          onClick={() => updateDeliverableStatus(item.id, deliv.id, 'Ready for QA')}
                          className="px-2 py-0.5 text-[10px] font-semibold bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 rounded"
                        >
                          Mark QA Ready
                        </button>
                      )}
                      <button
                        onClick={() => updateDeliverableStatus(item.id, deliv.id, 'Ready for UAT')}
                        className="px-2 py-0.5 text-[10px] font-semibold bg-teal-950/80 hover:bg-teal-900 text-teal-300 border border-teal-700/60 rounded"
                      >
                        Mark UAT Ready
                      </button>
                    </>
                  )}
                </div>
              </td>
              <td />
              <td />
            </tr>
          ))
        )}

        {/* Mobile Tactile Work Card (Section 75-76 Responsive) */}
        <tr className="md:hidden">
          <td colSpan={10} className="p-3 border-b border-white/[0.08]">
            <div
              onClick={() => {
                setSelectedWorkId(item.id);
                setIsInspectorOpen(true);
              }}
              className="p-3 bg-[#0D1017] rounded-xl border border-white/[0.08] space-y-2.5 shadow-sm active:bg-[#121620]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <WorkTypeIcon type={item.type} size={14} />
                  <span className="font-mono font-bold text-slate-300 text-xs">{item.id}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <PriorityIcon priority={item.priority} size={12} />
                  <span className="text-[11px] text-slate-400">{item.priority}</span>
                </div>
              </div>

              <div className="font-semibold text-slate-100 text-xs leading-snug">
                {item.title}
              </div>

              {/* Multi-Area & Multi-Platform Chips */}
              <div className="flex flex-wrap gap-1 text-[10px]">
                {item.productArea.map((a) => (
                  <span key={a} className="bg-amber-950/60 text-amber-300 px-1.5 py-0.2 rounded border border-amber-800/60">
                    {a}
                  </span>
                ))}
                {item.platform.map((p) => (
                  <span key={p} className="bg-blue-950/60 text-blue-300 px-1.5 py-0.2 rounded border border-blue-800/60">
                    {p}
                  </span>
                ))}
                {item.sprintId && (
                  <span className="bg-slate-900 text-amber-400 font-mono px-1.5 py-0.2 rounded border border-slate-700">
                    {item.sprintId}
                  </span>
                )}
              </div>

              {/* Status and Deliverables summary */}
              <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <StatusIndicator status={item.status} size={11} />
                  <span className="font-medium">{item.status}</span>
                </div>

                <div className="flex items-center gap-2 font-mono text-[10px]">
                  {deliverables.length > 0 ? (
                    <button
                      onClick={(e) => toggleFeatureExpand(item.id, e)}
                      className={`px-2 py-0.5 rounded font-bold border flex items-center gap-1 ${
                        isFullFeatureUatReady
                          ? 'bg-teal-950 text-teal-300 border-teal-700/80'
                          : 'bg-amber-950/70 text-amber-300 border-amber-800/80'
                      }`}
                    >
                      {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                      <span>
                        {isFullFeatureUatReady
                          ? `FEATURE UAT READY (${readyUatCount}/${deliverables.length})`
                          : `${readyUatCount}/${deliverables.length} UAT Ready`}
                      </span>
                    </button>
                  ) : (
                    <span className="text-slate-400">{item.owner?.name?.split(' ')[0] || 'Unassigned'}</span>
                  )}
                </div>
              </div>

              {/* Mobile Expanded Deliverables List */}
              {deliverables.length > 0 && isExpanded && (
                <div className="pt-2 border-t border-white/[0.06] space-y-2" onClick={(e) => e.stopPropagation()}>
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                    Divided Deliverables ({readyUatCount}/{deliverables.length} UAT Ready):
                  </div>
                  <div className="space-y-1.5">
                    {deliverables.map((deliv) => (
                      <div
                        key={deliv.id}
                        className="p-2 bg-black/40 rounded border border-white/[0.04] flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-slate-200 font-medium truncate">{deliv.title}</div>
                          <div className="text-[10px] text-slate-400">
                            Dev: <span className="text-slate-300">{deliv.assignedDeveloper}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {deliv.status !== 'Ready for UAT' && deliv.status !== 'Done' && (
                            <>
                              {deliv.status !== 'Ready for QA' && (
                                <button
                                  onClick={() => updateDeliverableStatus(item.id, deliv.id, 'Ready for QA')}
                                  className="px-2 py-0.5 text-[9px] font-semibold bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 rounded"
                                >
                                  QA Ready
                                </button>
                              )}
                              <button
                                onClick={() => updateDeliverableStatus(item.id, deliv.id, 'Ready for UAT')}
                                className="px-2 py-0.5 text-[9px] font-semibold bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-800 rounded"
                              >
                                UAT Ready
                              </button>
                            </>
                          )}
                          {(deliv.status === 'Ready for UAT' || deliv.status === 'Done') && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold text-teal-400 bg-teal-950 rounded border border-teal-800">
                              <Check size={10} />
                              <span>UAT Ready</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      </React.Fragment>
    );
  };

  // Grouping logic
  const groups: { [key: string]: WorkItem[] } = {};
  if (groupBy === 'none') {
    groups['All Items'] = items;
  } else {
    items.forEach((item) => {
      let key = 'Other';
      if (groupBy === 'sprint') {
        const sp = sprints.find((s) => s.id === item.sprintId);
        key = sp ? `${sp.name} (${sp.id})` : 'Product Backlog (No Sprint)';
      } else if (groupBy === 'area') {
        key = item.productArea.join(' / ') || 'Unassigned Area';
      } else if (groupBy === 'operator') {
        key = item.operatorName || 'General / No Operator';
      } else if (groupBy === 'status') {
        key = item.status;
      } else if (groupBy === 'priority') {
        key = item.priority;
      } else if (groupBy === 'type') {
        key = item.type;
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#08090C]">
      {/* Scrollable Spreadsheet Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse select-text">
          <thead className="hidden md:table-header-group sticky top-0 z-20 bg-[#0E121A] text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-white/[0.08] shadow-sm">
            <tr>
              <th className="w-10 px-3 py-2.5 text-center">
                <input
                  type="checkbox"
                  checked={items.length > 0 && selectedRowIds.size === items.length}
                  onChange={handleSelectAll}
                  className="rounded border-slate-700 bg-black/60 text-blue-600 focus:ring-0 cursor-pointer"
                />
              </th>
              <th
                onClick={() => onSort('id')}
                className="w-28 px-3 py-2.5 cursor-pointer hover:text-slate-200"
              >
                <div className="flex items-center gap-1">
                  <span>ID</span>
                  <ArrowUpDown size={11} />
                </div>
              </th>
              <th
                onClick={() => onSort('title')}
                className="min-w-[280px] px-3 py-2.5 cursor-pointer hover:text-slate-200"
              >
                <div className="flex items-center gap-1">
                  <span>Work &amp; Divided Deliverables</span>
                  <ArrowUpDown size={11} />
                </div>
              </th>
              <th
                onClick={() => onSort('type')}
                className="w-28 px-3 py-2.5 cursor-pointer hover:text-slate-200"
              >
                <div className="flex items-center gap-1">
                  <span>Type</span>
                  <ArrowUpDown size={11} />
                </div>
              </th>
              <th className="w-32 px-3 py-2.5">Operator</th>
              <th className="w-36 px-3 py-2.5">Product Areas</th>
              <th className="w-36 px-3 py-2.5">Platforms</th>
              <th
                onClick={() => onSort('priority')}
                className="w-28 px-3 py-2.5 cursor-pointer hover:text-slate-200"
              >
                <div className="flex items-center gap-1">
                  <span>Priority</span>
                  <ArrowUpDown size={11} />
                </div>
              </th>
              <th className="w-28 px-3 py-2.5">Estimate</th>
              <th className="w-32 px-3 py-2.5">Owner</th>
              <th className="w-32 px-3 py-2.5">Requester</th>
              <th
                onClick={() => onSort('sprint')}
                className="w-32 px-3 py-2.5 cursor-pointer hover:text-slate-200"
              >
                <div className="flex items-center gap-1">
                  <span>Sprint</span>
                  <ArrowUpDown size={11} />
                </div>
              </th>
              <th className="w-24 px-3 py-2.5">Figma</th>
              <th
                onClick={() => onSort('status')}
                className="w-36 px-3 py-2.5 cursor-pointer hover:text-slate-200"
              >
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <ArrowUpDown size={11} />
                </div>
              </th>
              <th className="w-16 px-2 py-2.5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/[0.04]">
            {Object.entries(groups).map(([groupTitle, groupItems]) => (
              <React.Fragment key={groupTitle}>
                {groupBy !== 'none' && (
                  <tr className="bg-[#0B0E16] text-[11px] font-semibold text-slate-300 border-y border-white/[0.08]">
                    <td colSpan={12} className="px-3 py-2 flex items-center gap-2">
                      <span className="text-blue-400 font-bold">▼</span>
                      <span>{groupTitle}</span>
                      <span className="text-slate-500 font-mono text-[10px] font-normal">
                        ({groupItems.length})
                      </span>
                    </td>
                  </tr>
                )}
                {groupItems.map(renderRow)}
              </React.Fragment>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan={12} className="py-16 text-center text-slate-500 text-xs">
                  No work items found matching this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Quick Add Bar */}
      <form
        onSubmit={handleQuickAdd}
        className="p-2 border-t border-white/[0.08] bg-[#0E121A] flex items-center gap-2"
      >
        <Plus size={14} className="text-blue-400 ml-2" />
        <input
          type="text"
          value={quickAddTitle}
          onChange={(e) => setQuickAddTitle(e.target.value)}
          placeholder="Add work item... (Press Enter to immediately add row)"
          className="flex-1 bg-transparent border-0 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0"
        />
        {activeAreaFilter && (
          <span className="text-[10px] text-amber-300 font-mono bg-black/40 px-2 py-0.5 rounded border border-white/[0.08]">
            {activeAreaFilter}
          </span>
        )}
        <button
          type="submit"
          disabled={!quickAddTitle.trim()}
          className="px-3 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded transition-colors"
        >
          Add
        </button>
      </form>
    </div>
  );
};
