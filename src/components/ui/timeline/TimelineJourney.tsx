import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../../lib/utils";
import { GraduationCap, Briefcase, Code, Trophy, MapPin, Building, ChevronDown, ChevronUp, Link as LinkIcon, Star, Filter, ArrowDownUp } from "lucide-react";

export type TimelineJourneyItem = {
  id: string;
  type: "education" | "work" | "project" | "achievement";
  startDate: string;
  endDate?: string;
  title: string;
  organization?: string;
  position?: string;
  location?: string;
  description: string;
  achievements?: string[];
  skills?: string[];
  links?: { name: string; url: string }[];
  featured?: boolean;
  color?: string;
  icon?: string;
};

const typeLabels: Record<string, string> = {
  all: "全部",
  education: "教育",
  work: "工作",
  project: "项目",
  achievement: "成就"
};

export const getIconForType = (type: string, customIcon?: string) => {
  if (customIcon) return <span className="font-bold text-lg">{customIcon}</span>;
  switch (type) {
    case "education": return <GraduationCap className="size-5" />;
    case "work": return <Briefcase className="size-5" />;
    case "project": return <Code className="size-5" />;
    case "achievement": return <Trophy className="size-5" />;
    default: return <Star className="size-5" />;
  }
};

export interface TimelineJourneyProps {
  items: TimelineJourneyItem[];
  showStats?: boolean;
}

