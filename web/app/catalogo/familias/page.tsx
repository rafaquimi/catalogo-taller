import { prisma } from "@/lib/prisma";
import { createFamily } from "./actions";

export const dynamic = "force-dynamic";

export default async function FamiliasPage() {
  const families = await prisma.family.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { parts: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Familias</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Crea familias para clasificar tus piezas.
        </p>
      </div>

      <form
        action={createFamily}
        className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Nueva familia</label>
            <input
              name="name"
              required
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-zinc-950"
              placeholder="Ej: Herrajes"
            />
          </div>
          <button className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-white hover:bg-black/90">
            Guardar
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950">
        <div className="grid grid-cols-3 gap-0 border-b border-black/10 px-4 py-3 text-xs font-medium text-zinc-500 dark:border-white/10">
          <div>Familia</div>
          <div className="text-center">Piezas</div>
          <div className="text-right">ID</div>
        </div>
        {families.length === 0 ? (
          <div className="px-4 py-6 text-sm text-zinc-600 dark:text-zinc-400">
            No hay familias todavía.
          </div>
        ) : (
          families.map(
            (f: { id: string; name: string; _count: { parts: number } }) => (
            <div
              key={f.id}
              className="grid grid-cols-3 items-center gap-0 border-b border-black/5 px-4 py-3 text-sm last:border-b-0 dark:border-white/5"
            >
              <div className="font-medium">{f.name}</div>
              <div className="text-center text-zinc-600 dark:text-zinc-400">
                {f._count.parts}
              </div>
              <div className="text-right font-mono text-xs text-zinc-500">
                {f.id}
              </div>
            </div>
          ),
          )
        )}
      </div>
    </div>
  );
}

