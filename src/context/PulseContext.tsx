import React, { createContext, useContext, useState, useEffect } from 'react';

// --- TS Interfaces ---
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'executive' | 'employer' | 'employee';
  department: string;
  pod: 'India Pod' | 'UAE Pod';
  reportingManager: string;
  employeeId: string;
  active: boolean;
  avatarColor: string;
  password?: string;
}

export interface MockEmail {
  id: string;
  senderName: string;
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
}

export interface MockChatMessage {
  id: string;
  spaceId: string;
  senderName: string;
  senderId: string;
  avatarColor: string;
  text: string;
  timestamp: string;
}

export interface Comment {
  id: string;
  authorName: string;
  content: string;
  timestamp: string;
  sentVia: {
    gmail: boolean;
    chat: boolean;
    internal: boolean;
  };
}

export interface UpdateRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  pod: 'India Pod' | 'UAE Pod';
  date: string; // YYYY-MM-DD
  completed: string[];
  working: string[];
  blockers: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  projectName: string;
  files: { name: string; size: string }[];
  timestamp: string;
  createdAt?: string;
  comments: Comment[];
}

export interface IntegrationLog {
  id: string;
  type: 'gmail' | 'chat';
  timestamp: string;
  recipient: string; // Email or Space Name
  subject?: string;
  body: string;
  payloadJSON: string;
}

export interface SystemNotification {
  id: string;
  text: string;
  type: 'blocker' | 'warning' | 'info' | 'success';
  timestamp: string;
  read: boolean;
}

export interface AttendanceRecord {
  attendanceId: string;
  userId: string;
  employeeName?: string;
  email?: string;
  department?: string;
  date: string;
  loginTime?: string;
  logoutTime?: string;
  workingHours?: string;
  idleTime?: string;
  productiveHours?: string;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Auto Logout';
  officeRemote?: 'Office' | 'Remote';
  ipAddress?: string;
  device?: string;
  browser?: string;
  os?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface PulseContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  updates: UpdateRecord[];
  setUpdates: React.Dispatch<React.SetStateAction<UpdateRecord[]>>;
  projects: string[];
  integrationLogs: IntegrationLog[];
  notifications: SystemNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<SystemNotification[]>>;
  chatHistory: ChatMessage[];
  addChatMessage: (sender: 'user' | 'ai', text: string) => void;
  clearChat: () => void;
  logIntegration: (type: 'gmail' | 'chat', recipient: string, subject: string | undefined, body: string, payload: any) => void;
  submitEmployeeUpdate: (update: Omit<UpdateRecord, 'id' | 'employeeId' | 'employeeName' | 'department' | 'pod' | 'date' | 'timestamp' | 'comments'>) => Promise<{ deliveryStatus: 'ok' | 'partial' | 'failed' }>;
  resetSprintData: () => Promise<void>;
  addCommentToUpdate: (updateId: string, content: string, sentVia: { gmail: boolean; chat: boolean; internal: boolean }) => void;
  createNewUser: (user: Omit<User, 'id' | 'active' | 'avatarColor'>) => void;
  toggleUserActiveStatus: (userId: string) => void;
  resetPassword: (loginInput: string, newPassword: string) => boolean;
  parseVoiceUpdateAI: (voiceText: string) => Promise<{ completed: string[]; working: string[]; blockers: string[] }>;
  askExecutiveAI: (query: string) => Promise<string>;
  playElevenLabsTTS: (text: string) => Promise<void>;
  isVoiceLoading: boolean;
  login: (loginInput: string, passwordInput: string) => boolean;
  logout: () => void;
  mockEmails: MockEmail[];
  setMockEmails: React.Dispatch<React.SetStateAction<MockEmail[]>>;
  mockChatMessages: MockChatMessage[];
  setMockChatMessages: React.Dispatch<React.SetStateAction<MockChatMessage[]>>;
  sendDirectChatMessage: (spaceId: string, text: string) => void;
  templates: string[];
  setTemplates: React.Dispatch<React.SetStateAction<string[]>>;
  reminders: any[];
  setReminders: React.Dispatch<React.SetStateAction<any[]>>;
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  persistTemplates: (nextTemplates: string[]) => Promise<string[] | null>;
  persistReminders: (nextReminders: any[]) => Promise<any[] | null>;
  trackEvent: (name: string, payload?: any) => void;
  recordAttendanceEvent: (entry: Partial<AttendanceRecord>) => Promise<void>;
}

// --- Seed Data (Admin + Executives only, No Fake Data for Employees/Updates) ---
const initialUsers: User[] = [
  { id: 'u-admin', name: 'Admin Root', email: 'info@maplelearningsolutions.com', role: 'admin', department: 'Management', pod: 'India Pod', reportingManager: 'Board', employeeId: 'MP-0000', active: true, avatarColor: '#dc2626', password: 'admin' },
  { id: 'u-sandeep', name: 'Sandeep', email: 'sandeep@maplelearningsolutions.com', role: 'executive', department: 'Web Team', pod: 'India Pod', reportingManager: 'CEO', employeeId: 'MP-0001', active: true, avatarColor: '#ec4899', password: 'executive' },
  { id: 'u-krishna', name: 'Krishna', email: 'krishna@maplelearningsolutions.com', role: 'executive', department: 'eLearning Team', pod: 'India Pod', reportingManager: 'CEO', employeeId: 'MP-0002', active: true, avatarColor: '#6366f1', password: 'executive' },
  { id: 'u-rathish', name: 'Rathish', email: 'rathish@maplelearningsolutions.com', role: 'executive', department: 'Marketing & Sales Team', pod: 'UAE Pod', reportingManager: 'CEO', employeeId: 'MP-0003', active: true, avatarColor: '#f59e0b', password: 'executive' }
  ,{ id: 'u-renuka', name: 'Renuka', email: 'renuka@maplelearningsolutions.com', role: 'employee', department: 'Client Success', pod: 'India Pod', reportingManager: 'CEO', employeeId: 'MP-0004', active: true, avatarColor: '#7c3aed', password: 'executive' }
];

