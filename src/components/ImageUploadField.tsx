import { useRef, useState } from "react";
import { Image, Loader2, Upload } from "lucide-react";
import { uploadImageAsset } from "../content/client";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../lib/utils";

type ImageUploadFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  admin?: boolean;
  readOnly?: boolean;
  scope?: string;
  compact?: boolean;
};

export function ImageUploadField({ label, value, onChange, admin = false, readOnly = false, scope = "media", compact = false }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { authFetch } = useAuth();
  const [status, setStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const canPickFile = !readOnly && !isUploading;

  async function uploadFile(file?: File) {
    if (!file) return;

    setIsUploading(true);
    setStatus("上传中...");

    try {
      const result = await uploadImageAsset(authFetch, file, { admin, scope });
      onChange(result.asset.url);
      setStatus(result.storage === "object" ? "已上传到对象存储" : "已上传到本地存储");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "上传失败");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("space-y-2", compact && "space-y-1.5")}>
      <div className="flex items-center justify-between gap-2">
        <label className="text-[12px] font-bold text-muted-foreground">{label}</label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={!canPickFile}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[12px] font-black text-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          {isUploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />} 上传
        </button>
      </div>
      <div className={cn("grid gap-2", compact ? "grid-cols-[56px_1fr]" : "grid-cols-[84px_1fr]")}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={!canPickFile}
          aria-label={`选择${label}`}
          className={cn(
            "group relative overflow-hidden rounded-lg border border-border bg-muted text-left transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-70",
            canPickFile && "hover:border-primary/40",
            compact ? "size-14" : "size-20"
          )}
        >
          {value ? (
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <Image className={compact ? "size-5" : "size-7"} />
            </div>
          )}
          {canPickFile ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/25 group-hover:opacity-100">
              <Upload className="size-5 text-white drop-shadow" />
            </div>
          ) : null}
        </button>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          readOnly={readOnly}
          className="h-10 min-w-0 rounded-lg border border-border bg-card px-3 text-sm font-medium outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/15 read-only:opacity-70"
          placeholder="https://..."
        />
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) => uploadFile(event.target.files?.[0])}
      />
      {status ? <div className="truncate text-[11px] font-bold text-muted-foreground">{status}</div> : null}
    </div>
  );
}
