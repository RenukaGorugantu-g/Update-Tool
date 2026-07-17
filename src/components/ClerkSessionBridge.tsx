import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { usePulse } from '../context/PulseContext';

type ClerkRole = 'admin' | 'executive' | 'employer' | 'employee';

const seededClerkProfiles = [
  {
    email: 'info@maplelearningsolutions.com',
    id: 'u-admin',
    name: 'Admin Root',
    role: 'admin' as const,
    department: 'Management',
    pod: 'India Pod' as const,
    reportingManager: 'Board',
    employeeId: 'MP-0000',
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
    active: true,
    avatarColor: '#f59e0b',
    password: 'executive'
  }
  ,{
    email: 'renuka@maplelearningsolutions.com',
    id: 'u-renuka',
    name: 'Renuka',
    role: 'employee' as const,
    department: 'Client Success',
    pod: 'India Pod' as const,
    reportingManager: 'CEO',
    employeeId: 'MP-0004',
    active: true,
    avatarColor: '#7c3aed',
    password: 'executive'
  }
];

export const ClerkSessionBridge = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { currentUser, setCurrentUser, users, setUsers, logout } = usePulse();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    const clerkEmail = (user.primaryEmailAddress?.emailAddress || '').trim().toLowerCase();
    const clerkName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || 'Clerk User';
    const clerkEmployeeId = String(user.publicMetadata?.employeeId || `CL-${user.id.slice(0, 8).toUpperCase()}`);
    const metadataRole = String(user.publicMetadata?.role || user.publicMetadata?.userRole || '').trim().toLowerCase();
    const normalizedMetadataRole = metadataRole === 'admin' || metadataRole === 'executive' || metadataRole === 'employer' || metadataRole === 'employee'
      ? metadataRole as ClerkRole
      : null;

    const seededProfile = seededClerkProfiles.find((candidate) => candidate.email.toLowerCase() === clerkEmail);
    const existingInUsers = users.find((candidate) => String(candidate.email || '').toLowerCase() === clerkEmail || candidate.id === user.id);

    const resolvedRole = (seededProfile?.role || existingInUsers?.role || normalizedMetadataRole || 'employee') as ClerkRole;
    const profileToUse = seededProfile || existingInUsers;

    const normalizedProfile = {
      id: profileToUse?.id || user.id,
      name: clerkName,
      email: (profileToUse?.email || clerkEmail || `${user.id}@clerk.local`).toLowerCase(),
      role: resolvedRole,
      department: profileToUse?.department || 'General',
      pod: profileToUse?.pod || 'India Pod',
      reportingManager: profileToUse?.reportingManager || 'Manager',
      employeeId: profileToUse?.employeeId || clerkEmployeeId,
      active: profileToUse?.active ?? true,
      avatarColor: profileToUse?.avatarColor || '#10b981',
      password: profileToUse?.password || 'password'
    };

    const persistClerkUser = (nextUsers: typeof users) => {
      const nextList = nextUsers;
      localStorage.setItem('pulse-users', JSON.stringify(nextList));
      const apiBase = (import.meta.env.VITE_API_BASE || '').trim().replace(/\/$/, '') || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://update-tool.onrender.com');
      if (!apiBase) return;
      void fetch(`${apiBase}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextList)
      }).catch((error) => console.warn('Unable to persist Clerk user to backend:', error));
    };

    if (profileToUse) {
      setCurrentUser(normalizedProfile);
      setUsers((prev) => {
        const hasMatch = prev.some((candidate) => String(candidate.email || '').toLowerCase() === normalizedProfile.email || String(candidate.id || '').toLowerCase() === String(normalizedProfile.id || '').toLowerCase());
        const nextUsers = hasMatch
          ? prev.map((candidate) => (String(candidate.email || '').toLowerCase() === normalizedProfile.email || String(candidate.id || '').toLowerCase() === String(normalizedProfile.id || '').toLowerCase() ? normalizedProfile : candidate))
          : [...prev, normalizedProfile];
        persistClerkUser(nextUsers);
        return nextUsers;
      });
      return;
    }

    const derivedUser = {
      id: user.id,
      name: clerkName,
      email: clerkEmail || `${user.id}@clerk.local`,
      role: resolvedRole,
      department: 'General',
      pod: 'India Pod' as const,
      reportingManager: 'Manager',
      employeeId: clerkEmployeeId,
      active: true,
      avatarColor: '#10b981',
      password: 'password'
    };

    setCurrentUser(derivedUser);
    setUsers((prev) => {
      const hasMatch = prev.some((candidate) => String(candidate.email || '').toLowerCase() === derivedUser.email || String(candidate.id || '').toLowerCase() === String(derivedUser.id || '').toLowerCase());
      const nextUsers = hasMatch ? prev.map((candidate) => (String(candidate.email || '').toLowerCase() === derivedUser.email || String(candidate.id || '').toLowerCase() === String(derivedUser.id || '').toLowerCase() ? derivedUser : candidate)) : [...prev, derivedUser];
      persistClerkUser(nextUsers);
      return nextUsers;
    });
  }, [isLoaded, isSignedIn, setCurrentUser, setUsers, user, users]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn && currentUser) {
      logout();
    }
  }, [currentUser, isLoaded, isSignedIn, logout]);

  return null;
};
