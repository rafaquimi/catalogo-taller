"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const familySchema = z.object({
  name: z.string().min(1),
});

export async function createFamily(formData: FormData) {
  const raw = { name: String(formData.get("name") ?? "").trim() };
  const parsed = familySchema.safeParse(raw);
  if (!parsed.success) return;

  await prisma.family.upsert({
    where: { name: parsed.data.name },
    update: {},
    create: { name: parsed.data.name },
  });

  revalidatePath("/catalogo/familias");
  revalidatePath("/catalogo/nueva");
  revalidatePath("/catalogo");
}

export async function updateFamily(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const raw = { name: String(formData.get("name") ?? "").trim() };
  const parsed = familySchema.safeParse(raw);
  if (!id || !parsed.success) return;

  await prisma.family.update({
    where: { id },
    data: { name: parsed.data.name },
  });

  revalidatePath("/catalogo/familias");
  revalidatePath("/catalogo/nueva");
  revalidatePath("/catalogo");
}

export async function deleteFamily(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const count = await prisma.part.count({ where: { familyId: id } });
  if (count > 0) {
    throw new Error("No se puede eliminar una familia con piezas asociadas.");
  }

  await prisma.family.delete({ where: { id } });

  revalidatePath("/catalogo/familias");
  revalidatePath("/catalogo/nueva");
  revalidatePath("/catalogo");
}

