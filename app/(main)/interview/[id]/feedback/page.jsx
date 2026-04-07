import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, Star, ThumbsUp, TrendingUp } from "lucide-react";

export default async function FeedbackPage({ params }) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch the feedback and the associated interview with questions & answers
  const feedback = await db.feedback.findFirst({
    where: { interviewId: id },
    include: {
      interview: {
        include: {
          questions: {
            include: { answers: true },
            orderBy: { order: 'asc' },
          }
        }
      }
    }
  });

  if (!feedback) {
    return notFound();
  }

  // The detailed Feedback might be an array corresponding to questions, if available.
  const detailedFeedback = Array.isArray(feedback.detailedFeedback) ? feedback.detailedFeedback : [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2 mb-4 h-9 text-muted-foreground" asChild>
          <Link href="/ai-call" className="gap-1">
            <ChevronLeft className="size-4" />
            Back to AI interviews
          </Link>
        </Button>
        <h1 className="text-4xl font-bold md:text-5xl gradient-title mb-2">
          Interview Feedback
        </h1>
        <p className="text-base text-muted-foreground md:text-lg">
          Review your performance, see your transcribed answers, and read tailored AI tips.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <Star className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{feedback.totalScore}/100</div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Final Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {feedback.finalAssessment}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-sky-500" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              {feedback.strengths?.map((strength, i) => (
                <li key={i}>{strength}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-rose-500" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              {feedback.areasForImprovement?.map((area, i) => (
                <li key={i}>{area}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Transcript & Insights</h2>
        
        {feedback.interview.questions.map((q, idx) => {
          // Identify if we tracked detailed feedback mapping to this specific question
          const specificFeedback = detailedFeedback.find(df => df.question === q.questionText);
          const answerText = q.answers.map(a => a.answerText).join(" ");
          
          return (
            <Card key={q.id} className="overflow-hidden">
              <div className="border-b bg-muted/30 px-6 py-4">
                <div className="flex gap-3">
                  <Badge variant="outline" className="h-6 shrink-0 pt-1">Q {idx + 1}</Badge>
                  <p className="text-sm font-semibold">{q.questionText}</p>
                </div>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex gap-3">
                  <div className="w-10 shrink-0 text-xs font-semibold text-muted-foreground pt-1">You</div>
                  <p className="text-sm leading-relaxed text-zinc-300">
                    {answerText || <span className="italic text-zinc-500">(No answer recorded)</span>}
                  </p>
                </div>

                {specificFeedback && (
                  <div className="rounded-lg bg-emerald-500/10 p-4 mt-4 border border-emerald-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        AI Coach
                      </span>
                      {specificFeedback.score && (
                        <span className="text-xs font-bold text-emerald-400">Score: {specificFeedback.score}/10</span>
                      )}
                    </div>
                    <p className="text-sm text-emerald-200/90 leading-relaxed">
                      {specificFeedback.feedback}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}

        {feedback.interview.questions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
            No questions or answers were recorded during this session.
          </div>
        )}
      </div>
    </div>
  );
}
