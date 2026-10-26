import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Shield, Lock, User, Mail, Check, Key, Eye, EyeOff } from 'lucide-react';
import { UserProfile, UserRole } from '../../types';

interface EditUserModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  const { updateUser, config } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('Developer');
  const [team, setTeam] = useState('Mobile Engineering');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [status, setStatus] = useState<'Active' | 'Invited' | 'Suspended'>('Active');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setUsername(user.username || user.email.split('@')[0]);
      setPassword(user.password || 'password123');
      setRole(user.role);
      setTeam(user.team);
      setSelectedAreas(user.productAreas || ['All']);
      setStatus(user.status);
      setTwoFactorEnabled(user.twoFactorEnabled || false);
    }
  }, [user]);

  if (!isOpen || !user) return null;

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

    updateUser(user.id, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      username: username.trim().toLowerCase() || user.email.split('@')[0],
      password: password.trim() || 'password123',
      role,
      team,
      productAreas: selectedAreas.length > 0 ? selectedAreas : ['All'],
      status,
      twoFactorEnabled,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-100 font-sans">
      <div className="w-full max-w-xl bg-[#0C1017] border border-white/[0.1] rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-950/60 border border-blue-800/60 text-blue-400">
              <User size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Edit User &amp; Login Credentials
              </h2>
              <p className="text-xs text-slate-400">
                Update profile, login credentials, authentication passcode, and permissions for {user.name}.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#121620] border border-white/[0.1] rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#121620] border border-white/[0.1] rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          {/* Login Credentials Box */}
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-3">
            <div className="flex items-center justify-between text-blue-300 font-bold text-xs">
              <span className="flex items-center gap-1.5">
                <Key size={14} className="text-amber-400" />
                <span>Login Credentials &amp; Passcode</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Used to Sign In</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Login Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. sarah"
                  required
                  className="w-full bg-[#0D1017] border border-white/[0.1] rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Password / Passcode</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    className="w-full bg-[#0D1017] border border-white/[0.1] rounded-lg pl-2 pr-8 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Enable Two-Factor Authentication (2FA)</span>
              </label>
            </div>
          </div>

          {/* Role, Team & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Role &amp; Permissions</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-[#121620] border border-white/[0.1] rounded-lg p-2 text-white text-xs cursor-pointer focus:outline-none focus:border-blue-500"
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
                className="w-full bg-[#121620] border border-white/[0.1] rounded-lg p-2 text-white text-xs cursor-pointer focus:outline-none focus:border-blue-500"
              >
                {config.teams.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
                <option value="Customer Support">Customer Support</option>
                <option value="Core Engineering">Core Engineering</option>
                <option value="DevOps & IT">DevOps &amp; IT</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Account Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-[#121620] border border-white/[0.1] rounded-lg p-2 text-white text-xs cursor-pointer focus:outline-none focus:border-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Invited">Invited</option>
                <option value="Suspended">Suspended</option>
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
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/30 text-blue-300 border-blue-500/60 font-semibold'
                        : 'bg-black/40 text-slate-400 border-white/[0.08] hover:text-white'
                    }`}
                  >
                    <span>{area}</span>
                    {isSelected && <Check size={11} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all cursor-pointer"
            >
              Save User &amp; Credentials
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
