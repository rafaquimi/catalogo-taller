"use client";

export default function FamiliaSelect({
  families,
  selected,
  q,
}: {
  families: { id: string; name: string }[];
  selected?: string;
  q?: string;
}) {
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const familiaId = e.target.value;
    const params = new URLSearchParams();
    if (familiaId) params.set("familia", familiaId);
    if (q) params.set("q", q);
    const qs = params.toString();
    window.location.href = `/catalogo${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="min-w-52">
      <label className="sr-only" htmlFor="familia-select">
        Filtrar por familia
      </label>
      <select
        id="familia-select"
        name="familia"
        value={selected ?? ""}
        onChange={handleChange}
        className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 dark:border-blue-700 dark:bg-zinc-950"
      >
        <option value="">Todas las familias</option>
        {families.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
    </div>
  );
}
