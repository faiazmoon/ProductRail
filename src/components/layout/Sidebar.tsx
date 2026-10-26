import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutGrid,
  Table2,
  Calendar,
  Zap,
  CheckSquare,
  Rocket,
  Ticket,
  GitFork,
  Users,
  Settings,
  History,
  ChevronLeft,
  ChevronRight,
  Code2,
  LogOut,
  FolderKanban,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  onOpenRaiseTicket: () => void;
  onOpenQuickAdd?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { activeTab, setActiveTab, currentRole, workItems, tickets, logout, currentUser } = useApp();

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  const readyQaCount = workItems.filter(
    (w) => w.status === 'Ready for QA' || w.status === 'In QA'
  ).length;

  const readyUatCount = workItems.filter(
    (w) =>
      w.status === 'Ready for UAT' ||
      (w.deliverables &&
        w.deliverables.length > 0 &&
        w.deliverables.every((d) => d.status === 'Ready for UAT' || d.status === 'Done'))
  ).length;

  const uatAttentionCount = workItems.reduce((acc, item) => {
    return acc + (item.uatCases?.filter((c) => c.requiresAttention)?.length || 0);
  }, 0);

  const waitingTriageCount = tickets.filter(
    (t) => t.status === 'Waiting for Triage'
  ).length;

  const isCallCenter = currentRole === 'Call Center';
  const isAdminOrLead =
    currentRole === 'Super Admin' ||
    currentRole === 'Workspace Admin' ||
    currentRole === 'Product Owner' ||
    currentRole === 'Project Manager';

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
    badge?: number | string | null;
    badgeColor?: string;
    visible: boolean;
  }

  interface NavGroup {
    title: string;
    items: NavItem[];
  }

  const navGroups: NavGroup[] = [
    {
      title: 'Workspace',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutGrid,
          color: 'text-sky-400',
          visible: true,
        },
        {
          id: 'projects',
          label: 'Projects & Teams',
          icon: FolderKanban,
          color: 'text-indigo-400',
          visible: true,
        },
        {
          id: 'all-work',
          label: 'Worksheet',
          icon: Table2,
          color: 'text-blue-400',
          visible: !isCallCenter,
        },
        {
          id: 'sprints',
          label: 'Sprints',
          icon: Calendar,
          color: 'text-amber-400',
          visible: !isCallCenter,
        },
        {
          id: 'admin',
          label: 'Admin Settings',
          icon: Settings,
          color: 'text-purple-400',
          visible: true,
        },
      ],
    },
    {
      title: 'Delivery & QA',
      items: [
        {
          id: 'developer',
          label: 'Developer Hub',
          icon: Code2,
          color: 'text-emerald-400',
          visible: !isCallCenter,
        },
        {
          id: 'qa',
          label: 'QA Verification',
          icon: Zap,
          color: 'text-cyan-400',
          badge: readyQaCount > 0 ? readyQaCount : null,
          badgeColor: 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/60',
          visible: true,
        },
        {
          id: 'uat',
          label: 'Business UAT',
          icon: CheckSquare,
          color: 'text-teal-400',
          badge:
            uatAttentionCount > 0
              ? `${uatAttentionCount} Alert`
              : readyUatCount > 0
              ? readyUatCount
              : null,
          badgeColor:
            uatAttentionCount > 0
              ? 'bg-amber-950/90 text-amber-300 border border-amber-700/80'
              : 'bg-teal-950/80 text-teal-400 border border-teal-800/60',
          visible: true,
        },
        {
          id: 'releases',
          label: 'Releases',
          icon: Rocket,
          color: 'text-indigo-400',
          visible: !isCallCenter,
        },
      ],
    },
    {
      title: 'Operations',
      items: [
        {
          id: 'tickets',
          label: 'Inbound Tickets',
          icon: Ticket,
          color: 'text-orange-400',
          badge: waitingTriageCount > 0 ? waitingTriageCount : null,
          badgeColor: 'bg-orange-950/80 text-orange-400 border border-orange-800/60',
          visible: true,
        },
      ],
    },
    {
      title: 'System & Graph',
      items: [
        {
          id: 'diagram',
          label: 'Relationship Graph',
          icon: GitFork,
          color: 'text-fuchsia-400',
          visible: !isCallCenter,
        },
        {
          id: 'activity',
          label: 'Activity & Audit',
          icon: History,
          color: 'text-purple-400',
          visible: true,
        },
        {
          id: 'team',
          label: 'Team & Roster',
          icon: Users,
          color: 'text-emerald-400',
          visible: true,
        },
      ],
    },
  ];

  const content = (
    <div className="flex flex-col justify-between h-full font-sans select-none">
      <div className="p-3 space-y-4 overflow-y-auto">
        {/* Brand Header inside Sidebar */}
        <div
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-2.5 px-2 py-1.5 cursor-pointer rounded-xl hover:bg-white/[0.04] transition-colors"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-sm shadow-md shadow-blue-500/30 shrink-0">
            P
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <span className="font-extrabold text-white text-base tracking-tight leading-none block">
                ProductRail
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Delivery Platform
              </span>
            </div>
          )}
        </div>

        {/* Structured Navigation Groups */}
        <div className="space-y-4">
          {navGroups.map((group, gIdx) => {
            const visibleItems = group.items.filter((item) => item.visible);
            if (visibleItems.length === 0) return null;

            return (
              <div key={gIdx} className="space-y-0.5">
                {!isCollapsed ? (
                  <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {group.title}
                  </div>
                ) : (
                  gIdx > 0 && <div className="border-t border-white/[0.06] my-2" />
                )}

                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    activeTab === item.id ||
                    (item.id === 'all-work' &&
                      (activeTab === 'worksheet' ||
                        activeTab === 'my-work' ||
                        activeTab === 'backlog' ||
                        activeTab === 'archived'));

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      title={item.label}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group cursor-pointer ${
                        isActive
                          ? 'bg-blue-600/20 text-blue-300 border-l-2 border-blue-500 font-bold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          size={16}
                          className={`${item.color} shrink-0 group-hover:scale-105 transition-transform`}
                        />
                        {!isCollapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>
                      {!isCollapsed && item.badge && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer controls & collapse toggle */}
      <div className="p-2.5 border-t border-white/[0.08] flex items-center justify-between shrink-0 bg-black/20">
        {!isCollapsed ? (
          <div className="flex items-center justify-between w-full pr-1">
            <div
              onClick={() => handleNavClick('admin')}
              className="flex items-center gap-2 truncate min-w-0 cursor-pointer hover:opacity-85 transition-opacity"
              title="Click to manage profile & Admin Settings"
            >
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm">
                {currentUser?.name?.slice(0, 1) || 'U'}
              </div>
              <div className="truncate text-left">
                <div className="text-[11px] font-semibold text-slate-200 truncate flex items-center gap-1">
                  <span>{currentUser?.name}</span>
                  <Settings size={10} className="text-slate-500" />
                </div>
                <div className="text-[9px] text-slate-500 font-mono truncate">{currentRole}</div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 ml-1">
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                title="Sign Out / Log Out"
              >
                <LogOut size={13} className="text-rose-400" />
              </button>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
                title="Collapse sidebar"
              >
                <ChevronLeft size={13} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 w-full">
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
              title="Log Out"
            >
              <LogOut size={14} />
            </button>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
              title="Expand sidebar"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex bg-[#0A0D14] border-r border-white/[0.08] flex-col justify-between transition-all duration-200 shrink-0 select-none ${
          isCollapsed ? 'w-16' : 'w-56 lg:w-60'
        }`}
      >
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={onCloseMobile}
          />
          <aside className="relative w-64 max-w-[80vw] bg-[#0A0D14] border-r border-white/[0.1] h-full z-10 shadow-2xl animate-in slide-in-from-left duration-150 flex flex-col justify-between">
            {content}
          </aside>
        </div>
      )}
    </>
  );
};
