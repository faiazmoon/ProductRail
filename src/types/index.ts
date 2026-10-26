export type WorkType = 'Feature' | 'Bug' | 'CR' | 'Improvement' | 'Technical' | 'Operational' | string;

export type WorkStatus =
  | 'Intake'
  | 'Triage'
  | 'Backlog'
  | 'To Do'
  | 'In Development'
  | 'Ready for QA'
  | 'In QA'
  | 'QA Failed'
  | 'Ready for UAT'
  | 'In UAT'
  | 'UAT Failed'
  | 'Ready for Release'
  | 'Released'
  | 'Cancelled'
  | 'Archived';

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type WorkSource =
  | 'Product'
  | 'Operations'
  | 'Call Center'
  | 'QA'
  | 'UAT'
  | 'Engineering'
  | 'Leadership'
  | 'Support'
  | 'Import'
  | 'System'
  | 'UAT Discovery';

export type UserRole =
  | 'Super Admin'
  | 'Workspace Admin'
  | 'Product Owner'
  | 'Project Manager'
  | 'Engineering Lead'
  | 'Developer'
  | 'Designer'
  | 'QA'
  | 'Business'
  | 'UAT'
  | 'Operations'
  | 'Call Center'
  | 'Leadership'
  | 'Viewer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  role: UserRole;
  team: string;
  productAreas: string[];
  avatar?: string;
  status: 'Active' | 'Invited' | 'Suspended';
  twoFactorEnabled?: boolean;
  projectIds?: string[];
}

export type ThemeMode = 'dark' | 'light';

export interface Project {
  id: string; // e.g. 'PRJ-101'
  key: string; // e.g. 'BUS'
  name: string; // e.g. 'Intercity Bus Ticketing'
  description?: string;
  leadId: string;
  leadName: string;
  leadRole: string;
  status: 'Active' | 'Planning' | 'Completed' | 'Archived';
  memberIds: string[]; // Team member user IDs formed into this project
  color?: string; // flat color code
  createdAt: string;
  updatedAt?: string;
}

export interface ProjectInvite {
  id: string;
  code: string;
  link: string;
  projectId: string;
  projectName: string;
  role: UserRole;
  inviterName: string;
  inviterRole: string;
  expiresAt: string;
  createdAt: string;
  status: 'Active' | 'Used' | 'Expired';
}

export interface QaTestCase {
  id: string;
  workId: string;
  scenario: string;
  expected: string;
  actual?: string;
  result: 'Pass' | 'Fail' | 'Blocked' | 'Untested';
  evidence?: string;
  tester?: string;
  linkedBugId?: string;
  testedAt?: string;
}

export interface UatAnnotation {
  id: string;
  x: number; // percentage (0-100) on screenshot
  y: number; // percentage (0-100) on screenshot
  comment: string;
  elementName?: string;
  author: string;
  createdAt: string;
  color?: string; // e.g. '#ef4444', '#f59e0b'
}

export interface UatTestCase {
  id: string;
  workId: string;
  scenario: string;
  expected: string;
  result: 'Pass' | 'Fail' | 'Pending';
  requiresAttention?: boolean;
  attentionReason?: string;
  screenshotUrl?: string;
  annotations?: UatAnnotation[];
  comment?: string;
  evidence?: string;
  reviewer?: string;
  linkedItemId?: string; // Bug or CR created on failure
  issues?: string[]; // Multiple specific issues identified per test case
  reviewedAt?: string;
}

export type ChatCapabilityTag =
  | 'decision'
  | 'scope_note'
  | 'code_pr'
  | 'tech_note'
  | 'blocker'
  | 'bug_report'
  | 'qa_verdict'
  | 'test_evidence'
  | 'uat_signoff'
  | 'customer_ref'
  | 'requirement'
  | 'general';

export interface CommentItem {
  id: string;
  author: string;
  role: string;
  content: string;
  createdAt: string;
  attachment?: string;
  mentions?: string[];
  tag?: ChatCapabilityTag;
  isPinned?: boolean;
}

export interface InAppNotification {
  id: string;
  recipientName: string;
  senderName: string;
  message: string;
  workId?: string;
  workTitle?: string;
  timestamp: string;
  read: boolean;
  type: 'mention' | 'assignment' | 'qa' | 'uat';
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details?: string;
  workId?: string;
  workTitle?: string;
}

export interface QaSignOff {
  tester: string;
  date: string;
  notes?: string;
  totalPassed: number;
}

export interface UatSignOff {
  reviewer: string;
  date: string;
  notes?: string;
  promotedToRelease?: boolean;
}

export interface WorkDates {
  plannedDevStart?: string;
  plannedDevEnd?: string;
  actualDevStart?: string;
  actualDevEnd?: string;
  plannedQaStart?: string;
  plannedQaEnd?: string;
  actualQaStart?: string;
  actualQaEnd?: string;
  plannedUatStart?: string;
  plannedUatEnd?: string;
  actualUatStart?: string;
  actualUatEnd?: string;
  plannedRelease?: string;
  actualRelease?: string;
}

// Sub-item or granular deliverable divided to developer(s) under a parent feature
export interface FeatureDeliverable {
  id: string;
  title: string;
  assignedDeveloper: string;
  status: 'To Do' | 'In Development' | 'Ready for QA' | 'In QA' | 'Ready for UAT' | 'Done';
  estimate?: string;
  qaPassed?: boolean;
  notes?: string;
}

