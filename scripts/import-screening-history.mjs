import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(rootDir, "电影.txt");
const outputPath = path.join(rootDir, "src", "content", "defaults", "screeningHistory.generated.ts");

const urlPattern = /https?:\/\/[^\s《》）]+/g;
const ratingPattern = /（([0-9]+(?:\.[0-9]+)?)）/;

const animeHints = [
  "迷家",
  "蓦然回首",
  "辉夜姬",
  "链锯人",
  "彼方的阿斯特拉",
  "碧蓝之海",
  "夏洛特",
  "忍者杀手",
  "轻拍翻转",
  "铳皇",
  "圣剑使",
  "绝对双刃",
  "路人女主",
  "赛马娘",
  "浪客剑心",
  "电器街",
  "白箱",
  "甘城光辉",
  "旋风管家",
  "乒乓",
  "pop子",
  "太空丹迪",
  "吹响",
  "古立特",
  "灰与幻想",
  "战勇",
  "Just Because",
  "少女☆歌剧",
  "Revue Starlight"
];

const documentaryHints = ["纪录片", "地球脉动", "浮生一日", "花豹与鬣狗", "徒手攀岩", "剑心之路"];

function normalizeText(value) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\u200b/g, "")
    .replace(/&amp%3B/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function firstUrl(value) {
  return normalizeText(value).match(urlPattern)?.[0];
}

function hashTitle(value) {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.codePointAt(0) || 0;
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function slugTitle(title) {
  return `history-${hashTitle(title)}`;
}

function formatDate(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parsePrimaryDate(fragment) {
  const match = fragment.match(/^(\d{4})\.(\d{1,2})\.(\d{1,2})/);
  if (!match) return undefined;
  return formatDate(match[1], match[2], match[3]);
}

function splitBlocks(raw) {
  const normalized = normalizeText(raw);
  const starts = [...normalized.matchAll(/^20\d{2}\.\d{1,2}\.\d{1,2}/gm)].map((match) => match.index || 0);

  return starts
    .map((start, index) => normalized.slice(start, starts[index + 1] ?? normalized.length).trim())
    .filter(Boolean);
}

function cleanTitle(rawTitle) {
  return normalizeText(rawTitle)
    .replace(urlPattern, "")
    .replace(/动态评论区网盘链接/g, "")
    .replace(/录播/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isAnimeRecord(title, block) {
  return animeHints.some((hint) => title.includes(hint) || block.includes(hint));
}

function isDocumentaryRecord(title, block) {
  return documentaryHints.some((hint) => title.includes(hint) || block.includes(hint));
}

function inferCategory({ title, block, rating }) {
  if (typeof rating === "number" && rating <= 5.5) return "bad";
  if (isAnimeRecord(title, block)) return "anime";
  if (isDocumentaryRecord(title, block)) return "topic";
  if (typeof rating === "number" && rating >= 8.5) return "classic";
  if (typeof rating === "number" && rating >= 7.0) return "good";
  return "topic";
}

function inferSourceType({ title, block }) {
  if (isAnimeRecord(title, block)) return "anime";
  if (isDocumentaryRecord(title, block)) return "other";
  if (/全集|第一季|第二季|TV\s|[0-9]+~[0-9]+/.test(block)) return "series";
  return "movie";
}

function tagsForRecord({ date, title, block, category, sourceUrl }) {
  const tags = ["历史放映", "电影.txt", date.slice(0, 4)];
  if (sourceUrl?.includes("bilibili.com")) tags.push("Bilibili");
  if (sourceUrl?.includes("t.bilibili.com") || block.includes("网盘")) tags.push("动态/网盘");
  if (category === "bad") tags.push("反面案例");
  if (category === "classic") tags.push("经典");
  if (category === "good") tags.push("好评");
  if (isAnimeRecord(title, block)) tags.push("动画");
  if (isDocumentaryRecord(title, block)) tags.push("纪录片");
  return Array.from(new Set(tags));
}

function parseMovieSegments(block) {
  const titleMatches = [...block.matchAll(/《([^》]+)》/g)];
  const blockUrl = firstUrl(block);
  const seenTitles = new Set();

  return titleMatches.flatMap((match, index) => {
    const title = cleanTitle(match[1]);
    if (!title || seenTitles.has(title)) return [];

    seenTitles.add(title);

    const start = match.index || 0;
    const end = titleMatches[index + 1]?.index ?? block.length;
    const segment = block.slice(start, end);
    const rating = Number(segment.match(ratingPattern)?.[1]);

    return [{
      title,
      rating: Number.isFinite(rating) ? rating : undefined,
      sourceUrl: firstUrl(segment) || blockUrl
    }];
  });
}

function parseBlock(block, index) {
  const firstTitleIndex = block.indexOf("《");
  if (firstTitleIndex < 0) return undefined;

  const dateFragment = normalizeText(block.slice(0, firstTitleIndex));
  const date = parsePrimaryDate(dateFragment);
  if (!date) return undefined;

  const movieSegments = parseMovieSegments(block);
  if (movieSegments.length === 0) return undefined;

  const movies = movieSegments.map((movie) => {
    const category = inferCategory({ title: movie.title, block, rating: movie.rating });
    const tags = tagsForRecord({ date, title: movie.title, block, category, sourceUrl: movie.sourceUrl });

    return {
      id: slugTitle(movie.title),
      libraryId: slugTitle(movie.title),
      type: category,
      title: movie.title,
      ...(typeof movie.rating === "number" ? { rating: movie.rating } : {}),
      description: `${date} 周末放映会历史记录，来源于电影.txt。`,
      ...(movie.sourceUrl ? { sourceUrl: movie.sourceUrl } : {}),
      tags,
      note: `${dateFragment || date} 归档；${movie.sourceUrl ? "已记录播放入口。" : "缺少独立播放入口。"}`
    };
  });

  const title = movies.length === 1
    ? `《${movies[0].title}》`
    : `《${movies[0].title}》与《${movies[1].title}》${movies.length > 2 ? `等 ${movies.length} 部` : ""}`;
  const recordUrl = movieSegments.find((movie) => movie.sourceUrl)?.sourceUrl;

  return {
    id: `screening-${date}-${String(index + 1).padStart(3, "0")}`,
    date,
    startsAt: `${date}T20:00:00+08:00`,
    title,
    theme: `从电影.txt 导入的真实历史放映记录，包含 ${movies.length} 个片目。`,
    status: "ended",
    statusText: "已归档",
    movies,
    notes: `${dateFragment || date}；原始记录已保留在电影.txt。`,
    ...(recordUrl ? { recordUrl } : {}),
    archivedAt: `${date}T23:30:00+08:00`
  };
}

function mergeTags(...tagGroups) {
  return Array.from(new Set(tagGroups.flat().filter(Boolean)));
}

function buildLibraryItems(weeks) {
  const byId = new Map();

  for (const week of weeks) {
    for (const movie of week.movies) {
      const sourceType = inferSourceType({ title: movie.title, block: `${week.notes || ""} ${movie.note || ""}` });
      const existing = byId.get(movie.libraryId);
      const tags = mergeTags(movie.tags || [], [sourceType === "anime" ? "动画" : undefined]);

      if (existing) {
        byId.set(movie.libraryId, {
          ...existing,
          rating: existing.rating ?? movie.rating,
          sourceUrl: existing.sourceUrl || movie.sourceUrl,
          sourceNote: existing.sourceNote || movie.note,
          tags: mergeTags(existing.tags, tags),
          timesWatched: existing.timesWatched + 1,
          lastWatchedAt: existing.lastWatchedAt > week.date ? existing.lastWatchedAt : week.date
        });
        continue;
      }

      byId.set(movie.libraryId, {
        id: movie.libraryId,
        title: movie.title,
        type: sourceType,
        category: movie.type,
        ...(typeof movie.rating === "number" ? { rating: movie.rating } : {}),
        description: `从电影.txt 导入的真实历史片源，首次归档于 ${week.date}。`,
        tags,
        ...(movie.sourceUrl ? { sourceUrl: movie.sourceUrl } : {}),
        sourceNote: movie.note,
        status: "watched",
        priority: movie.type === "bad" ? "high" : "normal",
        timesWatched: 1,
        lastWatchedAt: week.date,
        addedAt: week.date
      });
    }
  }

  return Array.from(byId.values()).sort((a, b) => (b.lastWatchedAt || "").localeCompare(a.lastWatchedAt || ""));
}

function buildClassicsTimeline(weeks) {
  return [...weeks]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 18)
    .map((week) => ({
      id: `memory-${week.id}`,
      year: week.date,
      title: week.title,
      description: `${week.date} 已归档，${week.movies.map((movie) => `《${movie.title}》`).join("、")}。`,
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",
      tags: mergeTags(["历史归档"], week.movies.flatMap((movie) => movie.tags || []).slice(0, 3))
    }));
}

function buildFeaturedMovies(libraryItems) {
  return libraryItems
    .filter((item) => typeof item.rating === "number" && item.rating >= 8.5)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 12)
    .map((item) => ({
      id: `classic-${item.id}`,
      title: item.title,
      reason: item.sourceNote || "电影.txt 真实历史归档高分片目。",
      date: item.lastWatchedAt || item.addedAt,
      viewers: 0,
      rating: item.rating
    }));
}

function buildAnimeHistory(libraryItems) {
  return libraryItems
    .filter((item) => item.type === "anime" || item.category === "anime")
    .sort((a, b) => (b.lastWatchedAt || "").localeCompare(a.lastWatchedAt || ""))
    .slice(0, 12)
    .map((item) => ({
      id: `anime-${item.id}`,
      title: item.title,
      reason: item.sourceNote || "电影.txt 动画历史归档片目。",
      date: item.lastWatchedAt || item.addedAt,
      viewers: 0,
      ...(typeof item.rating === "number" ? { rating: item.rating } : {})
    }));
}

function printConst(name, value) {
  return `export const ${name} = ${JSON.stringify(value, null, 2)};\n`;
}

function printTypedConst(name, value, typeName) {
  return `export const ${name} = ${JSON.stringify(value, null, 2)} as ${typeName};\n`;
}

const raw = await readFile(sourcePath, "utf8");
const sourceHash = createHash("sha256").update(raw).digest("hex");
const weeks = splitBlocks(raw)
  .map(parseBlock)
  .filter(Boolean)
  .sort((a, b) => a.date.localeCompare(b.date));
const libraryItems = buildLibraryItems(weeks);
const allTags = mergeTags(["真实历史", "电影.txt", "周末放映会"], libraryItems.flatMap((item) => item.tags));
const badItems = libraryItems.filter((item) => item.category === "bad" && typeof item.rating === "number");
const topBad = badItems.sort((a, b) => (a.rating || 0) - (b.rating || 0))[0];
const stats = {
  totalMovies: libraryItems.length,
  goodMovies: libraryItems.filter((item) => item.category === "classic" || item.category === "good" || item.category === "anime").length,
  badMovies: libraryItems.filter((item) => item.category === "bad").length,
  totalScreenings: weeks.length,
  totalRecordUrls: weeks.filter((week) => week.recordUrl).length,
  topBadMovie: topBad ? {
    title: topBad.title,
    rating: topBad.rating,
    note: topBad.sourceNote || "来自电影.txt 历史归档",
    votes: 0
  } : {
    title: "暂无",
    rating: 0,
    note: "暂无反面案例",
    votes: 0
  }
};

const output = [
  "import type { ClassicMovie, ClassicScreening, ScreeningSourceItem, ScreeningWeek } from \"../types\";",
  "",
  "// This file is generated from ../../../电影.txt by scripts/import-screening-history.mjs.",
  "// Edit 电影.txt, then run `npm run screenings:import-history` to refresh it.",
  "",
  `export const generatedScreeningHistorySource = ${JSON.stringify({
    sourceFile: "电影.txt",
    sourceHash,
    generatedAt: new Date().toISOString(),
    totalScreenings: weeks.length,
    totalItems: libraryItems.length
  }, null, 2)};`,
  "",
  printTypedConst("generatedScreeningHistoryWeeks", weeks, "ScreeningWeek[]"),
  printTypedConst("generatedScreeningHistoryLibraryItems", libraryItems, "ScreeningSourceItem[]"),
  printTypedConst("generatedScreeningHistoryTags", allTags, "string[]"),
  printTypedConst("generatedScreeningClassicsTimeline", buildClassicsTimeline(weeks), "ClassicScreening[]"),
  printTypedConst("generatedScreeningFeaturedMovies", buildFeaturedMovies(libraryItems), "ClassicMovie[]"),
  printTypedConst("generatedScreeningAnimeHistoryMovies", buildAnimeHistory(libraryItems), "ClassicMovie[]"),
  printConst("generatedScreeningHistoryStats", stats)
].join("\n");

await writeFile(outputPath, `${output}\n`, "utf8");

console.log(`Imported ${weeks.length} screenings and ${libraryItems.length} unique titles from 电影.txt`);
