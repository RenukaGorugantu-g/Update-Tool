// import { useEffect } from 'react';
// import { useUser } from '@clerk/clerk-react';
// import { usePulse } from '../context/PulseContext';

// type ClerkRole = 'admin' | 'executive' | 'employer' | 'employee';

// const seededClerkProfiles = [
//   {
//     email: 'info@maplelearningsolutions.com',
//     id: 'u-admin',
//     name: 'Admin Root',
//     role: 'admin' as const,
//     department: 'Management',
//     pod: 'India Pod' as const,
//     reportingManager: 'Board',
//     employeeId: 'MP-0000',
//     active: true,
//     avatarColor: '#dc2626',
//     password: 'admin'
//   },
//   {
//     email: 'sandeep@maplelearningsolutions.com',
//     id: 'u-sandeep',
//     name: 'Sandeep',
//     role: 'executive' as const,
//     department: 'Web Team',
//     pod: 'India Pod' as const,
//     reportingManager: 'CEO',
//     employeeId: 'MP-0001',
//     active: true,
//     avatarColor: '#ec4899',
//     password: 'executive'
//   },
//   {
//     email: 'krishna@maplelearningsolutions.com',
//     id: 'u-krishna',
//     name: 'Krishna',
//     role: 'executive' as const,
//     department: 'eLearning Team',
//     pod: 'India Pod' as const,
//     reportingManager: 'CEO',
//     employeeId: 'MP-0002',
//     active: true,
//     avatarColor: '#6366f1',
//     password: 'executive'
//   },
//   {
//     email: 'rathish@maplelearningsolutions.com',
//     id: 'u-rathish',
//     name: 'Rathish',
//     role: 'executive' as const,
//     department: 'Marketing & Sales Team',
//     pod: 'UAE Pod' as const,
//     reportingManager: 'CEO',
//     employeeId: 'MP-0003',
//     active: true,
//     avatarColor: '#f59e0b',
//     password: 'executive'
//   }
//   ,{
//     email: 'renuka@maplelearningsolutions.com',
//     id: 'u-renuka',
//     name: 'Renuka',
//     role: 'employee' as const,
//     department: 'Client Success',
//     pod: 'India Pod' as const,
//     reportingManager: 'CEO',
//     employeeId: 'MP-0004',
//     active: true,
//     avatarColor: '#7c3aed',
//     password: 'executive'
//   }
// ];

// const upsertUserIntoList = (prevUsers: ReturnType<typeof usePulse>['users'], incomingUser: ReturnType<typeof usePulse>['users'][number]) => {
//   const normalizedEmail = String(incomingUser.email || '').trim().toLowerCase();
//   const normalizedId = String(incomingUser.id || '').trim().toLowerCase();
//   const existingIndex = prevUsers.findIndex((candidate) => {
//     const candidateEmail = String(candidate.email || '').trim().toLowerCase();
//     const candidateId = String(candidate.id || '').trim().toLowerCase();
//     return candidateEmail === normalizedEmail || candidateId === normalizedId;
//   });

//   if (existingIndex >= 0) {
//     const existing = prevUsers[existingIndex];
//     const mergedUser = {
//       ...existing,
//       ...incomingUser,
//       id: existing.id || incomingUser.id,
//       email: (incomingUser.email || existing.email || '').toLowerCase(),
//       department: incomingUser.department || existing.department || 'General',
//       pod: incomingUser.pod || existing.pod || 'India Pod',
//       reportingManager: incomingUser.reportingManager || existing.reportingManager || 'Manager',
//       active: incomingUser.active ?? existing.active ?? true,
//       avatarColor: incomingUser.avatarColor || existing.avatarColor || '#10b981',
//       password: incomingUser.password || existing.password || 'password'
//     };
//     const nextUsers = [...prevUsers];
//     nextUsers[existingIndex] = mergedUser;
//     return nextUsers;
//   }

//   return [...prevUsers, incomingUser];
// };

// export const ClerkSessionBridge = () => {
//   const { user, isLoaded, isSignedIn } = useUser();
//   const { currentUser, setCurrentUser, users, setUsers, logout } = usePulse();

//   useEffect(() => {
//     if (!isLoaded || !isSignedIn || !user) return;

//     const clerkEmail = (user.primaryEmailAddress?.emailAddress || '').trim().toLowerCase();
//     const clerkName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || 'Clerk User';
//     const clerkEmployeeId = String(user.publicMetadata?.employeeId || `CL-${user.id.slice(0, 8).toUpperCase()}`);
//     const metadataRole = String(user.publicMetadata?.role || user.publicMetadata?.userRole || '').trim().toLowerCase();
//     const normalizedMetadataRole = metadataRole === 'admin' || metadataRole === 'executive' || metadataRole === 'employer' || metadataRole === 'employee'
//       ? metadataRole as ClerkRole
//       : null;

//     const seededProfile = seededClerkProfiles.find((candidate) => candidate.email.toLowerCase() === clerkEmail);
//     const existingInUsers = users.find((candidate) => String(candidate.email || '').toLowerCase() === clerkEmail || candidate.id === user.id);

//     const resolvedRole = (seededProfile?.role || existingInUsers?.role || normalizedMetadataRole || 'employee') as ClerkRole;
//     const profileToUse = seededProfile || existingInUsers;

