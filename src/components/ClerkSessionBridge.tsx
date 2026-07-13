import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { usePulse } from '../context/PulseContext';

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
];

export const ClerkSessionBridge = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { currentUser, setCurrentUser, users, setUsers, logout } = usePulse();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    const clerkEmail = (user.primaryEmailAddress?.emailAddress || '').trim().toLowerCase();
    const clerkName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || 'Clerk User';
    const clerkEmployeeId = String(user.publicMetadata?.employeeId || `CL-${user.id.slice(0, 8).toUpperCase()}`);

    const seededProfile = seededClerkProfiles.find((candidate) => candidate.email.toLowerCase() === clerkEmail);
    const existingMatch = users.find((candidate) => candidate.email.toLowerCase() === clerkEmail) || seededProfile;

    if (existingMatch) {
      setCurrentUser(existingMatch);
      setUsers((prev) => {
        if (prev.some((candidate) => candidate.email.toLowerCase() === clerkEmail)) {
          return prev;
        }
        return [...prev, existingMatch];
      });
      return;
    }

    const derivedUser = {
      id: user.id,
      name: clerkName,
      email: clerkEmail || `${user.id}@clerk.local`,
      role: 'employee' as const,
      department: 'General',
      pod: 'India Pod' as const,
      reportingManager: 'Manager',
      employeeId: clerkEmployeeId,
      active: true,
      avatarColor: '#10b981'
    };

    setCurrentUser(derivedUser);
    setUsers((prev) => {
      if (prev.some((candidate) => candidate.email.toLowerCase() === clerkEmail)) {
        return prev;
      }
      return [...prev, derivedUser];
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
