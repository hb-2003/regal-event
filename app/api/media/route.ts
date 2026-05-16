import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { get } from "@vercel/blob";

const ALLOWED_PREFIXES = ["gallery/", "categories/"] as const;

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

function isAllowedPathname(pathname: string): boolean {
  if (!pathname || pathname.includes("..")) return false;
  return ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function mimeFromPathname(pathname: string): string {
  const ext = pathname.split(".").pop()?.toLowerCase() ?? "";
  return MIME[ext] ?? "application/octet-stream";
}

function serveLocalUpload(pathname: string): NextResponse | null {
  const filePath = path.join(process.cwd(), "public", "uploads", pathname);
  const uploadsRoot = path.join(process.cwd(), "public", "uploads");
  if (!filePath.startsWith(uploadsRoot) || !fs.existsSync(filePath)) {
    return null;
  }
  const buf = fs.readFileSync(filePath);
  return new NextResponse(buf, {
    headers: {
      "Content-Type": mimeFromPathname(pathname),
      "Cache-Control": "public, max-age=86400",
    },
  });
}

export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get("pathname")?.trim() ?? "";
  if (!isAllowedPathname(pathname)) {
    return NextResponse.json({ error: "Invalid pathname" }, { status: 400 });
  }

  const token = process.env["BLOB_READ_WRITE_TOKEN"]?.trim();
  if (!token) {
    const local = serveLocalUpload(pathname);
    if (local) return local;
    return NextResponse.json(
      { error: "Blob storage is not configured" },
      { status: 503 }
    );
  }

  try {
    const result = await get(pathname, {
      access: "private",
      token,
      ifNoneMatch: request.headers.get("if-none-match") ?? undefined,
    });

    if (!result) {
      const local = serveLocalUpload(pathname);
      if (local) return local;
      return new NextResponse("Not found", { status: 404 });
    }

    if (result.statusCode === 304) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: result.blob.etag,
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
      });
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType ?? mimeFromPathname(pathname),
        "X-Content-Type-Options": "nosniff",
        ETag: result.blob.etag,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (err) {
    console.error("[media]", err);
    const local = serveLocalUpload(pathname);
    if (local) return local;
    return NextResponse.json({ error: "Failed to load image" }, { status: 500 });
  }
}