// UAT Discovery logged during UAT test sessions
export interface UatDiscovery {
  id: string;
  featureId: string;
  title: string;
  type: 'Bug' | 'CR' | 'Improvement';
  discoveredBy: string;
  discoveredAt: string;
  description: string;
  severity: PriorityLevel;
  status: 'Logged' | 'Triaged' | 'In Progress' | 'Resolved';
  linkedWorkId?: string;
}

export interface WorkItem {
  id: string;
  title: string;
  type: WorkType;
  source: WorkSource;
  productArea: string[]; // Can be multiple or ['All'], e.g. ['Landing Page', 'Flash Deals']
  platform: string[]; // Can be multiple or ['All'], e.g. ['Android', 'iOS', 'Web']
  priority: PriorityLevel;
  status: WorkStatus;
  requesterName?: string;
  reporter: {
    name: string;
    role: string;
    email?: string;
  };
  owner?: {
    name: string;
    role: string;
    avatar?: string;
  };
  team: string;
  requirementDetails?: string;
  acceptanceCriteria?: string[];
  businessNotes?: string;
  designRequired: boolean;
  figmaUrl?: string;
  designTitle?: string;
  designStatus?: 'Draft' | 'Review' | 'Changes Requested' | 'Approved' | 'Dev Ready';
  sprintId?: string; // e.g. 'SP-24'
  projectId?: string; // e.g. 'PRJ-101'
  estimate?: string; // e.g. '5 pts', '3d'
  dependencies?: string[];
  relatedWorkIds?: {
    id: string;
    relation: 'Parent' | 'Bug' | 'CR' | 'Dependency' | 'Duplicate' | 'Related' | 'Failed QA Bug' | 'Originated From' | 'Sub-Item';
  }[];
  // Multi-item / deliverable division under feature
  isParentFeature?: boolean;
  parentFeatureId?: string;
  deliverables?: FeatureDeliverable[];
  uatDiscoveries?: UatDiscovery[];
  dates: WorkDates;
  qaCases?: QaTestCase[];
  uatCases?: UatTestCase[];
  qaSignOff?: QaSignOff;
  uatSignOff?: UatSignOff;
  comments?: CommentItem[];
  activity?: ActivityLog[];
  readiness?: 'Ready' | 'Needs Information';
  readinessDetails?: string[];
  createdAt: string;
  updatedAt: string;
  ticketMetadata?: {
    originalTicketId?: string;
    ticketSource?: string;
    customerImpact?: string;
    routedByRule?: string;
  };
  operatorName?: string; // Bus or Ship company / operator name (e.g. Hanif, Green Line, MV Modhumoti)
  isTicket?: boolean;
  originTicketId?: string;
  tags?: string[];
}

export interface OperatorItem {
  id: string;
  name: string;
  type: 'Bus' | 'Ship' | 'Launch' | 'Air' | 'Other';
  active?: boolean;
  contact?: string;
}

export interface SprintMilestones {
  devCutoffDate?: string;
  qaFreezeDate?: string;
  uatWindowStart?: string;
  uatWindowEnd?: string;
  releaseTargetDate?: string;
}

export interface Sprint {
  id: string; // 'SP-24'
  name: string; // 'Sprint 24'
  goal: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  workingDays?: number;
  capacityPoints?: number;
  status: 'Planning' | 'Active' | 'Completed' | 'Closed';
  committedWorkIds: string[];
  addedWorkIds: string[];
  team: string;
  milestones?: SprintMilestones;
}

export interface Release {
  id: string; // 'REL-2.14'
  name: string; // 'v2.14'
  targetDate: string;
  actualDate?: string;
  productArea: string[];
  platforms: string[];
  includedWorkIds: string[];
  knownIssues: string[];
  releaseNotes: string;
  owner: string;
  status: 'Planning' | 'Ready' | 'Released' | 'Partially Released' | 'Rolled Back' | 'Closed';
}

export interface RoutingRule {
  id: string;
  name: string;
  conditions: {
    productArea?: string;
    platform?: string;
    type?: string;
    source?: string;
    priority?: string;
  };
  targetTeam: string;
  targetOwner?: string;
  active: boolean;
}

export interface OperationalTicket {
  id: string; // e.g. 'TKT-1042'
  title: string;
  source: 'Operations' | 'Call Center';
  productArea: string[];
  platform: string[];
  type: 'Bug' | 'Operational' | 'CR' | 'Inquiry';
  priority: PriorityLevel;
  details: string;
  attachmentName?: string;
  attachmentUrl?: string;
  reporter: string;
  createdAt: string;
  status: 'Waiting for Triage' | 'Triaged' | 'In Delivery' | 'Resolved' | 'Rejected';
  routedTeam?: string;
  assignedOwner?: string;
  connectedWorkId?: string;
  resolutionNotes?: string;
  operatorName?: string; // e.g. Hanif Enterprise, Green Line, MV Modhumoti
}

export interface AppConfig {
  workTypes: { name: string; color: string; icon: string; active: boolean; order: number }[];
  productAreas: string[];
  platforms: string[];
  priorities: { name: PriorityLevel; color: string; order: number; active: boolean }[];
  teams: { name: string; lead: string; membersCount: number; areas: string[] }[];
  operators: OperatorItem[];
}

export type ViewMode = 'board' | 'grid' | 'timeline' | 'diagram';
export type SavedViewTab =
  | 'all'
  | 'new-works'
  | 'developer'
  | 'my-work'
  | 'backlog'
  | 'sprints'
  | 'current-sprint'
  | 'bugs'
  | 'cr'
  | 'uat-ready'
  | 'done'
  | string;
