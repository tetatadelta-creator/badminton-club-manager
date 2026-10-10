import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useClub, setState, uid, type Booking } from "../lib/store";
import { PageHeader, Card, Badge, Btn, Field, inputCls } from "../components/layout";

export const Route = createFileRoute("/jadwal")({
  head: () => ({
    meta: [
      { title: "Jadwal & Booking — Shuttle Club" },
      { name: "description", content: "Atur jadwal latihan, pertandingan, dan booking lapangan badminton." },
      { property: "og:title", content: "Jadwal & Booking — Shuttle Club" },
      { property: "og:description", content: "Atur jadwal latihan, pertandingan, dan booking lapangan badminton." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JadwalPage,
});

const COURTS = [1, 2, 3];

function JadwalPage() {
  const s = useClub();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("19:00 - 21:00");
  const [court, setCourt] = useState(1);
  const [bookedBy, setBookedBy] = useState("");
  const [type, setType] = useState<Booking["type"]>("Latihan");

  function addBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!bookedBy.trim()) return;
    setState((st) => ({
      ...st,
      bookings: [...st.bookings, { id: uid(), court, date, time, bookedBy: bookedBy.trim(), type }],
    }));
    setBookedBy("");
  }

  const sorted = [...s.bookings].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <PageHeader title="Jadwal & Booking Lapangan" desc="Atur jadwal latihan, pertandingan, dan sparing" />

      <Card className="mb-6">
        <form onSubmit={addBooking} className="grid gap-4 md:grid-cols-6">
          <Field label="Tanggal">
            <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} required />
          </Field>
          <Field label="Jam">
            <input className={inputCls} value={time} onChange={(e) => setTime(e.target.value)} required />
          </Field>
          <Field label="Lapangan">
            <select className={inputCls} value={court} onChange={(e) => setCourt(Number(e.target.value))}>
              {COURTS.map((c) => (
                <option key={c} value={c}>Lapangan {c}</option>
              ))}
            </select>
          </Field>
          <Field label="Jenis">
            <select className={inputCls} value={type} onChange={(e) => setType(e.target.value as Booking["type"])}>
              <option>Latihan</option>
              <option>Pertandingan</option>
              <option>Sparing</option>
            </select>
          </Field>
          <Field label="Pemesan">
            <input className={inputCls} value={bookedBy} onChange={(e) => setBookedBy(e.target.value)} placeholder="Nama" required />
          </Field>
          <div className="flex items-end">
            <Btn type="submit" className="w-full"><Plus className="h-4 w-4" /> Booking</Btn>
          </div>
        </form>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {COURTS.map((c) => (
          <Card key={c}>
            <div className="court-surface mb-4 flex h-24 items-center justify-center rounded-xl">
              <span className="rounded-lg bg-background/70 px-4 py-1.5 font-display text-sm font-bold backdrop-blur">
                Lapangan {c}
              </span>
            </div>
            <div className="space-y-2">
              {sorted.filter((b) => b.court === c).map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                  <div>
                    <p className="text-sm font-semibold">{b.date} · {b.time}</p>
                    <p className="text-xs text-muted-foreground">{b.bookedBy}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone="lime">{b.type}</Badge>
                    <button
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setState((st) => ({ ...st, bookings: st.bookings.filter((x) => x.id !== b.id) }))}
                      aria-label="Hapus booking"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {sorted.filter((b) => b.court === c).length === 0 && (
                <p className="py-2 text-center text-xs text-muted-foreground">Belum ada booking</p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
