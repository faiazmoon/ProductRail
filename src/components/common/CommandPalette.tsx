import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Plus,
  Headphones,
  Table2,
  Zap,
  CheckSquare,
  Rocket,
  GitFork,
  Settings,
  User,
  LayoutGrid,
  X,
} from 'lucide-react';
import { WorkTypeIcon } from './Icons';
import { UserRole } from '../../types';

export const CommandPalette: React.FC<{
  onOpenQuickAdd: () => void;
  onOpenRaiseTicket: () => void;
  onOpenExportModal?: () => void;
}> = ({ onOpenQuickAdd, onOpenRaiseTicket, onOpenExportModal }) => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setActiveTab,
    workItems,
    tickets,
    setSelectedWorkId,
    setIsInspectorOpen,
    setCurrentRole,
  } = useApp();

  const [query, setQuery] = useState('');

  // Handle Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredWork = workItems
    .filter(
      (w) =>
        w.id.toLowerCase().includes(query.toLowerCase()) ||
        w.title.toLowerCase().includes(query.toLowerCase()) ||
        w.productArea.some((a) => a.toLowerCase().includes(query.toLowerCase()))
    )
    .slice(0, 5);

  const filteredTickets = tickets
    .filter(
      (t) =>
        t.id.toLowerCase().includes(query.toLowerCase()) ||
        t.title.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 3);

  const navigationCommands = [
    { label: 'Go to Dashboard', tab: 'dashboard', icon: LayoutGrid },
    { label: 'Go to Worksheet (Source of Truth)', tab: 'worksheet', icon: Table2 },
    { label: 'Go to QA Verification Workspace', tab: 'qa', icon: Zap },
    { label: 'Go to Business UAT', tab: 'uat', icon: CheckSquare },
    { label: 'Go to Releases & Delivery', tab: 'releases', icon: Rocket },
    { label: 'Go to Intake & Tickets', tab: 'tickets', icon: Headphones },
    { label: 'Go to Relationship Diagram / Tree', tab: 'diagram', icon: GitFork },
    { label: 'Go to Admin Settings', tab: 'admin', icon: Settings },
  ].filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="w-full max-w-xl bg-[#0c1017] border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input */}
        <div className="p-3.5 border-b border-slate-800 flex items-center gap-3">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            autoFocus
            placeholder="Search work, tickets, or type a command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <kbd className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3 text-xs">
          {/* Quick Actions */}
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Quick Actions
            </div>
            <button
              onClick={() => {
                setIsCommandPaletteOpen(false);
                onOpenQuickAdd();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200 transition-colors text-left"
            >
              <Plus size={15} className="text-blue-400" />
              <span>+ Add New Work Item</span>
            </button>
            <button
              onClick={() => {
                setIsCommandPaletteOpen(false);
                onOpenRaiseTicket();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200 transition-colors text-left"
            >
              <Headphones size={15} className="text-amber-400" />
              <span>Raise Operational Issue / Ticket</span>
            </button>
          </div>

          {/* Work Items */}
          {filteredWork.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Work Items
              </div>
              {filteredWork.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setIsCommandPaletteOpen(false);
                    setSelectedWorkId(item.id);
                    setIsInspectorOpen(true);
                    setActiveTab('worksheet');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200 transition-colors text-left group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <WorkTypeIcon type={item.type} size={14} />
                    <span className="font-mono font-bold text-slate-400 group-hover:text-blue-400">
                      {item.id}
                    </span>
                    <span className="truncate text-slate-200">{item.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">
                    {item.productArea.join(', ')}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Operational Tickets */}
          {filteredTickets.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Operational Tickets
              </div>
              {filteredTickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setIsCommandPaletteOpen(false);
                    setActiveTab('tickets');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Headphones size={14} className="text-amber-400" />
                    <span className="font-mono font-bold text-amber-400">{t.id}</span>
                    <span className="truncate text-slate-200">{t.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 ml-2">{t.status}</span>
                </button>
              ))}
            </div>
          )}

          {/* Navigation */}
          {navigationCommands.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Navigation
              </div>
              {navigationCommands.map((nav) => {
                const Icon = nav.icon;
                return (
                  <button
                    key={nav.tab}
                    onClick={() => {
                      setIsCommandPaletteOpen(false);
                      setActiveTab(nav.tab);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-300 transition-colors text-left"
                  >
                    <Icon size={14} className="text-slate-400" />
                    <span>{nav.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
