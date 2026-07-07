"use client";

import { Trash, Warning } from "@phosphor-icons/react/dist/ssr";
import { useRef, useState } from "react";
import { ModalLayer } from "@/components/layout/modal-layer";
import { Button } from "@/components/ui/button";

export function ConfirmDeleteButton({
  title = "Confirmar eliminación",
  message = "Esta acción no se puede deshacer.",
  confirmLabel = "Eliminar",
  children = "Eliminar",
  compact = false,
  ariaLabel = "Eliminar",
}: {
  title?: string;
  message?: string;
  confirmLabel?: string;
  children?: React.ReactNode;
  compact?: boolean;
  ariaLabel?: string;
}) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function submitParentForm() {
    const form = wrapperRef.current?.closest("form");
    if (!form) return;
    setSubmitting(true);
    form.requestSubmit();
  }

  return (
    <>
      <span ref={wrapperRef}>
        <Button
          type="button"
          tone="danger"
          iconLeft={<Trash size={16} weight="fill" aria-hidden />}
          onClick={() => setOpen(true)}
          className={compact ? "min-h-10 min-w-10 px-2 py-2" : undefined}
          aria-label={compact ? ariaLabel : undefined}
        >
          {compact ? <span className="sr-only">{ariaLabel}</span> : children}
        </Button>
      </span>
      {open ? (
        <ModalLayer>
          <div className="w-full max-w-md rounded-[1.35rem] bg-[color:var(--surface)] p-5 shadow-[var(--shadow-soft)] ring-1 ring-[color:var(--danger)]/35">
            <div className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--danger)] text-white shadow-[var(--shadow-control)]">
                <Warning size={20} weight="fill" aria-hidden />
              </span>
              <div>
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{message}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <Button type="button" tone="quiet" onClick={() => setOpen(false)} disabled={submitting}>
                Cancelar
              </Button>
              <Button type="button" tone="danger" iconLeft={<Trash size={16} weight="fill" aria-hidden />} onClick={submitParentForm} disabled={submitting}>
                {submitting ? "Eliminando" : confirmLabel}
              </Button>
            </div>
          </div>
        </ModalLayer>
      ) : null}
    </>
  );
}
