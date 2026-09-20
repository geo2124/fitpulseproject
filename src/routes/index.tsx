import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Dumbbell,
  KeyRound,
  LocateFixed,
  Map,
  MapPin,
  Medal,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
  UsersRound,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";

import apexImage from "@/assets/fitpulse-apex.jpg";
import pilatesImage from "@/assets/fitpulse-form-pilates.jpg";
import ironImage from "@/assets/fitpulse-iron-nord.jpg";
import profileImage from "@/assets/fitpulse-profile.jpg";
import { CoachAgent } from "@/components/coach-agent";
import { HeadToHead } from "@/components/head-to-head";
import { SessionExplorer } from "@/components/session-explorer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FitPulse — One Key. Every Gym." },
      {
        name: "description",
        content:
          "Discover gyms and classes nearby, unlock instant access, manage clients, and compete across the FitPulse network.",
      },
      { property: "og:title", content: "FitPulse — One Key. Every Gym." },
      {
        property: "og:description",
        content: "Your premium pass to gyms, studios, trainers, and live fitness competitions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FitPulseApp,
});

type TabId = "access" | "coach" | "train" | "wallet" | "ranks" | "profile";
type Venue = {
  name: string;
  area: string;
  category: string;
  distance: string;
  open: boolean;
  spots: string;
  image: string;
  imageAlt: string;
  color: "gold" | "silver" | "red";
};

const ironNord: Venue = {
    name: "Iron Nord",
    area: "Mar Mikhael",
    category: "Strength",
    distance: "400 m",
    open: true,
    spots: "Open until 23:00",
    image: ironImage,
    imageAlt: "Industrial strength gym with training rigs and kettlebells",
    color: "gold",
  };

const formPilates: Venue = {
    name: "Form Pilates",
    area: "Beirut Waterfront",
    category: "Pilates",
    distance: "1.1 km",
    open: true,
    spots: "4 reformers free",
    image: pilatesImage,
    imageAlt: "Bright Pilates studio overlooking Beirut",
    color: "silver",
  };

const apexCalisthenics: Venue = {
    name: "Apex Calisthenics",
    area: "Achrafieh",
    category: "Calisthenics",
    distance: "900 m",
    open: false,
    spots: "Next slot 18:30",
    image: apexImage,
    imageAlt: "Rooftop calisthenics training at sunset",
    color: "red",
  };

const venues: Venue[] = [ironNord, formPilates, apexCalisthenics];

const categories = ["All", "Strength", "Pilates", "Calisthenics"];

function FitPulseApp() {
  const [tab, setTab] = useState<TabId>("access");
  const [category, setCategory] = useState("All");
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [accessGranted, setAccessGranted] = useState(false);

  const filteredVenues =
    category === "All" ? venues : venues.filter((venue) => venue.category === category);

  const startAccess = (venue: Venue) => {
    setSelectedVenue(venue);
    setAccessGranted(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <div className="app-shell">
        <AppHeader />
        <main className="pb-32">
          {tab === "access" && (
            <AccessView
              category={category}
              filteredVenues={filteredVenues}
              onCategoryChange={setCategory}
              onVenueSelect={startAccess}
            />
          )}
          {tab === "coach" && (
            <CoachAgent
              onUnlock={(venueName) => {
                const match = venues.find((venue) => venue.name === venueName);
                startAccess(
                  match ?? {
                    ...ironNord,
                    name: venueName,
                    area: "Gemmayze",
                    category: "Strength",
                    distance: "700 m",
                    spots: "Coach hours open",
                  },
                );
              }}
            />
          )}
          {tab === "train" && <TrainView />}
          {tab === "wallet" && <WalletView />}
          {tab === "ranks" && <RanksView />}
          {tab === "profile" && <ProfileView />}
        </main>
        <BottomNavigation tab={tab} onTabChange={setTab} />
      </div>

      {selectedVenue && (
        <AccessSheet
          venue={selectedVenue}
          granted={accessGranted}
          onClose={() => setSelectedVenue(null)}
          onGrant={() => setAccessGranted(true)}
        />
      )}
    </div>
  );
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "brand-mark brand-mark-compact" : "brand-mark"} aria-hidden="true">
      <span className="brand-key"><span /></span>
      <span className="brand-pulse" />
    </div>
  );
}

