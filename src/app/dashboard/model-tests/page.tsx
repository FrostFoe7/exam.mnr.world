import { PageHeader, EmptyState } from "@/components";
import { BookOpen } from "lucide-react";

export default function ModelTestsPage() {
  return (
    <div className="container mx-auto p-2 md:p-4 space-y-6">
      <PageHeader
        title="মডেল টেস্ট"
        description="অনুশীলনের জন্য মডেল পরীক্ষা"
      />
      <EmptyState
        icon={<BookOpen className="h-12 w-12 text-primary" />}
        title="মডেল টেস্ট পাওয়া যায়নি"
        description="এখনও কোনো মডেল টেস্ট উপলব্ধ নেই। শীঘ্রই আরও যুক্ত করা হবে।"
      />
    </div>
  );
}
