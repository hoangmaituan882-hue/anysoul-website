import { Sparkles } from "lucide-react";
import { useThemeLanguage } from "../contexts/ThemeLanguageContext";

export function Footer() {
  const { t } = useThemeLanguage();

  return (
    <footer className="border-t border-border mt-12 py-12 px-4 bg-secondary/30">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] text-muted-foreground font-semibold tracking-wider">
         <div className="flex gap-4 md:gap-8 flex-wrap justify-center text-center">
            <span className="flex items-center gap-2 uppercase">{t("footer.trusted")}</span>
            <span className="flex items-center gap-2 opacity-60 uppercase">• {t("footer.partner")}</span>
            <span className="flex items-center gap-2 opacity-60 uppercase">• {t("footer.anthropic")}</span>
         </div>
         
         <div className="flex gap-6 uppercase">
            <a href="#" className="hover:text-foreground transition-colors">{t("footer.terms")}</a>
            <a href="#" className="hover:text-foreground transition-colors">{t("footer.privacy")}</a>
            <span className="cursor-default flex items-center gap-2 uppercase">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                </span>
                {t("footer.status")}
            </span>
         </div>
      </div>
    </footer>
  );
}
