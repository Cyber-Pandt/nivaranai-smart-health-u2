import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Check, X, Trash2, Plus, Building2, Stethoscope, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { useFacilities } from "@/hooks/useFacilities";
import {
  addDepartment,
  addDoctor,
  deleteDoctor,
  deleteFacility,
  updateFacility,
  type Facility,
} from "@/lib/hospitals";

const ADMIN_PASSWORD = "nivaran2025";

export const Route = createFileRoute("/admin-secret")({
  head: () => ({ meta: [{ title: "Admin — NivaranAI" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");

  if (!authed) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (pw === ADMIN_PASSWORD) setAuthed(true);
              else toast.error("Incorrect password");
            }}
            className="w-full rounded-3xl border border-border bg-card p-8 shadow-soft"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background">
              <Lock className="h-5 w-5" />
            </div>
            <h1 className="font-display mt-4 text-center text-2xl font-semibold">Admin access</h1>
            <p className="mt-1 text-center text-sm text-muted-foreground">Restricted area.</p>
            <input
              type="password"
              autoFocus
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Password"
              className="mt-6 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground"
            />
            <button
              type="submit"
              className="mt-3 w-full rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-mineral"
            >
              Unlock
            </button>
          </form>
        </main>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const facilities = useFacilities();
  const pending = facilities.filter((f) => f.status === "pending");
  const approved = facilities.filter((f) => f.status === "approved");
  const rejected = facilities.filter((f) => f.status === "rejected");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3 w-3" /> Admin
            </div>
            <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Facility management
            </h1>
          </div>
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
            ← Home
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Stat label="Pending" value={pending.length} />
          <Stat label="Approved" value={approved.length} />
          <Stat label="Rejected" value={rejected.length} />
        </div>

        <Section title="Pending review" facilities={pending} />
        <Section title="Approved" facilities={approved} />
        {rejected.length > 0 && <Section title="Rejected" facilities={rejected} />}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-display mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Section({ title, facilities }: { title: string; facilities: Facility[] }) {
  if (facilities.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <div className="mt-3 space-y-3">
        {facilities.map((f) => (
          <FacilityCard key={f.id} facility={f} />
        ))}
      </div>
    </section>
  );
}

function FacilityCard({ facility }: { facility: Facility }) {
  const [open, setOpen] = useState(facility.status === "pending");
  const Icon = facility.type === "Hospital" ? Building2 : Stethoscope;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
            <Icon className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-semibold">{facility.name}</h3>
              <StatusChip status={facility.status} />
            </div>
            <p className="text-xs text-muted-foreground">
              {facility.type} · {facility.location} · {facility.contact}
            </p>
            {facility.licenseFile && (
              <p className="mt-1 text-xs text-foreground/70">📎 {facility.licenseFile}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {facility.status === "pending" && (
            <>
              <button
                onClick={() => {
                  updateFacility(facility.id, { status: "approved" });
                  toast.success(`${facility.name} approved`);
                }}
                className="inline-flex items-center gap-1 rounded-full bg-success px-3 py-1.5 text-xs font-medium text-background hover:opacity-90"
              >
                <Check className="h-3.5 w-3.5" /> Approve
              </button>
              <button
                onClick={() => {
                  updateFacility(facility.id, { status: "rejected" });
                  toast.message(`${facility.name} rejected`);
                }}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary"
              >
                <X className="h-3.5 w-3.5" /> Reject
              </button>
            </>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:bg-secondary"
          >
            {open ? "Hide" : "Manage"}
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete ${facility.name}?`)) {
                deleteFacility(facility.id);
                toast.message("Deleted");
              }
            }}
            className="rounded-full border border-destructive/30 bg-background px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10"
            aria-label="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {open && <ManagePanel facility={facility} />}
    </div>
  );
}

function StatusChip({ status }: { status: Facility["status"] }) {
  const map = {
    pending: "bg-warning/15 text-[oklch(0.45_0.12_60)] border-warning/30",
    approved: "bg-success/15 text-success border-success/30",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
  } as const;
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${map[status]}`}>
      {status}
    </span>
  );
}

function ManagePanel({ facility }: { facility: Facility }) {
  const [deptName, setDeptName] = useState("");
  const [doc, setDoc] = useState({ name: "", specialty: "", departmentId: "", room: "" });
  const isClinic = facility.type === "Clinic";
  const clinicLockedDept = isClinic && facility.departments.length >= 1;
  const clinicLockedDoc = isClinic && facility.doctors.length >= 1;

  return (
    <div className="mt-4 grid gap-4 border-t border-border pt-4 md:grid-cols-2">
      {/* Departments */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Departments
        </h4>
        <div className="mt-2 space-y-1.5">
          {facility.departments.map((d) => (
            <div key={d.id} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
              {d.name}
            </div>
          ))}
          {facility.departments.length === 0 && (
            <p className="text-xs text-muted-foreground">No departments yet.</p>
          )}
        </div>
        {!clinicLockedDept && (
          <div className="mt-2 flex gap-2">
            <input
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              placeholder="Department name"
              className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-foreground"
            />
            <button
              onClick={() => {
                if (!deptName.trim()) return;
                addDepartment(facility.id, deptName.trim());
                setDeptName("");
              }}
              className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:bg-mineral"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Doctors */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Doctors</h4>
        <div className="mt-2 space-y-1.5">
          {facility.doctors.map((d) => {
            const dept = facility.departments.find((x) => x.id === d.departmentId);
            return (
              <div
                key={d.id}
                className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
              >
                <div>
                  <div className="font-medium">{d.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {d.specialty} · {dept?.name ?? "—"} · {d.room ?? "—"}
                  </div>
                </div>
                <button
                  onClick={() => deleteDoctor(facility.id, d.id)}
                  className="rounded-md p-1 text-destructive hover:bg-destructive/10"
                  aria-label="Remove doctor"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
          {facility.doctors.length === 0 && (
            <p className="text-xs text-muted-foreground">No doctors yet.</p>
          )}
        </div>
        {!clinicLockedDoc && facility.departments.length > 0 && (
          <div className="mt-2 grid gap-1.5">
            <input
              value={doc.name}
              onChange={(e) => setDoc({ ...doc, name: e.target.value })}
              placeholder="Dr. Name"
              className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-foreground"
            />
            <div className="grid grid-cols-2 gap-1.5">
              <input
                value={doc.specialty}
                onChange={(e) => setDoc({ ...doc, specialty: e.target.value })}
                placeholder="Specialty"
                className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-foreground"
              />
              <input
                value={doc.room}
                onChange={(e) => setDoc({ ...doc, room: e.target.value })}
                placeholder="Room / OPD"
                className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-foreground"
              />
            </div>
            <select
              value={doc.departmentId}
              onChange={(e) => setDoc({ ...doc, departmentId: e.target.value })}
              className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-foreground"
            >
              <option value="">Select department</option>
              {facility.departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (!doc.name.trim() || !doc.specialty.trim() || !doc.departmentId) {
                  toast.error("Name, specialty, and department required.");
                  return;
                }
                addDoctor(facility.id, {
                  name: doc.name.trim(),
                  specialty: doc.specialty.trim(),
                  departmentId: doc.departmentId,
                  room: doc.room.trim() || undefined,
                });
                setDoc({ name: "", specialty: "", departmentId: "", room: "" });
                toast.success("Doctor added");
              }}
              className="inline-flex items-center justify-center gap-1 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:bg-mineral"
            >
              <Plus className="h-3.5 w-3.5" /> Add doctor
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
