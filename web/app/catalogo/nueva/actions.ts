"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import crypto from "crypto";

const createPartSchema = z.object({
  description: z.string().min(1),
  familyId: z.string().min(1),
  price: z
    .string()
    .min(1)
    .transform((v) => v.replace(",", "."))
    .pipe(z.coerce.number().nonnegative()),
});

function extFromName(name: string) {
  const ext = path.extname(name).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg" || ext === ".png" || ext === ".webp")
    return ext;
  return ".jpg";
}

export async function createPart(formData: FormData) {
  const raw = {
    description: String(formData.get("description") ?? ""),
    familyId: String(formData.get("familyId") ?? ""),
    price: String(formData.get("price") ?? ""),
  };

  const parsed = createPartSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Datos inválidos." };

  const files = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);

  const priceCents = Math.round(parsed.data.price * 100);

  const part = await prisma.part.create({
    data: {
      description: parsed.data.description,
      familyId: parsed.data.familyId,
      priceCents,
    },
  });

  if (files.length > 0) {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const imagesData: { url: string; partId: string }[] = [];
    for (const file of files) {
      const buf = Buffer.from(await file.arrayBuffer());
      const filename = `${crypto.randomUUID()}${extFromName(file.name)}`;
      const diskPath = path.join(uploadDir, filename);
      await writeFile(diskPath, buf);
      imagesData.push({ url: `/uploads/${filename}`, partId: part.id });
    }

    await prisma.partImage.createMany({ data: imagesData });
  }

  revalidatePath("/catalogo");
  redirect(`/catalogo/${part.id}`);
}

