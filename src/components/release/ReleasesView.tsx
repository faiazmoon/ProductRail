import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Release, WorkItem } from '../../types';
import { WorkTypeIcon, StatusIndicator } from '../common/Icons';
import {
  Rocket,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  FileText,
  Calendar,
  User,
  ShieldCheck,
  Plus,
  ExternalLink,
  Tag,
  Check,
  ArrowRight,
  Sparkles,
  Trash2,
} from 'lucide-react';

export const ReleasesView: React.FC = () => {
  const {
    releases,
    workItems,
    markReleaseShipped,
    updateRelease,
    deleteRelease,
    createRelease,
    setSelectedWorkId,
    setIsInspectorOpen,
    setActiveTab,
  } = useApp();

  const [selectedReleaseId, setSelectedReleaseId] = useState<string>(
    releases[0]?.id || ''
  );

  const handleCreateNewRelease = () => {
    const nextVer = (releases.length + 14) / 10 + 1;
    const newId = `REL-${Date.now()}`;
    createRelease({
      id: newId,
      name: `Release v${nextVer.toFixed(1)}`,
      status: 'Planning',
    });
    setSelectedReleaseId(newId);
  };

  const selectedRelease = releases.find((r) => r.id === selectedReleaseId) || releases[0];

  // Eligible features that have FULL UAT Passed and are ready to be released/shipped
  const eligibleUatPassedFeatures = workItems.filter((w) => {
    if (w.status === 'Released' || w.status === 'Archived' || w.status === 'Cancelled') return false;
    const isReadyForRelease = w.status === 'Ready for Release';
    const hasPassedAllUatCases =
      w.uatCases && w.uatCases.length > 0 && w.uatCases.every((c) => c.result === 'Pass');
    const isAllDeliverablesUatReady =
      w.deliverables &&
      w.deliverables.length > 0 &&
      w.deliverables.every((d) => d.status === 'Ready for UAT' || d.status === 'Done');

    return isReadyForRelease || hasPassedAllUatCases || isAllDeliverablesUatReady;
  });

  const includedItems = workItems.filter((w) =>
    selectedRelease?.includedWorkIds.includes(w.id)
  );

  const passedUatCount = includedItems.filter(
    (w) =>
      w.status === 'Ready for Release' ||
      (w.uatCases && w.uatCases.length > 0 && w.uatCases.every((c) => c.result === 'Pass')) ||
      (w.deliverables &&
        w.deliverables.length > 0 &&
        w.deliverables.every((d) => d.status === 'Ready for UAT' || d.status === 'Done'))
  ).length;

  const isReadyToShip =
    includedItems.length > 0 && selectedRelease?.status !== 'Released';

  const handleToggleIncludeItem = (workId: string) => {
    if (!selectedRelease) return;
    const current = selectedRelease.includedWorkIds || [];
    const next = current.includes(workId)
      ? current.filter((id) => id !== workId)
      : [...current, workId];

    updateRelease(selectedRelease.id, { includedWorkIds: next });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090C] overflow-hidden text-slate-100 font-sans">
      {/* Unified Top Navigation */}
      <div className="bg-[#090C13] border-b border-white/[0.08] px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 md:gap-6 overflow-x-auto">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-2 pr-2 border-r border-white/[0.08] shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></span>
            <span className="font-extrabold text-sm md:text-base text-white tracking-tight">
              ProductRail
            </span>
          </div>

          {/* Primary View Tabs */}
          <div className="flex items-center gap-1 text-xs font-semibold shrink-0">
            <button
              onClick={() => setActiveTab('all-work')}
              className="px-3 py-1.5 rounded-lg font-bold text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer"
            >
              All Work
            </button>
            <button
              onClick={() => setActiveTab('new-works')}
              className="px-3 py-1.5 rounded-lg font-bold text-amber-300/80 hover:text-amber-200 hover:bg-white/[0.04] transition-all cursor-pointer"
            >
              New Works
            </button>
            <button
              onClick={() => setActiveTab('my-work')}
              className="px-3 py-1.5 rounded-lg font-bold text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer"
            >
              My Work
            </button>
            <button
              onClick={() => setActiveTab('backlog')}
              className="px-3 py-1.5 rounded-lg font-bold text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer"
            >
              Product Backlog
            </button>
            <button
              onClick={() => setActiveTab('sprints')}
              className="px-3 py-1.5 rounded-lg font-bold text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer flex items-center gap-1"
            >
              <Calendar size={13} className="text-amber-400" />
              <span>Sprints</span>
            </button>
          </div>
        </div>
      </div>

      {/* Releases Sub-Header */}
      <div className="p-4 bg-[#0C1018] border-b border-white/[0.08] flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Rocket size={18} className="text-indigo-400" />
            <h1 className="text-base font-bold text-white tracking-tight">
              Releases &amp; UAT-Passed Deployment Hub
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Only full UAT-passed features are eligible to be packaged into releases and shipped to production.
          </p>
        </div>

        {/* Release Version Selector & Delete Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateNewRelease}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer mr-2"
          >
            <Plus size={14} />
            <span>New Release</span>
          </button>

          <select
            value={selectedReleaseId}
            onChange={(e) => setSelectedReleaseId(e.target.value)}
            className="bg-[#121622] border border-white/[0.12] rounded-lg px-3 py-1.5 text-xs text-slate-200 font-bold cursor-pointer"
          >
            {releases.map((rel) => (
              <option key={rel.id} value={rel.id}>
                {rel.name} · {rel.productArea.join(', ')} ({rel.status})
              </option>
            ))}
          </select>
          {selectedRelease && (
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete release "${selectedRelease.name}"?`)) {
                  deleteRelease(selectedRelease.id);
                  const rem = releases.filter((r) => r.id !== selectedRelease.id);
                  if (rem.length > 0) setSelectedReleaseId(rem[0].id);
                }
              }}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
              title="Delete Release"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {selectedRelease && (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* Release Readiness Dashboard Card */}
          <div className="bg-[#0D111A] border border-white/[0.08] rounded-2xl p-5 space-y-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl font-bold text-white font-mono">{selectedRelease.name}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                      selectedRelease.status === 'Released'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : selectedRelease.status === 'Ready'
                        ? 'bg-blue-950 text-blue-400 border border-blue-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {selectedRelease.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>Target Date: {selectedRelease.targetDate}</span>
                  <span>·</span>
                  <span>Area: {selectedRelease.productArea.join(', ')}</span>
                  <span>·</span>
                  <span>Platforms: {selectedRelease.platforms.join(', ')}</span>
                  <span>·</span>
                  <span>Owner: {selectedRelease.owner}</span>
                </div>
              </div>

              {/* Primary Action: Ship to production */}
              {selectedRelease.status !== 'Released' ? (
                <button
                  onClick={() => markReleaseShipped(selectedRelease.id)}
                  disabled={!isReadyToShip}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer ${
                    isReadyToShip
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/[0.06]'
                  }`}
                >
                  <Rocket size={14} />
                  <span>Ship Release to Production</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950/60 border border-emerald-800/80 rounded-lg text-emerald-300 text-xs font-bold">
                  <CheckCircle2 size={16} />
                  <span>Shipped to Live Environment</span>
                </div>
              )}
            </div>

            {/* Release Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/[0.06] text-xs">
              <div className="p-3 bg-black/40 rounded-xl border border-white/[0.06]">
                <span className="text-slate-400 text-[11px] block mb-1">Included Work Items</span>
                <span className="text-base font-bold text-white font-mono">
                  {includedItems.length}
                </span>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-white/[0.06]">
                <span className="text-slate-400 text-[11px] block mb-1">Full UAT Passed</span>
                <span className="text-base font-bold text-teal-400 font-mono">
                  {passedUatCount}/{includedItems.length}
                </span>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-white/[0.06]">
                <span className="text-slate-400 text-[11px] block mb-1">Deployment Readiness</span>
                <span className={`text-base font-bold font-mono ${isReadyToShip ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isReadyToShip ? '100% READY' : 'PENDING'}
                </span>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-white/[0.06]">
                <span className="text-slate-400 text-[11px] block mb-1">Status</span>
                <span className="text-base font-bold text-white font-mono">
                  {selectedRelease.status}
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Eligible Full UAT Passed Features (Prompt requirement) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck size={16} className="text-teal-400" />
                  <span>Eligible Full UAT-Passed Features ({eligibleUatPassedFeatures.length})</span>
                </h3>
                <p className="text-xs text-slate-400">
                  These features have completed and passed commercial acceptance testing and are verified for deployment.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {eligibleUatPassedFeatures.map((item) => {
                const isIncluded = selectedRelease.includedWorkIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedWorkId(item.id);
                      setIsInspectorOpen(true);
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isIncluded
                        ? 'bg-[#101726] border-blue-500 shadow-sm'
                        : 'bg-[#0D111A] border-white/[0.08] hover:border-slate-500'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-blue-400">{item.id}</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800">
                          <Check size={11} className="text-teal-400" />
                          <span>Full UAT Passed</span>
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white leading-snug">{item.title}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        {item.operatorName && (
                          <span className="text-emerald-300 font-semibold">
                            {item.operatorName} ·
                          </span>
                        )}
                        <span>Areas: {item.productArea.join(', ')}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Est: {item.estimate || '3 pts'} · Owner: {item.owner?.name || 'Unassigned'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleIncludeItem(item.id);
                        }}
                        className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                          isIncluded
                            ? 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900'
                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                        }`}
                      >
                        {isIncluded ? 'Remove from Bundle' : '+ Add to Release'}
                      </button>
                    </div>
                  </div>
                );
              })}

              {eligibleUatPassedFeatures.length === 0 && (
                <div className="col-span-2 p-8 text-center bg-[#0D111A] border border-white/[0.08] rounded-xl text-xs text-slate-500">
                  No features are currently marked as Full UAT Passed. Complete UAT acceptance sessions in the UAT Workspace to unlock release candidates.
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Included Features in Selected Release */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Rocket size={16} className="text-indigo-400" />
              <span>Included in Release {selectedRelease.name} ({includedItems.length})</span>
            </h3>

            <div className="border border-white/[0.08] rounded-2xl overflow-hidden bg-[#0D111A]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#121622] text-slate-400 border-b border-white/[0.08] font-semibold">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Title &amp; Requirements</th>
                    <th className="p-3">Operator</th>
                    <th className="p-3">UAT Status</th>
                    <th className="p-3">Owner</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-slate-300">
                  {includedItems.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => {
                        setSelectedWorkId(item.id);
                        setIsInspectorOpen(true);
                      }}
                      className="hover:bg-white/[0.02] cursor-pointer"
                    >
                      <td className="p-3 font-mono font-bold text-blue-400">{item.id}</td>
                      <td className="p-3 font-medium text-white max-w-sm truncate">{item.title}</td>
                      <td className="p-3 text-emerald-300 font-semibold">{item.operatorName || '—'}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800 uppercase">
                          UAT Signed Off
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{item.owner?.name || 'Unassigned'}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleIncludeItem(item.id);
                          }}
                          className="text-xs text-rose-400 hover:text-rose-300 font-medium cursor-pointer"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {includedItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No features added to this release bundle yet. Select UAT-passed features above to include them.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
