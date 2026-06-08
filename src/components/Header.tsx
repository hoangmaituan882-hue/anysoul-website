import React, { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { Menu, ChevronDown, Moon, Sun, Languages, User, Compass, Newspaper, Gamepad2, Video } from "lucide-react";
import { motion } from "motion/react";
import { useThemeLanguage } from "../contexts/ThemeLanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { AuthModal } from "./AuthModal";
import { VHSModal } from "./vhs/VHSModal";

export function Header({ isWorkspace, isGames }: { isWorkspace?: boolean; isGames?: boolean }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isVHSModalOpen, setIsVHSModalOpen] = useState(false);
  const { theme, toggleTheme, setTheme, language, toggleLanguage, setLanguage, t } = useThemeLanguage();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleWorkspaceClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.hash = "#workspace";
  };

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false);
  };

  const roleLabel = user?.role === "owner" ? "站主" : user?.role === "admin" ? "管理员" : "普通用户";

  if (isWorkspace) {
    return null;
  }

  return (
    <header 
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex justify-center pointer-events-none transition-all duration-500 ease-out",
        isScrolled 
          ? "pt-4 px-4" 
          : (isGames ? "pt-6 px-0" : "pt-6 px-4 md:px-8")
      )}
    >
      <div
        className={cn(
          "pointer-events-auto flex items-center justify-between w-full h-[60px] transition-all duration-500 ease-out border",
          isScrolled 
            ? "max-w-4xl rounded-full bg-card/95 backdrop-blur-md border-border shadow-sm px-5 md:px-8" 
            : (isGames 
                 ? "max-w-7xl rounded-full bg-transparent border-transparent shadow-none px-6" 
                 : "max-w-6xl rounded-full bg-transparent border-transparent shadow-none px-5 md:px-8")
        )}
      >
        
        {/* Logo Section */}
        <a href="#" className="flex items-center gap-2 text-xl md:text-2xl whitespace-nowrap flex-shrink-0 group shrink">
          <svg className="size-5 md:size-6 flex-shrink-0" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="16" height="16" rx="4" fill="#a4c639" transform="rotate(-10 12 12)" className="group-hover:rotate-0 transition-transform duration-300" />
            <circle cx="11.5" cy="11.5" r="3.5" fill="#1a1a1a" />
            <circle cx="11.5" cy="11.5" r="1.5" fill="#a4c639" />
          </svg>
          <span className="font-medium text-[20px] md:text-[22px] tracking-tight ml-0.5 md:ml-1 text-foreground truncate max-w-[120px] sm:max-w-none">{t("header.title")}</span>
          <svg viewBox="1215 -2 600 355" fill="none" stroke="currentColor" className="hidden sm:block h-7 -ml-2 self-center text-foreground flex-shrink-0" aria-hidden="true" style={{ overflow: "visible" }}>
            <path d="M1393.06 82.0608C1411.56 49.5609 1376.22 18.4744 1313.06 76.0602C1228.06 153.561 1298.06 196.561 1368.06 188.561C1416.28 183.05 1309.46 306.061 1273.06 338.061" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M1429.56 215.06C1437.96 149.46 1473.39 194.06 1490.06 224.56C1492.39 187.56 1520.22 166.561 1526.56 179.56C1550.96 229.56 1509.39 267.893 1485.06 282.56C1463.06 287.393 1421.16 280.66 1429.56 215.06Z" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" fill="none" stroke="#e11d48" />
            <path d="M1583.06 176.561C1573.89 201.727 1561.76 251.261 1586.56 248.061C1611.36 244.861 1638.56 205.727 1649.06 186.561C1641.23 216.727 1635.46 268.461 1675.06 234.061" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M1802.06 8.06055C1785.89 29.7272 1753.06 107.961 1751.06 247.561" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 flex-shrink-0 z-50 h-full">
          <div className="relative group flex items-center h-full mr-2">
            {/* The Arrow Button */}
            <div className="flex items-center justify-center w-[36px] h-full cursor-default">
              <ChevronDown className={cn("size-4 transition-transform duration-500 group-hover:rotate-180", isScrolled ? "text-muted-foreground group-hover:text-foreground" : "text-foreground")} />
            </div>

            {/* The Geometric Deformation Leg */}
            <div className="absolute top-[59px] left-[50%] -translate-x-1/2 w-[36px] flex flex-col items-center z-10 pointer-events-none group-hover:pointer-events-auto">
               <div className={cn(
                   "w-full flex flex-col items-center overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-top rounded-b-[18px]",
                   isScrolled 
                     ? "bg-card/95 backdrop-blur-md border-x border-b border-border shadow-[0_8px_16px_rgba(0,0,0,0.06)]" 
                     : "bg-black/5 dark:bg-white/5 backdrop-blur-md border-x border-b border-transparent shadow-none",
                   "h-0 group-hover:h-[120px] opacity-0 group-hover:opacity-100"
               )}>
                   
                   <div className="flex flex-col items-center w-full pt-2 pb-3 gap-1.5 z-20">
                     <button onClick={toggleTheme} className={cn("flex items-center justify-center rounded-full w-[28px] h-[28px] transition-colors", isScrolled ? "hover:bg-muted" : "hover:bg-black/10 dark:hover:bg-white/10")} title="Switch Theme">
                       {theme === 'light' ? <Sun className="size-3.5 text-orange-500" /> : <Moon className="size-3.5 text-foreground/80" />}
                     </button>
                     
                     <button onClick={toggleLanguage} className={cn("flex items-center justify-center rounded-full w-[28px] h-[28px] transition-colors", isScrolled ? "text-foreground/80 hover:bg-muted" : "text-foreground/80 hover:bg-black/10 dark:hover:bg-white/10")} title="Switch Language">
                       <Languages className="size-3.5" />
                     </button>
                     
                     <button onClick={() => setIsVHSModalOpen(true)} className={cn("flex items-center justify-center rounded-full w-[28px] h-[28px] transition-colors", isScrolled ? "text-foreground/80 hover:bg-muted" : "text-foreground/80 hover:bg-black/10 dark:hover:bg-white/10")} title="Player">
                       <Video className="size-3.5" />
                     </button>
                   </div>
               </div>
            </div>
          </div>

          <a href="#games" className={cn("inline-flex items-center gap-1.5 h-[36px] px-4 rounded-full border transition-all duration-300 font-bold text-sm text-foreground ml-1", 
            isScrolled ? "border-border bg-card hover:bg-muted shadow-[0_2px_10px_rgb(0,0,0,0.02)]" : "border-transparent bg-transparent hover:bg-black/5 dark:hover:bg-white/5 shadow-none"
          )}>
             <Gamepad2 className="size-4" />
             <span>{t("header.games")}</span>
          </a>

          <a href="#screenings" className={cn("inline-flex items-center gap-1.5 h-[36px] px-4 rounded-full border transition-all duration-300 font-bold text-sm text-foreground ml-0.5", 
            isScrolled ? "border-border bg-card hover:bg-muted shadow-[0_2px_10px_rgb(0,0,0,0.02)]" : "border-transparent bg-transparent hover:bg-black/5 dark:hover:bg-white/5 shadow-none"
          )}>
             <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
             <span>{t("header.screening")}</span>
          </a>

          <a href="#posts" className={cn("inline-flex items-center gap-1.5 h-[36px] px-4 rounded-full border transition-all duration-300 font-bold text-sm text-foreground ml-0.5",
            isScrolled ? "border-border bg-card hover:bg-muted shadow-[0_2px_10px_rgb(0,0,0,0.02)]" : "border-transparent bg-transparent hover:bg-black/5 dark:hover:bg-white/5 shadow-none"
          )}>
             <Newspaper className="size-4" />
             <span>文章</span>
          </a>

          <a href="#plaza" className={cn("inline-flex items-center gap-1.5 h-[36px] px-4 rounded-full border transition-all duration-300 font-bold text-sm text-foreground ml-0.5", 
            isScrolled ? "border-border bg-card hover:bg-muted shadow-[0_2px_10px_rgb(0,0,0,0.02)]" : "border-transparent bg-transparent hover:bg-black/5 dark:hover:bg-white/5 shadow-none"
          )}>
             <Compass className="size-4" />
             <span>{t("header.discover")}</span>
          </a>

          <a href="#about" className={cn("inline-flex items-center gap-1.5 h-[36px] px-4 rounded-full border transition-all duration-300 font-bold text-sm text-foreground ml-0.5", 
            isScrolled ? "border-border bg-card hover:bg-muted shadow-[0_2px_10px_rgb(0,0,0,0.02)]" : "border-transparent bg-transparent hover:bg-black/5 dark:hover:bg-white/5 shadow-none"
          )}>
             <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
             <span>{t("header.about")}</span>
          </a>

          <button onClick={handleWorkspaceClick} className="ml-1 inline-flex items-center justify-center h-[36px] px-5 rounded-full bg-[#abc378] text-[#1a1a1a] hover:bg-[#a0b86e] hover:shadow-md transition-all font-bold text-sm shadow-sm tracking-wide cursor-pointer">
             {t("header.workspace")}
          </button>
          {user ? (
            <button onClick={logout} className="ml-1 inline-flex items-center justify-center h-[36px] px-4 rounded-full border border-border bg-card text-foreground hover:bg-muted transition-all font-bold text-sm shadow-sm">
              {user.name} · {roleLabel} / 退出
            </button>
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} className="ml-1 inline-flex items-center justify-center h-[36px] px-4 rounded-full border border-border bg-card text-foreground hover:bg-muted transition-all font-bold text-sm shadow-sm">
              {t("header.login")}
            </button>
          )}
        </nav>

        {/* Mobile Navigation */}
        <nav className="flex md:hidden items-center gap-0.5 sm:gap-1 flex-shrink-0">
          <button onClick={toggleTheme} className="flex-shrink-0 inline-flex items-center justify-center size-8 sm:size-9 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-foreground">
             {theme === "light" ? <Moon className="size-4" strokeWidth={2} /> : <Sun className="size-4" strokeWidth={2} />}
          </button>
          <button onClick={toggleLanguage} className={cn("flex-shrink-0 inline-flex items-center justify-center size-8 sm:size-9 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-foreground", language === 'ja' && 'bg-primary/20 text-primary')}>
             <Languages className="size-4" strokeWidth={2} />
          </button>
          <button onClick={() => setIsVHSModalOpen(true)} className="flex-shrink-0 inline-flex items-center justify-center size-8 sm:size-9 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-foreground">
             <Video className="size-4" strokeWidth={2} />
          </button>
          <a href="#posts" className="flex-shrink-0 inline-flex items-center justify-center size-8 sm:size-9 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-foreground" title="文章">
             <Newspaper className="size-4" strokeWidth={2} />
          </a>
          <button onClick={handleWorkspaceClick} className="ml-0.5 sm:ml-1 flex-shrink-0 transform-none select-none whitespace-nowrap inline-flex items-center justify-center h-[32px] sm:h-[36px] px-2.5 sm:px-4 rounded-full bg-[#abc378] text-[#1a1a1a] hover:bg-[#a0b86e] hover:shadow-md transition-all font-bold text-xs sm:text-sm shadow-sm tracking-wide cursor-pointer">
             {t("header.workspace")}
          </button>
          <button onClick={() => user ? logout() : setIsAuthModalOpen(true)} className="flex-shrink-0 inline-flex items-center justify-center h-[32px] sm:h-[36px] px-2.5 rounded-full border border-border bg-card text-[11px] font-bold text-foreground">
             {user ? "退出" : t("header.login")}
          </button>
        </nav>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={handleAuthModalClose} />
      <VHSModal isOpen={isVHSModalOpen} onClose={() => setIsVHSModalOpen(false)} />
    </header>
  );
}
