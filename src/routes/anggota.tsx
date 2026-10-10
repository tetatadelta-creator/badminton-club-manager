import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, UserCheck, UserX } from "lucide-react";
import { useClub, setState, uid, type Member } from "../lib/store";
import { PageHeader, Card, Badge, Btn, Field, inputCls } from "../components/layout";

export const Route = createFileRoute("/anggota")({
  head: () => ({
    meta: [
      { title: "Anggota — Shuttle Club" },
      { name: "description", content: "Kelola data anggota klub badminton: pendaftaran, level, dan status keaktifan." },
      { property: "og:title", content: "Anggota — Shuttle Club" },
      { property: "og:description", content: "Kelola data anggota klub badminton." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnggotaPage,
});

function AnggotaPage() {
  const s = useClub();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [level, setLevel] = useState<Member["level"]>("Pemula");

  function addMember(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setState((st) => ({
      ...st,
      members: [
        ...st.members,
        { id: uid(), name: name.trim(), phone: phone.trim(), level, active: true, joinedAt: new Date().toISOString().slice(0, 10) },
      ],
    }));
    setName("");
    setPhone("");
    setLevel("Pemula");
    setShowForm(false);
  }

  return (
    <div>
      <PageHeader title="Manajemen Anggota" desc={`${s.members.length} anggota terdaftar`}>
        <Btn onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" /> Tambah Anggota
        </Btn>
      </PageHeader>

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={addMember} className="grid gap-4 md:grid-cols-4">
            <Field label="Nama lengkap">
              <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama anggota" required />
            </Field>
            <Field label="No. HP">
              <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xx-xxxx-xxxx" />
            </Field>
            <Field label="Level">
              <select className={inputCls} value={level} onChange={(e) => setLevel(e.target.value as Member["level"])}>
                <option>Pemula</option>
                <option>Menengah</option>
                <option>Mahir</option>
              </select>
            </Field>
            <div className="flex items-end gap-2">
              <Btn type="submit">Simpan</Btn>
              <Btn variant="ghost" onClick={() => setShowForm(false)}>Batal</Btn>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {s.members.map((m) => (
          <Card key={m.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 font-display text-lg font-bold text-primary">
                  {m.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.phone || "—"}</p>
                </div>
              </div>
              <Badge tone={m.active ? "lime" : "red"}>{m.active ? "Aktif" : "Nonaktif"}</Badge>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>Level: <span className="font-medium text-foreground">{m.level}</span></span>
              <span>Bergabung {m.joinedAt}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <Btn
                variant="ghost"
                className="flex-1"
                onClick={() =>
                  setState((st) => ({
                    ...st,
                    members: st.members.map((x) => (x.id === m.id ? { ...x, active: !x.active } : x)),
                  }))
                }
              >
                {m.active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                {m.active ? "Nonaktifkan" : "Aktifkan"}
              </Btn>
              <Btn
                variant="danger"
                onClick={() => setState((st) => ({ ...st, members: st.members.filter((x) => x.id !== m.id) }))}
              >
                <Trash2 className="h-4 w-4" />
              </Btn>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
