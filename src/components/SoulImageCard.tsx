import { Heart, Eye, Crown, HeartPulse, Clock } from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useThemeLanguage } from "../contexts/ThemeLanguageContext";

export interface Soul {
  id: number | string;
  name: string;
  author: string;
  tags: string[];
  likes: number;
  createdAt: string;
  views: number;
  activeDaysAgo: number | null;
  avatarSrc?: string;
  avatarInitials?: string;
  bannerColor: string;
  featured: boolean;
  visibility?: string;
  desc?: string;
}

interface SoulImageCardProps {
  key?: number | string;
  soul: Soul;
  infoFilter: string;
}

export function SoulImageCard({ soul, infoFilter }: SoulImageCardProps) {
  const { t } = useThemeLanguage();

  return (
    <div className={cn(
      "break-inside-avoid group flex w-full flex-col rounded-xl border bg-card text-left transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer overflow-hidden",
      soul.featured && "ring-1 ring-primary/40 border-primary/30"
    )}>
      <div className="relative w-full overflow-hidden bg-muted/30">
        <div className={cn("absolute inset-0 z-0 bg-gradient-radial mix-blend-overlay opacity-50", soul.bannerColor)} />
        
        {soul.featured && (
          <span className="inline-flex items-center justify-center rounded-full text-[10px] font-medium absolute top-2 right-2 z-10 gap-1 bg-primary text-white px-2 py-0.5 shadow-sm">
            <Crown className="size-2.5" />
            {t("plaza.filter.featured")}
          </span>
        )}

        <div className="relative z-10 w-full flex flex-col items-center">
          <div className="relative w-full">
            <div className="w-full flex items-center justify-center">
              {soul.avatarSrc ? (
                <img src={soul.avatarSrc} alt={soul.name} className="w-full h-auto object-cover" />
              ) : (
                <div className="w-full aspect-square flex items-center justify-center bg-primary/10">
                  <span className="text-4xl font-semibold text-primary">{soul.avatarInitials}</span>
                </div>
              )}
            </div>
            
            {soul.activeDaysAgo !== null && (
              <span className="inline-flex items-center justify-center rounded-full absolute bottom-2 left-2 whitespace-nowrap gap-1 bg-background/90 backdrop-blur-sm shadow-sm px-2 py-1 text-[10px] text-muted-foreground border">
                <HeartPulse className="size-2.5 text-red-500" />
                {t("plaza.active").replace("{days}", String(soul.activeDaysAgo))}
              </span>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {infoFilter === "all" && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-1 flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold line-clamp-2 break-words text-foreground leading-tight flex-1">
                  {soul.name}
                </h3>
                {soul.createdAt && (
                  <div className="flex items-center gap-1 opacity-70 text-xs text-muted-foreground mt-1 shrink-0">
                    <Clock className="size-3" />
                    <span>{soul.createdAt}</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="truncate hover:text-foreground">by {soul.author}</span>
                  <div className="flex items-center gap-3 ml-auto shrink-0">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors z-20 font-medium bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded-full text-sm"
                    >
                      <Heart className="size-4 fill-red-500/20" />
                      <span>{soul.likes}</span>
                    </button>
                    <span className="flex items-center gap-0.5"><Eye className="size-4" />{soul.views}</span>
                  </div>
                </div>
              </div>
              
              {(soul.desc || soul.tags.length > 0) && (
                <div className="flex flex-col gap-2 pt-3 border-t border-border/50">
                  {soul.desc && (
                    <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-line">
                      {soul.desc}
                    </p>
                  )}
                  {soul.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {soul.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center justify-center rounded-full bg-secondary text-secondary-foreground text-[10px] px-2 py-0.5 transition-colors hover:bg-primary hover:text-primary-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
