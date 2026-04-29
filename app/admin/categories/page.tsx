"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import AdminSidebar from "@/components/admin/AdminSidebar";

type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  sort_order: number;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [selected, setSelected] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", description: "", sort_order: "0" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  async function load() {
    const res = await fetch("/api/categories");
    setCategories(await res.json());
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (!cancelled) setCategories(data);
    })();
    return () => { cancelled = true; };
  }, []);

  function openAdd() {
    setForm({ name: "", description: "", sort_order: "0" });
    setImageFile(null);
    setImagePreview("");
    setSelected(null);
    setModal("add");
  }

  function openEdit(cat: Category) {
    setSelected(cat);
    setForm({ name: cat.name, description: cat.description || "", sort_order: String(cat.sort_order) });
    setImagePreview(cat.image || "");
    setImageFile(null);
    setModal("edit");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);

    let imagePath = selected?.image || null;

    if (imageFile) {
      const fd = new FormData();
      fd.append("file", imageFile);
      fd.append("folder", "categories");
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      const uploadData = await uploadRes.json();
      if (uploadData.path) imagePath = uploadData.path;
    }

    const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    if (modal === "add") {
      await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, slug, description: form.description, image: imagePath, sort_order: Number(form.sort_order) }),
      });
    } else if (selected) {
      await fetch(`/api/categories/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, description: form.description, image: imagePath, sort_order: Number(form.sort_order) }),
      });
    }

    setSaving(false);
    setModal(null);
    load();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
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
                Categories
              </h1>
              <p className="text-xs sm:text-sm mt-1" style={{ color: "#888" }}>Manage event categories and their images.</p>
            </div>
            <button
              onClick={openAdd}
              className="px-5 py-3 rounded-lg text-xs sm:text-sm font-semibold tracking-wider transition-all hover:scale-105 self-start sm:self-auto"
              style={{ backgroundColor: "#015961", color: "#FCCD97", minHeight: 44 }}
            >
              + ADD CATEGORY
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white rounded-xl overflow-hidden shadow-sm" style={{ border: "1px solid #EDE5D8" }}>
                <div className="relative" style={{ backgroundColor: "#015961", aspectRatio: "16/10" }}>
                  {cat.image ? (
                    <Image src={cat.image} alt={cat.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl opacity-10 text-white">✦</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-0.5" style={{ color: "#012D32", fontFamily: "var(--font-cormorant), serif" }}>
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">{cat.description || "No description"}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(cat)}
                      className="flex-1 py-2.5 rounded text-xs font-semibold tracking-wider transition-colors"
                      style={{ backgroundColor: "#EDE5D8", color: "#015961", minHeight: 40 }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#D4A567"; (e.currentTarget as HTMLElement).style.color = "white"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#EDE5D8"; (e.currentTarget as HTMLElement).style.color = "#015961"; }}
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(cat.id)}
                      className="px-4 py-2.5 rounded text-xs font-semibold tracking-wider transition-colors"
                      style={{ backgroundColor: "#fee2e2", color: "#c1121f", minHeight: 40 }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#c1121f"; (e.currentTarget as HTMLElement).style.color = "white"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#fee2e2"; (e.currentTarget as HTMLElement).style.color = "#c1121f"; }}
                    >
                      DEL
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b" style={{ borderColor: "#EDE5D8" }}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold" style={{ color: "#012D32", fontFamily: "var(--font-cormorant), serif" }}>
                  {modal === "add" ? "Add Category" : "Edit Category"}
                </h2>
                <button onClick={() => setModal(null)} aria-label="Close" className="text-2xl text-gray-400 hover:text-gray-600 leading-none w-9 h-9 flex items-center justify-center">×</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#555" }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Birthday Decoration"
                  className="w-full px-4 py-3 rounded-lg text-sm"
                  style={{ border: "1px solid #EDE5D8", color: "#222" }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#555" }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Short description..."
                  className="w-full px-4 py-3 rounded-lg text-sm resize-none"
                  style={{ border: "1px solid #EDE5D8", color: "#222" }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#555" }}>
                  Category Image
                </label>
                {imagePreview && (
                  <div className="h-32 rounded-lg overflow-hidden mb-2 relative" style={{ backgroundColor: "#EDE5D8" }}>
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm" style={{ color: "#555" }} />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#555" }}>
                  Sort Order
                </label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg text-sm"
                  style={{ border: "1px solid #EDE5D8", color: "#222" }}
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="w-full py-3.5 rounded-lg text-sm font-semibold tracking-wider transition-all hover:scale-[1.02] disabled:opacity-60"
                style={{ backgroundColor: "#015961", color: "#FCCD97" }}
              >
                {saving ? "SAVING..." : modal === "add" ? "ADD CATEGORY ✦" : "SAVE CHANGES ✦"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center">
            <div className="text-3xl mb-3" style={{ color:"#c1121f" }}>!</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "#012D32", fontFamily: "var(--font-cormorant), serif" }}>Delete Category?</h3>
            <p className="text-sm mb-6" style={{ color: "#666" }}>This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-lg text-sm border" style={{ borderColor: "#EDE5D8", color: "#555", minHeight: 44 }}>
                CANCEL
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 rounded-lg text-sm font-semibold" style={{ backgroundColor: "#c1121f", color: "white", minHeight: 44 }}>
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
