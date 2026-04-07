import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function QuizStartCard() {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <CardTitle className="gradient-title text-3xl md:text-4xl">
            Start a new quiz
          </CardTitle>
          <CardDescription className="text-base">
            Jump into a fresh set of technical MCQs tailored to your profile.
          </CardDescription>
        </div>
        <Button asChild size="lg" className="h-11 shrink-0 gap-2 sm:min-w-[180px]">
          <Link href="/interview/mock">
            Start New Quiz
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
    </Card>
  );
}
