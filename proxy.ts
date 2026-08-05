import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

function publicUrl(req: Request, path: string): URL {
  // Prefer the forwarded host from Cloudflare/reverse proxy so redirects
  // land on the public hostname instead of internal localhost:3000.
  const forwardedHost =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const forwardedProto =
    req.headers.get("x-forwarded-proto") ??
    (forwardedHost && !forwardedHost.startsWith("localhost") ? "https" : "http");
  const base = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : new URL(req.url).origin;
  return new URL(path, base);
}

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === "/login";
  const isAuthApi = pathname.startsWith("/api/auth");

  if (isAuthApi) return NextResponse.next();

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(publicUrl(req, "/login"));
  }
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(publicUrl(req, "/"));
  }
  return NextResponse.next();
});

export const config = {
  // manifest + icons stay public so the PWA can be installed from the
  // login screen; everything else remains behind auth.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/).*)",
  ],
};
