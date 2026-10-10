import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useClub, setState, uid, rupiah } from "../lib/store";
import { PageHeader, Card, Badge, Btn, Field, inputCls } from "../components/layout";

export const Route = createFileRoute("/keuangan")({
  head: () => ({
    meta: [
      { title: "Keuangan & Iuran — Shuttle Club" },
      { name: "description", content: "Catat iuran anggota, pemasukan, pengeluaran, dan lihat laporan kas klub." },
      { property: "og:title", content: "Keuangan & Iuran — Shuttle Club" },
      { property: "og:description", content: "Catat iuran anggota, pemasukan, pengeluaran, dan laporan kas klub." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KeuanganPage,
});

function KeuanganPage() {
  const s = useClub();
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [kind, setKind] = useState<"masuk" | "keluar">("masuk");

  const masuk = s.transactions.filter((t) => t.kind === "masuk").reduce((a, t) => a + t.amount, 0);
  const keluar = s.transactions.filter((t) => t.kind === "keluar").reduce((a, t) => a + t.amount, 0);
  const saldo = masuk - keluar;

  function addTx(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(amount);
    if (!desc.trim() || !n || n <= 0) return;
    setState((st) => ({
      ...st,
      transactions: [
        { id: uid(), date: new Date().toISOString().slice(0, 10), description: desc.trim(), amount: n, kind },
        ...st.transactions,
      ],
    }));
    setDesc("");
    setAmount("");
  }

  return (
    <div>
      <PageHeader title="Keuangan & Iuran" desc="Catat pemasukan dan pengeluaran kas klub" />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Wallet className="h-4 w-4 text-primary" /> Saldo Kas</div>
          <p className="mt-2 font-display text-2xl font-bold text-primary">{rupiah(saldo)}</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><TrendingUp className="h-4 w-4 text-primary" /> Total Pemasukan</div>
          <p className="mt-2 font-display text-2xl font-bold">{rupiah(masuk)}</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><TrendingDown className="h-4 w-4 text-destructive" /> Total Pengeluaran</div>
          <p className="mt-2 font-display text-2xl font-bold">{rupiah(keluar)}</p>
        </Card>
      </div>

      <Card className="mb-6">
        <form onSubmit={addTx} className="grid gap-4 md:grid-cols-4">
          <Field label="Deskripsi">
            <input className={inputCls} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="cth. Iuran bulanan" required />
          </Field>
          <Field label="Jumlah (Rp)">
            <input type="number" min={1} className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="150000" required />
          </Field>
          <Field label="Jenis">
            <select className={inputCls} value={kind} onChange={(e) => setKind(e.target.value as "masuk" | "keluar")}>
              <option value="masuk">Pemasukan</option>
              <option value="keluar">Pengeluaran</option>
            </select>
          </Field>
          <div className="flex items-end">
            <Btn type="submit" className="w-full"><Plus className="h-4 w-4" /> Catat</Btn>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="mb-4 font-display text-lg font-semibold">Riwayat Transaksi</h2>
        <div className="space-y-2">
          {s.transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-lg bg-secondary p-3">
              <div>
                <p className="text-sm font-semibold">{t.description}</p>
                <p className="text-xs text-muted-foreground">{t.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={t.kind === "masuk" ? "lime" : "red"}>
                  {t.kind === "masuk" ? "+" : "−"} {rupiah(t.amount)}
                </Badge>
                <button
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setState((st) => ({ ...st, transactions: st.transactions.filter((x) => x.id !== t.id) }))}
                  aria-label="Hapus transaksi"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {s.transactions.length === 0 && <p className="text-sm text-muted-foreground">Belum ada transaksi.</p>}
        </div>
      </Card>
    </div>
  );
}
