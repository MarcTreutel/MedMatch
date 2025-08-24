'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';

interface DbUser {
  id: string;
  auth0_id: string;
  email: string;
  name: string;
  role: string;
}

interface UserContextType {
  dbUser: DbUser | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  setUserRole: (role: string) => Promise<void>;
  enableAdminAccess: (adminKey: string) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading: authLoading } = useUser();
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchUser = async () => {
    if (!user?.sub) return;
  
    try {
      setLoading(true);
      console.log("Context: Fetching user with auth0 ID:", user.sub);
    
      const response = await fetch(`http://localhost:3001/api/users/${user.sub}`);
      const data = await response.json();
      console.log("Context: User data from API:", data);
    
      if (data && !data.error) {
        setDbUser(data);
        console.log("Context: User found with role:", data.role);
      
        // 🔥 ADD THIS: Check if user needs to select a role
        if (!data.role || data.role === null) {
          console.log("Context: User has no role, redirecting to role selection");
          router.push('/select-role');
          return;
      }
      
      } else {
        console.log("Context: User not found, creating new user");
        await createUser();
      }
    } catch (err) {
      console.error("Error fetching user:", err);
      setError("Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };


  const createUser = async () => {
    try {
      console.log("Context: Creating new user:", user?.sub);
    
      const response = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth0Id: user?.sub,
          email: user?.email,
          name: user?.name
        }),
      });
    
      const data = await response.json();
      console.log("Context: Create user response:", data);
    
      if (data && !data.error) {
        setDbUser(data);
        console.log("Context: New user created with role:", data.role);
      
        // 🔥 ADD THIS: Check if new user needs to select a role
        if (!data.role || data.role === null) {
          console.log("Context: New user has no role, redirecting to role selection");
          router.push('/select-role');
          return;
        }
      
      } else {
        setError("Failed to create user");
      }
    } catch (err) {
      console.error("Error creating user:", err);
      setError("Failed to create user");
    }
  };


  const setUserRole = async (role: string) => {
    if (!user?.sub) return;
    
    try {
      console.log("Context: Setting user role to:", role);
      
      // For admin users, we don't update the DB role
      if (dbUser?.role === 'admin') {
        console.log("Context: Admin user switching to view:", role);
        // Just redirect to the appropriate dashboard
        if (role === 'student') {
          router.push('/student/dashboard');
        } else if (role === 'clinic') {
          router.push('/clinic/dashboard');
        }
        return;
      }
      
      // For regular users, update their role in the database
      const response = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth0Id: user.sub,
          email: user.email,
          name: user.name,
          role
        }),
      });
      
      const data = await response.json();
      console.log("Context: Set role response:", data);
      
      if (data && !data.error) {
        setDbUser(data);
        console.log("Context: User role updated to:", data.role);
        
        // Redirect to the appropriate dashboard
        if (role === 'student') {
          router.push('/student/dashboard');
        } else if (role === 'clinic') {
          router.push('/clinic/dashboard');
        }
      } else {
        setError("Failed to set user role");
      }
    } catch (err) {
      console.error("Error setting user role:", err);
      setError("Failed to set user role");
    }
  };

  const enableAdminAccess = async (adminKey: string): Promise<boolean> => {
    if (!user?.sub) return false;
    
    try {
      console.log("Context: Enabling admin access");
      // Note: This endpoint might not exist yet, we'll need to create it
      const response = await fetch('http://localhost:3001/api/users/create-first-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetAuth0Id: user.sub,
          superAdminSecret: adminKey
        }),
      });
      
      const data = await response.json();
      console.log("Context: Admin access response:", data);
      
      if (data.success) {
        setDbUser(prev => prev ? { ...prev, role: 'admin' } : null);
        return true;
      }
      
      setError("Invalid admin key");
      return false;
    } catch (err) {
      console.error("Error enabling admin access:", err);
      setError("Failed to enable admin access");
      return false;
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  useEffect(() => {
    if (user && !authLoading) {
      console.log("Context: User logged in, fetching user data");
      fetchUser();
    } else if (!authLoading) {
      console.log("Context: No user logged in");
      setLoading(false);
    }
  }, [user, authLoading]);

  const value = {
    dbUser,
    isAdmin: dbUser?.role === 'admin',
    loading: loading || authLoading,
    error,
    refreshUser,
    setUserRole,
    enableAdminAccess,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
