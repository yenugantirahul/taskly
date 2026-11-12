import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Optimistic routing only: this checks that a session cookie exists, not that
// it's valid. The API validates the session on every request, and the
// dashboard signs out and returns to "/" when it answers 401.
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has("session");
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") && !hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  // Signed-in visitors skip the landing page and the auth forms.
  if ((pathname === "/" || pathname === "/login" || pathname === "/signup") && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/signup", "/dashboard/:path*"],
};
