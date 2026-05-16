"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  DEFAULT_SOCIAL_LINKS,
  parseSiteContact,
  type SocialLink,
} from "@/lib/site-settings";

const inputClass =
  "w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#015961]/30";
const inputStyle = {
  border: "1px solid #EDE5D8",
  color: "#222",
  backgroundColor: "white",
} as const;
const labelClass = "block text-xs font-semibold tracking-widest uppercase mb-1.5";
const labelStyle = { color: "#555" } as const;
const sectionClass = "rounded-xl p-5 sm:p-6";
const sectionStyle = {
  backgroundColor: "white",
  border: "1px solid #EDE5D8",
} as const;

const fileInputClass =
  "block w-full rounded-lg border border-[#EDE5D8] bg-[#F9F4EE] px-3 py-3 text-sm text-[#333] file:mr-4 file:rounded-lg file:border-0 file:bg-[#015961] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#FCCD97] hover:file:bg-[#012D32] cursor-pointer";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgError, setMsgError] = useState(false);

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

        if (data.about_hero_image) setAboutHeroImage(data.about_hero_image);
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
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      if (type === "about") setAboutHeroImage(data.url);
      else if (type === "home" && index !== undefined) {
        handleHomeHeroImageChange(index, data.url);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to upload image.");
    }
  };

  async function handleSave() {
    setSaving(true);
    setMsg("");
    setMsgError(false);

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
        throw new Error(
          (err as { error?: string }).error || "Failed to save settings"
        );
      }

      setMsg("Settings saved successfully.");
      setTimeout(() => setMsg(""), 4000);
    } catch (err: unknown) {
      setMsgError(true);
      setMsg(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto w-full p-10 text-center" style={{ color: "#888" }}>
        Loading settings…
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-bold"
            style={{ color: "#012D32", fontFamily: "var(--font-cormorant), serif" }}
          >
            Site Settings
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: "#888" }}>
            Contact details for the footer and contact page, plus hero images.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="shrink-0 px-5 py-2.5 rounded-lg text-sm font-semibold tracking-wider transition-all hover:shadow-md disabled:opacity-60"
          style={{ backgroundColor: "#015961", color: "#FCCD97", minHeight: 44 }}
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
      </div>

      {msg && (
        <div
          className="mb-6 px-4 py-3 rounded-lg text-sm"
          style={{
            backgroundColor: msgError ? "#fde8e8" : "#EDE5D8",
            color: msgError ? "#c1121f" : "#015961",
            border: `1px solid ${msgError ? "#f5c2c2" : "#FCCD97"}`,
          }}
        >
          {msg}
        </div>
      )}

      <div className="space-y-6 sm:space-y-8">
        <section className={sectionClass} style={sectionStyle}>
          <h2
            className="text-xl sm:text-2xl font-bold mb-1"
            style={{ color: "#012D32", fontFamily: "var(--font-cormorant), serif" }}
          >
            Contact &amp; footer
          </h2>
          <p className="text-xs sm:text-sm mb-6" style={{ color: "#888" }}>
            Shown in the site footer and on the contact page.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className={labelClass} style={labelStyle}>
                Address
              </label>
              <input
                type="text"
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>
                Phone
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>
                Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>
                Opening hours
              </label>
              <input
                type="text"
                value={contactHours}
                onChange={(e) => setContactHours(e.target.value)}
                className={inputClass}
                style={inputStyle}
                placeholder="Mon–Sat · 9am–8pm"
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass} style={labelStyle}>
                Footer brand description
              </label>
              <textarea
                rows={3}
                value={footerTagline}
                onChange={(e) => setFooterTagline(e.target.value)}
                className={`${inputClass} resize-none`}
                style={inputStyle}
              />
            </div>
          </div>

          <h3
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: "#015961" }}
          >
            Social links
          </h3>
          <div className="space-y-3">
            {socialLinks.map((link, i) => (
              <div
                key={i}
                className="grid grid-cols-1 sm:grid-cols-[80px_1fr_1fr_auto] gap-3 items-center p-3 rounded-lg"
                style={{ backgroundColor: "#F9F4EE", border: "1px solid #EDE5D8" }}
              >
                <input
                  type="text"
                  value={link.abbr}
                  onChange={(e) => {
                    const next = [...socialLinks];
                    next[i] = { ...next[i], abbr: e.target.value };
                    setSocialLinks(next);
                  }}
                  className={inputClass}
                  style={inputStyle}
                  placeholder="ig"
                  maxLength={8}
                />
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => {
                    const next = [...socialLinks];
                    next[i] = { ...next[i], label: e.target.value };
                    setSocialLinks(next);
                  }}
                  className={inputClass}
                  style={inputStyle}
                  placeholder="Instagram"
                />
                <input
                  type="url"
                  value={link.href}
                  onChange={(e) => {
                    const next = [...socialLinks];
                    next[i] = { ...next[i], href: e.target.value };
                    setSocialLinks(next);
                  }}
                  className={inputClass}
                  style={inputStyle}
                  placeholder="https://"
                />
                <button
                  type="button"
                  onClick={() =>
                    setSocialLinks(socialLinks.filter((_, j) => j !== i))
                  }
                  className="text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                  style={{
                    color: "#c1121f",
                    border: "1px solid #EDE5D8",
                    backgroundColor: "white",
                  }}
                  disabled={socialLinks.length <= 1}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          {socialLinks.length < 8 && (
            <button
              type="button"
              onClick={() =>
                setSocialLinks([...socialLinks, { abbr: "", label: "", href: "" }])
              }
              className="mt-4 text-sm font-semibold tracking-wide"
              style={{ color: "#015961" }}
            >
              + Add social link
            </button>
          )}
        </section>

        <section className={sectionClass} style={sectionStyle}>
          <h2
            className="text-xl sm:text-2xl font-bold mb-4"
            style={{ color: "#012D32", fontFamily: "var(--font-cormorant), serif" }}
          >
            About page hero image
          </h2>
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="w-full lg:w-1/2">
              <label className={labelClass} style={labelStyle}>
                Current image
              </label>
              <div
                className="relative w-full aspect-video rounded-lg overflow-hidden mb-4"
                style={{ backgroundColor: "#F9F4EE", border: "1px solid #EDE5D8" }}
              >
                {aboutHeroImage ? (
                  <Image
                    src={aboutHeroImage}
                    alt="About hero"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center text-sm"
                    style={{ color: "#888" }}
                  >
                    No image set
                  </div>
                )}
              </div>
              <input
                type="text"
                value={aboutHeroImage}
                onChange={(e) => setAboutHeroImage(e.target.value)}
                className={inputClass}
                style={inputStyle}
                placeholder="Image URL or upload"
              />
            </div>
            <div className="w-full lg:w-1/2">
              <label className={labelClass} style={labelStyle}>
                Upload new image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file, "about");
                }}
                className={fileInputClass}
              />
              <p className="text-xs mt-3" style={{ color: "#888" }}>
                High-resolution horizontal image recommended (e.g. 2000×1200).
              </p>
            </div>
          </div>
        </section>

        <section className={sectionClass} style={sectionStyle}>
          <h2
            className="text-xl sm:text-2xl font-bold mb-1"
            style={{ color: "#012D32", fontFamily: "var(--font-cormorant), serif" }}
          >
            Home page mosaic images
          </h2>
          <p className="text-xs sm:text-sm mb-6" style={{ color: "#888" }}>
            These 5 images form the animated mosaic collage on the home page hero.
          </p>

          <div className="space-y-4">
            {homeHeroImages.map((imgUrl, i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row gap-4 items-center p-4 rounded-lg"
                style={{ backgroundColor: "#F9F4EE", border: "1px solid #EDE5D8" }}
              >
                <div
                  className="w-24 h-24 relative rounded-lg overflow-hidden shrink-0"
                  style={{ backgroundColor: "#EDE5D8", border: "1px solid #EDE5D8" }}
                >
                  {imgUrl ? (
                    <Image
                      src={imgUrl}
                      alt={`Mosaic ${i + 1}`}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center text-xs"
                      style={{ color: "#888" }}
                    >
                      Empty
                    </div>
                  )}
                </div>
                <div className="flex-1 w-full min-w-0">
                  <label className={labelClass} style={labelStyle}>
                    Image {i + 1} URL
                  </label>
                  <input
                    type="text"
                    value={imgUrl}
                    onChange={(e) => handleHomeHeroImageChange(i, e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div className="w-full md:w-auto shrink-0">
                  <label className={`${labelClass} md:invisible`} style={labelStyle}>
                    Upload
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file, "home", i);
                    }}
                    className={fileInputClass}
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
