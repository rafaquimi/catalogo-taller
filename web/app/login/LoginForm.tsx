"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = useMemo(
    () => searchParams.get("callbackUrl") ?? "/catalogo",
    [searchParams],
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="w-full space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
          const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
            callbackUrl,
          });
          if (!res || res.error) {
            setError("Email o contraseña incorrectos.");
            return;
          }
          router.push(res.url ?? callbackUrl);
          router.refresh();
        } finally {
          setLoading(false);
        }
      }}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <input
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-zinc-950"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Contraseña</label>
        <input
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-zinc-950"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <button
        className="inline-flex w-full items-center justify-center rounded-xl bg-black px-4 py-3 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-60"
        type="submit"
        disabled={loading}
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}

