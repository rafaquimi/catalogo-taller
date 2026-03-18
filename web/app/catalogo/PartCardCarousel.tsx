"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Img = { id: string; url: string };

export default function PartCardCarousel({
  partId,
  familyName,
  description,
  priceCents,
  images,
}: {
  partId: string;
  familyName: string;
  description: string;
  priceCents: number;
  images: Img[];
}) {
  const [index, setIndex] = useState(0);

  const cover = images[index]?.url ?? images[0]?.url ?? null;
  const safeImages = useMemo(() => images ?? [], [images]);

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(cents / 100);

  const prev = () => {
    if (safeImages.length <= 1) return;
    setIndex((i) => (i - 1 + safeImages.length) % safeImages.length);
  };
  const next = () => {
    if (safeImages.length <= 1) return;
    setIndex((i) => (i + 1) % safeImages.length);
  };

  return (
    <Link
      href={`/catalogo/${partId}`}
      className="group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm hover:shadow-md dark:border-white/10 dark:bg-zinc-950"
    >
      <div className="relative">
        <div className="relative aspect-[4/3] w-full bg-zinc-100 dark:bg-zinc-900">
          {cover ? (
            <Image
              src={cover}
              alt={description}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
              Sin imagen
            </div>
          )}
        </div>

        {safeImages.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Imagen anterior"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                prev();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Imagen siguiente"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                next();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
            >
              ›
            </button>

            <div className="pointer-events-none absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2">
              {safeImages.slice(0, 4).map((img, i) => {
                const active = index === i;
                return (
                  <span
                    // eslint-disable-next-line react/no-array-index-key
                    key={img.id}
                    className={`h-1.5 w-6 rounded-full ${
                      active ? "bg-white" : "bg-white/40"
                    }`}
                  />
                );
              })}
            </div>
          </>
        ) : null}
      </div>

      <div className="space-y-1 p-4">
        <div className="text-xs text-zinc-500">{familyName}</div>
        <div className="text-sm font-medium">{description}</div>
        <div className="text-sm">{formatPrice(priceCents)}</div>
      </div>
    </Link>
  );
}

