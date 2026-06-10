import express from "express";

type UserRole = "owner" | "admin" | "user";

type AuthUser = {
  id: string;
  uid?: number;
  email: string;
  name: string;
  role: UserRole;
  status: "active" | "disabled";
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
};

type ContentStatus = "draft" | "published";

type ContentEntry = {
  key: string;
  type: string;
  status: ContentStatus;
  draft: unknown;
  published: unknown;
  version: number;
  updatedAt: string;
  publishedAt: string;
};

type ContentStore = {
  siteVersion: number;
  entries: Record<string, ContentEntry>;
  events: Array<{
    id: string;
    type: string;
    keys: string[];
    version: number;
    message: string;
    actorId?: string;
    actorName?: string;
    actorRole?: UserRole;
    createdAt: string;
  }>;
};

function authEventActor(auth: { user: AuthUser } | null) {
  return auth ? { actorId: auth.user.id, actorName: auth.user.name, actorRole: auth.user.role } : {};
}

export function registerContentRoutes(
  app: express.Application,
  deps: {
    loadStore: () => Promise<ContentStore>;
    mutateStore: <T>(updater: (store: ContentStore) => T | Promise<T>) => Promise<T>;
    saveStore: (store: ContentStore) => Promise<void>;
    publicContent: (store: ContentStore, keys?: string[]) => Record<string, unknown>;
    broadcast: (event: string, payload: unknown) => void;
    requireWorkspaceAdmin: (req: express.Request, res: express.Response) => Promise<{ user: AuthUser } | null>;
    trimText: (value: unknown, maxLength: number) => string;
  }
) {
  const { loadStore, mutateStore, saveStore, publicContent, broadcast, requireWorkspaceAdmin, trimText } = deps;

  app.get("/api/public/bootstrap", async (_req, res) => {
    const store = await loadStore();

    res.json({
      siteVersion: store.siteVersion,
      content: publicContent(store),
      updatedAt: new Date().toISOString()
    });
  });

  app.get("/api/public/content", async (req, res) => {
    const store = await loadStore();
    const keys = typeof req.query.keys === "string"
      ? req.query.keys.split(",").map((key) => key.trim()).filter(Boolean)
      : undefined;

    res.json({
      siteVersion: store.siteVersion,
      content: publicContent(store, keys)
    });
  });

  app.get("/api/admin/content", async (req, res) => {
    const auth = await requireWorkspaceAdmin(req, res);
    if (!auth) return;

    const store = await loadStore();

    res.json({
      siteVersion: store.siteVersion,
      entries: Object.values(store.entries)
    });
  });

  app.patch("/api/admin/content/:key/draft", async (req, res) => {
    const auth = await requireWorkspaceAdmin(req, res);
    if (!auth) return;

    const key = req.params.key;
    const expectedVersion = typeof req.body?.expectedVersion === "number" ? req.body.expectedVersion : undefined;
    const expectedUpdatedAt = typeof req.body?.expectedUpdatedAt === "string" ? req.body.expectedUpdatedAt : undefined;
    const result = await mutateStore((store) => {
      const entry = store.entries[key];
      if (!entry) return { status: 404, error: "Content entry not found" };

      if ((expectedVersion !== undefined && entry.version !== expectedVersion) || (expectedUpdatedAt && entry.updatedAt !== expectedUpdatedAt)) {
        return { status: 409, error: "Content entry has been changed by another user", entry };
      }

      entry.draft = req.body.payload;
      entry.status = "draft";
      entry.updatedAt = new Date().toISOString();
      const isSubmissionReview = key === "screenings.sourceSubmissions" || key === "feedback.submissions";
      const event = {
        id: `evt_${Date.now()}`,
        type: isSubmissionReview ? "submission.reviewed" : "content.draft.updated",
        keys: [key],
        version: store.siteVersion,
        message: req.body?.message || (isSubmissionReview ? "Reviewed user submission" : "Draft updated from workspace"),
        ...authEventActor(auth),
        createdAt: entry.updatedAt
      };
      store.events.unshift(event);
      store.events = store.events.slice(0, 100);
      return { status: 200, entry, event };
    });

    if (result.status !== 200) {
      res.status(result.status).json({ error: result.error, entry: result.entry });
      return;
    }

    broadcast("content.draft.updated", result.event);
    res.json({ entry: result.entry, event: result.event });
  });

  app.post("/api/admin/content/batch", async (req, res) => {
    const auth = await requireWorkspaceAdmin(req, res);
    if (!auth) return;

    const operations = Array.isArray(req.body?.operations) ? req.body.operations as Array<{
      key?: string;
      payload?: unknown;
      publish?: boolean;
      message?: string;
      expectedVersion?: number;
      expectedUpdatedAt?: string;
    }> : [];

    if (!operations.length) {
      res.status(400).json({ error: "Batch operations are required" });
      return;
    }

    const result = await mutateStore((store) => {
      for (const operation of operations) {
        const key = trimText(operation.key, 120);
        const entry = store.entries[key];
        if (!entry) return { status: 404, error: `Content entry not found: ${key}` };
        if (typeof operation.expectedVersion === "number" && entry.version !== operation.expectedVersion) {
          return { status: 409, error: `Content entry has been changed by another user: ${key}`, key, entry };
        }
        if (typeof operation.expectedUpdatedAt === "string" && entry.updatedAt !== operation.expectedUpdatedAt) {
          return { status: 409, error: `Content entry has been changed by another user: ${key}`, key, entry };
        }
      }

      const events: ContentStore["events"] = [];
      const entries: ContentEntry[] = [];
      const now = new Date().toISOString();

      for (const operation of operations) {
        const key = trimText(operation.key, 120);
        const entry = store.entries[key];
        entry.draft = operation.payload;
        entry.status = operation.publish ? "published" : "draft";
        entry.updatedAt = now;

        if (operation.publish) {
          store.siteVersion += 1;
          entry.version += 1;
          entry.published = entry.draft;
          entry.publishedAt = now;
        }

        const event = {
          id: `evt_${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: operation.publish ? "content.published" : "content.draft.updated",
          keys: [key],
          version: store.siteVersion,
          message: operation.message || req.body?.message || (operation.publish ? "Published from batch workspace operation" : "Draft updated from batch workspace operation"),
          ...authEventActor(auth),
          createdAt: now
        };
        store.events.unshift(event);
        events.push(event);
        entries.push(entry);
      }

      store.events = store.events.slice(0, 100);
      return { status: 200, entries, events, siteVersion: store.siteVersion };
    });

    if (result.status !== 200) {
      res.status(result.status).json({ error: result.error, key: result.key, entry: result.entry });
      return;
    }

    for (const event of result.events) {
      broadcast(event.type, event);
    }

    res.json({ entries: result.entries, events: result.events, siteVersion: result.siteVersion });
  });

  app.post("/api/admin/content/:key/publish", async (req, res) => {
    const auth = await requireWorkspaceAdmin(req, res);
    if (!auth) return;

    const key = req.params.key;
    const expectedVersion = typeof req.body?.expectedVersion === "number" ? req.body.expectedVersion : undefined;
    const expectedUpdatedAt = typeof req.body?.expectedUpdatedAt === "string" ? req.body.expectedUpdatedAt : undefined;
    const result = await mutateStore((store) => {
      const entry = store.entries[key];
      if (!entry) return { status: 404, error: "Content entry not found" };

      if ((expectedVersion !== undefined && entry.version !== expectedVersion) || (expectedUpdatedAt && entry.updatedAt !== expectedUpdatedAt)) {
        return { status: 409, error: "Content entry has been changed by another user", entry, siteVersion: store.siteVersion };
      }

      const now = new Date().toISOString();
      store.siteVersion += 1;
      entry.version += 1;
      entry.status = "published";
      entry.published = entry.draft;
      entry.updatedAt = now;
      entry.publishedAt = now;

      const event = {
        id: `evt_${Date.now()}`,
        type: "content.published",
        keys: [key],
        version: store.siteVersion,
        message: req.body?.message || "Published from workspace",
        ...authEventActor(auth),
        createdAt: now
      };
      store.events.unshift(event);
      store.events = store.events.slice(0, 100);
      return { status: 200, entry, event, siteVersion: store.siteVersion };
    });

    if (result.status !== 200) {
      res.status(result.status).json({ error: result.error, entry: result.entry, siteVersion: result.siteVersion });
      return;
    }

    broadcast("content.published", result.event);
    res.json({ entry: result.entry, event: result.event, siteVersion: result.siteVersion });
  });
}
