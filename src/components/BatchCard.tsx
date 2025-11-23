"use client";

import Link from "next/link";
import { BarChart3, Zap } from "lucide-react";
import type { Batch } from "@/lib/types";

interface BatchCardProps {
  batch: Batch;
  index: number;
}

export function BatchCard({ batch, index }: BatchCardProps) {
  return (
    <Link href={`/dashboard/batches/${batch.id}`}>
      <div className="group block max-w-sm border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden bg-white dark:bg-neutral-950">
        {/* Image Section */}
        <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 flex items-center justify-center overflow-hidden">
          {batch.icon_url ? (
            <img
              src={batch.icon_url}
              alt={batch.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="p-8 rounded-full bg-primary/10 dark:bg-primary/20 group-hover:scale-110 transition-transform duration-300">
              <BarChart3 className="w-16 h-16 text-primary" />
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 text-primary dark:text-primary text-xs font-medium px-3 py-1.5 rounded-sm mb-4">
            <Zap className="w-3 h-3" />
            {batch.status === "live" ? "চালু" : "শেষ"}
          </div>

          {/* Title */}
          <h5 className="mt-3 mb-4 text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 group-hover:text-primary dark:group-hover:text-primary transition-colors">
            {batch.name}
          </h5>

          {/* Description */}
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
            {batch.description || "এই ব্যাচে যোগ দিন এবং আপনার দক্ষতা প্রদর্শন করুন।"}
          </p>

          {/* Button */}
          <button
            onClick={() => window.location.href = `/dashboard/batches/${batch.id}`}
            className="inline-flex items-center text-neutral-50 dark:text-neutral-950 bg-neutral-900 dark:bg-neutral-50 border border-neutral-900 dark:border-neutral-50 hover:bg-neutral-800 dark:hover:bg-neutral-100 focus:ring-4 focus:ring-neutral-300 dark:focus:ring-neutral-600 shadow-sm font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none transition-all duration-200"
          >
            ব্যাচ দেখুন
            <svg
              className="w-4 h-4 ms-2 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 12H5m14 0-4 4m4-4-4-4"
              />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
}
