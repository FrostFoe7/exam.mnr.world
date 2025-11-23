"use client";
import { useState } from "react";
import { AlertBox, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input, Label } from "@/components";
import { GraduationCap, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase
        .from("users")
        .insert([{ name, roll: rollNumber, pass: password }]);

      if (error) {
        throw error;
      }

      router.push("/login");
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes("duplicate key")) {
          setError("এই রোল নম্বরটি ইতিমধ্যে নিবন্ধিত আছে।");
        } else {
          setError(err.message);
        }
      } else {
        setError("নিবন্ধন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background animate-in fade-in duration-500">
      <Card className="w-full max-w-sm animate-in zoom-in slide-in-from-bottom-8 duration-500">
        <CardHeader className="text-center animate-in fade-in duration-500 delay-200">
          <div className="flex justify-center items-center mb-4 animate-in spin-in duration-700 delay-300">
            <GraduationCap className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">MNR পরীক্ষা</CardTitle>
          <CardDescription>নিবন্ধন করতে আপনার বিবরণ দিন</CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2 animate-in fade-in slide-in-from-left duration-500 delay-300">
              <Label htmlFor="name">নাম</Label>
              <Input
                id="name"
                type="text"
                placeholder="আপনার নাম"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2 animate-in fade-in slide-in-from-left duration-500 delay-400">
              <Label htmlFor="roll-number">রোল নম্বর</Label>
              <Input
                id="roll-number"
                type="text"
                placeholder="আপনার রোল নম্বর"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2 animate-in fade-in slide-in-from-left duration-500 delay-500">
              <Label htmlFor="password">পাসওয়ার্ড</Label>
              <Input
                id="password"
                type="password"
                placeholder="আপনার পাসওয়ার্ড"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {error && (
              <AlertBox type="error" title="নিবন্ধন ব্যর্থ" description={error} />
            )}
          </CardContent>
          <CardFooter className="flex-col animate-in fade-in duration-500 delay-600">
            <Button
              type="submit"
              className="w-full hover:scale-105"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  নিবন্ধন করা হচ্ছে...
                </>
              ) : (
                "নিবন্ধন"
              )}
            </Button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              ইতিমধ্যে একটি অ্যাকাউন্ট আছে?{" "}
              <Link
                href="/login"
                className="underline hover:text-primary"
              >
                লগইন করুন
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
