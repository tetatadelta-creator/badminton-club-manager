import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, ArrowDown, X } from "lucide-react";
import { useClub, setState, uid, memberName } from "../lib/store";
import { PageHeader, Card, Btn, inputCls } from "../components/layout";

export const Route = createFileRoute("/giliran")({
  head: () => ({
    meta: [
      { title: "Giliran Bermain — Shuttle Club" },
      { name: "description", content: "Atur antrian dan giliran bermain anggota di setiap lapangan." },
      { property: "og:title", content: "Giliran Bermain — Shuttle Club" },
      { property: "og:description", content: "Atur antrian dan giliran bermain anggota di setiap lapangan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GiliranPage,
});

const COURTS = [1, 2, 3];

function GiliranPage() {
  const s = useClub();
  const [memberId, setMemberId] = useState("");
  const [court, setCourt] = useState(1);

  function addToQueue(e: React.FormEvent) {
    e.preventDefault();
    if (!memberId) return;
    setState((st) => {
      const maxOrder = Math.max(0, ...st.rotation.filter((r) => r.court === court).map((r) => r.order));
      return { ...st, rotation: [...st.rotation, { id: uid(), memberId, court, order: maxOrder + 1 }] };
    });
    setMemberId("");
  }

  function nextTurn(c: number) {
    setState((st) => {
      const queue = st.rotation.filter((r) => r.court === c).sort((a, b) => a.order - b.order);
      const first = queue[0];
      if (!first) return st;
      const rest = queue.slice(1);
      const maxOrder = Math.max(0, ...rest.map((r) => r.order));
      const rotated = [
        ...st.rotation.filter((r) => r.court !== c),
        ...rest,
        { ...first, order: maxOrder + 1 },
      ];
      return { ...st, rotation: rotated };
    });
  }

  return (
    <div>
      <PageHeader title="Jadwal Giliran Bermain" desc="Antrian pemain per lapangan — yang selesai main masuk ke belakang antrian" />

      <Card className="mb-6">
        <form onSubmit={addToQueue} className="grid gap-4 md:grid-cols-3">
          <select className={inputCls} value={memberId} onChange={(e) => setMemberId(e.target.value)} required>
            <option value="">Pilih anggota…</option>
            {s.members.filter((m) => m.active).map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <select className={inputCls} value={court} onChange={(e) => setCourt(Number(e.target.value))}>
            {COURTS.map((c) => (
              <option key={c} value={c}>Lapangan {c}</option>
            ))}
          </select>
          <Btn type="submit"><Plus className="h-4 w-4" /> Tambah ke Antrian</Btn>
        </form>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {COURTS.map((c) => {
          const queue = s.rotation.filter((r) => r.court === c).sort((a, b) => a.order - b.order);
          return (
            <Card key={c}>
              <div className="court-surface mb-4 flex h-20 items-center justify-center rounded-xl">
                <span className="rounded-lg bg-background/70 px-4 py-1.5 font-display text-sm font-bold backdrop-blur">
                  Lapangan {c}
                </span>
              </div>
              <div className="space-y-2">
                {queue.map((r, i) => (
                  <div
                    key={r.id}
                    className={`flex items-center gap-3 rounded-lg p-3 ${
                      i < 2 ? "bg-primary/15 ring-1 ring-primary/40" : "bg-secondary"
                    }`}
                  >
                    <span className={`flex h-7 w-7 items-center justify-center rounded-lg font-display text-sm font-bold ${
                      i < 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {i + 1}
                    </span>
                    <p className="flex-1 text-sm font-semibold">{memberName(s, r.memberId)}</p>
                    {i < 2 && <span className="text-xs font-medium text-primary">Bermain</span>}
                    <button
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setState((st) => ({ ...st, rotation: st.rotation.filter((x) => x.id !== r.id) }))}
                      aria-label="Keluarkan dari antrian"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {queue.length === 0 && (
                  <p className="py-2 text-center text-xs text-muted-foreground">Antrian kosong</p>
                )}
              </div>
              {queue.length > 0 && (
                <Btn variant="ghost" className="mt-4 w-full" onClick={() => nextTurn(c)}>
                  <ArrowDown className="h-4 w-4" /> Giliran Berikutnya
                </Btn>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
