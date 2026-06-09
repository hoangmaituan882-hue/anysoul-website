import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(rootDir, "src/generated/changelog.ts");

const TYPE_META = {
  新功能: { color: "bg-emerald-100 text-emerald-800" },
  修复: { color: "bg-rose-100 text-rose-800" },
  改进: { color: "bg-blue-100 text-blue-800" },
  维护: { color: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100" }
};

function git(args) {
  return execFileSync("git", args, {
    cwd: rootDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"]
  }).trim();
}

function classifyCommit(subject, body, files, changedFiles) {
  const text = `${subject}\n${body}`.toLowerCase();
  const fileText = files.join("\n").toLowerCase();
  const addedFileText = changedFiles
    .filter((file) => file.status === "A")
    .map((file) => file.path)
    .join("\n")
    .toLowerCase();

  const isFix = /^(fix|restore|allow)(\b|:)/i.test(subject)
    || /(修复|错误|失败|权限|遮挡|登录|构建|报错|failed|error|bug|broken|crash)/i.test(text);
  if (isFix) return "修复";

  const isExplicitFeature = /^(feat|add)(\b|:)/i.test(subject)
    || /^(新增|增加)/.test(subject);
  if (isExplicitFeature) return "新功能";

  const isImprovement = /^(improve|refine|optimize|streamline|rebuild)(\b|:)/i.test(subject)
    || /(improve|refine|optimize|streamline|rebuild|derive|simplify|优化|重构|调整|升级|完善)/i.test(text);
  if (isImprovement) return "改进";

  const isFeature = /(新增|增加|接入|添加|create|implement)/i.test(text)
    || /(pages\/.+\.tsx|workspace\/.+panel\.tsx|server\/index\.ts)/i.test(addedFileText);
  if (isFeature) return "新功能";

  const isMaintenance = /^(chore|configure|preset|merge|initial)(\b|:)/i.test(subject)
    || /(\.env|package-lock|package\.json|vite\.config|tsconfig|readme|部署|备案|配置|模板)/i.test(fileText);
  if (isMaintenance) return "维护";

  return "改进";
}

function summarizeFiles(files) {
  if (!files.length) return "未记录具体文件变更";
  const groups = [
    ["页面", files.filter((file) => file.startsWith("src/pages/")).length],
    ["组件", files.filter((file) => file.startsWith("src/components/")).length],
    ["工作台", files.filter((file) => file.startsWith("src/workspace/")).length],
    ["内容数据", files.filter((file) => file.startsWith("src/content/") || file.startsWith("src/data/")).length],
    ["后端", files.filter((file) => file.startsWith("server/")).length],
    ["脚本配置", files.filter((file) => file.startsWith("scripts/") || file === "package.json" || file.startsWith(".env")).length]
  ].filter(([, count]) => count > 0);

  if (!groups.length) return `涉及 ${files.length} 个文件`;
  return groups.map(([label, count]) => `${label} ${count}`).join("、");
}

function commitToUpdate(hash) {
  const raw = git(["show", "-s", "--date=short", "--format=%H%x1f%h%x1f%ad%x1f%s%x1f%b", hash]);
  const [fullHash, shortHash, date, subject, ...bodyParts] = raw.split("\x1f");
  const body = bodyParts.join("\x1f").trim();
  const changedFiles = git(["show", "--name-status", "--pretty=format:", fullHash])
    .split(/\r?\n/)
    .map((file) => file.trim())
    .filter(Boolean)
    .map((line) => {
      const [status, ...parts] = line.split(/\t/);
      return { status, path: parts.at(-1) || status };
    });
  const files = changedFiles.map((file) => file.path);
  const type = classifyCommit(subject, body, files, changedFiles);
  const fileSummary = summarizeFiles(files);
  const description = body || `本次提交更新了相关功能与页面体验，影响范围：${fileSummary}。`;

  return {
    version: shortHash,
    hash: fullHash,
    date,
    title: subject.replace(/^(feat|fix|chore):\s*/i, ""),
    description,
    files,
    items: [
      { type, text: subject, color: TYPE_META[type].color },
      { type: "影响范围", text: fileSummary, color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100" }
    ]
  };
}

function buildRoadmap(updates) {
  return updates
    .slice(0, 8)
    .reverse()
    .map((update, index) => ({
      version: update.version,
      subtitle: update.items[0]?.type || "更新",
      status: "published",
      statusText: "已发布",
      date: update.date,
      cardsPosition: index % 2 === 0 ? "top" : "bottom",
      cards: update.items.map((item) => ({
        type: item.type,
        title: item.text,
        description: item.type === "影响范围" ? "" : update.description
      }))
    }));
}

function fallbackData() {
  const update = {
    version: "local",
    hash: "local",
    date: new Date().toISOString().slice(0, 10),
    title: "更新记录待生成",
    description: "当前构建环境无法读取 Git 历史，页面会在可读取仓库提交后自动刷新。",
    files: [],
    items: [
      { type: "维护", text: "更新记录待生成", color: TYPE_META.维护.color }
    ]
  };
  return { updates: [update], roadmap: buildRoadmap([update]) };
}

function writeGeneratedFile(updates, roadmap) {
  mkdirSync(dirname(outputPath), { recursive: true });
  const source = `// This file is generated by scripts/generate-changelog.mjs. Do not edit by hand.
export type GeneratedChangelogItem = {
  type: string;
  text: string;
  color: string;
};

export type GeneratedChangelogUpdate = {
  version: string;
  hash: string;
  date: string;
  title: string;
  description: string;
  files: string[];
  items: GeneratedChangelogItem[];
};

export type GeneratedRoadmapNode = {
  version: string;
  subtitle: string;
  status: "published" | "planned";
  statusText: string;
  date: string;
  cardsPosition: "top" | "bottom";
  cards: Array<{
    type: string;
    title: string;
    description: string;
  }>;
};

export const changelogUpdates: GeneratedChangelogUpdate[] = ${JSON.stringify(updates, null, 2)};

export const changelogRoadmap: GeneratedRoadmapNode[] = ${JSON.stringify(roadmap, null, 2)};
`;
  writeFileSync(outputPath, source, "utf8");
  console.log(`Generated ${updates.length} changelog entries at ${outputPath}`);
}

try {
  const hashes = git(["rev-list", "HEAD"]).split(/\r?\n/).filter(Boolean);
  const updates = hashes.map(commitToUpdate);
  writeGeneratedFile(updates, buildRoadmap(updates));
} catch (error) {
  if (existsSync(outputPath)) {
    console.warn("Could not read Git history; keeping existing generated changelog.");
  } else {
    const { updates, roadmap } = fallbackData();
    writeGeneratedFile(updates, roadmap);
  }
}
