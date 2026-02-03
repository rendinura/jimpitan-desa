// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Definisikan rute mana saja yang butuh role Admin
const isAdminRoute = createRouteMatcher([
  "/dashboard/users(.*)",
  "/dashboard/kelompok(.*)",
  "/dashboard/rotasi/setup(.*)",
]);

// Definisikan rute yang butuh role setidaknya Petugas/Pengurus
const isPetugasRoute = createRouteMatcher([
  "/dashboard/catat(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role || "warga";

  // 1. Proteksi Halaman Admin
  if (isAdminRoute(req) && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 2. Proteksi Halaman Catat (Petugas & Admin boleh)
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