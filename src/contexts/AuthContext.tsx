import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { CONTENT_API_BASE } from "../content/client";

export type UserRole = "owner" | "admin" | "user";
export type UserStatus = "active" | "disabled";

export type AuthUser = {
  id: string;
  uid?: number;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string;
  isLoading: boolean;
  isAuthenticated: boolean;
  canEditWorkspace: boolean;
  canManageUsers: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (payload: { name: string }) => Promise<AuthUser>;
  changePassword: (payload: { currentPassword: string; newPassword: string }) => Promise<void>;
  authFetch: (input: string, init?: RequestInit) => Promise<Response>;
  refreshUser: () => Promise<void>;
};

const TOKEN_KEY = "anysoul-auth-token";
const USER_CACHE_KEY = "anysoul-auth-user";
const DEMO_USER_KEY = "anysoul-demo-user";
const DEMO_USERS_KEY = "anysoul-demo-users";
const OWNER_ACCOUNT_IDS = ["2546399970"];
const AuthContext = createContext<AuthContextValue | null>(null);
type DemoStoredUser = AuthUser & { password: string };

function authErrorMessage(response: Response, fallback: string, serverMessage?: string) {
  if (response.status === 503) return "账号系统需要先配置 PostgreSQL 数据库：请在后端部署环境设置 DATABASE_URL 后再注册登录。";
  return serverMessage || fallback;
}

async function readAuthJson(response: Response) {
  try {
    return await response.json() as { user?: AuthUser; token?: string; error?: string };
  } catch {
    return {} as { user?: AuthUser; token?: string; error?: string };
  }
}

function normalizeAuthFetchError(error: unknown) {
  if (error instanceof TypeError) {
    return new Error(`无法连接账号服务：请确认内容服务已启动，且 VITE_CONTENT_API_URL 指向正确地址（当前默认 http://localhost:8787）。`);
  }

  return error instanceof Error ? error : new Error("账号请求失败");
}

function isNetworkFetchError(error: unknown) {
  return error instanceof TypeError;
}

function isOwnerAccountIdentifier(...values: string[]) {
  return OWNER_ACCOUNT_IDS.some((accountId) => values.some((value) => value === accountId));
}

