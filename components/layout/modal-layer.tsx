"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

export function ModalLayer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="modal-layer fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4" role="presentation">
      {children}
    </div>,
    document.body,
  );
}
