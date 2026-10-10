import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, CalendarDays, Wallet, Trophy, ArrowRight, CalendarPlus } from "lucide-react";
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

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatBookingDate(date: string, today: string) {
  if (date === today) return "Hari ini";
  const bookingDate = new Date(`${date}T12:00:00`);
  if (Number.isNaN(bookingDate.getTime())) return date;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(bookingDate);
}

function Dashboard() {
  const s = useClub();
  const today = getLocalDateKey(new Date());
  const active = s.members.filter((m) => m.active).length;
  const balance = s.transactions.reduce((a, t) => a + (t.kind === "masuk" ? t.amount : -t.amount), 0);
  const upcoming = s.bookings
    .filter((booking) => booking.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 4);
  const tour = s.tournaments.find((t) => t.status === "Berlangsung") ?? s.tournaments[0];

  const stats = [
    { label: "Anggota Aktif", value: String(active), icon: Users, to: "/anggota" },
    { label: "Booking Mendatang", value: String(s.bookings.filter((booking) => booking.date >= today).length), icon: CalendarDays, to: "/jadwal" },
    { label: "Saldo Kas", value: rupiah(balance), icon: Wallet, to: "/keuangan" },
    { label: "Turnamen", value: String(s.tournaments.length), icon: Trophy, to: "/turnamen" },
  ];

  const standings = (tour?.standings ?? [])
    .slice()
    .sort((a, b) => b.points - a.points || b.wins - a.wins || a.losses - b.losses)
    .slice(0, 4);

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
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold">Jadwal Terdekat</h2>
              <p className="text-xs text-muted-foreground">Booking hari ini dan berikutnya</p>
            </div>
            <Link to="/jadwal" className="flex shrink-0 items-center gap-1 text-sm text-primary hover:underline">
              Lihat semua <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {upcoming.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-3 rounded-xl bg-secondary p-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Lapangan {b.court} — {b.time}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatBookingDate(b.date, today)} · {b.bookedBy}
                  </p>
                </div>
                <Badge tone="lime">{b.type}</Badge>
              </div>
            ))}
            {upcoming.length === 0 && (
              <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center">
                <CalendarPlus className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                <p className="text-sm font-medium">Belum ada booking mendatang</p>
                <p className="mt-1 text-xs text-muted-foreground">Buat jadwal latihan atau booking lapangan berikutnya.</p>
                <Link to="/jadwal" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                  Buat booking <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold">Peringkat Teratas</h2>
              <p className="text-xs text-muted-foreground">Berdasarkan poin turnamen</p>
            </div>
            <Link to="/turnamen" className="flex max-w-[50%] items-center gap-1 text-sm text-primary hover:underline">
              <span className="truncate">{tour?.name ?? "Turnamen"}</span>
              <ArrowRight className="h-3 w-3 shrink-0" />
            </Link>
          </div>
          <div className="space-y-3">
            {standings.map((p, i) => {
              const m = s.members.find((mm) => mm.id === p.memberId);
              return (
                <div key={p.memberId} className="flex items-center gap-3 rounded-xl bg-secondary p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 font-display text-sm font-bold text-primary">
                    {i + 1}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold">{m?.name ?? "Anggota tidak ditemukan"}</p>
                  <p className="shrink-0 text-xs text-muted-foreground">{p.wins}M / {p.losses}K</p>
                  <p className="shrink-0 font-display text-sm font-bold text-primary">{p.points} poin</p>
                </div>
              );
            })}
            {standings.length === 0 && (
              <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center">
                <Trophy className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                <p className="text-sm font-medium">Belum ada data peringkat</p>
                <p className="mt-1 text-xs text-muted-foreground">Pilih turnamen dan catat hasil pertandingan untuk membangun klasemen.</p>
                <Link to="/turnamen" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                  Kelola turnamen <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="court-surface mt-6 flex min-h-40 items-center justify-center rounded-2xl">
        <div className="rounded-xl bg-background/70 px-6 py-3 text-center backdrop-blur">
          <p className="font-display text-lg font-bold">
            <span className="text-gradient-lime">Siap bermain?</span>
          </p>
          <p className="mt-1 text-sm">Catat skor pertandingan secara langsung di menu Skor Live.</p>
          <Link to="/skor" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            Buka Skor Live <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </Card>
    </div>
  );
}
