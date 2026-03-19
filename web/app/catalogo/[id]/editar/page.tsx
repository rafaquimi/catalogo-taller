import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deletePartImage, updatePart } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditarPiezaPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolved = params ? await params : ({} as { id?: string });
  const id = resolved?.id;
  if (!id) notFound();

  const [part, families, images]: [
    { id: string; description: string; priceCents: number; familyId: string } | null,
    { id: string; name: string }[],
    { id: string; url: string }[],
  ] = await Promise.all([
    prisma.part.findFirst({
      where: { id },
      select: { id: true, description: true, priceCents: true, familyId: true },
    }),
    prisma.family.findMany({ orderBy: { name: "asc" } }),
    prisma.partImage.findMany({
      where: { partId: id },
      orderBy: { createdAt: "asc" },
      select: { id: true, url: true },
    }),
  ]);

  if (!part) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar pieza</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Modifica descripción, familia, precio y añade más imágenes si quieres.
        </p>
      </div>

      <form
        action={updatePart}
        className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950"
      >
        <input type="hidden" name="id" value={part.id} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-2">
            <label className="text-sm font-medium">Descripción</label>
            <textarea
              name="description"
              defaultValue={part.description}
              required
              rows={3}
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-zinc-950"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Familia</label>
            <select
              name="familyId"
              defaultValue={part.familyId}
              required
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-zinc-950"
            >
              {families.map((f: { id: string; name: string }) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Precio (EUR)</label>
            <input
              name="price"
              defaultValue={(part.priceCents / 100).toFixed(2).replace(".", ",")}
              required
              inputMode="decimal"
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-zinc-950"
            />
          </div>

          <div className="sm:col-span-2 space-y-2">
            <label className="text-sm font-medium">Añadir imágenes</label>
            <input
              name="images"
              type="file"
              accept="image/*,.heic,.heif"
              capture="environment"
              multiple
              className="block w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-zinc-950"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Link
            href={`/catalogo/${part.id}`}
            className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          >
            Cancelar
          </Link>
          <button className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-white hover:bg-black/90">
            Guardar cambios
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <h2 className="text-base font-medium">Imágenes actuales</h2>
        {images.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Esta pieza no tiene imágenes todavía.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((img: { id: string; url: string }) => (
              <div
                key={img.id}
                className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10"
              >
                <div className="relative aspect-square w-full bg-zinc-100 dark:bg-zinc-900">
                  <Image
                    src={img.url}
                    alt={`Imagen de ${part.description}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <div className="p-2">
                  <form action={deletePartImage} className="flex justify-end">
                    <input type="hidden" name="partId" value={part.id} />
                    <input type="hidden" name="imageId" value={img.id} />
                    <button
                      type="submit"
                      aria-label="Eliminar imagen"
                      title="Eliminar imagen"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/40 text-sm font-bold leading-none text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
                    >
                      ✕
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

