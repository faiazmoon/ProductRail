import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UserPlus, Shield, Mail, Check, Layers } from 'lucide-react';
import { UserRole } from '../../types';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose }) => {
  const { addUser, config } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Developer');
  const [team, setTeam] = useState('Mobile Engineering');
  const [selectedAreas, setSelectedAreas] = useState<string[]>(['Landing Page', 'Bus']);
  const [status, setStatus] = useState<'Active' | 'Invited'>('Active');

  if (!isOpen) return null;

  const roles: UserRole[] = [
    'Super Admin',
    'Workspace Admin',
    'Product Owner',
    'Project Manager',
    'Engineering Lead',
    'Developer',
    'Designer',
    'QA',
    'Business',
    'UAT',
    'Operations',
    'Call Center',
    'Leadership',
    'Viewer',
  ];

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    addUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      team,
      productAreas: selectedAreas.length > 0 ? selectedAreas : ['All'],
      status,
    });

    setName('');
    setEmail('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-100 font-sans">
      <div className="w-full max-w-lg bg-[#0C1017] border border-white/[0.1] rounded-xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
              <UserPlus size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Add Team Member</h2>
              <p className="text-xs text-slate-400">
                Grant workspace access, assign role permissions, and define product area scope.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Anik Rahman"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="w-full bg-[#121620] border border-white/[0.1] rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Email Address *</label>
            <input
              type="email"
              placeholder="e.g. anik.r@bdtickets.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#121620] border border-white/[0.1] rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Role &amp; Permissions</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-[#121620] border border-white/[0.1] rounded-lg p-2 text-white"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Assigned Team</label>
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="w-full bg-[#121620] border border-white/[0.1] rounded-lg p-2 text-white"
              >
                {config.teams.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
                <option value="Customer Support">Customer Support</option>
                <option value="Core Engineering">Core Engineering</option>
              </select>
            </div>
          </div>

          {/* Product Areas Scope */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1.5">
              Assigned Product Areas Scope (Multi-select)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {config.productAreas.map((area) => {
                const isSelected = selectedAreas.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleArea(area)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors flex items-center gap-1 ${
                      isSelected
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/80 font-semibold'
                        : 'bg-black/40 text-slate-400 border-white/[0.08] hover:text-white'
                    }`}
                  >
                    {isSelected && <Check size={11} />}
                    <span>{area}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Account State</label>
            <div className="flex items-center gap-4 text-slate-300">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="Active"
                  checked={status === 'Active'}
                  onChange={() => setStatus('Active')}
                  className="text-emerald-500 focus:ring-0"
                />
                <span>Active Immediately</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="Invited"
                  checked={status === 'Invited'}
                  onChange={() => setStatus('Invited')}
                  className="text-amber-500 focus:ring-0"
                />
                <span>Send Email Invitation</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-sm transition-colors"
            >
              Add User to Organization
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
