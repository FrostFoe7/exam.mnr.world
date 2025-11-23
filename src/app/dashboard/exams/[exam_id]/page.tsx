"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { csvApi } from "@/lib/csvApi";
import { Button } from "@/components/ui/button";
import { AnimatedIconButton } from "@/components/AnimatedIconButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Exam, Question } from "@/lib/types";
import {
  Loader2,
  Clock,
  Flag,
  ArrowLeft,
  Eye,
  ArrowRight,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  BarChart3,
  Zap,
} from "lucide-react";

function renderQuestionContent(content: string) {
  const imgRegex = /<img[^>]+src="([^">]+)"[^>]*>/g;
  const images: string[] = [];
  let match;

  while ((match = imgRegex.exec(content)) !== null) {
    images.push(match[1]);
  }

  // Remove img tags but keep other HTML tags for formatting (sup, sub, b, i, etc.)
  // We still remove <br> because we might handle spacing via CSS, but keeping it is also fine.
  // Let's keep <br> as newline for textContent if we were stripping, but for HTML we keep it.

  const htmlContent = content
    .replace(/<img[^>]*>/g, "") // Remove images as they are handled separately
    .trim();

  return { htmlContent, images };
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  return `${minutes}m ${secs}s`;
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export default function TakeExamPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authContextLoading } = useAuth();
  const exam_id = params.exam_id as string;
  const { toast } = useToast();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: number;
  }>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(
    new Set(),
  );
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [negativeMarks, setNegativeMarks] = useState(0);

  const QUESTIONS_PER_PAGE = 50;

  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const startIndex = currentPageIndex * QUESTIONS_PER_PAGE;
  const endIndex = startIndex + QUESTIONS_PER_PAGE;
  const currentPageQuestions = questions.slice(startIndex, endIndex);

  useEffect(() => {
    if (!submitted && timeLeft !== null) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 0) {
            clearInterval(timer);
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [submitted, timeLeft]);

  useEffect(() => {
    if (!loading && timeLeft === null && exam?.duration_minutes) {
      setTimeLeft(exam.duration_minutes * 60);
    }
  }, [loading, timeLeft, exam?.duration_minutes]);

  useEffect(() => {
    if (exam_id) {
      fetchExam();
    }
  }, [exam_id]);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!authContextLoading && user?.uid && exam?.batch_id) {
        setAuthLoading(true);
        try {
          const { data: userData, error } = await supabase
            .from("users")
            .select("enrolled_batches")
            .eq("uid", user.uid)
            .single();

          if (error) {
            console.error("Error checking authorization:", error);
            setIsAuthorized(false);
          } else {
            const isEnrolled = userData?.enrolled_batches?.includes(
              exam.batch_id,
            );
            setIsAuthorized(!!isEnrolled);
          }
        } finally {
          setAuthLoading(false);
        }
      } else if (!user && !authContextLoading) {
        router.push("/login");
      }
    };

    checkAuthorization();
  }, [user?.uid, exam?.batch_id, authContextLoading, router]);

  const fetchExam = async () => {
    setLoading(true);
    try {
      // Fetch exam from Supabase
      const { data: examData, error: examError } = await supabase
        .from("exams")
        .select("*")
        .eq("id", exam_id)
        .single();

      if (examError) {
        console.error("Error fetching exam:", examError);
        setLoading(false);
        return;
      }

      setExam(examData);

      // Fetch questions from PHP API
      // If exam has a file_id, use it to fetch specific questions
      // Otherwise fetch all (legacy behavior)
      console.log(
        "Fetching questions for exam:",
        examData.id,
        "file_id:",
        examData.file_id,
      );

      if (!examData.file_id) {
        console.warn(
          "No file_id found for exam. This exam might be using the legacy system or is not configured correctly.",
        );
        // Optional: You might want to show a UI warning here
        // toast({ title: "সতর্কতা", description: "এই পরীক্ষার সাথে কোনো প্রশ্ন ফাইল যুক্ত নেই।", variant: "destructive" });
      }

      const result = await csvApi.fetchQuestions(examData.file_id);

      if (result.success && result.data?.questions) {
        // Convert PHP API format to internal format
        const convertedQuestions = result.data.questions.map((q: any) => {
          // Handle numeric answer (1-based) or letter answer (A-based)
          let answerIndex = -1;
          if (!isNaN(parseInt(q.answer))) {
            answerIndex = parseInt(q.answer) - 1;
          } else {
            const answerLetter = (q.answer || q.correct || "A")
              .toString()
              .toUpperCase();
            answerIndex = answerLetter.charCodeAt(0) - 65;
          }

          // Use provided options array if available, otherwise construct it
          const options =
            q.options && Array.isArray(q.options) && q.options.length > 0
              ? q.options
              : [q.option1, q.option2, q.option3, q.option4, q.option5].filter(
                  Boolean,
                );

          return {
            id: q.id, // Use UUID directly
            uid: q.uid, // Keep for legacy if needed, but prefer id
            question: q.question || q.question_text || "",
            options: options,
            answer: answerIndex,
            explanation: q.explanation || "",
            type: q.type,
            section: q.section,
          };
        });
        setQuestions(shuffleArray(convertedQuestions));
      } else {
        console.error("Failed to fetch questions:", result.message);
        toast({
          title: "প্রশ্ন লোড করতে সমস্যা হয়েছে",
          description: result.message || "অনুগ্রহ করে আবার চেষ্টা করুন",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    if (!questionId) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionIndex,
    });
    setMarkedForReview((prev) => {
      const newSet = new Set(prev);
      newSet.delete(questionId);
      return newSet;
    });
  };

  const toggleMarkForReview = (questionId: string) => {
    setMarkedForReview((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleSubmitExam = async () => {
    setIsSubmitting(true);
    let correctAnswers = 0;
    let wrongAnswers = 0;

    questions.forEach((q) => {
      if (q.id && selectedAnswers[q.id] === q.answer) {
        correctAnswers++;
      } else if (q.id && selectedAnswers[q.id] !== undefined) {
        wrongAnswers++;
      }
    });

    const negativeMarksPerWrong = exam?.negative_marks_per_wrong || 0;
    const totalNegativeMarks = wrongAnswers * negativeMarksPerWrong;
    const totalMarks = correctAnswers - totalNegativeMarks;
    const finalScore = (totalMarks / questions.length) * 100;

    setNegativeMarks(totalNegativeMarks);
    setScore(finalScore);

    if (user) {
      const { error } = await supabase.from("student_exams").insert([
        {
          exam_id,
          student_id: user.uid,
          score: Math.max(0, finalScore),
          correct_answers: correctAnswers,
          wrong_answers: wrongAnswers,
          unattempted: questions.length - correctAnswers - wrongAnswers,
        },
      ]);
      if (error) {
        toast({
          title: "স্কোর জমা দিতে সমস্যা হয়েছে",
          variant: "destructive",
        });
      } else {
        toast({ title: "পরীক্ষা সফলভাবে জমা হয়েছে!" });
      }
    }
    setSubmitted(true);
    setIsSubmitting(false);
  };

  const getAnswerStatus = (questionId: string) => {
    if (markedForReview.has(questionId)) return "marked";
    if (selectedAnswers[questionId] !== undefined) return "attempted";
    return "unattempted";
  };

  if (authLoading) {
    return <p>অনুমতি যাচাই করা হচ্ছে...</p>;
  }

  if (!isAuthorized) {
    return (
      <div className="container mx-auto p-2 md:p-4 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>অনুমতি নেই</CardTitle>
            <CardDescription>
              এই পরীক্ষায় অংশগ্রহণের জন্য আপনার অনুমতি নেই।
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()} className="mt-6">
              ফিরে যান
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <p>পরীক্ষা লোড হচ্ছে...</p>;
  }

  if (submitted) {
    const correctAnswers = Object.values(selectedAnswers).filter(
      (ans, idx) => ans === questions[idx]?.answer,
    ).length;
    const wrongAnswers = Object.keys(selectedAnswers).length - correctAnswers;
    const unattempted = questions.length - Object.keys(selectedAnswers).length;
    const negativeMarksPerWrong = exam?.negative_marks_per_wrong || 0;

    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/50 flex items-center justify-center p-2 md:p-4">
        <div className="w-full max-w-2xl space-y-6">
          <Card className="border-0 shadow-2xl overflow-hidden bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="p-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-success/20 blur-2xl rounded-full"></div>
                  <CheckCircle2 className="h-16 w-16 text-success relative" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">পরীক্ষা সম্পন্ন!</h1>
                <p className="text-muted-foreground text-lg">
                  আপনার ফলাফল নিচে দেখুন
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <p className="text-sm font-semibold text-muted-foreground mb-2">
                আপনার মোট স্কোর
              </p>
              <div className="space-y-2">
                <div className="text-6xl font-black bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {score.toFixed(2)}%
                </div>
                <Progress value={score} className="h-3" />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-success">
              <CardContent className="p-6 space-y-2">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-semibold">সঠিক উত্তর</span>
                </div>
                <p className="text-3xl font-bold text-success">
                  {correctAnswers}
                </p>
                <p className="text-xs text-muted-foreground">
                  মোট {questions.length} এর মধ্যে
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-destructive">
              <CardContent className="p-6 space-y-2">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm font-semibold">ভুল উত্তর</span>
                </div>
                <p className="text-3xl font-bold text-destructive">
                  {wrongAnswers}
                </p>
                <p className="text-xs text-muted-foreground">
                  -{(wrongAnswers * negativeMarksPerWrong).toFixed(1)} মার্ক
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-warning">
              <CardContent className="p-6 space-y-2">
                <div className="flex items-center gap-2 text-warning">
                  <HelpCircle className="h-5 w-5" />
                  <span className="text-sm font-semibold">চেষ্টা করেননি</span>
                </div>
                <p className="text-3xl font-bold text-warning">{unattempted}</p>
                <p className="text-xs text-muted-foreground">কোন মার্ক নেই</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-6 space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <Zap className="h-5 w-5" />
                  <span className="text-sm font-semibold">নেগেটিভ মার্ক</span>
                </div>
                <p className="text-3xl font-bold text-primary">
                  -{negativeMarks.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">
                  প্রতি ভুলে {negativeMarksPerWrong}
                </p>
              </CardContent>
            </Card>
          </div>
          <Alert
            className={`border-l-4 ${
              score >= 75
                ? "border-l-success bg-success/5"
                : score >= 50
                  ? "border-l-warning bg-warning/5"
                  : "border-l-destructive bg-destructive/5"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>ফিডব্যাক:</strong>{" "}
              {score >= 75
                ? " চমৎকার! আপনি খুব ভালো করেছেন। এই মানের পরীক্ষা চালিয়ে যান।"
                : score >= 50
                  ? " ভালো! আরও বেশি অনুশীলন করুন এবং পরবর্তী পরীক্ষায় আরও ভালো করতে পারবেন।"
                  : " আরও বেশি মনোযোগ দিয়ে পড়ুন এবং পরবর্তী পরীক্ষায় আরও ভালো করুন।"}
            </AlertDescription>
          </Alert>

          <div className="space-y-6 mt-8">
            <h2 className="text-2xl font-bold text-center">বিস্তারিত ফলাফল</h2>
            {questions.map((question, index) => {
              const userAnswer = selectedAnswers[question.id!];
              const correctAnswer = question.answer;
              const isCorrect = userAnswer === correctAnswer;
              const isSkipped = userAnswer === undefined;
              const { htmlContent, images } = renderQuestionContent(
                question.question,
              );

              return (
                <Card
                  key={question.id}
                  className={`mb-4 ${
                    isCorrect
                      ? "bg-success/5"
                      : isSkipped
                        ? "bg-warning/5"
                        : "bg-destructive/5"
                  }`}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-2">
                        <Badge
                          variant={
                            isCorrect
                              ? "default"
                              : isSkipped
                                ? "outline"
                                : "destructive"
                          }
                          className={
                            isCorrect
                              ? "bg-success"
                              : isSkipped
                                ? "text-warning border-warning"
                                : ""
                          }
                        >
                          {isCorrect
                            ? "সঠিক"
                            : isSkipped
                              ? "উত্তর করা হয়নি"
                              : "ভুল"}
                        </Badge>
                        <h3 className="text-lg font-semibold">
                          <span className="mr-2">{index + 1}.</span>
                          <span
                            dangerouslySetInnerHTML={{ __html: htmlContent }}
                          />
                        </h3>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {images.length > 0 && (
                      <div className="p-2 bg-white rounded border">
                        {images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt="Question"
                            className="max-w-full h-auto"
                          />
                        ))}
                      </div>
                    )}

                    <div className="grid gap-2">
                      {(Array.isArray(question.options)
                        ? question.options
                        : Object.values(question.options)
                      ).map((option, optIdx) => {
                        const isSelected = userAnswer === optIdx;
                        const isRightAnswer = correctAnswer === optIdx;
                        const bengaliLetters = [
                          "ক",
                          "খ",
                          "গ",
                          "ঘ",
                          "ঙ",
                          "চ",
                          "ছ",
                          "জ",
                        ];

                        let optionClass =
                          "p-3 rounded-lg border flex items-center gap-3 ";
                        if (isRightAnswer) {
                          optionClass +=
                            "bg-success/20 border-success text-success-foreground font-medium";
                        } else if (isSelected && !isRightAnswer) {
                          optionClass +=
                            "bg-destructive/20 border-destructive text-destructive-foreground font-medium";
                        } else {
                          optionClass += "bg-background border-muted";
                        }

                        return (
                          <div key={optIdx} className={optionClass}>
                            <div
                              className={`w-6 h-6 rounded-full border flex items-center justify-center text-sm ${
                                isRightAnswer
                                  ? "border-success bg-success text-white"
                                  : isSelected
                                    ? "border-destructive bg-destructive text-white"
                                    : "border-muted"
                              }`}
                            >
                              {bengaliLetters[optIdx] ||
                                String.fromCharCode(65 + optIdx)}
                            </div>
                            <span
                              dangerouslySetInnerHTML={{ __html: option }}
                            />
                            {isRightAnswer && (
                              <CheckCircle2 className="h-4 w-4 text-success ml-auto" />
                            )}
                            {isSelected && !isRightAnswer && (
                              <AlertCircle className="h-4 w-4 text-destructive ml-auto" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {question.explanation && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm">
                        <p className="font-semibold mb-1">ব্যাখ্যা:</p>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: question.explanation,
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex-1 h-12"
              size="lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              পিছনে যান
            </Button>
            <Button
              onClick={() => router.push("/dashboard")}
              className="flex-1 h-12"
              size="lg"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              ড্যাশবোর্ডে যান
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const attemptedCount = Object.keys(selectedAnswers).length;
  const unattemptedCount = questions.length - attemptedCount;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      {timeLeft !== null && (
        <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto p-2 md:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <BookOpen className="h-5 w-5" />
                <div>
                  <h2 className="font-semibold">{exam?.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    পৃষ্ঠা {currentPageIndex + 1} / {totalPages}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold transition-all ${
                    (timeLeft || 0) < 300
                      ? "bg-destructive/20 text-destructive animate-pulse"
                      : "bg-primary/20 text-primary"
                  }`}
                >
                  <Clock className="h-5 w-5" />
                  <span>{formatTime(timeLeft || 0)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">
                    {attemptedCount}/{questions.length}
                  </span>
                </div>
              </div>
            </div>

            <Progress
              value={(attemptedCount / questions.length) * 100}
              className="mt-3 h-1"
            />
          </div>
        </div>
      )}

      <div className="container mx-auto p-2 md:p-4 pb-8">
        <div>
          <Tabs defaultValue="questions" className="w-full">
            <TabsList className="grid w-full grid-cols-1 mb-6">
              <TabsTrigger
                value="questions"
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                <span>প্রশ্ন</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="space-y-6">
              {currentPageQuestions.map((question, pageIndex) => {
                const globalIndex = startIndex + pageIndex;
                const status = getAnswerStatus(question.id!);
                const isAnswered = selectedAnswers[question.id!] !== undefined;

                return (
                  <Card
                    key={question.id}
                    id={`question-${question.id}`}
                    className="overflow-hidden"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="secondary">
                              প্রশ্ন {globalIndex + 1}
                            </Badge>
                            {isAnswered && (
                              <Badge variant="default" className="bg-success">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                উত্তরিত
                              </Badge>
                            )}
                            {status === "marked" && (
                              <Badge variant="outline" className="text-warning">
                                <Flag className="h-3 w-3 mr-1" />
                                পর্যালোচনা
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold leading-relaxed">
                            {(() => {
                              const { htmlContent } = renderQuestionContent(
                                question.question,
                              );
                              return (
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: htmlContent,
                                  }}
                                />
                              );
                            })()}
                          </h3>
                        </div>
                        <Button
                          variant={status === "marked" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => toggleMarkForReview(question.id!)}
                          className={status === "marked" ? "bg-warning" : ""}
                        >
                          <Flag className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {(() => {
                        const { images } = renderQuestionContent(
                          question.question,
                        );
                        return (
                          images.length > 0 && (
                            <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                              {images.map((imgUrl, idx) => (
                                <img
                                  key={idx}
                                  src={imgUrl}
                                  alt={`Question ${globalIndex + 1}`}
                                  className="max-w-full h-auto rounded border"
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                              ))}
                            </div>
                          )
                        );
                      })()}

                      <RadioGroup
                        value={
                          question.id &&
                          selectedAnswers[question.id!] !== undefined
                            ? selectedAnswers[question.id!].toString()
                            : ""
                        }
                        onValueChange={(value) =>
                          handleAnswerSelect(question.id!, parseInt(value))
                        }
                      >
                        <div className="space-y-3">
                          {(Array.isArray(question.options)
                            ? question.options
                            : Object.values(question.options || {})
                          ).map((option: string, index: number) => {
                            const bengaliLetters = [
                              "ক",
                              "খ",
                              "গ",
                              "ঘ",
                              "ঙ",
                              "চ",
                              "ছ",
                              "জ",
                            ];
                            const letter =
                              bengaliLetters[index] ||
                              String.fromCharCode(65 + index);

                            return (
                              <label
                                key={index}
                                className={`flex items-start space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                  selectedAnswers[question.id!] === index
                                    ? "border-primary bg-primary/5"
                                    : "border-muted hover:border-primary/50"
                                }`}
                              >
                                <div className="flex-shrink-0 pt-0.5">
                                  <div
                                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${
                                      selectedAnswers[question.id!] === index
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-muted-foreground/30 bg-muted/30 text-foreground"
                                    }`}
                                  >
                                    {letter}
                                  </div>
                                </div>
                                <input
                                  type="radio"
                                  value={index.toString()}
                                  id={`q${question.id}-o${index}`}
                                  checked={
                                    selectedAnswers[question.id!] === index
                                  }
                                  onChange={() =>
                                    handleAnswerSelect(question.id!, index)
                                  }
                                  className="hidden"
                                />
                                <span className="flex-1 text-base font-medium">
                                  <span
                                    dangerouslySetInnerHTML={{
                                      __html: option,
                                    }}
                                  />
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>
                );
              })}

              <div className="flex justify-between items-center gap-4 pt-6">
                <AnimatedIconButton
                  icon={ArrowLeft}
                  label="পূর্ববর্তী"
                  onClick={() =>
                    setCurrentPageIndex(Math.max(0, currentPageIndex - 1))
                  }
                  disabled={currentPageIndex === 0 || isSubmitting}
                />

                <div className="text-sm font-semibold text-muted-foreground">
                  {currentPageIndex + 1} / {totalPages}
                </div>

                {currentPageIndex < totalPages - 1 ? (
                  <AnimatedIconButton
                    icon={ArrowRight}
                    label="পরবর্তী"
                    onClick={() =>
                      setCurrentPageIndex(
                        Math.min(totalPages - 1, currentPageIndex + 1),
                      )
                    }
                    disabled={isSubmitting}
                  />
                ) : (
                  <AnimatedIconButton
                    icon={isSubmitting ? Loader2 : Send}
                    label={isSubmitting ? "জমা দেওয়া হচ্ছে..." : "জমা দিন"}
                    onClick={handleSubmitExam}
                    disabled={isSubmitting}
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Button
        onClick={() => setShowReviewDialog(true)}
        variant="default"
        className="fixed bottom-8 right-8 z-50 h-16 w-16 rounded-full shadow-lg"
        aria-label="পর্যালোচনা খুলুন"
      >
        <Eye className="h-8 w-8" />
      </Button>

      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              সমস্ত প্রশ্ন পর্যালোচনা করুন
            </DialogTitle>
            <DialogDescription>
              নিম্নে ক্লিক করে যেকোনো প্রশ্নে লাফ দিন
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">প্রশ্ন নেভিগেশন</h3>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {questions.map((q, idx) => {
                  const status = getAnswerStatus(q.id!);
                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        const pageForQuestion = Math.floor(
                          idx / QUESTIONS_PER_PAGE,
                        );
                        setCurrentPageIndex(pageForQuestion);
                        setShowReviewDialog(false);

                        // Wait for state update and render
                        setTimeout(() => {
                          const element = document.getElementById(
                            `question-${q.id}`,
                          );
                          if (element) {
                            element.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                          }
                        }, 100);
                      }}
                      className={`aspect-square rounded-lg font-semibold text-sm flex items-center justify-center transition-all ${
                        status === "attempted"
                          ? "bg-success text-success-foreground shadow-lg"
                          : status === "marked"
                            ? "bg-warning text-warning-foreground shadow-lg"
                            : "bg-muted text-muted-foreground"
                      }`}
                      title={`প্রশ্ন ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-success rounded"></div>
                  <span className="text-sm font-medium">চেষ্টা করেছেন</span>
                </div>
                <p className="text-2xl font-bold">{attemptedCount}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-warning rounded"></div>
                  <span className="text-sm font-medium">
                    পর্যালোচনার জন্য চিহ্নিত
                  </span>
                </div>
                <p className="text-2xl font-bold">{markedForReview.size}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-muted rounded"></div>
                  <span className="text-sm font-medium">চেষ্টা করেননি</span>
                </div>
                <p className="text-2xl font-bold">{unattemptedCount}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
