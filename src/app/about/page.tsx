"use client";

import { allData } from "@/lib/data";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import {
  Github,
  Linkedin,
  Mail,
  Twitter,
  Globe,
  Send,
  Facebook,
  Youtube,
  Instagram,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SpecialContributorCard from "@/components/landing/SpecialContributorCard";

interface SocialLinks {
  globe?: string;
  send?: string;
  facebook?: string;
  youtube?: string;
  github?: string;
  instagram?: string;
  mail?: string;
  linkedin?: string;
  twitter?: string;
}

export interface Contributor {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  social: SocialLinks;
}

export const socialIcons: { [key in keyof SocialLinks]: React.ElementType } = {
  globe: Globe,
  send: Send,
  facebook: Facebook,
  youtube: Youtube,
  github: Github,
  instagram: Instagram,
  mail: Mail,
  linkedin: Linkedin,
  twitter: Twitter,
};

const ContributorCard: React.FC<{ contributor: Contributor }> = ({
  contributor,
}) => (
  <div className="group relative flex flex-col items-center text-center bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-primary/20 hover:border-primary/50 hover:-translate-y-1">
    <div className="relative h-32 w-32 mb-4">
      <Image
        src={contributor.imageUrl}
        alt={contributor.name}
        width={128}
        height={128}
        className="rounded-full object-cover border-4 border-card group-hover:border-primary/50"
      />
    </div>
    <h3 className="text-xl font-bold text-foreground">{contributor.name}</h3>
    <p className="text-primary font-medium">{contributor.role}</p>
    <p className="text-muted-foreground mt-2 text-sm flex-grow">
      {contributor.bio}
    </p>
    <div className="mt-4 flex space-x-2 flex-wrap justify-center">
      {Object.entries(contributor.social).map(([key, href]) => {
        const Icon = socialIcons[key as keyof SocialLinks];
        if (!Icon || !href) return null;
        return (
          <Link key={key} href={href} target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full hover:scale-110"
            >
              <Icon className="h-5 w-5" />
            </Button>
          </Link>
        );
      })}
    </div>
  </div>
);

export default function AboutPage() {
  const { title, description, sections, team } = allData.aboutContent;
  const contributors = allData.contributorsList as Contributor[];
  const specialContributors = allData.specialContributorsList as Contributor[];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow font-bengali">
        <div className="container mx-auto px-2 pb-12">
          <div className="px-4 py-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text text-center animate-in fade-in duration-500">
              {title}
            </h1>
            <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
              {description}
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in duration-500">
            {sections.map((section: { title: string; content: string }, index: number) => (
              <div
                key={index}
                className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/50"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {section.title}
                </h3>
                <p className="text-muted-foreground">{section.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold mb-8 gradient-text animate-in fade-in duration-500">
              {team.heading}
            </h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {contributors.map((contributor: Contributor, index: number) => (
                <div
                  key={contributor.name}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ContributorCard contributor={contributor} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-20">
            <h2 className="text-3xl font-bold mb-8 gradient-text text-center animate-in fade-in duration-500">
              বিশেষ ধন্যবাদ
            </h2>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {specialContributors.map((contributor: Contributor, index: number) => (
                <div
                  key={contributor.name}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <SpecialContributorCard contributor={contributor} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-20 text-center bg-card border border-border rounded-2xl p-8 shadow-lg animate-in fade-in zoom-in duration-500">
            <h2 className="text-2xl font-bold text-foreground">
              আপনিও অবদান রাখতে চান?
            </h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
              আমরা সবসময় নতুন প্রতিভাবানদের খুঁজছি। আপনি যদি আমাদের এই যাত্রায়
              অংশ নিতে আগ্রহী হন, তবে আমাদের সাথে যোগাযোগ করুন।
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link
                href="https://t.me/MNRfrom2020"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Send className="mr-2" />
                Telegram-এ যোগ দিন
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
