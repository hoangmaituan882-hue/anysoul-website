import CircleUserRound from "./icons/user-icon";
import Compass from "./icons/locate-icon";
import Gamepad2 from "./icons/gamepad-icon";
import History from "./icons/history-circle-icon";
import Home from "./icons/home-icon";
import Info from "./icons/info-circle-icon";
import Languages from "./icons/globe-icon";
import LayoutDashboard from "./icons/layout-dashboard-icon";
import Mic from "./icons/radio-icon";
import Moon from "./icons/moon-icon";
import MoreHorizontal from "./icons/dots-horizontal-icon";
import Newspaper from "./icons/file-description-icon";
import ShieldCheck from "./icons/shield-check";
import Sun from "./icons/brightness-down-icon";
import { Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

import { cn } from "../lib/utils";
import { useThemeLanguage } from "../contexts/ThemeLanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { AuthModal } from "./AuthModal";

export function Header({ isWorkspace, isGames }: { isWorkspace?: boolean; isGames?: boolean }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [morePos, setMorePos] = useState({ top: 80, right: 16 });
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme, language, toggleLanguage, t } = useThemeLanguage();
  const { user, logout, canEditWorkspace } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isMoreOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (target?.closest("[data-more-trigger='true']")) return;
      if (moreMenuRef.current?.contains(event.target as Node)) return;
      setIsMoreOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMoreOpen(false);
    };

    const handleResize = () => setIsMoreOpen(false); // Close on resize to prevent floating

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMoreOpen]);

  useEffect(() => {
    const closeMore = () => setIsMoreOpen(false);
    window.addEventListener("hashchange", closeMore);
    return () => window.removeEventListener("hashchange", closeMore);
  }, []);

  const handleWorkspaceClick = (event: ReactMouseEvent) => {
    event.preventDefault();
    setIsMoreOpen(false);
    window.location.hash = "#site-workspace";
  };

  const handleAdminWorkspaceClick = (event: ReactMouseEvent) => {
    event.preventDefault();
    setIsMoreOpen(false);
    window.location.hash = "#workspace";
  };

  const roleLabel = user?.role === "owner" ? "站主" : user?.role === "admin" ? "管理员" : "普通用户";
  const accountInitial = (user?.name || "登录").trim().slice(0, 1).toUpperCase();

  if (isWorkspace) return null;

  const navButtonClass = (extra = "ml-0.5") => cn(
    "group inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-bold text-foreground transition-all duration-300",
    extra,
    isScrolled ? "border-border bg-card shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:bg-muted" : "border-transparent bg-transparent shadow-none hover:bg-black/5 dark:hover:bg-white/5"
  );

  const moreItemClass = "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-foreground transition-colors hover:bg-muted";

  const closeAndOpenAuth = () => {
    setIsMoreOpen(false);
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    setIsMoreOpen(false);
    void logout();
  };

  const toggleMore = (event: ReactMouseEvent) => {
    event.stopPropagation();
    if (!isMoreOpen) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const rightPadding = Math.max(16, document.documentElement.clientWidth - rect.right);
      setMorePos({
        top: rect.bottom + 8,
        right: rightPadding
      });
    }
    setIsMoreOpen((open) => !open);
  };

  return (
    <header
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center transition-all duration-500 ease-out",
        isScrolled ? "px-4 pt-4" : (isGames ? "px-0 pt-6" : "px-4 pt-6 md:px-8")
      )}
    >
      <div
        className={cn(
          "pointer-events-auto flex h-[60px] w-full items-center justify-between gap-2 overflow-visible border transition-all duration-500 ease-out",
          isScrolled
            ? "max-w-4xl rounded-full border-border bg-card/95 px-5 shadow-sm backdrop-blur-md md:px-8"
            : (isGames
              ? "max-w-7xl rounded-full border-transparent bg-transparent px-6 shadow-none"
              : "max-w-6xl rounded-full border-transparent bg-transparent px-5 shadow-none md:px-8")
        )}
      >
        <a href="#" className="group flex min-w-0 shrink items-center gap-2 whitespace-nowrap text-xl md:text-2xl">
          <svg className="size-5 shrink-0 md:size-6" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="16" height="16" rx="4" fill="#a4c639" transform="rotate(-10 12 12)" className="transition-transform duration-300 group-hover:rotate-0" />
            <circle cx="11.5" cy="11.5" r="3.5" fill="#1a1a1a" />
            <circle cx="11.5" cy="11.5" r="1.5" fill="#a4c639" />
          </svg>
          <span className="ml-0.5 max-w-[120px] truncate text-[20px] font-medium tracking-tight text-foreground sm:max-w-none md:ml-1 md:text-[22px]">{t("header.title")}</span>
          <svg viewBox="1215 -2 600 355" fill="none" stroke="currentColor" className="hidden h-7 shrink-0 -ml-2 self-center text-foreground sm:block" aria-hidden="true" style={{ overflow: "visible" }}>
            <path d="M1393.06 82.0608C1411.56 49.5609 1376.22 18.4744 1313.06 76.0602C1228.06 153.561 1298.06 196.561 1368.06 188.561C1416.28 183.05 1309.46 306.061 1273.06 338.061" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M1429.56 215.06C1437.96 149.46 1473.39 194.06 1490.06 224.56C1492.39 187.56 1520.22 166.561 1526.56 179.56C1550.96 229.56 1509.39 267.893 1485.06 282.56C1463.06 287.393 1421.16 280.66 1429.56 215.06Z" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" fill="none" stroke="#e11d48" />
            <path d="M1583.06 176.561C1573.89 201.727 1561.76 251.261 1586.56 248.061C1611.36 244.861 1638.56 205.727 1649.06 186.561C1641.23 216.727 1635.46 268.461 1675.06 234.061" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M1802.06 8.06055C1785.89 29.7272 1753.06 107.961 1751.06 247.561" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </a>

        <nav className="z-50 hidden h-full shrink-0 items-center gap-1 md:flex">
          <a href="#" className={navButtonClass("ml-1")}><Home className="size-4 transition-colors group-hover:text-primary" /><span>首页</span></a>
          <a href="#screenings" className={navButtonClass()}>
            <svg className="size-4 transition-colors group-hover:text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            <span>放映</span>
          </a>
          <a href="#games" className={navButtonClass()}><Gamepad2 className="size-4 transition-colors group-hover:text-primary" /><span>游戏</span></a>
          <a href="#plaza" className={navButtonClass()}><Compass className="size-4 transition-colors group-hover:text-primary" /><span>图库</span></a>
          <a href="#talks" className={navButtonClass()}><Mic className="size-4 transition-colors group-hover:text-primary" /><span>杂谈</span></a>
          <button data-more-trigger="true" onClick={toggleMore} className={cn(navButtonClass(), isMoreOpen && "border-border bg-card shadow-sm")} aria-expanded={isMoreOpen} aria-haspopup="menu">
            <MoreHorizontal className="size-4 transition-colors group-hover:text-primary" /><span>更多</span>
          </button>
        </nav>

        <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto overscroll-x-contain rounded-full border border-border/70 bg-card/80 px-1 py-1 shadow-sm no-scrollbar md:hidden">
          <a href="#" className="group inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-2 text-xs font-bold text-foreground transition-colors hover:bg-black/5 dark:hover:bg-white/5" title="首页">
            <Home className="size-4 transition-colors group-hover:text-primary" strokeWidth={2} />
            <span>首页</span>
          </a>
          <a href="#screenings" className="group inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-2 text-xs font-bold text-foreground transition-colors hover:bg-black/5 dark:hover:bg-white/5" title="放映">
            <svg className="size-4 transition-colors group-hover:text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            <span>放映</span>
          </a>
          <a href="#games" className="group inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-2 text-xs font-bold text-foreground transition-colors hover:bg-black/5 dark:hover:bg-white/5" title="游戏">
            <Gamepad2 className="size-4 transition-colors group-hover:text-primary" strokeWidth={2} />
            <span>游戏</span>
          </a>
          <a href="#plaza" className="group inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-2 text-xs font-bold text-foreground transition-colors hover:bg-black/5 dark:hover:bg-white/5" title="图库">
            <Compass className="size-4 transition-colors group-hover:text-primary" strokeWidth={2} />
            <span>图库</span>
          </a>
          <a href="#talks" className="group inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-2 text-xs font-bold text-foreground transition-colors hover:bg-black/5 dark:hover:bg-white/5" title="杂谈">
            <Mic className="size-4 transition-colors group-hover:text-primary" strokeWidth={2} />
            <span>杂谈</span>
          </a>
          <button data-more-trigger="true" onClick={toggleMore} className={cn("group inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-2 text-xs font-bold text-foreground transition-colors hover:bg-black/5 dark:hover:bg-white/5", isMoreOpen && "bg-muted")} title="更多" aria-expanded={isMoreOpen} aria-haspopup="menu">
            <MoreHorizontal className="size-4 transition-colors group-hover:text-primary" strokeWidth={2} />
            <span>更多</span>
          </button>
        </nav>
      </div>

      {isMoreOpen ? (
        <div ref={moreMenuRef} role="menu" className="pointer-events-auto fixed z-[70] w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card/95 p-2 shadow-xl backdrop-blur-md" style={{ top: morePos.top, right: morePos.right }}>
          <a href="#posts" className={moreItemClass} role="menuitem">
            <Newspaper className="size-4 text-primary" />
            <span>文章</span>
          </a>
          <a href="#about" className={moreItemClass} role="menuitem">
            <Info className="size-4 text-primary" />
            <span>{t("header.about")}</span>
          </a>
          <a href="#changelog" className={moreItemClass} role="menuitem">
            <History className="size-4 text-primary" />
            <span>更新记录</span>
          </a>
          <a href="#timeline" className={moreItemClass} role="menuitem">
            <Clock className="size-4 text-primary" />
            <span>网站时间线</span>
          </a>
          <button onClick={handleWorkspaceClick} className={moreItemClass} role="menuitem">
            <LayoutDashboard className="size-4 text-primary" />
            <span>站点工作台</span>
          </button>
          {canEditWorkspace ? (
            <button onClick={handleAdminWorkspaceClick} className={moreItemClass} role="menuitem">
              <ShieldCheck className="size-4 text-primary" />
              <span>管理后台</span>
            </button>
          ) : null}
          <div className="my-1 h-px bg-border/70" />
          {user ? (
            <button onClick={handleLogout} className={moreItemClass} role="menuitem" title={`${user.name} · ${roleLabel} / 退出`}>
              <span className="inline-flex size-4 items-center justify-center rounded-full bg-primary/15 text-[10px] font-black text-primary">{accountInitial}</span>
              <span className="min-w-0 flex-1 truncate">账户：{user.name} · 退出</span>
            </button>
          ) : (
            <button onClick={closeAndOpenAuth} className={moreItemClass} role="menuitem">
              <CircleUserRound className="size-4 text-primary" />
              <span>登录 / 账户</span>
            </button>
          )}
          <button onClick={toggleTheme} className={moreItemClass} role="menuitem">
            {theme === "light" ? <Moon className="size-4 text-primary" /> : <Sun className="size-4 text-primary" />}
            <span>主题切换：{theme === "light" ? "浅色" : "深色"}</span>
          </button>
          <button onClick={toggleLanguage} className={moreItemClass} role="menuitem">
            <Languages className="size-4 text-primary" />
            <span>语言切换：{language.toUpperCase()}</span>
          </button>
        </div>
      ) : null}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
}
