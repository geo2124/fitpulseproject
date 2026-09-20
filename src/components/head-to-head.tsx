import { Flame, Swords, Timer, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type Duel = {
  id: string;
  discipline: string;
  unit: string;
  window: string;
  a: { name: string; gym: string; value: number; tone: string };
  b: { name: string; gym: string; value: number; tone: string };
};

const duels: Duel[] = [
  {
    id: "d1",
    discipline: "Max push-ups · 60s",
    unit: "reps",
    window: "Ends in 14:22",
    a: { name: "Rami Vega", gym: "Iron Nord", value: 148, tone: "avatar-gold" },
    b: { name: "Maya Osei", gym: "Apex Calisthenics", value: 141, tone: "avatar-red" },
  },
  {
    id: "d2",
    discipline: "Deadlift · 1RM",
    unit: "kg",
    window: "Ends in 42:08",
    a: { name: "Karim Saad", gym: "Pulse Bay", value: 288, tone: "avatar-mint" },
    b: { name: "Jad Rizk", gym: "Iron Nord", value: 312, tone: "avatar-gold" },
  },
  {
    id: "d3",
    discipline: "Plank hold",
    unit: "sec",
    window: "Ends in 06:55",
    a: { name: "Lina Park", gym: "Form Pilates", value: 392, tone: "avatar-mint" },
    b: { name: "Dalia Nassar", gym: "Form Pilates", value: 376, tone: "avatar-gold" },
  },
];

export function HeadToHead() {
  const [tick, setTick] = useState(0);
  const [backed, setBacked] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setTick((value) => (value + 1) % 4), 2600);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="space-y-3">
      {duels.map((duel, index) => {
        const drift = index === tick % duels.length ? 3 : 0;
        const aValue = duel.a.value + drift;
        const total = aValue + duel.b.value;
        const aShare = Math.round((aValue / total) * 100);
        const leader = aValue >= duel.b.value ? duel.a : duel.b;

        return (
          <article key={duel.id} className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="eyebrow text-primary">{duel.discipline}</p>
              <span className="flex items-center gap-1 font-mono text-[0.55rem] uppercase text-muted-foreground">
                <Timer className="size-3" />
                {duel.window}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`avatar-token ${duel.a.tone}`}>{initials(duel.a.name)}</span>
                  <div className="min-w-0">
                    <strong className="block truncate text-[0.8rem]">{duel.a.name}</strong>
                    <small className="block truncate font-mono text-[0.55rem] text-muted-foreground">{duel.a.gym}</small>
                  </div>
                </div>
                <p className="mt-2 font-display text-2xl leading-none">
                  {aValue}
                  <span className="ml-1 font-mono text-[0.55rem] uppercase text-muted-foreground">{duel.unit}</span>
                </p>
              </div>

              <Swords className="size-4 shrink-0 text-muted-foreground" />

              <div className="min-w-0 text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="min-w-0">
                    <strong className="block truncate text-[0.8rem]">{duel.b.name}</strong>
                    <small className="block truncate font-mono text-[0.55rem] text-muted-foreground">{duel.b.gym}</small>
                  </div>
                  <span className={`avatar-token ${duel.b.tone}`}>{initials(duel.b.name)}</span>
                </div>
                <p className="mt-2 font-display text-2xl leading-none">
                  {duel.b.value}
                  <span className="ml-1 font-mono text-[0.55rem] uppercase text-muted-foreground">{duel.unit}</span>
                </p>
              </div>
            </div>

            <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-border">
              <div className="h-full bg-primary transition-all duration-700" style={{ width: `${aShare}%` }} />
              <div className="h-full flex-1 bg-muted-foreground/60" />
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="flex items-center gap-1 font-mono text-[0.55rem] uppercase text-muted-foreground">
                <TrendingUp className="size-3 text-success" />
                {leader.name.split(" ")[0]} leads · +{Math.abs(aValue - duel.b.value)} {duel.unit} for {leader.gym}
              </p>
              <Button
                size="sm"
                variant={backed === duel.id ? "secondary" : "outline"}
                className="rounded-full font-mono text-[0.55rem] uppercase"
                onClick={() => setBacked(backed === duel.id ? null : duel.id)}
              >
                <Flame className="mr-1 size-3" />
                {backed === duel.id ? "Backing" : "Back gym"}
              </Button>
            </div>
          </article>
        );
      })}

      <p className="font-mono text-[0.55rem] uppercase text-muted-foreground">
        Duel scores stream from venue judges · demo data
      </p>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}
