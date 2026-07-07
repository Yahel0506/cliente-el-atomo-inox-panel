"use client";

import { ImageSquare } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ImageUploadField({
  name,
  currentSrc,
  label = "Imagen",
  className,
  required,
}: {
  name: string;
  currentSrc?: string | null;
  label?: string;
  className?: string;
  required?: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const src = preview || currentSrc || "";

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className={cn("flex h-full min-h-[360px] flex-col gap-3", className)}>
      <div className="relative min-h-[280px] flex-1 overflow-hidden rounded-[1.25rem] bg-[color:var(--surface-soft)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full min-h-[280px] items-center justify-center text-[color:var(--muted)]">
            <ImageSquare size={38} weight="fill" aria-hidden />
          </div>
        )}
      </div>
      <label className="focus-ring ui-pressable inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-[color:var(--panel-raised)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] shadow-[var(--shadow-control)] transition-[transform,background-color] duration-160 ease-[var(--ease-out-premium)] hover:bg-[color:var(--surface-soft)] active:scale-[0.97]">
        <ImageSquare size={16} weight="fill" aria-hidden />
        <span>{src ? "Editar imagen" : required ? "Añadir imagen *" : "Añadir imagen"}</span>
        <input
          type="file"
          name={name}
          accept="image/*"
          className="sr-only"
          required={required && !currentSrc}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (!file) return;
            if (preview) URL.revokeObjectURL(preview);
            setPreview(URL.createObjectURL(file));
          }}
          aria-label={label}
        />
      </label>
      {required && !currentSrc ? <p className="text-xs font-semibold text-[color:var(--danger)]">La imagen es obligatoria para crear el producto.</p> : null}
    </div>
  );
}
