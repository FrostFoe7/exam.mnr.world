"use client";
import { useState, useEffect } from "react";
import {
  AlertBox,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@/components";
import { GraduationCap, Loader2, Copy, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

function generateRoll(): string {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  const second = String(now.getSeconds()).padStart(2, "0");
  return `${year}${month}${date}${hour}${minute}${second}`;
}

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setRollNumber(generateRoll());
  }, []);

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
              <Label htmlFor="roll-number">রোল নম্বর (স্বয়ংক্রিয়)</Label>
              <div className="flex gap-2">
                <Input
                  id="roll-number"
                  type="text"
                  placeholder="স্বয়ংক্রিয়ভাবে উৎপাদিত"
                  value={rollNumber}
                  readOnly
                  disabled={loading}
                  className="flex-1 font-mono font-bold tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(rollNumber);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-2 rounded-lg border border-muted hover:bg-muted transition-colors disabled:opacity-50"
                  disabled={loading}
                  title="রোল নম্বর কপি করুন"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                ফরম্যাট: YYMMDDHHMMSS (বছর:মাস:দিন:ঘণ্টা:মিনিট:সেকেন্ড)
              </p>
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
              <AlertBox
                type="error"
                title="নিবন্ধন ব্যর্থ"
                description={error}
              />
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
              <Link href="/login" className="underline hover:text-primary">
                লগইন করুন
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
