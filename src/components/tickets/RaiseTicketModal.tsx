import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Ticket,
  CheckCircle2,
  Bus,
  Ship,
  User,
  Search,
  UploadCloud,
  FileText,
  FileCode,
  Image,
  Video,
  Trash2,
  Monitor,
  Cpu,
  AlertTriangle,
  Info,
  Sparkles,
} from 'lucide-react';
import { PriorityLevel } from '../../types';

interface RaiseTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RaiseTicketModal: React.FC<RaiseTicketModalProps> = ({ isOpen, onClose }) => {
  const { raiseTicket, currentRole, currentUser, config } = useApp();

  // Primary Classification
  const [category, setCategory] = useState<'System Bug' | 'UI Glitch' | 'Information Issue' | 'Operational Incident' | 'Change Request'>('System Bug');
  // Domain Scope
  const [serviceArea, setServiceArea] = useState<string>('System');
  // Optional Operator / Transport provider
  const [hasSpecificOperator, setHasSpecificOperator] = useState(false);
  const [operatorSearch, setOperatorSearch] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('');
  const [isCustomOperator, setIsCustomOperator] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Form Fields
  const [summary, setSummary] = useState('');
  const [details, setDetails] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('High');

  // Real Uploaded File / Evidence State
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    type: string;
    dataUrl: string;
    isImage: boolean;
    isVideo: boolean;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

  // Filtered transport operators from config (only if user needs to specify one)
  const filteredOperators = useMemo(() => {
    const list = config.operators || [];
    if (!operatorSearch.trim()) return list;
    const q = operatorSearch.toLowerCase();
    return list.filter(
      (op) =>
        op.name.toLowerCase().includes(q) ||
        op.type.toLowerCase().includes(q) ||
        (op.contact && op.contact.toLowerCase().includes(q))
    );
  }, [config.operators, operatorSearch]);

