import "dotenv/config";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

// ─── config ────────────────────────────────────────
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backupDir = path.join(rootDir, "server", "data");
const databaseUrl = process.env.DATABASE_URL;
const isDryRun = process.argv.includes("--dry-run");
const argFile = process.argv.find((a) => a.endsWith(".json") && !a.startsWith("--"));

// ─── helpers ───────────────────────────────────────
function extractBvid(url) {
  const m = url.match(/BV[a-zA-Z0-9]+/);
  return m ? m[0] : createHash("sha1").update(url).digest("hex").slice(0, 10);
}

function cleanTitle(raw) {
  return raw
    .replace(/^\s*【[^】]*】\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseCount(raw) {
  if (!raw || raw === "-" || raw === "--") return 0;
  const s = String(raw).trim();
  if (s.includes("万")) return Math.round(parseFloat(s) * 10000);
  return parseInt(s, 10) || 0;
}

function formatDuration(raw) {
  if (!raw) return "";
  const parts = String(raw).split(":").map(Number);
  if (parts.length === 3) {
    const [h, m, s] = parts;
    if (h > 0 && m > 0) return `${h}时${m}分`;
    if (h > 0) return `${h}时`;
    if (m > 0 && s > 0) return `${m}分${s}秒`;
    if (m > 0) return `${m}分`;
    return `${s}秒`;
  }
  if (parts.length === 2) {
    const [m, s] = parts;
    if (m > 0 && s > 0) return `${m}分${s}秒`;
    return `${m}分`;
  }
  return raw;
}

function detectCategory(title, rawTitle) {
  const t = (title + rawTitle).toLowerCase();
  if (t.includes("杂谈")) return "talk";
  if (t.includes("鉴赏") || t.includes("op/ed") || t.includes("oped") || t.includes("新番")) return "special";
  if (t.includes("联动") || t.includes("茶话会") || t.includes("一起看") || t.includes("狼人杀") || t.includes("谁是卧底") || t.includes("发布会") || t.includes("入坑")) return "special";
  return "other";
}

function formatDate(raw) {
  if (!raw) return "";
  return String(raw).trim();
}

function buildTalkId(bvid) {
  return `talk-${bvid}`;
}

function videoToTalkItem(video) {
  const rawTitle = String(video.title || "");
  const bvid = extractBvid(String(video.url || ""));
  const title = cleanTitle(rawTitle);
  const category = detectCategory(title, rawTitle);

  return {
    id: buildTalkId(bvid),
    title,
    subtitle: rawTitle.replace(/^\s*【[^】]*】\s*/g, "").trim(),
    date: formatDate(video.date),
    time: "",
    duration: formatDuration(video.duration),
    coverUrl: "",
    status: "archived",
    category,
    host: "泛式",
    guests: [],
    tags: category === "talk" ? ["直播回放", "杂谈回"] : ["直播回放", "特别回"],
    summary: "",
    summaryBullets: [],
    highlights: [],
    viewers: parseCount(video.playCount),
    danmaku: parseCount(video.danmakuCount),
    likes: 0,
    sourceUrl: String(video.url || ""),
    videoUrl: String(video.url || ""),
    videoProvider: "bilibili",
    transcript: [],
    comments: [],
    mentions: []
  };
}

function isPlaceholderTalk(talk) {
  const url = (talk.sourceUrl || "").trim();
  if (!url) return true;
  if (url === "https://www.bilibili.com/" || url === "https://www.bilibili.com") return true;
  if (url.includes("example.com") || url.includes("placeholder")) return true;
  if (talk.id && (talk.id.startsWith("talk-demo") || talk.id.includes("2026-06") && !url.includes("bilibili"))) return true;
  return false;
}

// ─── main ──────────────────────────────────────────
async function main() {
  // 1. locate JSON
  let jsonPath = argFile ? path.resolve(argFile) : null;
  if (!jsonPath) {
    const entries = await readdir(rootDir, { withFileTypes: true }).catch(() => []);
    const candidates = [];
    for (const e of entries || []) {
      if (e.isFile() && e.name.endsWith(".json") && e.name !== "package.json" && e.name !== "package-lock.json" && e.name !== "tsconfig.json" && e.name !== "metadata.json") {
        candidates.push(e.name);
      }
    }
    if (candidates.length === 0) {
      console.error("未找到 JSON 文件。请将视频列表 JSON 放到项目根目录，或通过参数指定路径。");
      console.error("用法: npm run talks:import -- 文件名.json");
      process.exit(1);
    }
    jsonPath = path.join(rootDir, candidates[0]);
  }

  console.log(`读取 ${path.basename(jsonPath)} ...`);
  const raw = await readFile(jsonPath, "utf-8");
  const data = JSON.parse(raw);
  const videos = Array.isArray(data.videos) ? data.videos : [];
  if (videos.length === 0) {
    console.error("JSON 中无 videos 数组或数组为空");
    process.exit(1);
  }

  console.log(`解析到 ${videos.length} 条视频记录`);

  // 2. parse to TalkItem[]
  const imported = videos.map(videoToTalkItem);

  if (!databaseUrl) {
    console.error("DATABASE_URL 未配置。请在 .env 中设置。");
    process.exit(1);
  }

  console.log("连接 PostgreSQL ...");
  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();

  try {
    // 3. read current talks.main
    const result = await client.query(
      "select published from content_entries where key = $1 and status = 'published'",
      ["talks.main"]
    );

    let talksContent = result.rowCount > 0 ? (result.rows[0].published || {}) : {};
    if (typeof talksContent !== "object" || Array.isArray(talksContent)) {
      talksContent = {};
    }

    const archive = Array.isArray(talksContent.archive) ? [...talksContent.archive] : [];
    console.log(`当前录像库: ${archive.length} 条 (含 ${archive.filter(isPlaceholderTalk).length} 条占位)`);

    // 4. backup
    const backupFile = path.join(backupDir, `talks-backup-${Date.now()}.json`);
    await mkdir(backupDir, { recursive: true });
    await writeFile(backupFile, JSON.stringify(archive, null, 2), "utf-8");
    console.log(`备份: ${path.basename(backupFile)}`);

    // 5. remove placeholders
    const sourceUrlSet = new Set(archive.filter((t) => !isPlaceholderTalk(t)).map((t) => (t.sourceUrl || "").trim()).filter(Boolean));
    const cleaned = archive.filter((t) => !isPlaceholderTalk(t));
    const removedCount = archive.length - cleaned.length;

    // 6. dedup & add
    let addedCount = 0;
    let skippedCount = 0;

    for (const item of imported) {
      if (sourceUrlSet.has(item.sourceUrl)) {
        skippedCount += 1;
        continue;
      }
      cleaned.push(item);
      sourceUrlSet.add(item.sourceUrl);
      addedCount += 1;
    }

    // 7. sort by date desc
    cleaned.sort((a, b) => {
      const da = a.date || "0000-00-00";
      const db = b.date || "0000-00-00";
      return db.localeCompare(da);
    });

    // 8. number episodes (asc by date)
    cleaned.reverse();
    cleaned.forEach((talk, idx) => {
      talk.episodeNo = idx + 1;
    });
    cleaned.reverse();

    // 9. fix dangling liveTalkId
    const archiveIds = new Set(cleaned.map((t) => t.id));
    let liveTalkId = talksContent.liveTalkId || "";
    let liveFixed = false;
    if (liveTalkId && !archiveIds.has(liveTalkId)) {
      liveTalkId = "";
      liveFixed = true;
    }

    if (isDryRun) {
      console.log("\n=== DRY RUN 预览 (未写入) ===");
      console.log(`删除占位: ${removedCount} 条`);
      console.log(`新增: ${addedCount} 条`);
      console.log(`跳过重复: ${skippedCount} 条`);
      console.log(`最终录像库: ${cleaned.length} 条`);
      if (liveFixed) console.log(`liveTalkId 已清空 (原指向已删除条目)`);
      console.log("\n前 5 条预览:");
      for (const t of cleaned.slice(0, 5)) {
        console.log(`  [${t.episodeNo}] ${t.date} | ${t.title} | ${t.duration} | ${t.viewers}次播放`);
      }
      return;
    }

    // 10. write back
    talksContent.archive = cleaned;
    talksContent.liveTalkId = liveTalkId;

    await client.query("begin");

    await client.query(
      `update content_entries
       set draft = $2, published = $2, version = version + 1, updated_at = now(), published_at = now()
       where key = $1`,
      ["talks.main", JSON.stringify(talksContent)]
    );

    // bump site version
    const meta = await client.query(
      `insert into content_meta (id, site_version, updated_at)
       values ('main', 1, now())
       on conflict (id) do update set site_version = content_meta.site_version + 1, updated_at = now()
       returning site_version`
    );
    const siteVersion = Number(meta.rows[0]?.site_version || 1);

    // record event
    const eventMessage = `导入杂谈录像: ${addedCount} 新增, ${skippedCount} 跳过, ${removedCount} 清理占位`;
    await client.query(
      `insert into content_events (id, type, keys, version, message, actor_id, actor_name, actor_role, created_at)
       values ($1, 'content.published', $2, $3, $4, 'Import Script', 'Import Script', 'admin', now())`,
      [`event-talks-import-${Date.now()}`, ["talks.main"], siteVersion, eventMessage]
    );

    await client.query("commit");

    console.log("\n=== 导入完成 ===");
    console.log(`删除占位: ${removedCount} 条`);
    console.log(`新增: ${addedCount} 条`);
    console.log(`跳过重复: ${skippedCount} 条`);
    console.log(`最终录像库: ${cleaned.length} 条`);
    if (liveFixed) console.log(`liveTalkId 已清空 (原指向已删除条目)`);
  } catch (error) {
    await client.query("rollback").catch(() => {});
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
