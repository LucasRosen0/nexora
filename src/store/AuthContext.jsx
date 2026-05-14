import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AUTH_KEY = 'nexora.auth.session.v1';
const SESSION_HOURS = 8;

const DEMO = {
  email: 'admin@nexora.com',
  password: '123456',
  name: 'Lucas Operador',
  role: 'Administrator'
};

const AuthContext = createContext(null);

function readSession() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token || !parsed?.expiresAt) return null;
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(AUTH_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(AUTH_KEY);
    return null;
  }
}

function emailLooksValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || '').trim());
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readSession());

  useEffect(() => {
    function onStorage(e) {
      if (e.key === AUTH_KEY) setSession(readSession());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const signIn = useCallback(async (email, password) => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPwd = String(password || '');
    if (!cleanEmail || !cleanPwd) {
      return { ok: false, code: 'required' };
    }
    if (!emailLooksValid(cleanEmail)) {
      return { ok: false, code: 'email' };
    }
    // Tiny artificial delay so the loading state is perceptible.
    await new Promise((r) => setTimeout(r, 280));
    if (cleanEmail !== DEMO.email || cleanPwd !== DEMO.password) {
      return { ok: false, code: 'invalid' };
    }
    const next = {
      email: DEMO.email,
      name: DEMO.name,
      role: DEMO.role,
      token: crypto.randomUUID(),
      issuedAt: Date.now(),
      expiresAt: Date.now() + SESSION_HOURS * 60 * 60 * 1000
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(next));
    setSession(next);
    return { ok: true };
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, isAuthenticated: !!session, signIn, signOut, demo: { email: DEMO.email, password: DEMO.password } }),
    [session, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
