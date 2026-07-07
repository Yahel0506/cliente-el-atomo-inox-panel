import { redirect } from "next/navigation";
import { signInAction } from "@/features/auth/actions";
import { BrandLogo } from "@/components/brand/brand-logo";
import { getAdminSession } from "@/lib/permissions/admin";
import { AuthSubmitButton } from "@/components/forms/auth-submit-button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const session = await getAdminSession();
  if (session) redirect("/dashboard");
  const params = await searchParams;
  const error = params?.error;

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <section className="brand-surface page-enter w-full max-w-[420px] rounded-lg p-7">
        <div className="mb-7 flex justify-center">
          <BrandLogo />
        </div>

        {error ? (
          <p className="mb-4 rounded-md border border-[color:var(--danger)]/45 bg-[color:var(--danger)]/10 p-3 text-sm text-[color:var(--danger)]">
            {error === "config" ? "Falta configurar la conexión del panel." : decodeURIComponent(error)}
          </p>
        ) : null}

        <form action={signInAction} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-bold">Correo</span>
            <input
              className="field-control"
              type="email"
              name="email"
              autoComplete="email"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold">Contraseña</span>
            <input
              className="field-control"
              type="password"
              name="password"
              autoComplete="current-password"
              required
            />
          </label>
          <AuthSubmitButton />
        </form>
      </section>
    </main>
  );
}
