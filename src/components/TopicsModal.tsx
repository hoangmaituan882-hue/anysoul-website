import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Bell, FileText, Tag, X } from "lucide-react";
import type { TalkSidebarItem } from "../content/types";

export function TopicsModal({ open, topics, updates, onClose }: { open: boolean; topics: TalkSidebarItem[]; updates: TalkSidebarItem[]; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[75] flex items-center justify-center p-4" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", bounce: 0.08, duration: 0.42 }}
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-border bg-background shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-4">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.28em] text-primary">Topics</div>
                <h2 className="mt-1 text-2xl font-black tracking-tight">杂谈主题索引</h2>
              </div>
              <button onClick={onClose} className="flex size-10 items-center justify-center rounded-full bg-card text-muted-foreground transition-colors hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            <div className="grid max-h-[72vh] grid-cols-1 overflow-y-auto md:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-3 p-5">
                {topics.map((topic) => (
                  <a
                    key={topic.id}
                    href={topic.href || "#talks"}
                    onClick={onClose}
                    className="group block rounded-3xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Tag className="size-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black">{topic.title}</h3>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{topic.description}</p>
                        </div>
                      </div>
                      <ArrowRight className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                    {topic.tags?.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {topic.tags.map((tag) => <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">{tag}</span>)}
                      </div>
                    ) : null}
                  </a>
                ))}
              </div>

              <aside className="border-t border-border bg-muted/20 p-5 md:border-l md:border-t-0">
                <div className="mb-4 flex items-center gap-2 text-sm font-black">
                  <Bell className="size-4 text-orange-500" /> 最近动态
                </div>
                <div className="space-y-3">
                  {updates.map((update) => (
                    <div key={update.id} className="rounded-2xl border border-border bg-background p-4">
                      <div className="mb-2 flex items-center gap-2 text-xs font-bold text-muted-foreground">
                        <FileText className="size-3.5" /> {update.date || "近期"}
                      </div>
                      <h3 className="text-sm font-black">{update.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{update.description}</p>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
