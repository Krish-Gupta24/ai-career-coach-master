import InterviewCard from "@/components/InterviewCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/actions/user";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/actions/ai-interview";
import Image from "next/image";
import Link from "next/link";
import { Mic } from "lucide-react";

export default async function AiCallPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [userInterviews, latestInterviews] = await Promise.all([
    getInterviewsByUserId(user.id),
    getLatestInterviews({ userId: user.id }),
  ]);

  const hasPastInterviews = userInterviews?.length > 0;
  const hasLatestInterviews = latestInterviews?.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 md:gap-2 items-start md:items-center justify-between">
        <h1 className="text-5xl md:text-6xl font-bold gradient-title">
          AI Voice Interviews
        </h1>
        <Button asChild className="shrink-0">
          <Link href="/ai-call/ai-interview">
            <Mic className="h-4 w-4 mr-2" />
            Start an Interview
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-1 space-y-3 text-center lg:text-left">
              <h2 className="text-2xl font-semibold tracking-tight">
                Get interview-ready with instant AI feedback
              </h2>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                Practice real voice interviews, review your sessions, and
                explore prompts other learners are using to sharpen their skills.
              </p>
            </div>
            <div className="shrink-0 hidden sm:flex justify-center">
              <Image
                src="/robot.png"
                alt="AI interview assistant"
                width={320}
                height={320}
                className="max-w-[260px] md:max-w-[300px] object-contain"
                priority
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="gradient-title text-3xl md:text-4xl">
            Your interviews
          </CardTitle>
          <CardDescription>
            Interviews you&apos;ve started or completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasPastInterviews ? (
            <div className="flex flex-wrap gap-6">
              {userInterviews.map((interview) => (
                <InterviewCard key={interview.id} {...interview} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  No interviews yet
                </CardTitle>
                <CardDescription>
                  Start your first voice interview to see it listed here.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="gradient-title text-3xl md:text-4xl">
            Discover interviews
          </CardTitle>
          <CardDescription>
            Finalized sessions from the community you can try
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasLatestInterviews ? (
            <div className="flex flex-wrap gap-6">
              {latestInterviews.map((interview) => (
                <InterviewCard key={interview.id} {...interview} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Nothing to show yet
                </CardTitle>
                <CardDescription>
                  When others complete interviews, they&apos;ll appear here.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