const initialNotifications: SystemNotification[] = [
  { id: 'notif-1', text: 'System initialized. Ready for administrator employee onboarding.', type: 'success', timestamp: new Date().toISOString(), read: false }
];

const initialChatMessages: ChatMessage[] = [
  { id: 'm-1', sender: 'ai', text: 'Welcome back. I am your Maple Pulse Assistant. Ask me anything about the team updates or blockers. Currently, we are awaiting employee directory updates.', timestamp: new Date().toISOString() }
];

const initialEmails: MockEmail[] = [
  {
    id: 'email-welcome',
    senderName: 'Maple Pulse Onboarding',
    senderEmail: 'onboarding@maplelearningsolutions.com',
    recipientEmail: 'info@maplelearningsolutions.com',
    subject: 'Welcome to Maple Pulse!',
    body: 'Hi Admin,\n\nWelcome to your Maple Pulse company portal. You can now onboard employees, track updates, and monitor operational performance from one central hub.\n\nBest,\nMaple Operations Team',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false
  },
  {
    id: 'email-welcome-sandeep',
    senderName: 'Maple Pulse Onboarding',
    senderEmail: 'onboarding@maplelearningsolutions.com',
    recipientEmail: 'sandeep@maplelearningsolutions.com',
    subject: 'Executive Dashboard Configured',
    body: 'Hi Sandeep,\n\nYour Executive board dashboard has been successfully configured. You will receive notifications here whenever employees under your management log blocker flags.\n\nThanks,\nMaple Pulse Support',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true
  }
];

const initialMockChatMessages: MockChatMessage[] = [
  {
    id: 'chat-seed-1',
    spaceId: 'space_development',
    senderName: 'Sandeep M',
    senderId: 'u-sandeep',
    avatarColor: '#ec4899',
    text: 'Welcome development team to your Maple Pulse space! Let us keep our updates logged here.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  },
  {
    id: 'chat-seed-2',
    spaceId: 'space_development',
    senderName: 'Krishna',
    senderId: 'u-krishna',
    avatarColor: '#6366f1',
    text: 'Please make sure to raise any blocker flags immediately so we can escalate to Gmail/Chat right away.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
  }
];

// --- Context Provider ---
const PulseContext = createContext<PulseContextType | undefined>(undefined);

const getApiBase = () => {
  const configuredBase = (import.meta.env.VITE_API_BASE || '').trim().replace(/\/$/, '');
  if (configuredBase) {
    return configuredBase;
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(hostname)) {
      return 'http://localhost:5000';
    }
  }

  return 'https://update-tool.onrender.com';
};

const mergeUsersLists = (existingUsers: User[], incomingUsers: User[]) => {
  const merged = [...existingUsers];
  incomingUsers.forEach((incomingUser) => {
    const incomingEmail = String(incomingUser.email || '').trim().toLowerCase();
    const incomingId = String(incomingUser.id || '').trim().toLowerCase();
    const existingIndex = merged.findIndex((candidate) => {
      const candidateEmail = String(candidate.email || '').trim().toLowerCase();
      const candidateId = String(candidate.id || '').trim().toLowerCase();
      return candidateEmail === incomingEmail || candidateId === incomingId;
    });

    if (existingIndex >= 0) {
      merged[existingIndex] = {
        ...merged[existingIndex],
        ...incomingUser,
        id: merged[existingIndex].id || incomingUser.id,
        email: (incomingUser.email || merged[existingIndex].email || '').toLowerCase(),
        department: incomingUser.department || merged[existingIndex].department || 'General',
        pod: incomingUser.pod || merged[existingIndex].pod || 'India Pod',
        reportingManager: incomingUser.reportingManager || merged[existingIndex].reportingManager || 'Manager',
        active: incomingUser.active ?? merged[existingIndex].active ?? true,
        avatarColor: incomingUser.avatarColor || merged[existingIndex].avatarColor || '#10b981',
        password: incomingUser.password || merged[existingIndex].password || 'password'
      };
      return;
    }

    merged.push(incomingUser);
  });

  return merged;
};

const mergeUpdatesRecords = (existing: UpdateRecord[], incoming: UpdateRecord[]) => {
  const byKey = new Map<string, UpdateRecord>();
  const merged = [...(existing || []), ...(incoming || [])]
    .filter((entry): entry is UpdateRecord => Boolean(entry && (entry.id || entry.employeeId)));

  merged.forEach((entry) => {
    const key = String(entry.id || `${entry.employeeId || 'unknown'}::${entry.date || ''}::${entry.timestamp || ''}`).trim();
    const previous = byKey.get(key);
    const mergedEntry = previous
      ? {
          ...previous,
          ...entry,
          id: previous.id || entry.id || key,
          employeeId: entry.employeeId || previous.employeeId || '',
          employeeName: entry.employeeName || previous.employeeName || '',
          department: entry.department || previous.department || 'General',
          pod: entry.pod || previous.pod || 'India Pod',
          projectName: entry.projectName || previous.projectName || '',
          date: entry.date || previous.date || '',
          timestamp: entry.timestamp || previous.timestamp || '',
          comments: Array.isArray(entry.comments) ? entry.comments : Array.isArray(previous.comments) ? previous.comments : [],
          completed: Array.isArray(entry.completed) ? entry.completed : Array.isArray(previous.completed) ? previous.completed : [],
          working: Array.isArray(entry.working) ? entry.working : Array.isArray(previous.working) ? previous.working : [],
          blockers: Array.isArray(entry.blockers) ? entry.blockers : Array.isArray(previous.blockers) ? previous.blockers : [],
          files: Array.isArray(entry.files) ? entry.files : Array.isArray(previous.files) ? previous.files : []
        }
      : {
          ...entry,
          id: entry.id || key,
          comments: Array.isArray(entry.comments) ? entry.comments : []
        };

    byKey.set(key, mergedEntry);
  });

  return Array.from(byKey.values()).sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
};