function createDemoToken(user: AuthUser) {
  return `demo-${user.role}-${encodeURIComponent(user.id)}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function promoteConfiguredOwner(user: AuthUser) {
  if (!isOwnerAccountIdentifier(user.email, user.name, user.id)) return user;
  return { ...user, role: "owner" as const, status: "active" as const, updatedAt: new Date().toISOString() };
}

function readCachedUser() {
  try {
    const cached = localStorage.getItem(USER_CACHE_KEY);
    return cached ? promoteConfiguredOwner(JSON.parse(cached) as AuthUser) : null;
  } catch {
    return null;
  }
}

function cacheUser(user: AuthUser | null) {
  if (user) localStorage.setItem(USER_CACHE_KEY, JSON.stringify(promoteConfiguredOwner(user)));
  else localStorage.removeItem(USER_CACHE_KEY);
}

function readDemoUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || "[]") as DemoStoredUser[];
    const normalizedUsers = users.map((user, index) => ({ ...user, uid: user.uid || index + 1 }));
    const legacyUser = localStorage.getItem(DEMO_USER_KEY);
    if (legacyUser && !normalizedUsers.length) return [{ ...JSON.parse(legacyUser) as AuthUser, uid: 1, password: "" }];
    return normalizedUsers;
  } catch {
    return [] as DemoStoredUser[];
  }
}

function writeDemoUsers(users: DemoStoredUser[]) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users.map((user, index) => ({ ...promoteConfiguredOwner({ ...user, uid: user.uid || index + 1 }), password: user.password }))));
}

function nextDemoUid() {
  return Math.max(0, ...readDemoUsers().map((user) => user.uid || 0)) + 1;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState<AuthUser | null>(() => localStorage.getItem(TOKEN_KEY) ? readCachedUser() : null);
  const [isLoading, setIsLoading] = useState(true);

  const authFetch = async (input: string, init: RequestInit = {}) => {
    const headers = new Headers(init.headers);
    const effectiveToken = token.startsWith("demo-") && user ? createDemoToken(promoteConfiguredOwner(user)) : token;
    if (effectiveToken) headers.set("Authorization", `Bearer ${effectiveToken}`);

    return fetch(input, { ...init, headers });
  };

  const applySession = (nextToken: string, nextUser: AuthUser) => {
    const promotedUser = promoteConfiguredOwner(nextUser);
    localStorage.setItem(TOKEN_KEY, nextToken);
    cacheUser(promotedUser);
    setToken(nextToken);
    setUser(promotedUser);
  };

  const applyDemoSession = (payload: { name: string; email: string; password: string }) => {
    const now = new Date().toISOString();
    const demoUser = promoteConfiguredOwner({
      id: `demo-user-${Date.now()}`,
      uid: nextDemoUid(),
      email: payload.email.trim().toLowerCase(),
      name: payload.name.trim() || payload.email.split("@")[0] || "Demo User",
      role: "user",
      status: "active",
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now
    });

    const demoUsers = readDemoUsers().filter((item) => item.email !== demoUser.email);
    writeDemoUsers([{ ...demoUser, password: payload.password }, ...demoUsers]);
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
    applySession(createDemoToken(demoUser), demoUser);
  };

  const refreshUser = async () => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    if (token.startsWith("demo-")) {
      const demoUser = localStorage.getItem(DEMO_USER_KEY);
      const parsedDemoUser = demoUser ? promoteConfiguredOwner(JSON.parse(demoUser) as AuthUser) : null;
      if (parsedDemoUser) localStorage.setItem(DEMO_USER_KEY, JSON.stringify(parsedDemoUser));
      cacheUser(parsedDemoUser);
      setUser(parsedDemoUser);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${CONTENT_API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json() as { user: AuthUser | null };
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setUser(null);
          localStorage.removeItem(TOKEN_KEY);
          cacheUser(null);
          setToken("");
          return;
        }

        const cachedUser = readCachedUser();
        if (cachedUser) setUser(cachedUser);
        return;
      }
      const nextUser = data.user ? promoteConfiguredOwner(data.user) : null;
      setUser(nextUser);
      cacheUser(nextUser);
      if (!data.user) {
        localStorage.removeItem(TOKEN_KEY);
        cacheUser(null);
        setToken("");
      }
    } catch {
      const cachedUser = readCachedUser();
      if (cachedUser) setUser(cachedUser);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshUser();
  }, [token]);

  useEffect(() => {
    if (!user) return;
    const promotedUser = promoteConfiguredOwner(user);
    if (promotedUser.role === user.role && promotedUser.status === user.status) return;

    if (token.startsWith("demo-")) localStorage.setItem(DEMO_USER_KEY, JSON.stringify(promotedUser));
    cacheUser(promotedUser);
    setUser(promotedUser);
  }, [user, token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${CONTENT_API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (response.status === 503) {
        const demoEmail = email.trim().toLowerCase();
        const parsedDemoUser = readDemoUsers().find((item) => item.email === demoEmail && (!item.password || item.password === password));
        if (parsedDemoUser) {
          const promotedDemoUser = promoteConfiguredOwner({ ...parsedDemoUser, lastLoginAt: new Date().toISOString() });
          localStorage.setItem(DEMO_USER_KEY, JSON.stringify(promotedDemoUser));
          applySession(createDemoToken(promotedDemoUser), promotedDemoUser);
          return;
        }
      }
      const data = await readAuthJson(response);
      if (!response.ok || !data.user || !data.token) throw new Error(authErrorMessage(response, "登录失败", data.error));
      applySession(data.token, data.user);
    } catch (error) {
      if (isNetworkFetchError(error)) {
        const demoEmail = email.trim().toLowerCase();
        const parsedDemoUser = readDemoUsers().find((item) => item.email === demoEmail && (!item.password || item.password === password));
        if (parsedDemoUser) {
          const promotedDemoUser = promoteConfiguredOwner({ ...parsedDemoUser, lastLoginAt: new Date().toISOString() });
          localStorage.setItem(DEMO_USER_KEY, JSON.stringify(promotedDemoUser));
          applySession(createDemoToken(promotedDemoUser), promotedDemoUser);
          return;
        }
      }

      throw normalizeAuthFetchError(error);
    }
  };

  const register = async (payload: { name: string; email: string; password: string }) => {
    try {
      const response = await fetch(`${CONTENT_API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.status === 503) {
        applyDemoSession(payload);
        return;
      }
      const data = await readAuthJson(response);
      if (!response.ok || !data.user || !data.token) throw new Error(authErrorMessage(response, "注册失败", data.error));
      applySession(data.token, data.user);
    } catch (error) {
      if (isNetworkFetchError(error)) {
        applyDemoSession(payload);
        return;
      }

      throw normalizeAuthFetchError(error);
    }
  };

  const logout = async () => {
    if (token && !token.startsWith("demo-")) {
      await fetch(`${CONTENT_API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => undefined);
    }

    localStorage.removeItem(TOKEN_KEY);
    cacheUser(null);
    setToken("");
    setUser(null);
  };

  const updateDemoProfile = (payload: { name: string }) => {
    if (!user) throw new Error("请先登录");
    const now = new Date().toISOString();
    const nextUser = promoteConfiguredOwner({ ...user, name: payload.name.trim(), updatedAt: now });
    const demoUsers = readDemoUsers().map((item) => item.id === nextUser.id ? { ...item, name: nextUser.name, updatedAt: now } : item);
    writeDemoUsers(demoUsers);
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(nextUser));
    applySession(createDemoToken(nextUser), nextUser);
    return nextUser;
  };

  const updateProfile = async (payload: { name: string }) => {
    const name = payload.name.trim();
    if (!name) throw new Error("用户名不能为空");
    if (token.startsWith("demo-")) return updateDemoProfile({ name });

    const response = await authFetch(`${CONTENT_API_BASE}/api/auth/me/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    const data = await readAuthJson(response);
    if (!response.ok || !data.user) throw new Error(authErrorMessage(response, "用户名修改失败", data.error));
    applySession(token, data.user);
    return data.user;
  };

  const changePassword = async (payload: { currentPassword: string; newPassword: string }) => {
    if (payload.newPassword.length < 8) throw new Error("新密码至少需要 8 位");

    if (token.startsWith("demo-")) {
      if (!user) throw new Error("请先登录");
      const demoUsers = readDemoUsers();
      const target = demoUsers.find((item) => item.id === user.id);
      if (target?.password && target.password !== payload.currentPassword) throw new Error("当前密码不正确");
      writeDemoUsers(demoUsers.map((item) => item.id === user.id ? { ...item, password: payload.newPassword, updatedAt: new Date().toISOString() } : item));
      return;
    }

    const response = await authFetch(`${CONTENT_API_BASE}/api/auth/me/password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await readAuthJson(response);
    if (!response.ok) throw new Error(authErrorMessage(response, "密码修改失败", data.error));
    if (data.user) applySession(token, data.user);
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(user),
    canEditWorkspace: user?.role === "owner" || user?.role === "admin",
    canManageUsers: user?.role === "owner",
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    authFetch,
    refreshUser
  }), [user, token, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
