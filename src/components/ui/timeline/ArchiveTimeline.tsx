import { useState, useMemo } from "react";
import { cn } from "../../../lib/utils";
import { motion, AnimatePresence } from "motion/react";

export interface ArchiveTimelinePost {
  id: string;
  date: string;
  title: string;
  tags: string[];
  category?: string;
}

export interface ArchiveTimelineProps {
  posts: ArchiveTimelinePost[];
  categories?: string[];
}

export function ArchiveTimeline({ posts, categories = ["全部", "游戏", "杂谈", "放映会"] }: ArchiveTimelineProps) {
  const [archiveFilter, setArchiveFilter] = useState("全部");

  const postsByYear = useMemo(() => {
    const grouped: Record<string, ArchiveTimelinePost[]> = {};
    posts
      .filter((post) => archiveFilter === "全部" || post.category === archiveFilter)
      .forEach((post) => {
        const year = post.date.substring(0, 4);
        if (!grouped[year]) {
          grouped[year] = [];
        }
        grouped[year].push(post);
      });

    const result = Object.entries(grouped).map(([year, posts]) => ({
      year,
      posts: posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    }));
    return result.sort((a, b) => parseInt(b.year) - parseInt(a.year));
  }, [posts, archiveFilter]);

  return (
    <div className="max-w-4xl mx-auto">
      {categories.length > 0 && (
        <div className="mb-6 flex space-x-2 overflow-x-auto pb-2">
          {categories.map((cat, index) => (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              key={cat}
              onClick={() => setArchiveFilter(cat)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                archiveFilter === cat
                  ? "bg-primary text-primary-foreground shadow-sm scale-105"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      )}

      <div className="bg-card border rounded-3xl p-6 sm:p-12 shadow-sm relative overflow-hidden">
        {postsByYear.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>没有找到相关记录。</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {postsByYear.map((group) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ 
                  duration: 0.5,
                  ease: [0.23, 1, 0.32, 1]
                }}
                key={group.year} 
                className="flex mb-2 group"
              >
                <div className="w-20 sm:w-24 shrink-0 flex flex-col text-right pr-4 sm:pr-6">
                  <div className="h-16 flex items-start justify-end pt-1">
                    <span className="text-2xl sm:text-3xl font-bold">{group.year}</span>
                  </div>
                  {group.posts.map((post, postIdx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: Math.min(postIdx * 0.05, 0.5) + 0.1 }}
                      key={post.id} 
                      className="h-14 flex items-center justify-end"
                    >
                      <span className="text-sm text-muted-foreground tabular-nums">{post.date.substring(5)}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="w-6 sm:w-8 shrink-0 flex flex-col items-center relative">
                  <motion.div 
                    initial={{ height: 0 }}
                    whileInView={{ height: "100%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="absolute top-3 bottom-0 w-px border-l-[1.5px] border-dashed border-border/70 origin-top" 
                  />
                  
                  <div className="h-16 flex items-start pt-2">
                    <motion.div 
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="w-3.5 h-3.5 rounded-full border-[2.5px] border-blue-500 bg-background z-10" 
                    />
                  </div>
                  {group.posts.map((post, postIdx) => (
                    <div key={post.id} className="h-14 flex items-center z-10 bg-card py-2">
                      <motion.div 
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: Math.min(postIdx * 0.05, 0.5) + 0.15 }}
                        className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" 
                      />
                    </div>
                  ))}
                </div>

                <div className="flex-1 flex flex-col pl-4 sm:pl-8 pb-10">
                  <div className="h-16 flex flex-col justify-start pt-1 text-muted-foreground border-b border-transparent">
                    <span className="text-sm font-medium leading-none mb-1">{group.posts.length}</span>
                    <span className="text-sm">篇帖子</span>
                  </div>
                  {group.posts.map((post, postIdx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: Math.min(postIdx * 0.05, 0.5) + 0.1 }}
                      key={post.id} 
                      className="h-14 flex flex-col sm:flex-row sm:items-center justify-center sm:justify-between border-b border-transparent hover:border-border/50 hover:bg-muted/30 px-3 -ml-3 rounded-xl gap-1 sm:gap-4 transition-colors cursor-pointer group/item relative z-10"
                    >
                      <h4 className="text-base font-bold text-foreground/90 group-hover/item:text-primary transition-colors">{post.title}</h4>
                      <div className="text-xs sm:text-sm text-muted-foreground/60 flex gap-2">
                        {post.tags.map(tag => (
                          <span key={tag} className="hover:text-primary transition-colors">#{tag}</span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
