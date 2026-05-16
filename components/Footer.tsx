"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  emailToMailtoHref,
  parseSiteContact,
  phoneToTelHref,
} from "@/lib/site-settings";

const quickLinks = [
  ["Home", "/"],
  ["About", "/about"],
  ["Services", "/categories"],
  ["Gallery", "/gallery"],
  ["Videos", "/videos"],
  ["Contact", "/contact"],
];

type FooterCategory = { id: number; name: string; slug: string };

/** Max service links in footer — keeps columns balanced vs Explore / Contact */
const FOOTER_SERVICES_LIMIT = 6;

/** Internal categories (package booking) — not public footer services */
const FOOTER_EXCLUDED_SLUGS = new Set(["gallery-booking"]);

function publicFooterCategories(all: FooterCategory[]): FooterCategory[] {
  return all.filter((c) => !FOOTER_EXCLUDED_SLUGS.has(c.slug));
}

export default function Footer() {
  const year = new Date().getFullYear();
  const textRef = useRef<HTMLSpanElement>(null);
  const [contact, setContact] = useState(() => parseSiteContact({}));
  const [categories, setCategories] = useState<FooterCategory[]>([]);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => setContact(parseSiteContact(data)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/categories", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: unknown) => {
        if (!Array.isArray(data)) {
          setCategories([]);
          return;
        }
        setCategories(
          data
            .filter(
              (c): c is FooterCategory =>
                c != null &&
                typeof c === "object" &&
                typeof (c as FooterCategory).id === "number" &&
                typeof (c as FooterCategory).name === "string" &&
                typeof (c as FooterCategory).slug === "string"
            )
            .map((c) => ({ id: c.id, name: c.name, slug: c.slug }))
        );
      })
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (textRef.current) {
      gsap.fromTo(
        textRef.current,
        { yPercent: 40, scale: 0.9 },
        {
          yPercent: 0,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: textRef.current.parentElement,
            start: "top bottom",
            end: "bottom bottom",
            scrub: true,
          },
        }
      );
    }
  }, []);

  const publicCategories = useMemo(
    () => publicFooterCategories(categories),
    [categories]
  );
  const footerServices = useMemo(
    () => publicCategories.slice(0, FOOTER_SERVICES_LIMIT),
    [publicCategories]
  );
  const hasMoreServices = publicCategories.length > FOOTER_SERVICES_LIMIT;

  const contactItems = [
    { icon: "◈", text: contact.address },
    {
      icon: "☏",
      text: contact.phone,
      href: phoneToTelHref(contact.phone) || undefined,
    },
    {
      icon: "✉",
      text: contact.email,
      href: emailToMailtoHref(contact.email) || undefined,
    },
    { icon: "◷", text: contact.hours },
  ];

  return (
    <footer
      style={{
        background: "#010E10",
        position: "relative",
        overflow: "hidden",
        borderTop: "1px solid rgba(252,205,151,.05)",
      }}
    >
      <div
        className="mx-auto"
        style={{
          maxWidth: "1400px",
          paddingInline: "var(--gutter)",
          paddingTop: "clamp(60px, 10vw, 100px)",
          paddingBottom: "24px",
        }}
      >
        <div className="footer-grid">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <Link
                href="/"
                style={{
                  textDecoration: "none",
                  display: "inline-block",
                  marginBottom: 32,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-cormorant),serif",
                    fontSize: "clamp(1.8rem, 2.5vw, 2.2rem)",
                    fontWeight: 400,
                    color: "#FCCD97",
                    display: "block",
                    lineHeight: 1,
                  }}
                >
                  Regal Event
                </span>
                <span
                  style={{
                    fontSize: ".65rem",
                    letterSpacing: ".25em",
                    textTransform: "uppercase",
                    color: "rgba(249,244,238,.4)",
                    marginTop: 8,
                    display: "block",
                  }}
                >
                  London
                </span>
              </Link>
              <p
                style={{
                  fontSize: ".9rem",
                  color: "rgba(249,244,238,.4)",
                  lineHeight: 1.8,
                  maxWidth: 320,
                }}
              >
                {contact.tagline}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 40,
                flexWrap: "wrap",
              }}
            >
              {contact.socialLinks.map((s) => (
                <a
                  key={`${s.abbr}-${s.href}`}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="footer-social-link"
                >
                  {s.abbr}
                </a>
              ))}
            </div>
          </div>

          <div className="footer-links-wrapper">
            <div>
              <h4 className="footer-heading">Explore</h4>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                {quickLinks.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="footer-link">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="footer-heading">Services</h4>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                {footerServices.length === 0 ? (
                  <li>
                    <Link href="/categories" className="footer-link">
                      View all services
                    </Link>
                  </li>
                ) : (
                  <>
                    {footerServices.map((cat) => (
                      <li key={cat.id}>
                        <Link
                          href={`/book?category=${encodeURIComponent(cat.slug)}`}
                          className="footer-link"
                        >
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                    {hasMoreServices && (
                      <li>
                        <Link
                          href="/categories"
                          className="footer-link footer-link-accent"
                        >
                          View all services →
                        </Link>
                      </li>
                    )}
                  </>
                )}
              </ul>
            </div>

            <div>
              <h4 className="footer-heading">Contact</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {contactItems.map((item) => (
                  <div
                    key={item.text}
                    style={{
                      display: "flex",
                      gap: 14,
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      style={{
                        color: "rgba(252,205,151,0.5)",
                        fontSize: ".9rem",
                        marginTop: 2,
                      }}
                    >
                      {item.icon}
                    </span>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="footer-link"
                        style={{ lineHeight: 1.5 }}
                      >
                        {item.text}
                      </a>
                    ) : (
                      <span
                        style={{
                          fontSize: ".9rem",
                          color: "rgba(249,244,238,.4)",
                          lineHeight: 1.5,
                        }}
                      >
                        {item.text}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "clamp(80px, 12vw, 140px)",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            borderBottom: "1px solid rgba(252,205,151,.05)",
            paddingBottom: "clamp(20px, 4vw, 40px)",
            overflow: "hidden",
          }}
        >
          <span
            ref={textRef}
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontSize: "clamp(5rem, 18.5vw, 22rem)",
              fontWeight: 300,
              lineHeight: 0.75,
              letterSpacing: "-0.02em",
              color: "#F9F4EE",
              whiteSpace: "nowrap",
              opacity: 0.95,
              display: "inline-block",
            }}
          >
            R E G A L
          </span>
        </div>

        <div
          style={{
            paddingTop: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <span
            style={{
              fontSize: ".75rem",
              color: "rgba(249,244,238,.3)",
              letterSpacing: ".05em",
            }}
          >
            © {year} REGAL EVENT LONDON. ALL RIGHTS RESERVED.
          </span>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              ["Track Booking", "/track"],
              ["Book an Event", "/book"],
              ["Admin", "/admin/login"],
            ].map(([l, h]) => (
              <Link
                key={h}
                href={h}
                style={{
                  fontSize: ".75rem",
                  color: "rgba(249,244,238,.3)",
                  textDecoration: "none",
                  transition: "color .3s",
                  letterSpacing: ".05em",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "#FCCD97")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "rgba(249,244,238,.3)")
                }
              >
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 60px;
        }
        .footer-links-wrapper {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
        }
        .footer-heading {
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #fccd97;
          margin-bottom: 28px;
        }
        .footer-link {
          font-size: 0.95rem;
          color: rgba(249, 244, 238, 0.5);
          text-decoration: none;
          transition: color 0.3s, transform 0.3s;
          display: inline-block;
        }
        .footer-link:hover {
          color: #f9f4ee;
          transform: translateX(4px);
        }
        .footer-link-accent {
          color: rgba(252, 205, 151, 0.75);
        }
        .footer-link-accent:hover {
          color: #fccd97;
        }
        .footer-social-link {
          width: 44px;
          height: 44px;
          border: 1px solid rgba(252, 205, 151, 0.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(249, 244, 238, 0.5);
          font-size: 0.8rem;
          text-decoration: none;
          transition: all 0.3s;
        }
        .footer-social-link:hover {
          border-color: #fccd97;
          color: #111;
          background: #fccd97;
          transform: translateY(-3px);
        }

        @media (min-width: 768px) {
          .footer-links-wrapper {
            grid-template-columns: repeat(3, 1fr);
            gap: 40px;
          }
        }
        @media (min-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1.8fr;
            gap: 80px;
          }
        }
      `}</style>
    </footer>
  );
}
