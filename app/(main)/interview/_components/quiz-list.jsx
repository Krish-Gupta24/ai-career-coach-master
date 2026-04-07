"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QuizResult from "./quiz-result";

export default function QuizList({ assessments }) {
  const router = useRouter();
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const sortedNewestFirst = useMemo(() => {
    if (!assessments?.length) return [];
    return [...assessments].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }, [assessments]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="gradient-title text-3xl md:text-4xl">
            Recent Quizzes
          </CardTitle>
          <CardDescription>
            Newest first (Quiz 1 = latest). Tap a row to review details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!sortedNewestFirst.length ? (
            <p className="rounded-lg border border-dashed bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
              No quizzes yet. Use{" "}
              <span className="font-medium text-foreground">Start New Quiz</span>{" "}
              above to begin.
            </p>
          ) : (
            <div className="space-y-4">
              {sortedNewestFirst.map((assessment, i) => (
                <Card
                  key={assessment.id}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => setSelectedQuiz(assessment)}
                >
                  <CardHeader>
                    <CardTitle className="gradient-title text-2xl">
                      Quiz {i + 1}
                    </CardTitle>
                    <CardDescription className="flex w-full justify-between gap-2">
                      <span>Score: {assessment.quizScore.toFixed(1)}%</span>
                      <span className="shrink-0 text-right">
                        {format(
                          new Date(assessment.createdAt),
                          "MMMM dd, yyyy HH:mm",
                        )}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  {assessment.improvementTip && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {assessment.improvementTip}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle />
          </DialogHeader>
          <QuizResult
            result={selectedQuiz}
            hideStartNew
            onStartNew={() => router.push("/interview/mock")}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