export function TimelineJourney({ items, showStats = true }: TimelineJourneyProps) {
  const [filter, setFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredAndSortedData = useMemo(() => {
    return [...items]
      .filter(item => filter === "all" || item.type === filter)
      .sort((a, b) => {
        const timeA = new Date(a.startDate).getTime();
        const timeB = new Date(b.startDate).getTime();
        return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
      });
  }, [items, filter, sortOrder]);

  const stats = useMemo(() => {
    const counts: Record<string, number> = {
      education: 0,
      work: 0,
      project: 0,
      achievement: 0
    };
    
    const skillsMap: Record<string, number> = {};

    items.forEach(item => {
      if (counts[item.type] !== undefined) counts[item.type]++;
      if (item.skills) {
        item.skills.forEach(skill => {
          skillsMap[skill] = (skillsMap[skill] || 0) + 1;
        });
      }
    });

    const sortedSkills = Object.entries(skillsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);

    return { counts, skills: sortedSkills };
  }, [items]);

  return (
    <div className={cn("grid gap-8 items-start", showStats ? "grid-cols-1 lg:grid-cols-[1fr_300px]" : "grid-cols-1")}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-muted/30 p-4 border rounded-2xl">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
            <Filter className="size-4 text-muted-foreground mr-1 shrink-0" />
            {(["all", "education", "work", "project", "achievement"]).map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0 whitespace-nowrap",
                  filter === t 
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-muted text-muted-foreground"
                )}
              >
                {typeLabels[t]}
                {t !== "all" && <span className="ml-1.5 opacity-60 text-[10px]">{stats.counts[t]}</span>}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-muted text-muted-foreground transition-colors whitespace-nowrap shrink-0"
          >
            <ArrowDownUp className="size-4" />
            {sortOrder === "desc" ? "时间倒序" : "时间正序"}
          </button>
        </div>

        <div className="relative pt-6">
          <motion.div 
            initial={{ height: 0 }}
            whileInView={{ height: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute left-8 lg:left-[calc(140px+2rem)] top-0 bottom-0 w-px bg-border/60 z-0 origin-top"
          />
          
          <div className="space-y-12">
            <AnimatePresence mode="popLayout">
              {filteredAndSortedData.map((item) => (
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
                  key={item.id}
                  className="relative z-10 flex flex-col lg:flex-row gap-6 lg:gap-8 min-w-0"
                >
                  <div className="lg:w-[140px] shrink-0 pt-2 flex lg:flex-col items-center lg:items-end gap-2 lg:gap-0 pl-16 lg:pl-0 relative">
                    <div className="absolute left-[31.5px] top-6 w-8 h-px bg-border/60 lg:hidden" />
                    
                    <div className="bg-background px-2 lg:px-0 text-sm font-mono font-bold text-foreground relative z-10">
                      {item.startDate.substring(0, 7)}
                    </div>
                    {item.endDate && (
                      <div className="text-xs font-mono text-muted-foreground mt-1 bg-background px-2 lg:px-0 relative z-10">
                        - {item.endDate.substring(0, 7)}
                      </div>
                    )}
                    {item.featured && (
                      <div className="hidden lg:flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-amber-500 mt-2">
                        <Star className="size-3 fill-amber-500" /> 精选
                      </div>
                    )}
                  </div>

                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="absolute left-[20px] lg:left-[calc(140px+1.5rem)] top-1 flex items-center justify-center shrink-0 w-10 h-10 rounded-full border-4 border-background bg-muted z-10 shadow-sm"
                    style={{ backgroundColor: item.color || 'var(--primary)', color: '#fff' }}
                  >
                    {getIconForType(item.type, item.icon)}
                  </motion.div>

                  <div className="flex-1 min-w-0 bg-card border rounded-3xl shadow-sm hover:shadow-md transition-shadow overflow-hidden ml-16 lg:ml-0">
                    <div 
                      className="p-5 sm:p-6 cursor-pointer select-none flex flex-col gap-3"
                      onClick={() => toggleExpand(item.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-lg md:text-xl font-bold leading-tight">{item.title}</h3>
                        <div className="mt-1 bg-muted rounded-full p-1 shrink-0">
                          {expandedItems[item.id] ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm text-muted-foreground">
                        {item.organization && (
                          <span className="flex items-center gap-1.5 font-medium text-foreground"><Building className="size-3.5" /> {item.organization}</span>
                        )}
                        {item.position && (
                          <span className="flex items-center gap-1.5"><Briefcase className="size-3.5" /> {item.position}</span>
                        )}
                        {item.location && (
                          <span className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {item.location}</span>
                        )}
                      </div>

                      <AnimatePresence>
                        {expandedItems[item.id] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 mt-2 border-t space-y-4">
                              <p className="text-sm leading-relaxed text-muted-foreground/90">
                                {item.description}
                              </p>

                              {item.achievements && item.achievements.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                                    <Trophy className="size-3.5" /> 成就
                                  </h4>
                                  <ul className="space-y-1.5">
                                    {item.achievements.map((ach, i) => (
                                      <li key={i} className="text-sm flex items-start gap-2">
                                        <span className="text-primary mt-1 shrink-0">•</span>
                                        <span className="text-foreground/90">{ach}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {item.skills && item.skills.length > 0 && (
                                <div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {item.skills.map((skill, i) => (
                                      <span key={i} className="px-2 py-0.5 bg-muted rounded-md text-xs font-medium text-muted-foreground">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {item.links && item.links.length > 0 && (
                                <div className="flex flex-wrap gap-3 pt-2">
                                  {item.links.map((link, i) => (
                                    <a
                                      key={i} 
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-full transition-colors"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <LinkIcon className="size-3" />
                                      {link.name}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredAndSortedData.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <p>没有找到相关记录。</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showStats && (
        <div className="hidden lg:block relative">
          <div className="sticky top-24 bg-card border rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-6">里程碑统计</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-muted-foreground">教育经历</span>
                </div>
                <span className="font-mono font-medium">{stats.counts.education}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span className="text-muted-foreground">工作经验</span>
                </div>
                <span className="font-mono font-medium">{stats.counts.work}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">重点项目</span>
                </div>
                <span className="font-mono font-medium">{stats.counts.project}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-muted-foreground">重要成就</span>
                </div>
                <span className="font-mono font-medium">{stats.counts.achievement}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-border/50">
              <h4 className="font-bold text-sm mb-4 text-foreground/80">技能雷达统计</h4>
              <div className="flex flex-wrap gap-2">
                {stats.skills.map(([skill, count]) => (
                  <div key={skill} className="flex items-center text-xs bg-muted/60 rounded-md overflow-hidden">
                    <span className="px-2 py-1 border-r border-border/50 text-muted-foreground font-medium">{skill}</span>
                    <span className="px-1.5 py-1 font-mono">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
