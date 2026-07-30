import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { usePulse } from '../context/PulseContext';

type ClerkRole = 'admin' | 'executive' | 'employer' | 'employee';

type PulseUser = ReturnType<typeof usePulse>['users'][number];

const seededClerkProfiles: PulseUser[] = [
  {
    email: 'info@maplelearningsolutions.com',
    id: 'u-admin',
    name: 'Admin Root',
    role: 'admin' as const,
    department: 'Management',
    pod: 'India Pod' as const,
    reportingManager: 'Board',
    employeeId: 'MP-0000',
    employmentType: 'Full-time',
    active: true,
    avatarColor: '#dc2626',
    password: 'admin'
  },
  {
    email: 'sandeep@maplelearningsolutions.com',
    id: 'u-sandeep',
    name: 'Sandeep',
    role: 'executive' as const,
    department: 'Web Team',
    pod: 'India Pod' as const,
    reportingManager: 'CEO',
    employeeId: 'MP-0001',
    employmentType: 'Full-time',
    active: true,
    avatarColor: '#ec4899',
    password: 'executive'
  },
  {
    email: 'krishna@maplelearningsolutions.com',
    id: 'u-krishna',
    name: 'Krishna',
    role: 'executive' as const,
    department: 'eLearning Team',
    pod: 'India Pod' as const,
    reportingManager: 'CEO',
    employeeId: 'MP-0002',
    employmentType: 'Full-time',
    active: true,
    avatarColor: '#6366f1',
    password: 'executive'
  },
  {
    email: 'rathish@maplelearningsolutions.com',
    id: 'u-rathish',
    name: 'Rathish',
    role: 'executive' as const,
    department: 'Marketing & Sales Team',
    pod: 'UAE Pod' as const,
    reportingManager: 'CEO',
    employeeId: 'MP-0003',
    employmentType: 'Full-time',
    active: true,
    avatarColor: '#f59e0b',
    password: 'executive'
  },
  {
    email: 'renuka@maplelearningsolutions.com',
    id: 'u-renuka',
    name: 'Renuka',
    role: 'employee' as const,
    department: 'Client Success',
    pod: 'India Pod' as const,
    reportingManager: 'CEO',
    employeeId: 'MP-0004',
    employmentType: 'Full-time',
    active: true,
    avatarColor: '#7c3aed',
    password: 'executive'
  }
];

const upsertUserIntoList = (prevUsers: PulseUser[], incomingUser: PulseUser) => {
  const normalizedEmail = String(incomingUser.email || '').trim().toLowerCase();
  const normalizedId = String(incomingUser.id || '').trim().toLowerCase();
  const existingIndex = prevUsers.findIndex((candidate) => {
    const candidateEmail = String(candidate.email || '').trim().toLowerCase();
    const candidateId = String(candidate.id || '').trim().toLowerCase();
    return candidateEmail === normalizedEmail || candidateId === normalizedId;
  });

  if (existingIndex >= 0) {
    const existing = prevUsers[existingIndex];
    const mergedUser = {
      ...existing,
      ...incomingUser,
      id: existing.id || incomingUser.id,
      email: (incomingUser.email || existing.email || '').toLowerCase(),
      department: incomingUser.department || existing.department || 'General',
      pod: incomingUser.pod || existing.pod || 'India Pod',
      reportingManager: incomingUser.reportingManager || existing.reportingManager || 'Manager',
      employmentType: incomingUser.employmentType || existing.employmentType || 'Full-time',
      active: incomingUser.active ?? existing.active ?? true,
      avatarColor: incomingUser.avatarColor || existing.avatarColor || '#10b981',
      password: incomingUser.password || existing.password || 'password'
    };

    if (JSON.stringify(mergedUser) === JSON.stringify(existing)) {
      return prevUsers;
    }

    const nextUsers = [...prevUsers];
    nextUsers[existingIndex] = mergedUser;
    return nextUsers;
  }

  return [...prevUsers, incomingUser];
};

export const ClerkSessionBridge = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { currentUser, setCurrentUser, setUsers, logout } = usePulse();
  const resolvedForUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;
    if (resolvedForUserIdRef.current === user.id) return;

    const clerkEmail = (user.primaryEmailAddress?.emailAddress || '').trim().toLowerCase();
    const clerkName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || 'Clerk User';
    const clerkEmployeeId = String(user.publicMetadata?.employeeId || `CL-${user.id.slice(0, 8).toUpperCase()}`);
    const metadataRole = String(user.publicMetadata?.role || user.publicMetadata?.userRole || '').trim().toLowerCase();
    const normalizedMetadataRole = ['admin', 'executive', 'employer', 'employee'].includes(metadataRole)
      ? (metadataRole as ClerkRole)
      : null;

    const persistClerkUser = (nextUsers: PulseUser[]) => {
      localStorage.setItem('pulse-users', JSON.stringify(nextUsers));
      const apiBase = (import.meta.env.VITE_API_BASE || '').trim().replace(/\/$/, '') || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://update-tool.onrender.com');
      if (!apiBase) return;
      void fetch(`${apiBase}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextUsers)
      }).catch((error) => console.warn('Unable to persist Clerk user to backend:', error));
    };

    let resolvedProfile: PulseUser | null = null;

    setUsers((prev) => {
      const seededProfile = seededClerkProfiles.find((candidate) => candidate.email.toLowerCase() === clerkEmail);
      const existingInUsers = prev.find((candidate) => String(candidate.email || '').toLowerCase() === clerkEmail || candidate.id === user.id);
      const profileToUse = existingInUsers || seededProfile;
      const resolvedRole = (existingInUsers?.role || seededProfile?.role || normalizedMetadataRole || 'employee') as ClerkRole;

      const normalizedProfile: PulseUser = {
        id: profileToUse?.id || user.id,
        name: clerkName,
        email: (profileToUse?.email || clerkEmail || `${user.id}@clerk.local`).toLowerCase(),
        role: resolvedRole,
        department: profileToUse?.department || 'General',
        pod: profileToUse?.pod || 'India Pod',
        reportingManager: profileToUse?.reportingManager || 'Manager',
        employeeId: profileToUse?.employeeId || clerkEmployeeId,
        employmentType: profileToUse?.employmentType || 'Full-time',
        active: profileToUse?.active ?? true,
        avatarColor: profileToUse?.avatarColor || '#10b981',
        password: profileToUse?.password || 'password'
      };

      const nextUsers = upsertUserIntoList(prev, normalizedProfile);
      if (nextUsers !== prev) {
        persistClerkUser(nextUsers);
      }

      resolvedProfile = normalizedProfile;
      return nextUsers;
    });

    if (resolvedProfile) {
      setCurrentUser(resolvedProfile);
    }

    resolvedForUserIdRef.current = user.id;
  }, [isLoaded, isSignedIn, user, setCurrentUser, setUsers]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn && currentUser) {
      resolvedForUserIdRef.current = null;
      logout();
    }
  }, [currentUser, isLoaded, isSignedIn, logout]);

  return null;
};
