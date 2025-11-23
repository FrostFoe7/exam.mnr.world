"use client";

import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { EmptyState, Button } from "@/components";
import Link from "next/link";
import { Construction, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function QuestionBankPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="grow container mx-auto px-2 py-8 md:px-4 flex items-center justify-center">
        <EmptyState
          icon={<Construction className="h-12 w-12 text-primary" />}
          title="এই পৃষ্ঠাটি নির্মাণাধীন"
          description="আমরা এই ফিচারটি উন্নত করার জন্য কাজ করছি। খুব শীঘ্রই আবার চেষ্টা করুন।"
          actionLabel="হোমপেজে ফিরে যান"
          onAction={() => router.push("/")}
        />
      </main>
      <Footer />
    </div>
  );
}
