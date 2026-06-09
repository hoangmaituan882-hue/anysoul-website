/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, type ReactNode } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { FeaturesBento } from "./components/FeaturesBento";
import { ScenariosMarquee } from "./components/ScenariosMarquee";
import { GrowWithYouSection } from "./components/GrowWithYouSection";
import { MarqueeSection } from "./components/MarqueeSection";
import { Pricing } from "./components/Pricing";
import { FAQSection } from "./components/FAQSection";
import { Footer } from "./components/Footer";
import { Changelog } from "./pages/Changelog";
import { Plaza } from "./pages/Plaza";
import { Screenings } from "./pages/Screenings";
import { Workspace } from "./pages/Workspace";
import { About } from "./pages/About";
import { Gaming } from "./pages/Gaming";
import { Posts } from "./pages/Posts";
import { Talks } from "./pages/Talks";
import { ThemeLanguageProvider } from "./contexts/ThemeLanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { CONTENT_API_BASE } from "./content/client";

const routeTitles: Record<string, string> = {
  "": "首页",
  "#changelog": "更新履历",
  "#plaza": "图库",
  "#screenings": "放映会",
  "#talks": "杂谈回",
  "#posts": "文章记录",
  "#workspace": "工作台",
  "#games": "游戏回",
  "#about": "关于"
};

const pageShellClass = "relative min-h-screen bg-background text-foreground antialiased selection:bg-primary/30 font-sans flex flex-col overflow-x-hidden transition-colors duration-300";

function AppShell({ children, className }: { children: ReactNode; className: string }) {
  return (
    <ThemeLanguageProvider>
      <AuthProvider>
        <div className={className}>{children}</div>
      </AuthProvider>
    </ThemeLanguageProvider>
  );
}

function StandardPage({ children, mainClassName = "flex-1 flex flex-col pt-24 pb-8" }: { children: ReactNode; mainClassName?: string }) {
  return (
    <AppShell className={pageShellClass}>
      <Header />
      <main className={mainClassName}>{children}</main>
      <Footer />
    </AppShell>
  );
}

export default function App() {
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const visitorKey = "anysoul-visitor-id";
    const visitorId = localStorage.getItem(visitorKey) || `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(visitorKey, visitorId);
    const path = route || "#home";

    fetch(`${CONTENT_API_BASE}/api/public/analytics/visit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path,
        title: routeTitles[route] || route.replace("#", "") || "首页",
        visitorId,
        referrer: document.referrer || ""
      })
    }).catch(() => undefined);
  }, [route]);

  if (route === "#changelog") {
    return (
      <StandardPage mainClassName="flex-1 flex flex-col pt-16">
        <Changelog />
      </StandardPage>
    );
  }

  if (route === "#plaza") {
    return (
      <StandardPage>
        <Plaza />
      </StandardPage>
    );
  }

  if (route === "#screenings") {
    return (
      <StandardPage mainClassName="flex-1 flex flex-col pt-16">
        <Screenings />
      </StandardPage>
    );
  }

  if (route === "#talks") {
    return (
      <StandardPage>
        <Talks />
      </StandardPage>
    );
  }

  if (route === "#posts" || route.startsWith("#posts/")) {
    return (
      <StandardPage>
        <Posts route={route} />
      </StandardPage>
    );
  }

  if (route === "#workspace") {
    return (
      <AppShell className="relative h-screen bg-[#fbfaf8] dark:bg-zinc-950 text-foreground antialiased selection:bg-primary/30 font-sans flex flex-col overflow-hidden transition-colors duration-300">
        <Header isWorkspace={true} />
        <main className="absolute inset-0 z-0 flex h-screen w-full flex-1 flex-col overflow-hidden">
          <Workspace />
        </main>
      </AppShell>
    );
  }

  if (route === "#games") {
    return (
      <AppShell className={pageShellClass}>
        <Header isGames />
        <main className="flex-1 flex flex-col pt-24 pb-8">
          <Gaming />
        </main>
        <Footer />
      </AppShell>
    );
  }

  if (route === "#about") {
    return (
      <StandardPage>
        <About />
      </StandardPage>
    );
  }

  return (
    <StandardPage mainClassName="flex-1 flex flex-col pt-16">
      <Hero />
      <GrowWithYouSection />
      <FeaturesBento />
      <ScenariosMarquee />
      <Pricing />
      <MarqueeSection />
      <FAQSection />
    </StandardPage>
  );
}
