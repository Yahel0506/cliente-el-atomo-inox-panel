import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[1.15rem] bg-[#181818] shadow-[var(--shadow-control)]",
        compact ? "h-11 w-11 justify-center p-2" : "gap-1 px-3 py-2 pr-4",
        className,
      )}
    >
      <span className="inline-flex h-15 w-15 shrink-0 items-center justify-center">
        <Image src="/images/brand/logo.webp" alt="" width={60} height={60} priority />
      </span>
      {!compact ? (
        <span className="min-w-0">
          <Image src="/images/brand/logo_name.webp" alt="El Átomo Inox" width={240} height={80} className="h-auto w-[240px]" priority />
        </span>
      ) : null}
    </span>
  );
}
