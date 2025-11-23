"use client";
import { StatCard } from "@/components";
import { FileText, BadgePercent, BarChart } from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      title: "মোট পরীক্ষা",
      value: "১২",
      description: "এখন পর্যন্ত দিয়েছেন",
      icon: <FileText className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "গড় নম্বর",
      value: "৮৫.৭%",
      description: "সকল পরীক্ষার গড়",
      icon: <BadgePercent className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "সেরা ফলাফল",
      value: "৯৮%",
      description: "ঢাকা বিশ্ববিদ্যালয় মডেল টেস্ট",
      icon: <BarChart className="h-5 w-5 text-muted-foreground" />,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={stat.icon}
        />
      ))}
    </div>
  );
}
