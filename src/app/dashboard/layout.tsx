import Navbar from "@/components/navbar";
import SidebarNav from "@/components/sidebar-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarNav>
      <Navbar />
        {children}
      </SidebarNav>
  );
}