import { Check, Clock3, Filter, MapPin, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

type Session = {
  id: string;
  title: string;
  venue: string;
  area: string;
  category: "Strength" | "Pilates" | "Calisthenics" | "Recovery";
  time: string;
  hour: number;
  km: number;
  coach: string;
  spots: number;
  intensity: "Low" | "Moderate" | "High";
};

const sessions: Session[] = [
  { id: "s1", title: "Barbell Engine", venue: "Iron Nord", area: "Mar Mikhael", category: "Strength", time: "07:00", hour: 7, km: 0.4, coach: "Karim", spots: 6, intensity: "High" },
  { id: "s2", title: "Reformer Core", venue: "Form Pilates", area: "Waterfront", category: "Pilates", time: "09:30", hour: 9, km: 1.1, coach: "Dalia", spots: 4, intensity: "Moderate" },
  { id: "s3", title: "Ring Skills", venue: "Apex Calisthenics", area: "Achrafieh", category: "Calisthenics", time: "12:15", hour: 12, km: 0.9, coach: "Jad", spots: 9, intensity: "Moderate" },
  { id: "s4", title: "Mobility Reset", venue: "Pulse Bay", area: "Gemmayze", category: "Recovery", time: "16:00", hour: 16, km: 0.7, coach: "Lina", spots: 12, intensity: "Low" },
  { id: "s5", title: "Heavy Squat Club", venue: "Iron Nord", area: "Mar Mikhael", category: "Strength", time: "19:15", hour: 19, km: 0.4, coach: "Karim", spots: 3, intensity: "High" },
  { id: "s6", title: "Night Flow Pilates", venue: "Form Pilates", area: "Waterfront", category: "Pilates", time: "20:45", hour: 20, km: 1.1, coach: "Dalia", spots: 5, intensity: "Low" },
  { id: "s7", title: "Street Workout Jam", venue: "Apex Calisthenics", area: "Achrafieh", category: "Calisthenics", time: "18:30", hour: 18, km: 0.9, coach: "Nour", spots: 14, intensity: "High" },
];

const categories = ["All", "Strength", "Pilates", "Calisthenics", "Recovery"] as const;
const windows = [
  { label: "Any time", from: 0, to: 24 },
  { label: "Morning", from: 5, to: 12 },
  { label: "Midday", from: 12, to: 17 },
  { label: "Evening", from: 17, to: 24 },
] as const;
const radii = [0.5, 1, 2] as const;

export function SessionExplorer() {
  const [category, setCategory] = useState<string>("All");
  const [slot, setSlot] = useState(0);
  const [radius, setRadius] = useState<number>(2);
  const [booked, setBooked] = useState<string[]>([]);

  const results = useMemo(() => {
    const active = windows[slot]!;
    return sessions
      .filter((session) => category === "All" || session.category === category)
      .filter((session) => session.hour >= active.from && session.hour < active.to)
      .filter((session) => session.km <= radius)
      .sort((a, b) => a.hour - b.hour);
  }, [category, slot, radius]);

  return (
    <section className="mt-5">
      <div className="rounded-xl border border-border bg-card p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="eyebrow text-primary">Smart filters</p>
          <span className="flex items-center gap-1 font-mono text-[0.55rem] uppercase text-muted-foreground">
            <Filter className="size-3" />
            {results.length} matches
          </span>
        </div>

        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {categories.map((item) => (
            <Button
              key={item}
              size="sm"
              variant={category === item ? "default" : "outline"}
              className="shrink-0 rounded-full font-mono text-[0.6rem] uppercase"
              onClick={() => setCategory(item)}
            >
              {item}
            </Button>
          ))}
        </div>

        <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
          {windows.map((item, index) => (
            <Button
              key={item.label}
              size="sm"
              variant={slot === index ? "default" : "outline"}
              className="shrink-0 rounded-full font-mono text-[0.6rem] uppercase"
              onClick={() => setSlot(index)}
            >
              <Clock3 className="mr-1 size-3" />
              {item.label}
            </Button>
          ))}
        </div>

        <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
          {radii.map((value) => (
            <Button
              key={value}
              size="sm"
              variant={radius === value ? "default" : "outline"}
              className="shrink-0 rounded-full font-mono text-[0.6rem] uppercase"
              onClick={() => setRadius(value)}
            >
              <MapPin className="mr-1 size-3" />
              within {value} km
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {results.map((session) => {
          const isBooked = booked.includes(session.id);
          return (
            <div key={session.id} className="data-row">
              <div className="shrink-0 text-center">
                <p className="font-display text-lg font-semibold">{session.time}</p>
                <p className="eyebrow">{session.intensity}</p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{session.title}</p>
                <p className="truncate text-[0.68rem] text-muted-foreground">
                  {session.venue} · {session.area} · {session.km} km
                </p>
                <p className="mt-0.5 flex items-center gap-1 font-mono text-[0.55rem] uppercase text-muted-foreground">
                  <Users className="size-3" /> {session.spots} spots · Coach {session.coach}
                </p>
              </div>
              <Button
                size="sm"
                variant={isBooked ? "secondary" : "default"}
                onClick={() =>
                  setBooked((prev) =>
                    prev.includes(session.id) ? prev.filter((id) => id !== session.id) : [...prev, session.id],
                  )
                }
              >
                {isBooked ? (
                  <>
                    <Check /> Booked
                  </>
                ) : (
                  "Book"
                )}
              </Button>
            </div>
          );
        })}

        {results.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-5 text-center text-[0.75rem] text-muted-foreground">
            No sessions in that window nearby. Widen the radius or try another time.
          </p>
        )}
      </div>
    </section>
  );
}
