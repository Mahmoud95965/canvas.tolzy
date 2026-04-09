'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { NormalizedPlan, planFromEntitlements } from './plan';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  plan: NormalizedPlan;
  planLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  refreshPlan: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  plan: 'free',
  planLoading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  getIdToken: async () => null,
  refreshPlan: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<NormalizedPlan>('free');
  const [planLoading, setPlanLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const getIdToken = async (): Promise<string | null> => {
    if (!user) return null;
    return user.getIdToken();
  };

  const refreshPlan = useCallback(async () => {
    if (!user) {
      setPlan('free');
      setPlanLoading(false);
      return;
    }

    setPlanLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/billing/entitlements', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        setPlan('free');
        return;
      }

      const payload = await response.json();
      const entitlements = Array.isArray(payload?.entitlements) ? payload.entitlements : [];
      setPlan(planFromEntitlements(entitlements));
    } catch (error) {
      console.error('Plan refresh error:', error);
      setPlan('free');
    } finally {
      setPlanLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshPlan();
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, loading, plan, planLoading, signInWithGoogle, signOut, getIdToken, refreshPlan }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
