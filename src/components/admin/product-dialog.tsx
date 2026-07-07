"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Star, Upload, Video, X } from "lucide-react";
import { toast } from "sonner";

import {
  createProduct,
  updateProduct,
  uploadProductImage,
} from "@/app/(admin)/admin/products/actions";
import { createClient } from "@/lib/supabase/client";
import { productSchema, type ProductInput } from "@/lib/validations/product";
import type { schema } from "@/lib/db";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Product = typeof schema.products.$inferSelect;

const MAX_IMAGES = 8;

const VIDEO_BUCKET = "product-videos";
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

type FormState = {
  name: string;
  description: string;
  priceCents: string;
  stockQty: string;
  category: string;
  images: string[];
  videoUrl: string | null;
  isPublished: boolean;
};

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  priceCents: "",
  stockQty: "1",
  category: "",
  images: [],
  videoUrl: null,
  isPublished: false,
};

function toFormState(product?: Product): FormState {
  if (!product) return EMPTY_FORM;
  return {
    name: product.name,
    description: product.description,
    priceCents: String(product.priceCents),
    stockQty: String(product.stockQty),
    category: product.category ?? "",
    images: product.images,
    videoUrl: product.videoUrl ?? null,
    isPublished: product.isPublished,
  };
}

export function ProductDialog({
  open,
  onOpenChange,
  mode,
  product,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  product?: Product;
}) {
  // The parent gives this component a fresh `key` each time it opens (see
  // ProductsTable), so lazy initial state is enough — no reset effect needed.
  const [form, setForm] = useState<FormState>(() => toFormState(product));
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProductInput, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadProductImage(formData);
    setUploading(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setForm((prev) => ({ ...prev, images: [...prev.images, result.url] }));
  }

  function removeImage(index: number) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }

  function makePrimary(index: number) {
    setForm((prev) => {
      const images = [...prev.images];
      const [image] = images.splice(index, 1);
      images.unshift(image);
      return { ...prev, images };
    });
  }

  async function handleVideoSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      toast.error("Only MP4, WebM, or MOV video files are allowed.");
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      toast.error("Video must be smaller than 50MB.");
      return;
    }

    setUploadingVideo(true);

    // Videos can easily exceed Vercel's 4.5MB serverless function body limit,
    // so this uploads directly from the browser to Supabase Storage instead
    // of going through a server action. The `product-videos` bucket has an
    // RLS policy that only allows inserts from admin users (see
    // require-admin.ts for the same role check).
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "mp4";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from(VIDEO_BUCKET)
      .upload(path, file, { contentType: file.type });

    setUploadingVideo(false);

    if (error) {
      toast.error("Failed to upload video.");
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(VIDEO_BUCKET).getPublicUrl(path);
    setForm((prev) => ({ ...prev, videoUrl: publicUrl }));
  }

  function removeVideo() {
    setForm((prev) => ({ ...prev, videoUrl: null }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const candidate = {
      name: form.name,
      description: form.description,
      priceCents: Number(form.priceCents),
      stockQty: Number(form.stockQty),
      category: form.category || null,
      images: form.images,
      videoUrl: form.videoUrl,
      isPublished: form.isPublished,
    };

    const parsed = productSchema.safeParse(candidate);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof ProductInput, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof ProductInput;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    const result =
      mode === "edit" && product
        ? await updateProduct(product.id, parsed.data)
        : await createProduct(parsed.data);

    setSubmitting(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit product" : "Add product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="priceCents">Price (cents)</Label>
              <Input
                id="priceCents"
                type="number"
                min={1}
                value={form.priceCents}
                onChange={(e) => updateField("priceCents", e.target.value)}
                aria-invalid={!!errors.priceCents}
              />
              {errors.priceCents && (
                <p className="text-xs text-destructive">{errors.priceCents}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="stockQty">Stock</Label>
              <Input
                id="stockQty"
                type="number"
                min={0}
                value={form.stockQty}
                onChange={(e) => updateField("stockQty", e.target.value)}
                aria-invalid={!!errors.stockQty}
              />
              {errors.stockQty && (
                <p className="text-xs text-destructive">{errors.stockQty}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Images</Label>
            <div className="grid grid-cols-4 gap-2">
              {form.images.map((src, index) => (
                <div
                  key={src}
                  className="group relative aspect-square overflow-hidden rounded-md border"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                  {index === 0 ? (
                    <span className="absolute bottom-1 left-1 rounded-sm bg-background/80 px-1 text-[10px] leading-tight">
                      Primary
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => makePrimary(index)}
                      aria-label="Make primary image"
                      className="absolute bottom-1 left-1 hidden rounded-sm bg-background/80 p-0.5 group-hover:block"
                    >
                      <Star className="size-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    aria-label="Remove image"
                    className="absolute top-1 right-1 rounded-full bg-background/80 p-0.5"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              {form.images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className={cn(
                    "flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed text-muted-foreground hover:text-foreground disabled:opacity-50"
                  )}
                >
                  <Upload className="size-4" />
                  <span className="text-[10px]">
                    {uploading ? "Uploading…" : "Add"}
                  </span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelected}
              className="hidden"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Video</Label>
            {form.videoUrl ? (
              <div className="group relative aspect-video overflow-hidden rounded-md border">
                <video
                  src={form.videoUrl}
                  controls
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeVideo}
                  aria-label="Remove video"
                  className="absolute top-1 right-1 rounded-full bg-background/80 p-0.5"
                >
                  <X className="size-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                disabled={uploadingVideo}
                className="flex aspect-video w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <Video className="size-4" />
                <span className="text-[10px]">
                  {uploadingVideo ? "Uploading…" : "Add video (MP4/WebM/MOV, max 50MB)"}
                </span>
              </button>
            )}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleVideoSelected}
              className="hidden"
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={submitting || uploading || uploadingVideo}
            >
              {submitting ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
