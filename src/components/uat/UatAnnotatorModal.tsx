import React, { useState, useRef } from 'react';
import {
  X,
  MapPin,
  Upload,
  AlertTriangle,
  Plus,
  Trash2,
  Check,
  MousePointer,
  Crosshair,
  Maximize2,
  Sparkles,
  Info,
} from 'lucide-react';
import { UatTestCase, UatAnnotation, WorkItem } from '../../types';
import { useApp } from '../../context/AppContext';

interface UatAnnotatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: WorkItem;
  uatCase: UatTestCase;
  onSave: (annotations: UatAnnotation[], screenshotUrl: string, requiresAttention: boolean, reason?: string) => void;
}

// Built-in high-fidelity UI templates that business testers can immediately annotate
const DEFAULT_PRESET_SCREENS = [
  {
    id: 'flash-deal-screen',
    name: 'Web Deals & Checkout Preview',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    description: 'Header discount banner, flash deal countdown and checkout summary.',
  },
  {
    id: 'live-tracking-screen',
    name: 'Live Vehicle ETA & Tracking Screen',
    url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80',
    description: 'Passenger route map, vehicle coordinate markers and ETA pill.',
  },
  {
    id: 'booking-matrix-screen',
    name: 'Seat Selection & Fare Matrix',
    url: 'https://images.unsplash.com/photo-1556742049-0a67e5572293?auto=format&fit=crop&w=1200&q=80',
    description: 'Seat layout, passenger category selector, and luggage add-ons.',
  },
];

