import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  WorkItem,
  Sprint,
  Release,
  RoutingRule,
  OperationalTicket,
  UserProfile,
  AppConfig,
  UserRole,
  FeatureDeliverable,
  UatDiscovery,
  UatAnnotation,
  SprintMilestones,
  ActivityLog,
  InAppNotification,
  OperatorItem,
  QaTestCase,
  UatTestCase,
  QaSignOff,
  UatSignOff,
  Project,
  ProjectInvite,
  ThemeMode,
} from '../types';
import {
  initialWorkItems,
  initialSprints,
  initialReleases,
  initialTickets,
  initialRoutingRules,
  initialUsers,
  initialConfig,
  initialProjects,
} from '../data/mockData';

interface AppContextType {
  workItems: WorkItem[];
  sprints: Sprint[];
  releases: Release[];
  tickets: OperationalTicket[];
  routingRules: RoutingRule[];
  users: UserProfile[];
  projects: Project[];
  selectedProjectId: string | 'all';
  setSelectedProjectId: (id: string | 'all') => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addMemberToProject: (projectId: string, userId: string) => void;
  removeMemberFromProject: (projectId: string, userId: string) => void;
  invites: ProjectInvite[];
  createProjectInvite: (projectId: string, role: UserRole, expiresInDays?: number) => ProjectInvite;
  acceptProjectInvite: (code: string, userName: string, userEmail: string) => boolean;
  isInviteModalOpen: boolean;
  setIsInviteModalOpen: (open: boolean) => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  canManageProjects: boolean;
  canDeleteProjects: boolean;
  canAddUser: boolean;
  canRemoveUser: (target: UserProfile) => boolean;
  config: AppConfig;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedWorkId: string | null;
  setSelectedWorkId: (id: string | null) => void;
  isInspectorOpen: boolean;
  setIsInspectorOpen: (open: boolean) => void;
  detailModalWorkId: string | null;
  setDetailModalWorkId: (id: string | null) => void;
  lastSavedText: string | null;

  // Work item actions
  addWorkItem: (item: Partial<WorkItem>) => WorkItem;
  updateWorkItem: (id: string, updates: Partial<WorkItem>) => void;
  deleteWorkItem: (id: string) => void;
  archiveWorkItem: (id: string) => void;
  unarchiveWorkItem: (id: string) => void;
  bulkUpdateWorkItems: (ids: string[], updates: Partial<WorkItem>) => void;

  // Deliverables (Dividing features to developers & tracking QA / UAT readiness)
  addDeliverable: (
    workId: string,
    deliverable: Omit<FeatureDeliverable, 'id'>
  ) => void;
  updateDeliverableStatus: (
    workId: string,
    deliverableId: string,
    status: FeatureDeliverable['status'],
    notes?: string
  ) => void;

  // UAT Discoveries & Session
  logUatDiscovery: (
    featureId: string,
    discovery: Omit<UatDiscovery, 'id' | 'discoveredAt' | 'discoveredBy' | 'status' | 'featureId'>
  ) => UatDiscovery;
  isUatModeActive: boolean;
  setIsUatModeActive: (active: boolean) => void;

  // QA & UAT test case actions
  updateQaCaseResult: (
    workId: string,
    caseId: string,
    result: 'Pass' | 'Fail' | 'Blocked' | 'Untested',
    evidence?: string,
    actual?: string
  ) => void;
  addQaTestCasesBulk: (
    workId: string,
    cases: { scenario: string; expected: string }[]
  ) => void;
  deleteQaTestCase: (workId: string, caseId: string) => void;
  updateQaTestCase: (
    workId: string,
    caseId: string,
    updates: Partial<QaTestCase>
  ) => void;
  createBugFromQaFail: (
    workId: string,
    caseId: string,
    customTitle?: string,
    customDescription?: string
  ) => WorkItem;
  promoteQaToUat: (
    workId: string,
    options?: {
      selectedCaseIds?: string[];
      signOffNotes?: string;
      markReadyForUat?: boolean;
    }
  ) => void;
  updateUatCaseResult: (
    workId: string,
    caseId: string,
    result: 'Pass' | 'Fail' | 'Pending',
    comment?: string,
    evidence?: string
  ) => void;
  addUatTestCasesBulk: (
    workId: string,
    cases: { scenario: string; expected: string }[]
  ) => void;
  deleteUatTestCase: (workId: string, caseId: string) => void;
  updateUatTestCase: (
    workId: string,
    caseId: string,
    updates: Partial<UatTestCase>
  ) => void;
  toggleUatCaseAttention: (
    workId: string,
    caseId: string,
    requiresAttention: boolean,
    reason?: string
  ) => void;
  updateUatCaseAnnotations: (
    workId: string,
    caseId: string,
    annotations: UatAnnotation[],
    screenshotUrl?: string
  ) => void;
  createItemFromUatFail: (
    workId: string,
    caseId: string,
    type: 'Bug' | 'CR',
    title: string,
    details?: string
  ) => WorkItem;
  promoteUatToRelease: (workId: string) => void;

  // Sprint actions & Milestones
  createSprint: (sprint: Partial<Sprint>) => void;
  updateSprint: (sprintId: string, updates: Partial<Sprint>) => void;
  deleteSprint: (sprintId: string) => void;
  updateSprintMilestones: (
    sprintId: string,
    milestones: Partial<SprintMilestones>
  ) => void;
  closeSprint: (
    sprintId: string,
    actionForUnfinished: 'backlog' | 'next-sprint' | 'cancel',
    nextSprintId?: string
  ) => void;

  // Release actions
  createRelease: (release: Partial<Release>) => void;
  updateRelease: (releaseId: string, updates: Partial<Release>) => void;
  deleteRelease: (releaseId: string) => void;
  markReleaseShipped: (releaseId: string) => void;

  // Ticketing actions
  raiseTicket: (
    ticket: Omit<OperationalTicket, 'id' | 'createdAt' | 'status'>
  ) => OperationalTicket;
  deleteTicket: (ticketId: string) => void;
  triageTicket: (
    ticketId: string,
    action: 'convertToWork' | 'reject' | 'resolve',
    overrides?: Partial<WorkItem>
  ) => WorkItem | undefined;

  // Global Activity & Logs
  globalActivity: ActivityLog[];

  // Admin & Config
  updateConfig: (newConfig: Partial<AppConfig>) => void;
  addOperator: (operator: Omit<OperatorItem, 'id'>) => OperatorItem;
  deleteOperator: (id: string) => void;
  updateOperator: (id: string, updates: Partial<OperatorItem>) => void;
  addRoutingRule: (rule: Omit<RoutingRule, 'id'>) => void;
  updateRoutingRule: (id: string, updates: Partial<RoutingRule>) => void;
  deleteRoutingRule: (id: string) => void;

  // Global search & command palette
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  quickSearchQuery: string;
  setQuickSearchQuery: (q: string) => void;

  // User Management & Authentication
  addUser: (user: Omit<UserProfile, 'id'>) => UserProfile;
  updateUser: (userId: string, updates: Partial<UserProfile>) => void;
  deleteUser: (userId: string) => void;
  isLoggedIn: boolean;
  login: (emailOrUser: string, password?: string) => boolean;
  logout: () => void;
  setCurrentUser: (user: UserProfile) => void;

