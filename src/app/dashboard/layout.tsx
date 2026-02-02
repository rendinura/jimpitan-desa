import SidebarNav from "@/components/sidebar-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarNav>
      {children}
    </SidebarNav>
  );
}