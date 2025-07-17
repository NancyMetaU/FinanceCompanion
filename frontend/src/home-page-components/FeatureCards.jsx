import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/lib/ui/card";
import { Newspaper, Wallet, BookOpen } from "lucide-react";

const features = [
  {
    title: "Budgeting made easy.",
    path: "/budget",
    desc: "Connect your bank and get a personalized budget based on your income, habits, and priorities.",
    icon: <Wallet className="h-10 w-10 text-green-400" />,
  },
  {
    title: "News digest without the noise.",
    path: "/news",
    desc: "Stay current with streamlined financial headlines, simplified summaries, and tagged topics that matter.",
    icon: <Newspaper className="h-10 w-10 text-blue-400" />,
  },
  {
    title: "Learning modules for all.",
    path: "/learning",
    desc: "Learn core financial concepts through interactive, click-based modules designed for clarity and ease.",
    icon: <BookOpen className="h-10 w-10 text-yellow-500" />,
  },
];

const FeatureCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 py-12 w-5/6 mx-auto">
      {features.map((feat) => (
        <Link to={feat.path} key={feat.title} className="group">
          <Card
            className="relative h-full flex flex-col items-center text-center pt-6
          pb-8 px-6 hover:shadow-lg transition cursor-pointer"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-royal rounded-t-md" />
            <div className="mt-6">{feat.icon}</div>
            <CardContent className="pt-4 pb-6 px-4 flex flex-col items-center">
              <h3 className="text-2xl font-bold text-slate-800 mb-5">
                {feat.title}
              </h3>
              <p className="text-m text-muted-foreground leading-relaxed">
                {feat.desc}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default FeatureCards;
