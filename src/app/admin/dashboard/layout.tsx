"use client";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useRouter } from "next/navigation";
import {
  Users,
  LayoutDashboard,
  ClipboardList,
  Settings,
  Menu,
  User,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { ReactNode, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const sidebarNavItems = [
  { title: "ড্যাশবোর্ড", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "ব্যবহারকারীগণ", href: "/admin/dashboard/users", icon: Users },
  { title: "ব্যাচ", href: "/admin/dashboard/batches", icon: ClipboardList },
  { title: "সেটিংস", href: "/admin/dashboard/settings", icon: Settings },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { admin, signOut } = useAdminAuth();
  const router = useRouter();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const handleLogout = () => {
    signOut();
    router.push("/admin/login");
  };

  if (!admin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p>লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground overflow-hidden">
      <DashboardSidebar
        items={sidebarNavItems}
        userInfo={{
          name: admin.username,
          role: admin.role,
        }}
        onLogout={handleLogout}
        panelType="admin"
        onExpandedChange={setSidebarExpanded}
      />

      <div
        className={`flex flex-1 flex-col pb-16 lg:pb-0 ${
          sidebarExpanded ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        <header className="flex h-16 items-center justify-between border-b bg-card px-6 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-semibold">অ্যাডমিন ড্যাশবোর্ড</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Avatar className="h-9 w-9">
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="text-right">
              <p className="text-sm font-medium">{admin.username}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {admin.role}
              </p>
            </div>
          </div>
        </header>
        <main className="flex-1 p-2 md:p-4 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
