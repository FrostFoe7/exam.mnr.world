"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { PageHeader, EmptyState } from "@/components";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BarChart3,
  Loader2,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";
import type { Exam } from "@/lib/types";

interface ExamResult {
  id: string;
  exam_id: string;
  exam_name: string;
  score: number;
  correct_answers: number;
  wrong_answers: number;
  unattempted: number;
  submitted_at: string;
}

export default function ResultsPage() {
  const { user, loading: authLoading } = useAuth();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [exams, setExams] = useState<Record<string, Exam>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "score">("recent");
  const [page, setPage] = useState(0);
  const RESULTS_PER_PAGE = 10;

  useEffect(() => {
    if (!authLoading && user?.uid) {
      fetchResults();
    } else if (!authLoading && !user) {
      setError("অনুগ্রহ করে লগইন করুন");
    }
  }, [user?.uid, authLoading]);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch paginated student exam results with limit
      const { data: allStudentExams, error: resultsError } = await supabase
        .from("student_exams")
        .select("*")
        .eq("student_id", user?.uid)
        .order("submitted_at", { ascending: true })
        .limit(100); // Fetch up to 100 instead of all

      if (resultsError) {
        setError("ফলাফল আনতে ব্যর্থ");
        return;
      }

      if (!allStudentExams || allStudentExams.length === 0) {
        setResults([]);
        return;
      }

      // Filter to keep only the first attempt for each exam
      const studentExams: any[] = [];
      const seenExamIds = new Set();

      for (const exam of allStudentExams) {
        if (!seenExamIds.has(exam.exam_id)) {
          seenExamIds.add(exam.exam_id);
          studentExams.push(exam);
        }
      }

      // Get all unique exam_ids to fetch exam details
      const examIds = studentExams.map((r: any) => r.exam_id);

      // Fetch exam details
      const { data: examsData, error: examsError } = await supabase
        .from("exams")
        .select("*")
        .in("id", examIds);

      if (examsError) {
        console.error("Error fetching exams:", examsError);
      }

      // Create exam lookup
      const examLookup: Record<string, Exam> = {};
      if (examsData) {
        examsData.forEach((exam: Exam) => {
          examLookup[exam.id] = exam;
        });
      }
      setExams(examLookup);

      // Transform results
      const transformedResults: ExamResult[] = studentExams.map(
        (result: any) => ({
          id: result.id,
          exam_id: result.exam_id,
          exam_name: examLookup[result.exam_id]?.name || "অজানা পরীক্ষা",
          score: result.score,
          correct_answers: result.correct_answers,
          wrong_answers: result.wrong_answers,
          unattempted: result.unattempted,
          submitted_at: result.submitted_at,
        }),
      );

      setResults(transformedResults);
    } catch (err) {
      console.error("Error:", err);
      setError("ডেটা লোড করতে ত্রুটি হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-300";
    if (score >= 60) return "bg-blue-100 text-blue-800 border-blue-300";
    if (score >= 40) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  const getScoreFeedback = (score: number) => {
    if (score >= 80) return "চমৎকার পারফরম্যান্স!";
    if (score >= 60) return "ভালো পারফরম্যান্স";
    if (score >= 40) return "সন্তোষজনক";
    return "আরও অনুশীলন প্রয়োজন";
  };

  const getScoreFeedbackIcon = (score: number) => {
    if (score >= 80) return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <TrendingUp className="h-5 w-5 text-blue-600" />;
    if (score >= 40) return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === "score") {
      return b.score - a.score;
    }
    return (
      new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    );
  });

  const totalAttempts = results.length;
  const averageScore =
    results.length > 0
      ? Math.round(
          results.reduce((sum, r) => sum + r.score, 0) / results.length,
        )
      : 0;
  const bestScore =
    results.length > 0 ? Math.max(...results.map((r) => r.score)) : 0;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("bn-BD", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading) {
    return (
      <div className="container mx-auto p-2 md:p-4">
        <PageHeader title="ফলাফল" description="লোড হচ্ছে..." />
        <Card>
          <CardContent className="py-8 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            লোড হচ্ছে...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-2 md:p-4 space-y-6">
        <PageHeader title="ফলাফল" description="" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>অনুগ্রহ করে লগইন করুন</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-2 md:p-4">
        <PageHeader title="ফলাফল" description="লোড হচ্ছে..." />
        <Card>
          <CardContent className="py-8 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            ফলাফল লোড হচ্ছে...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-2 md:p-4 space-y-6">
        <PageHeader title="ফলাফল" description="" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="container mx-auto p-2 md:p-4 space-y-6">
        <PageHeader
          title="ফলাফল"
          description="আপনার পরীক্ষার ফলাফল এবং পরিসংখ্যান"
        />
        <EmptyState
          icon={<BarChart3 className="h-12 w-12 text-primary" />}
          title="কোনো ফলাফল পাওয়া যায়নি"
          description="এখনও কোনো পরীক্ষার ফলাফল নেই। পরীক্ষা দিন এবং আপনার ফলাফল দেখুন।"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 md:p-4 space-y-6">
      <PageHeader
        title="ফলাফল"
        description="আপনার পরীক্ষার ফলাফল এবং পরিসংখ্যান"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2 text-center">
              <p className="text-sm text-muted-foreground">মোট পরীক্ষা</p>
              <p className="text-3xl font-bold text-primary">{totalAttempts}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2 text-center">
              <p className="text-sm text-muted-foreground">গড় স্কোর</p>
              <p className="text-3xl font-bold text-blue-600">
                {averageScore}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2 text-center">
              <p className="text-sm text-muted-foreground">সর্বোচ্চ স্কোর</p>
              <p className="text-3xl font-bold text-green-600">{bestScore}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>বিস্তারিত ফলাফল</CardTitle>
              <CardDescription>সব পরীক্ষার ফলাফল</CardDescription>
            </div>
            <Tabs
              value={sortBy}
              onValueChange={(v) => setSortBy(v as "recent" | "score")}
            >
              <TabsList>
                <TabsTrigger value="recent">সাম্প্রতিক</TabsTrigger>
                <TabsTrigger value="score">স্কোর</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedResults.map((result) => (
              <div key={result.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {result.exam_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(result.submitted_at)}
                    </p>
                  </div>
                  <Badge
                    className={`text-base px-3 py-1 ${getScoreBadgeColor(result.score)}`}
                  >
                    {result.score.toFixed(2)}%
                  </Badge>
                </div>

                {/* Score Feedback */}
                <div className="flex items-center gap-2">
                  {getScoreFeedbackIcon(result.score)}
                  <span className="text-sm font-medium">
                    {getScoreFeedback(result.score)}
                  </span>
                </div>

                {/* Score Bar */}
                <Progress value={result.score} className="h-2" />

                {/* Statistics */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">সঠিক</p>
                    <p className="text-lg font-bold text-green-600">
                      {result.correct_answers}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">ভুল</p>
                    <p className="text-lg font-bold text-red-600">
                      {result.wrong_answers}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">চেষ্টা করেননি</p>
                    <p className="text-lg font-bold text-gray-600">
                      {result.unattempted}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
