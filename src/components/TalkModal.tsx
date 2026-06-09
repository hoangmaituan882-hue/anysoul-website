import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Bot, Clock, Eye, FileText, Heart, MessageCircle, Search, Tag, Users, X } from "lucide-react";
import type { TalkItem } from "../content/types";
import { cn } from "../lib/utils";

export function TalkModal({ talk, onClose }: { talk: TalkItem | null; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [selectedMention, setSelectedMention] = useState<string | null>(null);

  const filteredTranscript = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return talk?.transcript || [];
    return (talk?.transcript || []).filter((item) =>
      `${item.time} ${item.speaker} ${item.text}`.toLowerCase().includes(keyword)
    );
  }, [query, talk]);

  const activeMention = talk?.mentions.find((item) => item.title === selectedMention);

  return (
    <AnimatePresence>
      {talk ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6" onClick={onClose}>
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
            transition={{ type: "spring", bounce: 0.08, duration: 0.45 }}
            className="relative flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-[#eadfcc] bg-[#fcf8f2] shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 md:flex-row"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-full flex-col border-b border-[#eadfcc] bg-[#f6eadb] dark:border-zinc-800 dark:bg-zinc-900 md:w-[38%] md:border-b-0 md:border-r">
              <div className="relative h-56 shrink-0 overflow-hidden md:h-72">
                <img src={talk.coverUrl} alt={talk.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <button onClick={onClose} className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md transition-colors hover:bg-black/50">
                  <X className="size-5" />
                </button>
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-black backdrop-blur-md">
                    <Bot className="size-3.5" /> AI 摘要体验版
                  </div>
                  <h2 className="text-2xl font-black leading-tight tracking-tight">{talk.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm font-medium text-white/80">{talk.subtitle}</p>
                </div>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto p-5">
                <div className="grid grid-cols-3 gap-2">
                  <Metric icon={<Eye className="size-4" />} label="观看" value={talk.viewers.toLocaleString()} />
                  <Metric icon={<MessageCircle className="size-4" />} label="弹幕" value={talk.danmaku.toLocaleString()} />
                  <Metric icon={<Heart className="size-4" />} label="喜欢" value={talk.likes.toLocaleString()} />
                </div>

                <div className="rounded-2xl border border-border bg-background/70 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-black"><FileText className="size-4 text-orange-500" /> 本期摘要</div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{talk.summary}</p>
                </div>

                <div className="rounded-2xl border border-border bg-background/70 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-black"><Users className="size-4 text-blue-500" /> 主持与嘉宾</div>
                  <div className="text-sm font-bold">{talk.host}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {talk.guests.map((guest) => (
                      <span key={guest} className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">{guest}</span>
                    ))}
                  </div>
                </div>

                {talk.sourceUrl ? (
                  <a href={talk.sourceUrl} target={talk.sourceUrl.startsWith("#") ? undefined : "_blank"} rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-sm font-black text-background transition-opacity hover:opacity-90">
                    打开来源 <ArrowUpRight className="size-4" />
                  </a>
                ) : null}
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col bg-background">
              <div className="flex shrink-0 flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center md:justify-between md:px-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <Clock className="size-3.5" /> {talk.date} {talk.time} · {talk.duration}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {talk.tags.map((tag) => <span key={tag} className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-black text-primary">{tag}</span>)}
                  </div>
                </div>
                <label className="relative min-w-0 md:w-72">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="搜索转写内容"
                    className="h-11 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm font-bold outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                  />
                </label>
              </div>

              <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[1fr_320px]">
                <div className="min-h-0 overflow-y-auto p-4 md:p-6">
                  <div className="space-y-3">
                    {filteredTranscript.map((item, index) => (
                      <div key={`${item.time}-${index}`} className="rounded-2xl border border-border bg-card p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-black text-muted-foreground">
                          <span className="rounded-full bg-muted px-2 py-0.5">{item.time}</span>
                          <span>{item.speaker}</span>
                        </div>
                        <p className="text-sm leading-relaxed text-foreground">{item.text}</p>
                      </div>
                    ))}
                    {filteredTranscript.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm font-bold text-muted-foreground">没有匹配的转写片段</div>
                    ) : null}
                  </div>
                </div>

                <aside className="hidden min-h-0 overflow-y-auto border-l border-border bg-muted/20 p-4 lg:block">
                  <Section title="本期提及" icon={<Tag className="size-4 text-pink-500" />}>
                    <div className="space-y-2">
                      {talk.mentions.map((mention) => (
                        <button
                          key={mention.title}
                          onClick={() => setSelectedMention(mention.title)}
                          className={cn(
                            "w-full rounded-2xl border p-3 text-left transition-colors",
                            selectedMention === mention.title ? "border-primary/40 bg-primary/10" : "border-border bg-card hover:bg-background"
                          )}
                        >
                          <div className="text-sm font-black">{mention.title}</div>
                          <div className="mt-1 text-xs font-bold text-muted-foreground">{mention.type}{mention.score ? ` · ${mention.score}` : ""}</div>
                        </button>
                      ))}
                    </div>
                  </Section>

                  <Section title="精选评论" icon={<MessageCircle className="size-4 text-green-500" />}>
                    <div className="space-y-2">
                      {talk.comments.map((comment) => (
                        <div key={`${comment.author}-${comment.time}`} className="rounded-2xl border border-border bg-card p-3">
                          <div className="mb-1 flex items-center justify-between text-xs font-black">
                            <span>{comment.author}</span>
                            <span className="text-muted-foreground">{comment.time}</span>
                          </div>
                          <p className="text-xs leading-relaxed text-muted-foreground">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  </Section>
                </aside>
              </div>
            </div>

            <AnimatePresence>
              {activeMention ? (
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", bounce: 0, duration: 0.42 }}
                  className="absolute inset-y-0 right-0 z-20 w-full border-l border-border bg-background p-5 shadow-2xl sm:w-[420px]"
                >
                  <button onClick={() => setSelectedMention(null)} className="mb-5 flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground">
                    <X className="size-4" />
                  </button>
                  <div className="text-xs font-black uppercase tracking-[0.3em] text-primary">{activeMention.type}</div>
                  <h3 className="mt-2 text-3xl font-black tracking-tight">{activeMention.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{activeMention.summary}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {activeMention.tags.map((tag) => <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">{tag}</span>)}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/70 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">{icon}{label}</div>
      <div className="text-lg font-black">{value}</div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="mb-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-black">{icon}{title}</div>
      {children}
    </div>
  );
}
