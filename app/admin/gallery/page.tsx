"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import AdminSidebar from "@/components/admin/AdminSidebar";

type GalleryItem = { id: number; title: string; category: string; image_path: string; created_at: string };
type Category = { name: string };

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", category: "" });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  async function load() {
    const [imgs, cats] = await Promise.all([
      fetch("/api/gallery").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]);
    setImages(imgs);
    setCategories(cats);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [imgs, cats] = await Promise.all([
        fetch("/api/gallery").then((r) => r.json()),
        fetch("/api/categories").then((r) => r.json()),
      ]);
      if (cancelled) return;
      setImages(imgs);
      setCategories(cats);
    })();
    return () => { cancelled = true; };
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleUpload() {
    if (!file) return;
    setSaving(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "gallery");
    const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
    const { path } = await uploadRes.json();

    await fetch("/api/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: form.title, category: form.category, image_path: path }),
    });

    setSaving(false);
    setModal(false);
    setForm({ title: "", category: "" });
    setFile(null);
    setPreview("");
    load();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/gallery/${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    load();
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen" style={{ backgroundColor: "#F9F4EE" }}>
      <AdminSidebar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto min-w-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: "#012D32", fontFamily: "var(--font-cormorant), serif" }}>
                Gallery
              </h1>
              <p className="text-xs sm:text-sm mt-1" style={{ color: "#888" }}>
                {images.length} image{images.length !== 1 ? "s" : ""} uploaded
              </p>
            </div>
            <button
              onClick={() => setModal(true)}
              className="px-5 py-3 rounded-lg text-xs sm:text-sm font-semibold tracking-wider transition-all hover:scale-105 self-start sm:self-auto"
              style={{ backgroundColor: "#015961", color: "#FCCD97", minHeight: 44 }}
            >
              + UPLOAD IMAGE
            </button>
          </div>

          {images.length === 0 ? (
            <div className="text-center py-14 sm:py-20 rounded-2xl px-4" style={{ backgroundColor: "white", border: "2px dashed #EDE5D8" }}>
              <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 opacity-20" style={{ color:"#015961" }}>◇</div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: "#012D32", fontFamily: "var(--font-cormorant), serif" }}>
                No Images Yet
              </h3>
              <p className="text-sm mb-5" style={{ color: "#888" }}>Upload your first gallery image to get started.</p>
              <button
                onClick={() => setModal(true)}
                className="px-6 py-3 rounded-lg text-sm font-semibold tracking-wider"
                style={{ backgroundColor: "#015961", color: "#FCCD97", minHeight: 44 }}
              >
                + UPLOAD IMAGE
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {images.map((img) => (
                <div key={img.id} className="group relative rounded-xl overflow-hidden" style={{ backgroundColor: "#EDE5D8" }}>
                  <div className="aspect-square relative">
                    <Image
                      src={img.image_path}
                      alt={img.title || "Gallery"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                  {/* Always-visible action on touch devices */}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => setDeleteConfirm(img.id)}
                      aria-label="Delete image"
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-md"
                      style={{ backgroundColor: "rgba(193,18,31,0.92)", color: "white" }}
                    >
                      ✕
                    </button>
                  </div>
                  {img.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                      <p className="text-white text-xs truncate">{img.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b" style={{ borderColor: "#EDE5D8" }}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold" style={{ color: "#012D32", fontFamily: "var(--font-cormorant), serif" }}>
                  Upload Image
                </h2>
                <button onClick={() => setModal(false)} aria-label="Close" className="text-2xl text-gray-400 hover:text-gray-600 leading-none w-9 h-9 flex items-center justify-center">×</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#555" }}>
                  Image File *
                </label>
                {preview && (
                  <div className="h-40 rounded-lg overflow-hidden mb-2 relative">
                    <Image src={preview} alt="Preview" fill className="object-cover" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm"
                  style={{ color: "#555" }}
                />
                <p className="text-xs mt-1" style={{ color: "#999" }}>Max 5MB · JPG, PNG, WebP</p>
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#555" }}>Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Image title (optional)"
                  className="w-full px-4 py-3 rounded-lg text-sm"
                  style={{ border: "1px solid #EDE5D8", color: "#222" }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#555" }}>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg text-sm"
                  style={{ border: "1px solid #EDE5D8", color: "#222" }}
                >
                  <option value="">Select category (optional)</option>
                  {categories.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleUpload}
                disabled={!file || saving}
                className="w-full py-3.5 rounded-lg text-sm font-semibold tracking-wider transition-all disabled:opacity-60"
                style={{ backgroundColor: "#015961", color: "#FCCD97" }}
              >
                {saving ? "UPLOADING..." : "UPLOAD IMAGE ✦"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center">
            <div className="text-3xl mb-3" style={{ color:"#c1121f" }}>!</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "#012D32", fontFamily: "var(--font-cormorant), serif" }}>Delete Image?</h3>
            <p className="text-sm mb-6" style={{ color: "#666" }}>This will permanently delete the image.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-lg text-sm border" style={{ borderColor: "#EDE5D8", color: "#555", minHeight: 44 }}>CANCEL</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 rounded-lg text-sm font-semibold" style={{ backgroundColor: "#c1121f", color: "white", minHeight: 44 }}>DELETE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
