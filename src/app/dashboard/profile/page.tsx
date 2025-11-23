"use client";

import { useAuth } from "@/context/AuthContext";
import {
  LoadingSpinner,
  PageHeader,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
} from "@/components";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CalendarIcon, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface Batch {
  id: string;
  name: string;
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchesLoading, setBatchesLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchBatches() {
      if (user?.enrolled_batches && user.enrolled_batches.length > 0) {
        try {
          const { data, error } = await supabase
            .from("batches")
            .select("id, name")
            .in("id", user.enrolled_batches);

          if (error) {
            throw error;
          }
          setBatches(data || []);
        } catch (error) {
          console.error("Error fetching batches:", error);
        } finally {
          setBatchesLoading(false);
        }
      } else {
        setBatches([]);
        setBatchesLoading(false);
      }
    }

    if (!loading && user) {
      fetchBatches();
    }
  }, [user, loading]);

  if (loading) {
    return <LoadingSpinner message="প্রোফাইল লোড হচ্ছে..." />;
  }

  if (!user) {
    return null; // or a redirect message
  }

  return (
    <div className="space-y-4 p-2 md:p-4">
      <PageHeader title="প্রোফাইল" description="আপনার ব্যক্তিগত তথ্য দেখুন" />
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarFallback className="text-2xl">
                <UserIcon className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <CardDescription className="text-md">{user.roll}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">
              ভর্তি হওয়া ব্যাচসমূহ
            </h3>
            <div className="flex flex-wrap gap-2">
              {batchesLoading ? (
                <Skeleton className="h-6 w-24" />
              ) : batches.length > 0 ? (
                batches.map((batch) => (
                  <Badge key={batch.id} variant="secondary">
                    {batch.name}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  কোনো ব্যাচে ভর্তি হননি।
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">অন্যান্য তথ্য</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>
                রেজিস্ট্রেশনের তারিখ:{" "}
                {new Date(user.created_at).toLocaleDateString("bn-BD")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
