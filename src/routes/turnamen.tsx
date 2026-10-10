import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trophy, Medal } from "lucide-react";
import { useClub, setState, uid, memberName, type Tournament } from "../lib/store";
import { PageHeader, Card, Badge, Btn, Field, inputCls } from "../components/layout";

export const Route = createFileRoute("/turnamen")({
  head: () => ({
    meta: [
      { title: "Turnamen & Peringkat — Shuttle Club" },
      { name: "description", content: "Kelola turnamen klub badminton dan pantau peringkat pemain." },
      { property: "og:title", content: "Turnamen & Peringkat — Shuttle Club" },
      { property: "og:description", content: "Kelola turnamen klub badminton dan pantau peringkat pemain." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TurnamenPage,
});

function TurnamenPage() {
  const s = useClub();
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [selected, setSelected] = useState<string | null>(null);

  const tour = s.tournaments.find((t) => t.id === selected) ?? s.tournaments[0];

  function addTournament(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const t: Tournament = { id: uid(), name: name.trim(), date, status: "Akan Datang", standings: [] };
    setState((st) => ({ ...st, tournaments: [...st.tournaments, t] }));
    setName("");
    setSelected(t.id);
  }

  function recordResult(winnerId: string, loserId: string) {
    if (!tour) return;
    setState((st) => ({
      ...st,
      tournaments: st.tournaments.map((t) => {
        if (t.id !== tour.id) return t;
        const list = [...t.standings];
        const ensure = (id: string) => {
          let p = list.find((x) => x.memberId === id);
          if (!p) {
            p = { memberId: id, wins: 0, losses: 0, points: 0 };
            list.push(p);
          }
          return p;
        };
        const w = ensure(winnerId);
        const l = ensure(loserId);
        w.wins += 1;
        w.points += 2;
        l.losses += 1;
        l.points += 1;
        return { ...t, standings: list };
      }),
    }));
  }

  const [winner, setWinner] = useState("");
  const [loser, setLoser] = useState("");

  return (
    <div>
      <PageHeader title="Turnamen & Peringkat" desc="Kelola turnamen dan klasemen pemain" />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <Card>
            <form onSubmit={addTournament} className="space-y-3">
              <Field label="Nama turnamen">
                <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="cth. Internal Cup" required />
              </Field>
              <Field label="Tanggal">
                <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} required />
              </Field>
              <Btn type="submit" className="w-full"><Plus className="h-4 w-4" /> Buat Turnamen</Btn>
            </form>
          </Card>

          {s.tournaments.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`block w-full rounded-2xl border p-4 text-left transition-colors ${
                tour?.id === t.id ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-accent"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold">{t.name}</p>
                <Badge tone={t.status === "Berlangsung" ? "lime" : t.status === "Selesai" ? "default" : "blue"}>{t.status}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t.date}</p>
              {tour?.id === t.id && (
                <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                  {(["Akan Datang", "Berlangsung", "Selesai"] as const).map((st2) => (
                    <button
                      key={st2}
                      className="rounded-md bg-secondary px-2 py-1 text-xs hover:bg-accent"
                      onClick={() =>
                        setState((s2) => ({
                          ...s2,
                          tournaments: s2.tournaments.map((x) => (x.id === t.id ? { ...x, status: st2 } : x)),
                        }))
                      }
                    >
                      {st2}
                    </button>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {tour ? (
            <Card>
              <div className="mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-semibold">{tour.name}</h2>
              </div>

              <div className="mb-6 rounded-xl bg-secondary p-4">
                <p className="mb-3 text-sm font-semibold">Catat Hasil Pertandingan</p>
                <div className="grid gap-3 md:grid-cols-3">
                  <select className={inputCls} value={winner} onChange={(e) => setWinner(e.target.value)}>
                    <option value="">Pemenang…</option>
                    {s.members.filter((m) => m.active && m.id !== loser).map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <select className={inputCls} value={loser} onChange={(e) => setLoser(e.target.value)}>
                    <option value="">Kalah…</option>
                    {s.members.filter((m) => m.active && m.id !== winner).map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <Btn
                    onClick={() => {
                      if (winner && loser) {
                        recordResult(winner, loser);
                        setWinner("");
                        setLoser("");
                      }
                    }}
                  >
                    Simpan Hasil
                  </Btn>
                </div>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-2">#</th>
                    <th className="py-2 pr-2">Pemain</th>
                    <th className="py-2 pr-2 text-center">Menang</th>
                    <th className="py-2 pr-2 text-center">Kalah</th>
                    <th className="py-2 text-right">Poin</th>
                  </tr>
                </thead>
                <tbody>
                  {tour.standings
                    .slice()
                    .sort((a, b) => b.points - a.points)
                    .map((p, i) => (
                      <tr key={p.memberId} className="border-b border-border/50">
                        <td className="py-2.5 pr-2">
                          {i < 3 ? (
                            <Medal className={`h-4 w-4 ${i === 0 ? "text-primary" : "text-muted-foreground"}`} />
                          ) : (
                            <span className="text-muted-foreground">{i + 1}</span>
                          )}
                        </td>
                        <td className="py-2.5 pr-2 font-medium">{memberName(s, p.memberId)}</td>
                        <td className="py-2.5 pr-2 text-center">{p.wins}</td>
                        <td className="py-2.5 pr-2 text-center">{p.losses}</td>
                        <td className="py-2.5 text-right font-display font-bold text-primary">{p.points}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {tour.standings.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">Belum ada hasil pertandingan tercatat.</p>
              )}
            </Card>
          ) : (
            <Card>
              <p className="text-sm text-muted-foreground">Belum ada turnamen. Buat turnamen pertama Anda.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
