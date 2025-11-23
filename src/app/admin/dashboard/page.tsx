"use client";
import { StatCard } from "@/components";
import { Users, BookOpen, FileQuestion } from "lucide-react";

export default function AdminDashboard() {
  const cards = [
    {
      title: "মোট ব্যবহারকারী",
      value: "১২,৩৪৫",
      description: "নিবন্ধিত ছাত্রছাত্রী",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "লাইভ পরীক্ষা",
      value: "৫",
      description: "বর্তমানে চলমান",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      title: "মোট প্রশ্ন",
      value: "১০,০০০+",
      description: "প্রশ্নব্যাংকে রয়েছে",
      icon: <FileQuestion className="h-5 w-5" />,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in duration-500">
      {cards.map((card, idx) => (
        <div key={idx} style={{ animationDelay: `${idx * 150}ms` }}>
          <StatCard
            title={card.title}
            value={card.value}
            description={card.description}
            icon={card.icon}
          />
        </div>
      ))}
    </div>
  );
}
