"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  BarChart3, 
  Menu,
  Settings,
  LogOut,
  BookUser,
  CalendarCheck,
  Rotate3d
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Catat Jimpitan", href: "/dashboard/catat", icon: ClipboardList },
  { name: "Data Warga", href: "/dashboard/users", icon: Users },
  { name: "Rekapitulasi", href: "/dashboard/rekap", icon: BarChart3 },
  { name: "Kelompok", href: "/dashboard/kelompok", icon: BookUser },
  { name: "Jadwal", href: "/dashboard/rotasi", icon: CalendarCheck },
];

export default function SidebarNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full py-4">
      <div className="px-6 py-2">
        <h2 className="text-xl font-bold text-blue-600 tracking-tight">JimpitanDesa</h2>
      </div>
      
      <nav className="flex-1 px-4 mt-8 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-slate-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 mt-auto border-t pt-4">
        <Button variant="ghost" className="w-full justify-start text-slate-500 hover:text-red-600 hover:bg-red-50">
          <LogOut className="w-5 h-5 mr-3" />
          Keluar
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 border-r bg-white">
        <NavContent />
      </aside>

      {/* MOBILE HEADER & DRAWER */}
      <div className="flex-1 md:ml-64 flex flex-col">
        <header className="h-16 border-b bg-white flex items-center justify-between px-4 sticky top-0 z-30 md:hidden">
          <div className="font-bold text-blue-600">JimpitanDesa</div>
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
            <Menu className="w-6 h-6" />
          </Button>
        </header>

        {/* AREA CONTENT */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* MOBILE DRAWER CONTENT */}
      {open && (
         <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl animate-in slide-in-from-left duration-300">
               <NavContent />
            </div>
         </div>
      )}
    </div>
  );
}