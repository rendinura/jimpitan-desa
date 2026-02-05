"use client";

import { UserButton, useUser } from "@clerk/nextjs";

export default function Navbar() {
    const { user } = useUser();
  return (
    <nav className="flex justify-between items-center p-4 border-b bg-white">
      <h1 className="font-bold text-blue-600 italic"></h1>
      <div className="flex items-center gap-4">
        <UserButton afterSignOutUrl="/" />
      </div>
    </nav>
  );
}