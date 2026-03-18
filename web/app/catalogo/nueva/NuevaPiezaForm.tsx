"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPart } from "./actions";

type Family = { id: string; name: string };

export default function NuevaPiezaForm({ families }: { families: Family[] }) {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [familyId, setFamilyId] = useState(families[0]?.id ?? "");
  const [price, setPrice] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const list = Array.from(incoming);
    if (list.length === 0) return;
    setFiles((prev) => [...prev, ...list]);
  };

  const canSubmit = useMemo(() => {
    return description.trim().length > 0 && familyId.trim().length > 0 && price.trim().length > 0;
  }, [description, familyId, price]);

  return (
    <form
      className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        if (!canSubmit) {
          setError("Revisa los campos.");
          return;
        }
        if (files.length === 0) {
          setError("Añade al menos una imagen.");
          return;
        }

        startTransition(async () => {
          try {
            const fd = new FormData();
            fd.set("description", description);
            fd.set("familyId", familyId);
            fd.set("price", price);
            for (const f of files) fd.append("images", f);

            await createPart(fd);
            router.push("/catalogo");
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Error guardando la pieza.");
          }
        });
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-2">
          <label className="text-sm font-medium">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-zinc-950"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Familia</label>
          <select
            value={familyId}
            onChange={(e) => setFamilyId(e.target.value)}
            required
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-zinc-950"
          >
            {families.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Precio (EUR)</label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            inputMode="decimal"
            placeholder="Ej: 12,50"
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-zinc-950"
          />
        </div>

        <div className="sm:col-span-2 space-y-2">
          <label className="text-sm font-medium">Imágenes</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                if (cameraInputRef.current) cameraInputRef.current.value = "";
                cameraInputRef.current?.click();
              }}
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90"
            >
              Cámara
            </button>
            <button
              type="button"
              onClick={() => {
                if (galleryInputRef.current) galleryInputRef.current.value = "";
                galleryInputRef.current?.click();
              }}
              className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Galería
            </button>
            <button
              type="button"
              onClick={() => setFiles([])}
              className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
              disabled={files.length === 0}
            >
              Limpiar
            </button>
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            capture="environment"
            multiple
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files);
              // En iOS, si no limpias el value, futuras capturas pueden "sustituir" la selección.
              e.currentTarget.value = "";
            }}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            multiple
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files);
              e.currentTarget.value = "";
            }}
          />

          <div className="text-xs text-zinc-500">
            Añadidas: {files.length}. Puedes añadir más fotos antes de guardar.
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/catalogo")}
          className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-950 dark:hover:bg-zinc-900"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!canSubmit || files.length === 0 || isPending}
          className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-60"
        >
          {isPending ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}

