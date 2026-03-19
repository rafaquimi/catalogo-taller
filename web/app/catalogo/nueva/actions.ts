"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import path from "path";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const createPartSchema = z.object({
  description: z.string().min(1),
  familyId: z.string().min(1),
  price: z
    .string()
    .min(1)
    .transform((v) => Number(v.replace(",", ".")))
    .refine((n) => Number.isFinite(n) && n >= 0, "Precio inválido"),
});

function buildCompressedWebp(input: Buffer) {
  // Foto de móvil: recortar a un tamaño razonable para catálogo
  // Mantiene buena calidad pero reduce mucho el peso.
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
  if (!url || !key) {
    throw new Error("Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function createPart(formData: FormData) {
  const raw = {
    description: String(formData.get("description") ?? ""),
    familyId: String(formData.get("familyId") ?? ""),
    price: String(formData.get("price") ?? ""),
  };

  const parsed = createPartSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Datos inválidos.");
  }

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
    const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "catalogo";
    const supabase = getSupabaseAdmin();

    const imagesData: { url: string; partId: string }[] = [];
    for (const file of files) {
      const buf = Buffer.from(await file.arrayBuffer());
      const filename = `${crypto.randomUUID()}.webp`;
      const objectPath = `parts/${part.id}/${filename}`;

      // Comprimimos en el servidor para que iPhone (cámara) no suba ficheros enormes.
      // Si algo falla (imagen no compatible), caemos al original.
      let payload: Uint8Array = buf;
      try {
        payload = await buildCompressedWebp(buf).toBuffer();
      } catch {
        payload = buf;
      }

      const up = await supabase.storage
        .from(bucket)
        .upload(objectPath, payload, {
          contentType: "image/webp",
          upsert: false,
        });

      if (up.error) {
        throw new Error(`Error subiendo imagen: ${up.error.message}`);
      }

      const pub = supabase.storage.from(bucket).getPublicUrl(objectPath);
      const publicUrl = pub.data.publicUrl;
      imagesData.push({ url: publicUrl, partId: part.id });
    }

    await prisma.partImage.createMany({ data: imagesData });
  }

  revalidatePath("/catalogo");
  return { ok: true, partId: part.id };
}