function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-xl">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <BrandMark />
          <div className="min-w-0 leading-none">
            <h1 className="font-display text-lg font-bold uppercase">Fit<span className="text-primary">Pulse</span></h1>
            <p className="mt-1 truncate font-mono text-[9px] uppercase text-muted-foreground">One key · every gym</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="live-chip"><span className="live-dot" />Live</div>
          <img src={profileImage} width={816} height={816} alt="Maya Khoury" className="size-9 rounded-full object-cover ring-1 ring-border" />
        </div>
      </div>
    </header>
  );
}

function AccessView({
  category,
  filteredVenues,
  onCategoryChange,
  onVenueSelect,
}: {
  category: string;
  filteredVenues: Venue[];
  onCategoryChange: (category: string) => void;
  onVenueSelect: (venue: Venue) => void;
}) {
  return (
    <div className="animate-rise">
      <section className="px-4 pt-4">
        <div className="pass-panel">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="tier-box">8</div>
              <div className="min-w-0">
                <p className="eyebrow text-primary">Access key · Tier 8</p>
                <p className="truncate text-sm font-semibold">Trainer Pass · 12 client slots</p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="eyebrow">Renews</p>
              <p className="text-xs font-semibold text-success">Oct 02</p>
            </div>
          </div>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-border"><div className="h-full w-3/5 rounded-full bg-primary" /></div>
          <div className="mt-2 flex justify-between font-mono text-[9px] text-muted-foreground">
            <span>34 venues unlocked</span><span>208 check-ins</span>
          </div>
        </div>
      </section>

      <section className="mt-5 px-4">
        <SectionHeading label="Nearby · 1.2 km" action={<><Radio className="size-3" /> Radar</>} />
        <div className="radar-map" aria-label="Nearby venue radar map">
          <div className="radar-street radar-street-a" />
          <div className="radar-street radar-street-b" />
          <div className="radar-ring radar-ring-outer" />
          <div className="radar-ring radar-ring-inner" />
          <div className="radar-sweep" />
          <div className="radar-you"><LocateFixed className="size-3" /></div>
          <MapPinButton label="Iron Nord" distance="400m" position="pin-one" tone="success" onClick={() => onVenueSelect(ironNord)} />
          <MapPinButton label="Apex" distance="900m" position="pin-two" tone="danger" onClick={() => onVenueSelect(apexCalisthenics)} />
          <MapPinButton label="Form" distance="1.1km" position="pin-three" tone="silver" onClick={() => onVenueSelect(formPilates)} />
          <div className="absolute bottom-3 left-3 rounded-md border border-border bg-background/80 px-2 py-1 font-mono text-[8px] text-muted-foreground backdrop-blur-md">BEIRUT · 33.8938° N</div>
        </div>
      </section>

      <section className="mt-5">
        <div className="px-4">
          <SectionHeading label="Find your next session" action={<><Search className="size-3" /> Search</>} />
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-3">
            {categories.map((item) => (
              <Button key={item} size="sm" variant={category === item ? "default" : "outline"} onClick={() => onCategoryChange(item)} className="shrink-0 font-mono text-[10px] uppercase">
                {item}
              </Button>
            ))}
          </div>
        </div>
        <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto px-4 pb-2">
          {filteredVenues.map((venue) => <VenueCard key={venue.name} venue={venue} onSelect={() => onVenueSelect(venue)} />)}
        </div>
      </section>

      <section className="mt-5 px-4">
        <SectionHeading label="Today · classes" action={<>12 available <ChevronRight className="size-3" /></>} />
        <div className="space-y-2">
          <ClassRow time="18:30" title="Reformer Core" venue="Form Pilates" spots="4 spots" />
          <ClassRow time="19:15" title="Barbell Engine" venue="Iron Nord" spots="8 spots" />
        </div>
      </section>

      <section className="mt-5 px-4">
        <SectionHeading label="Live network" action={<span className="text-success">Streaming</span>} />
        <div className="grid grid-cols-3 gap-2">
          <Metric label="Deadlift" value="312" suffix="kg · R. Vega" />
          <Metric label="Push-ups" value="148" suffix="1 min · M. Osei" />
          <Metric label="Plank" value="6:32" suffix="hold · L. Park" />
        </div>
      </section>
    </div>
  );
}

