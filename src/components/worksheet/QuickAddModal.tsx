import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Plus, Figma, Check, Upload, Sparkles, Bus, Ship, Search } from 'lucide-react';
import { PriorityLevel, WorkType } from '../../types';
import { RichTextEditor } from '../common/RichTextEditor';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBulkImport?: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onOpenBulkImport,
}) => {
  const { addWorkItem, config, setSelectedWorkId, setIsInspectorOpen } = useApp();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<WorkType>('Feature');
  const [selectedAreas, setSelectedAreas] = useState<string[]>(['Landing Page', 'Flash Deals']);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Web', 'Mobile Web']);
  const [priority, setPriority] = useState<PriorityLevel>('High');
  const [figmaUrl, setFigmaUrl] = useState('');
  const [requirementDetails, setRequirementDetails] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [showTimelineSection, setShowTimelineSection] = useState(false);
  const [plannedDevStart, setPlannedDevStart] = useState('');
  const [plannedDevEnd, setPlannedDevEnd] = useState('');
  const [plannedQaStart, setPlannedQaStart] = useState('');
  const [plannedQaEnd, setPlannedQaEnd] = useState('');
  const [plannedUatStart, setPlannedUatStart] = useState('');
  const [plannedUatEnd, setPlannedUatEnd] = useState('');
  const [plannedRelease, setPlannedRelease] = useState('');

  if (!isOpen) return null;

  // Real list of areas without 'All' string itself, to avoid duplication
  const allAvailableAreas = config.productAreas.filter((a) => a !== 'All');
  const allAvailablePlatforms = config.platforms.filter((p) => p !== 'All');

  const isAllAreasSelected =
    allAvailableAreas.length > 0 &&
    allAvailableAreas.every((a) => selectedAreas.includes(a));

  const isAllPlatformsSelected =
    allAvailablePlatforms.length > 0 &&
    allAvailablePlatforms.every((p) => selectedPlatforms.includes(p));

  // When 'All' is selected, toggles everything
  const handleToggleAllAreas = () => {
    if (isAllAreasSelected) {
      setSelectedAreas([]);
    } else {
      setSelectedAreas([...allAvailableAreas]);
    }
  };

  const handleToggleArea = (area: string) => {
    if (selectedAreas.includes(area)) {
      setSelectedAreas(selectedAreas.filter((a) => a !== area));
    } else {
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  // When 'All' is selected for platforms, toggles everything
  const handleToggleAllPlatforms = () => {
    if (isAllPlatformsSelected) {
      setSelectedPlatforms([]);
    } else {
      setSelectedPlatforms([...allAvailablePlatforms]);
    }
  };

  const handleTogglePlatform = (p: string) => {
    if (selectedPlatforms.includes(p)) {
      setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p));
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const created = addWorkItem({
      title: title.trim(),
      type,
      productArea: selectedAreas.length > 0 ? selectedAreas : ['All'],
      platform: selectedPlatforms.length > 0 ? selectedPlatforms : ['Web'],
      priority,
      status: 'Triage', // Sprint and estimate configured later by PM
      figmaUrl: figmaUrl.trim() || undefined,
      designRequired: !!figmaUrl.trim(),
      designTitle: figmaUrl.trim() ? `${title.trim()} Figma Design` : undefined,
      designStatus: figmaUrl.trim() ? 'Dev Ready' : undefined,
      operatorName: operatorName.trim() || undefined,
      requirementDetails: requirementDetails.trim(),
      dates: {
        plannedDevStart: plannedDevStart || undefined,
        plannedDevEnd: plannedDevEnd || undefined,
        plannedQaStart: plannedQaStart || undefined,
        plannedQaEnd: plannedQaEnd || undefined,
        plannedUatStart: plannedUatStart || undefined,
        plannedUatEnd: plannedUatEnd || undefined,
        plannedRelease: plannedRelease || undefined,
      },
    });

    setSelectedWorkId(created.id);
    setIsInspectorOpen(true);
    setTitle('');
    setRequirementDetails('');
    setFigmaUrl('');
    setOperatorName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="w-full max-w-2xl bg-[#0D111A] border border-white/[0.12] rounded-2xl shadow-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto font-sans">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-3">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Create New Work Item</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Add a feature, bug, or delivery task to the unified product worksheet.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onOpenBulkImport && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBulkImport();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-400 hover:text-white bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/60 rounded-lg transition-colors cursor-pointer"
              >
                <Upload size={12} />
                <span>Bulk Upload</span>
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Dynamic countdown banner with live seat quota counter..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              className="w-full bg-[#121622] border border-white/[0.12] rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          {/* Type and Priority (Sprint/Estimate removed as per requirement) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Work Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as WorkType)}
                className="w-full bg-[#121622] border border-white/[0.12] rounded-lg p-2 text-white font-medium cursor-pointer"
              >
                {config.workTypes
                  .filter((t) => t.name !== 'Bug')
                  .map((t) => (
                    <option key={t.name} value={t.name}>{t.name}</option>
                  ))}
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full bg-[#121622] border border-white/[0.12] rounded-lg p-2 text-white font-medium cursor-pointer"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Figma Design Link Field (Required Prompt Feature) */}
          <div>
            <label className="text-slate-300 font-semibold flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5">
                <Figma size={13} className="text-pink-400" />
                <span>Figma Design Link</span>
              </span>
              <span className="text-[11px] text-slate-500 font-normal">
                Direct link to UI/UX canvas component
              </span>
            </label>
            <div className="relative">
              <input
                type="url"
                placeholder="https://www.figma.com/design/... or https://figma.com/file/..."
                value={figmaUrl}
                onChange={(e) => setFigmaUrl(e.target.value)}
                className="w-full bg-[#121622] border border-white/[0.12] rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 text-xs"
              />
              {figmaUrl && (
                <a
                  href={figmaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-2.5 top-2.5 text-[11px] text-pink-400 hover:text-pink-300 underline font-semibold"
                >
                  Test Link ↗
                </a>
              )}
            </div>
          </div>

          {/* Bus / Ship Operator / Company (Prompt: "Some works are bus/ship operator related. Option to select/write company name") */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Bus size={14} className="text-amber-400" />
                <Ship size={14} className="text-amber-400" />
                <span>Bus / Ship Operator Company (Optional)</span>
              </label>
              <span className="text-[11px] text-slate-500">
                Select from fleet or type custom name
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={
                  (config.operators || []).some((o) => o.name === operatorName)
                    ? operatorName
                    : operatorName
                    ? '__custom__'
                    : ''
                }
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    setOperatorName('');
                  } else {
                    setOperatorName(e.target.value);
                  }
                }}
                className="w-full bg-[#121622] border border-white/[0.12] rounded-lg p-2 text-white font-medium cursor-pointer text-xs"
              >
                <option value="">— Select Operator (Optional) —</option>
                <optgroup label="Bus Operators">
                  {(config.operators || [])
                    .filter((o) => o.type === 'Bus')
                    .map((o) => (
                      <option key={o.id} value={o.name}>
                        {o.name}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Ship & Launch Operators">
                  {(config.operators || [])
                    .filter((o) => o.type === 'Ship' || o.type === 'Launch')
                    .map((o) => (
                      <option key={o.id} value={o.name}>
                        {o.name}
                      </option>
                    ))}
                </optgroup>
                <option value="__custom__">Other / Custom Operator (Type below)...</option>
              </select>

              <input
                type="text"
                placeholder="Or type operator name (e.g. Hanif, MV Bay Cruiser)..."
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full bg-[#121622] border border-white/[0.12] rounded-lg p-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>
          </div>

          {/* Product Areas (Select Multiple / All) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-semibold block">
                Product Areas (Select Multiple / All)
              </label>
              <span className="text-[11px] text-slate-400">
                {selectedAreas.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {/* 'All' Toggle Button: Selects or deselects all areas */}
              <button
                type="button"
                onClick={handleToggleAllAreas}
                className={`px-3 py-1 rounded-md text-[11px] font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                  isAllAreasSelected
                    ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                    : 'bg-[#121622] text-amber-300 border-amber-500/40 hover:bg-amber-950/40'
                }`}
              >
                {isAllAreasSelected && <Check size={12} className="stroke-[3]" />}
                <span>All Areas</span>
              </button>

              {allAvailableAreas.map((area) => {
                const isSelected = selectedAreas.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => handleToggleArea(area)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/90 text-amber-300 border-amber-500/80 font-bold'
                        : 'bg-black/40 text-slate-400 border-white/[0.08] hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {isSelected && <Check size={11} />}
                    <span>{area}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Platforms (Select Multiple) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-semibold block">
                Target Platforms (Select Multiple)
              </label>
              <span className="text-[11px] text-slate-400">
                {selectedPlatforms.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {/* 'All' Toggle Button: Selects or deselects all platforms */}
              <button
                type="button"
                onClick={handleToggleAllPlatforms}
                className={`px-3 py-1 rounded-md text-[11px] font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                  isAllPlatformsSelected
                    ? 'bg-blue-500 text-white border-blue-400 shadow-sm'
                    : 'bg-[#121622] text-blue-300 border-blue-500/40 hover:bg-blue-950/40'
                }`}
              >
                {isAllPlatformsSelected && <Check size={12} className="stroke-[3]" />}
                <span>All Platforms</span>
              </button>

              {allAvailablePlatforms.map((p) => {
                const isSelected = selectedPlatforms.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleTogglePlatform(p)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-950/90 text-blue-300 border-blue-500/80 font-bold'
                        : 'bg-black/40 text-slate-400 border-white/[0.08] hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {isSelected && <Check size={11} />}
                    <span>{p}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Requirement Overview (Rich Text Editor - Required Prompt Feature) */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Requirement Overview (Rich Text)
            </label>
            <RichTextEditor
              value={requirementDetails}
              onChange={setRequirementDetails}
              placeholder="State the requirement, problem context, user story, and specifications using formatting tools..."
              minHeight="110px"
            />
          </div>

          {/* Delivery Timelines (Optional - Configurable by PM) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowTimelineSection(!showTimelineSection)}
              className="text-blue-400 hover:text-blue-300 font-semibold text-xs flex items-center gap-1.5 cursor-pointer underline"
            >
              <span>{showTimelineSection ? '— Hide Delivery Timelines' : '+ Add Delivery Timelines (Dev, QA, UAT, Rel)'}</span>
            </button>

            {showTimelineSection && (
              <div className="mt-2.5 p-3.5 bg-black/40 border border-blue-500/30 rounded-xl space-y-3">
                <div className="text-[11px] font-bold text-blue-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Delivery Schedule (Optional)</span>
                  <span className="text-[10px] text-slate-500 font-normal">Can also be set later in Board / Gantt</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Dev End Date</label>
                    <input
                      type="date"
                      value={plannedDevEnd}
                      onChange={(e) => setPlannedDevEnd(e.target.value)}
                      className="w-full bg-[#121622] border border-white/[0.1] rounded p-1.5 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">QA Start &amp; End Date</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="date"
                        value={plannedQaStart}
                        onChange={(e) => setPlannedQaStart(e.target.value)}
                        placeholder="QA Start"
                        className="w-full bg-[#121622] border border-white/[0.1] rounded p-1.5 text-white font-mono text-xs"
                      />
                      <input
                        type="date"
                        value={plannedQaEnd}
                        onChange={(e) => setPlannedQaEnd(e.target.value)}
                        placeholder="QA End"
                        className="w-full bg-[#121622] border border-white/[0.1] rounded p-1.5 text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">UAT Start &amp; End Date</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="date"
                        value={plannedUatStart}
                        onChange={(e) => setPlannedUatStart(e.target.value)}
                        placeholder="UAT Start"
                        className="w-full bg-[#121622] border border-white/[0.1] rounded p-1.5 text-white font-mono text-xs"
                      />
                      <input
                        type="date"
                        value={plannedUatEnd}
                        onChange={(e) => setPlannedUatEnd(e.target.value)}
                        placeholder="UAT End"
                        className="w-full bg-[#121622] border border-white/[0.1] rounded p-1.5 text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Target Release Date</label>
                    <input
                      type="date"
                      value={plannedRelease}
                      onChange={(e) => setPlannedRelease(e.target.value)}
                      className="w-full bg-[#121622] border border-white/[0.1] rounded p-1.5 text-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-lg shadow-md shadow-blue-900/40 transition-colors cursor-pointer"
            >
              <Plus size={14} className="stroke-[2.5]" />
              <span>Add Work</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
