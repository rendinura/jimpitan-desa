// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Tentukan rute yang WAJIB login
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

const isAdminRoute = createRouteMatcher([
  "/dashboard/users(.*)",
  "/dashboard/kelompok(.*)",
  "/dashboard/rotasi/setup(.*)",
]);

const isPetugasRoute = createRouteMatcher([
  "/dashboard/catat(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect(); //
  }

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role || "warga";

  // 2. PROTEK ROLE ADMIN
  if (isAdminRoute(req) && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 3. PROTEK ROLE PETUGAS
  if (isPetugasRoute(req) && role === "warga") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};