const mergeAttendanceRecords = (existing: AttendanceRecord[], incoming: AttendanceRecord[]) => {
  const byKey = new Map<string, AttendanceRecord>();
  const merged = [...(existing || []), ...(incoming || [])]
    .filter((entry): entry is AttendanceRecord => Boolean(entry && (entry.userId || entry.email || entry.employeeName)));

  merged.forEach((entry) => {
    const key = `${String(entry.userId || '').trim()}::${String(entry.date || '').trim()}::${String(entry.email || '').trim()}`;
    const previous = byKey.get(key);
    const mergedEntry = previous
      ? {
          ...previous,
          ...entry,
          attendanceId: entry.attendanceId || previous.attendanceId || `att-${entry.userId || 'unknown'}-${entry.date || 'unknown'}`,
          userId: entry.userId || previous.userId || '',
          employeeName: entry.employeeName || previous.employeeName || '',
          email: entry.email || previous.email || '',
          department: entry.department || previous.department || '',
          date: entry.date || previous.date || '',
          loginTime: entry.loginTime || previous.loginTime || '',
          logoutTime: entry.logoutTime || previous.logoutTime || '',
          workingHours: entry.workingHours || previous.workingHours || '0h',
          idleTime: entry.idleTime || previous.idleTime || '0m',
          productiveHours: entry.productiveHours || previous.productiveHours || '0h',
          status: entry.status || previous.status || 'Present',
          officeRemote: entry.officeRemote || previous.officeRemote || 'Remote',
          ipAddress: entry.ipAddress || previous.ipAddress || '',
          device: entry.device || previous.device || '',
          browser: entry.browser || previous.browser || '',
          os: entry.os || previous.os || '',
          createdAt: previous.createdAt || entry.createdAt,
          updatedAt: entry.updatedAt || previous.updatedAt || new Date().toISOString()
        }
      : {
          ...entry,
          attendanceId: entry.attendanceId || `att-${entry.userId || 'unknown'}-${entry.date || 'unknown'}`,
          createdAt: entry.createdAt || new Date().toISOString(),
          updatedAt: entry.updatedAt || new Date().toISOString()
        };

    byKey.set(key, mergedEntry);
  });

  return Array.from(byKey.values()).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
};

