import { useSyncExternalStore } from "react";

export type Member = {
  id: string;
  name: string;
  level: "Pemula" | "Menengah" | "Mahir";
  phone: string;
  active: boolean;
  joinedAt: string;
};

export type Booking = {
  id: string;
  court: number;
  date: string;
  time: string;
  bookedBy: string;
  type: "Latihan" | "Pertandingan" | "Sparing";
};

export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  kind: "masuk" | "keluar";
};

export type Player = { memberId: string; wins: number; losses: number; points: number };

export type Tournament = {
  id: string;
  name: string;
  date: string;
  status: "Akan Datang" | "Berlangsung" | "Selesai";
  standings: Player[];
};

export type RotationEntry = { id: string; memberId: string; court: number; order: number };

export type State = {
  members: Member[];
  bookings: Booking[];
  transactions: Transaction[];
  tournaments: Tournament[];
  rotation: RotationEntry[];
};

const KEY = "badminton-club-state-v1";

const seed: State = {
  members: [
    { id: "m1", name: "Andi Pratama", level: "Mahir", phone: "0812-3456-7890", active: true, joinedAt: "2024-01-15" },
    { id: "m2", name: "Budi Santoso", level: "Menengah", phone: "0813-2345-6789", active: true, joinedAt: "2024-03-02" },
    { id: "m3", name: "Citra Dewi", level: "Mahir", phone: "0815-9876-5432", active: true, joinedAt: "2023-11-20" },
    { id: "m4", name: "Dedi Kurniawan", level: "Pemula", phone: "0821-1111-2222", active: true, joinedAt: "2025-02-10" },
    { id: "m5", name: "Eka Putri", level: "Menengah", phone: "0822-3333-4444", active: false, joinedAt: "2024-06-18" },
    { id: "m6", name: "Fajar Nugroho", level: "Mahir", phone: "0831-5555-6666", active: true, joinedAt: "2023-08-05" },
  ],
  bookings: [
    { id: "b1", court: 1, date: "2026-10-10", time: "19:00 - 21:00", bookedBy: "Andi Pratama", type: "Latihan" },
    { id: "b2", court: 2, date: "2026-10-10", time: "19:00 - 21:00", bookedBy: "Citra Dewi", type: "Sparing" },
    { id: "b3", court: 1, date: "2026-10-12", time: "18:00 - 20:00", bookedBy: "Fajar Nugroho", type: "Pertandingan" },
  ],
  transactions: [
    { id: "t1", date: "2026-10-01", description: "Iuran bulanan Oktober (6 anggota)", amount: 900000, kind: "masuk" },
    { id: "t2", date: "2026-10-03", description: "Sewa lapangan minggu 1", amount: 400000, kind: "keluar" },
    { id: "t3", date: "2026-10-05", description: "Pembelian shuttlecock 2 slop", amount: 350000, kind: "keluar" },
  ],
  tournaments: [
    {
      id: "tr1",
      name: "Internal Cup Oktober 2026",
      date: "2026-10-24",
      status: "Berlangsung",
      standings: [
        { memberId: "m1", wins: 4, losses: 1, points: 9 },
        { memberId: "m3", wins: 3, losses: 2, points: 8 },
        { memberId: "m6", wins: 3, losses: 2, points: 7 },
        { memberId: "m2", wins: 2, losses: 3, points: 5 },
        { memberId: "m4", wins: 0, losses: 4, points: 1 },
      ],
    },
    { id: "tr2", name: "Fun Games Akhir Tahun", date: "2026-12-19", status: "Akan Datang", standings: [] },
  ],
  rotation: [
    { id: "r1", memberId: "m1", court: 1, order: 1 },
    { id: "r2", memberId: "m3", court: 1, order: 2 },
    { id: "r3", memberId: "m2", court: 2, order: 1 },
    { id: "r4", memberId: "m6", court: 2, order: 2 },
  ],
};

let state: State = load();
const listeners = new Set<() => void>();

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as State;
  } catch {
    /* ignore */
  }
  return seed;
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function getState(): State {
  return state;
}

export function setState(updater: (s: State) => State) {
  state = updater(state);
  persist();
  listeners.forEach((l) => l());
}

export function useClub(): State {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getState,
  );
}

export const uid = () => Math.random().toString(36).slice(2, 10);

export const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export function memberName(s: State, id: string) {
  return s.members.find((m) => m.id === id)?.name ?? "—";
}
