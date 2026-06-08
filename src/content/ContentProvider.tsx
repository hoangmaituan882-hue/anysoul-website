import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CONTENT_API_BASE, fetchBootstrap, fetchPublishedContent } from "./client";
import type { ContentMap } from "./types";

type ContentContextValue = {
  content: ContentMap;
  isConnected: boolean;
  getContent: <T,>(key: string, fallback: T) => T;
  refreshContent: (keys: string[]) => Promise<void>;
};

const ContentContext = createContext<ContentContextValue | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ContentMap>({});
  const [isConnected, setIsConnected] = useState(false);

  const refreshContent = useCallback(async (keys: string[]) => {
    if (!keys.length) return;

    const result = await fetchPublishedContent(keys);
    setContent((current) => ({ ...current, ...result.content }));
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchBootstrap()
      .then((result) => {
        if (!cancelled) {
          setContent(result.content);
        }
      })
      .catch((error) => {
        console.warn("Content bootstrap unavailable; using local fallbacks.", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const source = new EventSource(`${CONTENT_API_BASE}/api/realtime/content`);

    source.addEventListener("connected", () => setIsConnected(true));
    source.addEventListener("content.published", (event) => {
      const payload = JSON.parse((event as MessageEvent).data) as { keys?: string[] };
      refreshContent(payload.keys || []).catch((error) => {
        console.warn("Failed to refresh published content.", error);
      });
    });
    source.onerror = () => setIsConnected(false);

    return () => source.close();
  }, [refreshContent]);

  const value = useMemo<ContentContextValue>(() => ({
    content,
    isConnected,
    getContent: <T,>(key: string, fallback: T) => (content[key] as T | undefined) ?? fallback,
    refreshContent
  }), [content, isConnected, refreshContent]);

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContentContext() {
  const context = useContext(ContentContext);

  if (!context) {
    throw new Error("useContentContext must be used inside ContentProvider");
  }

  return context;
}
