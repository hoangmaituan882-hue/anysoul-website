import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { ChevronDown, Compass, Gamepad2, Languages, Mic, Moon, Newspaper, Sun, Video } from "lucide-react";
import { cn } from "../lib/utils";
import { useThemeLanguage } from "../contexts/ThemeLanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { AuthModal } from "./AuthModal";
import { VHSModal } from "./vhs/VHSModal";

export function Header({ isWorkspace, isGames }: { isWorkspace?: boolean; isGames?: boolean }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isVHSModalOpen, setIsVHSModalOpen] = useState(false);
  const { theme, toggleTheme, language, toggleLanguage, t } = useThemeLanguage();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleWorkspaceClick = (event: MouseEvent) => {
    event.preventDefault();
    window.location.hash = "#workspace";
  };

  const roleLabel = user?.role === "owner" ? "站主" : user?.role === "admin" ? "管理员" : "普通用户";

  if (isWorkspace) return null;

  const navButtonClass = (extra = "ml-0.5") => cn(
    "inline-flex h-[36px] items-center gap-1.5 rounded-full border px-4 text-sm font-bold text-foreground transition-all duration-300",
    extra,
    isScrolled ? "border-border bg-card shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:bg-muted" : "border-transparent bg-transparent shadow-none hover:bg-black/5 dark:hover:bg-white/5"
  );

  return (
    <header
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center transition-all duration-500 ease-out",
        isScrolled ? "px-4 pt-4" : (isGames ? "px-0 pt-6" : "px-4 pt-6 md:px-8")
      )}
    >
      <div
        className={cn(
          "pointer-events-auto flex h-[60px] w-full items-center justify-between border transition-all duration-500 ease-out",
          isScrolled
            ? "max-w-4xl rounded-full border-border bg-card/95 px-5 shadow-sm backdrop-blur-md md:px-8"
            : (isGames
              ? "max-w-7xl rounded-full border-transparent bg-transparent px-6 shadow-none"
              : "max-w-6xl rounded-full border-transparent bg-transparent px-5 shadow-none md:px-8")
        )}
      >
        <a href="#" className="group flex shrink items-center gap-2 whitespace-nowrap text-xl md:text-2xl">
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
          <div className="group relative mr-2 flex h-full items-center">
            <div className="flex h-full w-[36px] cursor-default items-center justify-center">
              <ChevronDown className={cn("size-4 transition-transform duration-500 group-hover:rotate-180", isScrolled ? "text-muted-foreground group-hover:text-foreground" : "text-foreground")} />
            </div>
            <div className="pointer-events-none absolute left-1/2 top-[59px] z-10 flex w-[36px] -translate-x-1/2 flex-col items-center group-hover:pointer-events-auto">
              <div className={cn(
                "flex h-0 w-full origin-top flex-col items-center overflow-hidden rounded-b-[18px] opacity-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:h-[120px] group-hover:opacity-100",
                isScrolled ? "border-x border-b border-border bg-card/95 shadow-[0_8px_16px_rgba(0,0,0,0.06)] backdrop-blur-md" : "border-x border-b border-transparent bg-black/5 shadow-none backdrop-blur-md dark:bg-white/5"
              )}>
                <div className="z-20 flex w-full flex-col items-center gap-1.5 pb-3 pt-2">
                  <button onClick={toggleTheme} className={cn("flex h-[28px] w-[28px] items-center justify-center rounded-full transition-colors", isScrolled ? "hover:bg-muted" : "hover:bg-black/10 dark:hover:bg-white/10")} title="Switch Theme">
                    {theme === "light" ? <Sun className="size-3.5 text-orange-500" /> : <Moon className="size-3.5 text-foreground/80" />}
                  </button>
                  <button onClick={toggleLanguage} className={cn("flex h-[28px] w-[28px] items-center justify-center rounded-full text-foreground/80 transition-colors", isScrolled ? "hover:bg-muted" : "hover:bg-black/10 dark:hover:bg-white/10")} title="Switch Language">
                    <Languages className="size-3.5" />
                  </button>
                  <button onClick={() => setIsVHSModalOpen(true)} className={cn("flex h-[28px] w-[28px] items-center justify-center rounded-full text-foreground/80 transition-colors", isScrolled ? "hover:bg-muted" : "hover:bg-black/10 dark:hover:bg-white/10")} title="Player">
                    <Video className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <a href="#games" className={navButtonClass("ml-1")}><Gamepad2 className="size-4" /><span>{t("header.games")}</span></a>
          <a href="#talks" className={navButtonClass()}><Mic className="size-4" /><span>{t("header.talks")}</span></a>
          <a href="#screenings" className={navButtonClass()}>
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            <span>{t("header.screening")}</span>
          </a>
          <a href="#posts" className={navButtonClass()}><Newspaper className="size-4" /><span>文章</span></a>
          <a href="#plaza" className={navButtonClass()}><Compass className="size-4" /><span>{t("header.discover")}</span></a>
          <a href="#about" className={navButtonClass()}>
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
            <span>{t("header.about")}</span>
          </a>

          <button onClick={handleWorkspaceClick} className="ml-1 inline-flex h-[36px] cursor-pointer items-center justify-center rounded-full bg-[#abc378] px-5 text-sm font-bold tracking-wide text-[#1a1a1a] shadow-sm transition-all hover:bg-[#a0b86e] hover:shadow-md">
            {t("header.workspace")}
          </button>
          {user ? (
            <button onClick={logout} className="ml-1 inline-flex h-[36px] items-center justify-center rounded-full border border-border bg-card px-4 text-sm font-bold text-foreground shadow-sm transition-all hover:bg-muted">
              {user.name} · {roleLabel} / 退出
            </button>
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} className="ml-1 inline-flex h-[36px] items-center justify-center rounded-full border border-border bg-card px-4 text-sm font-bold text-foreground shadow-sm transition-all hover:bg-muted">
              {t("header.login")}
            </button>
          )}
        </nav>

        <nav className="flex shrink-0 items-center gap-0.5 sm:gap-1 md:hidden">
          <button onClick={toggleTheme} className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-black/5 dark:hover:bg-white/5 sm:size-9">
            {theme === "light" ? <Moon className="size-4" strokeWidth={2} /> : <Sun className="size-4" strokeWidth={2} />}
          </button>
          <button onClick={toggleLanguage} className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-black/5 dark:hover:bg-white/5 sm:size-9", language === "ja" && "bg-primary/20 text-primary")}>
            <Languages className="size-4" strokeWidth={2} />
          </button>
          <button onClick={() => setIsVHSModalOpen(true)} className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-black/5 dark:hover:bg-white/5 sm:size-9">
            <Video className="size-4" strokeWidth={2} />
          </button>
          <a href="#posts" className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-black/5 dark:hover:bg-white/5 sm:size-9" title="文章">
            <Newspaper className="size-4" strokeWidth={2} />
          </a>
          <a href="#talks" className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-black/5 dark:hover:bg-white/5 sm:size-9" title="杂谈回">
            <Mic className="size-4" strokeWidth={2} />
          </a>
          <button onClick={handleWorkspaceClick} className="ml-0.5 inline-flex h-[32px] shrink-0 cursor-pointer select-none items-center justify-center whitespace-nowrap rounded-full bg-[#abc378] px-2.5 text-xs font-bold tracking-wide text-[#1a1a1a] shadow-sm transition-all hover:bg-[#a0b86e] hover:shadow-md sm:ml-1 sm:h-[36px] sm:px-4 sm:text-sm">
            {t("header.workspace")}
          </button>
          <button onClick={() => user ? logout() : setIsAuthModalOpen(true)} className="inline-flex h-[32px] shrink-0 items-center justify-center rounded-full border border-border bg-card px-2.5 text-[11px] font-bold text-foreground sm:h-[36px]">
            {user ? "退出" : t("header.login")}
          </button>
        </nav>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <VHSModal isOpen={isVHSModalOpen} onClose={() => setIsVHSModalOpen(false)} />
    </header>
  );
}
