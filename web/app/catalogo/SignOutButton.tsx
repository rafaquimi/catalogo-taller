"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      className="rounded-xl border border-blue-300 bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20 dark:border-blue-400"
      onClick={() => signOut({ callbackUrl: "/login" })}
      type="button"
    >
      Salir
    </button>
  );
}

