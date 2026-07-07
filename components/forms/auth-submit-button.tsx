"use client";

import { CircleNotch } from "@phosphor-icons/react/dist/ssr";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function AuthSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      tone="primary"
      className="w-full"
      disabled={pending}
      iconLeft={pending ? <CircleNotch size={16} weight="bold" className="animate-spin" aria-hidden /> : undefined}
    >
      {pending ? "Entrando" : "Entrar"}
    </Button>
  );
}
