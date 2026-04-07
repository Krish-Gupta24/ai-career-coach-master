import Agent from "@/components/Agent";
import { getCurrentUser } from "@/actions/user";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AiInterviewPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="space-y-8">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2 mb-4 h-9 text-muted-foreground" asChild>
          <Link href="/ai-call" className="gap-1">
            <ChevronLeft className="size-4" />
            Back to AI interviews
          </Link>
        </Button>
        <h1 className="text-5xl font-bold md:text-6xl gradient-title">
          Live voice interview
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground md:text-lg">
          You&apos;re in a live session with the AI interviewer. The window below
          behaves like a video call—use{" "}
          <span className="font-medium text-foreground">Start call</span> to
          connect, then read{" "}
          <span className="font-medium text-foreground">Live captions</span> at
          the bottom; the latest line stays larger and easier to read.
        </p>
      </div>

      <Agent userName={user?.name || ""} userId={user?.id} type="generate" />
    </div>
  );
}
