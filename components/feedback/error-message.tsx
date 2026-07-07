import { translateErrorMessage } from "@/lib/formatters/errors";

export function decodeErrorParam(error?: string) {
  if (!error) return "";

  try {
    return translateErrorMessage(decodeURIComponent(error));
  } catch {
    return translateErrorMessage(error);
  }
}

export function ErrorMessage({ error, className = "mb-4" }: { error?: string; className?: string }) {
  const message = decodeErrorParam(error);
  if (!message) return null;

  return (
    <p className={`${className} rounded-md border border-[color:var(--danger)]/45 bg-[color:var(--danger)]/10 p-3 text-sm text-[color:var(--danger)]`}>
      {message}
    </p>
  );
}
