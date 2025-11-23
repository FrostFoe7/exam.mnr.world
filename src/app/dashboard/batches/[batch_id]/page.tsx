"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExamCard } from "@/components/ExamCard";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Batch, Exam, StudentExam } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PageHeader, LoadingSpinner } from "@/components";

export default function StudentBatchExamsPage() {
  const params = useParams();
  const router = useRouter();
  const batch_id = params.batch_id as string;
  const { user, loading: authLoading } = useAuth();

  const [batch, setBatch] = useState<Batch | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [examResults, setExamResults] = useState<Record<string, StudentExam>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (user?.uid && batch_id) {
        verifyAndFetch();
      } else {
        router.push("/login");
      }
    }
  }, [batch_id, user, authLoading, router]);

  const verifyAndFetch = async () => {
    setLoading(true);
    setIsAuthorized(null);
    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("enrolled_batches")
        .eq("uid", user!.uid)
        .single();

      if (userError || !userData?.enrolled_batches?.includes(batch_id)) {
        setIsAuthorized(false);
        return;
      }

      setIsAuthorized(true);

      const batchPromise = supabase
        .from("batches")
        .select("*")
        .eq("id", batch_id)
        .single();

      const examsPromise = supabase
        .from("exams")
        .select("*")
        .eq("batch_id", batch_id);

      const [batchResult, examsResult] = await Promise.all([
        batchPromise,
        examsPromise,
      ]);

      if (batchResult.error) {
        console.error("Error fetching batch details:", batchResult.error);
      } else {
        setBatch(batchResult.data);
      }

      if (examsResult.error) {
        console.error("Error fetching exams:", examsResult.error);
      } else {
        setExams(examsResult.data);

        // Fetch results for these exams
        if (examsResult.data && examsResult.data.length > 0) {
          const examIds = examsResult.data.map((e: Exam) => e.id);
          const { data: resultsData, error: resultsError } = await supabase
            .from("student_exams")
            .select("*")
            .eq("student_id", user!.uid)
            .in("exam_id", examIds);

          if (resultsError) {
            console.error("Error fetching exam results:", resultsError);
          } else if (resultsData) {
            const resultsMap: Record<string, StudentExam> = {};
            resultsData.forEach((r: StudentExam) => {
              resultsMap[r.exam_id] = r;
            });
            setExamResults(resultsMap);
          }
        }
      }
    } catch (error) {
      console.error("Error during verification and fetch:", error);
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading || isAuthorized === null) {
    return <LoadingSpinner message="পরীক্ষা লোড হচ্ছে..." />;
  }

  if (!isAuthorized) {
    return (
      <div className="container mx-auto p-4 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>অনুমতি নেই</CardTitle>
            <CardDescription>এই ব্যাচে আপনার অ্যাক্সেস নেই।</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard/batches")}>
              আমার ব্যাচসমূহে ফিরুন
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 md:p-4 space-y-6">
      <PageHeader
        title={`পরীক্ষাসমূহ - ${batch?.name}`}
        description="এই ব্যাচের অন্তর্ভুক্ত পরীক্ষাসমূহ।"
      />
      {exams.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam, idx) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              index={idx}
              result={examResults[exam.id]}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p>এই ব্যাচে এখনও কোনো পরীক্ষা যোগ করা হয়নি।</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
