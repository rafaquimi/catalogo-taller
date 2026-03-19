import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import PartCardCarousel from "./PartCardCarousel";
import FamiliaSelect from "./FamiliaSelect";
import SearchInput from "./SearchInput";

export const dynamic = "force-dynamic";

function getSingleParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0]?.trim() || undefined;
  return value?.trim() || undefined;
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams:
    | Promise<{ familia?: string | string[]; q?: string | string[] }>
    | { familia?: string | string[]; q?: string | string[] };
}) {
  const resolvedSearchParams = searchParams
    ? await searchParams
    : ({} as { familia?: string | string[]; q?: string | string[] });
  const familia = getSingleParam(resolvedSearchParams?.familia);
  const q = getSingleParam(resolvedSearchParams?.q);

  const families = await prisma.family.findMany({
    orderBy: { name: "asc" },
  });

  const parts = await prisma.part.findMany({
    where: {
      ...(familia ? { familyId: familia } : {}),
      ...(q
        ? {
            description: {
              contains: q,
              mode: "insensitive",
            },
          }
        : {}),
    },
    include: { family: true, images: { orderBy: { createdAt: "asc" } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Piezas</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Filtra por familia y abre cada pieza para ver sus fotos.
          </p>
        </div>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <Suspense fallback={
            <div className="h-9 w-full max-w-md animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
          }>
            <SearchInput defaultValue={q} />
          </Suspense>
          <div className="flex flex-wrap items-center gap-2">
            <FamiliaSelect families={families} selected={familia} q={q} />
            {(familia || q) && (
              <Link
                href="/catalogo"
                className="rounded-full border border-blue-300 bg-white px-3 py-1.5 text-xs text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:bg-zinc-950 dark:text-blue-300 dark:hover:bg-zinc-900"
              >
                Limpiar filtros
              </Link>
            )}
          </div>
        </div>
      </div>

      {parts.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-zinc-600 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-400">
          No hay piezas todavía.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {parts.map((p: {
            id: string;
            description: string;
            priceCents: number;
            family: { name: string };
            images: { id: string; url: string }[];
          }) => {
            return (
              <PartCardCarousel
                key={p.id}
                partId={p.id}
                familyName={p.family.name}
                description={p.description}
                priceCents={p.priceCents}
                images={p.images}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

