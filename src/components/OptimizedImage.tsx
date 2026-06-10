import { useState, useRef } from "react";
import { cn } from "../lib/utils";

type OptimizedImageProps = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  fallbackColor?: string;
  fallbackText?: string;
  srcSet?: string;
  sizes?: string;
  decoding?: "sync" | "async" | "auto";
  loading?: "lazy" | "eager";
};

export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  aspectRatio = "auto",
  fallbackColor = "bg-gradient-to-br from-primary/20 to-primary/10",
  fallbackText,
  srcSet,
  sizes,
  decoding = "async",
  loading = "lazy"
}: OptimizedImageProps) {
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");
  const imgRef = useRef<HTMLImageElement | null>(null);

  const placeholderAspect = aspectRatio !== "auto" ? aspectRatio : width && height ? `${width}/${height}` : undefined;

  return (
    <div
      className={cn("relative overflow-hidden bg-muted/30", className)}
      style={placeholderAspect ? { aspectRatio: placeholderAspect } : undefined}
    >
      {state === "loading" && (
        <div className="absolute inset-0 animate-pulse bg-muted/50" />
      )}

      {state === "error" && (
        <div className={cn("absolute inset-0 flex items-center justify-center", fallbackColor)}>
          {fallbackText ? (
            <span className="text-4xl font-semibold text-primary/60 select-none">{fallbackText}</span>
          ) : (
            <svg className="size-10 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          )}
        </div>
      )}

      {state !== "error" && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          decoding={decoding}
          srcSet={srcSet}
          sizes={sizes}
          className={cn(
            "w-full h-auto object-cover transition-opacity duration-300",
            state === "loaded" ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setState("loaded")}
          onError={() => setState("error")}
        />
      )}
    </div>
  );
}
