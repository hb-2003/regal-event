"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  DEFAULT_SOCIAL_LINKS,
  parseSiteContact,
  type SocialLink,
} from "@/lib/site-settings";

const inputClass =
  "w-full p-3 rounded bg-black/20 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#FCCD97]/50";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [aboutHeroImage, setAboutHeroImage] = useState("");
  const [homeHeroImages, setHomeHeroImages] = useState<string[]>(Array(5).fill(""));
  const [contactAddress, setContactAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactHours, setContactHours] = useState("");
  const [footerTagline, setFooterTagline] = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(DEFAULT_SOCIAL_LINKS);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        const contact = parseSiteContact(data);
        setContactAddress(contact.address);
        setContactPhone(contact.phone);
        setContactEmail(contact.email);
        setContactHours(contact.hours);
        setFooterTagline(contact.tagline);
        setSocialLinks(contact.socialLinks);

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
          contact_address: contactAddress,
          contact_phone: contactPhone,
          contact_email: contactEmail,
          contact_hours: contactHours,
          footer_tagline: footerTagline,
          social_links: socialLinks,
          about_hero_image: aboutHeroImage,
          home_hero_images: homeHeroImages,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save settings");
      }

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
          <p className="text-sm text-white/50">
            Contact details for the footer and contact page, plus hero images.
          </p>
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
        <section className="p-6 rounded-xl bg-[#022C32] border border-[#FCCD97]/10">
          <h2
            className="text-xl text-[#FCCD97] mb-2"
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            Contact &amp; footer
          </h2>
          <p className="text-sm text-white/50 mb-6">
            Shown in the site footer and on the contact page.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Address</label>
              <input type="text" value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Phone</label>
              <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
              <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Opening hours</label>
              <input type="text" value={contactHours} onChange={(e) => setContactHours(e.target.value)} className={inputClass} placeholder="Mon–Sat · 9am–8pm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white/70 mb-2">Footer brand description</label>
              <textarea rows={3} value={footerTagline} onChange={(e) => setFooterTagline(e.target.value)} className={`${inputClass} resize-none`} />
            </div>
          </div>
          <h3 className="text-sm font-medium text-[#FCCD97] mb-3 tracking-wider uppercase">Social links</h3>
          <div className="space-y-3">
            {socialLinks.map((link, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-[72px_1fr_1fr_auto] gap-2 items-center bg-black/20 p-3 rounded border border-white/5">
                <input type="text" value={link.abbr} onChange={(e) => { const next = [...socialLinks]; next[i] = { ...next[i], abbr: e.target.value }; setSocialLinks(next); }} className={inputClass} placeholder="ig" maxLength={8} />
                <input type="text" value={link.label} onChange={(e) => { const next = [...socialLinks]; next[i] = { ...next[i], label: e.target.value }; setSocialLinks(next); }} className={inputClass} placeholder="Instagram" />
                <input type="url" value={link.href} onChange={(e) => { const next = [...socialLinks]; next[i] = { ...next[i], href: e.target.value }; setSocialLinks(next); }} className={inputClass} placeholder="https://" />
                <button type="button" onClick={() => setSocialLinks(socialLinks.filter((_, j) => j !== i))} className="text-xs text-white/50 hover:text-red-300 px-2 py-2" disabled={socialLinks.length <= 1}>Remove</button>
              </div>
            ))}
          </div>
          {socialLinks.length < 8 && (
            <button type="button" onClick={() => setSocialLinks([...socialLinks, { abbr: "", label: "", href: "" }])} className="mt-3 text-sm text-[#FCCD97] hover:underline">+ Add social link</button>
          )}
        </section>

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
