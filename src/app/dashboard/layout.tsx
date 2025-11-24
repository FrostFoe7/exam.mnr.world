"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, ReactNode, useState } from "react";
import {
  BarChart,
  LayoutDashboard,
  User as UserIcon,
  FileText,
  Users,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const sidebarNavItems = [
  { title: "ড্যাশবোর্ড", href: "/dashboard", icon: LayoutDashboard },
  { title: "ব্যাচসমূহ", href: "/dashboard/batches", icon: Users },
  { title: "মডেল টেস্ট", href: "/dashboard/model-tests", icon: FileText },
  { title: "ফলাফল", href: "/dashboard/results", icon: BarChart },
  { title: "প্রোফাইল", href: "/dashboard/profile", icon: UserIcon },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const isExamPage = pathname?.startsWith("/dashboard/exams/");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p>লোড হচ্ছে...</p>
      </div>
    );
  }

  const handleLogout = () => {
    signOut();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      <DashboardSidebar
        items={sidebarNavItems}
        userInfo={{
          name: user.name,
          role: `রোল: ${user.roll}`,
        }}
        onLogout={handleLogout}
        panelType="student"
        onExpandedChange={setSidebarExpanded}
        hideMobileNav={isExamPage}
      />

      {/* Main Content */}
      <div
        className={`flex flex-1 flex-col ${
          sidebarExpanded ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        <header className="flex h-16 items-center justify-between border-b bg-card px-6 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">ড্যাশবোর্ড</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Avatar className="h-9 w-9">
              <AvatarFallback>
                <UserIcon className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="text-right">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">রোল: {user.roll}</p>
            </div>
          </div>
        </header>
        <main
          className={`flex-1 p-2 md:p-4 overflow-y-auto ${
            isExamPage ? "pb-0" : "pb-16 lg:pb-0"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
