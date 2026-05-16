"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Select from "@/components/ui/Select";
import {
  formatGalleryPrice,
  GALLERY_AVAILABILITY,
  type GalleryPackageDto,
} from "@/lib/gallery";

type Category = { name: string };

const emptyForm = {
  title: "",
  category: "",
  description: "",
  price: "",
  guest_pricing_enabled: false,
  require_guest_count: false,
  base_guest_capacity: "",
  extra_guest_cost: "",
  availability_status: "Available",
  is_popular: false,
  is_trending: false,
  inclusionsText: "",
  sort_order: "0",
};

const inputClass =
  "w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#015961]/30";
const inputStyle = {
  border: "1px solid #EDE5D8",
  color: "#222",
  backgroundColor: "white",
} as const;
const labelClass = "block text-xs font-semibold tracking-widest uppercase mb-1.5";
const labelStyle = { color: "#555" } as const;
const fileInputClass =
  "block w-full rounded-lg border border-[#EDE5D8] bg-[#F9F4EE] px-3 py-3 text-sm text-[#333] file:mr-4 file:rounded-lg file:border-0 file:bg-[#015961] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#FCCD97] hover:file:bg-[#012D32] cursor-pointer";

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryPackageDto[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [coverPath, setCoverPath] = useState("");
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [extraPaths, setExtraPaths] = useState<string[]>([]);
  const [extraPreviews, setExtraPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  async function load() {
    const [imgs, cats] = await Promise.all([
      fetch("/api/gallery").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]);
    setItems(Array.isArray(imgs) ? imgs : []);
    setCategories(Array.isArray(cats) ? cats : []);
  }

  useEffect(() => {
    load();
  }, []);

  function openAdd() {
    setEditId(null);
    setForm(emptyForm);
    setCoverFile(null);
    setCoverPreview("");
    setCoverPath("");
    setExtraFiles([]);
    setExtraPaths([]);
    setExtraPreviews([]);
    setModal("add");
  }

  function openEdit(item: GalleryPackageDto) {
    setEditId(item.id);
    setForm({
      title: item.title || "",
      category: item.category || "",
      description: item.description || "",
      price: item.price || "",
      guest_pricing_enabled: item.guest_pricing_enabled,
      require_guest_count: item.require_guest_count,
      base_guest_capacity:
        item.base_guest_capacity != null ? String(item.base_guest_capacity) : "",
      extra_guest_cost: item.extra_guest_cost || "",
      availability_status: item.availability_status,
      is_popular: item.is_popular,
      is_trending: item.is_trending,
      inclusionsText: item.inclusions.join("\n"),
      sort_order: String(item.sort_order),
    });
    setCoverFile(null);
    setCoverPreview("");
    setCoverPath(item.image_path);
    setExtraFiles([]);
    setExtraPaths(item.images.map((i) => i.image_path));
    setExtraPreviews([]);
    setModal("edit");
  }

  function closeModal() {
    setModal(null);
    setEditId(null);
  }

  async function uploadFile(file: File, folder = "gallery") {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.path as string;
  }

  async function handleSave() {
    const imagePath = coverPath || (coverFile ? await uploadFile(coverFile) : "");
    if (!imagePath) {
      alert("Please add a cover image.");
      return;
    }

    setSaving(true);
    try {
      let uploadedExtras = [...extraPaths];
      for (const f of extraFiles) {
        uploadedExtras.push(await uploadFile(f));
      }

      const payload = {
        title: form.title,
        category: form.category,
        description: form.description,
        price: form.price,
        guest_pricing_enabled: form.guest_pricing_enabled,
        require_guest_count: form.require_guest_count,
        base_guest_capacity: form.guest_pricing_enabled
          ? Number(form.base_guest_capacity) || null
          : null,
        extra_guest_cost: form.guest_pricing_enabled ? form.extra_guest_cost : null,
        availability_status: form.availability_status,
        is_popular: form.is_popular,
        is_trending: form.is_trending,
        inclusions: form.inclusionsText.split("\n").map((l) => l.trim()).filter(Boolean),
        sort_order: Number(form.sort_order) || 0,
        image_path: imagePath,
        extra_images: uploadedExtras,
      };

      const res =
        modal === "edit" && editId
          ? await fetch(`/api/gallery/${editId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch("/api/gallery", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Save failed");
      }

      closeModal();
      load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    await fetch(`/api/gallery/${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    load();
  }

  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-bold"
            style={{ color: "#012D32", fontFamily: "var(--font-cormorant), serif" }}
          >
            Gallery packages
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: "#888" }}>
            {items.length} bookable setup{items.length !== 1 ? "s" : ""} — shown on the public gallery with pricing
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="px-5 py-3 rounded-lg text-xs sm:text-sm font-semibold tracking-wider transition-all hover:scale-105 self-start sm:self-auto"
          style={{ backgroundColor: "#015961", color: "#FCCD97", minHeight: 44 }}
        >
          + ADD PACKAGE
        </button>
      </div>

      {items.length === 0 ? (
        <div
          className="text-center py-14 sm:py-20 rounded-2xl px-4"
          style={{ backgroundColor: "white", border: "2px dashed #EDE5D8" }}
        >
          <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 opacity-20" style={{ color: "#015961" }}>
            ◇
          </div>
          <h3
            className="text-xl sm:text-2xl font-bold mb-2"
            style={{ color: "#012D32", fontFamily: "var(--font-cormorant), serif" }}
          >
            No packages yet
          </h3>
          <p className="text-sm mb-5" style={{ color: "#888" }}>
            Add event setups with images, price, and description for customers to book.
          </p>
          <button
            type="button"
            onClick={openAdd}
            className="px-6 py-3 rounded-lg text-sm font-semibold tracking-wider"
            style={{ backgroundColor: "#015961", color: "#FCCD97", minHeight: 44 }}
          >
            + ADD PACKAGE
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: "white", border: "1px solid #EDE5D8" }}
            >
              <div className="aspect-[4/3] relative">
                <Image
                  src={item.image_path}
                  alt={item.title || "Package"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                {(item.is_popular || item.is_trending) && (
                  <div className="absolute top-2 left-2 flex gap-1">
                    {item.is_popular && (
                      <span
                        className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded"
                        style={{ backgroundColor: "#FCCD97", color: "#012D32" }}
                      >
                        Popular
                      </span>
                    )}
                    {item.is_trending && (
                      <span
                        className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded"
                        style={{ backgroundColor: "#015961", color: "#FCCD97" }}
                      >
                        Trending
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3
                  className="font-bold text-lg mb-1 truncate"
                  style={{ color: "#012D32", fontFamily: "var(--font-cormorant), serif" }}
                >
                  {item.title || "Untitled"}
                </h3>
                <p className="text-xs mb-1" style={{ color: "#888" }}>
                  {item.category || "No category"} · {item.availability_status}
                </p>
                {item.price && (
                  <p className="text-sm font-semibold mb-3" style={{ color: "#015961" }}>
                    {formatGalleryPrice(item.price)}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold tracking-wide"
                    style={{ border: "1px solid #EDE5D8", color: "#015961" }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(item.id)}
                    className="px-3 py-2 rounded-lg text-xs font-semibold"
                    style={{ backgroundColor: "#fde8e8", color: "#c1121f" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={closeModal}
          data-lenis-prevent
        >
          <div
            className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden admin-form-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b sticky top-0 bg-white z-10" style={{ borderColor: "#EDE5D8" }}>
              <div className="flex items-center justify-between">
                <h2
                  className="text-xl font-bold"
                  style={{ color: "#012D32", fontFamily: "var(--font-cormorant), serif" }}
                >
                  {modal === "add" ? "Add gallery package" : "Edit gallery package"}
                </h2>
                <button type="button" onClick={closeModal} className="text-2xl text-gray-400 leading-none">
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              <div>
                <label className={labelClass} style={labelStyle}>
                  Event title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className={inputClass}
                  style={inputStyle}
                  placeholder="e.g. Royal wedding mandap setup"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
                <div className="min-w-0">
                  <Select
                    label="Category"
                    labelClassName={labelClass}
                    labelStyle={labelStyle}
                    value={form.category}
                    onChange={(category) => setForm((f) => ({ ...f, category }))}
                    placeholder="Select category"
                    options={categories.map((c) => ({ value: c.name, label: c.name }))}
                  />
                </div>
                <div className="min-w-0">
                  <label className={labelClass} style={labelStyle}>
                    Price
                  </label>
                  <input
                    type="text"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className={inputClass}
                    style={inputStyle}
                    placeholder="e.g. 1200 or £1,200"
                  />
                </div>
              </div>

              <div
                className="rounded-xl p-4 space-y-4"
                style={{ border: "1px solid #EDE5D8", backgroundColor: "#F9F4EE" }}
              >
                <p
                  className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: "#555" }}
                >
                  Pricing &amp; capacity
                </p>
                <label className="flex items-center gap-2 text-sm" style={{ color: "#555" }}>
                  <input
                    type="checkbox"
                    checked={form.guest_pricing_enabled}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, guest_pricing_enabled: e.target.checked }))
                    }
                  />
                  Guest capacity based pricing
                </label>
                {form.guest_pricing_enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass} style={labelStyle}>
                        Base guest capacity
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={form.base_guest_capacity}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, base_guest_capacity: e.target.value }))
                        }
                        className={inputClass}
                        style={inputStyle}
                        placeholder="e.g. 100"
                      />
                    </div>
                    <div>
                      <label className={labelClass} style={labelStyle}>
                        Extra guest cost (£)
                      </label>
                      <input
                        type="text"
                        value={form.extra_guest_cost}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, extra_guest_cost: e.target.value }))
                        }
                        className={inputClass}
                        style={inputStyle}
                        placeholder="e.g. 20"
                      />
                    </div>
                  </div>
                )}
                <label className="flex items-center gap-2 text-sm" style={{ color: "#555" }}>
                  <input
                    type="checkbox"
                    checked={form.require_guest_count}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, require_guest_count: e.target.checked }))
                    }
                  />
                  Require guest count on booking form
                </label>
              </div>

              <div>
                <label className={labelClass} style={labelStyle}>
                  Short description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className={`${inputClass} resize-none`}
                  style={inputStyle}
                  placeholder="Describe the setup, theme, and what's included visually..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
                <div className="min-w-0">
                  <Select
                    label="Availability"
                    labelClassName={labelClass}
                    labelStyle={labelStyle}
                    value={form.availability_status}
                    onChange={(availability_status) =>
                      setForm((f) => ({ ...f, availability_status }))
                    }
                    options={GALLERY_AVAILABILITY.map((s) => ({ value: s, label: s }))}
                  />
                </div>
                <div className="min-w-0">
                  <label className={labelClass} style={labelStyle}>
                    Sort order
                  </label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm" style={{ color: "#555" }}>
                  <input
                    type="checkbox"
                    checked={form.is_popular}
                    onChange={(e) => setForm((f) => ({ ...f, is_popular: e.target.checked }))}
                  />
                  Mark as Popular
                </label>
                <label className="flex items-center gap-2 text-sm" style={{ color: "#555" }}>
                  <input
                    type="checkbox"
                    checked={form.is_trending}
                    onChange={(e) => setForm((f) => ({ ...f, is_trending: e.target.checked }))}
                  />
                  Mark as Trending
                </label>
              </div>

              <div>
                <label className={labelClass} style={labelStyle}>
                  Package inclusions (one per line)
                </label>
                <textarea
                  rows={4}
                  value={form.inclusionsText}
                  onChange={(e) => setForm((f) => ({ ...f, inclusionsText: e.target.value }))}
                  className={`${inputClass} resize-none`}
                  style={inputStyle}
                  placeholder={"Floral backdrop\nLED lighting\nTable centrepieces"}
                />
              </div>

              <div>
                <label className={labelClass} style={labelStyle}>
                  Cover image *
                </label>
                {(coverPreview || coverPath) && (
                  <div className="h-40 rounded-lg overflow-hidden mb-2 relative">
                    <Image
                      src={coverPreview || coverPath}
                      alt="Cover"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setCoverFile(f);
                    setCoverPreview(URL.createObjectURL(f));
                    setCoverPath("");
                  }}
                  className={fileInputClass}
                />
                <p className="text-xs mt-1.5" style={{ color: "#888" }}>
                  JPG, PNG or WebP · max 5MB
                </p>
              </div>

              <div>
                <label className={labelClass} style={labelStyle}>
                  Additional images
                </label>
                {extraPaths.length > 0 && (
                  <p className="text-xs mb-2" style={{ color: "#888" }}>
                    {extraPaths.length} existing image(s) kept unless you upload new ones (replaces all extras on save).
                  </p>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    setExtraFiles(files);
                    setExtraPreviews(files.map((f) => URL.createObjectURL(f)));
                    if (modal === "edit") setExtraPaths([]);
                  }}
                  className={fileInputClass}
                />
                <p className="text-xs mt-1.5" style={{ color: "#888" }}>
                  Select one or more images
                </p>
                {extraPreviews.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {extraPreviews.map((src, i) => (
                      <div key={i} className="relative w-16 h-16 rounded overflow-hidden">
                        <Image src={src} alt="" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3.5 rounded-lg text-sm font-semibold tracking-wider disabled:opacity-60"
                style={{ backgroundColor: "#015961", color: "#FCCD97" }}
              >
                {saving ? "SAVING…" : modal === "add" ? "CREATE PACKAGE" : "SAVE CHANGES"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center">
            <h3
              className="text-xl font-bold mb-2"
              style={{ color: "#012D32", fontFamily: "var(--font-cormorant), serif" }}
            >
              Delete package?
            </h3>
            <p className="text-sm mb-6" style={{ color: "#666" }}>
              This removes the package and all extra images.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-lg text-sm border"
                style={{ borderColor: "#EDE5D8", color: "#555" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: "#c1121f" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
