import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession, updateSession } from "./lib/session";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAuthRoute = path === "/login";
  const isUploadRoute = path.startsWith("/uploads"); // Allow static uploads to load if needed? Next.js serves from public so proxy might not intercept /uploads, but it's safe to exclude.
  
  // Validate session
  const session = await getSession();

  // Redirect to login if unauthenticated and trying to access any route except login
  if (!session && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect to home if authenticated and trying to access login
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Update session expiration if valid
  if (session) {
    return await updateSession(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
