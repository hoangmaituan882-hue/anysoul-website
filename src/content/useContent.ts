import { useContentContext } from "./ContentProvider";

export function useContent<T>(key: string, fallback: T) {
  return useContentContext().getContent<T>(key, fallback);
}
