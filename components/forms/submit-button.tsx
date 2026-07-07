"use client";

import { CircleNotch } from "@phosphor-icons/react/dist/ssr";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function SubmitButton({
  children,
  pendingLabel = "Guardando",
  tone = "primary",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  tone?: "primary" | "chrome" | "quiet" | "danger";
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" tone={tone} disabled={pending} iconLeft={pending ? <CircleNotch size={16} weight="bold" className="animate-spin" aria-hidden /> : undefined}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
