import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";

const ALLOWED_PREFIXES = ["gallery/", "categories/"] as const;

function isAllowedPathname(pathname: string): boolean {
  if (!pathname || pathname.includes("..")) return false;
  return ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get("pathname")?.trim() ?? "";
  if (!isAllowedPathname(pathname)) {
    return NextResponse.json({ error: "Invalid pathname" }, { status: 400 });
  }

  const token = process.env["BLOB_READ_WRITE_TOKEN"]?.trim();
  if (!token) {
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
        "Content-Type": result.blob.contentType ?? "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
        ETag: result.blob.etag,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (err) {
    console.error("[media]", err);
    return NextResponse.json({ error: "Failed to load image" }, { status: 500 });
  }
}