//     const normalizedProfile = {
//       id: profileToUse?.id || user.id,
//       name: clerkName,
//       email: (profileToUse?.email || clerkEmail || `${user.id}@clerk.local`).toLowerCase(),
//       role: resolvedRole,
//       department: profileToUse?.department || 'General',
//       pod: profileToUse?.pod || 'India Pod',
//       reportingManager: profileToUse?.reportingManager || 'Manager',
//       employeeId: profileToUse?.employeeId || clerkEmployeeId,
//       active: profileToUse?.active ?? true,
//       avatarColor: profileToUse?.avatarColor || '#10b981',
//       password: profileToUse?.password || 'password'
//     };

//     const persistClerkUser = (nextUsers: typeof users) => {
//       const nextList = nextUsers;
//       localStorage.setItem('pulse-users', JSON.stringify(nextList));
//       const apiBase = (import.meta.env.VITE_API_BASE || '').trim().replace(/\/$/, '') || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://update-tool.onrender.com');
//       if (!apiBase) return;
//       void fetch(`${apiBase}/api/users`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(nextList)
//       }).catch((error) => console.warn('Unable to persist Clerk user to backend:', error));
//     };

//     if (profileToUse) {
//       setCurrentUser(normalizedProfile);
//       setUsers((prev) => {
//         const nextUsers = upsertUserIntoList(prev, normalizedProfile);
//         persistClerkUser(nextUsers);
//         return nextUsers;
//       });
//       return;
//     }

//     const derivedUser = {
//       id: user.id,
//       name: clerkName,
//       email: clerkEmail || `${user.id}@clerk.local`,
//       role: resolvedRole,
//       department: 'General',
//       pod: 'India Pod' as const,
//       reportingManager: 'Manager',
//       employeeId: clerkEmployeeId,
//       active: true,
//       avatarColor: '#10b981',
//       password: 'password'
//     };

//     setCurrentUser(derivedUser);
//     setUsers((prev) => {
//       const nextUsers = upsertUserIntoList(prev, derivedUser);
//       persistClerkUser(nextUsers);
//       return nextUsers;
//     });
//   }, [isLoaded, isSignedIn, setCurrentUser, setUsers, user, users]);

//   useEffect(() => {
//     if (!isLoaded) return;
//     if (!isSignedIn && currentUser) {
//       logout();
//     }
//   }, [currentUser, isLoaded, isSignedIn, logout]);

//   return null;
// };
import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { usePulse } from '../context/PulseContext';

type ClerkRole = 'admin' | 'executive' | 'employer' | 'employee';

// Only used to BOOTSTRAP an account the very first time it's ever seen.
// Once a real record exists (and may have been edited by an admin),
// that record always wins — see profileToUse below.
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
    active: true,
    avatarColor: '#7c3aed',
    password: 'executive'
  }
];

type PulseUser = ReturnType<typeof usePulse>['users'][number];

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
      active: incomingUser.active ?? existing.active ?? true,
      avatarColor: incomingUser.avatarColor || existing.avatarColor || '#10b981',
      password: incomingUser.password || existing.password || 'password'
    };
    // No real change — return the SAME array reference so callers can
    // skip persisting/re-rendering instead of looping forever.
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

  // Prevents re-processing (and re-persisting) for the same Clerk session
  // once we've already resolved it, even if `setUsers` triggers re-renders.
  const resolvedForUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;
    if (resolvedForUserIdRef.current === user.id) return;

    const clerkEmail = (user.primaryEmailAddress?.emailAddress || '').trim().toLowerCase();
    const clerkName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || 'Clerk User';
    const clerkEmployeeId = String(user.publicMetadata?.employeeId || `CL-${user.id.slice(0, 8).toUpperCase()}`);
    const metadataRole = String(user.publicMetadata?.role || user.publicMetadata?.userRole || '').trim().toLowerCase();
    const normalizedMetadataRole = metadataRole === 'admin' || metadataRole === 'executive' || metadataRole === 'employer' || metadataRole === 'employee'
      ? metadataRole as ClerkRole
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

      // THE FIX: an existing (possibly admin-edited) record always wins over
      // the hardcoded seed. The seed is only a bootstrap default for an
      // account that has never been saved before. Previously
      // `seededProfile || existingInUsers` meant any edit to role/pod/
      // department for the 5 seeded accounts (admin, sandeep, krishna,
      // rathish, renuka) was silently overwritten the next time that
      // person logged in via Clerk.
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
        active: profileToUse?.active ?? true,
        avatarColor: profileToUse?.avatarColor || '#10b981',
        password: profileToUse?.password || 'password'
      };

      resolvedProfile = normalizedProfile;
      const nextUsers = upsertUserIntoList(prev, normalizedProfile);

      // Only hit the backend when something actually changed — the old
      // code persisted on every effect run, and since `users` was also a
      // dependency of this effect, that produced a runaway loop of writes.
      if (nextUsers !== prev) {
        persistClerkUser(nextUsers);
      }

      return nextUsers;
    });

    if (resolvedProfile) {
      setCurrentUser(resolvedProfile);
    }

    resolvedForUserIdRef.current = user.id;
    // Intentionally NOT depending on `users` — we read the latest list via
    // the functional setUsers updater instead, so this effect only needs
    // to re-run when the Clerk session itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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