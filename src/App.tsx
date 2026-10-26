import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { WorksheetView } from './components/worksheet/WorksheetView';
import { SprintsView } from './components/sprint/SprintsView';
import { DashboardView } from './components/dashboard/DashboardView';
import { QaWorkspace } from './components/qa/QaWorkspace';
import { UatWorkspace } from './components/uat/UatWorkspace';
import { ReleasesView } from './components/release/ReleasesView';
import { IntakeView } from './components/tickets/IntakeView';
import { DiagramView } from './components/diagram/DiagramView';
import { TeamView } from './components/team/TeamView';
import { AdminView } from './components/admin/AdminView';
import { ActivityLogView } from './components/activity/ActivityLogView';
import { ProjectsView } from './components/projects/ProjectsView';
import { WorkInspector } from './components/worksheet/WorkInspector';
import { WorkDetailModal } from './components/worksheet/WorkDetailModal';
import { QuickAddModal } from './components/worksheet/QuickAddModal';
import { RaiseTicketModal } from './components/tickets/RaiseTicketModal';
import { ExportImportModal } from './components/common/ExportImportModal';
import { BulkImportModal } from './components/common/BulkImportModal';
import { DeveloperHub } from './components/developer/DeveloperHub';
import { InviteModal } from './components/team/InviteModal';
import { AppHeader } from './components/layout/AppHeader';
import { CommandPalette } from './components/common/CommandPalette';
import { LoginView } from './components/auth/LoginView';
import {
  LayoutGrid,
  Table2,
  Code2,
  Calendar,
  Ticket,
  FolderKanban,
  MoreHorizontal,
  Zap,
  CheckSquare,
  Users,
  Settings,
  Rocket,
  GitFork,
  History,
  Link,
  X,
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedWorkId,
    isInspectorOpen,
    isLoggedIn,
    isInviteModalOpen,
    setIsInviteModalOpen,
  } = useApp();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isRaiseTicketOpen, setIsRaiseTicketOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  if (!isLoggedIn) {
    return <LoginView />;
  }

  // Worksheet tabs
  const isWorksheetTab =
    activeTab === 'all-work' ||
    activeTab === 'worksheet' ||
    activeTab === 'new-works' ||
    activeTab === 'my-work' ||
    activeTab === 'backlog' ||
    activeTab === 'archived';

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#08090C] text-slate-100 font-sans antialiased">
      {/* Top Application Bar */}
      <AppHeader
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenRaiseTicket={() => setIsRaiseTicketOpen(true)}
        onOpenBulkImport={() => setIsBulkImportOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Main Workspace Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Left Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          onOpenRaiseTicket={() => setIsRaiseTicketOpen(true)}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Central Viewport */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Executive Dashboard */}
          {activeTab === 'dashboard' && <DashboardView />}

          {/* Projects & Formed Teams */}
          {activeTab === 'projects' && <ProjectsView />}

          {/* Dedicated Developer Hub Workspace */}
          {activeTab === 'developer' && <DeveloperHub />}

          {/* Worksheet (All Work, My Work, Product Backlog, Archived) */}
          {isWorksheetTab && (
            <WorksheetView
              initialSavedTab={
                activeTab === 'new-works'
                  ? 'new-works'
                  : activeTab === 'my-work'
                  ? 'my-work'
                  : activeTab === 'backlog'
                  ? 'backlog'
                  : activeTab === 'archived'
                  ? 'archived'
                  : 'all'
              }
              onOpenQuickAdd={() => setIsQuickAddOpen(true)}
              onOpenExportModal={() => setIsExportModalOpen(true)}
              onOpenBulkImport={() => setIsBulkImportOpen(true)}
            />
          )}

          {/* Sprints Suite */}
          {activeTab === 'sprints' && <SprintsView />}

          {/* Specialized Workspaces */}
          {activeTab === 'qa' && <QaWorkspace />}
          {activeTab === 'uat' && <UatWorkspace />}
          {activeTab === 'releases' && <ReleasesView />}
          {activeTab === 'tickets' && (
            <IntakeView onOpenRaiseTicket={() => setIsRaiseTicketOpen(true)} />
          )}
          {activeTab === 'diagram' && <DiagramView />}
          {activeTab === 'activity' && <ActivityLogView />}
          {activeTab === 'team' && <TeamView />}
          {activeTab === 'admin' && <AdminView />}
        </main>

        {/* Right-Side Desktop Inspector */}
        {selectedWorkId && isInspectorOpen && <WorkInspector />}
      </div>

      {/* Mobile Responsive Bottom Navigation Bar */}
      <nav className="md:hidden h-14 bg-[#0A0D14] border-t border-white/[0.08] flex items-center justify-around px-2 shrink-0 z-30">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
          { id: 'projects', label: 'Projects', icon: FolderKanban },
          { id: 'all-work', label: 'Worksheet', icon: Table2 },
          { id: 'tickets', label: 'Tickets', icon: Ticket },
        ].map((item) => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.id ||
            (item.id === 'all-work' && isWorksheetTab);
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-14 py-1 text-[10px] font-bold transition-colors cursor-pointer ${
                isActive ? 'text-[#007AFF] font-extrabold' : 'text-slate-400'
              }`}
            >
              <Icon size={17} />
              <span className="mt-0.5">{item.label}</span>
            </button>
          );
        })}

        {/* Mobile "More" action to access all views */}
        <button
          onClick={() => setIsMobileMoreOpen(true)}
          className={`flex flex-col items-center justify-center w-14 py-1 text-[10px] font-bold transition-colors cursor-pointer ${
            isMobileMoreOpen ? 'text-[#007AFF]' : 'text-slate-400'
          }`}
        >
          <MoreHorizontal size={17} />
          <span className="mt-0.5">More</span>
        </button>
      </nav>

      {/* Mobile "More" Full Navigation Drawer / Action Sheet */}
      {isMobileMoreOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 md:hidden font-sans">
          <div className="bg-[#0E121A] border-t border-white/[0.12] rounded-t-3xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Sheet Handle & Header */}
            <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">All Workspaces &amp; Tools</h3>
                <p className="text-[11px] text-slate-400">Tap to navigate anywhere</p>
              </div>
              <button
                onClick={() => setIsMobileMoreOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white bg-white/[0.04]"
              >
                <X size={16} />
              </button>
            </div>

            {/* List of All Features */}
            <div className="p-4 overflow-y-auto space-y-1 text-xs divide-y divide-white/[0.04]">
              {[
                { id: 'projects', label: 'Projects & Teams', icon: FolderKanban, color: 'text-indigo-400' },
                { id: 'sprints', label: 'Sprints Suite', icon: Calendar, color: 'text-amber-400' },
                { id: 'qa', label: 'QA Verification Workspace', icon: Zap, color: 'text-cyan-400' },
                { id: 'uat', label: 'Business UAT Suite', icon: CheckSquare, color: 'text-teal-400' },
                { id: 'team', label: 'Team Members & Roster', icon: Users, color: 'text-emerald-400' },
                { id: 'releases', label: 'Releases & Deployment', icon: Rocket, color: 'text-indigo-400' },
                { id: 'developer', label: 'Developer Hub', icon: Code2, color: 'text-emerald-400' },
                { id: 'activity', label: 'Activity & Audit Log', icon: History, color: 'text-purple-400' },
                { id: 'diagram', label: 'Relationship Graph', icon: GitFork, color: 'text-fuchsia-400' },
                { id: 'admin', label: 'Admin Settings', icon: Settings, color: 'text-purple-400' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMoreOpen(false);
                    }}
                    className={`w-full py-3 px-3 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#007AFF]/15 text-[#007AFF] font-bold'
                        : 'text-slate-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={item.color} />
                      <span className="text-xs font-semibold">{item.label}</span>
                    </div>
                  </button>
                );
              })}

              {/* Quick Invite Link shortcut in mobile menu */}
              <div className="pt-3">
                <button
                  onClick={() => {
                    setIsMobileMoreOpen(false);
                    setIsInviteModalOpen(true);
                  }}
                  className="w-full py-2.5 px-3 bg-[#007AFF] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Link size={15} />
                  <span>Invite to Team via Link</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals & Overlays */}
      <WorkDetailModal />
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onOpenBulkImport={() => setIsBulkImportOpen(true)}
      />
      <RaiseTicketModal isOpen={isRaiseTicketOpen} onClose={() => setIsRaiseTicketOpen(false)} />
      <ExportImportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />
      <BulkImportModal isOpen={isBulkImportOpen} onClose={() => setIsBulkImportOpen(false)} />
      <InviteModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
      <CommandPalette
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenRaiseTicket={() => setIsRaiseTicketOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