function MapPinButton({ label, distance, position, tone, onClick }: { label: string; distance: string; position: string; tone: string; onClick: () => void }) {
  return (
    <Button variant="ghost" onClick={onClick} className={`map-pin ${position}`} aria-label={`${label}, ${distance}`}>
      <span className={`map-pin-dot map-pin-${tone}`} />
      <span className="map-pin-label">{label}<span> · {distance}</span></span>
    </Button>
  );
}

function VenueCard({ venue, onSelect }: { venue: Venue; onSelect: () => void }) {
  return (
    <article className="venue-card">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={venue.image} alt={venue.imageAlt} width={1024} height={768} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
        <span className={`status-chip ${venue.open ? "status-open" : "status-busy"}`}>{venue.open ? "Open" : "Busy"}</span>
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-display text-base font-semibold uppercase">{venue.name}</h3>
            <p className="mt-0.5 truncate font-mono text-[9px] text-muted-foreground">{venue.area} · {venue.category}</p>
          </div>
          <span className="shrink-0 font-mono text-[9px] text-primary">{venue.distance}</span>
        </div>
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <span className="truncate text-[11px] text-muted-foreground">{venue.spots}</span>
          <Button size="sm" onClick={onSelect}>Access <ArrowRight /></Button>
        </div>
      </div>
    </article>
  );
}

function ClassRow({ time, title, venue, spots }: { time: string; title: string; venue: string; spots: string }) {
  const [joined, setJoined] = useState(false);
  return (
    <div className="data-row">
      <div className="shrink-0 text-center"><p className="font-display text-lg font-semibold">{time}</p><p className="eyebrow">Today</p></div>
      <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{title}</p><p className="truncate text-[11px] text-muted-foreground">{venue} · {spots}</p></div>
      <Button size="sm" variant={joined ? "secondary" : "default"} onClick={() => setJoined(!joined)}>{joined ? <><Check /> Joined</> : "Book"}</Button>
    </div>
  );
}

function TrainView() {
  const [mode, setMode] = useState<"trainer" | "personal" | "explore">("trainer");
  return (
    <div className="animate-rise px-4 pt-5">
      <PageIntro eyebrow="Training desk" title="Your week in motion" copy="Book sessions for yourself or coordinate client access across the network." />
      <div className="segmented mt-5">
        <Button variant={mode === "trainer" ? "default" : "ghost"} onClick={() => setMode("trainer")}>Trainer</Button>
        <Button variant={mode === "personal" ? "default" : "ghost"} onClick={() => setMode("personal")}>Personal</Button>
        <Button variant={mode === "explore" ? "default" : "ghost"} onClick={() => setMode("explore")}>Explore</Button>
      </div>
      {mode === "trainer" && <TrainerDashboard />}
      {mode === "personal" && <PersonalSchedule />}
      {mode === "explore" && <SessionExplorer />}
    </div>
  );
}

