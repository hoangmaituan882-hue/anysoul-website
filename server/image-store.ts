import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export type ThumbnailMeta = {
  imageId: string;
  width: number;
  format: "webp" | "avif" | "jpeg";
  filePath: string;
  fileSize: number;
};

export type ThumbnailSet = {
  "150w": ThumbnailMeta;
  "400w": ThumbnailMeta;
  "800w": ThumbnailMeta;
};

const THUMBNAIL_WIDTHS = [150, 400, 800] as const;

function thumbnailDir(dataDir: string) {
  return path.join(dataDir, "uploads", "thumbs");
}

function thumbnailFileName(imageId: string, width: number): string {
  return `${imageId}_${width}w.webp`;
}

function thumbnailFilePath(dataDir: string, imageId: string, width: number): string {
  return path.join(thumbnailDir(dataDir), thumbnailFileName(imageId, width));
}

export async function generateThumbnails(buffer: Buffer, imageId: string, dataDir: string): Promise<ThumbnailSet> {
  const thumbsDir = thumbnailDir(dataDir);
  await mkdir(thumbsDir, { recursive: true });

  const image = sharp(buffer);
  const metadata = await image.metadata();

  const result = {} as ThumbnailSet;

  for (const width of THUMBNAIL_WIDTHS) {
    const filePath = thumbnailFilePath(dataDir, imageId, width);

    let pipeline = image.clone();
    const originalWidth = metadata.width || width;
    const originalHeight = metadata.height;

    if (width < originalWidth) {
      pipeline = pipeline.resize(width, undefined, {
        fit: "inside",
        withoutEnlargement: true
      });
    }

    const output = await pipeline.webp({ quality: 80 }).toBuffer();
    await writeFile(filePath, output);

    const key = `${width}w` as keyof ThumbnailSet;
    result[key] = {
      imageId,
      width,
      format: "webp",
      filePath,
      fileSize: output.length
    };
  }

  return result;
}

export function getThumbnailUrl(imageId: string, width: number, publicBase: string): string {
  const fileName = thumbnailFileName(imageId, width);
  return `${publicBase.replace(/\/$/, "")}/uploads/thumbs/${fileName}`;
}

export function getThumbnailUrls(imageId: string, publicBase: string): Record<string, string> {
  return {
    "150w": getThumbnailUrl(imageId, 150, publicBase),
    "400w": getThumbnailUrl(imageId, 400, publicBase),
    "800w": getThumbnailUrl(imageId, 800, publicBase)
  };
}

export function isImageFormatSupported(mimeType: string) {
  return ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"].includes(mimeType);
}

export function detectBestFormat(acceptHeader: string | undefined): "avif" | "webp" | "jpeg" {
  if (!acceptHeader) return "webp";
  if (acceptHeader.includes("image/avif")) return "avif";
  if (acceptHeader.includes("image/webp")) return "webp";
  return "jpeg";
}

export function thumbnailFilePathStatic(dataDir: string, imageId: string, width: number): string {
  return thumbnailFilePath(dataDir, imageId, width);
}
