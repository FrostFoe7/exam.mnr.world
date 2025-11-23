"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { BatchCard } from "@/components/BatchCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PageHeader, EmptyState, LoadingSpinner } from "@/components";
import { BookOpen } from "lucide-react";
import type { Batch } from "@/lib/types";

export default function StudentBatchesPage() {
  const { user, loading: authLoading } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user?.uid) {
      fetchStudentBatches();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchStudentBatches = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("enrolled_batches")
      .eq("uid", user.uid)
      .single();

    if (
      userError ||
      !userData?.enrolled_batches ||
      userData.enrolled_batches.length === 0
    ) {
      setBatches([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("batches")
      .select("*")
      .in("id", userData.enrolled_batches);

    if (error) {
      console.error("Error fetching student batches:", error);
    } else if (data) {
      setBatches(data);
    }
    setLoading(false);
  };

  if (loading || authLoading) {
    return <LoadingSpinner message="আপনার ব্যাচগুলো লোড হচ্ছে..." />;
  }

  return (
    <div className="container mx-auto p-2 md:p-4 space-y-6">
      <PageHeader
        title="আমার ব্যাচসমূহ"
        description="আপনি যে সকল ব্যাচে ভর্তি আছেন তার তালিকা।"
      />
      {batches.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {batches.map((batch, idx) => (
            <BatchCard key={batch.id} batch={batch} index={idx} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen className="h-12 w-12 text-primary" />}
          title="কোনো ব্যাচ পাওয়া যায়নি"
          description="আপনি কোনো ব্যাচে ভর্তি নন। আরও তথ্যের জন্য ড্যাশবোর্ডে ফিরুন।"
          actionLabel="ড্যাশবোর্ডে ফিরুন"
          onAction={() => window.location.href = "/dashboard"}
        />
      )}
    </div>
  );
}
