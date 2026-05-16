"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [aboutHeroImage, setAboutHeroImage] = useState("");
  const [homeHeroImages, setHomeHeroImages] = useState<string[]>(Array(5).fill(""));

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.about_hero_image) {
          setAboutHeroImage(data.about_hero_image);
        }
        if (data.home_hero_images) {
          try {
            const parsed = JSON.parse(data.home_hero_images);
            if (Array.isArray(parsed) && parsed.length === 5) {
              setHomeHeroImages(parsed);
            }
          } catch (e) {
            console.error("Failed to parse home_hero_images", e);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleHomeHeroImageChange = (index: number, url: string) => {
    const newImages = [...homeHeroImages];
    newImages[index] = url;
    setHomeHeroImages(newImages);
  };

  const handleUpload = async (file: File, type: "about" | "home", index?: number) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      if (type === "about") {
        setAboutHeroImage(data.url);
      } else if (type === "home" && index !== undefined) {
        handleHomeHeroImageChange(index, data.url);
      }
    } catch (err: any) {
      alert(err.message || "Failed to upload image.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          about_hero_image: aboutHeroImage,
          home_hero_images: homeHeroImages,
        }),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      setMsg("Settings saved successfully!");
      setTimeout(() => setMsg(""), 3000);
    } catch (err: any) {
      setMsg(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-white/60">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-2 text-[#F9F4EE]" style={{ fontFamily: "var(--font-cormorant), serif" }}>Site Settings</h1>
          <p className="text-sm text-white/50">Manage dynamic images across the site.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-gold"
          style={{ padding: "10px 24px", fontSize: "0.85rem" }}
        >
          <span>{saving ? "Saving..." : "Save Settings"}</span>
        </button>
      </div>

      {msg && (
        <div className="mb-6 p-4 rounded bg-[#022C32] border border-[#FCCD97]/20 text-[#FCCD97] text-sm">
          {msg}
        </div>
      )}

      <div className="space-y-12">
        {/* About Page Hero */}
        <section className="p-6 rounded-xl bg-[#022C32] border border-[#FCCD97]/10">
          <h2 className="text-xl text-[#FCCD97] mb-4" style={{ fontFamily: "var(--font-cormorant), serif" }}>About Page Hero Image</h2>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium text-white/70 mb-2">Current Image</label>
              <div className="relative w-full aspect-video bg-black/40 rounded overflow-hidden mb-4 border border-[#FCCD97]/20">
                {aboutHeroImage ? (
                  <Image src={aboutHeroImage} alt="About Hero" fill style={{ objectFit: "cover" }} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm">No image set</div>
                )}
              </div>
              <input
                type="text"
                value={aboutHeroImage}
                onChange={(e) => setAboutHeroImage(e.target.value)}
                className="w-full p-3 rounded bg-black/20 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#FCCD97]/50"
                placeholder="Image URL or upload"
              />
            </div>
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium text-white/70 mb-2">Upload New Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file, "about");
                }}
                className="block w-full text-sm text-white/50
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[#FCCD97]/10 file:text-[#FCCD97]
                  hover:file:bg-[#FCCD97]/20 cursor-pointer"
              />
              <p className="text-xs text-white/40 mt-3">High-resolution horizontal image recommended (e.g., 2000x1200).</p>
            </div>
          </div>
        </section>

        {/* Home Page Mosaic */}
        <section className="p-6 rounded-xl bg-[#022C32] border border-[#FCCD97]/10">
          <h2 className="text-xl text-[#FCCD97] mb-2" style={{ fontFamily: "var(--font-cormorant), serif" }}>Home Page Mosaic Images</h2>
          <p className="text-sm text-white/50 mb-6">These 5 images form the animated mosaic collage on the home page hero.</p>

          <div className="space-y-6">
            {homeHeroImages.map((imgUrl, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-4 items-center bg-black/20 p-4 rounded border border-white/5">
                <div className="w-24 h-24 relative bg-black/40 rounded overflow-hidden flex-shrink-0 border border-white/10">
                  {imgUrl ? (
                    <Image src={imgUrl} alt={`Mosaic ${i + 1}`} fill style={{ objectFit: "cover" }} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/20 text-xs">Empty</div>
                  )}
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-xs font-medium text-white/60 mb-1">Image {i + 1} URL</label>
                  <input
                    type="text"
                    value={imgUrl}
                    onChange={(e) => handleHomeHeroImageChange(i, e.target.value)}
                    className="w-full p-2 rounded bg-black/40 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#FCCD97]/50"
                  />
                </div>
                <div className="w-full md:w-auto">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file, "home", i);
                    }}
                    className="block w-full text-xs text-white/50
                      file:mr-2 file:py-1 file:px-3
                      file:rounded file:border-0
                      file:bg-[#FCCD97]/10 file:text-[#FCCD97]
                      hover:file:bg-[#FCCD97]/20 cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
