import { getCurrentUser } from "@/actions/user";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, TrendingUp, Mic, Brain, Target } from "lucide-react";
import {
  coachingSnapshot,
  focusThemes,
  playbookTips,
} from "@/data/interview-tips-seed";

export default async function TipsPage() {
  const user = await getCurrentUser();
  const firstName =
    user?.name?.trim()?.split(/\s+/)[0] || "there";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="font-normal">
              Coaching brief
            </Badge>
            <Badge variant="outline" className="font-normal text-muted-foreground">
              {coachingSnapshot.lastInsightWindow}
            </Badge>
          </div>
          <h1 className="text-5xl font-bold md:text-6xl gradient-title">
            Your interview edge
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground md:text-lg">
            Hi {firstName} — here&apos;s a focused readout in the same style as
            your quiz analytics and voice debriefs. Use it as a prep checklist
            before your next mock or live round.
          </p>
        </div>
        <p className="text-xs text-muted-foreground lg:text-right">
          Insights refreshed · {coachingSnapshot.refreshedDisplay}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quiz average</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coachingSnapshot.quizAverageDisplay}</div>
            <p className="text-xs text-muted-foreground">
              Blended across {coachingSnapshot.quizzesAnalyzedDisplay} practice sets
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voice sessions</CardTitle>
            <Mic className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {coachingSnapshot.voiceSessionsDisplay}
            </div>
            <p className="text-xs text-muted-foreground">
              Completed practice calls in your workspace
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Strongest signal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold leading-tight">
              {coachingSnapshot.strongestBand}
            </div>
            <p className="text-xs text-muted-foreground">
              Where your answers landed most consistently
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Watch next</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold leading-tight">
              {coachingSnapshot.watchBand}
            </div>
            <p className="text-xs text-muted-foreground">
              Highest-leverage tweak before the next round
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/15 bg-muted/20">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <CardTitle className="gradient-title text-2xl md:text-3xl">
                Momentum snapshot
              </CardTitle>
              <CardDescription className="text-base">
                Status ·{" "}
                <span className="font-medium text-foreground">
                  {coachingSnapshot.headlineMetric}
                </span>{" "}
                — keep stacking reps on voice + quizzes to widen your comfort
                band.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div>
        <h2 className="mb-4 text-2xl font-bold md:text-3xl gradient-title">
          Themes we&apos;d double down on
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {focusThemes.map((theme) => (
            <Card key={theme.id} className="flex flex-col">
              <CardHeader>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                    {theme.label}
                  </Badge>
                </div>
                <CardTitle className="text-lg leading-snug">{theme.title}</CardTitle>
                <CardDescription className="text-xs italic text-muted-foreground">
                  {theme.hint}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {theme.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-bold md:text-3xl gradient-title">
          Playbook — quick wins
        </h2>
        <div className="space-y-4">
          {playbookTips.map((tip, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{tip.tag}</Badge>
                </div>
                <CardTitle className="text-xl">{tip.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {tip.context}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc space-y-1.5 text-sm text-muted-foreground">
                  {tip.points.map((pt, j) => (
                    <li key={j} className="leading-relaxed">
                      {pt}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Pair this brief with your latest quiz recap and voice debrief — adjust
        for every company and role you target.
      </p>
    </div>
  );
}
