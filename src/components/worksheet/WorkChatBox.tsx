import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageSquare,
  Pin,
  Shield,
  Code,
  Bug,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Send,
  Trash2,
  Info,
  X,
  Tag,
  Check,
  Sparkles,
  Layers,
  Lock,
  Link,
  ChevronRight,
} from 'lucide-react';
import { CommentItem, ChatCapabilityTag, UserRole } from '../../types';

interface WorkChatBoxProps {
  workId: string;
  comments: CommentItem[];
  onAddComment: (comment: CommentItem) => void;
  onDeleteComment?: (commentId: string) => void;
  onTogglePin?: (commentId: string) => void;
}

export const WorkChatBox: React.FC<WorkChatBoxProps> = ({
  workId,
  comments = [],
  onAddComment,
  onDeleteComment,
  onTogglePin,
}) => {
  const { currentUser, currentRole, users, sendNotification, workItems } = useApp();

  const [commentText, setCommentText] = useState('');
  const [selectedTag, setSelectedTag] = useState<ChatCapabilityTag>('general');
  const [activeFilter, setActiveFilter] = useState<'all' | 'decision' | 'tech_note' | 'qa' | 'uat'>('all');
  const [isCapabilitiesModalOpen, setIsCapabilitiesModalOpen] = useState(false);
  const [showMentionHelper, setShowMentionHelper] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Determine current user role privileges
  const isSuperAdmin = currentRole === 'Super Admin';
  const isPM = currentRole === 'Project Manager' || currentRole === 'Product Owner';
  const isDeveloper = currentRole === 'Developer' || currentRole === 'Engineering Lead';
  const isQA = currentRole === 'QA';
  const isBusinessOrOps =
    currentRole === 'Business' ||
    currentRole === 'UAT' ||
    currentRole === 'Operations' ||
    currentRole === 'Call Center';
  const isViewer = currentRole === 'Viewer';

  const canPin = isSuperAdmin || isPM;
  const canModerate = isSuperAdmin || isPM;

  // Role capability quick actions tailored to active role
  const getRoleQuickActions = () => {
    if (isSuperAdmin || isPM) {
      return [
        {
          tag: 'decision' as ChatCapabilityTag,
          label: 'Decision',
          icon: Shield,
          color: 'text-[#007AFF]',
          bg: 'bg-[#007AFF]/15',
          border: 'border-[#007AFF]/30',
          template: '[DECISION] PO Verdict: ',
        },
        {
          tag: 'scope_note' as ChatCapabilityTag,
          label: 'Scope Note',
          icon: FileText,
          color: 'text-[#5856D6]',
          bg: 'bg-[#5856D6]/15',
          border: 'border-[#5856D6]/30',
          template: '[SCOPE] Sprint & roadmap priority note: ',
        },
      ];
    }
    if (isDeveloper) {
      return [
        {
          tag: 'tech_note' as ChatCapabilityTag,
          label: 'Tech Note',
          icon: Code,
          color: 'text-[#34C759]',
          bg: 'bg-[#34C759]/15',
          border: 'border-[#34C759]/30',
          template: '[TECH NOTE] Architecture & schema details: ',
        },
        {
          tag: 'code_pr' as ChatCapabilityTag,
          label: 'Code / PR',
          icon: Link,
          color: 'text-[#007AFF]',
          bg: 'bg-[#007AFF]/15',
          border: 'border-[#007AFF]/30',
          template: '[CODE/PR] Pull request branch & commit: ',
        },
        {
          tag: 'blocker' as ChatCapabilityTag,
          label: 'Blocker',
          icon: AlertTriangle,
          color: 'text-[#FF3B30]',
          bg: 'bg-[#FF3B30]/15',
          border: 'border-[#FF3B30]/30',
          template: '[BLOCKER] Dependency blocking development: ',
        },
      ];
    }
    if (isQA) {
      return [
        {
          tag: 'bug_report' as ChatCapabilityTag,
          label: 'Defect Report',
          icon: Bug,
          color: 'text-[#FF3B30]',
          bg: 'bg-[#FF3B30]/15',
          border: 'border-[#FF3B30]/30',
          template: '[BUG REPORT] Reproduction steps & observation: ',
        },
        {
          tag: 'qa_verdict' as ChatCapabilityTag,
          label: 'QA Verdict',
          icon: CheckCircle2,
          color: 'text-[#34C759]',
          bg: 'bg-[#34C759]/15',
          border: 'border-[#34C759]/30',
          template: '[QA VERDICT] Test verification executed: Pass/Fail - ',
        },
        {
          tag: 'test_evidence' as ChatCapabilityTag,
          label: 'Test Evidence',
          icon: FileText,
          color: 'text-[#FF9500]',
          bg: 'bg-[#FF9500]/15',
          border: 'border-[#FF9500]/30',
          template: '[TEST EVIDENCE] Log snapshot / scenario output: ',
        },
      ];
    }
    if (isBusinessOrOps) {
      return [
        {
          tag: 'uat_signoff' as ChatCapabilityTag,
          label: 'UAT Sign-off',
          icon: CheckCircle2,
          color: 'text-[#34C759]',
          bg: 'bg-[#34C759]/15',
          border: 'border-[#34C759]/30',
          template: '[UAT SIGN-OFF] Business acceptance recommendation: ',
        },
        {
          tag: 'customer_ref' as ChatCapabilityTag,
          label: 'Customer Ref',
          icon: Tag,
          color: 'text-[#FF9500]',
          bg: 'bg-[#FF9500]/15',
          border: 'border-[#FF9500]/30',
          template: '[CUSTOMER TICKET] Call Center incident reference #',
        },
        {
          tag: 'requirement' as ChatCapabilityTag,
          label: 'Requirement',
          icon: FileText,
          color: 'text-[#007AFF]',
          bg: 'bg-[#007AFF]/15',
          border: 'border-[#007AFF]/30',
          template: '[REQUIREMENT] Workflow business clarification: ',
        },
      ];
    }
    return [];
  };

  const handleSelectQuickAction = (action: {
    tag: ChatCapabilityTag;
    template: string;
  }) => {
    setSelectedTag(action.tag);
    if (!commentText.trim()) {
      setCommentText(action.template);
    } else if (!commentText.startsWith('[') && action.template) {
      setCommentText(`${action.template}${commentText}`);
    }
    textareaRef.current?.focus();
  };

  const handleMentionInsert = (userName: string) => {
    setCommentText((prev) => `${prev} @${userName} `);
    setShowMentionHelper(false);
    textareaRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isViewer) return;

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    // Parse mentions
    const mentionedUsers = users.filter((u) => commentText.includes(`@${u.name}`));
    const mentionedNames = mentionedUsers.map((u) => u.name);

    // Send notifications
    const targetItem = workItems.find((w) => w.id === workId);
    mentionedUsers.forEach((u) => {
      sendNotification({
        recipientName: u.name,
        senderName: currentUser.name,
        message: `${currentUser.name} (${currentRole}) mentioned you in ${workId}: "${commentText.trim()}"`,
        workId,
        workTitle: targetItem?.title || workId,
        type: 'mention',
      });
    });

    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      author: currentUser.name,
      role: currentRole,
      content: commentText.trim(),
      createdAt: now,
      mentions: mentionedNames,
      tag: selectedTag,
      isPinned: false,
    };

    onAddComment(newComment);
    setCommentText('');
    setSelectedTag('general');
  };

  // Helper for tag badge
  const renderTagBadge = (tag?: ChatCapabilityTag) => {
    if (!tag || tag === 'general') return null;

    switch (tag) {
      case 'decision':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#007AFF]/20 text-[#007AFF] border border-[#007AFF]/30">
            <Shield size={10} />
            <span>DECISION</span>
          </span>
        );
      case 'scope_note':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#5856D6]/20 text-[#5856D6] border border-[#5856D6]/30">
            <FileText size={10} />
            <span>SCOPE</span>
          </span>
        );
      case 'tech_note':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#34C759]/20 text-[#34C759] border border-[#34C759]/30">
            <Code size={10} />
            <span>TECH NOTE</span>
          </span>
        );
      case 'code_pr':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#007AFF]/20 text-[#007AFF] border border-[#007AFF]/30">
            <Link size={10} />
            <span>CODE / PR</span>
          </span>
        );
      case 'blocker':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/30">
            <AlertTriangle size={10} />
            <span>BLOCKER</span>
          </span>
        );
      case 'bug_report':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/30">
            <Bug size={10} />
            <span>BUG REPORT</span>
          </span>
        );
      case 'qa_verdict':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#34C759]/20 text-[#34C759] border border-[#34C759]/30">
            <CheckCircle2 size={10} />
            <span>QA VERDICT</span>
          </span>
        );
      case 'test_evidence':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9500]/20 text-[#FF9500] border border-[#FF9500]/30">
            <FileText size={10} />
            <span>TEST EVIDENCE</span>
          </span>
        );
      case 'uat_signoff':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#34C759]/20 text-[#34C759] border border-[#34C759]/30">
            <CheckCircle2 size={10} />
            <span>UAT SIGN-OFF</span>
          </span>
        );
      case 'customer_ref':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9500]/20 text-[#FF9500] border border-[#FF9500]/30">
            <Tag size={10} />
            <span>CUSTOMER REF</span>
          </span>
        );
      case 'requirement':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#007AFF]/20 text-[#007AFF] border border-[#007AFF]/30">
            <FileText size={10} />
            <span>REQUIREMENT</span>
          </span>
        );
      default:
        return null;
    }
  };

  // Filtered comments
  const filteredComments = comments.filter((c) => {
    if (activeFilter === 'decision') return c.tag === 'decision' || c.tag === 'scope_note';
    if (activeFilter === 'tech_note') return c.tag === 'tech_note' || c.tag === 'code_pr' || c.tag === 'blocker';
    if (activeFilter === 'qa') return c.tag === 'bug_report' || c.tag === 'qa_verdict' || c.tag === 'test_evidence';
    if (activeFilter === 'uat') return c.tag === 'uat_signoff' || c.tag === 'customer_ref' || c.tag === 'requirement';
    return true;
  });

  const pinnedComments = comments.filter((c) => c.isPinned);
  const quickActions = getRoleQuickActions();

  return (
    <div className="flex flex-col h-full space-y-3 font-sans select-none">
      {/* Top Header & Role Capabilities trigger */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#007AFF]/15 text-[#007AFF] flex items-center justify-center">
            <MessageSquare size={13} />
          </div>
          <span className="text-xs font-bold text-white">Discussions</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.06] text-slate-300">
            {comments.length}
          </span>
        </div>

        {/* Role Capabilities Guide Trigger */}
        <button
          type="button"
          onClick={() => setIsCapabilitiesModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-[11px] font-semibold transition-colors cursor-pointer"
          title="View role-wise chat capabilities"
        >
          <Shield size={12} className="text-[#007AFF]" />
          <span>Role Capabilities</span>
          <Info size={11} className="text-slate-400" />
        </button>
      </div>

      {/* iOS Segmented Filter Controls */}
      <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none text-[11px]">
        {[
          { id: 'all', label: 'All' },
          { id: 'decision', label: 'Decisions' },
          { id: 'tech_note', label: 'Tech Notes' },
          { id: 'qa', label: 'QA & Bugs' },
          { id: 'uat', label: 'UAT Sign-offs' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActiveFilter(f.id as any)}
            className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === f.id
                ? 'bg-[#007AFF] text-white shadow-sm'
                : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 border border-white/[0.06]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Pinned Messages Banner (if any) */}
      {pinnedComments.length > 0 && activeFilter === 'all' && (
        <div className="space-y-1.5 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
            <Pin size={11} className="rotate-45" />
            <span>Pinned Management Decisions ({pinnedComments.length})</span>
          </div>
          <div className="space-y-1">
            {pinnedComments.map((pc) => (
              <div
                key={pc.id}
                className="p-2 rounded-xl bg-black/40 border border-amber-500/20 text-xs text-slate-200 flex items-start justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="text-[10px] text-amber-300 font-bold flex items-center gap-1.5">
                    <span>{pc.author} ({pc.role})</span>
                    <span>· {pc.createdAt.slice(5, 16)}</span>
                  </div>
                  <p className="leading-snug">{pc.content}</p>
                </div>
                {canPin && onTogglePin && (
                  <button
                    type="button"
                    onClick={() => onTogglePin(pc.id)}
                    className="p-1 text-slate-400 hover:text-rose-400 text-[10px]"
                    title="Unpin message"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[140px] max-h-[380px]">
        {filteredComments.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            <MessageSquare size={20} className="mx-auto mb-2 opacity-40 text-slate-400" />
            <p>No messages matching this filter.</p>
            <p className="text-[10px] text-slate-600 mt-0.5">
              Select an action pill below to post with role attribution.
            </p>
          </div>
        ) : (
          filteredComments.map((c) => {
            const isAuthor = c.author === currentUser.name;
            const canDelete = isAuthor || canModerate;
            const isDecision = c.tag === 'decision';

            return (
              <div
                key={c.id}
                className={`p-3 rounded-2xl border transition-all text-xs space-y-1.5 ${
                  isDecision
                    ? 'bg-[#007AFF]/10 border-[#007AFF]/30'
                    : c.isPinned
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-[#121622]/80 border-white/[0.06] hover:border-white/[0.12]'
                }`}
              >
                {/* Header: Author, Role Badge, Tag Badge, Timestamp & Actions */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-white text-[11px]">{c.author}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-white/[0.08] text-slate-300">
                      {c.role}
                    </span>
                    {renderTagBadge(c.tag)}
                  </div>

                  <div className="flex items-center gap-1 shrink-0 text-slate-500 text-[10px]">
                    <span className="font-mono">{c.createdAt.slice(5, 16)}</span>

                    {/* Pin button (Super Admin & PM only) */}
                    {canPin && onTogglePin && (
                      <button
                        type="button"
                        onClick={() => onTogglePin(c.id)}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          c.isPinned
                            ? 'text-amber-400 bg-amber-500/15'
                            : 'hover:text-amber-300 text-slate-500'
                        }`}
                        title={c.isPinned ? 'Unpin message' : 'Pin message for team'}
                      >
                        <Pin size={11} className={c.isPinned ? 'fill-current' : ''} />
                      </button>
                    )}

                    {/* Delete button (Author or PM/Admin) */}
                    {canDelete && onDeleteComment && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Delete this message?')) {
                            onDeleteComment(c.id);
                          }
                        }}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Delete message"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <p className="text-slate-200 leading-relaxed break-words whitespace-pre-wrap select-text">
                  {c.content}
                </p>

                {/* Mentions Pill */}
                {c.mentions && c.mentions.length > 0 && (
                  <div className="flex items-center gap-1 pt-0.5 flex-wrap">
                    <span className="text-[9px] text-slate-500">Notified:</span>
                    {c.mentions.map((m) => (
                      <span
                        key={m}
                        className="text-[9px] font-semibold text-[#007AFF] bg-[#007AFF]/15 px-1.5 py-0.2 rounded"
                      >
                        @{m}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Role-Specific Capabilities Bar & Input Form */}
      {isViewer ? (
        <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <Lock size={13} className="text-slate-500" />
          <span>Viewer Role: Read-only access to task discussions.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="pt-2 border-t border-white/[0.08] space-y-2">
          {/* Active Role Capability Quick Actions Bar */}
          <div className="flex items-center justify-between gap-1 flex-wrap text-[11px]">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400 font-semibold">
                {currentRole} Actions:
              </span>
              {quickActions.map((qa) => {
                const Icon = qa.icon;
                const isCurrentTag = selectedTag === qa.tag;
                return (
                  <button
                    key={qa.tag}
                    type="button"
                    onClick={() => handleSelectQuickAction(qa)}
                    className={`flex items-center gap-1 px-2 py-0.8 rounded-xl font-bold transition-all cursor-pointer ${
                      isCurrentTag
                        ? `${qa.bg} ${qa.color} border ${qa.border}`
                        : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.06]'
                    }`}
                  >
                    <Icon size={11} className={qa.color} />
                    <span>+{qa.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Mention trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMentionHelper(!showMentionHelper)}
                className="text-[10px] font-bold text-[#007AFF] hover:underline cursor-pointer"
              >
                @Mention
              </button>

              {/* Mention popover */}
              {showMentionHelper && (
                <div className="absolute right-0 bottom-full mb-1 w-44 bg-[#0E121A] border border-white/[0.12] rounded-2xl shadow-xl p-1 z-30 max-h-40 overflow-y-auto space-y-0.5">
                  <div className="px-2 py-1 text-[9px] font-bold text-slate-500 uppercase">
                    Notify Team Member
                  </div>
                  {users.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleMentionInsert(u.name)}
                      className="w-full text-left px-2 py-1 rounded-lg hover:bg-white/[0.06] text-[11px] text-slate-200 flex items-center justify-between"
                    >
                      <span className="truncate">{u.name}</span>
                      <span className="text-[9px] text-slate-400">{u.role}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Tag Indicator */}
          {selectedTag !== 'general' && (
            <div className="flex items-center justify-between px-2.5 py-1 bg-[#121622] rounded-xl border border-white/[0.08] text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Attached Tag:</span>
                {renderTagBadge(selectedTag)}
              </div>
              <button
                type="button"
                onClick={() => setSelectedTag('general')}
                className="text-slate-400 hover:text-white"
              >
                <X size={11} />
              </button>
            </div>
          )}

          {/* Input Textarea & Send button */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={`Write an update as ${currentUser.name} (${currentRole})... use @name to notify.`}
              rows={2}
              className="w-full bg-[#121622] border border-white/[0.1] rounded-2xl p-3 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#007AFF] resize-none leading-relaxed"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="absolute right-2.5 bottom-3.5 p-1.5 rounded-xl bg-[#007AFF] hover:bg-[#0066D6] text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer shadow-md"
              title="Send message"
            >
              <Send size={13} />
            </button>
          </div>
        </form>
      )}

      {/* =========================================================================
          Role Capabilities in Chat Specification Modal
          ========================================================================= */}
      {isCapabilitiesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-[#0E121A] border border-white/[0.12] rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-2xl bg-[#007AFF]/15 text-[#007AFF] flex items-center justify-center font-bold">
                  <Shield size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Role-Wise Capabilities in Chat
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Defined permissions, actions, and tags per organization role
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCapabilitiesModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Matrix of Role Capabilities */}
            <div className="space-y-3 text-xs">
              {/* 1. Super Admin & Project Manager / Product Owner */}
              <div className="p-3.5 rounded-2xl bg-[#121622] border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#007AFF]" />
                    <span className="font-bold text-white text-xs">
                      Super Admin, Project Manager &amp; Product Owner
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#007AFF] bg-[#007AFF]/15 px-2 py-0.5 rounded-full">
                    Full Authority
                  </span>
                </div>
                <ul className="text-slate-300 text-[11px] space-y-1 list-disc list-inside">
                  <li>
                    <strong>Official Decision:</strong> Post binding management verdicts tagged{' '}
                    <span className="text-[#007AFF] font-bold">[DECISION]</span>.
                  </li>
                  <li>
                    <strong>Scope &amp; Priority Guidance:</strong> Define sprint allocations, timeline changes, and roadmaps.
                  </li>
                  <li>
                    <strong>Pin Critical Directives:</strong> Pin vital messages to top of chat box for the entire team.
                  </li>
                  <li>
                    <strong>Moderation:</strong> Can delete or remove any outdated or incorrect comment.
                  </li>
                  <li>
                    <strong>Team Mentions:</strong> Mention any colleague with instant in-app alerts.
                  </li>
                </ul>
              </div>

              {/* 2. Developer / Engineering Lead */}
              <div className="p-3.5 rounded-2xl bg-[#121622] border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#34C759]" />
                    <span className="font-bold text-white text-xs">
                      Developer &amp; Engineering Lead
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#34C759] bg-[#34C759]/15 px-2 py-0.5 rounded-full">
                    Technical Scope
                  </span>
                </div>
                <ul className="text-slate-300 text-[11px] space-y-1 list-disc list-inside">
                  <li>
                    <strong>Tech Notes:</strong> Post implementation architecture, database schema changes, and API contracts.
                  </li>
                  <li>
                    <strong>Code &amp; PR Links:</strong> Attach commit SHAs, git branches, and pull request links.
                  </li>
                  <li>
                    <strong>Flag Blockers:</strong> Post technical dependencies blocking progress tagged{' '}
                    <span className="text-[#FF3B30] font-bold">[BLOCKER]</span>.
                  </li>
                  <li>
                    <strong>Self Moderation:</strong> Can edit and delete own authored comments.
                  </li>
                </ul>
              </div>

              {/* 3. QA Specialist */}
              <div className="p-3.5 rounded-2xl bg-[#121622] border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF9500]" />
                    <span className="font-bold text-white text-xs">QA Specialist</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#FF9500] bg-[#FF9500]/15 px-2 py-0.5 rounded-full">
                    Quality Verification
                  </span>
                </div>
                <ul className="text-slate-300 text-[11px] space-y-1 list-disc list-inside">
                  <li>
                    <strong>Defect &amp; Regression Reports:</strong> Log reproduction steps and defect summaries tagged{' '}
                    <span className="text-[#FF3B30] font-bold">[BUG REPORT]</span>.
                  </li>
                  <li>
                    <strong>QA Verdicts:</strong> Post official test execution passes/failures tagged{' '}
                    <span className="text-[#34C759] font-bold">[QA VERDICT]</span>.
                  </li>
                  <li>
                    <strong>Test Evidence:</strong> Attach telemetry logs, traces, and environment parameters.
                  </li>
                </ul>
              </div>

              {/* 4. Business, UAT, Operations & Call Center */}
              <div className="p-3.5 rounded-2xl bg-[#121622] border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#AF52DE]" />
                    <span className="font-bold text-white text-xs">
                      Business, UAT, Operations &amp; Call Center
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#AF52DE] bg-[#AF52DE]/15 px-2 py-0.5 rounded-full">
                    Intake &amp; Sign-off
                  </span>
                </div>
                <ul className="text-slate-300 text-[11px] space-y-1 list-disc list-inside">
                  <li>
                    <strong>Status Control:</strong> Cannot change work item statuses directly. Status progressions are governed exclusively by engineering delivery and UAT test outcomes.
                  </li>
                  <li>
                    <strong>Add Work &amp; Scenarios:</strong> Can create new work items (Features, Bugs, CRs), log intake tickets, and add UAT test cases.
                  </li>
                  <li>
                    <strong>UAT Acceptance Execution:</strong> Primary authority to execute UAT scenarios (Accept / Report Defect), annotate UI screens, and trigger linked defect resolution.
                  </li>
                  <li>
                    <strong>Customer Ticket Link:</strong> Reference real passenger incident reports and operational impacts.
                  </li>
                </ul>
              </div>

              {/* 5. Viewer */}
              <div className="p-3.5 rounded-2xl bg-[#121622] border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                    <span className="font-bold text-white text-xs">Viewer</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-white/[0.06] px-2 py-0.5 rounded-full">
                    Read-Only
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Can observe and review all discussion threads and pinned directives without write or deletion capabilities.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Active Role: <strong className="text-white">{currentRole}</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsCapabilitiesModalOpen(false)}
                className="px-4 py-2 bg-[#007AFF] hover:bg-[#0066D6] text-white font-bold rounded-xl text-xs transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
