import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Wallet,
  Trophy,
  Timer,
  Repeat,
  Volleyball,
} from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/anggota", label: "Anggota", icon: Users },
  { to: "/jadwal", label: "Jadwal & Booking", icon: CalendarDays },
  { to: "/keuangan", label: "Keuangan", icon: Wallet },
  { to: "/turnamen", label: "Turnamen", icon: Trophy },
  { to: "/skor", label: "Skor Live", icon: Timer },
  { to: "/giliran", label: "Giliran Bermain", icon: Repeat },
] as const;

export function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-16 flex-col border-r border-border bg-card md:w-60">
        <div className="flex items-center gap-3 border-b border-border px-4 py-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Volleyball className="h-5 w-5" />
          </div>
          <div className="hidden md:block">
            <p className="font-display text-sm font-bold leading-tight">Shuttle Club</p>
            <p className="text-xs text-muted-foreground">Manajemen Badminton</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-2">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
        <p className="hidden border-t border-border p-4 text-xs text-muted-foreground md:block">
          Demo — data tersimpan di browser
        </p>
      </aside>
      <main className="flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}

export function PageHeader({ title, desc, children }: { title: string; desc?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold md:text-3xl">{title}</h1>
        {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`card-glow rounded-2xl bg-card p-5 ${className}`}>{children}</div>;
}

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "lime" | "red" | "blue" }) {
  const tones = {
    default: "bg-secondary text-secondary-foreground",
    lime: "bg-primary/15 text-primary",
    red: "bg-destructive/15 text-destructive",
    blue: "bg-court/40 text-foreground",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function Btn({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  className?: string;
  type?: "button" | "submit";
}) {
  const styles = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    ghost: "border border-border bg-secondary text-secondary-foreground hover:bg-accent",
    danger: "bg-destructive/15 text-destructive hover:bg-destructive/25",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring";
