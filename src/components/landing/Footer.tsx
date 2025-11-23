import {
  Globe,
  Mail,
  Send,
  Facebook,
  Youtube,
  Twitter,
  Instagram,
  Github,
  ArrowRight,
  House,
  Info,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";

const socialLinks = [
  { label: "Website", href: "https://mnr.world", icon: Globe },
  { label: "Mail", href: "mailto:mail@mnr.world", icon: Mail },
  { label: "Telegram", href: "https://t.me/MNRfrom2020", icon: Send },
  {
    label: "Facebook",
    href: "https://facebook.com/MNRfrom2020",
    icon: Facebook,
  },
  { label: "Youtube", href: "https://youtube.com/@MNRfrom2020", icon: Youtube },
  { label: "Twitter", href: "https://x.com/MNRfrom2020", icon: Twitter },
  {
    label: "Instagram",
    href: "https://instagram.com/MNRfrom2020",
    icon: Instagram,
  },
  { label: "Github", href: "https://github.com/MNRfrom2020", icon: Github },
];

const importantLinks = [
  { label: "লাইভ পরীক্ষা", href: "/live-exam" },
  { label: "প্রশ্নব্যাংক", href: "/question-bank" },
  { label: "ব্যাচসমূহ", href: "/batches" },
];

const shortcutLinks = [
  { label: "হোম", href: "/", icon: House },
  { label: "আমাদের সম্পর্কে", href: "/about", icon: Info },
  { label: "যোগাযোগ", href: "/contact", icon: Mail },
];

export function Footer() {
  return (
    <footer className="w-full mt-12 sm:mt-16 mb-2 sm:mb-4">
      <div className="bg-card/50 rounded-2xl shadow-lg px-4 sm:px-8 py-8 border border-border mx-2 sm:mx-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <Link
              href="https://mnr.world"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 mb-4 w-fit"
            >
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">
                MNR <span className="text-primary">পরীক্ষা</span>
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm">
              বাংলাদেশের সকল বিশ্ববিদ্যালয় ও কলেজের ভর্তি পরীক্ষার প্রস্তুতির
              জন্য আপনার বিশ্বস্ত প্ল্যাটফর্ম।
            </p>
            <div className="flex items-center flex-wrap gap-3 mt-6">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <a
                  key={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-transform hover:scale-115"
                  aria-label={label}
                  href={href}
                >
                  <Icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>

          <div className="col-span-1">
            <h2 className="text-xl font-semibold inline-block relative pb-1 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary">
              গুরুত্বপূর্ণ লিঙ্ক
            </h2>
            <ul className="mt-4 space-y-3">
              {importantLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center"
                  >
                    <ArrowRight className="text-primary mr-2 h-5 w-5" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1">
            <h2 className="text-xl font-semibold inline-block relative pb-1 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary">
              শর্টকাট
            </h2>
            <ul className="mt-4 space-y-3">
              {shortcutLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center"
                  >
                    <link.icon className="w-5 text-center mr-2" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
