import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { SignOutButton } from "./SignOutButton";

export default async function CatalogoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <header className="sticky top-0 z-10 border-b border-black/10 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-black/60">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link className="text-sm font-semibold" href="/catalogo">
              Catálogo
            </Link>
            <span className="text-xs text-zinc-500">{session.user?.email}</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-950 dark:hover:bg-zinc-900"
              href="/catalogo/nueva"
            >
              Nueva pieza
            </Link>
            <Link
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-950 dark:hover:bg-zinc-900"
              href="/catalogo/familias"
            >
              Familias
            </Link>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}

