"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { productSchema, type ProductInput } from "@/lib/validations/product";
import { requireAdminUser } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

type ActionResult = { error: string } | { success: true };

const PRODUCT_IMAGES_BUCKET = "product-images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function uploadProductImage(
  formData: FormData
): Promise<{ url: string } | { error: string }> {
  await requireAdminUser();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "No file provided." };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "Only image files are allowed." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: "Image must be smaller than 5MB." };
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file, { contentType: file.type });

  if (error) {
    return { error: "Failed to upload image." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);

  return { url: publicUrl };
}

function slugify(name: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "product";
}

function revalidateProductPaths() {
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidatePath("/products");
  revalidatePath("/");
}

export async function createProduct(input: ProductInput): Promise<ActionResult> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const admin = await requireAdminUser();
  const db = getDb();

  let product;
  try {
    [product] = await db
      .insert(schema.products)
      .values({ ...parsed.data, slug: slugify(parsed.data.name) })
      .returning();
  } catch {
    return { error: "A product with a similar name already exists." };
  }

  await db.insert(schema.adminAuditLog).values({
    adminUserId: admin.id,
    action: "product.create",
    targetType: "product",
    targetId: product.id,
    metadata: { name: product.name },
  });

  revalidateProductPaths();
  return { success: true };
}

export async function updateProduct(
  id: string,
  input: ProductInput
): Promise<ActionResult> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const admin = await requireAdminUser();
  const db = getDb();

  // Slug is intentionally left untouched on edit so existing product URLs
  // (cart, orders, shared links) don't break when an admin tweaks the name.
  await db
    .update(schema.products)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(schema.products.id, id));

  await db.insert(schema.adminAuditLog).values({
    adminUserId: admin.id,
    action: "product.update",
    targetType: "product",
    targetId: id,
    metadata: { name: parsed.data.name },
  });

  revalidateProductPaths();
  return { success: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const admin = await requireAdminUser();
  const db = getDb();

  try {
    await db.delete(schema.products).where(eq(schema.products.id, id));
  } catch {
    return {
      error:
        "This product can't be deleted because it has existing orders. Unpublish it instead.",
    };
  }

  await db.insert(schema.adminAuditLog).values({
    adminUserId: admin.id,
    action: "product.delete",
    targetType: "product",
    targetId: id,
  });

  revalidateProductPaths();
  return { success: true };
}

export async function toggleProductPublished(
  id: string,
  isPublished: boolean
): Promise<ActionResult> {
  const admin = await requireAdminUser();
  const db = getDb();

  await db
    .update(schema.products)
    .set({ isPublished, updatedAt: new Date() })
    .where(eq(schema.products.id, id));

  await db.insert(schema.adminAuditLog).values({
    adminUserId: admin.id,
    action: isPublished ? "product.publish" : "product.unpublish",
    targetType: "product",
    targetId: id,
  });

  revalidateProductPaths();
  return { success: true };
}
