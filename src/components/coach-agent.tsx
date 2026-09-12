import {
  Bot,
  Car,
  Check,
  Clock3,
  Footprints,
  Gauge,
  KeyRound,
  Send,
  Sparkles,
  TrafficCone,
  UserRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

type Step = "activity" | "trainer" | "size" | "timing" | "thinking" | "result";

type ChatMessage = {
  id: number;
  from: "agent" | "user";
  text: string;
};

type CoachVenue = {
  name: string;
  area: string;
  activity: "Strength" | "Pilates" | "Calisthenics";
  size: "Boutique" | "Mid-size" | "Flagship";
  km: number;
  freeFlowMin: number;
  walkMin: number;
  ptOnSite: boolean;
  route: string;
  headline: string;
};

const coachVenues: CoachVenue[] = [
  {
    name: "Iron Nord",
    area: "Mar Mikhael",
    activity: "Strength",
    size: "Flagship",
    km: 0.4,
    freeFlowMin: 4,
    walkMin: 6,
    ptOnSite: true,
    route: "Armenia St",
    headline: "42 racks, 3 platforms, coach desk on the floor",
  },
  {
    name: "Form Pilates",
    area: "Beirut Waterfront",
    activity: "Pilates",
    size: "Boutique",
    km: 1.1,
    freeFlowMin: 6,
    walkMin: 15,
    ptOnSite: true,
    route: "Charles Helou",
    headline: "8 reformers, max 8 per class, private coaching bays",
  },
  {
    name: "Apex Calisthenics",
    area: "Achrafieh",
    activity: "Calisthenics",
    size: "Mid-size",
    km: 0.9,
    freeFlowMin: 5,
    walkMin: 12,
    ptOnSite: false,
    route: "Sassine loop",
    headline: "Outdoor rig park, ring station, weighted-vest library",
  },
  {
    name: "Pulse Bay Strength",
    area: "Gemmayze",
    activity: "Strength",
    size: "Boutique",
    km: 0.7,
    freeFlowMin: 4,
    walkMin: 9,
    ptOnSite: true,
    route: "Gouraud St",
    headline: "Quiet 20-cap floor, 2 platforms, coach-only hours",
  },
];

const timingProfiles = {
  now: { label: "Right now", factor: 2.1, congestion: "Heavy", detail: "school run + port trucks" },
  hour: { label: "In an hour", factor: 1.4, congestion: "Moderate", detail: "traffic easing on the corniche" },
  evening: { label: "Tonight, 20:00", factor: 1.1, congestion: "Light", detail: "clear roads after 19:30" },
} as const;

type TimingKey = keyof typeof timingProfiles;

type Answers = {
  activity?: CoachVenue["activity"];
  trainer?: boolean;
  size?: CoachVenue["size"] | "No preference";
  timing?: TimingKey;
};

function driveEta(venue: CoachVenue, timing: TimingKey) {
  return Math.max(3, Math.round(venue.freeFlowMin * timingProfiles[timing].factor));
}

function pickVenues(answers: Answers) {
  const timing = answers.timing ?? "now";
  const scored = coachVenues
    .map((venue) => {
      let score = 0;
      if (venue.activity === answers.activity) score += 40;
      if (answers.trainer && venue.ptOnSite) score += 20;
      if (answers.size && answers.size !== "No preference" && venue.size === answers.size) score += 18;
      score -= driveEta(venue, timing);
      return { venue, score };
    })
    .sort((a, b) => b.score - a.score);
  return { best: scored[0]!.venue, alt: scored[1]!.venue, timing };
}

export function CoachAgent({ onUnlock }: { onUnlock: (venueName: string) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      from: "agent",
      text: "I'm Pulse, your FitPulse matchmaker. Tell me what you want to train and I'll find the venue you can actually reach in time. What kind of session are you after?",
    },
  ]);
  const [step, setStep] = useState<Step>("activity");
  const [answers, setAnswers] = useState<Answers>({});
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing, step]);

  const push = (from: ChatMessage["from"], text: string) =>
    setMessages((prev) => [...prev, { id: prev.length + 2, from, text }]);

  const agentReply = (text: string, nextStep: Step, delay = 700) => {
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      push("agent", text);
      setStep(nextStep);
    }, delay);
  };

  const answer = (label: string, patch: Answers, reply: string, nextStep: Step) => {
    push("user", label);
    const merged = { ...answers, ...patch };
    setAnswers(merged);
    if (nextStep === "result") {
      setStep("thinking");
      setTyping(true);
      window.setTimeout(() => {
        setTyping(false);
        const { best, timing } = pickVenues(merged);
        push(
          "agent",
          `Live traffic check done. ${timingProfiles[timing].congestion} congestion on ${best.route} (${timingProfiles[timing].detail}). ${best.name} is your best match — here's the full read.`,
        );
        setStep("result");
      }, 1600);
      return;
    }
    agentReply(reply, nextStep);
  };

  const reset = () => {
    setMessages([
      {
        id: 1,
        from: "agent",
        text: "Fresh start. What kind of session are you after?",
      },
    ]);
    setAnswers({});
    setStep("activity");
  };

  const options: { hint: string; items: Array<{ label: string; run: () => void }> } | null =
    step === "activity"
      ? {
          hint: "Pick an activity",
          items: (["Strength", "Pilates", "Calisthenics"] as const).map((activity) => ({
            label: activity,
            run: () =>
              answer(
                activity,
                { activity },
                `${activity} it is. Do you want a personal trainer on the floor with you, or are you training solo?`,
                "trainer",
              ),
          })),
        }
      : step === "trainer"
        ? {
            hint: "Coaching",
            items: [
              {
                label: "With a personal trainer",
                run: () =>
                  answer(
                    "With a personal trainer",
                    { trainer: true },
                    "Noted — I'll only shortlist venues with coaches on site. How big a room do you like: a quiet boutique floor, mid-size, or a flagship with everything?",
                    "size",
                  ),
              },
              {
                label: "Training solo",
                run: () =>
                  answer(
                    "Training solo",
                    { trainer: false },
                    "Solo it is. How big a room do you like: a quiet boutique floor, mid-size, or a flagship with everything?",
                    "size",
                  ),
              },
            ],
          }
        : step === "size"
          ? {
              hint: "Gym size",
              items: (["Boutique", "Mid-size", "Flagship", "No preference"] as const).map((size) => ({
                label: size,
                run: () =>
                  answer(
                    size,
                    { size },
                    "Last thing: when are you heading out? I'll price the trip on live traffic, not straight-line distance.",
                    "timing",
                  ),
              })),
            }
          : step === "timing"
            ? {
                hint: "When are you going?",
                items: (Object.keys(timingProfiles) as TimingKey[]).map((key) => ({
                  label: timingProfiles[key].label,
                  run: () => answer(timingProfiles[key].label, { timing: key }, "", "result"),
                })),
              }
            : null;

  const result = step === "result" ? pickVenues(answers) : null;

  return (
    <div className="animate-rise px-4 pt-4">
      <section className="trainer-banner">
        <div className="flex min-w-0 items-center gap-3">
          <span className="icon-box"><Bot /></span>
          <div className="min-w-0">
            <p className="eyebrow text-muted-foreground">AI concierge · demo</p>
            <h2 className="font-display text-lg font-bold uppercase">Pulse Coach</h2>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="font-mono text-[0.6rem] uppercase" onClick={reset}>
          Restart
        </Button>
      </section>

      <div className="mt-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={message.from === "agent" ? "flex items-start gap-2" : "flex items-start justify-end gap-2"}
          >
            {message.from === "agent" && <span className="avatar-token avatar-gold"><Sparkles className="size-3.5" /></span>}
            <p
              className={
                message.from === "agent"
                  ? "max-w-[80%] rounded-xl rounded-tl-sm border border-border bg-card px-3 py-2 text-[0.8rem] leading-relaxed"
                  : "max-w-[80%] rounded-xl rounded-tr-sm bg-primary px-3 py-2 text-[0.8rem] font-medium leading-relaxed text-primary-foreground"
              }
            >
              {message.text}
            </p>
            {message.from === "user" && <span className="avatar-token avatar-mint"><UserRound className="size-3.5" /></span>}
          </div>
        ))}

        {typing && (
          <div className="flex items-center gap-2">
            <span className="avatar-token avatar-gold"><Sparkles className="size-3.5" /></span>
            <p className="rounded-xl rounded-tl-sm border border-border bg-card px-3 py-2 font-mono text-[0.6rem] uppercase text-muted-foreground">
              {step === "thinking" ? "Reading live traffic feeds…" : "Pulse is typing…"}
            </p>
          </div>
        )}

        {result && (
          <div className="digital-pass">
            <p className="eyebrow text-primary">Best match</p>
            <h3 className="mt-1 font-display text-2xl font-bold uppercase">{result.best.name}</h3>
            <p className="mt-1 text-[0.75rem] text-muted-foreground">
              {result.best.area} · {result.best.size} · {result.best.headline}
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="metric">
                <p className="eyebrow">Drive now</p>
                <strong>{driveEta(result.best, result.timing)}′</strong>
                <span>{result.best.km} km</span>
              </div>
              <div className="metric">
                <p className="eyebrow">Walk</p>
                <strong>{result.best.walkMin}′</strong>
                <span>Door to door</span>
              </div>
              <div className="metric">
                <p className="eyebrow">Traffic</p>
                <strong className="text-base leading-6">{timingProfiles[result.timing].congestion}</strong>
                <span>{result.best.route}</span>
              </div>
            </div>

            <ul className="mt-4 space-y-2 text-[0.75rem]">
              <li className="flex items-center gap-2">
                <TrafficCone className="size-3.5 text-primary" />
                Free-flow time {result.best.freeFlowMin}′, live time {driveEta(result.best, result.timing)}′ —
                {" "}{timingProfiles[result.timing].detail}.
              </li>
              <li className="flex items-center gap-2">
                <Gauge className="size-3.5 text-primary" />
                {answers.size && answers.size !== "No preference" ? `${answers.size} floor as requested.` : "Size flexible."}{" "}
                {answers.trainer ? "Coach on site during your slot." : "Solo-friendly at that hour."}
              </li>
              <li className="flex items-center gap-2">
                <Clock3 className="size-3.5 text-primary" />
                Leave by {timingProfiles[result.timing].label.toLowerCase()} to arrive with 10′ to warm up.
              </li>
            </ul>

            <div className="mt-4 grid grid-cols-1 gap-2">
              <Button className="w-full" onClick={() => onUnlock(result.best.name)}>
                <KeyRound className="mr-2 size-4" /> Open access for {result.best.name}
              </Button>
            </div>

            <div className="mt-4 border-t border-border pt-3">
              <p className="eyebrow text-muted-foreground">Backup pick</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <strong className="block truncate text-[0.85rem]">{result.alt.name}</strong>
                  <small className="font-mono text-[0.55rem] text-muted-foreground">
                    {result.alt.area} · {result.alt.size}
                  </small>
                </div>
                <span className="flex items-center gap-2 font-mono text-[0.6rem] text-muted-foreground">
                  <Car className="size-3.5" />{driveEta(result.alt, result.timing)}′
                  <Footprints className="size-3.5" />{result.alt.walkMin}′
                </span>
              </div>
            </div>
          </div>
        )}

        {options && !typing && (
          <div className="pt-1">
            <p className="eyebrow text-muted-foreground">{options.hint}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {options.items.map((item) => (
                <Button
                  key={item.label}
                  variant="outline"
                  size="sm"
                  className="rounded-full text-[0.72rem]"
                  onClick={item.run}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {step === "result" && !typing && (
          <div className="flex items-center gap-2 font-mono text-[0.55rem] uppercase text-muted-foreground">
            <Check className="size-3 text-success" /> Match complete · demo model, no live data
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form
        className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const text = draft.trim();
          if (!text) return;
          setDraft("");
          push("user", text);
          agentReply(
            options
              ? `Got it. Tap one of the ${options.hint.toLowerCase()} options below so I can keep narrowing it down.`
              : "Noted. Tap restart if you'd like me to run a fresh match with that in mind.",
            step,
            600,
          );
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type anything…"
          aria-label="Message Pulse Coach"
          className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-[0.8rem] outline-none placeholder:text-muted-foreground focus:border-primary"
        />
        <Button type="submit" size="icon" aria-label="Send message">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
