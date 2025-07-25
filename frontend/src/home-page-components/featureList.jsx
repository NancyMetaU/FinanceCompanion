import { Wallet, Newspaper, BookOpen } from "lucide-react";

export const features = [
  {
    title: "Budgeting made easy.",
    path: "/budget",
    desc: "Connect your bank and get a personalized budget based on your income, habits, and priorities.",
    icon: <Wallet className="h-10 w-10 text-green-400" />,
    color: "from-green-400 to-emerald-500",
    delay: "animation-delay-100",
  },
  {
    title: "News digest without the noise.",
    path: "/news",
    desc: "Stay current with streamlined financial headlines, simplified summaries, and tagged topics that matter.",
    icon: <Newspaper className="h-10 w-10 text-blue-400" />,
    color: "from-blue-400 to-indigo-500",
    delay: "animation-delay-300",
  },
  {
    title: "Learning modules for all.",
    path: "/learning",
    desc: "Learn core financial concepts through interactive, click-based modules designed for clarity and ease.",
    icon: <BookOpen className="h-10 w-10 text-yellow-500" />,
    color: "from-yellow-400 to-amber-500",
    delay: "animation-delay-500",
  },
];
