import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Headphones,
  Wrench,
  Plus,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  ExternalLink,
  Filter,
  XCircle,
} from 'lucide-react';
import { PriorityIcon } from '../common/Icons';
import { OperationalTicket } from '../../types';

export const IntakeView: React.FC<{
  onOpenRaiseTicket: () => void;
}> = ({ onOpenRaiseTicket }) => {
  const {
    tickets,
    triageTicket,
    currentRole,
    currentUser,
    setSelectedWorkId,
    setIsInspectorOpen,
    setActiveTab,
    sprints,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [triagingTicket, setTriagingTicket] = useState<OperationalTicket | null>(null);
  const [targetSprintId, setTargetSprintId] = useState<string>('SP-24');

  const isCallCenterOrOps = currentRole === 'Call Center' || currentRole === 'Operations';
  const canTriage =
    currentRole === 'Product Owner' ||
    currentRole === 'Project Manager' ||
    currentRole === 'Super Admin' ||
    currentRole === 'Workspace Admin' ||
    currentRole === 'Engineering Lead';

  // For Call Center / Ops users, show their submitted tickets
  const displayedTickets = tickets.filter((t) => {
    if (isCallCenterOrOps && currentRole === 'Call Center') {
      return t.source === 'Call Center';
    }
    if (filterStatus === 'waiting') return t.status === 'Waiting for Triage';
    if (filterStatus === 'delivery') return t.status === 'In Delivery';
    if (filterStatus === 'resolved') return t.status === 'Resolved';
    return true;
  });

  const handleConfirmTriageToWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!triagingTicket) return;

    triageTicket(triagingTicket.id, 'convertToWork', {
      sprintId: targetSprintId || undefined,
    });
    setTriagingTicket(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090d] overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-[#0c1017] border-b border-slate-800 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Headphones size={18} className="text-amber-400" />
            <h1 className="text-base font-bold text-white tracking-tight">
              {isCallCenterOrOps ? 'Operational Ticket Portal' : 'Intake & Triage Center'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isCallCenterOrOps
              ? 'Raise customer issues and counter inquiries. Smart routing assigns tickets directly to delivery teams.'
              : 'Evaluate inbound tickets from Operations and Call Center. Route to Worksheet and Sprints.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Raise ticket button */}
          <button
            onClick={onOpenRaiseTicket}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus size={14} />
            <span>Raise Ticket</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      {!isCallCenterOrOps && (
        <div className="px-4 py-2 bg-[#0a0d14] border-b border-slate-800 flex items-center gap-1 text-xs">
          {[
            { id: 'all', label: 'All Tickets' },
            { id: 'waiting', label: 'Waiting for Triage' },
            { id: 'delivery', label: 'In Delivery (Converted)' },
            { id: 'resolved', label: 'Resolved' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterStatus === tab.id
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-800/80 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Ticket List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {displayedTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="p-4 bg-[#0d111a] border border-slate-800 rounded-lg space-y-3 hover:border-slate-700 transition-colors shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono font-bold text-amber-400">{ticket.id}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400">{ticket.source}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-300 font-medium">{ticket.productArea.join(', ')}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400">{ticket.platform.join(', ')}</span>
                </div>
                <h3 className="text-sm font-semibold text-white">{ticket.title}</h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 text-xs text-slate-300">
                  <PriorityIcon priority={ticket.priority} size={13} />
                  <span>{ticket.priority}</span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                    ticket.status === 'Waiting for Triage'
                      ? 'bg-amber-950/70 text-amber-400 border border-amber-800/80'
                      : ticket.status === 'In Delivery'
                      ? 'bg-blue-950/70 text-blue-400 border border-blue-800/80'
                      : 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/80'
                  }`}
                >
                  {ticket.status}
                </span>
              </div>
            </div>

            {/* Ticket Details */}
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded border border-slate-800">
              {ticket.details}
            </p>

            {/* Routing & Resolution Info */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
              <div className="flex items-center gap-3">
                <span>Reporter: <strong className="text-slate-300">{ticket.reporter}</strong></span>
                {ticket.routedTeam && (
                  <span>Routed Team: <strong className="text-slate-300">{ticket.routedTeam}</strong></span>
                )}
                {ticket.assignedOwner && (
                  <span>Owner: <strong className="text-slate-300">{ticket.assignedOwner}</strong></span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                {ticket.connectedWorkId ? (
                  <button
                    onClick={() => {
                      setSelectedWorkId(ticket.connectedWorkId!);
                      setIsInspectorOpen(true);
                      setActiveTab('worksheet');
                    }}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-mono font-medium text-xs bg-blue-950/40 px-2 py-1 rounded border border-blue-800/60"
                  >
                    <span>Connected Work: {ticket.connectedWorkId}</span>
                    <ExternalLink size={12} />
                  </button>
                ) : canTriage ? (
                  <button
                    onClick={() => setTriagingTicket(ticket)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <span>Triage &amp; Convert to Work</span>
                    <ArrowRight size={12} />
                  </button>
                ) : (
                  <span className="text-slate-500 italic text-[11px]">
                    Updates will appear here as engineering resolves this issue.
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {displayedTickets.length === 0 && (
          <div className="py-16 text-center text-slate-400 text-xs space-y-2">
            <Headphones size={24} className="mx-auto text-slate-600" />
            <p className="font-semibold text-slate-300">No tickets found</p>
            <p className="text-slate-500">
              Operations and Call Center issues submitted will be routed here.
            </p>
          </div>
        )}
      </div>

      {/* Triage Conversion Modal */}
      {triagingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="w-full max-w-md bg-[#0c1017] border border-blue-800/80 rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">Triage &amp; Convert to Worksheet</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Converts {triagingTicket.id} into an actionable Work Item on the Worksheet.
                </p>
              </div>
              <button
                onClick={() => setTriagingTicket(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmTriageToWork} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                <span className="text-slate-400 block font-semibold">Title:</span>
                <span className="text-slate-200">{triagingTicket.title}</span>
                <div className="text-[11px] text-slate-400 pt-1">
                  Area: <strong>{triagingTicket.productArea.join(', ')}</strong> · Platform: <strong>{triagingTicket.platform.join(', ')}</strong>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Target Sprint</label>
                <select
                  value={targetSprintId}
                  onChange={(e) => setTargetSprintId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white text-xs"
                >
                  <option value="">Product Backlog (No sprint)</option>
                  {sprints.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setTriagingTicket(null)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold text-xs shadow-sm flex items-center gap-1.5"
                >
                  <span>Confirm Conversion</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
