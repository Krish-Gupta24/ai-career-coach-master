import { UserPlus, FileEdit, ReceiptText , LineChart } from "lucide-react";

export const howItWorks = [
  {
    title: "Practice With AI Interview",
    description: "Engage in realistic mock interviews and practice in real environment",
    icon: <UserPlus className="w-8 h-8 text-primary" />,
  },
  {
    title: "Give Mock Quiz",
    description:
      "Practice with AI-powered mock interviews tailored to your role",
    icon: <ReceiptText  className="w-8 h-8 text-primary" />,
  },
  {
    title: "Craft Your Documents",
    description: "Create ATS-optimized resumes and compelling cover letters",
    icon: <FileEdit className="w-8 h-8 text-primary" />,
  },
  
  {
    title: "Track Your Progress",
    description: "Monitor improvements with detailed performance analytics",
    icon: <LineChart className="w-8 h-8 text-primary" />,
  },
];
