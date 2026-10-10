import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, CalendarDays, Wallet, Trophy, ArrowRight } from "lucide-react";
import { useClub, rupiah } from "../lib/store";
import { PageHeader, Card, Badge } from "../components/layout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Shuttle Club" },
      { name: "description", content: "Ringkasan aktivitas klub badminton: anggota, jadwal, kas, dan turnamen." },
      { property: "og:title", content: "Dashboard — Shuttle Club" },
      { property: "og:description", content: "Ringkasan aktivitas klub badminton: anggota, jadwal, kas, dan turnamen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const s = useClub();
  const active = s.members.filter((m) => m.active).length;
  const balance = s.transactions.reduce((a, t) => a + (t.kind === "masuk" ? t.amount : -t.amount), 0);
  const upcoming = [...s.bookings].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  const tour = s.tournaments.find((t) => t.status === "Berlangsung") ?? s.tournaments[0];

  const stats = [
    { label: "Anggota Aktif", value: String(active), icon: Users, to: "/anggota" },
    { label: "Booking Terjadwal", value: String(s.bookings.length), icon: CalendarDays, to: "/jadwal" },
    { label: "Saldo Kas", value: rupiah(balance), icon: Wallet, to: "/keuangan" },
    { label: "Turnamen", value: String(s.tournaments.length), icon: Trophy, to: "/turnamen" },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" desc="Ringkasan aktivitas klub badminton Anda" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, to }) => (
          <Link key={label} to={to}>
            <Card className="transition-transform hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{label}</p>
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 font-display text-2xl font-bold">{value}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Jadwal Terdekat</h2>
            <Link to="/jadwal" className="flex items-center gap-1 text-sm text-primary hover:underline">
              Lihat semua <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {upcoming.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-xl bg-secondary p-3">
                <div>
                  <p className="text-sm font-semibold">Lapangan {b.court} — {b.time}</p>
                  <p className="text-xs text-muted-foreground">{b.date} · {b.bookedBy}</p>
                </div>
                <Badge tone="lime">{b.type}</Badge>
              </div>
            ))}
            {upcoming.length === 0 && <p className="text-sm text-muted-foreground">Belum ada jadwal.</p>}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Peringkat Teratas</h2>
            <Link to="/turnamen" className="flex items-center gap-1 text-sm text-primary hover:underline">
              {tour?.name ?? "Turnamen"} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {(tour?.standings ?? [])
              .slice()
              .sort((a, b) => b.points - a.points)
              .slice(0, 4)
              .map((p, i) => {
                const m = s.members.find((mm) => mm.id === p.memberId);
                return (
                  <div key={p.memberId} className="flex items-center gap-3 rounded-xl bg-secondary p-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 font-display text-sm font-bold text-primary">
                      {i + 1}
                    </span>
                    <p className="flex-1 text-sm font-semibold">{m?.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{p.wins}M / {p.losses}K</p>
                    <p className="font-display text-sm font-bold text-primary">{p.points} poin</p>
                  </div>
                );
              })}
            {(!tour || tour.standings.length === 0) && (
              <p className="text-sm text-muted-foreground">Belum ada data peringkat.</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="court-surface mt-6 flex min-h-40 items-center justify-center rounded-2xl">
        <p className="rounded-xl bg-background/70 px-6 py-3 text-center font-display text-lg font-bold backdrop-blur">
          <span className="text-gradient-lime">Siap bermain?</span> Catat skor pertandingan secara langsung di menu Skor Live.
        </p>
      </Card>
    </div>
  );
}
