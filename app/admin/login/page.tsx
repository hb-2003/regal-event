"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push("/admin/dashboard");
      } else {
        setError("Invalid username or password.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: "#011F23", minHeight: "100dvh" }}
    >
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(252,205,151,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(252,205,151,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 relative"
            style={{
              filter:
                "drop-shadow(0 0 30px rgba(252,205,151,0.35)) drop-shadow(0 12px 30px rgba(0,0,0,0.4))",
            }}
          >
            <Image
              src="/Final Logo.png"
              alt="Regal Event"
              width={96}
              height={96}
              className="object-contain w-full h-full"
            />
          </div>
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-widest"
            style={{ color: "#FCCD97", fontFamily: "var(--font-cormorant), serif" }}
          >
            REGAL EVENT
          </h1>
          <p className="text-xs tracking-widest mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
            ADMIN PANEL
          </p>
        </div>

        {/* Form */}
        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(252,205,151,0.15)" }}
        >
          <h2
            className="text-xl font-bold mb-6 text-center"
            style={{ color: "#FCCD97", fontFamily: "var(--font-cormorant), serif" }}
          >
            Sign In
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs tracking-widest uppercase mb-2"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Username
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                placeholder="admin"
                className="w-full px-4 py-3 rounded-lg"
                style={{
                  backgroundColor: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(252,205,151,0.2)",
                  color: "white",
                  fontSize: "16px",
                }}
              />
            </div>
            <div>
              <label
                className="block text-xs tracking-widest uppercase mb-2"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg"
                style={{
                  backgroundColor: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(252,205,151,0.2)",
                  color: "white",
                  fontSize: "16px",
                }}
              />
            </div>
            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg text-sm font-semibold tracking-widest transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 mt-2"
              style={{ backgroundColor: "#FCCD97", color: "#012D32" }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = "#D4A567"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#FCCD97"; }}
            >
              {loading ? "SIGNING IN..." : "SIGN IN ✦"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
          © {new Date().getFullYear()} Regal Event London
        </p>
      </div>
    </div>
  );
}
