"use client";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

type Video = { id: number; title: string; youtube_url: string; description: string; created_at: string };

function getYouTubeId(url: string): string {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=|shorts\/))([^&?/\s]{11})/);
  return match ? match[1] : "";
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [selected, setSelected] = useState<Video | null>(null);
  const [form, setForm] = useState({ title: "", youtube_url: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  async function load() {
    const res = await fetch("/api/videos");
    setVideos(await res.json());
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/videos");
      const data = await res.json();
      if (!cancelled) setVideos(data);
    })();
    return () => { cancelled = true; };
  }, []);

  function openAdd() {
    setForm({ title: "", youtube_url: "", description: "" });
    setSelected(null);
    setModal("add");
  }

  function openEdit(v: Video) {
    setSelected(v);
    setForm({ title: v.title, youtube_url: v.youtube_url, description: v.description || "" });
    setModal("edit");
  }

  async function handleSave() {
    if (!form.title || !form.youtube_url) return;
    setSaving(true);
    if (modal === "add") {
      await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else if (selected) {
      await fetch(`/api/videos/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setSaving(false);
    setModal(null);
    load();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/videos/${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    load();
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen" style={{ backgroundColor: "#F9F4EE" }}>
      <AdminSidebar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto min-w-0">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: "#012D32", fontFamily: "var(--font-cormorant), serif" }}>
                Videos
              </h1>
              <p className="text-xs sm:text-sm mt-1" style={{ color: "#888" }}>
                {videos.length} video{videos.length !== 1 ? "s" : ""} added
              </p>
            </div>
            <button
              onClick={openAdd}
              className="px-5 py-3 rounded-lg text-xs sm:text-sm font-semibold tracking-wider transition-all hover:scale-105 self-start sm:self-auto"
              style={{ backgroundColor: "#015961", color: "#FCCD97", minHeight: 44 }}
            >
              + ADD VIDEO
            </button>
          </div>

          {videos.length === 0 ? (
            <div className="text-center py-14 sm:py-20 rounded-2xl px-4" style={{ backgroundColor: "white", border: "2px dashed #EDE5D8" }}>
              <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 opacity-20" style={{ color:"#015961" }}>▶</div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: "#012D32", fontFamily: "var(--font-cormorant), serif" }}>No Videos Yet</h3>
              <p className="text-sm mb-5" style={{ color: "#888" }}>Add your first YouTube video to get started.</p>
              <button onClick={openAdd} className="px-6 py-3 rounded-lg text-sm font-semibold tracking-wider" style={{ backgroundColor: "#015961", color: "#FCCD97", minHeight: 44 }}>
                + ADD VIDEO
              </button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {videos.map((video) => {
                const ytId = getYouTubeId(video.youtube_url);
                const thumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                return (
                  <div key={video.id} className="bg-white rounded-xl overflow-hidden flex flex-col sm:flex-row" style={{ border: "1px solid #EDE5D8" }}>
                    <div className="relative w-full sm:w-40 sm:flex-shrink-0" style={{ aspectRatio:"16/9" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={thumb} alt={video.title} loading="lazy" className="w-full h-full object-cover absolute inset-0" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#FCCD97" }}>
                          <span className="text-sm ml-0.5" style={{ color: "#012D32" }}>▶</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base truncate" style={{ color: "#012D32", fontFamily: "var(--font-cormorant), serif" }}>
                          {video.title}
                        </h3>
                        {video.description && (
                          <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "#888" }}>{video.description}</p>
                        )}
                        <p className="text-xs mt-1 font-mono truncate" style={{ color: "#aaa" }}>{video.youtube_url}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => openEdit(video)}
                          className="flex-1 sm:flex-initial px-4 py-2.5 rounded text-xs font-semibold tracking-wider"
                          style={{ backgroundColor: "#EDE5D8", color: "#015961", minHeight: 40 }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#015961"; (e.currentTarget as HTMLElement).style.color = "#FCCD97"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#EDE5D8"; (e.currentTarget as HTMLElement).style.color = "#015961"; }}
                        >
                          EDIT
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(video.id)}
                          className="flex-1 sm:flex-initial px-4 py-2.5 rounded text-xs font-semibold tracking-wider"
                          style={{ backgroundColor: "#fee2e2", color: "#c1121f", minHeight: 40 }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#c1121f"; (e.currentTarget as HTMLElement).style.color = "white"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#fee2e2"; (e.currentTarget as HTMLElement).style.color = "#c1121f"; }}
                        >
                          DEL
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b" style={{ borderColor: "#EDE5D8" }}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold" style={{ color: "#012D32", fontFamily: "var(--font-cormorant), serif" }}>
                  {modal === "add" ? "Add Video" : "Edit Video"}
                </h2>
                <button onClick={() => setModal(null)} aria-label="Close" className="text-2xl text-gray-400 hover:text-gray-600 leading-none w-9 h-9 flex items-center justify-center">×</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#555" }}>
                  Video Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Birthday Decoration Highlights"
                  className="w-full px-4 py-3 rounded-lg text-sm"
                  style={{ border: "1px solid #EDE5D8", color: "#222" }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#555" }}>
                  YouTube URL *
                </label>
                <input
                  type="url"
                  value={form.youtube_url}
                  onChange={(e) => setForm((f) => ({ ...f, youtube_url: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-3 rounded-lg text-sm"
                  style={{ border: "1px solid #EDE5D8", color: "#222" }}
                />
              </div>
              {form.youtube_url && getYouTubeId(form.youtube_url) && (
                <div className="rounded-lg overflow-hidden aspect-video">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.youtube.com/vi/${getYouTubeId(form.youtube_url)}/hqdefault.jpg`}
                    alt="Thumbnail preview"
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#555" }}>Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Optional description..."
                  className="w-full px-4 py-3 rounded-lg text-sm resize-none"
                  style={{ border: "1px solid #EDE5D8", color: "#222" }}
                />
              </div>
              <button
                onClick={handleSave}
                disabled={!form.title || !form.youtube_url || saving}
                className="w-full py-3.5 rounded-lg text-sm font-semibold tracking-wider transition-all disabled:opacity-60"
                style={{ backgroundColor: "#015961", color: "#FCCD97" }}
              >
                {saving ? "SAVING..." : modal === "add" ? "ADD VIDEO ✦" : "SAVE CHANGES ✦"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center">
            <div className="text-3xl mb-3" style={{ color:"#c1121f" }}>!</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "#012D32", fontFamily: "var(--font-cormorant), serif" }}>Delete Video?</h3>
            <p className="text-sm mb-6" style={{ color: "#666" }}>This will remove the video from your site.</p>
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