function TrainerDashboard() {
  return (
    <>
      <section className="mt-5 grid grid-cols-3 gap-2">
        <Metric label="Clients" value="12" suffix="10 active" />
        <Metric label="Sessions" value="26" suffix="this month" />
        <Metric label="Areas" value="4" suffix="unlocked" />
      </section>
      <section className="mt-6">
        <SectionHeading label="Next sessions" action={<CalendarDays className="size-3" />} />
        <div className="space-y-2">
          <ClientRow initials="RK" name="Rami Karam" detail="18:00 · Iron Nord" tone="gold" />
          <ClientRow initials="SJ" name="Sarah Jaber" detail="19:30 · Form Pilates" tone="mint" />
          <ClientRow initials="MK" name="Mounir Khalil" detail="21:00 · Apex" tone="red" />
        </div>
      </section>
      <section className="trainer-banner mt-6">
        <div className="flex items-center gap-3"><div className="icon-box"><UsersRound /></div><div><p className="text-sm font-semibold">Client guest keys</p><p className="text-[11px] text-muted-foreground">2 of 5 day passes ready</p></div></div>
        <Button size="sm">Send key</Button>
      </section>
    </>
  );
}

function PersonalSchedule() {
  return (
    <section className="mt-5 space-y-3">
      <div className="schedule-card"><p className="eyebrow text-primary">Monday · 18:30</p><h3 className="mt-2 font-display text-xl uppercase">Reformer Core</h3><p className="mt-1 text-xs text-muted-foreground">Form Pilates · Coach Dalia · 50 min</p></div>
      <div className="schedule-card"><p className="eyebrow text-primary">Wednesday · 19:15</p><h3 className="mt-2 font-display text-xl uppercase">Barbell Engine</h3><p className="mt-1 text-xs text-muted-foreground">Iron Nord · Coach Karim · 60 min</p></div>
      <Button className="w-full"><Search /> Find another session</Button>
    </section>
  );
}

function WalletView() {
  const [bundle, setBundle] = useState("Elite");
  return (
    <div className="animate-rise px-4 pt-5">
      <PageIntro eyebrow="Pass wallet" title="Access without limits" copy="Your keys, guest passes, and bundle usage in one secure place." />
      <div className="digital-pass mt-5">
        <div className="flex items-start justify-between"><BrandMark compact /><ShieldCheck className="size-5 text-primary" /></div>
        <p className="mt-8 font-mono text-[10px] uppercase text-primary">Elite Trainer · FP 0842</p>
        <p className="mt-2 font-display text-3xl uppercase">Maya Khoury</p>
        <div className="mt-8 flex justify-between text-[11px] text-muted-foreground"><span>34 venues</span><span>12 client slots</span><span>Valid 10/26</span></div>
      </div>
      <section className="mt-6">
        <SectionHeading label="Upgrade access" action="Monthly" />
        <div className="space-y-2">
          {[{ name: "City", price: "$49", detail: "12 venues · 1 area" }, { name: "Elite", price: "$89", detail: "34 venues · 6 areas" }, { name: "Trainer Pro", price: "$149", detail: "All venues · 20 clients" }].map((item) => (
            <button key={item.name} onClick={() => setBundle(item.name)} className={`bundle-row ${bundle === item.name ? "bundle-selected" : ""}`}>
              <span><strong>{item.name}</strong><small>{item.detail}</small></span><span className="font-display text-xl">{item.price}<small>/mo</small></span>
            </button>
          ))}
        </div>
        <Button className="mt-3 w-full">Choose {bundle} <ArrowRight /></Button>
      </section>
    </div>
  );
}

