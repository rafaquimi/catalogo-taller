"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function SearchInput({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue ?? "");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(defaultValue ?? "");
  }, [defaultValue]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value;
    setValue(text);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (text.trim()) {
        params.set("q", text.trim());
      } else {
        params.delete("q");
      }
      router.push(`${pathname}?${params.toString()}`);
    }, 350);
  }

  function handleClear() {
    setValue("");
    if (timerRef.current) clearTimeout(timerRef.current);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="relative w-full lg:max-w-md">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Buscar por nombre..."
        className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 pr-8 text-sm outline-none focus:ring-2 focus:ring-blue-400 dark:border-blue-700 dark:bg-zinc-950"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
        >
          ✕
        </button>
      )}
    </div>
  );
}
