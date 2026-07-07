import React, { createContext, useContext, useState, useEffect } from 'react';

// --- TS Interfaces ---
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'executive' | 'employee';
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
  submitEmployeeUpdate: (update: Omit<UpdateRecord, 'id' | 'employeeId' | 'employeeName' | 'department' | 'pod' | 'date' | 'timestamp' | 'comments'>) => void;
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
}

// --- Seed Data (Admin + Executives only, No Fake Data for Employees/Updates) ---
const initialUsers: User[] = [
  { id: 'u-admin', name: 'Admin Root', email: 'info@maplelearningsolutions.com', role: 'admin', department: 'Management', pod: 'India Pod', reportingManager: 'Board', employeeId: 'MP-0000', active: true, avatarColor: '#dc2626', password: 'admin' },
  { id: 'u-sandeep', name: 'Sandeep', email: 'sandeep@maplelearningsolutions.com', role: 'executive', department: 'Web Team', pod: 'India Pod', reportingManager: 'CEO', employeeId: 'MP-0001', active: true, avatarColor: '#ec4899', password: 'executive' },
  { id: 'u-krishna', name: 'Krishna', email: 'krishna@maplelearningsolutions.com', role: 'executive', department: 'eLearning Team', pod: 'India Pod', reportingManager: 'CEO', employeeId: 'MP-0002', active: true, avatarColor: '#6366f1', password: 'executive' },
  { id: 'u-rathish', name: 'Rathish', email: 'rathish@maplelearningsolutions.com', role: 'executive', department: 'Marketing & Sales Team', pod: 'UAE Pod', reportingManager: 'CEO', employeeId: 'MP-0003', active: true, avatarColor: '#f59e0b', password: 'executive' }
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

const RENDER_API_BASE = 'https://update-tool.onrender.com';

const getApiBase = () => {
  return RENDER_API_BASE;
};

const normalizeUserIdentity = (value: string) => value.trim().toLowerCase();

const mergeUsers = (localUsers: User[], backendUsers: User[]) => {
  const merged = new Map<string, User>();

  [...backendUsers, ...localUsers].forEach(user => {
    const emailKey = normalizeUserIdentity(user.email);
    const employeeIdKey = normalizeUserIdentity(user.employeeId);
    const existingEntry = Array.from(merged.entries()).find(([, existing]) =>
      normalizeUserIdentity(existing.email) === emailKey ||
      normalizeUserIdentity(existing.employeeId) === employeeIdKey
    );

    const normalizedUser = {
      ...user,
      email: emailKey,
      employeeId: user.employeeId.trim(),
      active: user.active !== false,
      password: user.password || 'password'
    };

    if (existingEntry) {
      merged.set(existingEntry[0], {
        ...existingEntry[1],
        ...normalizedUser,
        id: existingEntry[1].id || normalizedUser.id
      });
    } else {
      merged.set(user.id, normalizedUser);
    }
  });

  return Array.from(merged.values());
};

export const PulseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light'); // Default to light mode

  // Persistent states from localStorage with seed data fallback
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('pulse-users');
    return saved ? JSON.parse(saved) : initialUsers;
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
      document.documentElement.setAttribute('data-theme', 'light'); // Default light
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
    localStorage.setItem('pulse-users', JSON.stringify(nextUsers));
    if (!apiBase) return;

    try {
      const response = await fetch(`${apiBase}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextUsers)
      });

      if (!response.ok) {
        const json = await response.json().catch(() => null);
        console.warn('Failed to persist users to backend:', json || response.statusText);
      }
    } catch (err) {
      console.warn('Failed to persist users to backend:', err);
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
          setUsers(prev => {
            const mergedUsers = mergeUsers(prev, json.users);
            localStorage.setItem('pulse-users', JSON.stringify(mergedUsers));
            if (mergedUsers.length !== json.users.length) {
              void persistUsers(mergedUsers);
            }
            return mergedUsers;
          });
        }
      } catch (error) {
        console.warn('Unable to load users from backend, using local data:', error);
      }
    })();
  }, [apiBase]);

  // Load persisted updates from backend if available
  useEffect(() => {
    if (!apiBase) return;
    (async () => {
      try {
        const resp = await fetch(`${apiBase}/api/updates`);
        const json = await resp.json().catch(() => null);
        if (json?.success && Array.isArray(json.updates)) {
          setUpdates(json.updates as UpdateRecord[]);
          localStorage.setItem('pulse-updates', JSON.stringify(json.updates));
        }
      } catch (error) {
        // ignore and continue with local state
      }
    })();
  }, [apiBase]);

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
  const submitEmployeeUpdate = (newUpdate: Omit<UpdateRecord, 'id' | 'employeeId' | 'employeeName' | 'department' | 'pod' | 'date' | 'timestamp' | 'comments'>) => {
    if (!currentUser) return;
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

    // Persist to backend (best-effort)
    (async () => {
      try {
        if (!apiBase) return;
        await fetch(`${apiBase}/api/updates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record)
        });
      } catch (err) {
        // ignore persistence failure — app remains functional
      }
    })();

    // Send toast notifications
    const hasBlockers = record.blockers.length > 0 && 
                         record.blockers[0].toLowerCase() !== 'none' && 
                         record.blockers[0].toLowerCase() !== 'none reported' &&
                         record.blockers[0].trim() !== '';

    if (hasBlockers) {
      setNotifications(prev => [
        {
          id: `notif-blocker-${Date.now()}`,
          text: `Blocker alert! ${currentUser.name} (${currentUser.department}) flagged: "${record.blockers[0]}"`,
          type: record.priority === 'critical' || record.priority === 'high' ? 'blocker' : 'warning',
          timestamp: new Date().toISOString(),
          read: false
        },
        ...prev
      ]);

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

      const chatSpaceId = getChatSpaceId(currentUser.department);
      const chatBody = `💬 Blocker logged by ${currentUser.name} for ${record.projectName}: "${record.blockers[0]}"`;
      void sendLiveChat(chatSpaceId, chatBody);

      const newChatRecord: MockChatMessage = {
        id: `chat-${Date.now()}`,
        spaceId: chatSpaceId,
        senderName: 'Maple Pulse Bot',
        senderId: 'system-bot',
        avatarColor: '#8b5cf6',
        text: chatBody,
        timestamp: new Date().toISOString()
      };
      setMockChatMessages(prev => [...prev, newChatRecord]);
    } else {
      setNotifications(prev => [
        {
          id: `notif-update-${Date.now()}`,
          text: `${currentUser.name} successfully submitted today's status update for ${record.projectName}.`,
          type: 'success',
          timestamp: new Date().toISOString(),
          read: false
        },
        ...prev
      ]);
    }
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

    // Persist updated update with new comment (best-effort)
    (async () => {
      try {
        if (!apiBase) return;
        const response = await fetch(`${apiBase}/api/updates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
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
    const colorOptions = ['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2', '#2563eb', '#4f46e5', '#7c3aed', '#db2777'];
    const randomColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];
    
    const newUser: User = {
      ...userData,
      email: userData.email.trim().toLowerCase(),
      employeeId: userData.employeeId.trim(),
      id: `emp-${Date.now()}`,
      active: true,
      avatarColor: randomColor,
      password: userData.password || 'password'
    };

    setUsers(prev => {
      const existingUser = prev.find(user =>
        normalizeUserIdentity(user.email) === normalizeUserIdentity(newUser.email) ||
        normalizeUserIdentity(user.employeeId) === normalizeUserIdentity(newUser.employeeId)
      );
      const updated = existingUser
        ? prev.map(user => user.id === existingUser.id ? { ...user, ...newUser, id: user.id, avatarColor: user.avatarColor || newUser.avatarColor } : user)
        : [...prev, newUser];
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
      const empUpdates = updates.filter(u => u.employeeId === matchedEmployee.id).slice(0, 3);
      if (empUpdates.length === 0) {
        return `**${matchedEmployee.name}** (${matchedEmployee.department}) has not submitted any updates yet.`;
      }
      return `### Status Logs for ${matchedEmployee.name}\n\n` +
        empUpdates.map(u => 
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
        addCommentToUpdate,
        createNewUser,
        toggleUserActiveStatus,
        resetPassword,
        parseVoiceUpdateAI,
        askExecutiveAI,
        playElevenLabsTTS,
        isVoiceLoading,
        login,
        logout,
        mockEmails,
        setMockEmails,
        mockChatMessages,
        setMockChatMessages,
        sendDirectChatMessage
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
