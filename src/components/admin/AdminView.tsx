import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Plus,
  Trash2,
  Check,
  UserPlus,
  Bus,
  Ship,
  Search,
  Phone,
  Pencil,
  Key,
  X,
  Shield,
  Layers,
  Sparkles,
  GitFork,
  Smartphone,
  Save,
} from 'lucide-react';
import { WorkTypeIcon } from '../common/Icons';
import { AddUserModal } from '../team/AddUserModal';
import { EditUserModal } from './EditUserModal';
import { UserProfile, RoutingRule, OperatorItem } from '../../types';

export const AdminView: React.FC = () => {
  const {
    config,
    updateConfig,
    routingRules,
    addRoutingRule,
    updateRoutingRule,
    deleteRoutingRule,
    users,
    deleteUser,
    addOperator,
    updateOperator,
    deleteOperator,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'operators' | 'types' | 'areas' | 'platforms' | 'rules' | 'users'>('users');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // New item inputs
  const [newTypeName, setNewTypeName] = useState('');
  const [newAreaName, setNewAreaName] = useState('');
  const [newPlatformName, setNewPlatformName] = useState('');

  // Operator inputs & edit state
  const [operatorSearch, setOperatorSearch] = useState('');
  const [newOperatorName, setNewOperatorName] = useState('');
  const [newOperatorType, setNewOperatorType] = useState<'Bus' | 'Ship' | 'Launch' | 'Air' | 'Other'>('Bus');
  const [newOperatorContact, setNewOperatorContact] = useState('');
  const [editingOperator, setEditingOperator] = useState<OperatorItem | null>(null);

  // Work Type edit state
  const [editingWorkTypeName, setEditingWorkTypeName] = useState<string | null>(null);
  const [editWorkTypeInput, setEditWorkTypeInput] = useState('');

  // Product Area edit state
  const [editingAreaName, setEditingAreaName] = useState<string | null>(null);
  const [editAreaInput, setEditAreaInput] = useState('');

  // Platform edit state
  const [editingPlatformName, setEditingPlatformName] = useState<string | null>(null);
  const [editPlatformInput, setEditPlatformInput] = useState('');

  // Routing Rule Form state & edit state
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RoutingRule | null>(null);
  const [ruleName, setRuleName] = useState('');
  const [ruleArea, setRuleArea] = useState('');
  const [rulePlatform, setRulePlatform] = useState('');
  const [ruleSource, setRuleSource] = useState('');
  const [rulePriority, setRulePriority] = useState('');
  const [ruleTeam, setRuleTeam] = useState('Backend Engineering');

  const filteredOperators = useMemo(() => {
    const list = config.operators || [];
    if (!operatorSearch.trim()) return list;
    const q = operatorSearch.toLowerCase();
    return list.filter(
      (op) =>
        op.name.toLowerCase().includes(q) ||
        op.type.toLowerCase().includes(q) ||
        (op.contact && op.contact.toLowerCase().includes(q))
    );
  }, [config.operators, operatorSearch]);

  const handleAddOperator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOperatorName.trim()) return;

    addOperator({
      name: newOperatorName.trim(),
      type: newOperatorType,
      contact: newOperatorContact.trim() || undefined,
    });

    setNewOperatorName('');
    setNewOperatorContact('');
  };

  const handleSaveOperatorEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOperator || !editingOperator.name.trim()) return;

    updateOperator(editingOperator.id, {
      name: editingOperator.name.trim(),
      type: editingOperator.type,
      contact: editingOperator.contact?.trim() || undefined,
    });

    setEditingOperator(null);
  };

  const handleAddWorkType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;

    updateConfig({
      workTypes: [
        ...config.workTypes,
        {
          name: newTypeName.trim(),
          color: '#3b82f6',
          icon: 'Layers',
          active: true,
          order: config.workTypes.length + 1,
        },
      ],
    });
    setNewTypeName('');
  };

  const handleSaveWorkTypeEdit = (oldName: string) => {
    if (!editWorkTypeInput.trim()) return;
    const updated = config.workTypes.map((wt) =>
      wt.name === oldName ? { ...wt, name: editWorkTypeInput.trim() } : wt
    );
    updateConfig({ workTypes: updated });
    setEditingWorkTypeName(null);
    setEditWorkTypeInput('');
  };

  const handleAddArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaName.trim()) return;
    if (config.productAreas.includes(newAreaName.trim())) return;

    updateConfig({
      productAreas: [...config.productAreas, newAreaName.trim()],
    });
    setNewAreaName('');
  };

  const handleSaveAreaEdit = (oldName: string) => {
    if (!editAreaInput.trim()) return;
    const updated = config.productAreas.map((a) =>
      a === oldName ? editAreaInput.trim() : a
    );
    updateConfig({ productAreas: updated });
    setEditingAreaName(null);
    setEditAreaInput('');
  };

  const handleAddPlatform = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlatformName.trim()) return;
    if (config.platforms.includes(newPlatformName.trim())) return;

    updateConfig({
      platforms: [...config.platforms, newPlatformName.trim()],
    });
    setNewPlatformName('');
  };

  const handleSavePlatformEdit = (oldName: string) => {
    if (!editPlatformInput.trim()) return;
    const updated = config.platforms.map((p) =>
      p === oldName ? editPlatformInput.trim() : p
    );
    updateConfig({ platforms: updated });
    setEditingPlatformName(null);
    setEditPlatformInput('');
  };

  const handleSaveRoutingRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) return;

    if (editingRule) {
      updateRoutingRule(editingRule.id, {
        name: ruleName.trim(),
        conditions: {
          productArea: ruleArea || undefined,
          platform: rulePlatform || undefined,
          source: ruleSource || undefined,
          priority: rulePriority || undefined,
        },
        targetTeam: ruleTeam,
      });
      setEditingRule(null);
    } else {
      addRoutingRule({
        name: ruleName.trim(),
        conditions: {
          productArea: ruleArea || undefined,
          platform: rulePlatform || undefined,
          source: ruleSource || undefined,
          priority: rulePriority || undefined,
        },
        targetTeam: ruleTeam,
        active: true,
      });
    }

    setRuleName('');
    setRuleArea('');
    setRulePlatform('');
    setRuleSource('');
    setRulePriority('');
    setIsAddRuleOpen(false);
  };

  const startEditRule = (rule: RoutingRule) => {
    setEditingRule(rule);
    setRuleName(rule.name);
    setRuleArea(rule.conditions.productArea || '');
    setRulePlatform(rule.conditions.platform || '');
    setRuleSource(rule.conditions.source || '');
    setRulePriority(rule.conditions.priority || '');
    setRuleTeam(rule.targetTeam || 'Backend Engineering');
    setIsAddRuleOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090d] overflow-hidden font-sans select-none">
      {/* Admin Header */}
      <div className="p-4 bg-[#0c1017] border-b border-slate-800 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-purple-400" />
            <h1 className="text-base font-bold text-white tracking-tight">Organization &amp; Taxonomy Settings</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure user profiles, login credentials, work types, product areas, platforms, bus/ship operators, and routing rules.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 border-b border-slate-800 bg-[#0a0d14] flex items-center gap-1 text-xs overflow-x-auto shrink-0">
        {[
          { id: 'users', label: `Users & Login Credentials (${users.length})` },
          { id: 'operators', label: `Bus & Ship Operators (${config.operators?.length || 0})` },
          { id: 'types', label: `Work Types (${config.workTypes?.length || 0})` },
          { id: 'areas', label: `Product Areas (${config.productAreas?.length || 0})` },
          { id: 'platforms', label: `Platforms (${config.platforms?.length || 0})` },
          { id: 'rules', label: `Smart Routing Rules (${routingRules.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2.5 font-medium transition-colors border-b-2 -mb-[1px] whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-400 bg-slate-900/40 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-5xl text-xs space-y-6 custom-scrollbar">
        {/* USERS & CREDENTIALS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Active Users &amp; Login Credentials</h3>
                <p className="text-slate-400 text-xs">
                  Manage user profiles, authentication passcodes, roles, assigned teams, and permissions.
                </p>
              </div>

              <button
                onClick={() => setIsAddUserOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <UserPlus size={14} />
                <span>+ Add User</span>
              </button>
            </div>

            <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-[#0d111a]">
              {users.map((u) => (
                <div key={u.id} className="p-3.5 flex items-center justify-between hover:bg-slate-900/50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-xs">{u.name}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400 text-[11px] font-mono">{u.email}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-blue-950/60 text-blue-300 border border-blue-800/60">
                        @{u.username || u.email.split('@')[0]}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>Team: <strong className="text-slate-300">{u.team}</strong></span>
                      <span>·</span>
                      <span>Areas: {u.productAreas?.join(', ') || 'All'}</span>
                      {u.twoFactorEnabled && (
                        <span className="text-emerald-400 font-mono text-[10px]">· 2FA Enabled</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-blue-300 border border-slate-700">
                      {u.role}
                    </span>
                    <button
                      onClick={() => setEditingUser(u)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-colors cursor-pointer"
                      title="Edit user details & credentials"
                    >
                      <Pencil size={12} />
                      <span>Edit User &amp; Credentials</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove team member "${u.name}"?`)) {
                          deleteUser(u.id);
                        }
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="Remove User"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OPERATORS TAB */}
        {activeTab === 'operators' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Bus &amp; Ship Operators Management</h3>
                <p className="text-slate-400 text-xs">
                  Operators appear dynamically in Raise Tickets, Worksheet filters, and Add Work forms.
                </p>
              </div>

              {/* Search */}
              <div className="relative min-w-[220px]">
                <input
                  type="text"
                  placeholder="Search operators..."
                  value={operatorSearch}
                  onChange={(e) => setOperatorSearch(e.target.value)}
                  className="w-full bg-[#121622] border border-white/[0.12] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
              </div>
            </div>

            {/* Add / Edit Operator Form */}
            {editingOperator ? (
              <form
                onSubmit={handleSaveOperatorEdit}
                className="p-4 bg-blue-950/20 border border-blue-500/40 rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between text-blue-300 font-bold">
                  <div className="flex items-center gap-2">
                    <Pencil size={14} />
                    <span>Edit Operator: {editingOperator.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingOperator(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1">Operator Name *</label>
                    <input
                      type="text"
                      value={editingOperator.name}
                      onChange={(e) =>
                        setEditingOperator({ ...editingOperator, name: e.target.value })
                      }
                      required
                      className="w-full bg-[#121622] border border-white/[0.12] rounded-lg p-2 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">Fleet Category</label>
                    <select
                      value={editingOperator.type}
                      onChange={(e) =>
                        setEditingOperator({
                          ...editingOperator,
                          type: e.target.value as any,
                        })
                      }
                      className="w-full bg-[#121622] border border-white/[0.12] rounded-lg p-2 text-white text-xs cursor-pointer"
                    >
                      <option value="Bus">Bus Fleet</option>
                      <option value="Ship">Ship Fleet</option>
                      <option value="Launch">Launch Fleet</option>
                      <option value="Air">Air Carrier</option>
                      <option value="Other">Other Operator</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">Contact Hotline</label>
                    <input
                      type="text"
                      value={editingOperator.contact || ''}
                      onChange={(e) =>
                        setEditingOperator({
                          ...editingOperator,
                          contact: e.target.value,
                        })
                      }
                      className="w-full bg-[#121622] border border-white/[0.12] rounded-lg p-2 text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditingOperator(null)}
                    className="px-3 py-1.5 text-slate-400 hover:text-white font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <Save size={13} />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={handleAddOperator}
                className="p-4 bg-[#0d111a] border border-white/[0.08] rounded-xl space-y-3"
              >
                <div className="flex items-center gap-2 text-slate-300 font-bold">
                  <Plus size={14} className="text-blue-400" />
                  <span>Register New Fleet / Transport Operator</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Operator Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Green Line Paribahan"
                      value={newOperatorName}
                      onChange={(e) => setNewOperatorName(e.target.value)}
                      required
                      className="w-full bg-[#121622] border border-white/[0.12] rounded-lg p-2 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Fleet Category</label>
                    <select
                      value={newOperatorType}
                      onChange={(e) => setNewOperatorType(e.target.value as any)}
                      className="w-full bg-[#121622] border border-white/[0.12] rounded-lg p-2 text-white text-xs cursor-pointer"
                    >
                      <option value="Bus">Bus Fleet</option>
                      <option value="Ship">Ship Fleet</option>
                      <option value="Launch">Launch Fleet</option>
                      <option value="Air">Air Carrier</option>
                      <option value="Other">Other Operator</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Contact Hotline (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. +880 1711-123456"
                      value={newOperatorContact}
                      onChange={(e) => setNewOperatorContact(e.target.value)}
                      className="w-full bg-[#121622] border border-white/[0.12] rounded-lg p-2 text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Save Operator</span>
                  </button>
                </div>
              </form>
            )}

            {/* Operators List with Edit & Delete */}
            <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-[#0d111a]">
              {filteredOperators.map((op) => (
                <div key={op.id} className="p-3.5 flex items-center justify-between hover:bg-slate-900/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/[0.04] text-slate-300 border border-white/[0.06]">
                      {op.type === 'Ship' || op.type === 'Launch' ? (
                        <Ship size={16} className="text-cyan-400" />
                      ) : (
                        <Bus size={16} className="text-amber-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100 text-xs">{op.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-white/[0.06] text-slate-300">
                          {op.type}
                        </span>
                      </div>
                      {op.contact && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5 font-mono">
                          <Phone size={10} className="text-slate-500" />
                          <span>{op.contact}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingOperator(op)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[11px] font-semibold transition-colors cursor-pointer"
                      title="Edit Operator"
                    >
                      <Pencil size={11} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove operator "${op.name}"?`)) {
                          deleteOperator(op.id);
                        }
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="Delete operator"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}

              {filteredOperators.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  No operators match your search. Add one above.
                </div>
              )}
            </div>
          </div>
        )}

        {/* WORK TYPES TAB */}
        {activeTab === 'types' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Configured Work Types</h3>
                <p className="text-slate-400 text-xs">
                  Active types appear in the Worksheet dropdown and board filters.
                </p>
              </div>

              <form onSubmit={handleAddWorkType} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New type (e.g. Spike)..."
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add Type</span>
                </button>
              </form>
            </div>

            <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-[#0d111a]">
              {config.workTypes.map((t, index) => (
                <div key={t.name} className="p-3.5 flex items-center justify-between hover:bg-slate-900/50 transition-colors">
                  {editingWorkTypeName === t.name ? (
                    <div className="flex items-center gap-2 flex-1 mr-4">
                      <input
                        type="text"
                        value={editWorkTypeInput}
                        onChange={(e) => setEditWorkTypeInput(e.target.value)}
                        className="bg-slate-950 border border-blue-500 rounded px-2.5 py-1 text-xs text-white flex-1 max-w-xs"
                      />
                      <button
                        onClick={() => handleSaveWorkTypeEdit(t.name)}
                        className="px-2.5 py-1 bg-blue-600 text-white rounded text-xs font-bold"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingWorkTypeName(null)}
                        className="px-2.5 py-1 text-slate-400 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <WorkTypeIcon type={t.name} size={16} />
                      <span className="font-semibold text-slate-200">{t.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Order: {t.order || index + 1}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingWorkTypeName(t.name);
                        setEditWorkTypeInput(t.name);
                      }}
                      className="p-1.5 text-slate-400 hover:text-blue-300 hover:bg-blue-950/30 rounded transition-colors"
                      title="Edit Work Type"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => {
                        const updated = config.workTypes.filter((wt) => wt.name !== t.name);
                        updateConfig({ workTypes: updated });
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="Deactivate / Remove"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRODUCT AREAS TAB */}
        {activeTab === 'areas' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Product Areas &amp; Verticals</h3>
                <p className="text-slate-400 text-xs">
                  Business verticals and product domains (e.g. Bus, Ship, Air, Hotel, Flash Deals).
                </p>
              </div>

              <form onSubmit={handleAddArea} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New area (e.g. Tours)..."
                  value={newAreaName}
                  onChange={(e) => setNewAreaName(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add Area</span>
                </button>
              </form>
            </div>

            <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-[#0d111a]">
              {config.productAreas.map((area) => (
                <div key={area} className="p-3.5 flex items-center justify-between hover:bg-slate-900/50 transition-colors">
                  {editingAreaName === area ? (
                    <div className="flex items-center gap-2 flex-1 mr-4">
                      <input
                        type="text"
                        value={editAreaInput}
                        onChange={(e) => setEditAreaInput(e.target.value)}
                        className="bg-slate-950 border border-blue-500 rounded px-2.5 py-1 text-xs text-white flex-1 max-w-xs"
                      />
                      <button
                        onClick={() => handleSaveAreaEdit(area)}
                        className="px-2.5 py-1 bg-blue-600 text-white rounded text-xs font-bold"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingAreaName(null)}
                        className="px-2.5 py-1 text-slate-400 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <span className="font-semibold text-slate-200">{area}</span>
                  )}

                  {area !== 'All' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingAreaName(area);
                          setEditAreaInput(area);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-300 hover:bg-blue-950/30 rounded transition-colors"
                        title="Edit Area"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => {
                          const updated = config.productAreas.filter((a) => a !== area);
                          updateConfig({ productAreas: updated });
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Remove Area"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PLATFORMS TAB */}
        {activeTab === 'platforms' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Target Platforms</h3>
                <p className="text-slate-400 text-xs">
                  Delivery targets and client applications (e.g. Web, Android, iOS, Counter, Agent).
                </p>
              </div>

              <form onSubmit={handleAddPlatform} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New platform..."
                  value={newPlatformName}
                  onChange={(e) => setNewPlatformName(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add Platform</span>
                </button>
              </form>
            </div>

            <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-[#0d111a]">
              {config.platforms.map((platform) => (
                <div key={platform} className="p-3.5 flex items-center justify-between hover:bg-slate-900/50 transition-colors">
                  {editingPlatformName === platform ? (
                    <div className="flex items-center gap-2 flex-1 mr-4">
                      <input
                        type="text"
                        value={editPlatformInput}
                        onChange={(e) => setEditPlatformInput(e.target.value)}
                        className="bg-slate-950 border border-blue-500 rounded px-2.5 py-1 text-xs text-white flex-1 max-w-xs"
                      />
                      <button
                        onClick={() => handleSavePlatformEdit(platform)}
                        className="px-2.5 py-1 bg-blue-600 text-white rounded text-xs font-bold"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingPlatformName(null)}
                        className="px-2.5 py-1 text-slate-400 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <span className="font-semibold text-slate-200">{platform}</span>
                  )}

                  {platform !== 'All' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingPlatformName(platform);
                          setEditPlatformInput(platform);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-300 hover:bg-blue-950/30 rounded transition-colors"
                        title="Edit Platform"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => {
                          const updated = config.platforms.filter((p) => p !== platform);
                          updateConfig({ platforms: updated });
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Remove Platform"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SMART ROUTING RULES TAB */}
        {activeTab === 'rules' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Smart Ticket &amp; Intake Routing Rules</h3>
                <p className="text-slate-400 text-xs">
                  Automatically route tickets and work items to appropriate teams based on conditions.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingRule(null);
                  setRuleName('');
                  setRuleArea('');
                  setRulePlatform('');
                  setRuleSource('');
                  setRulePriority('');
                  setRuleTeam('Backend Engineering');
                  setIsAddRuleOpen(!isAddRuleOpen);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus size={13} />
                <span>Add Rule</span>
              </button>
            </div>

            {isAddRuleOpen && (
              <form onSubmit={handleSaveRoutingRule} className="p-4 bg-[#0d111a] border border-slate-800 rounded-xl space-y-3">
                <div className="font-bold text-white text-xs">
                  {editingRule ? `Edit Routing Rule: ${editingRule.name}` : 'Create New Routing Rule'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Rule Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Route Bus Issues to Mobile Team"
                      value={ruleName}
                      onChange={(e) => setRuleName(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Target Team *</label>
                    <select
                      value={ruleTeam}
                      onChange={(e) => setRuleTeam(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white cursor-pointer"
                    >
                      {config.teams.map((tm) => (
                        <option key={tm.name} value={tm.name}>{tm.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Condition: Product Area</label>
                    <select
                      value={ruleArea}
                      onChange={(e) => setRuleArea(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white cursor-pointer"
                    >
                      <option value="">— Any Area —</option>
                      {config.productAreas.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Condition: Platform</label>
                    <select
                      value={rulePlatform}
                      onChange={(e) => setRulePlatform(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white cursor-pointer"
                    >
                      <option value="">— Any Platform —</option>
                      {config.platforms.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Condition: Priority</label>
                    <select
                      value={rulePriority}
                      onChange={(e) => setRulePriority(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white cursor-pointer"
                    >
                      <option value="">— Any Priority —</option>
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddRuleOpen(false);
                      setEditingRule(null);
                    }}
                    className="px-3 py-1.5 text-slate-400 hover:text-white cursor-pointer font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold cursor-pointer"
                  >
                    {editingRule ? 'Save Changes' : 'Save Rule'}
                  </button>
                </div>
              </form>
            )}

            <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-[#0d111a]">
              {routingRules.map((rule) => (
                <div key={rule.id} className="p-3.5 flex items-center justify-between hover:bg-slate-900/50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-amber-400 font-bold">{rule.id}</span>
                      <span className="font-semibold text-slate-200">{rule.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      IF:{' '}
                      {Object.entries(rule.conditions)
                        .filter(([_, v]) => Boolean(v))
                        .map(([k, v]) => `${k} = ${v}`)
                        .join(' AND ') || 'Default fallback'}{' '}
                      → <strong>THEN ROUTE TO: {rule.targetTeam}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1 mr-2">
                      <Check size={12} />
                      <span>ACTIVE</span>
                    </span>
                    <button
                      onClick={() => startEditRule(rule)}
                      className="p-1.5 text-slate-400 hover:text-blue-300 hover:bg-blue-950/30 rounded transition-colors"
                      title="Edit rule"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => deleteRoutingRule(rule.id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded hover:bg-rose-950/30 cursor-pointer"
                      title="Delete rule"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
    </div>
  );
};