  // In-App Notifications
  notifications: InAppNotification[];
  sendNotification: (notification: Omit<InAppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Import / Export
  importWorkItems: (newItems: WorkItem[]) => void;
  navigateToWork: (id: string, tab?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workItems, setWorkItems] = useState<WorkItem[]>(() => {
    const saved = localStorage.getItem('pr_work_items_v2');
    if (saved) {
      try {
        const parsed: WorkItem[] = JSON.parse(saved);
        return parsed.map((item, idx) => ({
          ...item,
          projectId:
            item.projectId ||
            (item.productArea?.includes('Ship')
              ? 'PRJ-104'
              : item.productArea?.includes('Checkout')
              ? 'PRJ-103'
              : idx % 3 === 0
              ? 'PRJ-102'
              : 'PRJ-101'),
        }));
      } catch (e) {
        return initialWorkItems;
      }
    }
    return initialWorkItems;
  });

  const [sprints, setSprints] = useState<Sprint[]>(() => {
    const saved = localStorage.getItem('pr_sprints_v2');
    return saved ? JSON.parse(saved) : initialSprints;
  });

  const [releases, setReleases] = useState<Release[]>(() => {
    const saved = localStorage.getItem('pr_releases_v2');
    return saved ? JSON.parse(saved) : initialReleases;
  });

  const [tickets, setTickets] = useState<OperationalTicket[]>(() => {
    const saved = localStorage.getItem('pr_tickets_v2');
    return saved ? JSON.parse(saved) : initialTickets;
  });

  const [routingRules, setRoutingRules] = useState<RoutingRule[]>(() => {
    const saved = localStorage.getItem('pr_rules_v2');
    return saved ? JSON.parse(saved) : initialRoutingRules;
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('pr_users_v2');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    const saved = localStorage.getItem('pr_notifications_v2');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'notif-1',
            recipientName: 'Sarah Ahmed',
            senderName: 'Rahim Chowdhury',
            message: 'Marked Vehicle tracking integration as QA Ready for testing',
            workId: 'WK-142',
            workTitle: 'Vehicle tracking live integration',
            timestamp: '10 mins ago',
            read: false,
            type: 'qa',
          },
          {
            id: 'notif-2',
            recipientName: 'Farhana Yasmin',
            senderName: 'Karim Ullah',
            message: 'All 3 deliverables passed QA! Feature is now Full Feature UAT Ready',
            workId: 'WK-142',
            workTitle: 'Vehicle tracking live integration',
            timestamp: '25 mins ago',
            read: false,
            type: 'uat',
          },
        ];
  });
  const [config, setConfig] = useState<AppConfig>(initialConfig);

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('pr_projects_v2');
    if (saved) {
      try {
        const parsed: Project[] = JSON.parse(saved);
        if (parsed.length > 0) {
          return parsed.map((p) => {
            if (p.id === 'PRJ-101' && p.key === 'BUS') {
              return {
                ...p,
                key: 'BDT',
                name: 'bdtickets Core Platform',
                description:
                  'National coach and intercity bus reservation platform, real-time seat lock engine, operator fleet sync, and consumer portals.',
              };
            }
            return p;
          });
        }
      } catch (e) {}
    }
    return initialProjects;
  });
  const [selectedProjectId, setSelectedProjectId] = useState<string | 'all'>('all');

  const [invites, setInvites] = useState<ProjectInvite[]>(() => {
    const saved = localStorage.getItem('pr_invites_v2');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'inv-1',
            code: 'INV-BUS-DEV82',
            link: `${window.location.origin}/#invite=INV-BUS-DEV82`,
            projectId: 'PRJ-101',
            projectName: 'Intercity Bus Ticketing Engine',
            role: 'Developer',
            inviterName: 'Adnan Hossain',
            inviterRole: 'Project Manager',
            expiresAt: '2026-11-01',
            createdAt: '2026-10-08',
            status: 'Active',
          },
        ];
  });
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('pr_theme_mode');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('pr_theme_mode', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
      document.documentElement.classList.remove('theme-dark');
    } else {
      document.documentElement.classList.add('theme-dark');
      document.documentElement.classList.remove('theme-light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [currentRole, setCurrentRole] = useState<UserRole>('Super Admin');
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem('pr_logged_user_id');
    return saved || 'usr-9';
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('pr_is_logged_in');
    return saved !== null ? saved === 'true' : true;
  });
  const [activeTab, setActiveTab] = useState<string>('worksheet');
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>('WK-142');
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [detailModalWorkId, setDetailModalWorkId] = useState<string | null>(null);
  const [lastSavedText, setLastSavedText] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState<string>('');
  const [isUatModeActive, setIsUatModeActive] = useState<boolean>(false);

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('pr_work_items_v2', JSON.stringify(workItems));
  }, [workItems]);

  useEffect(() => {
    localStorage.setItem('pr_sprints_v2', JSON.stringify(sprints));
  }, [sprints]);

  useEffect(() => {
    localStorage.setItem('pr_releases_v2', JSON.stringify(releases));
  }, [releases]);

  useEffect(() => {
    localStorage.setItem('pr_tickets_v2', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('pr_rules_v2', JSON.stringify(routingRules));
  }, [routingRules]);

  useEffect(() => {
    localStorage.setItem('pr_users_v2', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('pr_projects_v2', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('pr_invites_v2', JSON.stringify(invites));
  }, [invites]);

  useEffect(() => {
    localStorage.setItem('pr_notifications_v2', JSON.stringify(notifications));
  }, [notifications]);

  const triggerSavedFeedback = (msg = 'Saved') => {
    setLastSavedText(msg);
    setTimeout(() => {
      setLastSavedText(null);
    }, 2200);
  };

  const currentUser =
    users.find((u) => u.id === currentUserId) ||
    users.find((u) => u.role === currentRole) ||
    users[0];

  const setCurrentUser = (user: UserProfile) => {
    setCurrentUserId(user.id);
    setCurrentRole(user.role);
    localStorage.setItem('pr_logged_user_id', user.id);
  };

  const login = (emailOrUser: string, password?: string): boolean => {
    const q = emailOrUser.toLowerCase().trim();
    const matched = users.find(
      (u) =>
        u.email.toLowerCase() === q ||
        (u.username && u.username.toLowerCase() === q)
    );
    if (matched) {
      if (password && matched.password && matched.password !== password) {
        triggerSavedFeedback('Invalid password credentials');
        return false;
      }
      setCurrentUserId(matched.id);
      setCurrentRole(matched.role);
      setIsLoggedIn(true);
      localStorage.setItem('pr_is_logged_in', 'true');
      localStorage.setItem('pr_logged_user_id', matched.id);
      triggerSavedFeedback(`Welcome, ${matched.name}!`);
      return true;
    }
    triggerSavedFeedback('User not found');
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('pr_is_logged_in', 'false');
    triggerSavedFeedback('Logged out successfully');
  };

  const updateUser = (userId: string, updates: Partial<UserProfile>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
    );
    triggerSavedFeedback('User Profile & Credentials Updated');
  };

  // Global activity rollup
  const globalActivity: ActivityLog[] = workItems
    .flatMap((w) =>
      (w.activity || []).map((a) => ({
        ...a,
        workId: w.id,
        workTitle: w.title,
      }))
    )
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const addWorkItem = (item: Partial<WorkItem>): WorkItem => {
    const nextNum =
      workItems.reduce((max, w) => {
        const num = parseInt(w.id.replace(/\D/g, ''), 10);
        return isNaN(num) ? max : Math.max(max, num);
      }, 150) + 1;

    const newId = `WK-${nextNum}`;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newItem: WorkItem = {
      id: newId,
      title: item.title || 'Untitled Work Item',
      type: item.type || 'Feature',
      source: item.source || 'Product',
      productArea:
        item.productArea && item.productArea.length > 0
          ? item.productArea
          : ['Landing Page', 'Flash Deals'],
      platform:
        item.platform && item.platform.length > 0 ? item.platform : ['Web', 'Mobile Web'],
      priority: item.priority || 'Medium',
      status: item.status || 'To Do',
      reporter: item.reporter || {
        name: currentUser.name,
        role: currentUser.role,
        email: currentUser.email,
      },
      owner: item.owner || {
        name: 'Unassigned',
        role: 'Pending',
      },
      team: item.team || 'Web Engineering',
      requirementDetails: item.requirementDetails || '',
      acceptanceCriteria: item.acceptanceCriteria || [],
      businessNotes: item.businessNotes || '',
      designRequired: item.designRequired || false,
      figmaUrl: item.figmaUrl || '',
      designTitle: item.designTitle || '',
      designStatus: item.designStatus || 'Draft',
      sprintId: item.sprintId,
      projectId:
        item.projectId ||
        (selectedProjectId !== 'all' ? selectedProjectId : projects[0]?.id || 'PRJ-101'),
      estimate: item.estimate || '',
      dependencies: item.dependencies || [],
      relatedWorkIds: item.relatedWorkIds || [],
      isParentFeature: item.isParentFeature || item.type === 'Feature',
      deliverables: item.deliverables || [],
      uatDiscoveries: [],
      dates: item.dates || {},
      qaCases: item.qaCases || [],
      uatCases: item.uatCases || [],
      comments: [],
      activity: [
        {
          id: `act-${Date.now()}`,
          timestamp: now,
          actor: currentUser.name,
          action: 'Created Work Item',
          details: `Created as ${item.type || 'Feature'} under ${
            item.productArea?.join(', ') || 'General'
          }`,
        },
      ],
      readiness: 'Ready',
      createdAt: now,
      updatedAt: now,
    };

    setWorkItems((prev) => [newItem, ...prev]);
    triggerSavedFeedback('Work Item Added');
    return newItem;
  };

  const updateWorkItem = (id: string, updates: Partial<WorkItem>) => {
    const isBusinessTeam = currentRole === 'Business' || currentRole === 'UAT';

    // Business team cannot change any status. They can only add and do UAT.
    if (isBusinessTeam && updates.status !== undefined) {
      const existing = workItems.find((w) => w.id === id);
      if (existing && updates.status !== existing.status) {
        delete updates.status;
        triggerSavedFeedback('Status Locked: Business team cannot change work item status.');
        // If there are no other updates, return early
        if (Object.keys(updates).length === 0) return;
      }
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    setWorkItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const updatedDates = { ...item.dates, ...(updates.dates || {}) };
        const newStatus = updates.status || item.status;

        // Auto-capture actual timestamps
        if (updates.status && updates.status !== item.status) {
          if (newStatus === 'In Development' && !updatedDates.actualDevStart) {
            updatedDates.actualDevStart = now;
          } else if (newStatus === 'Ready for QA' && !updatedDates.actualDevEnd) {
            updatedDates.actualDevEnd = now;
          } else if (newStatus === 'In QA' && !updatedDates.actualQaStart) {
            updatedDates.actualQaStart = now;
          } else if (
            (newStatus === 'Ready for UAT' || newStatus === 'QA Failed') &&
            !updatedDates.actualQaEnd
          ) {
            updatedDates.actualQaEnd = now;
          } else if (newStatus === 'In UAT' && !updatedDates.actualUatStart) {
            updatedDates.actualUatStart = now;
          } else if (
            (newStatus === 'Ready for Release' || newStatus === 'UAT Failed') &&
            !updatedDates.actualUatEnd
          ) {
            updatedDates.actualUatEnd = now;
          } else if (newStatus === 'Released' && !updatedDates.actualRelease) {
            updatedDates.actualRelease = now;
          }
        }

        const newActivity = [...(item.activity || [])];
        if (updates.status && updates.status !== item.status) {
          newActivity.push({
            id: `act-${Date.now()}`,
            timestamp: now,
            actor: currentUser.name,
            action: `Status transitioned to ${updates.status}`,
            details: `Previous status was ${item.status}`,
          });
        }
        if (updates.owner && updates.owner.name !== item.owner?.name) {
          newActivity.push({
            id: `act-${Date.now() + 1}`,
            timestamp: now,
            actor: currentUser.name,
            action: `Assigned to ${updates.owner.name}`,
          });
        }
        if (updates.sprintId !== undefined && updates.sprintId !== item.sprintId) {
          newActivity.push({
            id: `act-${Date.now() + 2}`,
            timestamp: now,
            actor: currentUser.name,
            action: updates.sprintId
              ? `Assigned to ${updates.sprintId}`
              : 'Moved to Product Backlog',
          });
        }

        return {
          ...item,
          ...updates,
          dates: updatedDates,
          activity: newActivity,
          updatedAt: now,
        };
      })
    );

    triggerSavedFeedback();
  };

  const deleteWorkItem = (id: string) => {
    setWorkItems((prev) => prev.filter((item) => item.id !== id));
    if (selectedWorkId === id) setSelectedWorkId(null);
    if (detailModalWorkId === id) setDetailModalWorkId(null);
    triggerSavedFeedback('Item Deleted');
  };

  const archiveWorkItem = (id: string) => {
    if (currentRole === 'Business' || currentRole === 'UAT') {
      triggerSavedFeedback('Restricted: Business team cannot change item status.');
      return;
    }
    updateWorkItem(id, { status: 'Archived' });
    triggerSavedFeedback('Item Archived');
  };

  const unarchiveWorkItem = (id: string) => {
    if (currentRole === 'Business' || currentRole === 'UAT') {
      triggerSavedFeedback('Restricted: Business team cannot change item status.');
      return;
    }
    updateWorkItem(id, { status: 'Released' });
    triggerSavedFeedback('Item Restored');
  };

  const bulkUpdateWorkItems = (ids: string[], updates: Partial<WorkItem>) => {
    if ((currentRole === 'Business' || currentRole === 'UAT') && updates.status !== undefined) {
      delete updates.status;
      triggerSavedFeedback('Status Locked: Business team cannot change work item status.');
      if (Object.keys(updates).length === 0) return;
    }
    ids.forEach((id) => updateWorkItem(id, updates));
    triggerSavedFeedback(`${ids.length} items updated`);
  };

  // Deliverables (Dividing work to developers & computing feature-level UAT readiness)
  const addDeliverable = (
    workId: string,
    deliverable: Omit<FeatureDeliverable, 'id'>
  ) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const item = workItems.find((w) => w.id === workId);
    if (!item) return;

    const delivId = `${workId}-D${(item.deliverables?.length || 0) + 1}`;
    const newDeliv: FeatureDeliverable = {
      id: delivId,
      ...deliverable,
    };

    updateWorkItem(workId, {
      deliverables: [...(item.deliverables || []), newDeliv],
      activity: [
        ...(item.activity || []),
        {
          id: `act-${Date.now()}`,
          timestamp: now,
          actor: currentUser.name,
          action: `Deliverable added: ${newDeliv.title}`,
          details: `Assigned to developer: ${newDeliv.assignedDeveloper}`,
        },
      ],
    });

    triggerSavedFeedback('Deliverable Divided to Developer');
  };

  const updateDeliverableStatus = (
    workId: string,
    deliverableId: string,
    status: FeatureDeliverable['status'],
    notes?: string
  ) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const item = workItems.find((w) => w.id === workId);
    if (!item) return;

    const updatedDeliverables = (item.deliverables || []).map((d) => {
      if (d.id !== deliverableId) return d;
      return {
        ...d,
        status,
        qaPassed: status === 'Ready for UAT' || status === 'Done',
        notes: notes || d.notes,
      };
    });

    // Check if ALL deliverables are now UAT Ready!
    const allUatReady =
      updatedDeliverables.length > 0 &&
      updatedDeliverables.every(
        (d) => d.status === 'Ready for UAT' || d.status === 'Done'
      );

    let nextParentStatus = item.status;
    let feedback = `Deliverable marked ${status}`;

    if (allUatReady) {
      nextParentStatus = 'Ready for UAT';
      feedback = `All ${updatedDeliverables.length} deliverables UAT Ready → Full Feature is now UAT Ready`;
    } else if (status === 'Ready for QA' && item.status === 'In Development') {
      nextParentStatus = 'In Development';
    }

    updateWorkItem(workId, {
      deliverables: updatedDeliverables,
      status: nextParentStatus,
      activity: [
        ...(item.activity || []),
        {
          id: `act-${Date.now()}`,
          timestamp: now,
          actor: currentUser.name,
          action: `Deliverable ${deliverableId} status: ${status}`,
          details: allUatReady
            ? `All deliverables complete! Feature ${workId} transitioned to Ready for UAT.`
            : notes || `Deliverable marked as ${status}`,
        },
      ],
    });

    triggerSavedFeedback(feedback);
  };

  // UAT Discoveries
  const logUatDiscovery = (
    featureId: string,
    discovery: Omit<UatDiscovery, 'id' | 'discoveredAt' | 'discoveredBy' | 'status' | 'featureId'>
  ): UatDiscovery => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const item = workItems.find((w) => w.id === featureId);

    const discId = `DISC-${Date.now().toString().slice(-4)}`;
    const newDiscovery: UatDiscovery = {
      ...discovery,
      id: discId,
      featureId,
      discoveredAt: now,
      discoveredBy: `${currentUser.name} (${currentUser.role})`,
      status: 'Logged',
    };

    // Auto-create linked Work Item on Worksheet for this discovery!
    const createdWork = addWorkItem({
      title: `[UAT Discovery] ${discovery.title}`,
      type: discovery.type,
      source: 'UAT Discovery',
      productArea: item?.productArea || ['Landing Page', 'Flash Deals'],
      platform: item?.platform || ['Web'],
      priority: discovery.severity,
      status: 'To Do',
      requirementDetails: `Discovered during UAT acceptance session of ${featureId} (${item?.title}).
${discovery.description}`,
      sprintId: item?.sprintId,
      relatedWorkIds: [{ id: featureId, relation: 'Originated From' }],
    });

    newDiscovery.linkedWorkId = createdWork.id;

    if (item) {
      updateWorkItem(featureId, {
        uatDiscoveries: [...(item.uatDiscoveries || []), newDiscovery],
        relatedWorkIds: [
          ...(item.relatedWorkIds || []),
          { id: createdWork.id, relation: 'Failed QA Bug' },
        ],
        activity: [
          ...(item.activity || []),
          {
            id: `act-${Date.now()}`,
            timestamp: now,
            actor: currentUser.name,
            action: `New UAT Discovery Logged: ${discovery.title}`,
            details: `Created linked ${discovery.type} ${createdWork.id}`,
          },
        ],
      });
    }

    triggerSavedFeedback(`Discovery Logged & Work ${createdWork.id} Created`);
    return newDiscovery;
  };

  const updateSprintMilestones = (
    sprintId: string,
    milestones: Partial<SprintMilestones>
  ) => {
    setSprints((prev) =>
      prev.map((s) =>
        s.id === sprintId
          ? {
              ...s,
              milestones: { ...(s.milestones || {}), ...milestones },
            }
          : s
      )
    );
    triggerSavedFeedback('Sprint Timelines Updated');
  };

  const updateQaCaseResult = (
    workId: string,
    caseId: string,
    result: 'Pass' | 'Fail' | 'Blocked' | 'Untested',
    evidence?: string,
    actual?: string
  ) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    setWorkItems((prev) =>
      prev.map((item) => {
        if (item.id !== workId) return item;

        const updatedCases = (item.qaCases || []).map((tc) => {
          if (tc.id !== caseId) return tc;
          return {
            ...tc,
            result,
            evidence: evidence || tc.evidence,
            actual: actual || tc.actual,
            tester: currentUser.name,
            testedAt: now,
          };
        });

        const hasFail = updatedCases.some((c) => c.result === 'Fail');
        const allPass =
          updatedCases.length > 0 && updatedCases.every((c) => c.result === 'Pass');

        let nextStatus = item.status;
        if (hasFail) {
          nextStatus = 'In Development'; // Go back to Developer on QA fail
        } else if (allPass) {
          nextStatus = 'Ready for UAT';
        }

        return {
          ...item,
          qaCases: updatedCases,
          status: nextStatus,
          activity: [
            ...(item.activity || []),
            {
              id: `act-${Date.now()}`,
              timestamp: now,
              actor: currentUser.name,
              action: `QA Test Case ${caseId}: ${result}`,
              details: actual || `Marked ${result}`,
            },
          ],
          updatedAt: now,
        };
      })
    );

    triggerSavedFeedback('QA Result Recorded');
  };

  const addQaTestCasesBulk = (
    workId: string,
    cases: { scenario: string; expected: string }[]
  ) => {
    if (!cases.length) return;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    setWorkItems((prev) =>
      prev.map((item) => {
        if (item.id !== workId) return item;
        const currentCases = item.qaCases || [];
        const nextCases: QaTestCase[] = [
          ...currentCases,
          ...cases.map((c, i) => ({
            id: `TC-${String(currentCases.length + i + 1).padStart(2, '0')}`,
            workId,
            scenario: c.scenario.trim(),
            expected: c.expected.trim() || 'Verified functionality',
            result: 'Untested' as const,
          })),
        ];

        return {
          ...item,
          qaCases: nextCases,
          activity: [
            ...(item.activity || []),
            {
              id: `act-${Date.now()}`,
              timestamp: now,
              actor: currentUser.name,
              action: `Added ${cases.length} QA Test Scenarios`,
              details: `Batch defined in test suite (Total: ${nextCases.length})`,
            },
          ],
          updatedAt: now,
        };
      })
    );
    triggerSavedFeedback(`Added ${cases.length} QA Scenarios to ${workId}`);
  };

  const deleteQaTestCase = (workId: string, caseId: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setWorkItems((prev) =>
      prev.map((item) => {
        if (item.id !== workId) return item;
        const updatedCases = (item.qaCases || []).filter((c) => c.id !== caseId);
        return {
          ...item,
          qaCases: updatedCases,
          activity: [
            ...(item.activity || []),
            {
              id: `act-${Date.now()}`,
              timestamp: now,
              actor: currentUser.name,
              action: `Deleted QA Test Case ${caseId}`,
              details: `Remaining test cases: ${updatedCases.length}`,
            },
          ],
          updatedAt: now,
        };
      })
    );
    triggerSavedFeedback(`Test Case ${caseId} Deleted`);
  };

  const updateQaTestCase = (
    workId: string,
    caseId: string,
    updates: Partial<QaTestCase>
  ) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setWorkItems((prev) =>
      prev.map((item) => {
        if (item.id !== workId) return item;
        const updatedCases = (item.qaCases || []).map((c) =>
          c.id === caseId ? { ...c, ...updates } : c
        );
        return {
          ...item,
          qaCases: updatedCases,
          updatedAt: now,
        };
      })
    );
    triggerSavedFeedback(`Test Case ${caseId} Updated`);
  };

  const promoteQaToUat = (
    workId: string,
    options?: {
      selectedCaseIds?: string[];
      signOffNotes?: string;
      markReadyForUat?: boolean;
    }
  ) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    setWorkItems((prev) =>
      prev.map((item) => {
        if (item.id !== workId) return item;

        const currentQa = item.qaCases || [];
        const casesToPromote = options?.selectedCaseIds
          ? currentQa.filter((c) => options.selectedCaseIds!.includes(c.id))
          : currentQa.filter((c) => c.result === 'Pass' || c.result === 'Untested');

        const existingUat = item.uatCases || [];
        const existingScenarios = new Set(existingUat.map((u) => u.scenario.toLowerCase().trim()));

        const newUatCases: UatTestCase[] = [];
        let counter = existingUat.length + 1;

        casesToPromote.forEach((qaCase) => {
          if (!existingScenarios.has(qaCase.scenario.toLowerCase().trim())) {
            newUatCases.push({
              id: `UAT-${item.id.replace('WK-', '')}-${String(counter++).padStart(2, '0')}`,
              workId: item.id,
              scenario: qaCase.scenario,
              expected: qaCase.expected,
              result: 'Pending',
              evidence: qaCase.evidence,
            });
          }
        });

        const updatedUatCases = [...existingUat, ...newUatCases];
        const nextStatus = options?.markReadyForUat !== false ? 'Ready for UAT' : item.status;

        const qaSignOff: QaSignOff = {
          tester: currentUser.name,
          date: now,
          notes: options?.signOffNotes || 'All test criteria verified in QA.',
          totalPassed: currentQa.filter((c) => c.result === 'Pass').length,
        };

        return {
          ...item,
          uatCases: updatedUatCases,
          status: nextStatus,
          qaSignOff,
          activity: [
            ...(item.activity || []),
            {
              id: `act-${Date.now()}`,
              timestamp: now,
              actor: currentUser.name,
              action: `QA Verification Promoted to Business UAT`,
              details: `${newUatCases.length} scenarios handed off. Notes: ${qaSignOff.notes}`,
            },
          ],
          updatedAt: now,
        };
      })
    );

    triggerSavedFeedback(`Item ${workId} Promoted to Business UAT`);
  };

  const createBugFromQaFail = (
    workId: string,
    caseId: string,
    customTitle?: string,
    customDescription?: string
  ): WorkItem => {
    const original = workItems.find((w) => w.id === workId);
    const failedCase = original?.qaCases?.find((c) => c.id === caseId);

    const nextNum =
      workItems.reduce((max, w) => {
        const num = parseInt(w.id.replace(/\D/g, ''), 10);
        return isNaN(num) ? max : Math.max(max, num);
      }, 150) + 1;

    const bugId = `WK-${nextNum}`;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const bugTitle =
      customTitle ||
      `${failedCase?.scenario || 'Verification failed'} [Bug from ${workId}]`;

    const newBug: WorkItem = {
      id: bugId,
      title: bugTitle,
      type: 'Bug',
      source: 'QA',
      productArea: original?.productArea || ['Bus'],
      platform: original?.platform || ['Android'],
      priority: original?.priority === 'Critical' ? 'Critical' : 'High',
      status: 'In Development',
      reporter: {
        name: currentUser.name,
        role: 'QA Specialist',
        email: currentUser.email,
      },
      owner: original?.owner || {
        name: 'Unassigned',
        role: 'Developer',
      },
      team: original?.team || 'Mobile Engineering',
      requirementDetails:
        customDescription ||
        `Defect identified during QA verification of ${original?.id}.
Failed Test: ${caseId} - ${failedCase?.scenario || ''}
Expected: ${failedCase?.expected || ''}
Actual: ${failedCase?.actual || 'Failed verification'}`,
      acceptanceCriteria: [
        `Fix regression identified in ${caseId}`,
        'Pass clean QA retest',
      ],
      designRequired: false,
      sprintId: original?.sprintId,
      estimate: '3 pts',
      dependencies: [workId],
      relatedWorkIds: [{ id: workId, relation: 'Originated From' }],
      dates: {
        plannedDevStart: now.slice(0, 10),
        actualDevStart: now,
      },
      activity: [
        {
          id: `act-${Date.now()}`,
          timestamp: now,
          actor: currentUser.name,
          action: 'Bug Created from QA Failure',
          details: `Linked to ${workId} (${caseId})`,
        },
      ],
      readiness: 'Ready',
      createdAt: now,
      updatedAt: now,
    };

    setWorkItems((prev) =>
      [newBug, ...prev].map((item) => {
        if (item.id !== workId) return item;
        const related = item.relatedWorkIds || [];
        return {
          ...item,
          status: 'QA Failed',
          relatedWorkIds: [...related, { id: bugId, relation: 'Failed QA Bug' }],
          qaCases: (item.qaCases || []).map((tc) =>
            tc.id === caseId ? { ...tc, linkedBugId: bugId } : tc
          ),
        };
      })
    );

    triggerSavedFeedback(`Bug ${bugId} Created & Linked`);
    return newBug;
  };

  const updateUatCaseResult = (
    workId: string,
    caseId: string,
    result: 'Pass' | 'Fail' | 'Pending',
    comment?: string,
    evidence?: string
  ) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    setWorkItems((prev) =>
      prev.map((item) => {
        if (item.id !== workId) return item;

        const updatedCases = (item.uatCases || []).map((tc) => {
          if (tc.id !== caseId) return tc;
          return {
            ...tc,
            result,
            comment: comment || tc.comment,
            evidence: evidence || tc.evidence,
            reviewer: currentUser.name,
            reviewedAt: now,
          };
        });

        const hasFail = updatedCases.some((c) => c.result === 'Fail');
        const allPass =
          updatedCases.length > 0 && updatedCases.every((c) => c.result === 'Pass');

        let nextStatus = item.status;
        if (hasFail) {
          nextStatus = 'Ready for QA'; // Go back to QA on UAT fail (loop: UAT -> QA -> Dev)
        } else if (allPass) {
          nextStatus = 'Ready for Release';
        }

        return {
          ...item,
          uatCases: updatedCases,
          status: nextStatus,
          activity: [
            ...(item.activity || []),
            {
              id: `act-${Date.now()}`,
              timestamp: now,
              actor: currentUser.name,
              action: `UAT Scenario ${caseId}: ${result}`,
              details: comment || `Result marked ${result}`,
            },
          ],
          updatedAt: now,
        };
      })
    );

    triggerSavedFeedback('UAT Result Recorded');
  };

  const toggleUatCaseAttention = (
    workId: string,
    caseId: string,
    requiresAttention: boolean,
    reason?: string
  ) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setWorkItems((prev) =>
      prev.map((item) => {
        if (item.id !== workId) return item;
        const updatedCases = (item.uatCases || []).map((tc) => {
          if (tc.id !== caseId) return tc;
          return {
            ...tc,
            requiresAttention,
            attentionReason: reason !== undefined ? reason : tc.attentionReason,
          };
        });

        return {
          ...item,
          uatCases: updatedCases,
          activity: [
            ...(item.activity || []),
            {
              id: `act-${Date.now()}`,
              timestamp: now,
              actor: currentUser.name,
              action: requiresAttention
                ? `Flagged Scenario ${caseId}: Requires Attention`
                : `Cleared Attention flag on Scenario ${caseId}`,
              details: reason || (requiresAttention ? 'Marked for critical business attention' : 'Resolved'),
            },
          ],
          updatedAt: now,
        };
      })
    );
    triggerSavedFeedback(requiresAttention ? 'Flagged: Requires Attention' : 'Attention Flag Cleared');
  };

  const updateUatCaseAnnotations = (
    workId: string,
    caseId: string,
    annotations: UatAnnotation[],
    screenshotUrl?: string
  ) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setWorkItems((prev) =>
      prev.map((item) => {
        if (item.id !== workId) return item;
        const updatedCases = (item.uatCases || []).map((tc) => {
          if (tc.id !== caseId) return tc;
          return {
            ...tc,
            annotations,
            screenshotUrl: screenshotUrl || tc.screenshotUrl,
            requiresAttention: annotations.length > 0 ? true : tc.requiresAttention,
          };
        });

        return {
          ...item,
          uatCases: updatedCases,
          activity: [
            ...(item.activity || []),
            {
              id: `act-${Date.now()}`,
              timestamp: now,
              actor: currentUser.name,
              action: `Updated Visual Pins on Scenario ${caseId}`,
              details: `${annotations.length} visual defect pin(s) recorded`,
            },
          ],
          updatedAt: now,
        };
      })
    );
    triggerSavedFeedback(`${annotations.length} Visual Annotation Pin(s) Saved`);
  };

  const createItemFromUatFail = (
    workId: string,
    caseId: string,
    type: 'Bug' | 'CR',
    title: string,
    details?: string
  ): WorkItem => {
    const original = workItems.find((w) => w.id === workId);
    const failedCase = original?.uatCases?.find((c) => c.id === caseId);

    const nextNum =
      workItems.reduce((max, w) => {
        const num = parseInt(w.id.replace(/\D/g, ''), 10);
        return isNaN(num) ? max : Math.max(max, num);
      }, 150) + 1;

    const newItemId = `WK-${nextNum}`;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newItem: WorkItem = {
      id: newItemId,
      title: title || `${type} from UAT rejection on ${workId}`,
      type,
      source: 'UAT',
      productArea: original?.productArea || ['Landing Page', 'Flash Deals'],
      platform: original?.platform || ['Web'],
      priority: 'High',
      status: 'To Do',
      reporter: {
        name: currentUser.name,
        role: currentUser.role,
        email: currentUser.email,
      },
      owner: original?.owner || {
        name: 'Unassigned',
        role: 'Pending',
      },
      team: original?.team || 'Web Engineering',
      requirementDetails:
        details ||
        `Created from business UAT rejection on ${original?.id}.
Scenario: ${failedCase?.scenario || ''}
Expected: ${failedCase?.expected || ''}
Feedback: ${failedCase?.comment || 'Business acceptance rejected.'}${
          failedCase?.requiresAttention && failedCase?.attentionReason
            ? `\nAttention Flag: ${failedCase.attentionReason}`
            : ''
        }${
          failedCase?.annotations && failedCase.annotations.length > 0
            ? `\n\nVisual UI Element Defect Pins (${failedCase.annotations.length}):\n` +
              failedCase.annotations
                .map(
                  (a, i) =>
                    `• Pin #${i + 1} [${a.elementName || 'UI Element'} at ${a.x}%, ${a.y}%]: "${a.comment}" (Flagged by ${a.author})`
                )
                .join('\n')
            : ''
        }`,
      designRequired: false,
      sprintId: original?.sprintId,
      estimate: type === 'Bug' ? '3 pts' : '5 pts',
      dependencies: [workId],
      relatedWorkIds: [{ id: workId, relation: 'Originated From' }],
      dates: {},
      activity: [
        {
          id: `act-${Date.now()}`,
          timestamp: now,
          actor: currentUser.name,
          action: `Created ${type} from UAT rejection`,
          details: `Linked to parent work ${workId}`,
        },
      ],
      readiness: 'Ready',
      createdAt: now,
      updatedAt: now,
    };

    setWorkItems((prev) =>
      [newItem, ...prev].map((item) => {
        if (item.id !== workId) return item;
        const related = item.relatedWorkIds || [];
        return {
          ...item,
          status: 'UAT Failed',
          relatedWorkIds: [
            ...related,
            { id: newItemId, relation: type === 'Bug' ? 'Bug' : 'CR' },
          ],
        };
      })
    );

    triggerSavedFeedback(`${type} ${newItemId} Created & Linked`);
    return newItem;
  };

  const addUatTestCasesBulk = (
    workId: string,
    cases: { scenario: string; expected: string }[]
  ) => {
    if (!cases.length) return;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    setWorkItems((prev) =>
      prev.map((item) => {
        if (item.id !== workId) return item;
        const currentCases = item.uatCases || [];
        const nextCases: UatTestCase[] = [
          ...currentCases,
          ...cases.map((c, i) => ({
            id: `UAT-${item.id.replace('WK-', '')}-${String(currentCases.length + i + 1).padStart(2, '0')}`,
            workId,
            scenario: c.scenario.trim(),
            expected: c.expected.trim() || 'Business acceptance confirmed',
            result: 'Pending' as const,
          })),
        ];

        return {
          ...item,
          uatCases: nextCases,
          activity: [
            ...(item.activity || []),
            {
              id: `act-${Date.now()}`,
              timestamp: now,
              actor: currentUser.name,
              action: `Added ${cases.length} UAT Acceptance Scenarios`,
              details: `Total acceptance scenarios: ${nextCases.length}`,
            },
          ],
          updatedAt: now,
        };
      })
    );
    triggerSavedFeedback(`Added ${cases.length} UAT Scenarios to ${workId}`);
  };

  const deleteUatTestCase = (workId: string, caseId: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setWorkItems((prev) =>
      prev.map((item) => {
        if (item.id !== workId) return item;
        const updatedCases = (item.uatCases || []).filter((c) => c.id !== caseId);
        return {
          ...item,
          uatCases: updatedCases,
          activity: [
            ...(item.activity || []),
            {
              id: `act-${Date.now()}`,
              timestamp: now,
              actor: currentUser.name,
              action: `Deleted UAT Scenario ${caseId}`,
              details: `Remaining scenarios: ${updatedCases.length}`,
            },
          ],
          updatedAt: now,
        };
      })
    );
    triggerSavedFeedback(`UAT Scenario ${caseId} Deleted`);
  };

  const updateUatTestCase = (
    workId: string,
    caseId: string,
    updates: Partial<UatTestCase>
  ) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setWorkItems((prev) =>
      prev.map((item) => {
        if (item.id !== workId) return item;
        const updatedCases = (item.uatCases || []).map((c) =>
          c.id === caseId ? { ...c, ...updates } : c
        );
        return {
          ...item,
          uatCases: updatedCases,
          updatedAt: now,
        };
      })
    );
    triggerSavedFeedback(`UAT Scenario ${caseId} Updated`);
  };

  const promoteUatToRelease = (workId: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setWorkItems((prev) =>
      prev.map((item) => {
        if (item.id !== workId) return item;
        const uatSignOff: UatSignOff = {
          reviewer: currentUser.name,
          date: now,
          promotedToRelease: true,
          notes: 'Business Acceptance Complete. Ready for deployment.',
        };
        return {
          ...item,
          status: 'Ready for Release',
          uatSignOff,
          activity: [
            ...(item.activity || []),
            {
              id: `act-${Date.now()}`,
              timestamp: now,
              actor: currentUser.name,
              action: 'Business UAT Sign-Off Approved',
              details: `Promoted to Ready for Release. Verified by ${currentUser.name}`,
            },
          ],
          updatedAt: now,
        };
      })
    );
    triggerSavedFeedback(`Item ${workId} Promoted to Release Hub!`);
  };

  const createSprint = (sprint: Partial<Sprint>) => {
    const nextNum = sprints.length + 24;
    const newSprint: Sprint = {
      id: sprint.id || `SP-${nextNum}`,
      name: sprint.name || `Sprint ${nextNum}`,
      goal: sprint.goal || 'Sprint Objectives',
      startDate: sprint.startDate || '2026-10-22',
      endDate: sprint.endDate || '2026-11-04',
      durationDays: sprint.durationDays || 14,
      workingDays: 10,
      capacityPoints: 50,
      status: sprint.status || 'Planning',
      committedWorkIds: sprint.committedWorkIds || [],
      addedWorkIds: [],
      team: sprint.team || 'Core Engineering',
      milestones: {
        devCutoffDate: '2026-10-28',
        qaFreezeDate: '2026-10-31',
        uatWindowStart: '2026-11-01',
        uatWindowEnd: '2026-11-03',
        releaseTargetDate: '2026-11-04',
      },
    };
    setSprints((prev) => [...prev, newSprint]);
    triggerSavedFeedback(`Sprint ${newSprint.id} Created`);
  };

  const updateSprint = (sprintId: string, updates: Partial<Sprint>) => {
    setSprints((prev) =>
      prev.map((s) => (s.id === sprintId ? { ...s, ...updates } : s))
    );
    triggerSavedFeedback();
  };

  const closeSprint = (
    sprintId: string,
    actionForUnfinished: 'backlog' | 'next-sprint' | 'cancel',
    nextSprintId?: string
  ) => {
    setWorkItems((prev) =>
      prev.map((w) => {
        if (w.sprintId !== sprintId) return w;
        if (w.status === 'Released' || w.status === 'Ready for Release') return w;

        const updates: Partial<WorkItem> = {};
        if (actionForUnfinished === 'backlog') {
          updates.sprintId = undefined;
          updates.status = 'Backlog';
        } else if (actionForUnfinished === 'next-sprint' && nextSprintId) {
          updates.sprintId = nextSprintId;
        } else if (actionForUnfinished === 'cancel') {
          updates.status = 'Cancelled';
        }

        return { ...w, ...updates, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) };
      })
    );

    updateSprint(sprintId, { status: 'Closed' });
    triggerSavedFeedback(`Sprint ${sprintId} Closed`);
  };

  const createRelease = (release: Partial<Release>) => {
    const newRelease: Release = {
      id: release.id || `REL-${Date.now()}`,
      name: release.name || 'New Release',
      targetDate: release.targetDate || '2026-11-01',
      productArea: release.productArea || ['Landing Page', 'Bus'],
      platforms: release.platforms || ['Web', 'Mobile Web'],
      includedWorkIds: release.includedWorkIds || [],
      knownIssues: release.knownIssues || [],
      releaseNotes: release.releaseNotes || '',
      owner: currentUser.name,
      status: release.status || 'Planning',
    };
    setReleases((prev) => [newRelease, ...prev]);
    triggerSavedFeedback(`Release ${newRelease.name} Created`);
  };

  const updateRelease = (releaseId: string, updates: Partial<Release>) => {
    setReleases((prev) =>
      prev.map((r) => (r.id === releaseId ? { ...r, ...updates } : r))
    );
    triggerSavedFeedback();
  };

  const markReleaseShipped = (releaseId: string) => {
    const rel = releases.find((r) => r.id === releaseId);
    if (!rel) return;

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    updateRelease(releaseId, {
      status: 'Released',
      actualDate: now,
    });

    rel.includedWorkIds.forEach((wId) => {
      updateWorkItem(wId, {
        status: 'Released',
        dates: {
          ...workItems.find((w) => w.id === wId)?.dates,
          actualRelease: now,
        },
      });
    });

    triggerSavedFeedback(`Release ${rel.name} Shipped to Production`);
  };

  const raiseTicket = (
    ticketData: Omit<OperationalTicket, 'id' | 'createdAt' | 'status'>
  ): OperationalTicket => {
    const nextNum =
      tickets.reduce((max, t) => {
        const num = parseInt(t.id.replace(/\D/g, ''), 10);
        return isNaN(num) ? max : Math.max(max, num);
      }, 1040) + 1;

    const ticketId = `TKT-${nextNum}`;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    let routedTeam = 'Platform Operations';
    let assignedOwner: string | undefined = undefined;

    const matchingRule = routingRules.find((rule) => {
      if (!rule.active) return false;
      const cond = rule.conditions;
      if (
        cond.productArea &&
        !ticketData.productArea.some((a) => a === cond.productArea || cond.productArea === 'All')
      ) {
        return false;
      }
      return true;
    });

    if (matchingRule) {
      routedTeam = matchingRule.targetTeam;
      assignedOwner = matchingRule.targetOwner;
    }

    // Automatically route to New Works / All Works tagged as "ticket"
    const createdWork = addWorkItem({
      title: `[${ticketId}] ${ticketData.title}`,
      type: ticketData.type === 'Bug' ? 'Bug' : 'Operational',
      source: ticketData.source,
      productArea: ticketData.productArea,
      platform: ticketData.platform,
      priority: ticketData.priority,
      status: 'Intake',
      operatorName: ticketData.operatorName,
      requirementDetails: ticketData.details,
      requesterName: ticketData.reporter,
      isTicket: true,
      originTicketId: ticketId,
      tags: ['ticket', 'operations', ticketData.priority === 'Critical' ? 'immediate' : 'bug'],
      ticketMetadata: {
        originalTicketId: ticketId,
        ticketSource: ticketData.source,
      },
    });

    const newTicket: OperationalTicket = {
      id: ticketId,
      ...ticketData,
      createdAt: now,
      status: 'Waiting for Triage',
      routedTeam,
      assignedOwner,
      connectedWorkId: createdWork.id,
    };

    setTickets((prev) => [newTicket, ...prev]);
    triggerSavedFeedback(`Ticket ${ticketId} Raised & Added to New Works`);
    return newTicket;
  };

  const triageTicket = (
    ticketId: string,
    action: 'convertToWork' | 'reject' | 'resolve',
    overrides?: Partial<WorkItem>
  ): WorkItem | undefined => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return undefined;

    if (action === 'convertToWork') {
      const createdWork = addWorkItem({
        title: overrides?.title || ticket.title,
        type: overrides?.type || (ticket.type === 'Bug' ? 'Bug' : 'Operational'),
        source: ticket.source,
        productArea: ticket.productArea,
        platform: ticket.platform,
        priority: ticket.priority,
        team: ticket.routedTeam || 'Platform Operations',
        requirementDetails: ticket.details,
        requesterName: ticket.reporter,
        sprintId: overrides?.sprintId,
        status: overrides?.sprintId ? 'To Do' : 'Intake',
        ticketMetadata: {
          originalTicketId: ticket.id,
          ticketSource: ticket.source,
        },
      });

      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                status: 'In Delivery',
                connectedWorkId: createdWork.id,
                resolutionNotes: `Triaged to ${createdWork.id} by ${currentUser.name}`,
              }
            : t
        )
      );

      triggerSavedFeedback(`Ticket ${ticketId} Converted to ${createdWork.id}`);
      navigateToWork(createdWork.id, 'worksheet');
      return createdWork;
    } else if (action === 'resolve') {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? { ...t, status: 'Resolved', resolutionNotes: 'Resolved during triage' }
            : t
        )
      );
      triggerSavedFeedback(`Ticket ${ticketId} Resolved`);
    } else if (action === 'reject') {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? { ...t, status: 'Rejected', resolutionNotes: 'Rejected during triage' }
            : t
        )
      );
      triggerSavedFeedback(`Ticket ${ticketId} Rejected`);
    }
    return undefined;
  };

  const updateConfig = (newConfig: Partial<AppConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
    triggerSavedFeedback('Settings Saved');
  };

  const addRoutingRule = (rule: Omit<RoutingRule, 'id'>) => {
    const id = `RULE-${routingRules.length + 1}`;
    setRoutingRules((prev) => [...prev, { ...rule, id }]);
    triggerSavedFeedback('Routing Rule Added');
  };

  const updateRoutingRule = (id: string, updates: Partial<RoutingRule>) => {
    setRoutingRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
    triggerSavedFeedback('Routing Rule Updated');
  };

  const deleteRoutingRule = (id: string) => {
    setRoutingRules((prev) => prev.filter((r) => r.id !== id));
    triggerSavedFeedback('Rule Removed');
  };

  const deleteSprint = (sprintId: string) => {
    setSprints((prev) => prev.filter((s) => s.id !== sprintId));
    setWorkItems((prev) =>
      prev.map((w) =>
        w.sprintId === sprintId ? { ...w, sprintId: undefined, status: 'Backlog' } : w
      )
    );
    triggerSavedFeedback(`Sprint ${sprintId} Deleted`);
  };

  const deleteRelease = (releaseId: string) => {
    setReleases((prev) => prev.filter((r) => r.id !== releaseId));
    triggerSavedFeedback(`Release Deleted`);
  };

  const deleteTicket = (ticketId: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    triggerSavedFeedback(`Ticket ${ticketId} Deleted`);
  };

  const deleteUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    if (target.role === 'Super Admin' && currentRole !== 'Super Admin') {
      alert("Super Admin accounts cannot be removed by Project Managers.");
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    // Remove from projects
    setProjects((prev) =>
      prev.map((p) => ({
        ...p,
        memberIds: p.memberIds.filter((m) => m !== userId),
      }))
    );
    triggerSavedFeedback(`User Removed`);
  };

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt'>): Project => {
    const newId = `PRJ-${Date.now().toString().slice(-4)}`;
    const newProj: Project = {
      ...projectData,
      id: newId,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setProjects((prev) => [newProj, ...prev]);
    // Synchronize member projectIds
    if (projectData.memberIds && projectData.memberIds.length > 0) {
      setUsers((prev) =>
        prev.map((u) => {
          if (projectData.memberIds.includes(u.id)) {
            const currentP = u.projectIds || [];
            return {
              ...u,
              projectIds: currentP.includes(newId) ? currentP : [...currentP, newId],
            };
          }
          return u;
        })
      );
    }
    triggerSavedFeedback(`Project "${newProj.name}" Created`);
    return newProj;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString().slice(0, 10) } : p))
    );
    triggerSavedFeedback('Project Updated');
  };

  const deleteProject = (id: string) => {
    if (currentRole !== 'Super Admin' && currentRole !== 'Project Manager') {
      alert("Only Super Admins and Project Managers can delete projects.");
      return;
    }
    const target = projects.find((p) => p.id === id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    // Detach from work items
    setWorkItems((prev) =>
      prev.map((w) => (w.projectId === id ? { ...w, projectId: undefined } : w))
    );
    if (selectedProjectId === id) {
      setSelectedProjectId('all');
    }
    triggerSavedFeedback(`Project ${target?.name || ''} Deleted`);
  };

  const addMemberToProject = (projectId: string, userId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          if (p.memberIds.includes(userId)) return p;
          return { ...p, memberIds: [...p.memberIds, userId] };
        }
        return p;
      })
    );
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const cur = u.projectIds || [];
          return cur.includes(projectId) ? u : { ...u, projectIds: [...cur, projectId] };
        }
        return u;
      })
    );
    const uName = users.find((u) => u.id === userId)?.name || 'Member';
    triggerSavedFeedback(`${uName} Added to Project Team`);
  };

  const removeMemberFromProject = (projectId: string, userId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return { ...p, memberIds: p.memberIds.filter((m) => m !== userId) };
        }
        return p;
      })
    );
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return { ...u, projectIds: (u.projectIds || []).filter((pid) => pid !== projectId) };
        }
        return u;
      })
    );
    const uName = users.find((u) => u.id === userId)?.name || 'Member';
    triggerSavedFeedback(`${uName} Removed from Project Team`);
  };

  const createProjectInvite = (
    projectId: string,
    role: UserRole,
    expiresInDays = 7
  ): ProjectInvite => {
    const proj = projects.find((p) => p.id === projectId);
    const code = `INV-${proj?.key || 'PRJ'}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const d = new Date();
    d.setDate(d.getDate() + expiresInDays);

    const newInvite: ProjectInvite = {
      id: `inv-${Date.now()}`,
      code,
      link: `${window.location.origin}/#invite=${code}`,
      projectId,
      projectName: proj?.name || 'Project Team',
      role,
      inviterName: currentUser.name,
      inviterRole: currentRole,
      expiresAt: d.toISOString().slice(0, 10),
      createdAt: new Date().toISOString().slice(0, 10),
      status: 'Active',
    };

    setInvites((prev) => [newInvite, ...prev]);
    triggerSavedFeedback('Invite Link Generated');
    return newInvite;
  };

  const acceptProjectInvite = (code: string, userName: string, userEmail: string): boolean => {
    const inv = invites.find((i) => i.code === code && i.status === 'Active');
    if (!inv) return false;

    const existingUser = users.find((u) => u.email.toLowerCase() === userEmail.toLowerCase());
    let targetUserId = existingUser?.id;

    if (!existingUser) {
      const newUser: UserProfile = {
        id: `usr-${Date.now().toString().slice(-4)}`,
        name: userName,
        email: userEmail,
        username: userName.toLowerCase().replace(/\s+/g, '.'),
        role: inv.role,
        team: inv.projectName,
        productAreas: ['Bus', 'All'],
        status: 'Active',
        projectIds: [inv.projectId],
      };
      setUsers((prev) => [...prev, newUser]);
      targetUserId = newUser.id;
    }

    if (targetUserId) {
      addMemberToProject(inv.projectId, targetUserId);
    }

    setInvites((prev) =>
      prev.map((i) => (i.code === code ? { ...i, status: 'Used' as const } : i))
    );
    triggerSavedFeedback(`Welcome ${userName} to ${inv.projectName}!`);
    return true;
  };

  const canManageProjects =
    currentRole === 'Super Admin' ||
    currentRole === 'Project Manager' ||
    currentRole === 'Product Owner';

  const canDeleteProjects =
    currentRole === 'Super Admin' || currentRole === 'Project Manager';

  const canAddUser =
    currentRole === 'Super Admin' ||
    currentRole === 'Project Manager' ||
    currentRole === 'Product Owner';

  const canRemoveUser = (target: UserProfile): boolean => {
    if (currentRole === 'Super Admin') return true;
    if (currentRole === 'Project Manager' || currentRole === 'Product Owner') {
      return target.role !== 'Super Admin';
    }
    return false;
  };

  const addOperator = (operatorData: Omit<OperatorItem, 'id'>): OperatorItem => {
    const newId = `op-${Date.now().toString().slice(-4)}`;
    const newOp: OperatorItem = { ...operatorData, id: newId, active: true };
    setConfig((prev) => ({
      ...prev,
      operators: [...(prev.operators || []), newOp],
    }));
    triggerSavedFeedback(`Operator ${newOp.name} Added`);
    return newOp;
  };

  const deleteOperator = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      operators: (prev.operators || []).filter((o) => o.id !== id),
    }));
    triggerSavedFeedback('Operator Removed');
  };

  const updateOperator = (id: string, updates: Partial<OperatorItem>) => {
    setConfig((prev) => ({
      ...prev,
      operators: (prev.operators || []).map((o) => (o.id === id ? { ...o, ...updates } : o)),
    }));
    triggerSavedFeedback('Operator Updated');
  };

  const addUser = (userData: Omit<UserProfile, 'id'>): UserProfile => {
    const newId = `usr-${Date.now().toString().slice(-4)}`;
    const newUser: UserProfile = {
      ...userData,
      id: newId,
    };
    setUsers((prev) => [...prev, newUser]);
    triggerSavedFeedback(`User ${newUser.name} Added`);
    return newUser;
  };

  const sendNotification = (
    notificationData: Omit<InAppNotification, 'id' | 'timestamp' | 'read'>
  ) => {
    const newNotif: InAppNotification = {
      ...notificationData,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    triggerSavedFeedback(`Notification sent to ${notificationData.recipientName}`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const importWorkItems = (newItems: WorkItem[]) => {
    setWorkItems((prev) => [...newItems, ...prev]);
    triggerSavedFeedback(`Imported ${newItems.length} Work Items`);
  };

  const navigateToWork = (id: string, tab: string = 'worksheet') => {
    setActiveTab(tab);
    setSelectedWorkId(id);
    setIsInspectorOpen(true);
  };

  return (
    <AppContext.Provider
      value={{
        workItems,
        sprints,
        releases,
        tickets,
        routingRules,
        users,
        addUser,
        projects,
        selectedProjectId,
        setSelectedProjectId,
        addProject,
        updateProject,
        deleteProject,
        addMemberToProject,
        removeMemberFromProject,
        invites,
        createProjectInvite,
        acceptProjectInvite,
        isInviteModalOpen,
        setIsInviteModalOpen,
        theme,
        toggleTheme,
        canManageProjects,
        canDeleteProjects,
        canAddUser,
        canRemoveUser,
        notifications,
        sendNotification,
        markNotificationRead,
        markAllNotificationsRead,
        config,
        currentRole,
        setCurrentRole,
        currentUser,
        activeTab,
        setActiveTab,
        selectedWorkId,
        setSelectedWorkId,
        isInspectorOpen,
        setIsInspectorOpen,
        detailModalWorkId,
        setDetailModalWorkId,
        lastSavedText,
        addWorkItem,
        updateWorkItem,
        deleteWorkItem,
        archiveWorkItem,
        unarchiveWorkItem,
        bulkUpdateWorkItems,
        addDeliverable,
        updateDeliverableStatus,
        logUatDiscovery,
        isUatModeActive,
        setIsUatModeActive,
        updateQaCaseResult,
        addQaTestCasesBulk,
        deleteQaTestCase,
        updateQaTestCase,
        createBugFromQaFail,
        promoteQaToUat,
        updateUatCaseResult,
        addUatTestCasesBulk,
        deleteUatTestCase,
        updateUatTestCase,
        toggleUatCaseAttention,
        updateUatCaseAnnotations,
        createItemFromUatFail,
        promoteUatToRelease,
        createSprint,
        updateSprint,
        deleteSprint,
        updateSprintMilestones,
        closeSprint,
        createRelease,
        updateRelease,
        deleteRelease,
        markReleaseShipped,
        raiseTicket,
        deleteTicket,
        triageTicket,
        globalActivity,
        updateConfig,
        addOperator,
        deleteOperator,
        updateOperator,
        addRoutingRule,
        updateRoutingRule,
        deleteRoutingRule,
        deleteUser,
        updateUser,
        isLoggedIn,
        login,
        logout,
        setCurrentUser,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        quickSearchQuery,
        setQuickSearchQuery,
        importWorkItems,
        navigateToWork,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
