import type { Contributor } from "@/app/about/page";

export interface AboutContent {
  title: string;
  description: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
  team: {
    heading: string;
  };
}

export const allData = {
  aboutContent: {
    title: "আমাদের সম্পর্কে",
    description: "MNR পরীক্ষা - বাংলাদেশের শীর্ষস্থানীয় অনলাইন পরীক্ষার প্ল্যাটফর্ম",
    sections: [
      {
        title: "আমাদের মিশন",
        content:
          "প্রতিটি ছাত্রছাত্রীকে মানসম্পন্ন শিক্ষা প্রদান এবং তাদের স্বপ্ন পূরণে সহায়তা করা আমাদের প্রধান লক্ষ্য।",
      },
      {
        title: "আমাদের ভিশন",
        content:
          "একটি আধুনিক এবং প্রযুক্তি-চালিত শিক্ষা ব্যবস্থা গড়ে তোলা যা সকল ছাত্রছাত্রীর জন্য সুলভ।",
      },
      {
        title: "আমাদের প্রতিশ্রুতি",
        content:
          "আমরা প্রতিশ্রুতিবদ্ধ যে প্রতিটি ছাত্রছাত্রী সর্বোচ্চ মানের শিক্ষা ও নির্দেশনা পাবে।",
      },
    ],
    team: {
      heading: "আমাদের দল",
    },
  } as AboutContent,

  contributorsList: [
    {
      name: "Naimur Rahaman (MNR)",
      role: "প্রতিষ্ঠাতা ও ডেভলপার",
      bio: "ছাত্রছাত্রীদের জন্য প্রযুক্তিকে সহজলভ্য করার লক্ষ্যে দীর্ঘ সময় ধরে কাজ করে যাচ্ছেন।",
      imageUrl:
        "https://raw.githubusercontent.com/MNRfrom2020/logo-and-icon-cdn/refs/heads/main/Logo/Naimur/Naimur%20BGB.png",
      social: {
        globe: "https://naimur.mnr.world/",
        send: "https://t.me/WithNaimur",
        facebook: "https://facebook.com/WithNaimur",
        youtube: "https://youtube.com/@MNRfrom2020",
        github: "https://github.com/MNRfrom2020",
      },
    },
    {
      name: "FrostFoe",
      role: "প্রধান ডেভলপার",
      bio: "এই প্ল্যাটফর্ম ডেভলপ থেকে শুরু করে পরিচালনা এবং এর কার্যকারিতা বৃদ্ধিতে কাজ করছেন।",
      imageUrl: "https://avatars.githubusercontent.com/u/175545919?v=4",
      social: {
        globe: "https://frostfoe.netlify.app/",
        send: "https://t.me/FrostFoe",
        facebook: "https://facebook.com/FrostFoe/",
        instagram: "https://instagram.com/FrostFoe/",
        github: "https://github.com/FrostFoe",
      },
    },
  ] as Contributor[],

  specialContributorsList: [
    {
      name: "ঢাকা বিশ্ববিদ্যালয়",
      role: "একাডেমিক পার্টনার",
      bio: "শিক্ষা কর্মসূচিতে সহযোগিতা",
      imageUrl: "https://api.dicebear.com/7.x/initials/webp?seed=DU",
      social: {
        globe: "https://du.ac.bd",
      },
    },
    {
      name: "বাংলাদেশ শিক্ষা উন্নয়ন বোর্ড",
      role: "সরকারি সহযোগী",
      bio: "মানুষ গঠনে সহায়তা",
      imageUrl: "https://api.dicebear.com/7.x/initials/webp?seed=BEB",
      social: {
        globe: "https://beeb.gov.bd",
      },
    },
    {
      name: "স্থানীয় এনজিও নেটওয়ার্ক",
      role: "সামাজিক দায়বদ্ধতা অংশীদার",
      bio: "দরিদ্র ছাত্রছাত্রীদের সহায়তায় কাজ করছে",
      imageUrl: "https://api.dicebear.com/7.x/initials/webp?seed=NGO",
      social: {
        mail: "mailto:partner@mnr.world",
      },
    },
  ] as Contributor[],
};
