import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
});

export const metadata: Metadata = {
  title: "MNR পরীক্ষা — আপনার পরীক্ষার প্রস্তুতি সঙ্গী",
  description: "আপনার বিশ্ববিদ্যালয় ভর্তি পরীক্ষার প্রস্তুতির কেন্দ্রবিন্দু।",
  keywords:
    "mnr,mnr world,mnrfrom2020,frostfoe,mnr study,study platform,admission calendar,admission news 2025,admission 2025,university admission,question bank,bangladesh university,public university,private university,college admission,ভর্তি তথ্য,বিশ্ববিদ্যালয় ভর্তি,প্রশ্নব্যাংক,অ্যাডমিশন ক্যালেন্ডার,ভর্তি পরীক্ষা,মডেল টেস্ট,বিশ্ববিদ্যালয় ভর্তি প্রস্তুতি",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning className={hindSiliguri.variable}>
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          hindSiliguri.className
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}