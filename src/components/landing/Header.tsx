"use client";
import {
  House,
  CalendarDays,
  FileQuestion,
  GraduationCap,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "../theme-toggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "হোম", href: "/", icon: <House size={18} /> },
  {
    label: "পরীক্ষার রুটিন",
    href: "/calendar",
    icon: <CalendarDays size={18} />,
  },
  {
    label: "প্রশ্নব্যাংক",
    href: "/question-bank",
    icon: <FileQuestion size={18} />,
  },
];

export function Header() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-2 z-40 w-full flex justify-center px-2 sm:px-0">
      <div className="flex items-center gap-x-1 rounded-full border border-border bg-card/70 dark:bg-card/60 backdrop-blur-lg p-1.5 shadow-lg transition-all duration-300 w-full max-w-fit">
        <Link
          href="/"
          aria-label="হোমপেজে যান"
          className="group flex items-center space-x-2 pl-3 pr-2 shrink-0"
        >
          <GraduationCap className="h-7 w-7 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 group-active:scale-95" />
        </Link>
        <div className="grow flex items-center overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-x-1">
            <div className="h-6 w-px bg-border/50"></div>
            {navLinks.map(({ label, href, icon }) => (
              <Link
                key={href}
                href={href}
                aria-label={label}
                className={cn(
                  "relative flex cursor-pointer items-center justify-center rounded-full transition-colors duration-300 h-9 focus-visible:outline-hidden px-2 sm:px-3",
                  pathname === href
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <div className="relative z-10 flex items-center">
                  <div className="shrink-0">{icon}</div>
                  <div className="ml-2 hidden sm:block">
                    <span className="whitespace-nowrap text-sm font-medium">
                      {label}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="h-6 w-px bg-border/50"></div>
        <ThemeToggle />
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <UserIcon className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.roll}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>ড্যাশবোর্ড</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>লগ আউট</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            href="/login"
            aria-label="লগইন"
            className="inline-flex items-center justify-center h-9 w-20 rounded-full bg-muted-foreground/20 text-sm font-medium text-foreground hover:bg-muted-foreground/30 transition-colors"
          >
            লগইন
          </Link>
        )}
      </div>
    </header>
  );
}
