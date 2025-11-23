"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import type { Batch, Exam, Question, User } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { EditExamModal } from "@/components/EditExamModal";

interface BatchDetailsClientProps {
  initialBatch: Batch;
  initialExams: Exam[];
  initialEnrolledStudents: User[];
}

export function BatchDetailsClient({
  initialBatch,
  initialExams,
  initialEnrolledStudents,
}: BatchDetailsClientProps) {
  const { toast } = useToast();

  const [batch] = useState<Batch | null>(initialBatch);
  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [newExamName, setNewExamName] = useState("");
  const [newExamDuration, setNewExamDuration] = useState("120");
  const [newExamNegativeMarks, setNewExamNegativeMarks] = useState("0.5");
  const [newExamQuestionsId, setNewExamQuestionsId] = useState("");
  const [isSubmittingExam, setIsSubmittingExam] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState<User[]>(
    initialEnrolledStudents,
  );
  const [newStudentRoll, setNewStudentRoll] = useState("");
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const batch_id = batch?.id;

  const handleAddExam = async (e: FormEvent) => {
    e.preventDefault();
    if (!newExamName.trim()) {
      toast({
        title: "পরীক্ষার নাম আবশ্যক",
        variant: "destructive",
      });
      return;
    }
    if (!batch_id) {
        toast({ title: "ব্যাচ আইডি পাওয়া যায়নি!", variant: "destructive" });
        return;
    }

    setIsSubmittingExam(true);

    try {
      const examData = {
        name: newExamName.trim(),
        batch_id,
        duration_minutes: parseInt(newExamDuration, 10),
        negative_marks_per_wrong: parseFloat(newExamNegativeMarks),
        file_id: newExamQuestionsId.trim() || null,
      };

      const { data: createdExam, error: examError } = await supabase
        .from("exams")
        .insert([examData])
        .select()
        .single();

      if (examError) {
        throw examError;
      }

      setExams((prevExams) => [...prevExams, createdExam]);
      setNewExamName("");
      setNewExamDuration("120");
      setNewExamNegativeMarks("0.5");
      setNewExamQuestionsId("");
      toast({
        title: "পরীক্ষা সফলভাবে যোগ করা হয়েছে",
        description: "প্রশ্নগুলি PHP ব্যাকএন্ড থেকে পরিবেশন করা হবে।",
      });
    } catch (error: unknown) {
      console.error("Error adding exam:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        title: "পরীক্ষা যোগ করতে সমস্যা হয়েছে",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingExam(false);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    const { error } = await supabase.from("exams").delete().eq("id", examId);
    if (error) {
      console.error("Error deleting exam:", error);
      toast({
        title: "পরীক্ষা মুছে ফেলতে সমস্যা হয়েছে",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setExams(exams.filter((exam) => exam.id !== examId));
      toast({
        title: "পরীক্ষা সফলভাবে মুছে ফেলা হয়েছে",
      });
    }
  };

  const handleAddStudent = async (e: FormEvent) => {
    e.preventDefault();
    if (!newStudentRoll.trim() || !batch_id) {
      toast({
        title: "ছাত্রছাত্রীর রোল এবং ব্যাচ আইডি আবশ্যক",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingStudent(true);

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("roll", newStudentRoll.trim())
      .single();

    if (userError || !user) {
      toast({
        title: "ছাত্রছাত্রী খুঁজে পাওয়া যায়নি",
        description: `রোল ${newStudentRoll.trim()} সহ কোনো ছাত্রছাত্রী পাওয়া যায়নি।`,
        variant: "destructive",
      });
      setIsSubmittingStudent(false);
      return;
    }

    if (user.enrolled_batches && user.enrolled_batches.includes(batch_id)) {
      toast({
        title: "ছাত্রছাত্রী ইতিমধ্যে ভর্তি আছে",
        description: `রোল ${newStudentRoll.trim()} সহ ছাত্রছাত্রী এই ব্যাচে ইতিমধ্যে ভর্তি আছে।`,
        variant: "destructive",
      });
      setIsSubmittingStudent(false);
      return;
    }

    const updatedBatches = user.enrolled_batches
      ? [...user.enrolled_batches, batch_id]
      : [batch_id];

    const { data, error } = await supabase
      .from("users")
      .update({ enrolled_batches: updatedBatches })
      .eq("uid", user.uid)
      .select()
      .single();

    if (error) {
      console.error("Error adding student:", error);
      toast({
        title: "ছাত্রছাত্রী যোগ করতে সমস্যা হয়েছে",
        description: error.message,
        variant: "destructive",
      });
    } else if (data) {
      setEnrolledStudents([...enrolledStudents, data]);
      setNewStudentRoll("");
      toast({
        title: "ছাত্রছাত্রী সফলভাবে যোগ করা হয়েছে",
      });
    }
    setIsSubmittingStudent(false);
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!batch_id) return;
    const studentToRemove = enrolledStudents.find((s) => s.uid === studentId);
    if (!studentToRemove) return;

    const updatedBatches = studentToRemove.enrolled_batches.filter(
      (id) => id !== batch_id,
    );

    const { error } = await supabase
      .from("users")
      .update({ enrolled_batches: updatedBatches })
      .eq("uid", studentId);

    if (error) {
      console.error("Error deleting student:", error);
      toast({
        title: "ছাত্রছাত্রী মুছে ফেলতে সমস্যা হয়েছে",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setEnrolledStudents(
        enrolledStudents.filter((student) => student.uid !== studentId),
      );
      toast({
        title: "ছাত্রছাত্রী সফলভাবে মুছে ফেলা হয়েছে",
      });
    }
  };

  if (!batch) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <span>ব্যাচের বিবরণ লোড হচ্ছে...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 md:p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ব্যাচের তথ্য - {batch.name}</CardTitle>
          <CardDescription>ব্যাচের বিবরণ এবং অবস্থা দেখুন।</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">ব্যাচের নাম</p>
              <p className="text-lg font-semibold">{batch.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">অবস্থা</p>
              <span
                className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                  batch.status === "live"
                    ? "bg-green-500/20 text-green-700"
                    : "bg-gray-500/20 text-gray-700"
                }`}
              >
                {batch.status === "live" ? "লাইভ" : "শেষ"}
              </span>
            </div>
            {batch.description && (
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">বিবরণ</p>
                <p className="text-base">{batch.description}</p>
              </div>
            )}
            {batch.icon_url && (
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">আইকন</p>
                <img
                  src={batch.icon_url}
                  alt={batch.name}
                  className="h-16 w-16 object-cover rounded"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>পরীক্ষা পরিচালনা</CardTitle>
            <CardDescription>
              এই ব্যাচের জন্য পরীক্ষা তৈরি এবং পরিচালনা করুন।
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddExam} className="space-y-4 mb-6">
              <Input
                type="text"
                placeholder="নতুন পরীক্ষার নাম"
                value={newExamName}
                onChange={(e) => setNewExamName(e.target.value)}
                disabled={isSubmittingExam}
                required
              />
              <Input
                type="number"
                placeholder=" পরীক্ষার সময় (মিনিট)"
                value={newExamDuration}
                onChange={(e) => setNewExamDuration(e.target.value)}
                disabled={isSubmittingExam}
                required
              />
              <Input
                type="number"
                step="0.01"
                placeholder="ভুল উত্তরের জন্য নেগেটিভ মার্ক"
                value={newExamNegativeMarks}
                onChange={(e) => setNewExamNegativeMarks(e.target.value)}
                disabled={isSubmittingExam}
                required
              />
              <Input
                type="text"
                placeholder="প্রশ্নাবলীর ID (ঐচ্ছিক)"
                value={newExamQuestionsId}
                onChange={(e) => setNewExamQuestionsId(e.target.value)}
                disabled={isSubmittingExam}
              />
              <Button
                type="submit"
                disabled={isSubmittingExam}
                className="w-full"
              >
                {isSubmittingExam ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    যোগ করা হচ্ছে...
                  </>
                ) : (
                  "নতুন পরীক্ষা যোগ করুন"
                )}
              </Button>
            </form>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>পরীক্ষার নাম</TableHead>
                  <TableHead className="text-right">কার্যক্রম</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.name}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link
                        href={`/admin/dashboard/exams/${exam.id}/questions`}
                      >
                        <Button variant="outline" size="sm">
                          প্রশ্ন
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingExam(exam);
                          setIsEditModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteExam(exam.id)}
                      >
                        মুছুন
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ছাত্রছাত্রী পরিচালনা</CardTitle>
            <CardDescription>
              এই ব্যাচে ছাত্রছাত্রীদের যোগ করুন বা মুছে ফেলুন।
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddStudent} className="space-y-4 mb-6">
              <Input
                type="text"
                placeholder="নতুন ছাত্রছাত্রীর রোল"
                value={newStudentRoll}
                onChange={(e) => setNewStudentRoll(e.target.value)}
                disabled={isSubmittingStudent}
                required
              />
              <Button
                type="submit"
                disabled={isSubmittingStudent}
                className="w-full"
              >
                {isSubmittingStudent ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    যোগ করা হচ্ছে...
                  </>
                ) : (
                  "ছাত্রছাত্রী যোগ করুন"
                )}
              </Button>
            </form>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>স্টুডেন্ট রোল</TableHead>
                  <TableHead className="text-right">কার্যক্রম</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrolledStudents.map((student) => (
                  <TableRow key={student.uid}>
                    <TableCell className="font-medium">{student.roll}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteStudent(student.uid)}
                      >
                        মুছে ফেলুন
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <EditExamModal
        exam={editingExam}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={(updatedExam) => {
          setExams(
            exams.map((exam) =>
              exam.id === updatedExam.id ? updatedExam : exam,
            ),
          );
        }}
      />
    </div>
  );
}
