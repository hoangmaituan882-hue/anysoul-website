import { useEffect, useState } from "react";
import { Plus, RefreshCw, Shield, UserCog } from "lucide-react";
import { CONTENT_API_BASE } from "../content/client";
import { type AuthUser, type UserRole, type UserStatus, useAuth } from "../contexts/AuthContext";

const roleLabels: Record<UserRole, string> = { owner: "站主", admin: "管理员", user: "普通用户" };
const statusLabels: Record<UserStatus, string> = { active: "启用", disabled: "禁用" };
const DEMO_USERS_KEY = "anysoul-demo-users";
const DEMO_USER_KEY = "anysoul-demo-user";

type DemoStoredUser = AuthUser & { password: string };

function readDemoUsers(currentUser: AuthUser | null) {
  try {
    const stored = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || "[]") as DemoStoredUser[];
    if (stored.length) return stored;
  } catch {
    // Ignore malformed demo user storage.
  }

  return currentUser ? [{ ...currentUser, password: "" }] : [];
}

function writeDemoUsers(users: DemoStoredUser[]) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
}

export function UserAdminPanel() {
  const { authFetch, user: currentUser, token, refreshUser } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [status, setStatus] = useState("正在加载用户...");
  const [isSaving, setIsSaving] = useState(false);
  const [draftUser, setDraftUser] = useState({ name: "", email: "", password: "", role: "user" as UserRole, status: "active" as UserStatus });
  const isDemoMode = token.startsWith("demo-");

  async function loadUsers() {
    try {
      const response = await authFetch(`${CONTENT_API_BASE}/api/admin/users`);
      const data = await response.json() as { users?: AuthUser[]; error?: string };
      if (!response.ok) throw new Error(data.error || "用户加载失败");
      setUsers(data.users || []);
      setStatus(`已加载 ${data.users?.length || 0} 个用户`);
    } catch (error) {
      if (!isDemoMode) {
        setUsers([]);
        setStatus(error instanceof Error ? `用户加载失败：${error.message}` : "用户加载失败");
        return;
      }

      const demoUsers = readDemoUsers(currentUser);
      setUsers(demoUsers);
      setStatus(`账号服务不可用，已切换本地演示用户管理，共 ${demoUsers.length} 个用户`);
    }
  }

  useEffect(() => {
    loadUsers().catch((error) => setStatus(error instanceof Error ? error.message : "用户加载失败"));
  }, []);

  async function updateUser(target: AuthUser, patch: Partial<Pick<AuthUser, "role" | "status" | "name">>) {
    setIsSaving(true);
    setStatus(`正在更新 ${target.email}...`);

    try {
      const response = await authFetch(`${CONTENT_API_BASE}/api/admin/users/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch)
      });
      const data = await response.json() as { users?: AuthUser[]; error?: string };
      if (!response.ok) throw new Error(data.error || "用户更新失败");
      setUsers(data.users || []);
      setStatus("用户权限已更新");
    } catch (error) {
      if (!isDemoMode) {
        setStatus(error instanceof Error ? `用户更新失败：${error.message}` : "用户更新失败");
        return;
      }

      const nextUsers = readDemoUsers(currentUser).map((user) => user.id === target.id ? { ...user, ...patch, updatedAt: new Date().toISOString() } : user);
      writeDemoUsers(nextUsers);
      if (currentUser?.id === target.id) localStorage.setItem(DEMO_USER_KEY, JSON.stringify(nextUsers.find((user) => user.id === target.id)));
      setUsers(nextUsers);
      if (currentUser?.id === target.id) await refreshUser();
      setStatus(error instanceof Error ? `后端不可用，已更新本地演示用户：${error.message}` : "已更新本地演示用户");
    } finally {
      setIsSaving(false);
    }
  }

  async function createUser() {
    if (!draftUser.name.trim() || !/^\S+@\S+\.\S+$/.test(draftUser.email) || draftUser.password.length < 8) {
      setStatus("请填写昵称、有效邮箱和至少 8 位密码");
      return;
    }

    setIsSaving(true);
    setStatus(`正在创建 ${draftUser.email}...`);

    try {
      const response = await authFetch(`${CONTENT_API_BASE}/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draftUser)
      });
      const data = await response.json() as { users?: AuthUser[]; error?: string };
      if (!response.ok) throw new Error(data.error || "用户创建失败");
      setUsers(data.users || []);
      setDraftUser({ name: "", email: "", password: "", role: "user", status: "active" });
      setStatus("用户已创建，可用新账号登录");
    } catch (error) {
      if (!isDemoMode) {
        setStatus(error instanceof Error ? `用户创建失败：${error.message}` : "用户创建失败");
        return;
      }

      const now = new Date().toISOString();
      const createdUser: DemoStoredUser = {
        id: `demo-created-${Date.now()}`,
        email: draftUser.email.trim().toLowerCase(),
        name: draftUser.name.trim(),
        role: draftUser.role,
        status: draftUser.status,
        createdAt: now,
        updatedAt: now,
        password: draftUser.password
      };
      const nextUsers = [createdUser, ...readDemoUsers(currentUser).filter((user) => user.email !== createdUser.email)];
      writeDemoUsers(nextUsers);
      setUsers(nextUsers);
      setDraftUser({ name: "", email: "", password: "", role: "user", status: "active" });
      setStatus(error instanceof Error ? `后端不可用，已创建本地演示用户：${error.message}` : "已创建本地演示用户");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground"><UserCog className="size-6 text-primary" /> 用户管理</h2>
          <p className="mt-1 text-sm text-muted-foreground">仅站主可管理用户角色和账号状态。管理员可控制工作台，但不能进入这里。</p>
        </div>
        <button onClick={() => loadUsers()} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-bold transition-colors hover:bg-muted"><RefreshCw className="size-4" /> 刷新</button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-background p-4 shadow-sm"><div className="text-xs font-bold text-muted-foreground">用户总数</div><div className="mt-1 text-3xl font-black">{users.length}</div></div>
        <div className="rounded-2xl border border-border bg-background p-4 shadow-sm"><div className="text-xs font-bold text-muted-foreground">站主</div><div className="mt-1 text-3xl font-black text-primary">{users.filter((item) => item.role === "owner").length}</div></div>
        <div className="rounded-2xl border border-border bg-background p-4 shadow-sm"><div className="text-xs font-bold text-muted-foreground">管理员</div><div className="mt-1 text-3xl font-black text-emerald-500">{users.filter((item) => item.role === "admin").length}</div></div>
      </div>

      <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-black text-foreground"><Plus className="size-4 text-primary" /> 创建用户</div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr_160px_140px_140px_auto]">
          <input value={draftUser.name} onChange={(event) => setDraftUser((current) => ({ ...current, name: event.target.value }))} className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15" placeholder="昵称" />
          <input value={draftUser.email} onChange={(event) => setDraftUser((current) => ({ ...current, email: event.target.value }))} className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15" placeholder="邮箱" />
          <input type="password" value={draftUser.password} onChange={(event) => setDraftUser((current) => ({ ...current, password: event.target.value }))} className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15" placeholder="初始密码" />
          <select value={draftUser.role} onChange={(event) => setDraftUser((current) => ({ ...current, role: event.target.value as UserRole }))} className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-bold outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15">
            {(["owner", "admin", "user"] as UserRole[]).map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
          </select>
          <select value={draftUser.status} onChange={(event) => setDraftUser((current) => ({ ...current, status: event.target.value as UserStatus }))} className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-bold outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15">
            {(["active", "disabled"] as UserStatus[]).map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}
          </select>
          <button disabled={isSaving} onClick={createUser} className="h-10 rounded-xl bg-primary px-4 text-sm font-black text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">创建</button>
        </div>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="rounded-2xl border border-border bg-background p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-lg font-black text-foreground">{user.name}</h3>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-black text-primary"><Shield className="mr-1 inline size-3" /> {roleLabels[user.role]}</span>
                  <span className={user.status === "active" ? "rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-black text-emerald-600" : "rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-black text-rose-600"}>{statusLabels[user.status]}</span>
                  {currentUser?.id === user.id ? <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-black text-muted-foreground">当前账号</span> : null}
                </div>
                <div className="mt-1 text-sm font-medium text-muted-foreground">{user.email}</div>
                <div className="mt-1 text-xs font-bold text-muted-foreground">创建：{new Date(user.createdAt).toLocaleString()} · 最近登录：{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "暂无"}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["owner", "admin", "user"] as UserRole[]).map((role) => (
                  <button key={role} disabled={isSaving || user.role === role} onClick={() => updateUser(user, { role })} className="rounded-xl border border-border px-3 py-2 text-xs font-black transition-colors hover:bg-muted disabled:opacity-50">设为{roleLabels[role]}</button>
                ))}
                <button disabled={isSaving} onClick={() => updateUser(user, { status: user.status === "active" ? "disabled" : "active" })} className="rounded-xl border border-border px-3 py-2 text-xs font-black transition-colors hover:bg-muted disabled:opacity-50">{user.status === "active" ? "禁用" : "启用"}</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3 text-xs font-medium text-muted-foreground">{status}</div>
    </div>
  );
}
