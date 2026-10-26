import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GitFork,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  CheckCircle2,
  XCircle,
  Bug,
  Sparkles,
  Rocket,
  ChevronRight,
  ChevronDown,
  Layers,
  ArrowRight,
  Zap,
  CheckSquare,
} from 'lucide-react';
import { WorkTypeIcon } from '../common/Icons';

export const DiagramView: React.FC = () => {
  const {
    workItems,
    config,
    sprints,
    releases,
    setSelectedWorkId,
    setIsInspectorOpen,
    setDetailModalWorkId,
  } = useApp();

  const [mode, setMode] = useState<'tree' | 'graph'>('tree');
  const [selectedArea, setSelectedArea] = useState<string>('Bus');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(['root', 'area-Bus', 'wk-WK-142', 'wk-WK-145', 'wk-WK-143'])
  );
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [highlightedWorkId, setHighlightedWorkId] = useState<string | null>('WK-145');

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  // Filter work items for selected product area
  const areaWorkItems = workItems.filter(
    (w) => selectedArea === 'All' || w.productArea.includes(selectedArea) || w.productArea.includes('All')
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090d] overflow-hidden select-none">
      {/* Diagram Toolbar */}
      <div className="p-3 bg-[#0c1017] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <GitFork size={18} className="text-fuchsia-400" />
            <h1 className="text-sm font-bold text-white tracking-tight">Relationship Diagram &amp; Tree</h1>
          </div>
          <span className="text-slate-600">|</span>
          {/* Mode Switcher: Tree vs Graph */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-md">
            <button
              onClick={() => setMode('tree')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                mode === 'tree'
                  ? 'bg-fuchsia-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tree Hierarchy
            </button>
            <button
              onClick={() => setMode('graph')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                mode === 'graph'
                  ? 'bg-fuchsia-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Interactive Graph
            </button>
          </div>
        </div>

        {/* Product Area Filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-xs">Filter Area:</span>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1 text-xs text-slate-200"
            >
              <option value="All">All Product Areas</option>
              {config.productAreas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Zoom controls for graph */}
          {mode === 'graph' && (
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-md">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.15))}
                className="p-1 text-slate-400 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut size={13} />
              </button>
              <span className="font-mono text-[10px] px-1 text-slate-400">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
                className="p-1 text-slate-400 hover:text-white"
              >
                <ZoomIn size={13} />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 text-slate-400 hover:text-white ml-1 border-l border-slate-800"
                title="Reset Zoom"
              >
                <RotateCcw size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main View Area */}
      {mode === 'tree' ? (
        <div className="flex-1 overflow-auto p-6 text-xs text-slate-300 font-mono">
          <div className="max-w-4xl space-y-4">
            {/* Root Node: bdtickets */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 w-fit">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span>bdtickets (Unified Product Ecosystem)</span>
              </div>

              {/* Product Areas */}
              <div className="pl-6 border-l-2 border-slate-800/80 space-y-4">
                {(selectedArea === 'All' ? config.productAreas : [selectedArea]).map((area) => {
                  const areaItems = workItems.filter((w) => w.productArea.includes(area) || w.productArea.includes('All'));
                  const isAreaExpanded = expandedNodes.has(`area-${area}`);

                  return (
                    <div key={area} className="space-y-3">
                      <div
                        onClick={() => toggleNode(`area-${area}`)}
                        className="flex items-center gap-2 cursor-pointer text-slate-200 font-semibold hover:text-white group w-fit p-1.5 rounded hover:bg-slate-900"
                      >
                        {isAreaExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        <span className="text-amber-400 uppercase tracking-wider text-xs font-sans">
                          {area} Area
                        </span>
                        <span className="text-slate-500 font-normal">({areaItems.length} Work Items)</span>
                      </div>

                      {/* Work Items under Area */}
                      {isAreaExpanded && (
                        <div className="pl-6 border-l-2 border-slate-800/60 space-y-3">
                          {areaItems.map((item) => {
                            const isItemExpanded = expandedNodes.has(`wk-${item.id}`);
                            const isHighlighted = highlightedWorkId === item.id;

                            return (
                              <div key={item.id} className="space-y-2">
                                <div
                                  className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                                    isHighlighted
                                      ? 'bg-blue-950/70 border-blue-500 shadow-md shadow-blue-900/30'
                                      : 'bg-[#0d111a] hover:bg-slate-900 border-slate-800'
                                  }`}
                                  onClick={() => {
                                    toggleNode(`wk-${item.id}`);
                                    setSelectedWorkId(item.id);
                                    setIsInspectorOpen(true);
                                  }}
                                >
                                  <div className="flex items-center gap-2.5">
                                    {isItemExpanded ? (
                                      <ChevronDown size={13} className="text-slate-400" />
                                    ) : (
                                      <ChevronRight size={13} className="text-slate-400" />
                                    )}
                                    <WorkTypeIcon type={item.type} size={15} />
                                    <span className="font-bold text-slate-200">{item.id}</span>
                                    <span className="text-slate-300 font-sans font-medium">
                                      {item.title}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-sans">
                                      [{item.platform.join(', ')}]
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-3 text-[11px] font-sans">
                                    {item.sprintId && (
                                      <span className="text-amber-300 font-mono">{item.sprintId}</span>
                                    )}
                                    <span className="text-slate-400 capitalize">{item.status}</span>
                                  </div>
                                </div>

                                {/* Expanded Verification / Failure Tracing Sub-Tree */}
                                {isItemExpanded && (
                                  <div className="pl-6 border-l-2 border-slate-800/60 space-y-2 font-sans text-xs">
                                    {/* Development Phase */}
                                    <div className="p-2 bg-slate-950 rounded border border-slate-850 flex items-center justify-between text-slate-300">
                                      <span className="flex items-center gap-1.5">
                                        <CheckCircle2 size={13} className="text-blue-400" />
                                        <span>Development: {item.dates.actualDevEnd ? 'Completed' : 'In Progress'}</span>
                                      </span>
                                      <span className="text-slate-500 font-mono text-[10px]">
                                        Owner: {item.owner?.name || 'Unassigned'}
                                      </span>
                                    </div>

                                    {/* QA Phase & Test Cases */}
                                    {(item.qaCases || []).length > 0 && (
                                      <div className="p-2.5 bg-slate-950 rounded border border-slate-850 space-y-1.5">
                                        <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                                          <Zap size={13} />
                                          <span>QA Test Execution</span>
                                        </div>
                                        <div className="space-y-1 pl-3 border-l border-slate-800">
                                          {item.qaCases?.map((tc) => (
                                            <div
                                              key={tc.id}
                                              className="flex items-center justify-between text-[11px]"
                                            >
                                              <span className="text-slate-300">
                                                {tc.id} · {tc.scenario}
                                              </span>
                                              <span
                                                className={`font-semibold ${
                                                  tc.result === 'Pass'
                                                    ? 'text-emerald-400'
                                                    : tc.result === 'Fail'
                                                    ? 'text-rose-400'
                                                    : 'text-slate-500'
                                                }`}
                                              >
                                                {tc.result === 'Pass' ? 'Pass' : tc.result === 'Fail' ? 'Fail' : 'Untested'}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Linked Bugs from QA Failure */}
                                    {item.relatedWorkIds && item.relatedWorkIds.length > 0 && (
                                      <div className="pl-4 border-l-2 border-rose-900/60 space-y-1.5">
                                        <div className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                                          <Bug size={12} />
                                          <span>Failure Loop &amp; Spawned Bug Branch</span>
                                        </div>
                                        {item.relatedWorkIds.map((rel) => {
                                          const relWork = workItems.find((w) => w.id === rel.id);
                                          return (
                                            <div
                                              key={rel.id}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedWorkId(rel.id);
                                                setIsInspectorOpen(true);
                                                setHighlightedWorkId(rel.id);
                                              }}
                                              className="p-2 bg-rose-950/20 border border-rose-900/60 rounded flex items-center justify-between text-rose-200 cursor-pointer hover:bg-rose-950/40 transition-colors"
                                            >
                                              <div className="flex items-center gap-2">
                                                <Bug size={13} className="text-rose-400" />
                                                <span className="font-mono font-bold">{rel.id}</span>
                                                <span>{relWork?.title}</span>
                                              </div>
                                              <span className="text-emerald-400 text-[11px] font-semibold">
                                                Fix Verified &amp; Retested
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}

                                    {/* UAT Phase */}
                                    {(item.uatCases || []).length > 0 && (
                                      <div className="p-2 bg-slate-950 rounded border border-slate-850 flex items-center justify-between text-slate-300">
                                        <span className="flex items-center gap-1.5">
                                          <CheckSquare size={13} className="text-teal-400" />
                                          <span>Business UAT: Accepted</span>
                                        </span>
                                        <span className="text-slate-500 font-mono text-[10px]">
                                          Reviewed by Farhana Yasmin
                                        </span>
                                      </div>
                                    )}

                                    {/* Release Linkage */}
                                    {item.dates.plannedRelease && (
                                      <div className="p-2 bg-indigo-950/30 rounded border border-indigo-900/50 flex items-center justify-between text-indigo-300">
                                        <span className="flex items-center gap-1.5">
                                          <Rocket size={13} />
                                          <span>Delivery Release: v2.14</span>
                                        </span>
                                        <span className="font-mono text-[10px]">
                                          Target: {item.dates.plannedRelease}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Interactive SVG Graph Node Mode */
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-[#07080c] relative">
          <div
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
            className="transition-transform duration-100 ease-out"
          >
            {/* SVG Connecting Curves */}
            <div className="relative w-[860px] h-[580px] border border-slate-800/80 rounded-2xl bg-[#0b0e17]/80 backdrop-blur p-8 shadow-2xl">
              <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-700/80 fill-none stroke-2">
                {/* Product Area -> Feature */}
                <path d="M 430 70 L 430 140" />
                {/* Feature -> Sprint & Figma branches */}
                <path d="M 430 200 L 220 280" />
                <path d="M 430 200 L 430 280" />
                <path d="M 430 200 L 640 280" />
                {/* QA -> TC-03 Fail */}
                <path d="M 640 330 L 640 380" className="stroke-rose-500/80 stroke-dashed" />
                {/* TC-03 Fail -> Linked Bug WK-145 */}
                <path d="M 640 430 L 430 460" className="stroke-rose-500/80" />
                {/* Bug Fix Retest -> Release */}
                <path d="M 430 510 L 430 540" className="stroke-emerald-500/80" />
              </svg>

              {/* Node 1: Product Area Root */}
              <div className="absolute left-1/2 -translate-x-1/2 top-6 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg shadow-lg flex items-center gap-2 text-xs font-bold text-white z-10">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span>BUS ECOSYSTEM (Product Area)</span>
              </div>

              {/* Node 2: WK-142 Vehicle Tracking */}
              <div
                onClick={() => {
                  setSelectedWorkId('WK-142');
                  setIsInspectorOpen(true);
                  setHighlightedWorkId('WK-142');
                }}
                className={`absolute left-1/2 -translate-x-1/2 top-32 w-64 p-3 rounded-lg border shadow-lg cursor-pointer transition-all z-10 ${
                  highlightedWorkId === 'WK-142'
                    ? 'bg-blue-950/80 border-blue-500 shadow-blue-900/50'
                    : 'bg-slate-900/90 border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono font-bold text-purple-400">WK-142</span>
                  <span className="text-emerald-400 font-semibold uppercase">Dev Done</span>
                </div>
                <div className="text-xs font-bold text-white mt-1">Vehicle Tracking MVP</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Android · High Priority</div>
              </div>

              {/* Branch Left: Figma Link */}
              <div className="absolute left-28 top-64 w-44 p-2.5 bg-slate-950/90 border border-pink-500/40 rounded-lg text-xs z-10">
                <div className="text-pink-400 font-semibold text-[11px]">FIGMA SPEC</div>
                <div className="text-slate-200 mt-0.5">Vehicle Tracking v1.2</div>
                <div className="text-[10px] text-emerald-400">Status: Dev Ready</div>
              </div>

              {/* Branch Center: Sprint 24 */}
              <div className="absolute left-1/2 -translate-x-1/2 top-64 w-48 p-2.5 bg-slate-950/90 border border-amber-500/40 rounded-lg text-xs text-center z-10">
                <div className="text-amber-400 font-bold font-mono">SPRINT 24</div>
                <div className="text-[11px] text-slate-300">Oct 08 – Oct 21</div>
                <div className="text-[10px] text-slate-400">Committed Scope</div>
              </div>

              {/* Branch Right: QA Testing & TC-03 Failure */}
              <div className="absolute right-28 top-64 w-52 p-2.5 bg-slate-950/90 border border-cyan-500/40 rounded-lg text-xs z-10">
                <div className="flex justify-between text-[11px]">
                  <span className="text-cyan-400 font-semibold">QA VERIFICATION</span>
                  <span className="text-rose-400 font-bold">TC-03 FAILED</span>
                </div>
                <div className="text-slate-200 text-[11px] mt-1">Background GPS Socket Failed</div>
                <div className="text-[10px] text-rose-400 mt-0.5">Auto-spawned Bug Branch ↓</div>
              </div>

              {/* Linked Bug WK-145 (Crucial vertical slice verification) */}
              <div
                onClick={() => {
                  setSelectedWorkId('WK-145');
                  setIsInspectorOpen(true);
                  setHighlightedWorkId('WK-145');
                }}
                className={`absolute left-1/2 -translate-x-1/2 top-[440px] w-72 p-3 rounded-lg border shadow-lg cursor-pointer transition-all z-10 ${
                  highlightedWorkId === 'WK-145'
                    ? 'bg-rose-950/90 border-rose-500 shadow-rose-900/50'
                    : 'bg-slate-900 border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono font-bold text-rose-400">WK-145 (BUG)</span>
                  <span className="text-emerald-400 font-bold uppercase">Retest Pass</span>
                </div>
                <div className="text-xs font-bold text-white mt-1">Background tracking stops fix</div>
                <div className="text-[10px] text-slate-400">Spawned from WK-142 TC-03 · Rahim</div>
              </div>

              {/* Final Delivery Release Node */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-2 px-6 py-2 bg-indigo-950 border border-indigo-500 rounded-lg shadow-xl flex items-center gap-2 text-xs font-bold text-indigo-200 z-10">
                <Rocket size={14} className="text-indigo-400" />
                <span>RELEASE v2.14 (Ready for Deployment)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
