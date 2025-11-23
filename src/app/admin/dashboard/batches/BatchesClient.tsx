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
import type { Batch } from "@/lib/types";
import { Loader2 } from "lucide-react";

export function BatchesClient({ initialBatches }: { initialBatches: Batch[] }) {
  const [batches, setBatches] = useState<Batch[]>(initialBatches);
  const [newBatchName, setNewBatchName] = useState("");
  const [newBatchDescription, setNewBatchDescription] = useState("");
  const [newBatchIconUrl, setNewBatchIconUrl] = useState("");
  const [newBatchStatus, setNewBatchStatus] = useState<"live" | "end">("live");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAddBatch = async (e: FormEvent) => {
    e.preventDefault();
    if (!newBatchName.trim()) {
      toast({
        title: "ব্যাচের নাম আবশ্যক",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const { data, error } = await supabase
      .from("batches")
      .insert([
        {
          name: newBatchName.trim(),
          description: newBatchDescription.trim() || null,
          icon_url: newBatchIconUrl.trim() || null,
          status: newBatchStatus,
        },
      ])
      .select();

    if (error) {
      console.error("Error adding batch:", error);
      toast({
        title: "ব্যাচ যোগ করতে সমস্যা হয়েছে",
        description: error.message,
        variant: "destructive",
      });
    } else if (data) {
      setBatches([...batches, data[0]]);
      setNewBatchName("");
      setNewBatchDescription("");
      setNewBatchIconUrl("");
      setNewBatchStatus("live");
      toast({
        title: "ব্যাচ সফলভাবে যোগ করা হয়েছে",
      });
    }
    setIsSubmitting(false);
  };

  const handleDeleteBatch = async (batchId: string) => {
    const { error } = await supabase.from("batches").delete().eq("id", batchId);
    if (error) {
      console.error("Error deleting batch:", error);
      toast({
        title: "ব্যাচ মুছে ফেলতে সমস্যা হয়েছে",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setBatches(batches.filter((batch) => batch.id !== batchId));
      toast({
        title: "ব্যাচ সফলভাবে মুছে ফেলা হয়েছে",
      });
    }
  };

  return (
    <div className="container mx-auto p-2 md:p-4">
      <Card>
        <CardHeader>
          <CardTitle>ব্যাচ পরিচালনা</CardTitle>
          <CardDescription>
            নতুন ব্যাচ তৈরি করুন এবং বিদ্যমান ব্যাচ পরিচালনা করুন।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddBatch} className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                placeholder="ব্যাচের নাম"
                value={newBatchName}
                onChange={(e) => setNewBatchName(e.target.value)}
                disabled={isSubmitting}
                required
              />
              <Input
                type="text"
                placeholder="ব্যাচের বিবরণ"
                value={newBatchDescription}
                onChange={(e) => setNewBatchDescription(e.target.value)}
                disabled={isSubmitting}
              />
              <Input
                type="url"
                placeholder="আইকন URL"
                value={newBatchIconUrl}
                onChange={(e) => setNewBatchIconUrl(e.target.value)}
                disabled={isSubmitting}
              />
              <select
                value={newBatchStatus}
                onChange={(e) =>
                  setNewBatchStatus(e.target.value as "live" | "end")
                }
                disabled={isSubmitting}
                className="px-3 py-2 border rounded-md"
              >
                <option value="live">লাইভ</option>
                <option value="end">শেষ</option>
              </select>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  যোগ করা হচ্ছে...
                </>
              ) : (
                "নতুন ব্যাচ যোগ করুন"
              )}
            </Button>
          </form>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ব্যাচের নাম</TableHead>
                <TableHead>বিবরণ</TableHead>
                <TableHead>অবস্থা</TableHead>
                <TableHead>তৈরির তারিখ</TableHead>
                <TableHead className="text-right">কার্যক্রম</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-medium">{batch.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {batch.description
                      ? batch.description.substring(0, 30) +
                        (batch.description.length > 30 ? "..." : "")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        batch.status === "live"
                          ? "bg-green-500/20 text-green-700"
                          : "bg-gray-500/20 text-gray-700"
                      }`}
                    >
                      {batch.status === "live" ? "লাইভ" : "শেষ"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(batch.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/admin/dashboard/batches/${batch.id}`}>
                      <Button variant="outline" size="sm">
                        পরীক্ষা দেখুন
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteBatch(batch.id)}
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
  );
}