export const PulseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light'); // Default to the clean white enterprise shell

  // Persistent states from localStorage with seed data fallback
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('pulse-users');
    const parsed = saved ? JSON.parse(saved) : null;
    if (!parsed) return initialUsers;
    // Merge seeded initial users if missing (preserve existing local overrides)
    const lowerEmails = parsed.map((u: any) => String(u.email || '').toLowerCase());
    const missing = initialUsers.filter(u => !lowerEmails.includes(u.email.toLowerCase()));
    if (missing.length === 0) return parsed;
    const merged = [...parsed, ...missing];
    try { localStorage.setItem('pulse-users', JSON.stringify(merged)); } catch {}
    return merged;
  });

  const [updates, setUpdates] = useState<UpdateRecord[]>(() => {
    const saved = localStorage.getItem('pulse-updates');
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed)
      ? parsed.map((update: any) => ({
          ...update,
          comments: Array.isArray(update.comments) ? update.comments : []
        }))
      : [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pulse-current-user');
    return saved ? JSON.parse(saved) : null;
  });

  const [integrationLogs, setIntegrationLogs] = useState<IntegrationLog[]>(() => {
    const saved = localStorage.getItem('pulse-integration-logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem('pulse-notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('pulse-chat-history');
    return saved ? JSON.parse(saved) : initialChatMessages;
  });

  const [mockEmails, setMockEmails] = useState<MockEmail[]>(() => {
    const saved = localStorage.getItem('pulse-mock-emails');
    return saved ? JSON.parse(saved) : initialEmails;
  });

  const [mockChatMessages, setMockChatMessages] = useState<MockChatMessage[]>(() => {
    const saved = localStorage.getItem('pulse-mock-chat-messages');
    return saved ? JSON.parse(saved) : initialMockChatMessages;
  });

  const [templates, setTemplates] = useState<string[]>(() => {
    const saved = localStorage.getItem('pulse-templates');
    return saved ? JSON.parse(saved) : [];
  });

  const [reminders, setReminders] = useState<any[]>(() => {
    const saved = localStorage.getItem('pulse-reminders');
    return saved ? JSON.parse(saved) : [];
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('pulse-attendance');
    return saved ? JSON.parse(saved) : [];
  });

  const [isVoiceLoading, setIsVoiceLoading] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('pulse-users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('pulse-updates', JSON.stringify(updates));
  }, [updates]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('pulse-current-user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('pulse-current-user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('pulse-integration-logs', JSON.stringify(integrationLogs));
  }, [integrationLogs]);

  useEffect(() => {
    localStorage.setItem('pulse-notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('pulse-chat-history', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem('pulse-mock-emails', JSON.stringify(mockEmails));
  }, [mockEmails]);

  useEffect(() => {
    localStorage.setItem('pulse-mock-chat-messages', JSON.stringify(mockChatMessages));
  }, [mockChatMessages]);

  useEffect(() => {
    localStorage.setItem('pulse-templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('pulse-reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('pulse-attendance', JSON.stringify(attendance));
  }, [attendance]);

  // Sync users with backend
  useEffect(() => {
    localStorage.setItem('pulse-users', JSON.stringify(users));
  }, [users]);

  // Projects list
  const projects = ['Website Development', 'Marketplace', 'Client Projects', 'Internal Improvements'];

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('pulse-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setThemeState(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'light'); // Default to the requested clean white theme
    }
  }, []);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    localStorage.setItem('pulse-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const addChatMessage = (sender: 'user' | 'ai', text: string) => {
    setChatHistory(prev => [
      ...prev,
      {
        id: `chat-msg-${Date.now()}`,
        sender,
        text,
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const clearChat = () => {
    setChatHistory([
      { id: `m-${Date.now()}`, sender: 'ai', text: 'Chat logs cleared. How can I help you analyze company progress?', timestamp: new Date().toISOString() }
    ]);
  };

  // Logs outbound API calls
  const logIntegration = (type: 'gmail' | 'chat', recipient: string, subject: string | undefined, body: string, payload: any) => {
    setIntegrationLogs(prev => [
      {
        id: `log-${Date.now()}`,
        type,
        timestamp: new Date().toLocaleTimeString(),
        recipient,
        subject,
        body,
        payloadJSON: JSON.stringify(payload, null, 2)
      },
      ...prev
    ]);
  };

  const apiBase = getApiBase();

  const persistUsers = async (nextUsers: User[]) => {
    // Persist locally first for immediate UX
    localStorage.setItem('pulse-users', JSON.stringify(nextUsers));
    if (!apiBase) return null;

    try {
      const response = await fetch(`${apiBase}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextUsers)
      });

      const json = await response.json().catch(() => null);
      if (!response.ok) {
        console.warn('Failed to persist users to backend:', json || response.statusText);
        return null;
      }

      if (json?.success && Array.isArray(json.users)) {
        // Ensure we preserve any local edits while still applying server-normalized users.
        try {
          setUsers(prev => mergeUsersLists(prev, json.users));
        } catch (e) {
          // swallow setState errors in persistence
        }
        localStorage.setItem('pulse-users', JSON.stringify(mergeUsersLists(nextUsers, json.users)));
        return json.users;
      }

      return null;
    } catch (err) {
      console.warn('Failed to persist users to backend:', err);
      return null;
    }
  };

  // Load persisted users from backend if available (for cross-device sync)
  useEffect(() => {
    if (!apiBase) return;
    (async () => {
      try {
        const resp = await fetch(`${apiBase}/api/users`);
        const json = await resp.json().catch(() => null);
        if (json?.success && Array.isArray(json.users) && json.users.length > 0) {
          setUsers(prev => mergeUsersLists(prev, json.users));
          localStorage.setItem('pulse-users', JSON.stringify(mergeUsersLists(users, json.users)));
        }
      } catch (error) {
        console.warn('Unable to load users from backend, using local data:', error);
      }
    })();
  }, [apiBase]);

  // Load persisted updates from backend if available
  useEffect(() => {
    if (!apiBase) return;
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch(`${apiBase}/api/updates`);
        const json = await resp.json().catch(() => null);
        if (!cancelled && json?.success && Array.isArray(json.updates)) {
          setUpdates((prev) => {
            const next = mergeUpdatesRecords(prev, json.updates as UpdateRecord[]);
            localStorage.setItem('pulse-updates', JSON.stringify(next));
            return next;
          });
        }
      } catch (error) {
        // ignore and continue with local state
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  // Load attendance + templates & reminders from backend
  useEffect(() => {
    if (!apiBase) return;
    let cancelled = false;
    (async () => {
      try {
        const attendanceResp = await fetch(`${apiBase}/api/attendance`);
        const attendanceJson = await attendanceResp.json().catch(() => null);
        if (!cancelled && attendanceJson?.success && Array.isArray(attendanceJson.attendance)) {
          setAttendance((prev) => {
            const next = mergeAttendanceRecords(prev, attendanceJson.attendance);
            localStorage.setItem('pulse-attendance', JSON.stringify(next));
            return next;
          });
        }
      } catch (error) {
        console.warn('Unable to load attendance from backend, using local data:', error);
      }

      try {
        const tResp = await fetch(`${apiBase}/api/templates`);
        const tJson = await tResp.json().catch(() => null);
        if (!cancelled && tJson?.success && Array.isArray(tJson.templates)) {
          setTemplates(tJson.templates);
          localStorage.setItem('pulse-templates', JSON.stringify(tJson.templates));
        }
      } catch (err) {
        // continue with local templates
      }

      try {
        const rResp = await fetch(`${apiBase}/api/reminders`);
        const rJson = await rResp.json().catch(() => null);
        if (!cancelled && rJson?.success && Array.isArray(rJson.reminders)) {
          setReminders(rJson.reminders);
          localStorage.setItem('pulse-reminders', JSON.stringify(rJson.reminders));
        }
      } catch (err) {
        // continue with local reminders
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  const persistTemplates = async (nextTemplates: string[]) => {
    localStorage.setItem('pulse-templates', JSON.stringify(nextTemplates));
    if (!apiBase) return null;
    try {
      const resp = await fetch(`${apiBase}/api/templates`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nextTemplates) });
      const json = await resp.json().catch(() => null);
      if (json?.success && Array.isArray(json.templates)) {
        setTemplates(json.templates);
        localStorage.setItem('pulse-templates', JSON.stringify(json.templates));
        return json.templates;
      }
    } catch (err) {
      console.warn('persist templates failed', err);
    }
    return null;
  };

  const persistReminders = async (nextReminders: any[]) => {
    localStorage.setItem('pulse-reminders', JSON.stringify(nextReminders));
    if (!apiBase) return null;
    try {
      const resp = await fetch(`${apiBase}/api/reminders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nextReminders) });
      const json = await resp.json().catch(() => null);
      if (json?.success && Array.isArray(json.reminders)) {
        setReminders(json.reminders);
        localStorage.setItem('pulse-reminders', JSON.stringify(json.reminders));
        return json.reminders;
      }
    } catch (err) {
      console.warn('persist reminders failed', err);
    }
    return null;
  };

  const recordAttendanceEvent = async (entry: Partial<AttendanceRecord>) => {
    if (!currentUser || !entry.date) return;
    const timestamp = new Date().toISOString();
    const attendanceEntry: AttendanceRecord = {
      attendanceId: entry.attendanceId || `att-${currentUser.id}-${entry.date}`,
      userId: entry.userId || currentUser.id,
      employeeName: entry.employeeName || currentUser.name,
      email: entry.email || currentUser.email,
      department: entry.department || currentUser.department,
      date: entry.date,
      loginTime: entry.loginTime || '',
      logoutTime: entry.logoutTime || '',
      workingHours: entry.workingHours || '0h',
      idleTime: entry.idleTime || '0m',
      productiveHours: entry.productiveHours || '0h',
      status: entry.status || 'Present',
      officeRemote: entry.officeRemote || 'Remote',
      ipAddress: entry.ipAddress || '',
      device: entry.device || '',
      browser: entry.browser || '',
      os: entry.os || '',
      createdAt: entry.createdAt || timestamp,
      updatedAt: entry.updatedAt || timestamp
    };

    setAttendance((prev) => {
      const nextList = mergeAttendanceRecords(prev, [attendanceEntry]);
      localStorage.setItem('pulse-attendance', JSON.stringify(nextList));
      return nextList;
    });
    trackEvent('attendance_recorded', {
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      date: entry.date,
      status: attendanceEntry.status,
      officeRemote: attendanceEntry.officeRemote
    });

    if (!apiBase) return;
    try {
      await fetch(`${apiBase}/api/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendanceEntry)
      });
    } catch (err) {
      console.warn('attendance sync failed', err);
    }
  };

  const trackEvent = (name: string, payload?: any) => {
    try {
      const item = { id: `evt-${Date.now()}`, name, payload: payload || {}, timestamp: new Date().toISOString() };
      const stored = localStorage.getItem('pulse-analytics');
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(item);
      localStorage.setItem('pulse-analytics', JSON.stringify(list.slice(0, 500)));
      // Also add to integration logs for quick visibility
      setIntegrationLogs(prev => [ { id: item.id, type: 'chat', timestamp: item.timestamp, recipient: name, subject: undefined, body: JSON.stringify(payload || {}), payloadJSON: JSON.stringify(payload || {}) }, ...prev ]);
      console.log('Pulse Event:', name, payload || {});
    } catch (err) {
      console.warn('trackEvent failed', err);
    }
  };

  const sendLiveGmail = async (recipientEmail: string, subject: string, body: string) => {
    if (!apiBase || !currentUser?.email) {
      return;
    }

    const payload = {
      endpoint: `${apiBase}/api/send-gmail`,
      request: { senderEmail: currentUser.email, to: recipientEmail, subject, message: body }
    };

    try {
      const response = await fetch(`${apiBase}/api/send-gmail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderEmail: currentUser.email, to: recipientEmail, subject, message: body })
      });
      const result = await response.json().catch(() => null);
      logIntegration('gmail', recipientEmail, subject, body, { ...payload, result, status: response.status });
      return result;
    } catch (error) {
      logIntegration('gmail', recipientEmail, subject, body, { ...payload, error: String(error) });
      return null;
    }
  };

  const sendLiveChat = async (spaceId: string, text: string) => {
    if (!apiBase) {
      return;
    }

    const payload = {
      endpoint: `${apiBase}/api/send-chat`,
      request: { spaceId, text }
    };

    try {
      const response = await fetch(`${apiBase}/api/send-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spaceId, text })
      });
      const result = await response.json().catch(() => null);
      logIntegration('chat', spaceId, undefined, text, { ...payload, result, status: response.status });
      return result;
    } catch (error) {
      logIntegration('chat', spaceId, undefined, text, { ...payload, error: String(error) });
      return null;
    }
  };

  const getChatSpaceId = (department: string) => {
    const dept = department.toLowerCase();
    if (dept.includes('development') || dept.includes('developer')) return 'space_development';
    if (dept.includes('design')) return 'space_design';
    if (dept.includes('marketing')) return 'space_marketing';
    if (dept.includes('sales')) return 'space_sales';
    if (dept.includes('success') || dept.includes('client')) return 'space_client_success';
    return 'space_general';
  };

  // Submit daily updates
  const submitEmployeeUpdate = async (newUpdate: Omit<UpdateRecord, 'id' | 'employeeId' | 'employeeName' | 'department' | 'pod' | 'date' | 'timestamp' | 'comments'>) => {
    if (!currentUser) return { deliveryStatus: 'failed' as const };
    const today = new Date().toISOString().split('T')[0];
    
    // Check if user already submitted for today
    const existingIndex = updates.findIndex(
      u => u.employeeId === currentUser.id && u.date === today
    );

    const record: UpdateRecord = {
      id: existingIndex >= 0 ? updates[existingIndex].id : `up-${currentUser.id}-${today}`,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      department: currentUser.department,
      pod: currentUser.pod,
      date: today,
      completed: newUpdate.completed.filter(s => s.trim() !== ''),
      working: newUpdate.working.filter(s => s.trim() !== ''),
      blockers: newUpdate.blockers.filter(s => s.trim() !== ''),
      priority: newUpdate.priority,
      projectName: newUpdate.projectName,
      files: newUpdate.files,
      timestamp: new Date().toISOString(),
      comments: existingIndex >= 0 ? updates[existingIndex].comments : []
    };

    setUpdates(prev => {
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = record;
        return copy;
      } else {
        return [record, ...prev];
      }
    });
    trackEvent('employee_update_submitted', {
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      date: today,
      projectName: record.projectName,
      blockers: record.blockers
    });

    let deliveryStatus: 'ok' | 'partial' | 'failed' = 'ok';

    try {
      if (!apiBase) {
        return { deliveryStatus: 'partial' as const };
      }

      const response = await fetch(`${apiBase}/api/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...record,
          user: {
            name: currentUser.name,
            email: currentUser.email,
            department: currentUser.department
          }
        })
      });
      const content = await response.json().catch(() => null);
      if (!response.ok) {
        deliveryStatus = 'failed';
      } else if (content?.notification?.deliveryStatus) {
        deliveryStatus = content.notification.deliveryStatus;
      }
    } catch (err) {
      deliveryStatus = 'failed';
    }

    const summaryText = [
      `Hi team, here is the update from ${currentUser.name} for ${record.projectName}`,
      `Employee: ${currentUser.name}`,
      `Department: ${currentUser.department}`,
      `Priority: ${record.priority}`,
      '',
      `Yesterday: ${record.completed.length > 0 ? record.completed.join(' • ') : 'No details provided'}`,
      `Today: ${record.working.length > 0 ? record.working.join(' • ') : 'No details provided'}`,
      `Blockers: ${record.blockers.length > 0 ? record.blockers.join(' • ') : 'No blockers reported'}`,
      '',
      'Please review this progress and follow up if any support is needed.'
    ].join('\n');

    const hasBlockers = record.blockers.length > 0 && 
                         record.blockers[0].toLowerCase() !== 'none' && 
                         record.blockers[0].toLowerCase() !== 'none reported' &&
                         record.blockers[0].trim() !== '';

    setNotifications(prev => [
      {
        id: hasBlockers ? `notif-blocker-${Date.now()}` : `notif-update-${Date.now()}`,
        text: hasBlockers
          ? `Blocker alert! ${currentUser.name} (${currentUser.department}) flagged: "${record.blockers[0]}"`
          : `${currentUser.name} successfully submitted today's status update for ${record.projectName}.`,
        type: hasBlockers ? (record.priority === 'critical' || record.priority === 'high' ? 'blocker' : 'warning') : 'success',
        timestamp: new Date().toISOString(),
        read: false
      },
      ...prev
    ]);

      if (hasBlockers) {
        const blockerSubject = `Blocker Alert Logged: ${record.projectName}`;
        const blockerBody = `Hi ${currentUser.name},\n\nYour blocker has been logged for the project ${record.projectName}:\n"${record.blockers[0]}"\n\nYour manager will be notified and the team space has been updated in Google Chat.\n\nBest,\nMaple Pulse`;

        void sendLiveGmail(currentUser.email, blockerSubject, blockerBody);

        const newEmailRecord: MockEmail = {
          id: `email-${Date.now()}`,
          senderName: 'Maple Pulse Notifications',
          senderEmail: 'notifications@maplelearningsolutions.com',
          recipientEmail: currentUser.email,
          subject: blockerSubject,
          body: blockerBody,
          timestamp: new Date().toISOString(),
          read: false
        };
        setMockEmails(prev => [newEmailRecord, ...prev]);
      }

      const newChatRecord: MockChatMessage = {
        id: `chat-${Date.now()}`,
        spaceId: getChatSpaceId(currentUser.department),
        senderName: 'Maple Pulse Bot',
        senderId: 'system-bot',
        avatarColor: '#8b5cf6',
        text: summaryText,
        timestamp: new Date().toISOString()
      };
      setMockChatMessages(prev => [...prev, newChatRecord]);

    return { deliveryStatus };
  };

  const resetSprintData = async () => {
    try {
      if (apiBase) {
        await fetch(`${apiBase}/api/updates`, { method: 'DELETE' });
      }
    } catch (error) {
      console.warn('Unable to clear sprint updates from backend:', error);
    }

    setUpdates([]);
    localStorage.removeItem('pulse-updates');
  };

  // Post comments and trigger mock integration hooks
  const addCommentToUpdate = (updateId: string, content: string, sentVia: { gmail: boolean; chat: boolean; internal: boolean }) => {
    if (!currentUser) return;
    const updateIndex = updates.findIndex(u => u.id === updateId);
    if (updateIndex === -1) return;

    const targetUpdate = updates[updateIndex];
    const employee = users.find(u => u.id === targetUpdate.employeeId);

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      authorName: currentUser.name,
      content,
      timestamp: new Date().toISOString(),
      sentVia
    };

    const updated = {
      ...targetUpdate,
      comments: [...(Array.isArray(targetUpdate.comments) ? targetUpdate.comments : []), newComment]
    };

    setUpdates(prev => {
      const copy = [...prev];
      copy[updateIndex] = updated;
      return copy;
    });
    trackEvent('comment_reply_sent', {
      updateId,
      employeeId: targetUpdate.employeeId,
      authorName: currentUser.name,
      sentVia
    });

    (async () => {
      try {
        if (!apiBase) return;
        const response = await fetch(`${apiBase}/api/updates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...updated, sendNotification: false, user: { name: currentUser.name, email: currentUser.email, department: currentUser.department } })
        });
        if (!response.ok) {
          const json = await response.json().catch(() => null);
          console.warn('Failed to save comment update to backend:', json || response.statusText);
        }
      } catch (err) {
        console.warn('Unable to persist comment update to backend:', err);
      }
    })();

    // Gmail mock request
    if (sentVia.gmail && employee) {
      const emailSubject = `Manager Feedback Comment - Maple Pulse`;
      const emailBody = `Hi ${employee.name},\n\nExecutive Board Member ${currentUser.name} left a feedback comment on your task update:\n"${content}"\n\nPlease address this comment.\n\nBest,\nMaple Pulse Internal Platform`;
      void sendLiveGmail(employee.email, emailSubject, emailBody);

      // Add to Gmail simulator inbox
      const newEmailRecord: MockEmail = {
        id: `email-${Date.now()}`,
        senderName: currentUser.name,
        senderEmail: currentUser.email,
        recipientEmail: employee.email,
        subject: emailSubject,
        body: emailBody,
        timestamp: new Date().toISOString(),
        read: false
      };
      setMockEmails(prev => [newEmailRecord, ...prev]);
    }

    // Google Chat mock request
    if (sentVia.chat && employee) {
      const chatSpaceId = getChatSpaceId(employee.department);
      const chatBody = `💬 *Manager Comment by ${currentUser.name}*:\nFor employee: *${employee.name}*\nProject: *${targetUpdate.projectName}*\nComment: "${content}"`;
      void sendLiveChat(chatSpaceId, chatBody);

      const newChatRecord: MockChatMessage = {
        id: `chat-${Date.now()}`,
        spaceId: chatSpaceId,
        senderName: currentUser.name,
        senderId: currentUser.id,
        avatarColor: currentUser.avatarColor,
        text: `💬 *Manager Comment* on project *${targetUpdate.projectName}*:\n"${content}"`,
        timestamp: new Date().toISOString()
      };
      setMockChatMessages(prev => [...prev, newChatRecord]);
    }
  };

  // Add new employee
  const createNewUser = (userData: Omit<User, 'id' | 'active' | 'avatarColor'>) => {
    const normalizedEmail = userData.email.trim().toLowerCase();
    const normalizedEmployeeId = userData.employeeId.trim();
    const existingUser = users.find((existing) => {
      const existingEmail = String(existing.email || '').trim().toLowerCase();
      const existingEmpId = String(existing.employeeId || '').trim().toLowerCase();
      return existingEmail === normalizedEmail || existingEmpId === normalizedEmployeeId.toLowerCase();
    });

    if (existingUser) {
      setNotifications(prev => [
        {
          id: `notif-duplicate-user-${Date.now()}`,
          text: `An account already exists with the same email or employee ID. Please choose a unique email or ID.`,
          type: 'warning',
          timestamp: new Date().toISOString(),
          read: false
        },
        ...prev
      ]);
      return;
    }

    const colorOptions = ['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2', '#2563eb', '#4f46e5', '#7c3aed', '#db2777'];
    const randomColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];

    const newUser: User = {
      ...userData,
      email: normalizedEmail,
      employeeId: normalizedEmployeeId,
      id: `emp-${Date.now()}`,
      active: true,
      avatarColor: randomColor,
      password: userData.password || 'password'
    };

    setUsers(prev => {
      const updated = [...prev, newUser];
      void persistUsers(updated);
      return updated;
    });
  };

  const toggleUserActiveStatus = (userId: string) => {
    setUsers(prev => {
      const updated = prev.map(u => (u.id === userId ? { ...u, active: !u.active } : u));
      void persistUsers(updated);
      return updated;
    });
  };

  // Auth Operations
  const login = (loginInput: string, passwordInput: string): boolean => {
    const normalizedLogin = loginInput.trim().toLowerCase();
    const passwordValue = passwordInput.trim();
    if (!normalizedLogin || !passwordValue) return false;

    const matchingUsers = users.filter(
      u => u.email.toLowerCase() === normalizedLogin ||
           u.employeeId.toLowerCase() === normalizedLogin
    );

    const user = matchingUsers.find(u => u.active && u.password === passwordValue);
    if (!user) return false;

    setCurrentUser(user);
    return true;
  };

  const resetPassword = (loginInput: string, newPassword: string): boolean => {
    const normalizedLogin = loginInput.trim().toLowerCase();
    const passwordValue = newPassword.trim();
    if (!normalizedLogin || !passwordValue) return false;

    const targetUser = users.find(
      u => u.active &&
           (u.email.toLowerCase() === normalizedLogin || u.employeeId.toLowerCase() === normalizedLogin)
    );

    if (!targetUser) return false;

    setUsers(prev => {
      const updated = prev.map(user => user.id === targetUser.id ? { ...user, password: passwordValue } : user);
      void persistUsers(updated);
      return updated;
    });

    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const sendDirectChatMessage = (spaceId: string, text: string) => {
    if (!currentUser) return;
    const newMsg: MockChatMessage = {
      id: `chat-direct-${Date.now()}`,
      spaceId,
      senderName: currentUser.name,
      senderId: currentUser.id,
      avatarColor: currentUser.avatarColor || '#6366f1',
      text,
      timestamp: new Date().toISOString()
    };
    setMockChatMessages(prev => [...prev, newMsg]);
  };

  // ElevenLabs Text-to-Speech API integration
  const playElevenLabsTTS = async (text: string) => {
    if (!text) return;
    setIsVoiceLoading(true);
    
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': 'sk_942d3956339d41d5490c65e6c528354a8f4c1a2f8ae7ffca'
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API returned status ${response.status}`);
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      await audio.play();
    } catch (err) {
      console.warn('ElevenLabs TTS failed, falling back to Web Speech Synthesis:', err);
      // Fallback: Web Speech API synthesis
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Cancel any ongoing speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      } else {
        alert('Text to speech is not supported in this browser.');
      }
    } finally {
      setIsVoiceLoading(false);
    }
  };

  // voice parsing model using regex and string matches (Simulated OpenAI parser)
  const parseVoiceUpdateAI = async (voiceText: string): Promise<{ completed: string[]; working: string[]; blockers: string[] }> => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const completed: string[] = [];
    const working: string[] = [];
    const blockers: string[] = [];

    const lower = voiceText.toLowerCase();

    let completedMatch = lower.match(/(?:yesterday|completed|completed tasks|finished|done)\s*(?:i did|i completed|i finished|yesterday's tasks|yesterday)?\s*([^.]+)/);
    let workingMatch = lower.match(/(?:today|working on|current tasks|working|will work on)\s*(?:i will|i am|today's tasks|today)?\s*([^.]+)/);
    let blockerMatch = lower.match(/(?:blocker|blockers|waiting|waiting on|blocked by|challenges|support needed)\s*(?:for|on|by)?\s*([^.]+)/);

    if (completedMatch && completedMatch[1]) completed.push(cleanText(completedMatch[1]));
    if (workingMatch && workingMatch[1]) working.push(cleanText(workingMatch[1]));
    if (blockerMatch && blockerMatch[1]) blockers.push(cleanText(blockerMatch[1]));

    if (completed.length === 0 && working.length === 0 && blockers.length === 0) {
      const sentences = voiceText.split(/[.!?]+/);
      sentences.forEach(s => {
        const cleanS = s.trim();
        if (cleanS.length < 3) return;
        if (cleanS.toLowerCase().includes('wait') || cleanS.toLowerCase().includes('block') || cleanS.toLowerCase().includes('stuck')) {
          blockers.push(cleanS);
        } else if (cleanS.toLowerCase().includes('today') || cleanS.toLowerCase().includes('work') || cleanS.toLowerCase().includes('going to')) {
          working.push(cleanS);
        } else {
          completed.push(cleanS);
        }
      });
    }

    return {
      completed: completed.length > 0 ? completed : ['Completed status checks'],
      working: working.length > 0 ? working : ['Active tasks progression'],
      blockers: blockers.length > 0 ? blockers : ['None']
    };
  };

  const cleanText = (text: string) => {
    return text
      .replace(/^(completed|yesterday i completed|yesterday i|working on|working|today i will work on|today i am|blockers are|blocker is|waiting for|waiting on|blocked by|i will|i did)\s+/i, '')
      .replace(/^\s*-\s*/, '')
      .trim()
      .replace(/^\w/, c => c.toUpperCase());
  };

  // Chatbot logic matching dynamic updates state
  const askExecutiveAI = async (query: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    const lower = query.toLowerCase();
    
    const today = new Date().toISOString().split('T')[0];
    const todayUpdates = updates.filter(u => u.date === today);
    const activeEmployees = users.filter(u => u.role === 'employee' && u.active);

    trackEvent('ai_search', {
      query,
      employeeName: lower.match(/show\s+([a-zA-Z\s]+)'s/i)?.[1] || undefined,
      timestamp: new Date().toISOString()
    });

    // Query 1: Who has not updated?
    if (lower.includes('not updated') || lower.includes('pending updates') || lower.includes('who has not')) {
      if (activeEmployees.length === 0) {
        return "There are no employees registered in the company directory yet. Admin must add employees first.";
      }
      const submittedIds = todayUpdates.map(u => u.employeeId);
      const missing = activeEmployees.filter(e => !submittedIds.includes(e.id));
      
      if (missing.length === 0) {
        return "All registered employees have submitted their daily updates for today!";
      }
      return `Here are the **${missing.length} employees** who haven't submitted today's update:\n` +
        missing.map(e => `- **${e.name}** (${e.department}, Location: ${e.pod})`).join('\n');
    }

    // Query 2: Which projects are blocked? or Blockers
    if (lower.includes('block') || lower.includes('stuck') || lower.includes('issue')) {
      const blockedUpdates = todayUpdates.filter(u => u.blockers.length > 0 && u.blockers[0].toLowerCase() !== 'none' && u.blockers[0].toLowerCase() !== 'none reported' && u.blockers[0].trim() !== '');
      if (blockedUpdates.length === 0) {
        return "No active blockers have been flagged by employees today.";
      }
      return `We have **${blockedUpdates.length} active blockers** flagged today:\n\n` +
        blockedUpdates.map((u, i) => 
          `${i+1}. **${u.employeeName}** (*${u.projectName}*) - ${u.priority.toUpperCase()} priority\n` +
          `   - **Blocker:** ${u.blockers.join(', ')}`
        ).join('\n\n');
    }

    // Query 3: Summarize today's company activity / report
    if (lower.includes('summarize') || lower.includes('report') || lower.includes('overview') || lower.includes('today')) {
      if (todayUpdates.length === 0) {
        return "No updates have been submitted by employees yet today. Summary will generate once status submissions roll in.";
      }
      const blockersCount = todayUpdates.filter(u => u.blockers.length > 0 && u.blockers[0].toLowerCase() !== 'none' && u.blockers[0].trim() !== '').length;
      return `### Maple Pulse Operations Summary\n\n` +
        `- **Submission Compliance**: ${todayUpdates.length} of ${activeEmployees.length} employees submitted updates.\n` +
        `- **Blockers Flagged**: ${blockersCount} active blocker flag(s) requiring attention.\n` +
        `- **Projects Represented**: ${Array.from(new Set(todayUpdates.map(u => u.projectName))).join(', ')}.\n\n` +
        `Ask me for details on specific blockers to follow up.`;
    }

    // Query 4: Show specific employee updates
    const matchedEmployee = activeEmployees.find(u => lower.includes(u.name.toLowerCase()) || lower.includes(u.name.split(' ')[0].toLowerCase()));
    if (matchedEmployee) {
      const empUpdates = updates
        .filter((u) => u.employeeId === matchedEmployee.id)
        .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
      const todaysUpdates = empUpdates.filter((u) => u.date === today);
      const relevantUpdates = todaysUpdates.length > 0 ? todaysUpdates : empUpdates.slice(0, 3);
      if (relevantUpdates.length === 0) {
        return `**${matchedEmployee.name}** (${matchedEmployee.department}) has not submitted any updates yet.`;
      }
      return `### Status Logs for ${matchedEmployee.name}\n\n` +
        relevantUpdates.slice(0, 3).map(u => 
          `**Date: ${u.date}** (Priority: ${u.priority.toUpperCase()})\n` +
          `- **Completed:** ${u.completed.join('; ')}\n` +
          `- **Working:** ${u.working.join('; ')}\n` +
          `- **Blockers:** ${u.blockers.join('; ')}`
        ).join('\n\n');
    }

    return `I can analyze real-time workspace updates. Ask me: \n` +
      `- "Who has not updated today?"\n` +
      `- "Which projects are blocked?"\n` +
      `- "Summarize today's company activity"\n` +
      `- "Show [Employee Name]'s updates"`;
  };

  return (
    <PulseContext.Provider
      value={{
        theme,
        setTheme,
        currentUser,
        setCurrentUser,
        users,
        setUsers,
        updates,
        setUpdates,
        projects,
        integrationLogs,
        notifications,
        setNotifications,
        chatHistory,
        addChatMessage,
        clearChat,
        logIntegration,
        submitEmployeeUpdate,
        resetSprintData,
        addCommentToUpdate,
        createNewUser,
        toggleUserActiveStatus,
        resetPassword,
        parseVoiceUpdateAI,
        askExecutiveAI,
        playElevenLabsTTS,
        trackEvent,
        isVoiceLoading,
        login,
        logout,
        templates,
        setTemplates,
        reminders,
        setReminders,
        attendance,
        setAttendance,
        persistTemplates,
        persistReminders,
        mockEmails,
        setMockEmails,
        mockChatMessages,
        setMockChatMessages,
        sendDirectChatMessage,
        recordAttendanceEvent
      }}
    >
      {children}
    </PulseContext.Provider>
  );
};

export const usePulse = () => {
  const context = useContext(PulseContext);
  if (context === undefined) {
    throw new Error('usePulse must be used within a PulseProvider');
  }
  return context;
};
