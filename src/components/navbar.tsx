"use client";

import { UserButton, useUser } from "@clerk/nextjs";

export default function Navbar() {
    const { user } = useUser();

    const firstName = user?.firstName as String;
    const lastName = user?.lastName as String;
    const name = firstName +" "+ lastName || 'Warga'
  return (
    <nav className="flex justify-between items-center p-4 border-b bg-white">
      <h1 className="font-bold text-blue-600 italic"></h1>
      <div className="flex items-center gap-4">
        <UserButton afterSignOutUrl="/" />
            {name}
      </div>
    </nav>
  );
}