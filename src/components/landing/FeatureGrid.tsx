"use client";
import {
  CalendarDays,
  FileQuestion,
  Users,
  Info,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    label: "পরীক্ষার রুটিন",
    href: "/calendar",
    icon: (
      <CalendarDays className="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-primary mb-2" />
    ),
  },
  {
    label: "প্রশ্নব্যাংক",
    href: "/question-bank",
    icon: (
      <FileQuestion className="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-primary mb-2" />
    ),
  },
  {
    label: "আমার ব্যাচ",
    href: "/dashboard/batches",
    icon: (
      <Users className="h-8 w-8 sm-h-10 sm:w-10 mx-auto text-primary mb-2" />
    ),
  },
  {
    label: "আমাদের সম্পর্কে",
    href: "/about",
    icon: (
      <Info className="h-8 w-8 sm-h-10 sm:w-10 mx-auto text-primary mb-2" />
    ),
  },
];

export function FeatureGrid() {
  return (
    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {features.map((feature, idx) => (
        <Link key={feature.href} href={feature.href} aria-label={feature.label}>
          <Card
            className={`p-3 sm:p-4 rounded-lg shadow-xs hover:shadow-md hover:bg-accent hover:scale-105 text-center text-card-foreground`}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <CardContent className="p-0">
              {feature.icon}
              <p className="font-semibold text-xs sm:text-sm">
                {feature.label}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
