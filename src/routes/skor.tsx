import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RotateCcw, Plus } from "lucide-react";
import { useClub } from "../lib/store";
import { PageHeader, Card, Btn, inputCls } from "../components/layout";

export const Route = createFileRoute("/skor")({
  head: () => ({
    meta: [
      { title: "Skor Live — Shuttle Club" },
      { name: "description", content: "Papan skor pertandingan badminton secara langsung dengan sistem rally 21 poin." },
      { property: "og:title", content: "Skor Live — Shuttle Club" },
      { property: "og:description", content: "Papan skor pertandingan badminton secara langsung." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SkorPage,
});

type GameState = {
  a: number;
  b: number;
  setsA: number;
  setsB: number;
  history: string[];
  over: boolean;
};

function SkorPage() {
  const s = useClub();
  const [nameA, setNameA] = useState(s.members[0]?.name ?? "Pemain A");
  const [nameB, setNameB] = useState(s.members[1]?.name ?? "Pemain B");
  const [g, setG] = useState<GameState>({ a: 0, b: 0, setsA: 0, setsB: 0, history: [], over: false });

  function setWinner(w: "a" | "b") {
    const { a, b } = g;
    const lead = w === "a" ? a - b : b - a;
    const pts = w === "a" ? a : b;
    return (pts >= 21 && lead >= 2) || pts === 30;
  }

  function score(side: "a" | "b") {
    if (g.over) return;
    setG((prev) => {
      const next = { ...prev, a: prev.a + (side === "a" ? 1 : 0), b: prev.b + (side === "b" ? 1 : 0) };
      if (setWinner(side)) {
        const setsA = prev.setsA + (side === "a" ? 1 : 0);
        const setsB = prev.setsB + (side === "b" ? 1 : 0);
        const over = setsA === 2 || setsB === 2;
        return {
          a: 0,
          b: 0,
          setsA,
          setsB,
          history: [...prev.history, `${next.a}-${next.b}`],
          over,
        };
      }
      return next;
    });
  }

  function reset() {
    setG({ a: 0, b: 0, setsA: 0, setsB: 0, history: [], over: false });
  }

  const winnerName = g.over ? (g.setsA === 2 ? nameA : nameB) : null;

  return (
    <div>
      <PageHeader title="Skor Live" desc="Papan skor pertandingan — sistem rally, best of 3, 21 poin" />

      <Card className="mx-auto max-w-3xl">
        <div className="mb-6 grid grid-cols-2 gap-4">
          {([["a", nameA, setNameA], ["b", nameB, setNameB]] as const).map(([side, nm, setNm]) => (
            <select key={side} className={inputCls} value={nm} onChange={(e) => setNm(e.target.value)}>
              {s.members.map((m) => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
              <option value={side === "a" ? "Pemain A" : "Pemain B"}>{side === "a" ? "Pemain A" : "Pemain B"}</option>
            </select>
          ))}
        </div>

        <div className="court-surface rounded-2xl p-6 md:p-10">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="rounded-xl bg-background/70 p-6 backdrop-blur">
              <p className="truncate font-display text-lg font-bold">{nameA}</p>
              <p className="font-display text-7xl font-extrabold text-primary md:text-8xl">{g.a}</p>
              <p className="mt-1 text-sm text-muted-foreground">Set: {g.setsA}</p>
            </div>
            <div className="rounded-xl bg-background/70 p-6 backdrop-blur">
              <p className="truncate font-display text-lg font-bold">{nameB}</p>
              <p className="font-display text-7xl font-extrabold text-primary md:text-8xl">{g.b}</p>
              <p className="mt-1 text-sm text-muted-foreground">Set: {g.setsB}</p>
            </div>
          </div>
          {g.history.length > 0 && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Set sebelumnya: {g.history.join(" · ")}
            </p>
          )}
          {winnerName && (
            <p className="mt-4 text-center font-display text-xl font-bold">
              🏸 <span className="text-gradient-lime">{winnerName} memenangkan pertandingan!</span>
            </p>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <Btn onClick={() => score("a")} className="py-4 text-base" >
            <Plus className="h-5 w-5" /> Poin {nameA}
          </Btn>
          <Btn onClick={() => score("b")} className="py-4 text-base">
            <Plus className="h-5 w-5" /> Poin {nameB}
          </Btn>
        </div>
        <div className="mt-3 flex justify-center">
          <Btn variant="ghost" onClick={reset}>
            <RotateCcw className="h-4 w-4" /> Reset Pertandingan
          </Btn>
        </div>
      </Card>
    </div>
  );
}
