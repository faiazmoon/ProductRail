import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkItem, UatTestCase, UatAnnotation } from '../../types';
import { WorkTypeIcon } from '../common/Icons';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Bug,
  Lightbulb,
  Play,
  Plus,
  AlertTriangle,
  Crosshair,
  MapPin,
  Eye,
  Camera,
  Layers,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Edit2,
  Trash2,
  ClipboardPaste,
  Rocket,
  FileSpreadsheet,
} from 'lucide-react';
import { UatAnnotatorModal } from './UatAnnotatorModal';
import { BulkTestCaseModal } from '../common/BulkTestCaseModal';

interface UatTestCaseRowProps {
  featureId: string;
  uatCase: UatTestCase;
  index: number;
  total: number;
  onUpdateResult: (featureId: string, caseId: string, result: 'Pass' | 'Fail') => void;
  onOpenFailModal: (work: WorkItem, tc: UatTestCase) => void;
  onOpenAnnotator: (feature: WorkItem, tc: UatTestCase) => void;
  currentFeature: WorkItem;
}

const UatTestCaseRow: React.FC<UatTestCaseRowProps> = ({
  featureId,
  uatCase: uc,
  index,
  total,
  onUpdateResult,
  onOpenFailModal,
  onOpenAnnotator,
  currentFeature,
}) => {
  const { updateWorkItem, toggleUatCaseAttention, deleteUatTestCase, updateUatTestCase } = useApp();
  const [issueText, setIssueText] = useState('');
  const [isEditingReason, setIsEditingReason] = useState(false);
  const [reasonInput, setReasonInput] = useState(uc.attentionReason || '');
  const [isEditingScenario, setIsEditingScenario] = useState(false);
  const [scenarioInput, setScenarioInput] = useState(uc.scenario);
  const [expectedInput, setExpectedInput] = useState(uc.expected);

  const handleSaveScenarioEdit = () => {
    if (!scenarioInput.trim()) return;
    updateUatTestCase(featureId, uc.id, {
      scenario: scenarioInput.trim(),
      expected: expectedInput.trim() || 'Business acceptance confirmed',
    });
    setIsEditingScenario(false);
  };

  const handleAddIssue = () => {
    if (!issueText.trim()) return;
    const updatedCases = (currentFeature.uatCases || []).map((c) => {
      if (c.id === uc.id) {
        return { ...c, issues: [...(c.issues || []), issueText.trim()] };
      }
      return c;
    });
    updateWorkItem(featureId, { uatCases: updatedCases });
    setIssueText('');
  };

  const handleToggleAttention = () => {
    const nextVal = !uc.requiresAttention;
    toggleUatCaseAttention(
      featureId,
      uc.id,
      nextVal,
      nextVal ? uc.attentionReason || 'Failing UI element verified during UAT' : undefined
    );
  };

  const handleSaveReason = () => {
    toggleUatCaseAttention(featureId, uc.id, true, reasonInput.trim() || undefined);
    setIsEditingReason(false);
  };

  const pinCount = uc.annotations?.length || 0;

  return (
    <div
      className={`p-4 rounded-xl border transition-all text-xs space-y-3 ${
        uc.requiresAttention
          ? 'bg-gradient-to-r from-amber-950/25 via-black/50 to-black/50 border-amber-500/50 shadow-md shadow-amber-950/20'
          : uc.result === 'Pass'
          ? 'bg-black/50 border-emerald-900/40'
          : 'bg-black/50 border-white/[0.08]'
      }`}
    >
      {/* Top Header Row with Scenario ID, Reviewer and Requires Attention Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-slate-400 font-mono text-[11px]">
        <div className="flex items-center gap-2">
          <span>
            Scenario {index + 1} of {total} ({uc.id})
          </span>
          {uc.reviewer && (
            <span className="text-teal-400 font-semibold font-sans">
              Accepted by {uc.reviewer}
            </span>
          )}
        </div>

        {/* Attention Flag Control & Edit/Delete actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsEditingScenario(!isEditingScenario)}
            className="p-1 text-slate-500 hover:text-slate-300 rounded cursor-pointer"
            title="Edit scenario"
          >
            <Edit2 size={12} />
          </button>
          <button
            onClick={() => deleteUatTestCase(featureId, uc.id)}
            className="p-1 text-slate-500 hover:text-rose-400 rounded cursor-pointer mr-1"
            title="Delete scenario"
          >
            <Trash2 size={12} />
          </button>

          <button
            onClick={handleToggleAttention}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold font-sans transition-all cursor-pointer ${
              uc.requiresAttention
                ? 'bg-amber-500 text-black shadow-sm shadow-amber-500/40 ring-1 ring-amber-300'
                : 'bg-white/[0.05] hover:bg-amber-950/60 hover:text-amber-300 text-slate-400 border border-white/[0.08]'
            }`}
            title="Flag or clear Requires Attention for this scenario"
          >
            <AlertTriangle
              size={12}
              className={uc.requiresAttention ? 'fill-black' : 'text-amber-400'}
            />
            <span>
              {uc.requiresAttention ? 'Requires Attention' : 'Flag Attention'}
            </span>
          </button>
        </div>
      </div>

      {/* Scenario Title / Edit Inputs */}
      {isEditingScenario ? (
        <div className="space-y-2 p-2.5 bg-black/60 border border-teal-500/50 rounded-xl">
          <input
            type="text"
            value={scenarioInput}
            onChange={(e) => setScenarioInput(e.target.value)}
            placeholder="Scenario..."
            className="w-full bg-black border border-white/[0.1] rounded-lg p-2 text-white text-xs"
          />
          <input
            type="text"
            value={expectedInput}
            onChange={(e) => setExpectedInput(e.target.value)}
            placeholder="Expected business outcome..."
            className="w-full bg-black border border-white/[0.1] rounded-lg p-2 text-slate-300 text-xs"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditingScenario(false)}
              className="px-2.5 py-1 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveScenarioEdit}
              className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-semibold"
            >
              Save Scenario
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="text-slate-100 font-medium text-sm leading-snug">
            {uc.scenario}
          </div>

          <div className="text-slate-400 text-xs bg-slate-900/60 p-2.5 rounded-lg border border-white/[0.05]">
            <strong className="text-slate-300">Expected Business Outcome:</strong>{' '}
            {uc.expected}
          </div>
        </>
      )}

      {/* Attention Banner if Flagged */}
      {uc.requiresAttention && (
        <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-lg space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <AlertTriangle size={13} className="text-amber-400 shrink-0" />
              <span>Requires Business &amp; Engineering Attention</span>
            </span>
            <button
              onClick={() => setIsEditingReason(!isEditingReason)}
              className="text-[10px] text-amber-400 hover:underline font-mono cursor-pointer"
            >
              {isEditingReason ? 'Cancel' : 'Edit Note'}
            </button>
          </div>

          {isEditingReason ? (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                placeholder="Reason why this requires attention..."
                className="flex-1 bg-black/60 border border-amber-500/40 rounded px-2 py-1 text-xs text-white focus:outline-none"
              />
              <button
                onClick={handleSaveReason}
                className="px-2.5 py-1 bg-amber-500 text-black font-bold rounded text-xs"
              >
                Save
              </button>
            </div>
          ) : (
            <p className="text-amber-200/90 text-[11px] leading-relaxed">
              {uc.attentionReason || 'Visual defect observed on UI element during live UAT verification.'}
            </p>
          )}
        </div>
      )}

      {/* Annotated Screenshot Card / Thumbnail */}
      {(uc.screenshotUrl || pinCount > 0) && (
        <div className="p-3 bg-slate-950/60 border border-white/[0.08] rounded-xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Visual Thumbnail */}
            <div
              onClick={() => onOpenAnnotator(currentFeature, uc)}
              className="relative w-20 h-14 rounded-lg overflow-hidden border border-amber-500/40 cursor-pointer group shadow-md shrink-0 bg-black"
            >
              {uc.screenshotUrl ? (
                <img
                  src={uc.screenshotUrl}
                  alt="Failing UI Element"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500">
                  <Camera size={20} />
                </div>
              )}
              {/* Overlaid Pin Pill */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                <span className="bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                  <MapPin size={9} /> {pinCount}
                </span>
              </div>
            </div>

            <div>
              <div className="font-bold text-white text-xs flex items-center gap-1.5">
                <span>Annotated Failing UI Element</span>
                <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-amber-950 text-amber-300 border border-amber-800">
                  {pinCount} Pin{pinCount === 1 ? '' : 's'} Placed
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                {uc.annotations?.[0]?.comment || 'Visual markers attached directly to this failing UI component.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenAnnotator(currentFeature, uc)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-200 border border-white/[0.08] transition-colors cursor-pointer"
          >
            <Eye size={13} className="text-teal-400" />
            <span>Inspect &amp; Add Pins</span>
          </button>
        </div>
      )}

      {/* Defects per Scenario */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <span>Defects Found ({uc.issues?.length || 0})</span>
        </div>
        {uc.issues && uc.issues.length > 0 && (
          <div className="space-y-1">
            {uc.issues.map((issue, i) => (
              <div
                key={i}
                className="flex items-start gap-2 bg-rose-950/20 border border-rose-900/40 p-2 rounded-lg text-rose-200"
              >
                <Bug size={12} className="shrink-0 mt-0.5 text-rose-400" />
                <span className="leading-tight">{issue}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Add specific defect observed..."
            value={issueText}
            onChange={(e) => setIssueText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddIssue()}
            className="flex-1 bg-black/40 border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-rose-500 transition-colors"
          />
          <button
            onClick={handleAddIssue}
            disabled={!issueText.trim()}
            className="p-1.5 text-rose-400 hover:text-rose-300 disabled:opacity-50 cursor-pointer"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Acceptance Action Buttons & Annotate Launch */}
      <div className="pt-2 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
        {/* Left: Annotate Failing UI Element Button */}
        <button
          onClick={() => onOpenAnnotator(currentFeature, uc)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors cursor-pointer"
        >
          <Crosshair size={13} className="text-amber-400" />
          <span>{pinCount > 0 ? `Edit Visual Pins (${pinCount})` : 'Annotate Failing UI'}</span>
        </button>

        {/* Right: Pass or Fail Decisions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateResult(featureId, uc.id, 'Pass')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              uc.result === 'Pass'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 font-bold'
                : 'bg-[#121620] hover:bg-emerald-950/80 hover:text-emerald-300 text-slate-300 border border-white/[0.1]'
            }`}
          >
            <CheckCircle2 size={14} />
            <span>Accept Scenario</span>
          </button>

          <button
            onClick={() => onOpenFailModal(currentFeature, uc)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              uc.result === 'Fail'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40 font-bold'
                : 'bg-[#121620] hover:bg-rose-950/80 hover:text-rose-300 text-slate-300 border border-white/[0.1]'
            }`}
          >
            <XCircle size={14} />
            <span>Report Defect</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const UatWorkspace: React.FC = () => {
  const {
    workItems,
    updateUatCaseResult,
    deleteUatTestCase,
    updateUatTestCase,
    createItemFromUatFail,
    logUatDiscovery,
    toggleUatCaseAttention,
    updateUatCaseAnnotations,
    currentUser,
    isUatModeActive,
    setIsUatModeActive,
    updateWorkItem,
    promoteUatToRelease,
    promoteQaToUat,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'attention' | 'feature-ready' | 'partial' | 'accepted'>('all');
  const [selectedFeatureForSession, setSelectedFeatureForSession] = useState<string>('WK-150');

  // Bulk Modal State
  const [bulkModalWork, setBulkModalWork] = useState<{
    work: WorkItem;
    tab: 'paste' | 'grid' | 'ac';
  } | null>(null);

  // Discovery Form State
  const [isDiscoveryModalOpen, setIsDiscoveryModalOpen] = useState(false);
  const [discoveryTitle, setDiscoveryTitle] = useState('');
  const [discoveryType, setDiscoveryType] = useState<'Bug' | 'CR' | 'Improvement'>('Bug');
  const [discoverySeverity, setDiscoverySeverity] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [discoveryDesc, setDiscoveryDesc] = useState('');

  // Rejection modal
  const [failingCaseModal, setFailingCaseModal] = useState<{ work: WorkItem; uatCase: UatTestCase } | null>(null);
  const [targetType, setTargetType] = useState<'Bug' | 'CR'>('Bug');
  const [issueTitle, setIssueTitle] = useState('');
  const [feedbackComment, setFeedbackComment] = useState('');

  // Visual Annotator Modal State
  const [annotatorModal, setAnnotatorModal] = useState<{
    feature: WorkItem;
    uatCase: UatTestCase;
  } | null>(null);

  const handleOpenAnnotator = (feature: WorkItem, tc: UatTestCase) => {
    setAnnotatorModal({ feature, uatCase: tc });
  };

  const handleSaveAnnotations = (
    annotations: UatAnnotation[],
    screenshotUrl: string,
    requiresAttention: boolean,
    reason?: string
  ) => {
    if (!annotatorModal) return;
    updateUatCaseAnnotations(
      annotatorModal.feature.id,
      annotatorModal.uatCase.id,
      annotations,
      screenshotUrl
    );
    toggleUatCaseAttention(
      annotatorModal.feature.id,
      annotatorModal.uatCase.id,
      requiresAttention,
      reason
    );
  };

  const handleOpenFailModal = (work: WorkItem, tc: UatTestCase) => {
    setFailingCaseModal({ work, uatCase: tc });
    setIssueTitle(`${tc.scenario} - Defect Observed`);
    setFeedbackComment(
      tc.attentionReason ||
        (tc.annotations?.length ? `${tc.annotations.length} UI defect pins pinned on preview` : '')
    );
  };

  const handleConfirmUatRejection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!failingCaseModal) return;

    updateUatCaseResult(
      failingCaseModal.work.id,
      failingCaseModal.uatCase.id,
      'Fail',
      feedbackComment
    );

    createItemFromUatFail(
      failingCaseModal.work.id,
      failingCaseModal.uatCase.id,
      targetType,
      issueTitle,
      feedbackComment
    );

    setFailingCaseModal(null);
  };

  const handlePartialPass = (workId: string) => {
    if (confirm('Mark feature as Partially Passed and Ready for Release? (Business/Users must agree)')) {
      updateWorkItem(workId, { status: 'Ready for Release' });
    }
  };

  // Filter features
  const allFeatures = workItems.filter(
    (w) =>
      w.type === 'Feature' ||
      (w.deliverables && w.deliverables.length > 0) ||
      (w.uatCases && w.uatCases.length > 0)
  );

  const totalAttentionCount = allFeatures.reduce((acc, feat) => {
    return acc + (feat.uatCases?.filter((c) => c.requiresAttention)?.length || 0);
  }, 0);

  const filteredFeatures = allFeatures.filter((feat) => {
    if (activeFilter === 'attention') {
      return (feat.uatCases || []).some((c) => c.requiresAttention);
    }
    if (activeFilter === 'feature-ready') {
      const isUatStage =
        feat.status === 'Ready for UAT' ||
        feat.status === 'In UAT' ||
        feat.status === 'Ready for Release' ||
        feat.status === 'Released';
      const deliverables = feat.deliverables || [];
      if (deliverables.length === 0) return isUatStage;
      return deliverables.every((d) => d.status === 'Ready for UAT' || d.status === 'Done');
    }
    if (activeFilter === 'partial') {
      const deliverables = feat.deliverables || [];
      if (deliverables.length === 0) return false;
      const ready = deliverables.filter((d) => d.status === 'Ready for UAT' || d.status === 'Done').length;
      return ready > 0 && ready < deliverables.length;
    }
    if (activeFilter === 'accepted') {
      return (
        feat.status === 'Ready for Release' ||
        feat.status === 'Released' ||
        ((feat.uatCases || []).length > 0 && (feat.uatCases || []).every((c) => c.result === 'Pass'))
      );
    }
    return true;
  });

  const getFeatureReadiness = (feature: WorkItem) => {
    const deliverables = feature.deliverables || [];
    if (deliverables.length === 0) {
      const isUatStage =
        feature.status === 'Ready for UAT' ||
        feature.status === 'In UAT' ||
        feature.status === 'Ready for Release' ||
        feature.status === 'Released';
      return {
        isFullFeatureReady: isUatStage,
        readyCount: isUatStage ? 1 : 0,
        totalCount: 1,
        percent: isUatStage ? 100 : 0,
      };
    }

    const readyCount = deliverables.filter(
      (d) => d.status === 'Ready for UAT' || d.status === 'Done'
    ).length;
    const isFullFeatureReady = readyCount === deliverables.length && deliverables.length > 0;
    const percent = Math.round((readyCount / deliverables.length) * 100);

    return {
      isFullFeatureReady,
      readyCount,
      totalCount: deliverables.length,
      percent,
    };
  };

  const currentSessionFeature =
    workItems.find((w) => w.id === selectedFeatureForSession) || allFeatures[0];

  const currentSessionAttentionCases =
    currentSessionFeature?.uatCases?.filter((c) => c.requiresAttention) || [];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090C] overflow-hidden">
      {/* Top Header */}
      <div className="p-4 bg-[#0D1017] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare size={18} className="text-teal-400" />
            <h1 className="text-base font-bold text-white tracking-tight">
              Business UAT Acceptance Suite
            </h1>
            {totalAttentionCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <AlertTriangle size={12} className="text-amber-400" />
                <span>{totalAttentionCount} Require Attention</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Full feature acceptance: Review test scenarios, pin visual defect markers on failing UI elements, and sign off with complete traceability.
          </p>
        </div>

        {/* UAT Mode Launcher button ("Class in act") */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsUatModeActive(!isUatModeActive)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer ${
              isUatModeActive
                ? 'bg-teal-500 text-black shadow-teal-500/20 font-bold'
                : 'bg-teal-950/70 text-teal-300 border border-teal-700/80 hover:bg-teal-900/60'
            }`}
          >
            <Play size={13} className={isUatModeActive ? 'fill-black' : 'fill-teal-300'} />
            <span>{isUatModeActive ? 'Exit Live Testing Mode' : 'Launch UAT Session Mode'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar (When not in live session mode) */}
      {!isUatModeActive && (
        <div className="px-4 py-2.5 bg-[#0A0D14] border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: `All Features (${allFeatures.length})` },
              {
                id: 'attention',
                label: `⚠️ Requires Attention (${totalAttentionCount})`,
                hasBadge: totalAttentionCount > 0,
              },
              { id: 'feature-ready', label: 'Full Feature Ready' },
              { id: 'partial', label: 'Partial Ready' },
              { id: 'accepted', label: 'Accepted / Shipped' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? tab.id === 'attention'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                      : 'bg-teal-600/20 text-teal-300 border border-teal-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Showing {filteredFeatures.length} feature{filteredFeatures.length === 1 ? '' : 's'}
          </div>
        </div>
      )}

      {/* UAT Session Mode ("Class in act") */}
      {isUatModeActive && currentSessionFeature ? (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-b from-[#0B0E16] to-[#08090C] space-y-6 animate-in fade-in duration-150">
          {/* Top Session Bar */}
          <div className="p-4 bg-teal-950/30 border border-teal-500/30 rounded-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold block">
                  Active UAT Session · Acceptance Review
                </span>
                <span className="text-sm font-bold text-white font-sans">
                  Testing Feature: {currentSessionFeature.id} — {currentSessionFeature.title}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Select another feature to test */}
              <select
                value={selectedFeatureForSession}
                onChange={(e) => setSelectedFeatureForSession(e.target.value)}
                className="bg-black/60 border border-white/[0.1] rounded-md px-3 py-1.5 text-xs text-white"
              >
                {allFeatures.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.id} · {f.title}
                  </option>
                ))}
              </select>

              {/* Log Discovery Button */}
              <button
                onClick={() => {
                  setDiscoveryTitle('');
                  setDiscoveryDesc('');
                  setIsDiscoveryModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-md text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <Lightbulb size={14} />
                <span>+ Log New Discovery in UAT</span>
              </button>
            </div>
          </div>

          {/* Attention Banner if Current Feature has Attention Flags */}
          {currentSessionAttentionCases.length > 0 && (
            <div className="p-3.5 bg-gradient-to-r from-amber-950/60 to-black/60 border border-amber-500/50 rounded-xl flex items-center justify-between gap-3 text-xs shadow-lg">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <div className="font-bold text-amber-300">
                    {currentSessionAttentionCases.length} Scenario{currentSessionAttentionCases.length === 1 ? '' : 's'} Flagged for Attention
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Inspect annotated screenshots below to verify UI defect markers before final sign-off.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-amber-500 text-black font-bold text-[11px]">
                Attention Required
              </span>
            </div>
          )}

          {/* Feature Rollup Status & Deliverables Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Deliverables & Acceptance Checklist */}
            <div className="lg:col-span-2 space-y-6">
              {/* Deliverable Breakdown */}
              <div className="bg-[#0D1017] border border-white/[0.08] rounded-xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Divided Deliverables &amp; Verification State
                    </h3>
                    <p className="text-xs text-slate-400">
                      When all items for this feature are UAT Ready, the full feature qualifies for release.
                    </p>
                  </div>

                  {(() => {
                    const { isFullFeatureReady, readyCount, totalCount, percent } =
                      getFeatureReadiness(currentSessionFeature);
                    return isFullFeatureReady ? (
                      <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5">
                        <CheckCircle2 size={14} />
                        <span>FULL FEATURE UAT READY ({readyCount}/{totalCount})</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-950/70 text-amber-400 border border-amber-800 rounded-lg text-xs font-mono font-semibold">
                        Partial Readiness: {readyCount}/{totalCount} Items Ready ({percent}%)
                      </span>
                    );
                  })()}
                </div>

                <div className="divide-y divide-white/[0.06] border border-white/[0.08] rounded-lg overflow-hidden bg-black/40 text-xs">
                  {(currentSessionFeature.deliverables || []).map((deliv) => (
                    <div
                      key={deliv.id}
                      className="p-3.5 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-medium text-slate-200">
                          <span className="font-mono text-slate-400 font-bold">{deliv.id}</span>
                          <span>{deliv.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Assigned Developer: <strong className="text-slate-300">{deliv.assignedDeveloper}</strong>
                          {deliv.notes && <span className="ml-2 italic text-slate-500">— {deliv.notes}</span>}
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap ${
                          deliv.status === 'Ready for UAT' || deliv.status === 'Done'
                            ? 'bg-teal-950 text-teal-400 border border-teal-800'
                            : deliv.status === 'Ready for QA'
                            ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {deliv.status}
                      </span>
                    </div>
                  ))}

                  {(!currentSessionFeature.deliverables ||
                    currentSessionFeature.deliverables.length === 0) && (
                    <div className="p-4 text-center text-slate-500 text-xs">
                      Single deliverable feature item.
                    </div>
                  )}
                </div>
              </div>

              {/* Acceptance Scenarios & Live Verification */}
              <div className="bg-[#0D1017] border border-white/[0.08] rounded-xl p-5 space-y-4 shadow-sm">
                {/* QA Handoff Sign-off Banner if present */}
                {currentSessionFeature.qaSignOff && (
                  <div className="p-3 bg-teal-950/40 border border-teal-500/40 rounded-xl text-xs space-y-1">
                    <div className="flex items-center gap-2 text-teal-300 font-bold">
                      <ShieldCheck size={14} />
                      <span>
                        QA Verification Signed Off by {currentSessionFeature.qaSignOff.tester} ({currentSessionFeature.qaSignOff.totalPassed} Passed in QA)
                      </span>
                    </div>
                    {currentSessionFeature.qaSignOff.notes && (
                      <p className="text-[11px] text-slate-300 italic">
                        "{currentSessionFeature.qaSignOff.notes}"
                      </p>
                    )}
                  </div>
                )}

                {/* All Passed Celebration & Promote to Release Hub */}
                {currentSessionFeature.uatCases &&
                  currentSessionFeature.uatCases.length > 0 &&
                  currentSessionFeature.uatCases.every((c) => c.result === 'Pass') && (
                    <div className="p-4 bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-black/60 border border-emerald-500/50 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-emerald-950/30">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                          <Sparkles size={18} />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-emerald-300">
                            All Acceptance Criteria Verified!
                          </div>
                          <p className="text-xs text-slate-300">
                            {currentSessionFeature.id} has satisfied business verification and is ready for production deployment.
                          </p>
                        </div>
                      </div>

                      {currentSessionFeature.status === 'Ready for Release' ? (
                        <span className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 size={13} />
                          <span>READY FOR RELEASE</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => promoteUatToRelease(currentSessionFeature.id)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950 flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Rocket size={14} />
                          <span>Promote to Release Hub</span>
                        </button>
                      )}
                    </div>
                  )}

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">
                      Acceptance Scenarios &amp; Live Verification
                    </h3>
                    <span className="text-xs text-slate-400">
                      ({currentSessionFeature.uatCases?.length || 0} Scenarios)
                    </span>
                  </div>

                  {/* Bulk Actions in UAT */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setBulkModalWork({ work: currentSessionFeature, tab: 'ac' })}
                      className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Generate acceptance scenarios from PO requirements"
                    >
                      <Sparkles size={12} className="text-amber-400" />
                      <span>⚡ Generate from AC</span>
                    </button>

                    <button
                      onClick={() => setBulkModalWork({ work: currentSessionFeature, tab: 'paste' })}
                      className="px-2.5 py-1 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Bulk paste acceptance matrix"
                    >
                      <ClipboardPaste size={12} />
                      <span>+ Bulk Add / Paste</span>
                    </button>

                    {(currentSessionFeature.qaCases?.length || 0) > 0 && (
                      <button
                        onClick={() => promoteQaToUat(currentSessionFeature.id, { markReadyForUat: false })}
                        className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Import verified test cases from QA"
                      >
                        <ShieldCheck size={12} />
                        <span>Import from QA ({currentSessionFeature.qaCases?.length})</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {(currentSessionFeature.uatCases || []).map((uc, index) => (
                    <UatTestCaseRow
                      key={uc.id}
                      featureId={currentSessionFeature.id}
                      uatCase={uc}
                      index={index}
                      total={currentSessionFeature.uatCases?.length || 0}
                      onUpdateResult={updateUatCaseResult}
                      onOpenFailModal={handleOpenFailModal}
                      onOpenAnnotator={handleOpenAnnotator}
                      currentFeature={currentSessionFeature}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Live UAT Discoveries Logged */}
            <div className="space-y-4">
              <div className="bg-[#0D1017] border border-white/[0.08] rounded-xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Lightbulb size={14} />
                    <span>UAT Discoveries ({currentSessionFeature.uatDiscoveries?.length || 0})</span>
                  </h3>
                  <button
                    onClick={() => {
                      setDiscoveryTitle('');
                      setDiscoveryDesc('');
                      setIsDiscoveryModalOpen(true);
                    }}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Log New</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {(currentSessionFeature.uatDiscoveries || []).map((disc) => (
                    <div
                      key={disc.id}
                      className="p-3 bg-black/40 border border-amber-900/40 rounded-lg space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-amber-400 font-bold text-[11px]">{disc.id}</span>
                        <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-rose-950 text-rose-300 border border-rose-800">
                          {disc.type}
                        </span>
                      </div>
                      <div className="font-semibold text-white leading-snug">{disc.title}</div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{disc.description}</p>
                      <div className="text-[10px] text-slate-500 pt-1 font-mono">
                        Logged by {disc.discoveredBy}
                      </div>
                    </div>
                  ))}

                  {(!currentSessionFeature.uatDiscoveries ||
                    currentSessionFeature.uatDiscoveries.length === 0) && (
                    <div className="py-8 text-center text-slate-500 text-xs italic">
                      Zero defects or new discoveries logged in this UAT session yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Scope & Area Metadata */}
              <div className="bg-[#0D1017] border border-white/[0.08] rounded-xl p-4 text-xs space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Target Product Areas &amp; Platforms
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentSessionFeature.productArea.map((area) => (
                    <span
                      key={area}
                      className="bg-amber-950/60 text-amber-300 border border-amber-800/80 px-2 py-0.5 rounded text-[11px] font-medium"
                    >
                      {area}
                    </span>
                  ))}
                  {currentSessionFeature.platform.map((p) => (
                    <span
                      key={p}
                      className="bg-blue-950/60 text-blue-300 border border-blue-800/80 px-2 py-0.5 rounded text-[11px] font-medium"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Feature Overview List */
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {filteredFeatures.map((feature) => {
            const { isFullFeatureReady, readyCount, totalCount, percent } =
              getFeatureReadiness(feature);

            const featureAttentionCases = (feature.uatCases || []).filter(
              (c) => c.requiresAttention
            );

            return (
              <div
                key={feature.id}
                className={`bg-[#0D1017] border rounded-xl p-5 space-y-4 shadow-sm transition-all ${
                  featureAttentionCases.length > 0
                    ? 'border-amber-500/50 shadow-amber-950/20'
                    : 'border-white/[0.08] hover:border-white/[0.15]'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <WorkTypeIcon type={feature.type} size={15} />
                      <span className="font-mono text-xs font-bold text-slate-300">{feature.id}</span>
                      <span className="text-slate-600">·</span>
                      <div className="flex items-center gap-1">
                        {feature.productArea.map((a) => (
                          <span key={a} className="text-amber-300 font-medium text-xs">
                            {a}
                          </span>
                        ))}
                      </div>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-400 text-xs">{feature.platform.join(', ')}</span>

                      {/* Attention Pill on Feature Card */}
                      {featureAttentionCases.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-black flex items-center gap-1 shadow-sm">
                          <AlertTriangle size={11} className="fill-black" />
                          <span>{featureAttentionCases.length} Requires Attention</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Feature Readiness Badge */}
                    {isFullFeatureReady ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-lg text-xs font-bold font-mono">
                        <CheckCircle2 size={13} />
                        <span>FULL FEATURE UAT READY ({readyCount}/{totalCount})</span>
                      </div>
                    ) : (
                      <div className="px-3 py-1 bg-slate-900 text-amber-400 border border-slate-700 rounded-lg text-xs font-mono">
                        {readyCount}/{totalCount} Items UAT Ready ({percent}%)
                      </div>
                    )}

                    {/* Quick AC and Bulk Add */}
                    <button
                      onClick={() => setBulkModalWork({ work: feature, tab: 'ac' })}
                      className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Generate test scenarios from Acceptance Criteria"
                    >
                      <Sparkles size={12} className="text-amber-400" />
                      <span>AC</span>
                    </button>

                    <button
                      onClick={() => setBulkModalWork({ work: feature, tab: 'paste' })}
                      className="p-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Bulk paste acceptance scenarios"
                    >
                      <ClipboardPaste size={12} />
                      <span>Bulk</span>
                    </button>

                    {/* Promote to Release Hub if all passed */}
                    {feature.uatCases &&
                      feature.uatCases.length > 0 &&
                      feature.uatCases.every((c) => c.result === 'Pass') &&
                      feature.status !== 'Ready for Release' && (
                        <button
                          onClick={() => promoteUatToRelease(feature.id)}
                          className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-950 flex items-center gap-1 cursor-pointer"
                          title="Promote item to Release Hub"
                        >
                          <Rocket size={12} />
                          <span>Release</span>
                        </button>
                      )}

                    <button
                      onClick={() => {
                        setSelectedFeatureForSession(feature.id);
                        setIsUatModeActive(true);
                      }}
                      className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Play size={12} className="fill-white" />
                      <span>Start UAT Session</span>
                    </button>

                    {!isFullFeatureReady && (
                      <button
                        onClick={() => handlePartialPass(feature.id)}
                        className="px-3 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-600/40 rounded text-xs font-semibold cursor-pointer"
                      >
                        Partial Pass
                      </button>
                    )}
                  </div>
                </div>

                {/* Scenarios Preview List */}
                {feature.uatCases && feature.uatCases.length > 0 && (
                  <div className="pt-2 border-t border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      <span>UAT Test Scenarios ({feature.uatCases.length})</span>
                      {featureAttentionCases.length > 0 && (
                        <span className="text-amber-400 font-bold lowercase">
                          {featureAttentionCases.length} requires attention
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {feature.uatCases.map((tc) => (
                        <div
                          key={tc.id}
                          className={`p-3 rounded-lg border space-y-1.5 transition-all ${
                            tc.requiresAttention
                              ? 'bg-amber-950/25 border-amber-500/40'
                              : 'bg-black/30 border-white/[0.05]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-slate-400 font-bold text-[11px]">
                              {tc.id}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {tc.requiresAttention && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500 text-black flex items-center gap-0.5">
                                  <AlertTriangle size={9} /> Attention
                                </span>
                              )}
                              {tc.annotations && tc.annotations.length > 0 && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800 flex items-center gap-0.5">
                                  <MapPin size={9} /> {tc.annotations.length} Pins
                                </span>
                              )}
                              <span
                                className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
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
                          </div>
                          <div className="text-slate-200 line-clamp-1">{tc.scenario}</div>
                          <div className="pt-1 flex items-center justify-between">
                            <button
                              onClick={() => handleOpenAnnotator(feature, tc)}
                              className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Crosshair size={11} />
                              <span>
                                {tc.annotations?.length ? `View Pins (${tc.annotations.length})` : 'Annotate UI'}
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedFeatureForSession(feature.id);
                                setIsUatModeActive(true);
                              }}
                              className="text-[11px] text-teal-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                            >
                              <span>Test Scenario</span>
                              <ArrowRight size={11} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Visual UI Annotator Modal */}
      {annotatorModal && (
        <UatAnnotatorModal
          isOpen={true}
          onClose={() => setAnnotatorModal(null)}
          feature={annotatorModal.feature}
          uatCase={annotatorModal.uatCase}
          onSave={handleSaveAnnotations}
        />
      )}

      {/* Rejection / Defect Report Modal */}
      {failingCaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-100">
          <div className="w-full max-w-lg bg-[#0C1017] border border-rose-500/80 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <XCircle size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Report Defect / Scenario Failure</h3>
                  <p className="text-xs text-slate-400">
                    Automatically inherits all test case details and visual defect pins into the new Bug/CR.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFailingCaseModal(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <XCircle size={18} />
              </button>
            </div>

            {/* Visual Pins Inheritance Badge */}
            {failingCaseModal.uatCase.annotations && failingCaseModal.uatCase.annotations.length > 0 && (
              <div className="p-2.5 bg-amber-950/40 border border-amber-500/40 rounded-xl flex items-center gap-2 text-xs text-amber-200">
                <MapPin size={14} className="text-amber-400 shrink-0" />
                <span>
                  <strong>{failingCaseModal.uatCase.annotations.length} Visual UI Pins</strong> will be attached directly to this {targetType}.
                </span>
              </div>
            )}

            <form onSubmit={handleConfirmUatRejection} className="space-y-4 text-xs font-sans">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Defect Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Total price doesn't update when changing quantity..."
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-[#121620] border border-white/[0.1] rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Creation Type</label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as any)}
                    className="w-full bg-[#121620] border border-white/[0.1] rounded-lg p-2 text-white"
                  >
                    <option value="Bug">Bug (Fix required)</option>
                    <option value="CR">Change Request (New requirement)</option>
                  </select>
                </div>
                <div className="flex items-end pb-1 text-slate-400 italic font-mono text-[11px]">
                  Originates from {failingCaseModal.work.id}
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Business Feedback / Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe why this scenario failed..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  required
                  className="w-full bg-[#121620] border border-white/[0.1] rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setFailingCaseModal(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  Confirm Failure &amp; Create {targetType}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Discovery Modal */}
      {isDiscoveryModalOpen && currentSessionFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-100">
          <div className="w-full max-w-lg bg-[#0C1017] border border-amber-500/80 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb size={20} className="text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm text-white">Log New Discovery in UAT</h3>
                  <p className="text-xs text-slate-400">
                    Creates a linked Bug or Change Request on the Worksheet.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDiscoveryModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <XCircle size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!discoveryTitle.trim() || !currentSessionFeature) return;
                logUatDiscovery(currentSessionFeature.id, {
                  title: discoveryTitle.trim(),
                  type: discoveryType,
                  severity: discoverySeverity,
                  description: discoveryDesc.trim() || 'Discovered during live UAT verification.',
                });
                setIsDiscoveryModalOpen(false);
              }}
              className="space-y-4 text-xs font-sans"
            >
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Discovery Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Missing currency toggle on checkout screen..."
                  value={discoveryTitle}
                  onChange={(e) => setDiscoveryTitle(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-[#121620] border border-white/[0.1] rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Type</label>
                  <select
                    value={discoveryType}
                    onChange={(e) => setDiscoveryType(e.target.value as any)}
                    className="w-full bg-[#121620] border border-white/[0.1] rounded-lg p-2 text-white"
                  >
                    <option value="Bug">Bug</option>
                    <option value="CR">Change Request (CR)</option>
                    <option value="Improvement">Improvement</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Severity</label>
                  <select
                    value={discoverySeverity}
                    onChange={(e) => setDiscoverySeverity(e.target.value as any)}
                    className="w-full bg-[#121620] border border-white/[0.1] rounded-lg p-2 text-white"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the defect or business observation..."
                  value={discoveryDesc}
                  onChange={(e) => setDiscoveryDesc(e.target.value)}
                  className="w-full bg-[#121620] border border-white/[0.1] rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsDiscoveryModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  Save Discovery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Test Case Creation & Paste Modal */}
      {bulkModalWork && (
        <BulkTestCaseModal
          isOpen={true}
          onClose={() => setBulkModalWork(null)}
          work={bulkModalWork.work}
          mode="UAT"
          initialTab={bulkModalWork.tab}
        />
      )}
    </div>
  );
};
