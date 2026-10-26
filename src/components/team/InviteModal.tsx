import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Link,
  Copy,
  Check,
  UserPlus,
  Shield,
  FolderKanban,
  Clock,
  Send,
  AlertCircle,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { UserRole } from '../../types';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  defaultProjectId,
}) => {
  const {
    projects,
    invites,
    createProjectInvite,
    acceptProjectInvite,
    currentRole,
    currentUser,
  } = useApp();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    defaultProjectId || projects[0]?.id || ''
  );
  const [selectedRole, setSelectedRole] = useState<UserRole>('Developer');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [generatedInvite, setGeneratedInvite] = useState<any>(null);

  // Simulation test state
  const [simName, setSimName] = useState('');
  const [simEmail, setSimEmail] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSuccess, setSimSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    const inv = createProjectInvite(selectedProjectId, selectedRole);
    setGeneratedInvite(inv);
  };

  const copyToClipboard = (text: string, code: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleSimulateJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simName.trim() || !simEmail.trim()) return;
    const targetCode = generatedInvite?.code || invites[0]?.code;
    if (!targetCode) return;

    const ok = acceptProjectInvite(targetCode, simName.trim(), simEmail.trim());
    if (ok) {
      setSimSuccess(`Successfully joined as ${simName}!`);
      setSimName('');
      setSimEmail('');
      setTimeout(() => {
        setSimSuccess(null);
        setIsSimulating(false);
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div className="relative w-full max-w-lg bg-[#0E121A] border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* iOS Sheet Header */}
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#121622]/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#007AFF]/15 text-[#007AFF] flex items-center justify-center">
              <Link size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Invite to Team via Link
              </h2>
              <p className="text-[11px] text-slate-400">
                Generate secure shareable links to add members to projects
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Create Invite Form */}
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Target Project */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  Assign to Project:
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-[#121622] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.key})
                    </option>
                  ))}
                </select>
              </div>

              {/* Invited Role */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  Assigned Role:
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full bg-[#121622] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="Developer">Developer</option>
                  <option value="QA">QA Specialist</option>
                  <option value="Business">Business / Commercial</option>
                  <option value="UAT">UAT Tester</option>
                  <option value="Designer">Product Designer</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Call Center">Call Center</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#007AFF] hover:bg-[#0066D6] text-white font-semibold rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <UserPlus size={15} />
              <span>Generate Shareable Link</span>
            </button>
          </form>

          {/* Newly Generated Invite Highlight */}
          {generatedInvite && (
            <div className="p-3.5 bg-[#007AFF]/10 border border-[#007AFF]/30 rounded-2xl space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-[#007AFF]">
                  New Link for {generatedInvite.projectName}
                </span>
                <span className="text-slate-400 font-mono text-[10px]">
                  Role: {generatedInvite.role}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedInvite.link}
                  className="flex-1 bg-[#090C13] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 font-mono select-all"
                />
                <button
                  onClick={() =>
                    copyToClipboard(generatedInvite.link, generatedInvite.code)
                  }
                  className="px-3 py-1.5 bg-[#007AFF] hover:bg-[#0066D6] text-white rounded-lg font-bold flex items-center gap-1.5 shrink-0"
                >
                  {copiedCode === generatedInvite.code ? (
                    <>
                      <Check size={13} />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Active Links History */}
          <div className="space-y-2 pt-2 border-t border-white/[0.08]">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Project Links ({invites.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {invites.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-semibold text-white">
                      <span>{inv.projectName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#007AFF]/15 text-[#007AFF] border border-[#007AFF]/30">
                        {inv.role}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      Code: <span className="font-mono text-slate-300">{inv.code}</span> · By {inv.inviterName}
                    </div>
                  </div>

                  <button
                    onClick={() => copyToClipboard(inv.link, inv.code)}
                    className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-colors shrink-0"
                    title="Copy invite link"
                  >
                    {copiedCode === inv.code ? (
                      <Check size={14} className="text-emerald-400" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Simulate Join Flow */}
          <div className="pt-2 border-t border-white/[0.08]">
            {!isSimulating ? (
              <button
                onClick={() => setIsSimulating(true)}
                className="w-full py-2 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white rounded-xl text-center text-[11px] font-medium transition-colors"
              >
                Test accepting link as a new member
              </button>
            ) : (
              <form
                onSubmit={handleSimulateJoin}
                className="p-3 bg-[#121622] rounded-xl border border-white/[0.08] space-y-2.5 animate-in fade-in"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px]">
                    Simulate Join via Link
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSimulating(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={simName}
                    onChange={(e) => setSimName(e.target.value)}
                    className="bg-[#090C13] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-white text-xs outline-none"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={simEmail}
                    onChange={(e) => setSimEmail(e.target.value)}
                    className="bg-[#090C13] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-white text-xs outline-none"
                    required
                  />
                </div>
                {simSuccess && (
                  <div className="text-emerald-400 text-[11px] font-bold">
                    {simSuccess}
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors"
                >
                  Join Project Now
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