function RanksView() {
  const [board, setBoard] = useState("Gyms");
  return (
    <div className="animate-rise px-4 pt-5">
      <PageIntro eyebrow="FitPulse league" title="Beirut power rankings" copy="Live results from simultaneous events across the network." />
      <div className="live-event mt-5">
        <div><p className="eyebrow text-danger">Live · Event 03</p><h2 className="mt-1 font-display text-2xl uppercase">Deadlift showdown</h2><p className="mt-1 text-xs text-muted-foreground">8 venues · 42 athletes · 02:18:44 left</p></div>
        <Trophy className="size-9 text-primary" />
      </div>
      <div className="segmented mt-5">
        {["Gyms", "Athletes", "Head to head"].map((item) => <Button key={item} variant={board === item ? "default" : "ghost"} onClick={() => setBoard(item)}>{item}</Button>)}
      </div>
      <section className="mt-5">
        <SectionHeading label={`${board} · this week`} action="Calisthenics" />
        <div className="ranking-table">
          <RankRow rank="01" name={board === "Athletes" ? "Rami Vega" : "Iron Nord"} detail="12 athletes · ↑2" score="1,284" winner />
          <RankRow rank="02" name={board === "Athletes" ? "Maya Osei" : "Apex Calisthenics"} detail="9 athletes · —" score="1,102" />
          <RankRow rank="03" name={board === "Athletes" ? "Lina Park" : "Form Pilates"} detail="14 athletes · ↑1" score="946" />
          <RankRow rank="04" name={board === "Athletes" ? "Karim Saad" : "Great Bar"} detail="7 athletes · ↓2" score="811" />
        </div>
      </section>
      <section className="mt-6">
        <SectionHeading label="Upcoming events" action="View calendar" />
        <div className="event-card"><div className="date-block"><strong>18</strong><span>SEP</span></div><div className="min-w-0 flex-1"><h3 className="truncate font-semibold">Push-up King · City Final</h3><p className="mt-1 text-[11px] text-muted-foreground">Seaside Arena · 19:00 · 84 registered</p></div><ChevronRight className="size-4 text-muted-foreground" /></div>
      </section>
    </div>
  );
}

function ProfileView() {
  return (
    <div className="animate-rise px-4 pt-5">
      <div className="flex items-center gap-4">
        <img src={profileImage} width={816} height={816} alt="Maya Khoury" className="size-20 rounded-full object-cover ring-2 ring-primary" />
        <div><p className="eyebrow text-primary">Elite trainer</p><h2 className="font-display text-3xl uppercase">Maya Khoury</h2><p className="text-xs text-muted-foreground">Beirut · Member since 2024</p></div>
      </div>
      <section className="mt-6 grid grid-cols-3 gap-2"><Metric label="Check-ins" value="208" suffix="all time" /><Metric label="Rank" value="#14" suffix="Beirut" /><Metric label="Points" value="842" suffix="season" /></section>
      <section className="mt-6"><SectionHeading label="Achievements" action={<Medal className="size-3" />} /><div className="grid grid-cols-3 gap-2"><Achievement icon={<Zap />} label="30 day streak" /><Achievement icon={<Trophy />} label="Top 20" /><Achievement icon={<Sparkles />} label="Early member" /></div></section>
      <section className="mt-6"><SectionHeading label="Activity" action="September" /><div className="activity-grid">{Array.from({ length: 28 }, (_, i) => <span key={i} className={i % 5 === 0 || i % 7 === 0 ? "activity-strong" : i % 3 === 0 ? "activity-mid" : ""} />)}</div></section>
      <div className="mt-6 space-y-2"><ProfileRow icon={<WalletCards />} label="Membership & billing" /><ProfileRow icon={<UsersRound />} label="Trainer clients" /><ProfileRow icon={<ShieldCheck />} label="Access & security" /></div>
    </div>
  );
}

function SectionHeading({ label, action }: { label: string; action: React.ReactNode }) {
  return <div className="mb-2 flex items-center justify-between gap-3"><h2 className="eyebrow text-muted-foreground">{label}</h2><div className="flex items-center gap-1 font-mono text-[9px] uppercase text-primary">{action}</div></div>;
}

function PageIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <header><p className="eyebrow text-primary">{eyebrow}</p><h2 className="mt-2 font-display text-4xl font-bold uppercase leading-none">{title}</h2><p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">{copy}</p></header>;
}

