<<<<<<< HEAD
import {
  Mic,
  ListChecks,
  LineChart,
  FileUser,
  Mail,
  MessageSquareText,
  Lightbulb,
  ScanFace,
} from "lucide-react";

const iconClass = "w-10 h-10 mb-4 text-primary";

=======
import { 
  BrainCircuit, 
  Briefcase, 
  LineChart, 
  ScrollText,
  HelpCircle, 
  ClipboardList,
  MonitorCheck,
  NotebookPen,
  SquareUserRound 
} from "lucide-react";
>>>>>>> dcaa68736f8eccc23a84af9829e1bbf17ae660a3
export const features = [
  {
    icon: <Mic className={iconClass} />,
    title: <span className="text-[#cdc2a4]">AI Mock Interview</span>,
    description:
      "Face dynamic, role-specific interviews. Prevo adapts to your answers and provides actionable feedback on your delivery.",
    link: "/ai-call",
  },
  {
<<<<<<< HEAD
    icon: <ListChecks className={iconClass} />,
=======
    icon: < HelpCircle className="w-10 h-10 mb-4 text-primary"/>,
>>>>>>> dcaa68736f8eccc23a84af9829e1bbf17ae660a3
    title: <span className="text-[#cdc2a4]">Mock Quiz</span>,
    description:
      "Sharpen your domain knowledge with rapid-fire, role-specific quizzes and identify your blind spots immediately.",
    link: "/interview",
  },
  {
    icon: <LineChart className={iconClass} />,
    title: <span className="text-[#cdc2a4]">Industry Insights </span>,
    description:
      "Access real-time data on salary expectations, hiring patterns, and the top skills needed to stay competitive in your field.",
    link: "/dashboard",
  },
  {
    icon: <FileUser className={iconClass} />,
    title: <span className="text-[#cdc2a4]">Smart Resume Creation</span>,
    description:
      "Transform your experience into a top-tier, ATS-optimized resume designed to pass the filters and land the interview.  ",
    link: "/resume",
  },
  {
<<<<<<< HEAD
    icon: <Mail className={iconClass} />,
=======
    icon: <ClipboardList className="w-10 h-10 mb-4 text-primary" />,
>>>>>>> dcaa68736f8eccc23a84af9829e1bbf17ae660a3
    title: <span className="text-[#cdc2a4]">Smart Cover Letter Creation</span>,
    description:
      "Create unique, role-specific cover letters instantly. Stand out from the crowd without the writing struggle.",
    link: "/ai-cover-letter",
  },
  {
<<<<<<< HEAD
    icon: <MessageSquareText className={iconClass} />,
=======
    icon: <MonitorCheck className="w-10 h-10 mb-4 text-primary" />,
>>>>>>> dcaa68736f8eccc23a84af9829e1bbf17ae660a3
    title: <span className="text-[#cdc2a4]">Feedback of interview</span>,
    description:
      "Don't guess how you did. Get instant, AI-driven insights on your strengths and exact areas for improvement.",
    link: "/interview",
  },
  {
<<<<<<< HEAD
    icon: <Lightbulb className={iconClass} />,
=======
    icon: <NotebookPen className="w-10 h-10 mb-4 text-primary" />,
>>>>>>> dcaa68736f8eccc23a84af9829e1bbf17ae660a3
    title: <span className="text-[#cdc2a4]">Interview Tips</span>,
    description:
      "Access a curated library of industry-specific tips, behavioral frameworks, and best practices to ace any question.",
    link: "/tips",
  },
  {
<<<<<<< HEAD
    icon: <ScanFace className={iconClass} />,
=======
    icon: <SquareUserRound  className="w-10 h-10 mb-4 text-primary" />,
>>>>>>> dcaa68736f8eccc23a84af9829e1bbf17ae660a3
    title: <span className="text-[#cdc2a4]">Expression Tracking</span>,
    description:
      "Master your body language. Our vision AI tracks your micro-expressions to help you look exactly as confident as you sound.",
    link: "/",
  },
];
