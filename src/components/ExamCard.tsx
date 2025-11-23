"use client";

import Link from "next/link";
import { Zap, CheckCircle2 } from "lucide-react";
import type { Exam, StudentExam } from "@/lib/types";

interface ExamCardProps {
  exam: Exam;
  index: number;
  result?: StudentExam;
}

export function ExamCard({ exam, index, result }: ExamCardProps) {
  return (
    <Link href={`/dashboard/exams/${exam.id}`}>
      <div className="group block max-w-sm border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden bg-white dark:bg-neutral-950">
        {/* Image Section - Gradient Background */}
        <div
          className={`relative h-48 flex items-center justify-center overflow-hidden transition-colors duration-300 ${
            result
              ? "bg-gradient-to-br from-green-500/20 to-green-500/5 dark:from-green-500/30 dark:to-green-500/10 group-hover:from-green-500/30 group-hover:to-green-500/10"
              : "bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 group-hover:from-primary/30 group-hover:to-primary/10"
          }`}
        >
          <div className="text-center">
            <p
              className={`text-sm font-medium mb-2 ${result ? "text-green-700 dark:text-green-600" : "text-primary/70 dark:text-primary/60"}`}
            >
              {result ? "ফলাফল" : "পরীক্ষা ID"}
            </p>
            <p
              className={`text-4xl font-light tracking-tight transition-colors ${
                result
                  ? "text-green-700 dark:text-green-500 group-hover:text-green-800"
                  : "text-primary dark:text-primary group-hover:text-primary/80"
              }`}
            >
              {result
                ? `${result.score.toFixed(0)}%`
                : exam.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 text-center">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-sm mb-4 ${
              result
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 text-primary dark:text-primary"
            }`}
          >
            {result ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <Zap className="w-3 h-3" />
            )}
            {result ? "সম্পন্ন" : "পরীক্ষা"}
          </div>

          {/* Title */}
          <h5 className="mt-3 mb-3 text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 group-hover:text-primary dark:group-hover:text-primary transition-colors">
            {exam.name}
          </h5>

          {/* Date */}
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            তারিখ: {new Date(exam.created_at).toLocaleDateString("bn-BD")}
          </p>

          {/* Button */}
          <button
            onClick={() =>
              (window.location.href = `/dashboard/exams/${exam.id}`)
            }
            className={`inline-flex items-center shadow-sm font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none transition-all duration-200 ${
              result
                ? "text-green-700 bg-green-100 border border-green-200 hover:bg-green-200 focus:ring-4 focus:ring-green-100"
                : "text-neutral-50 dark:text-neutral-950 bg-neutral-900 dark:bg-neutral-50 border border-neutral-900 dark:border-neutral-50 hover:bg-neutral-800 dark:hover:bg-neutral-100 focus:ring-4 focus:ring-neutral-300 dark:focus:ring-neutral-600"
            }`}
          >
            {result ? "ফলাফল দেখুন" : "পরীক্ষা দিন"}
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
