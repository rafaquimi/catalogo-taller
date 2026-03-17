"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-950 dark:hover:bg-zinc-900"
      onClick={() => signOut({ callbackUrl: "/login" })}
      type="button"
    >
      Salir
    </button>
  );
}

