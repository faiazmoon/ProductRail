import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Sparkles,
  Ticket,
  Shield,
  LogOut,
  Settings,
  ChevronDown,
  Pencil,
  Key,
  Menu,
  Sun,
  Moon,
  FolderKanban,
  UserCheck,
  Check,
  Globe,
  Briefcase,
  Code2,
  Bug,
  Headphones,
  CheckCircle2,
  FolderPlus,
} from 'lucide-react';
import { UserRole } from '../../types';
import { EditUserModal } from '../admin/EditUserModal';

interface AppHeaderProps {
  onOpenQuickAdd: () => void;
  onOpenRaiseTicket: () => void;
  onOpenBulkImport?: () => void;
  onOpenMobileMenu?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenQuickAdd: _onOpenQuickAdd,
  onOpenRaiseTicket,
  onOpenMobileMenu,
}) => {
  const {
    currentRole,
    setCurrentRole,
    currentUser,
    setCurrentUser,
    users,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    theme,
    toggleTheme,
    setIsCommandPaletteOpen,
    setActiveTab,
    logout,
  } = useApp();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isEditSelfOpen, setIsEditSelfOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const projectDropdownRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(e.target as Node)) {
        setIsProjectDropdownOpen(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentProject = projects.find((p) => p.id === selectedProjectId);

  const roleDefinitions: { role: UserRole; title: string; desc: string; icon: any; color: string }[] = [
    { role: 'Super Admin', title: 'Super Admin', desc: 'Full workspace & system control', icon: Shield, color: 'text-amber-400 bg-amber-500/15' },
    { role: 'Project Manager', title: 'Project Manager', desc: 'Sprints, milestones & squad delivery', icon: Briefcase, color: 'text-blue-400 bg-blue-500/15' },
    { role: 'Product Owner', title: 'Product Owner', desc: 'Requirements, scope & backlog', icon: Sparkles, color: 'text-purple-400 bg-purple-500/15' },
    { role: 'Developer', title: 'Developer', desc: 'Assigned execution & code PRs', icon: Code2, color: 'text-indigo-400 bg-indigo-500/15' },
    { role: 'QA', title: 'QA Specialist', desc: 'Verification, test suites & defects', icon: Bug, color: 'text-cyan-400 bg-cyan-500/15' },
    { role: 'Business', title: 'Business Team', desc: 'Add items & run UAT (Status locked)', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/15' },
    { role: 'Call Center', title: 'Call Center / Ops', desc: 'Customer issue intake & tickets', icon: Headphones, color: 'text-orange-400 bg-orange-500/15' },
  ];

  return (
    <header className="h-12 bg-[#0E121A] border-b border-white/[0.08] px-3 md:px-5 flex items-center justify-between sticky top-0 z-40 select-none font-sans">
      {/* Left Area: Mobile Hamburger + Logo / Project Selector */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        {/* Mobile Hamburger Button */}
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-1.5 rounded-xl bg-white/[0.04] text-slate-300 hover:text-white border border-white/[0.08] active:scale-95 transition-all"
            aria-label="Open Navigation Menu"
            title="Open Menu"
          >
            <Menu size={18} />
          </button>
        )}

        {/* Project Selector (Custom Popover Dropdown matching Image 2) */}
        <div className="relative" ref={projectDropdownRef}>
          <button
            type="button"
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
            className="flex items-center gap-1.5 bg-[#121622] hover:bg-[#181E2E] border border-white/[0.08] hover:border-white/[0.16] rounded-xl px-2.5 py-1 text-xs transition-colors cursor-pointer focus:outline-none"
            aria-expanded={isProjectDropdownOpen}
            title="Filter by Project"
          >
            <FolderKanban size={13} className="text-[#007AFF] shrink-0" />
            <span className="text-white font-bold text-xs max-w-[120px] sm:max-w-[160px] truncate">
              {selectedProjectId === 'all'
                ? 'All Projects'
                : `${currentProject?.key || ''} · ${currentProject?.name || ''}`}
            </span>
            <ChevronDown
              size={12}
              className={`text-slate-400 transition-transform duration-200 ${
                isProjectDropdownOpen ? 'rotate-180 text-[#007AFF]' : ''
              }`}
            />
          </button>

          {isProjectDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 z-50 w-72 sm:w-80 bg-[#161D2B] border border-white/[0.12] rounded-2xl shadow-2xl shadow-black/80 backdrop-blur-xl p-1.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Switch Project</span>
                <span className="text-[10px] text-slate-500 font-mono">{projects.length} available</span>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-0.5 py-1 pr-0.5 custom-scrollbar">
                {/* All Projects Option */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProjectId('all');
                    setIsProjectDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                    selectedProjectId === 'all'
                      ? 'bg-[#007AFF]/20 text-white border border-[#007AFF]/40'
                      : 'text-slate-300 hover:bg-white/[0.06] hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[#007AFF]/20 text-[#007AFF] flex items-center justify-center shrink-0">
                      <Globe size={14} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">All Projects</div>
                      <div className="text-[11px] text-slate-400">Cross-initiative roll-up view</div>
                    </div>
                  </div>
                  {selectedProjectId === 'all' && <Check size={14} className="text-[#007AFF] shrink-0" />}
                </button>

                {/* Individual Projects */}
                {projects.map((p) => {
                  const isSelected = p.id === selectedProjectId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedProjectId(p.id);
                        setIsProjectDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#007AFF]/20 text-white border border-[#007AFF]/40'
                          : 'text-slate-300 hover:bg-white/[0.06] hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-white/[0.08] text-slate-200 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                          {p.key}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{p.name}</div>
                          <div className="text-[11px] text-slate-400 truncate">{p.description}</div>
                        </div>
                      </div>
                      {isSelected && <Check size={14} className="text-[#007AFF] shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Divider & Footer */}
              <div className="border-t border-white/[0.08] my-1" />
              <button
                type="button"
                onClick={() => {
                  setActiveTab('projects');
                  setIsProjectDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#007AFF] hover:bg-[#007AFF]/10 transition-colors cursor-pointer"
              >
                <FolderPlus size={14} />
                <span>Manage All Projects &amp; Squads</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Center Search Bar (Desktop) */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full h-8 px-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-all cursor-pointer shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Search size={13} className="text-slate-400" />
            <span className="truncate">Search work, sprints, bugs or jump to...</span>
          </div>
          <div className="flex items-center gap-1 shrink-0 font-mono text-[10px] bg-black/40 px-1.5 py-0.5 rounded border border-white/[0.08] text-slate-400">
            <span>⌘K</span>
            <Sparkles size={10} className="text-amber-400" />
          </div>
        </button>
      </div>

      {/* Right Side Actions: Theme, Role, Ticket & Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto">
        {/* Mobile Search Button */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="md:hidden p-1.5 rounded-xl bg-white/[0.04] text-slate-300 hover:text-white border border-white/[0.08]"
          title="Search"
        >
          <Search size={15} />
        </button>

        {/* Dark / Light Mode Toggle Button (SVG icons, NO gradients) */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition-colors cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun size={15} className="text-amber-400" />
          ) : (
            <Moon size={15} className="text-[#007AFF]" />
          )}
        </button>

        {/* Role Switcher Pill (Custom Popover Dropdown matching Image 2) */}
        <div className="relative" ref={roleDropdownRef}>
          <button
            type="button"
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-1.5 bg-[#121622] hover:bg-[#181E2E] border border-white/[0.08] hover:border-white/[0.16] rounded-xl px-2.5 py-1 text-xs transition-colors cursor-pointer focus:outline-none"
            aria-expanded={isRoleDropdownOpen}
            title="Switch User Role"
          >
            <Shield size={12} className="text-[#007AFF] shrink-0" />
            <span className="text-white font-bold text-xs max-w-[95px] sm:max-w-none truncate">
              {currentRole}
            </span>
            <ChevronDown
              size={12}
              className={`text-slate-400 transition-transform duration-200 ${
                isRoleDropdownOpen ? 'rotate-180 text-[#007AFF]' : ''
              }`}
            />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 z-50 w-72 sm:w-80 bg-[#161D2B] border border-white/[0.12] rounded-2xl shadow-2xl shadow-black/80 backdrop-blur-xl p-1.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Role Simulation</span>
                <span className="text-[10px] text-emerald-400 font-mono">Interactive Switcher</span>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-0.5 py-1 pr-0.5 custom-scrollbar">
                {roleDefinitions.map((item) => {
                  const isSelected = currentRole === item.role;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => {
                        setCurrentRole(item.role);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#007AFF]/20 text-white border border-[#007AFF]/40'
                          : 'text-slate-300 hover:bg-white/[0.06] hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}
                        >
                          <Icon size={14} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{item.title}</div>
                          <div className="text-[11px] text-slate-400 truncate">{item.desc}</div>
                        </div>
                      </div>
                      {isSelected && <Check size={14} className="text-[#007AFF] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Quick Ticket Button (Hidden on very small screens to avoid clutter) */}
        <button
          onClick={onOpenRaiseTicket}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-colors cursor-pointer"
          title="Raise Issue / Ticket"
        >
          <Ticket size={12} />
          <span>Ticket</span>
        </button>

        {/* User Profile Avatar with Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="w-7 h-7 rounded-full bg-[#007AFF] flex items-center justify-center font-bold text-xs text-white relative shadow-sm cursor-pointer focus:outline-none"
            title={`${currentUser.name} (${currentRole})`}
          >
            <span>{currentUser.name.slice(0, 1)}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -bottom-0.5 -right-0.5 border border-[#0E121A]" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-[#101420] border border-white/[0.12] rounded-2xl shadow-2xl z-50 p-2 text-xs animate-in fade-in duration-100 font-sans">
              <div className="p-2.5 border-b border-white/[0.08] space-y-1">
                <div className="font-bold text-white text-sm">{currentUser.name}</div>
                <div className="text-slate-400 text-[11px] truncate">{currentUser.email}</div>
                <div className="flex items-center gap-1 pt-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#007AFF]/20 text-[#007AFF] border border-[#007AFF]/30">
                    {currentRole}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {currentUser.username ? `@${currentUser.username}` : ''}
                  </span>
                </div>
              </div>

              <div className="p-1 space-y-0.5 border-b border-white/[0.08]">
                <button
                  onClick={() => {
                    setIsEditSelfOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer text-left font-medium"
                >
                  <Key size={13} className="text-amber-400" />
                  <span>Edit Profile &amp; Login</span>
                </button>
              </div>

              <div className="p-1">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer text-left font-medium"
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <EditUserModal
        user={currentUser}
        isOpen={isEditSelfOpen}
        onClose={() => setIsEditSelfOpen(false)}
      />
    </header>
  );
};
