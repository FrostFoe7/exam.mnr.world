"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import type { Question, Exam } from "@/lib/types";
import { PageHeader, EmptyState } from "@/components";
import { supabase } from "@/lib/supabase";
import { csvApi } from "@/lib/csvApi";

export default function ExamQuestionsPage() {
  const params = useParams();
  const exam_id = params.exam_id as string;
  const { toast } = useToast();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExamAndQuestions = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get exam details
        const { data: examData, error: examError } = await supabase
          .from("exams")
          .select("*")
          .eq("id", exam_id)
          .single();

        if (examError) {
          setError("পরীক্ষা খুঁজে পাওয়া যায়নি");
          return;
        }

        setExam(examData);

        // Questions are now managed via PHP API
        // If you're using a file_id stored in exams table, fetch from PHP
        // Otherwise, this page shows read-only info
        toast({
          title: "নোটিস",
          description: "প্রশ্নগুলি এখন PHP ব্যাকএন্ড থেকে পরিবেশন করা হয়",
        });
      } catch (err) {
        setError("ডেটা লোড করতে ব্যর্থ");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (exam_id) {
      fetchExamAndQuestions();
    }
  }, [exam_id, toast]);

  if (loading) {
    return (
      <div className="container mx-auto p-2 md:p-4 space-y-6">
        <PageHeader
          title="প্রশ্নসমূহ লোড হচ্ছে..."
          description=""
        />
        <Card>
          <CardContent className="py-8 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            লোড হচ্ছে...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 md:p-4 space-y-6">
      <PageHeader
        title={`প্রশ্নসমূহ - ${exam?.name || "অজানা পরীক্ষা"}`}
        description="এই পরীক্ষার প্রশ্নগুলি PHP ব্যাকএন্ড থেকে পরিবেশন করা হয়।"
      />

      {error && (
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="py-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span>{error}</span>
          </CardContent>
        </Card>
      )}

      <Card className="border-l-4 border-l-blue-500 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-base">প্রশ্ন ব্যবস্থাপনা PHP ব্যাকএন্ডে</CardTitle>
          <CardDescription>
            সমস্ত প্রশ্ন সম্পাদনা এবং ব্যবস্থাপনা এখন PHP সার্ভারে করা হয়।
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            এই পরীক্ষায় সংযুক্ত প্রশ্নগুলি পরিবর্তন করতে, অনুগ্রহ করে:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>PHP ব্যাকএন্ডে যান: <strong>https://csv.mnr.world</strong></li>
            <li>প্রশ্ন সেট আপডেট করুন</li>
            <li>পরিবর্তনগুলি স্বয়ংক্রিয়ভাবে এখানে প্রতিফলিত হবে</li>
          </ol>
          <div className="mt-4 p-3 bg-white rounded border border-blue-200">
            <p className="font-mono text-xs">
              Exam ID: <span className="font-bold">{exam?.id}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <EmptyState
        icon={<AlertCircle className="h-12 w-12 text-primary" />}
        title="প্রশ্ন সম্পাদনা অক্ষম"
        description="প্রশ্নগুলি এখন শুধুমাত্র PHP ব্যাকএন্ড থেকে পরিবেশন করা হয়। এখানে কোনো সম্পাদনা সম্ভব নয়।"
      />
    </div>
  );
}
