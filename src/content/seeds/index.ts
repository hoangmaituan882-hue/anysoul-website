import { defaultHomeFaq, defaultHomeHero } from "./home";
import { defaultGamingMain } from "./gaming";
import { defaultTalksContent } from "./talks";
import { defaultPlazaContent } from "./plaza";
import { defaultSiteAnnouncements } from "./siteAnnouncements";
import { defaultFeedbackSubmissions } from "./feedback";
import { defaultSiteAnalytics } from "./analytics";
import { defaultScreeningLibrary } from "./screeningLibrary";
import {
  defaultScreeningsAnime,
  defaultScreeningsClassics,
  defaultScreeningsNext,
  defaultScreeningsSchedule,
  defaultScreeningSourceSubmissions,
  defaultScreeningsStats,
  defaultScreeningsTodo
} from "./screenings";

export type ContentSeedEntry = {
  key: string;
  type: string;
  status: "draft" | "published";
  content: unknown;
};

export const contentSeedEntries: ContentSeedEntry[] = [
  { key: "home.hero.main", type: "home.hero", status: "published", content: defaultHomeHero },
  { key: "home.faq.items", type: "home.faq", status: "published", content: defaultHomeFaq },
  { key: "gaming.main", type: "gaming.main", status: "published", content: defaultGamingMain },
  { key: "talks.main", type: "talks.main", status: "published", content: defaultTalksContent },
  { key: "site.announcements", type: "site.announcements", status: "published", content: defaultSiteAnnouncements },
  { key: "screenings.next", type: "screenings.next", status: "published", content: defaultScreeningsNext },
  { key: "screenings.todo", type: "screenings.todo", status: "published", content: defaultScreeningsTodo },
  { key: "screenings.schedule", type: "screenings.schedule", status: "published", content: defaultScreeningsSchedule },
  { key: "screenings.classics", type: "screenings.classics", status: "published", content: defaultScreeningsClassics },
  { key: "screenings.anime", type: "screenings.anime", status: "published", content: defaultScreeningsAnime },
  { key: "screenings.stats", type: "screenings.stats", status: "published", content: defaultScreeningsStats },
  { key: "screenings.library", type: "screenings.library", status: "published", content: defaultScreeningLibrary },
  { key: "screenings.sourceSubmissions", type: "screenings.sourceSubmissions", status: "draft", content: defaultScreeningSourceSubmissions },
  { key: "plaza.main", type: "plaza.main", status: "published", content: defaultPlazaContent },
  { key: "feedback.submissions", type: "feedback.submissions", status: "draft", content: defaultFeedbackSubmissions },
  { key: "analytics.site", type: "analytics.site", status: "published", content: defaultSiteAnalytics }
];

