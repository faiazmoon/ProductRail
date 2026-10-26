import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  User,
  Shield,
  Layers,
  Mail,
  CheckCircle2,
  UserPlus,
  Pencil,
  Trash2,
  Link,
  FolderKanban,
  Search,
  Lock,
} from 'lucide-react';
import { AddUserModal } from './AddUserModal';
import { EditUserModal } from '../admin/EditUserModal';
import { InviteModal } from './InviteModal';
import { UserProfile } from '../../types';

export const TeamView: React.FC = () => {
  const {
    users,
    projects,
    config,
    workItems,
    deleteUser,
    canAddUser,
    canRemoveUser,
    currentRole,
    currentUser,
  } = useApp();

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [searchMember, setSearchMember] = useState('');

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchMember.toLowerCase()) ||
      u.email.toLowerCase().includes(searchMember.toLowerCase()) ||
      u.role.toLowerCase().includes(searchMember.toLowerCase()) ||
      u.team.toLowerCase().includes(searchMember.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090C] overflow-hidden font-sans">
      {/* Header */}
      <div className="p-4 md:px-6 bg-[#0E121A] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Users size={16} />
            </div>
            <h1 className="text-base font-bold text-white tracking-tight">
              Teams &amp; Roster
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/[0.06] text-slate-300">
              {users.length} Members
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Engineering, product, QA, commercial and operations team members in the organization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Invite via Link Button */}
          {canAddUser && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.12] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Link size={13} className="text-[#007AFF]" />
              <span>Invite via Link</span>
            </button>
          )}

          {/* Add Team Member (PM & Super Admin only) */}
          {canAddUser && (
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <UserPlus size={14} />
              <span>Add Member</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-5xl mx-auto w-full">
        {/* Projects & Delivery Teams Overview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FolderKanban size={13} />
              <span>Active Project Teams ({projects.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {projects.map((p) => {
              const memberCount = p.memberIds.length;
              return (
                <div
                  key={p.id}
                  className="p-4 bg-[#0E121A] border border-white/[0.08] rounded-2xl space-y-2 shadow-sm hover:border-white/[0.15] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{p.name}</span>
                    <span className="text-[10px] font-mono text-[#007AFF] bg-[#007AFF]/15 px-2 py-0.5 rounded-lg border border-[#007AFF]/30 font-bold">
                      {p.key}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Lead: <strong className="text-slate-200">{p.leadName}</strong> ({p.leadRole})
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                    <span>{memberCount} team members</span>
                    <span className="text-emerald-400 font-semibold">{p.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Member Directory */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users size={13} />
              <span>Member Directory</span>
            </h2>

            {/* Filter */}
            <div className="relative w-48 sm:w-64">
              <Search size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search member, role, email..."
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                className="w-full bg-[#121622] border border-white/[0.1] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#007AFF]"
              />
            </div>
          </div>

          <div className="divide-y divide-white/[0.06] border border-white/[0.08] rounded-2xl overflow-hidden bg-[#0E121A]">
            {filteredUsers.map((member) => {
              const assignedCount = workItems.filter(
                (w) => w.owner?.name?.toLowerCase() === member.name.toLowerCase()
              ).length;

              const memberProjects = projects.filter((p) => p.memberIds.includes(member.id));
              const isTargetSuperAdmin = member.role === 'Super Admin';
              const canEditThisMember = currentRole === 'Super Admin' || (!isTargetSuperAdmin && (currentRole === 'Project Manager' || currentRole === 'Product Owner'));
              const canDeleteThisMember = canRemoveUser(member);

              return (
                <div
                  key={member.id}
                  className="p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#007AFF]/15 text-[#007AFF] border border-[#007AFF]/30 flex items-center justify-center font-bold text-xs">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{member.name}</span>
                        {isTargetSuperAdmin && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <Lock size={9} />
                            <span>Super Admin (Protected)</span>
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 text-[11px] flex items-center gap-1.5 mt-0.5">
                        <Mail size={11} className="text-slate-500" />
                        <span>{member.email}</span>
                      </div>
                      {/* Assigned Projects */}
                      {memberProjects.length > 0 && (
                        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                          <span className="text-[10px] text-slate-500">Projects:</span>
                          {memberProjects.map((p) => (
                            <span
                              key={p.id}
                              className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#121622] text-[#007AFF] border border-white/[0.08]"
                            >
                              {p.key}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-white/[0.06] text-blue-300 border border-white/[0.08]">
                        {member.role}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">{member.team}</div>
                    </div>

                    <div className="text-right font-mono text-[11px] min-w-[70px]">
                      <span className="text-slate-200 font-bold">{assignedCount}</span>
                      <span className="text-slate-500 ml-1">Tasks</span>
                    </div>

                    {/* Edit action */}
                    {canEditThisMember && (
                      <button
                        onClick={() => setEditingUser(member)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] text-[11px] font-semibold transition-colors cursor-pointer"
                        title="Edit user details"
                      >
                        <Pencil size={11} />
                        <span>Edit</span>
                      </button>
                    )}

                    {/* Delete action (Super Admin can delete anyone; PM can delete anyone EXCEPT Super Admin) */}
                    {canDeleteThisMember && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove member "${member.name}" from organization and all project teams?`)) {
                            deleteUser(member.id);
                          }
                        }}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Remove member"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
      />

      <EditUserModal
        user={editingUser}
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
      />

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
};