  // Handle Clipboard Paste (e.g. user takes screenshot with Win+Shift+S or Cmd+Shift+4 and pastes Ctrl+V)
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            processFile(file);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  const processFile = (file: File) => {
    const isImg = file.type.startsWith('image/');
    const isVid = file.type.startsWith('video/');
    const sizeStr =
      file.size < 1024 * 1024
        ? `${Math.round(file.size / 1024)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedFile({
        name: file.name || `Pasted_Screenshot_${Date.now()}.png`,
        size: sizeStr,
        type: file.type,
        dataUrl: e.target?.result as string,
        isImage: isImg,
        isVideo: isVid,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;

    const source = currentRole === 'Call Center' ? 'Call Center' : 'Operations';

    const fullTitle = bookingRef.trim()
      ? `[${bookingRef.trim()}] ${summary.trim()}`
      : summary.trim();

    const operatorPart = hasSpecificOperator
      ? isCustomOperator
        ? operatorSearch.trim() || undefined
        : selectedOperator || undefined
      : undefined;

    const fullDetails = `
Issue Classification: ${category}
Domain: ${serviceArea}
${operatorPart ? `Affected Operator / Partner: ${operatorPart}\n` : ''}${
      bookingRef.trim() ? `Reference / PNR: ${bookingRef.trim()}\n` : ''
    }Reporting Agent: ${currentUser.name} (${currentRole})

Description:
${details.trim() || 'No additional notes provided.'}

Evidence Uploaded: ${uploadedFile ? `${uploadedFile.name} (${uploadedFile.size})` : 'None'}
    `.trim();

    // Map Category to Ticket Type
    const ticketType: 'Bug' | 'CR' | 'Inquiry' | 'Operational' =
      category === 'Change Request'
        ? 'CR'
        : category === 'Operational Incident'
        ? 'Operational'
        : 'Bug';

    const created = raiseTicket({
      title: fullTitle,
      source,
      productArea: [serviceArea === 'System' || serviceArea === 'UI' ? 'All' : serviceArea],
      platform: [currentRole === 'Call Center' ? 'Call Center' : 'Counter', 'Admin/CMS'],
      type: ticketType,
      priority,
      details: fullDetails,
      attachmentUrl: uploadedFile ? uploadedFile.dataUrl : undefined,
      reporter: `${currentUser.name} (${currentRole})`,
      operatorName: operatorPart,
    });

    setSubmittedTicketId(created.id);
  };

  const handleResetAndClose = () => {
    setSummary('');
    setDetails('');
    setBookingRef('');
    setUploadedFile(null);
    setCategory('System Bug');
    setServiceArea('System');
    setHasSpecificOperator(false);
    setSelectedOperator('');
    setOperatorSearch('');
    setIsCustomOperator(false);
    setSubmittedTicketId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-100 font-sans">
      <div className="w-full max-w-xl bg-[#0B0E17] border border-amber-600/40 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Ticket size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Raise Issue / Support Ticket
              </h2>
              <p className="text-xs text-slate-400">
                Log system bugs, UI glitches, data issues, or operational incidents for engineering triage.
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {submittedTicketId ? (
          <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 bg-emerald-950/60 border border-emerald-500/50 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-950/50">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Ticket Dispatched to Intake &amp; Worksheet</h3>
              <p className="font-mono text-sm text-amber-400 font-bold mt-1">
                {submittedTicketId}
              </p>
              <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                Routed to <strong>Intake &amp; Worksheet</strong> for Project Manager and Engineering triage.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={handleResetAndClose}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                Return to Workspace
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* 1. Issue Classification */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                1. What kind of issue is this? <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'System Bug', label: 'System Bug', desc: 'Backend, server, API or crash', icon: Cpu, color: 'text-rose-400 border-rose-500/30' },
                  { id: 'UI Glitch', label: 'UI / UX Glitch', desc: 'Visual bug, broken layout, buttons', icon: Monitor, color: 'text-sky-400 border-sky-500/30' },
                  { id: 'Information Issue', label: 'Information / Data', desc: 'Wrong schedules, fare typos', icon: Info, color: 'text-amber-400 border-amber-500/30' },
                  { id: 'Operational Incident', label: 'Operational Incident', desc: 'Transport, counter, partner', icon: Bus, color: 'text-emerald-400 border-emerald-500/30' },
                  { id: 'Change Request', label: 'Change Request', desc: 'New requirement / workflow change', icon: Sparkles, color: 'text-purple-400 border-purple-500/30' },
                ].map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategory(cat.id as any);
                        if (cat.id === 'Operational Incident') {
                          setServiceArea('Bus');
                          setHasSpecificOperator(true);
                        } else if (cat.id === 'UI Glitch') {
                          setServiceArea('UI');
                          setHasSpecificOperator(false);
                        } else if (cat.id === 'System Bug') {
                          setServiceArea('System');
                          setHasSpecificOperator(false);
                        } else if (cat.id === 'Information Issue') {
                          setServiceArea('Information');
                        }
                      }}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? `bg-white/[0.08] ${cat.color} shadow-sm`
                          : 'bg-[#121622]/60 border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                        <Icon size={14} className={isSelected ? 'text-amber-400' : 'text-slate-400'} />
                        <span>{cat.label}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{cat.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Issue Area / Scope & Urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  2. Area / Domain <span className="text-rose-400">*</span>
                </label>
                <select
                  value={serviceArea}
                  onChange={(e) => {
                    const val = e.target.value;
                    setServiceArea(val);
                    if (val === 'Bus' || val === 'Ship') {
                      setHasSpecificOperator(true);
                    }
                  }}
                  className="w-full bg-[#121622] border border-white/[0.12] rounded-lg p-2 text-white font-medium cursor-pointer"
                >
                  <option value="System">Core System &amp; Backend</option>
                  <option value="UI">Web App UI / Frontend</option>
                  <option value="Information">Data &amp; Schedule Information</option>
                  <option value="Bus">Bus Transport Services</option>
                  <option value="Ship">Ship &amp; Launch Services</option>
                  <option value="Air">Air Flight Operations</option>
                  <option value="Hotel">Hotel Booking System</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  3. Urgency / Priority <span className="text-rose-400">*</span>
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  className="w-full bg-[#121622] border border-white/[0.12] rounded-lg p-2 text-white font-bold cursor-pointer"
                >
                  <option value="Critical">Critical (Blocker / Stranded)</option>
                  <option value="High">High (Immediate fixing needed)</option>
                  <option value="Medium">Medium (Standard priority)</option>
                  <option value="Low">Low (Minor / Cosmetic)</option>
                </select>
              </div>
            </div>

            {/* Optional Specific Transport Operator Toggle & Selector */}
            {(serviceArea === 'Bus' || serviceArea === 'Ship' || hasSpecificOperator) ? (
              <div className="p-3 bg-black/40 rounded-xl border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold text-xs">
                    Specific Operator / Transport Partner
                  </label>
                  <button
                    type="button"
                    onClick={() => setHasSpecificOperator(!hasSpecificOperator)}
                    className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                  >
                    {hasSpecificOperator ? 'Clear / Make General' : '+ Add Partner Name'}
                  </button>
                </div>

                {hasSpecificOperator && (
                  <div>
                    {!isCustomOperator ? (
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search operator (Hanif, Green Line, Modhumoti...)"
                          value={isDropdownOpen ? operatorSearch : selectedOperator}
                          onFocus={() => {
                            setIsDropdownOpen(true);
                            setOperatorSearch('');
                          }}
                          onChange={(e) => {
                            setOperatorSearch(e.target.value);
                            setIsDropdownOpen(true);
                          }}
                          className="w-full bg-[#121622] border border-white/[0.12] rounded-lg pl-8 pr-3 py-2 text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
                        />
                        <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />

                        {isDropdownOpen && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-[#101522] border border-white/[0.15] rounded-xl shadow-2xl z-30 max-h-48 overflow-y-auto divide-y divide-white/[0.04]">
                            {filteredOperators.map((op) => (
                              <div
                                key={op.id}
                                onClick={() => {
                                  setSelectedOperator(op.name);
                                  setIsDropdownOpen(false);
                                }}
                                className={`px-3 py-2 flex items-center justify-between text-xs cursor-pointer hover:bg-white/[0.06] ${
                                  selectedOperator === op.name ? 'bg-amber-950/40 text-amber-300' : 'text-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {op.type === 'Ship' || op.type === 'Launch' ? (
                                    <Ship size={13} className="text-cyan-400 shrink-0" />
                                  ) : (
                                    <Bus size={13} className="text-amber-400 shrink-0" />
                                  )}
                                  <span className="font-semibold">{op.name}</span>
                                </div>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400 font-mono">
                                  {op.type}
                                </span>
                              </div>
                            ))}

                            <div
                              onClick={() => {
                                setIsCustomOperator(true);
                                setIsDropdownOpen(false);
                              }}
                              className="p-2 text-center text-xs font-bold text-amber-400 hover:text-amber-300 hover:bg-amber-950/30 cursor-pointer border-t border-white/[0.08]"
                            >
                              + Enter Other Operator Name
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="Type operator or counter name..."
                          value={operatorSearch}
                          onChange={(e) => setOperatorSearch(e.target.value)}
                          className="w-full bg-[#121622] border border-amber-500/50 rounded-lg p-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomOperator(false);
                            setOperatorSearch('');
                          }}
                          className="px-2.5 py-2 text-xs text-slate-400 hover:text-white bg-[#161c2b] border border-white/[0.1] rounded-lg shrink-0 cursor-pointer"
                        >
                          Reset
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null}

            {/* 4. Issue Headline / Summary */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                4. Issue Headline / Summary <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Booking modal unresponsive on Mobile, or Incorrect seat fare on Dhaka-Ctg..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                required
                className="w-full bg-[#121622] border border-white/[0.12] rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs font-medium"
              />
            </div>

            {/* 5. Reference / PNR (Optional) */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                5. Reference ID / PNR / URL (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. BK-98231 or /checkout route..."
                value={bookingRef}
                onChange={(e) => setBookingRef(e.target.value)}
                className="w-full bg-[#121622] border border-white/[0.12] rounded-lg p-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* 6. Detailed Description */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                6. Description &amp; Reproduction Steps
              </label>
              <textarea
                rows={3}
                placeholder="What happened? What were you doing? Expected vs actual behavior..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full bg-[#121622] border border-white/[0.12] rounded-lg p-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed text-xs"
              />
            </div>

            {/* 7. Real Evidence Upload (File / Screenshot / Paste) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold block">
                  7. Attach Evidence (Upload or Paste Screenshot)
                </label>
                <span className="text-[10px] text-amber-400/80 font-mono">
                  Tip: Press Ctrl+V to paste screenshot
                </span>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,.pdf,.log,.txt"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {uploadedFile ? (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/40 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      {uploadedFile.isImage ? (
                        <Image size={18} className="text-emerald-400 shrink-0" />
                      ) : uploadedFile.isVideo ? (
                        <Video size={18} className="text-emerald-400 shrink-0" />
                      ) : (
                        <FileText size={18} className="text-emerald-400 shrink-0" />
                      )}
                      <div className="min-w-0 truncate">
                        <span className="text-white font-semibold text-xs truncate block">
                          {uploadedFile.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {uploadedFile.size} · Uploaded Evidence
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[11px] text-blue-400 hover:text-blue-300 underline cursor-pointer"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadedFile(null)}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Visual Image Preview */}
                  {uploadedFile.isImage && (
                    <div className="relative mt-2 rounded-lg overflow-hidden border border-white/[0.1] bg-black/60 max-h-36 flex items-center justify-center">
                      <img
                        src={uploadedFile.dataUrl}
                        alt="Uploaded evidence"
                        className="max-h-36 object-contain rounded"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    isDragging
                      ? 'border-amber-400 bg-amber-500/10'
                      : 'border-white/[0.12] hover:border-amber-500/50 hover:bg-white/[0.02]'
                  }`}
                >
                  <UploadCloud size={26} className="text-amber-400" />
                  <div className="text-xs text-white font-semibold text-center">
                    Click to browse or drag and drop file here
                  </div>
                  <div className="text-[10px] text-slate-400 text-center">
                    Directly paste screenshots (Ctrl+V) · Supports PNG, JPG, MP4, PDF, LOG
                  </div>
                </div>
              )}
            </div>

            {/* Reporter indicator */}
            <div className="p-2.5 bg-black/40 rounded-xl border border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <User size={13} className="text-slate-300" />
                <span>
                  Reporting as: <strong className="text-slate-200">{currentUser.name}</strong> ({currentRole})
                </span>
              </div>
              <span className="font-mono text-emerald-400">Fast-Track Engineering Triage</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!summary.trim()}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 disabled:opacity-40 text-white font-bold rounded-lg shadow-md shadow-amber-900/40 transition-colors cursor-pointer"
              >
                Submit Ticket
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
