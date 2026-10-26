import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FolderKanban,
  Plus,
  Trash2,
  Users,
  UserPlus,
  Link,
  Search,
  ExternalLink,
  Shield,
  Layers,
  CheckCircle2,
  X,
  User,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { Project, UserProfile } from '../../types';
import { InviteModal } from '../team/InviteModal';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    users,
    workItems,
    addProject,
    deleteProject,
    updateProject,
    addMemberToProject,
    removeMemberFromProject,
    canManageProjects,
    canDeleteProjects,
    currentRole,
    currentUser,
    setSelectedProjectId,
    setActiveTab,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isManageMembersModalOpen, setIsManageMembersModalOpen] = useState<string | null>(null);
  const [inviteModalProjectId, setInviteModalProjectId] = useState<string | null>(null);

  // New project form state
  const [newProjName, setNewProjName] = useState('');
  const [newProjKey, setNewProjKey] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjLeadId, setNewProjLeadId] = useState(users[0]?.id || '');
  const [newProjMemberIds, setNewProjMemberIds] = useState<string[]>([currentUser.id]);

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim() || !newProjKey.trim()) return;

    const leadUser = users.find((u) => u.id === newProjLeadId) || currentUser;

    addProject({
      name: newProjName.trim(),
      key: newProjKey.trim().toUpperCase(),
      description: newProjDesc.trim(),
      leadId: leadUser.id,
      leadName: leadUser.name,
      leadRole: leadUser.role,
      status: 'Active',
      memberIds: Array.from(new Set([...newProjMemberIds, leadUser.id])),
      color: '#007AFF',
    });

    setNewProjName('');
    setNewProjKey('');
    setNewProjDesc('');
    setIsCreateModalOpen(false);
  };

  const projectToManage = projects.find((p) => p.id === isManageMembersModalOpen);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090C] overflow-hidden font-sans">
      {/* Top Header */}
      <div className="p-4 md:px-6 bg-[#0E121A] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#007AFF]/15 text-[#007AFF] flex items-center justify-center">
            <FolderKanban size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                Projects &amp; Teams
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/[0.06] text-slate-300">
                {projects.length} Total
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Form delivery teams, manage project scopes, and organize cross-functional work.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#121622] border border-white/[0.1] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#007AFF]"
            />
          </div>

          {/* New Project Button (PM & Super Admin only) */}
          {canManageProjects && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#007AFF] hover:bg-[#0066D6] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus size={14} />
              <span>New Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const projectMembers = users.filter((u) => project.memberIds.includes(u.id));
            const projectWork = workItems.filter(
              (w) => w.projectId === project.id || w.productArea.includes(project.name)
            );
            const openWorkCount = projectWork.filter(
              (w) => w.status !== 'Released' && w.status !== 'Archived'
            ).length;

            return (
              <div
                key={project.id}
                className="bg-[#0E121A] border border-white/[0.08] hover:border-white/[0.16] rounded-3xl p-5 flex flex-col justify-between transition-all shadow-lg hover:shadow-xl group"
              >
                <div>
                  {/* Project Top Bar */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-black bg-[#007AFF]/20 text-[#007AFF] border border-[#007AFF]/30">
                        {project.key}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {project.status}
                      </span>
                    </div>

                    {canDeleteProjects && (
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Delete project "${project.name}" (${project.key})? This action cannot be undone.`
                            )
                          ) {
                            deleteProject(project.id);
                          }
                        }}
                        className="opacity-60 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                        title="Delete project"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  {/* Project Title & Description */}
                  <h3 className="font-bold text-white text-sm mb-1 group-hover:text-[#007AFF] transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {project.description || 'No description provided.'}
                  </p>

                  {/* Lead Info */}
                  <div className="p-2.5 bg-[#121622]/60 rounded-xl border border-white/[0.04] mb-4 text-[11px] flex items-center justify-between">
                    <span className="text-slate-400">Project Lead:</span>
                    <span className="font-semibold text-slate-200">
                      {project.leadName} ({project.leadRole})
                    </span>
                  </div>

                  {/* Formed Team Members */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Users size={12} />
                        <span>Formed Team ({projectMembers.length})</span>
                      </span>
                      {canManageProjects && (
                        <button
                          onClick={() => setIsManageMembersModalOpen(project.id)}
                          className="text-[#007AFF] hover:underline font-bold text-[10px] cursor-pointer"
                        >
                          Manage Members
                        </button>
                      )}
                    </div>

                    <div className="flex items-center flex-wrap gap-1.5 pt-1">
                      {projectMembers.slice(0, 6).map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center gap-1 px-2 py-1 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[10px] text-slate-200"
                          title={`${m.name} · ${m.role}`}
                        >
                          <div className="w-3.5 h-3.5 rounded-full bg-[#007AFF] text-white flex items-center justify-center font-bold text-[8px]">
                            {m.name.charAt(0)}
                          </div>
                          <span className="truncate max-w-[80px]">{m.name}</span>
                        </div>
                      ))}
                      {projectMembers.length > 6 && (
                        <span className="text-[10px] text-slate-400 font-bold px-1.5">
                          +{projectMembers.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Stats & Actions */}
                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-400">
                    <strong className="text-white font-mono">{openWorkCount}</strong> active tasks
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Invite Link */}
                    <button
                      onClick={() => setInviteModalProjectId(project.id)}
                      className="p-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="Invite new member via link"
                    >
                      <Link size={13} />
                    </button>

                    {/* View in Worksheet */}
                    <button
                      onClick={() => {
                        setSelectedProjectId(project.id);
                        setActiveTab('worksheet');
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-[#007AFF]/15 hover:bg-[#007AFF]/25 text-[#007AFF] rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      <span>Worksheet</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Create New Project */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#0E121A] border border-white/[0.1] rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <FolderKanban size={18} className="text-[#007AFF]" />
                <h2 className="text-sm font-bold text-white">Create New Project</h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Project Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Intercity Bus Ticketing Engine"
                  value={newProjName}
                  onChange={(e) => {
                    setNewProjName(e.target.value);
                    if (!newProjKey) {
                      const words = e.target.value.split(/\s+/).filter(Boolean);
                      setNewProjKey(words.map((w) => w[0]).join('').slice(0, 4).toUpperCase());
                    }
                  }}
                  className="w-full bg-[#121622] border border-white/[0.1] rounded-xl px-3 py-2 text-white outline-none focus:border-[#007AFF]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Key / Prefix:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BUS"
                    value={newProjKey}
                    onChange={(e) => setNewProjKey(e.target.value.toUpperCase())}
                    className="w-full bg-[#121622] border border-white/[0.1] rounded-xl px-3 py-2 text-white font-mono uppercase outline-none focus:border-[#007AFF]"
                    maxLength={6}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Project Lead:
                  </label>
                  <select
                    value={newProjLeadId}
                    onChange={(e) => setNewProjLeadId(e.target.value)}
                    className="w-full bg-[#121622] border border-white/[0.1] rounded-xl px-3 py-2 text-white outline-none"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Description:
                </label>
                <textarea
                  rows={2}
                  placeholder="Goals and delivery scope for this project..."
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  className="w-full bg-[#121622] border border-white/[0.1] rounded-xl p-3 text-white outline-none focus:border-[#007AFF] resize-none"
                />
              </div>

              {/* Form Initial Team */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Select Initial Team Members:
                </label>
                <div className="max-h-36 overflow-y-auto border border-white/[0.08] rounded-xl p-2 space-y-1 bg-[#121622]/40">
                  {users.map((u) => {
                    const isSelected = newProjMemberIds.includes(u.id);
                    return (
                      <label
                        key={u.id}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/[0.04] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewProjMemberIds((prev) => [...prev, u.id]);
                            } else {
                              setNewProjMemberIds((prev) => prev.filter((id) => id !== u.id));
                            }
                          }}
                          className="rounded border-slate-700 text-[#007AFF]"
                        />
                        <span className="font-semibold text-white">{u.name}</span>
                        <span className="text-[10px] text-slate-400">({u.role})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#007AFF] hover:bg-[#0066D6] text-white font-bold rounded-xl shadow-md"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Form / Manage Team Members in Project */}
      {projectToManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#0E121A] border border-white/[0.1] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h2 className="text-sm font-bold text-white">Form Project Team</h2>
                <p className="text-[11px] text-slate-400">{projectToManage.name}</p>
              </div>
              <button
                onClick={() => setIsManageMembersModalOpen(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <p className="text-[11px] text-slate-400">
                Team members can be added to projects only. Toggle team members who belong to this project:
              </p>

              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {users.map((u) => {
                  const isInProject = projectToManage.memberIds.includes(u.id);
                  return (
                    <div
                      key={u.id}
                      className="p-2.5 rounded-xl bg-[#121622] border border-white/[0.06] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#007AFF]/20 text-[#007AFF] flex items-center justify-center font-bold text-[10px]">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{u.name}</div>
                          <div className="text-[10px] text-slate-400">{u.role} · {u.team}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (isInProject) {
                            removeMemberFromProject(projectToManage.id, u.id);
                          } else {
                            addMemberToProject(projectToManage.id, u.id);
                          }
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          isInProject
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25'
                            : 'bg-[#007AFF] text-white hover:bg-[#0066D6]'
                        }`}
                      >
                        {isInProject ? 'Remove' : 'Add to Team'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.08] flex justify-end">
              <button
                onClick={() => setIsManageMembersModalOpen(null)}
                className="px-4 py-2 bg-[#007AFF] text-white rounded-xl font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Link Invite Modal */}
      <InviteModal
        isOpen={Boolean(inviteModalProjectId)}
        onClose={() => setInviteModalProjectId(null)}
        defaultProjectId={inviteModalProjectId || undefined}
      />
    </div>
  );
};
