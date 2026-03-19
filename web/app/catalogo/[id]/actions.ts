"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";
import path from "path";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const updatePartSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  familyId: z.string().min(1),
  price: z
    .string()
    .min(1)
    .transform((v) => Number(v.replace(",", ".")))
    .refine((n) => Number.isFinite(n) && n >= 0, "Precio inválido"),
});

function buildCompressedWebp(input: Buffer) {
  return sharp(input)
    .rotate()
    .resize({
      width: 1600,
      height: 1600,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 });
}

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Falta configuración de Supabase.");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function updatePart(formData: FormData) {
  const raw = {
    id: String(formData.get("id") ?? ""),
    description: String(formData.get("description") ?? ""),
    familyId: String(formData.get("familyId") ?? ""),
    price: String(formData.get("price") ?? ""),
  };
  const parsed = updatePartSchema.safeParse(raw);
  if (!parsed.success) throw new Error("Datos inválidos.");

  const files = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);

  const id = parsed.data.id;

  await prisma.part.update({
    where: { id },
    data: {
      description: parsed.data.description,
      familyId: parsed.data.familyId,
      priceCents: Math.round(parsed.data.price * 100),
    },
  });

  if (files.length > 0) {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "catalogo";
    const supabase = getSupabaseAdmin();

    const imagesData: { url: string; partId: string }[] = [];
    for (const file of files) {
      const buf = Buffer.from(await file.arrayBuffer());
      let payload: Uint8Array = buf;
      try {
        payload = await buildCompressedWebp(buf).toBuffer();
      } catch {
        payload = buf;
      }

      const filename = `${crypto.randomUUID()}.webp`;
      const objectPath = `parts/${id}/${filename}`;
      const up = await supabase.storage.from(bucket).upload(objectPath, payload, {
        contentType: "image/webp",
        upsert: false,
      });
      if (up.error) throw new Error(up.error.message);
      const pub = supabase.storage.from(bucket).getPublicUrl(objectPath);
      imagesData.push({ url: pub.data.publicUrl, partId: id });
    }

    await prisma.partImage.createMany({ data: imagesData });
  }

  revalidatePath("/catalogo");
  revalidatePath(`/catalogo/${id}`);
  redirect(`/catalogo/${id}`);
}

export async function deletePart(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.part.delete({ where: { id } });
  revalidatePath("/catalogo");
  redirect("/catalogo");
}