function Metric({ label, value, suffix }: { label: string; value: string; suffix: string }) {
  return <div className="metric"><p className="eyebrow">{label}</p><strong>{value}</strong><span>{suffix}</span></div>;
}

function ClientRow({ initials, name, detail, tone }: { initials: string; name: string; detail: string; tone: string }) {
  return <div className="data-row"><div className={`avatar-token avatar-${tone}`}>{initials}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{name}</p><p className="truncate text-[11px] text-muted-foreground">{detail}</p></div><Button size="icon" variant="ghost" aria-label={`Open ${name}`}><ChevronRight /></Button></div>;
}

function RankRow({ rank, name, detail, score, winner = false }: { rank: string; name: string; detail: string; score: string; winner?: boolean }) {
  return <div className={`rank-row ${winner ? "rank-winner" : ""}`}><span className="rank-number">{rank}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{name}</p><p className="text-[9px] text-muted-foreground">{detail}</p></div><div className="text-right"><strong className="font-display text-lg">{score}</strong><p className="eyebrow text-success">pts</p></div></div>;
}

function Achievement({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <div className="achievement"><span>{icon}</span><p>{label}</p></div>;
}

function ProfileRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <button className="profile-row"><span>{icon}</span><strong>{label}</strong><ChevronRight /></button>;
}

function AccessSheet({ venue, granted, onClose, onGrant }: { venue: Venue; granted: boolean; onClose: () => void; onGrant: () => void }) {
  return (
    <div className="sheet-backdrop" role="dialog" aria-modal="true" aria-label={`Access ${venue.name}`}>
      <button className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close access panel" />
      <div className="access-sheet animate-sheet-up">
        <Button size="icon" variant="ghost" onClick={onClose} className="absolute right-3 top-3 z-10" aria-label="Close"><X /></Button>
        {granted ? (
          <div className="px-5 pb-8 pt-10 text-center">
            <div className="success-ring mx-auto"><Check /></div>
            <p className="mt-5 eyebrow text-success">Access granted</p>
            <h2 className="mt-2 font-display text-3xl uppercase">Welcome to {venue.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">Gate 02 is open for 30 seconds. Your visit has been added to your pass.</p>
            <Button className="mt-6 w-full" onClick={onClose}>Start training <Dumbbell /></Button>
          </div>
        ) : (
          <>
            <img src={venue.image} width={1024} height={768} alt={venue.imageAlt} className="h-44 w-full object-cover" />
            <div className="p-5">
              <p className="eyebrow text-primary">Instant access · {venue.distance}</p>
              <h2 className="mt-2 font-display text-3xl uppercase">{venue.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{venue.area} · {venue.category} · {venue.spots}</p>
              <div className="mt-5 grid grid-cols-3 gap-2"><Metric label="Capacity" value="64%" suffix="right now" /><Metric label="Access" value="$0" suffix="with pass" /><Metric label="Walk" value="5" suffix="minutes" /></div>
              <Button className="mt-5 h-12 w-full text-base" onClick={onGrant}><KeyRound /> Unlock turnstile</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BottomNavigation({ tab, onTabChange }: { tab: TabId; onTabChange: (tab: TabId) => void }) {
  const tabs: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
    { id: "access", label: "Access", icon: <KeyRound /> },
    { id: "coach", label: "Coach", icon: <Sparkles /> },
    { id: "train", label: "Train", icon: <Dumbbell /> },
    { id: "wallet", label: "Wallet", icon: <WalletCards /> },
    { id: "ranks", label: "Ranks", icon: <Trophy /> },
    { id: "profile", label: "Profile", icon: <CircleUserRound /> },
  ];
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      <div className="grid grid-cols-6">
        {tabs.map((item) => (
          <Button key={item.id} variant="ghost" onClick={() => onTabChange(item.id)} className={`nav-item ${tab === item.id ? "nav-active" : ""}`} aria-current={tab === item.id ? "page" : undefined}>
            {item.icon}<span>{item.label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
}