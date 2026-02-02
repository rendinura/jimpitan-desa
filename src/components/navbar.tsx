import { UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-4 border-b bg-white">
      <h1 className="font-bold text-blue-600 italic">JIMIPITAN DESA</h1>
      <div className="flex items-center gap-4">
        {/* Tombol Logout otomatis disediakan oleh Clerk */}
        <UserButton afterSignOutUrl="/" />
      </div>
    </nav>
  );
}