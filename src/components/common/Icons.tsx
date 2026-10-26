import React from 'react';
import {
  Table2,
  Sparkles,
  Bug,
  RefreshCw,
  TrendingUp,
  Cpu,
  Wrench,
  Zap,
  CheckCircle2,
  CheckSquare,
  AlertOctagon,
  Rocket,
  Headphones,
  GitBranch,
  Calendar,
  Layers,
  HelpCircle,
  FileCode,
  ShieldAlert,
  Clock,
  User,
  LayoutGrid,
  Kanban,
  GitFork,
  Check,
  X,
  Minus,
  LucideProps,
} from 'lucide-react';
import { WorkType, PriorityLevel, WorkStatus } from '../../types';

// Work Type Icon with distinctive punchy semantic color
export const WorkTypeIcon: React.FC<{
  type: WorkType | string;
  size?: number;
  className?: string;
}> = ({ type, size = 16, className = '' }) => {
  const norm = (type || '').toLowerCase();
  if (norm.includes('feature')) {
    return <Sparkles size={size} className={`text-purple-400 shrink-0 ${className}`} />;
  }
  if (norm.includes('bug')) {
    return <Bug size={size} className={`text-rose-500 shrink-0 ${className}`} />;
  }
  if (norm.includes('cr') || norm.includes('change')) {
    return <RefreshCw size={size} className={`text-orange-400 shrink-0 ${className}`} />;
  }
  if (norm.includes('improvement')) {
    return <TrendingUp size={size} className={`text-blue-400 shrink-0 ${className}`} />;
  }
  if (norm.includes('technical') || norm.includes('tech')) {
    return <Cpu size={size} className={`text-indigo-400 shrink-0 ${className}`} />;
  }
  if (norm.includes('operational') || norm.includes('ops')) {
    return <Wrench size={size} className={`text-amber-400 shrink-0 ${className}`} />;
  }
  return <Layers size={size} className={`text-slate-400 shrink-0 ${className}`} />;
};

// Priority Indicator
export const PriorityIcon: React.FC<{
  priority: PriorityLevel | string;
  size?: number;
  className?: string;
}> = ({ priority, size = 14, className = '' }) => {
  switch (priority) {
    case 'Critical':
      return <AlertOctagon size={size} className={`text-rose-500 shrink-0 ${className}`} />;
    case 'High':
      return <ShieldAlert size={size} className={`text-orange-400 shrink-0 ${className}`} />;
    case 'Medium':
      return <Clock size={size} className={`text-amber-400 shrink-0 ${className}`} />;
    case 'Low':
    default:
      return <Minus size={size} className={`text-emerald-400 shrink-0 ${className}`} />;
  }
};

// Status Indicator Icon with semantic colors
export const StatusIndicator: React.FC<{
  status: WorkStatus | string;
  size?: number;
  className?: string;
}> = ({ status, size = 14, className = '' }) => {
  switch (status) {
    case 'Released':
      return <Rocket size={size} className={`text-emerald-400 shrink-0 ${className}`} />;
    case 'Ready for Release':
      return <CheckCircle2 size={size} className={`text-emerald-400 shrink-0 ${className}`} />;
    case 'Ready for UAT':
    case 'In UAT':
      return <CheckSquare size={size} className={`text-teal-400 shrink-0 ${className}`} />;
    case 'UAT Failed':
      return <X size={size} className={`text-rose-500 shrink-0 ${className}`} />;
    case 'Ready for QA':
    case 'In QA':
      return <Zap size={size} className={`text-cyan-400 shrink-0 ${className}`} />;
    case 'QA Failed':
      return <AlertOctagon size={size} className={`text-rose-500 shrink-0 ${className}`} />;
    case 'In Development':
      return <FileCode size={size} className={`text-blue-400 shrink-0 ${className}`} />;
    case 'To Do':
    case 'Backlog':
    case 'Triage':
    case 'Intake':
    default:
      return <span className={`w-2 h-2 rounded-full bg-slate-500 shrink-0 ${className}`} />;
  }
};

// Nav icons with their vibrant semantic colors
export const NavIcons = {
  Dashboard: (props: LucideProps) => <LayoutGrid {...props} className="text-sky-400" />,
  Worksheet: (props: LucideProps) => <Table2 {...props} className="text-blue-400" />,
  QA: (props: LucideProps) => <Zap {...props} className="text-cyan-400" />,
  UAT: (props: LucideProps) => <CheckSquare {...props} className="text-teal-400" />,
  Releases: (props: LucideProps) => <Rocket {...props} className="text-indigo-400" />,
  Tickets: (props: LucideProps) => <Headphones {...props} className="text-amber-400" />,
  Diagram: (props: LucideProps) => <GitFork {...props} className="text-fuchsia-400" />,
  Team: (props: LucideProps) => <User {...props} className="text-emerald-400" />,
  Admin: (props: LucideProps) => <Wrench {...props} className="text-slate-400" />,
};
