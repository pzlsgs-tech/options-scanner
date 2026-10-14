import { NextRequest, NextResponse } from "next/server";

const COOKIE = "osp_auth";

function expectedToken(): string | null {
  const pw = process.env.SITE_PASSWORD;
  if (!pw) return null;
  // simple stable token from password (gate only)
  return Buffer.from(`osp:${pw}`).toString("base64url");
}

export function middleware(req: NextRequest) {
  const expected = expectedToken();
  // If no password configured, allow all (dev convenience)
  if (!expected) return NextResponse.next();

  const { pathname } = req.nextUrl;

  // Always allow login page and auth API
  if (pathname === "/login" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(COOKIE)?.value;
  if (cookie && cookie === expected) {
    return NextResponse.next();
  }

  // API without auth → 401
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Pages → redirect to login
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
