import Heart from "./icons/heart-icon";
import Eye from "./icons/eye-icon";
import Crown from "./icons/trophy-icon";
import HeartPulse from "./icons/scan-heart-icon";
import Clock from "./icons/clock-icon";
import X from "./icons/x-icon";
import Download from "./icons/download-icon";
import Expand from "./icons/expand-icon";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useThemeLanguage } from "../contexts/ThemeLanguageContext";
import { OptimizedImage } from "./OptimizedImage";
import { extractAssetIdFromUrl, getImageSrcSet, getImageUrl } from "../content/client";
import type { PlazaSoulItem } from "../content/types";

interface SoulImageCardProps {
  key?: string | number;
  soul: PlazaSoulItem;
  infoFilter: string;
  fetchPriority?: "high" | "low" | "auto";
}

const safeString = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);

export function SoulImageCard({ soul, infoFilter, fetchPriority }: SoulImageCardProps) {
  const { t } = useThemeLanguage();
  const name = safeString(soul.name);
  const author = safeString(soul.author);
  const desc = safeString(soul.desc);
  const avatarSrc = safeString(soul.avatarSrc);
  const avatarInitials = safeString(soul.avatarInitials) || name.slice(0, 1);
  const bannerColor = safeString(soul.bannerColor, "from-primary/20 to-primary/10");
  const tags = Array.isArray(soul.tags) ? soul.tags.filter((t): t is string => typeof t === "string") : [];
  const createdAt = safeString(soul.createdAt);
  const likes = typeof soul.likes === "number" && !Number.isNaN(soul.likes) ? Math.max(0, soul.likes) : 0;
  const views = typeof soul.views === "number" && !Number.isNaN(soul.views) ? Math.max(0, soul.views) : 0;
  const activeDaysAgo = typeof soul.activeDaysAgo === "number" && !Number.isNaN(soul.activeDaysAgo) ? soul.activeDaysAgo : null;
  const featured = Boolean(soul.featured);

  const imageProps = useMemo(() => {
    const assetId = soul.mediaAssetId || extractAssetIdFromUrl(avatarSrc);
    if (assetId) {
      return {
        src: getImageUrl(assetId, { w: 400 }),
        srcSet: getImageSrcSet(assetId),
        sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
      };
    }

    if (!avatarSrc) return null;
    return { src: avatarSrc };
  }, [avatarSrc, soul.mediaAssetId]);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!avatarSrc) return;
    setIsDownloading(true);
    try {
      const response = await fetch(avatarSrc);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = name ? `${name}.${blob.type.split("/")[1] || "jpg"}` : "image";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(avatarSrc, "_blank");
    } finally {
      setIsDownloading(false);
    }
  }, [avatarSrc, name]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen]);

  const openLightbox = useCallback(() => {
    if (!avatarSrc) return;
    setLightboxOpen(true);
  }, [avatarSrc]);

  return (
    <div
      onClick={openLightbox}
      className={cn(
      "break-inside-avoid group flex w-full flex-col rounded-xl border bg-card text-left transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer overflow-hidden",
      featured && "ring-1 ring-primary/40 border-primary/30"
    )}>
      <div className="relative w-full overflow-hidden bg-muted/30">
        <div className={cn("absolute inset-0 z-0 bg-gradient-radial mix-blend-overlay opacity-50", bannerColor)} />
        
        {featured && (
          <span className="inline-flex items-center justify-center rounded-full text-[10px] font-medium absolute top-2 right-2 z-10 gap-1 bg-primary text-white px-2 py-0.5 shadow-sm">
            <Crown className="size-2.5" />
            {t("plaza.filter.featured")}
          </span>
        )}

        <div className="relative z-10 w-full flex flex-col items-center">
          <div className="relative w-full">
            <div className="w-full flex items-center justify-center">
              {imageProps ? (
                <OptimizedImage
                  src={imageProps.src}
                  alt={name}
                  className="w-full"
                  aspectRatio="1/1"
                  fallbackColor={bannerColor}
                  fallbackText={avatarInitials}
                  srcSet={imageProps.srcSet}
                  sizes={imageProps.sizes}
                  fetchPriority={fetchPriority}
                />
              ) : (
                <div className="w-full aspect-square flex items-center justify-center bg-primary/10">
                  <span className="text-4xl font-semibold text-primary">{avatarInitials}</span>
                </div>
              )}
            </div>

            {avatarSrc && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/20 group-hover:opacity-100 pointer-events-none">
                <Expand className="size-8 text-white drop-shadow-lg" />
              </div>
            )}

            {activeDaysAgo !== null && (
              <span className="inline-flex items-center justify-center rounded-full absolute bottom-2 left-2 whitespace-nowrap gap-1 bg-background/90 backdrop-blur-sm shadow-sm px-2 py-1 text-[10px] text-muted-foreground border">
                <HeartPulse className="size-2.5 text-red-500" />
                {t("plaza.active").replace("{days}", String(activeDaysAgo))}
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
                  {name}
                </h3>
                {createdAt && (
                  <div className="flex items-center gap-1 opacity-70 text-xs text-muted-foreground mt-1 shrink-0">
                    <Clock className="size-3" />
                    <span>{createdAt}</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="truncate hover:text-foreground">by {author}</span>
                  <div className="flex items-center gap-3 ml-auto shrink-0">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      type="button"
                      aria-label={`赞 ${likes}`}
                      className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors z-20 font-medium bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded-full text-sm"
                    >
                      <Heart className="size-4 fill-red-500/20" />
                      <span>{likes}</span>
                    </button>
                    <span className="flex items-center gap-0.5"><Eye className="size-4" />{views}</span>
                  </div>
                </div>
              </div>
              
              {(desc || tags.length > 0) && (
                <div className="flex flex-col gap-2 pt-3 border-t border-border/50">
                  {desc && (
                    <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-line">
                      {desc}
                    </p>
                  )}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tags.map(tag => (
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

      <AnimatePresence>
        {lightboxOpen && avatarSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative max-h-[90vh] max-w-[90vw] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="absolute -top-12 right-0 z-10 inline-flex size-9 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                <X className="size-5" />
              </button>

              <img
                src={avatarSrc}
                alt={name}
                className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl"
              />

              <div className="mt-4 flex w-full items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-white">{name}</div>
                  {author && <div className="truncate text-xs text-white/60">by {author}</div>}
                </div>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-white/20 disabled:opacity-50"
                >
                  <Download className="size-4" />
                  {isDownloading ? "下载中..." : "下载原图"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
