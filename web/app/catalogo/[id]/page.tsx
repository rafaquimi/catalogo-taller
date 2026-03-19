import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deletePart } from "./actions";

export const dynamic = "force-dynamic";

function formatPrice(priceCents: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(priceCents / 100);
}

export default async function PiezaDetallePage({
  params,
}: {
  // En algunas compilaciones Next puede entregarlo como Promise.
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = params ? await params : ({} as { id?: string });
  const id = resolvedParams?.id;
  if (!id) {
    return (
      <div className="space-y-4 rounded-2xl border border-black/10 bg-white p-6 text-sm text-zinc-700 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-300">
        Falta el parámetro `id`. <a href="/catalogo" className="underline">Volver</a>.
      </div>
    );
  }

  const part = await prisma.part.findFirst({
    where: { id },
    include: { family: true, images: { orderBy: { createdAt: "asc" } } },
  });

  if (!part) {
    return (
      <div className="space-y-4 rounded-2xl border border-black/10 bg-white p-6 text-sm text-zinc-700 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-300">
        No se encontró la pieza con id <span className="font-mono">{id}</span>.
        <div>
          <a href="/catalogo" className="underline">Volver al catálogo</a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-base font-semibold text-blue-600 dark:text-blue-400">{part.family.name}</div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
            {part.description}
          </h1>
          <div className="text-xl font-bold text-red-600 dark:text-red-400">{formatPrice(part.priceCents)}</div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/catalogo/${part.id}/editar`}
            className="rounded-xl border border-blue-300 bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-500 dark:border-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            Editar
          </Link>
          <form action={deletePart}>
            <input type="hidden" name="id" value={part.id} />
            <button
              type="submit"
              aria-label="Eliminar pieza"
              title="Eliminar pieza"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/40 text-lg font-bold leading-none text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
            >
              ✕
            </button>
          </form>
          <Link
            href="/catalogo"
            className="rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:bg-zinc-950 dark:text-blue-300 dark:hover:bg-zinc-900"
          >
            Volver
          </Link>
        </div>
      </div>

      {part.images.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-zinc-600 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-400">
          Esta pieza no tiene imágenes todavía.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {part.images.map((img: { id: string; url: string }) => (
            <a
              key={img.id}
              href={img.url}
              target="_blank"
              rel="noreferrer"
              className="group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm hover:shadow-md dark:border-white/10 dark:bg-zinc-950"
            >
              <div className="relative aspect-[4/3] w-full bg-zinc-100 dark:bg-zinc-900">
                <Image
                  src={img.url}
                  alt={part.description}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width: 1024px) 50vw, 33vw"
                />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

