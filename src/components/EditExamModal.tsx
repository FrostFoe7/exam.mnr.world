"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Exam } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface EditExamModalProps {
  exam: Exam | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedExam: Exam) => void;
}

export function EditExamModal({
  exam,
  isOpen,
  onClose,
  onUpdate,
}: EditExamModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [negativeMarks, setNegativeMarks] = useState("");
  const [fileId, setFileId] = useState("");

  useEffect(() => {
    if (exam) {
      setName(exam.name);
      setDuration(String(exam.duration_minutes || ""));
      setNegativeMarks(String(exam.negative_marks_per_wrong || ""));
      setFileId(exam.file_id || "");
    }
  }, [exam]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!exam) return;

    setIsSubmitting(true);
    try {
      const { data: updatedExam, error } = await supabase
        .from("exams")
        .update({
          name,
          duration_minutes: parseInt(duration, 10),
          negative_marks_per_wrong: parseFloat(negativeMarks),
          file_id: fileId.trim() || null,
        })
        .eq("id", exam.id)
        .select()
        .single();

      if (error) throw error;

      toast({ title: "Exam updated successfully!" });
      onUpdate(updatedExam);
      onClose();
    } catch (error: any) {
      toast({
        title: "Error updating exam",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Exam</DialogTitle>
          <DialogDescription>
            Update the details for the exam below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Exam Name"
            required
          />
          <Input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Duration (minutes)"
            required
          />
          <Input
            type="number"
            step="0.01"
            value={negativeMarks}
            onChange={(e) => setNegativeMarks(e.target.value)}
            placeholder="Negative Marks"
            required
          />
          <Input
            type="text"
            value={fileId}
            onChange={(e) => setFileId(e.target.value)}
            placeholder="Question File ID (Optional)"
          />
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Exam"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
