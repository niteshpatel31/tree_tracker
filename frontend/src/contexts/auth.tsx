import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

export type UserRole = "citizen" | "officer";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  state: string;
  createdAt: string;
  // Officer-only fields
  department?: string;
  designation?: string;
  employeeId?: string;
}

export interface CitizenSignUpData {
  name: string;
  email: string;
  password: string;
  state: string;
}

export interface OfficerSignUpData {
  name: string;
  email: string;
  password: string;
  state: string;
  employeeId: string;
  department: string;
  designation: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signUpCitizen: (data: CitizenSignUpData) => Promise<{ success: boolean; error?: string }>;
  signUpOfficer: (data: OfficerSignUpData) => Promise<{ success: boolean; error?: string; officerId?: number; otp?: string }>;
  verifyOfficer: (officerId: number, otp: string) => Promise<{ success: boolean; error?: string }>;
  loginCitizen: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginOfficer: (email: string, password: string) => Promise<{ success: boolean; error?: string; officerId?: number }>;
  logout: () => Promise<void>;
}

const TOKEN_KEY = "treetrack_token";
const USER_TYPE_KEY = "treetrack_user_type";

function getToken() { return localStorage.getItem(TOKEN_KEY); }
function getUserType() { return localStorage.getItem(USER_TYPE_KEY) as UserRole | null; }

function storeSession(token: string, userType: UserRole) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_TYPE_KEY, userType);
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_TYPE_KEY);
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const userType = getUserType();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (userType) headers["X-User-Type"] = userType;
  const res = await fetch(path, { ...options, headers: { ...headers, ...(options.headers ?? {}) } });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data: json };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    apiFetch("/api/auth/me").then(({ ok, data }) => {
      if (ok && data.user) setUser(data.user);
      else clearSession();
    }).finally(() => setLoading(false));
  }, []);

  const signUpCitizen = useCallback(async (data: CitizenSignUpData) => {
    const { ok, data: json } = await apiFetch("/api/auth/citizen/signup", { method: "POST", body: JSON.stringify(data) });
    if (!ok) return { success: false, error: json.error ?? "Sign up failed." };
    storeSession(json.token, "citizen");
    setUser(json.user);
    return { success: true };
  }, []);

  const signUpOfficer = useCallback(async (data: OfficerSignUpData) => {
    const { ok, data: json } = await apiFetch("/api/auth/officer/signup", { method: "POST", body: JSON.stringify(data) });
    if (!ok) return { success: false, error: json.error ?? "Sign up failed." };
    return { success: true, officerId: json.officerId, otp: json.otp };
  }, []);

  const verifyOfficer = useCallback(async (officerId: number, otp: string) => {
    const { ok, data: json } = await apiFetch("/api/auth/officer/verify", { method: "POST", body: JSON.stringify({ officerId, otp }) });
    if (!ok) return { success: false, error: json.error ?? "Verification failed." };
    storeSession(json.token, "officer");
    setUser(json.user);
    return { success: true };
  }, []);

  const loginCitizen = useCallback(async (email: string, password: string) => {
    const { ok, data: json } = await apiFetch("/api/auth/citizen/login", { method: "POST", body: JSON.stringify({ email, password }) });
    if (!ok) return { success: false, error: json.error ?? "Login failed." };
    storeSession(json.token, "citizen");
    setUser(json.user);
    return { success: true };
  }, []);

  const loginOfficer = useCallback(async (email: string, password: string) => {
    const { ok, data: json, status } = await apiFetch("/api/auth/officer/login", { method: "POST", body: JSON.stringify({ email, password }) });
    if (!ok) {
      if (status === 403) return { success: false, error: json.error, officerId: json.officerId };
      return { success: false, error: json.error ?? "Login failed." };
    }
    storeSession(json.token, "officer");
    setUser(json.user);
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    clearSession();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signUpCitizen, signUpOfficer, verifyOfficer, loginCitizen, loginOfficer, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
