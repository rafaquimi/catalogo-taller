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
    <div className="min-h-screen bg-blue-50 text-zinc-950 dark:bg-blue-950 dark:text-zinc-50">
      <header className="sticky top-0 z-10 border-b border-blue-200 bg-blue-700 shadow-md dark:border-blue-800 dark:bg-blue-900">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link className="text-lg font-bold tracking-wide text-white" href="/catalogo">
              Catálogo
            </Link>
            <span className="text-xs text-blue-200">{session.user?.email}</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              className="rounded-xl border border-blue-500 bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 dark:border-blue-400 dark:bg-blue-700 dark:hover:bg-blue-600"
              href="/catalogo/nueva"
            >
              Nueva pieza
            </Link>
            <Link
              className="rounded-xl border border-blue-500 bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 dark:border-blue-400 dark:bg-blue-700 dark:hover:bg-blue-600"
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