export const UatAnnotatorModal: React.FC<UatAnnotatorModalProps> = ({
  isOpen,
  onClose,
  feature,
  uatCase,
  onSave,
}) => {
  const { currentUser } = useApp();

  const [screenshotUrl, setScreenshotUrl] = useState<string>(
    uatCase.screenshotUrl || DEFAULT_PRESET_SCREENS[0].url
  );
  const [annotations, setAnnotations] = useState<UatAnnotation[]>(
    uatCase.annotations ? [...uatCase.annotations] : []
  );
  const [requiresAttention, setRequiresAttention] = useState<boolean>(
    uatCase.requiresAttention ?? annotations.length > 0
  );
  const [attentionReason, setAttentionReason] = useState<string>(
    uatCase.attentionReason || (uatCase.requiresAttention ? 'Failing UI element verified during UAT' : '')
  );

  // Active pin selection or creation
  const [activePinId, setActivePinId] = useState<string | null>(null);
  const [pendingCoords, setPendingCoords] = useState<{ x: number; y: number } | null>(null);
  const [newComment, setNewComment] = useState('');
  const [newElementName, setNewElementName] = useState('');
  const [newColor, setNewColor] = useState<string>('#ef4444');

  const imageContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    // Clamp coordinates
    const clampedX = Math.max(2, Math.min(98, x));
    const clampedY = Math.max(2, Math.min(98, y));

    setPendingCoords({ x: clampedX, y: clampedY });
    setActivePinId(null);
    setNewComment('');
    setNewElementName('');
  };

  const handleAddAnnotation = () => {
    if (!pendingCoords || !newComment.trim()) return;

    const newPin: UatAnnotation = {
      id: `ann-${Date.now()}`,
      x: pendingCoords.x,
      y: pendingCoords.y,
      elementName: newElementName.trim() || `UI Element at ${pendingCoords.x}%, ${pendingCoords.y}%`,
      comment: newComment.trim(),
      author: currentUser.name,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      color: newColor,
    };

    setAnnotations((prev) => [...prev, newPin]);
    setPendingCoords(null);
    setNewComment('');
    setNewElementName('');
    setActivePinId(newPin.id);
    setRequiresAttention(true);
    if (!attentionReason) {
      setAttentionReason(`Visual defect pinned on ${newPin.elementName}`);
    }
  };

  const handleDeletePin = (id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    if (activePinId === id) setActivePinId(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setScreenshotUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAndClose = () => {
    onSave(annotations, screenshotUrl, requiresAttention, attentionReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-6xl max-h-[94vh] bg-[#0A0D14] border border-white/[0.12] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-[#0F131D] border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Crosshair size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">
                  UI Element Visual Annotator · {uatCase.id}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-950 text-teal-300 border border-teal-800">
                  {feature.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xl">
                Scenario: {uatCase.scenario}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Requires Attention Flag Toggle */}
            <label className="flex items-center gap-2 bg-[#141824] px-3 py-1.5 rounded-lg border border-amber-500/30 cursor-pointer">
              <input
                type="checkbox"
                checked={requiresAttention}
                onChange={(e) => setRequiresAttention(e.target.checked)}
                className="rounded accent-amber-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle size={13} className="text-amber-400" />
                Requires Attention
              </span>
            </label>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Attention Note Bar if Flagged */}
        {requiresAttention && (
          <div className="px-5 py-2.5 bg-amber-950/40 border-b border-amber-500/30 flex flex-wrap items-center gap-3 text-xs">
            <span className="font-bold text-amber-300 flex items-center gap-1 shrink-0">
              <AlertTriangle size={14} /> Attention Reason:
            </span>
            <input
              type="text"
              placeholder="Explain why this UI element or scenario requires immediate engineering attention..."
              value={attentionReason}
              onChange={(e) => setAttentionReason(e.target.value)}
              className="flex-1 min-w-[280px] bg-black/60 border border-amber-500/40 rounded px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        )}

        {/* Workspace Body: Left Canvas & Right Controls */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          {/* Main Visual Canvas Area */}
          <div className="flex-1 flex flex-col bg-[#06080C] min-h-0 p-4 overflow-hidden">
            {/* Canvas Toolbar */}
            <div className="flex items-center justify-between pb-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <MousePointer size={14} className="text-teal-400" />
                  Click on any failing UI element to drop an annotation pin
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-500">
                  {annotations.length} pin{annotations.length === 1 ? '' : 's'} placed
                </span>
              </div>

              {/* Screen Presets & File Upload */}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-200 cursor-pointer border border-white/[0.08] transition-colors">
                  <Upload size={13} />
                  <span>Upload Screenshot</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Preset switcher dropdown */}
                <select
                  value={screenshotUrl}
                  onChange={(e) => setScreenshotUrl(e.target.value)}
                  className="bg-[#121622] border border-white/[0.1] text-slate-300 rounded-lg px-2.5 py-1 text-xs cursor-pointer focus:outline-none"
                >
                  {DEFAULT_PRESET_SCREENS.map((s) => (
                    <option key={s.id} value={s.url} className="bg-slate-900">
                      Preset: {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Interactive Image Container */}
            <div className="flex-1 relative overflow-auto rounded-xl border border-white/[0.1] bg-black/60 flex items-center justify-center p-2">
              <div
                ref={imageContainerRef}
                onClick={handleCanvasClick}
                className="relative max-w-full max-h-[58vh] cursor-crosshair select-none shadow-2xl rounded-lg overflow-hidden"
              >
                <img
                  src={screenshotUrl}
                  alt="UAT Failing UI Element Preview"
                  className="w-full h-auto object-contain max-h-[58vh] rounded-lg block pointer-events-none"
                />

                {/* Existing Placed Pins */}
                {annotations.map((pin, idx) => {
                  const isSelected = activePinId === pin.id;
                  return (
                    <div
                      key={pin.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePinId(pin.id);
                        setPendingCoords(null);
                      }}
                      style={{
                        left: `${pin.x}%`,
                        top: `${pin.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      className="absolute z-20 group cursor-pointer"
                      title={`${pin.elementName || 'Pin #' + (idx + 1)}: ${pin.comment}`}
                    >
                      {/* Pulse effect */}
                      <span
                        className="absolute inset-0 rounded-full animate-ping opacity-75"
                        style={{ backgroundColor: pin.color || '#ef4444' }}
                      />

                      {/* Pin Marker Badge */}
                      <div
                        className={`relative flex items-center justify-center w-7 h-7 rounded-full font-bold text-white text-xs shadow-lg transition-transform ${
                          isSelected
                            ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-black'
                            : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: pin.color || '#ef4444' }}
                      >
                        <span>{idx + 1}</span>
                      </div>

                      {/* Floating Tooltip Pill */}
                      <div className="absolute left-1/2 -bottom-8 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-[11px] px-2 py-0.5 rounded whitespace-nowrap pointer-events-none shadow-xl border border-white/[0.1] z-30">
                        <strong>#{idx + 1}:</strong> {pin.elementName}
                      </div>
                    </div>
                  );
                })}

                {/* Pending Drop Marker (when user clicks anywhere) */}
                {pendingCoords && (
                  <div
                    style={{
                      left: `${pendingCoords.x}%`,
                      top: `${pendingCoords.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className="absolute z-20"
                  >
                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-amber-400 bg-amber-500/40 flex items-center justify-center text-white font-bold text-xs animate-bounce shadow-xl">
                      <Crosshair size={16} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Pins List & New Pin Form */}
          <div className="w-full lg:w-80 bg-[#0E121B] border-t lg:border-t-0 lg:border-l border-white/[0.08] p-4 flex flex-col justify-between shrink-0 overflow-y-auto">
            <div className="space-y-4">
              {/* Form to complete the pending pin */}
              {pendingCoords ? (
                <div className="p-3.5 bg-amber-950/30 border border-amber-500/50 rounded-xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} /> New Pin at ({pendingCoords.x}%, {pendingCoords.y}%)
                    </span>
                    <button
                      onClick={() => setPendingCoords(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Failing UI Element
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Discount Tag, Checkout Button, Route Marker"
                      value={newElementName}
                      onChange={(e) => setNewElementName(e.target.value)}
                      className="w-full bg-black/60 border border-white/[0.1] rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Defect Observed
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Describe what's wrong with this UI element..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full bg-black/60 border border-white/[0.1] rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Color category */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Marker:</span>
                    <div className="flex items-center gap-2">
                      {[
                        { color: '#ef4444', label: 'Critical / Bug' },
                        { color: '#f59e0b', label: 'UI Glitch' },
                        { color: '#3b82f6', label: 'Design Note' },
                      ].map((c) => (
                        <button
                          key={c.color}
                          type="button"
                          onClick={() => setNewColor(c.color)}
                          className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                            newColor === c.color ? 'scale-125 border-white ring-1 ring-black' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: c.color }}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleAddAnnotation}
                    disabled={!newComment.trim()}
                    className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Drop Pin on UI Element</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-xs text-slate-400 space-y-1">
                  <div className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Info size={14} className="text-teal-400" />
                    How to Annotate:
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    Click anywhere on the preview to pin an issue directly to the failing button, label or input. Pins are saved directly into the test case and inherited if logged as a Bug.
                  </p>
                </div>
              )}

              {/* List of Existing Pins */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Annotated Elements ({annotations.length})</span>
                </div>

                {annotations.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-xs border border-dashed border-white/[0.08] rounded-lg">
                    No visual pins placed yet. Click on the image to annotate the failing element.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
                    {annotations.map((pin, i) => {
                      const isSelected = activePinId === pin.id;
                      return (
                        <div
                          key={pin.id}
                          onClick={() => setActivePinId(pin.id)}
                          className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all space-y-1 ${
                            isSelected
                              ? 'bg-white/[0.08] border-amber-400/80 shadow-md'
                              : 'bg-black/40 border-white/[0.06] hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                style={{ backgroundColor: pin.color || '#ef4444' }}
                              >
                                {i + 1}
                              </span>
                              <span className="font-bold text-white truncate max-w-[150px]">
                                {pin.elementName || `Element #${i + 1}`}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePin(pin.id);
                              }}
                              className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                              title="Delete Pin"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-300 pl-7 leading-snug">
                            {pin.comment}
                          </p>
                          <div className="text-[10px] text-slate-500 pl-7 font-mono flex items-center justify-between">
                            <span>By {pin.author}</span>
                            <span>{pin.x}%, {pin.y}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2 bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAndClose}
                className="flex-1 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-900/30 transition-colors cursor-pointer"
              >
                <Check size={14} />
                <span>Save Annotations</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
