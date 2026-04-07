/**
 * Curated coaching copy shaped like a personalized brief.
 * Not tied to live DB data — reads naturally as post-quiz / post-interview guidance.
 */

export const coachingSnapshot = {
  headlineMetric: "On track",
  quizAverageDisplay: "76%",
  quizzesAnalyzedDisplay: "8",
  voiceSessionsDisplay: "5",
  strongestBand: "Problem decomposition",
  watchBand: "Time-boxed answers",
  lastInsightWindow: "Last 14 days",
  refreshedDisplay: "Today · 9:41 AM",
};

export const focusThemes = [
  {
    id: "quiz",
    label: "Quiz performance",
    hint: "Typical gap after your score band",
    title: "Slow down on the first pass, then accelerate",
    body:
      "Across sessions in your range, accuracy jumps when candidates read the full stem before eliminating options. Spend 10 seconds to classify the question (concept vs. scenario vs. trade-off) before touching an answer.",
  },
  {
    id: "voice",
    label: "Voice interviews",
    hint: "Common after multi-turn practice",
    title: "Use a 3-beat structure for behavioral prompts",
    body:
      "Brief context → what you did → measurable outcome. Keeping each beat under 20 seconds preserves energy for follow-ups and mirrors how strong debriefs are structured.",
  },
  {
    id: "technical",
    label: "Technical depth",
    hint: "Aligned with recurring follow-up questions",
    title: "Name assumptions before you optimize",
    body:
      "Interviewers often probe what you held constant. Stating constraints early (“I’m assuming read-heavy traffic…”) signals senior thinking and reduces surprise pivots mid-answer.",
  },
];

export const playbookTips = [
  {
    tag: "Signal boost",
    title: "Open with the decision, not the journey",
    context:
      "In debriefs similar to your recent mix, candidates who lead with the recommendation before backstory keep interviewers engaged longer.",
    points: [
      "One sentence: what you would do and why it matters.",
      "Then unpack trade-offs only if they nod or ask.",
    ],
  },
  {
    tag: "Quiz → interview bridge",
    title: "Turn weak quiz topics into stories",
    context:
      "Topics that show variance in your practice set are prime for a prepared anecdote, even if the interview stays high-level.",
    points: [
      "Pick one missed theme per week; write a 60s story with a metric.",
      "Rehearse aloud once — voice sessions reward muscle memory.",
    ],
  },
  {
    tag: "Voice session habit",
    title: "Pause, breathe, then answer",
    context:
      "Short silences under 2s rarely hurt scores; rushed fillers do. This pattern shows up in stronger transcript reviews.",
    points: [
      "Nod mentally to “question type” before speaking.",
      "If stuck, ask one clarifying question instead of rambling.",
    ],
  },
  {
    tag: "Closing arc",
    title: "End with curiosity that maps to the role",
    context:
      "Final questions that tie to team workflow or success metrics tend to extend conversations positively in comparable profiles.",
    points: [
      "Ask how success is measured in 90 days.",
      "Reference something they said earlier to show listening.",
    ],
  },
  {
    tag: "Stress control",
    title: "Pre-call 90 seconds",
    context:
      "Candidates who rehearse a single win + one risk mitigated report calmer openers in voice analytics summaries.",
    points: [
      "Whisper your 3-beat story once before joining.",
      "Keep water nearby; sip during their long prompts.",
    ],
  },
  {
    tag: "Follow-up discipline",
    title: "Send a tight thank-you within 24h",
    context:
      "Short notes that reference a specific problem discussed outperform generic gratitude in downstream surveys.",
    points: [
      "3 sentences: appreciation, one idea you’d explore, enthusiasm.",
      "No apologies for perceived mistakes unless asked to clarify.",
    ],
  },
];
