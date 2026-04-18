import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Plus, X, Building2, Stethoscope, Upload, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { addFacility, type FacilityType } from "@/lib/hospitals";

export const Route = createFileRoute("/signup/hospital")({
  head: () => ({ meta: [{ title: "Hospital / Clinic registration — NivaranAI" }] }),
  component: HospitalSignup,
});

function HospitalSignup() {
  const navigate = useNavigate();
  const [type, setType] = useState<FacilityType>("Hospital");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [contact, setContact] = useState("");
  const [licenseFile, setLicenseFile] = useState("");
  const [departments, setDepartments] = useState<string[]>(["General Medicine"]);
  const [newDept, setNewDept] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isClinic = type === "Clinic";

  const addDept = () => {
    const v = newDept.trim();
    if (!v) return;
    if (isClinic && departments.length >= 1) {
      toast.error("A clinic can only have one department.");
      return;
    }
    if (departments.some((d) => d.toLowerCase() === v.toLowerCase())) {
      toast.error("Department already added.");
      return;
    }
    setDepartments([...departments, v]);
    setNewDept("");
  };

  const removeDept = (i: number) => setDepartments(departments.filter((_, idx) => idx !== i));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim() || !contact.trim()) {
      toast.error("Please fill in name, location, and contact.");
      return;
    }
    if (departments.length === 0) {
      toast.error("Add at least one department.");
      return;
    }
    setSubmitting(true);
    try {
      addFacility({
        name: name.trim(),
        type,
        location: location.trim(),
        contact: contact.trim(),
        licenseFile: licenseFile || undefined,
        departments: (isClinic ? departments.slice(0, 1) : departments).map((n) => ({
          id: crypto.randomUUID(),
          name: n,
        })),
      });
      toast.success("Submitted for review", {
        description: "An admin will approve your facility shortly.",
      });
      setTimeout(() => navigate({ to: "/" }), 800);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-14">
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
          ← Back to home
        </Link>
        <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Register your facility
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Hospitals and clinics are reviewed by an administrator before patients can book consultations.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-6 rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
          {/* Type toggle */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Facility type</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["Hospital", "Clinic"] as FacilityType[]).map((t) => {
                const active = type === t;
                const Icon = t === "Hospital" ? Building2 : Stethoscope;
                return (
                  <button
                    type="button"
                    key={t}
                    onClick={() => {
                      setType(t);
                      if (t === "Clinic") setDepartments((d) => d.slice(0, 1));
                    }}
                    className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-left text-sm transition-all ${
                      active
                        ? "border-foreground bg-foreground text-background shadow-soft"
                        : "border-border bg-background text-foreground hover:border-foreground/40"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{t}</div>
                      <div className={`text-xs ${active ? "text-background/70" : "text-muted-foreground"}`}>
                        {t === "Hospital" ? "Multiple departments" : "Single doctor"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <Field label="Facility name" value={name} onChange={setName} placeholder="Apollo City Hospital" />
          <Field label="Location" value={location} onChange={setLocation} placeholder="MG Road, Bengaluru" />
          <Field label="Contact" value={contact} onChange={setContact} placeholder="+91 80 4000 0000" />

          {/* License upload (mock) */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">License / Certificate</label>
            <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-border bg-background px-4 py-3 text-sm hover:border-foreground/40">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{licenseFile || "Upload license (PDF / image)"}</span>
              <input
                type="file"
                className="sr-only"
                accept=".pdf,image/*"
                onChange={(e) => setLicenseFile(e.target.files?.[0]?.name ?? "")}
              />
            </label>
          </div>

          {/* Departments */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Departments {isClinic && <span className="text-foreground/60">(clinic limited to 1)</span>}
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {departments.map((d, i) => (
                <span
                  key={`${d}-${i}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground"
                >
                  {d}
                  <button type="button" onClick={() => removeDept(i)} aria-label={`Remove ${d}`}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            {!(isClinic && departments.length >= 1) && (
              <div className="mt-2 flex gap-2">
                <input
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addDept();
                    }
                  }}
                  placeholder="e.g. Cardiology"
                  className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
                />
                <button
                  type="button"
                  onClick={addDept}
                  className="inline-flex items-center gap-1 rounded-xl border border-border bg-background px-3 py-2 text-sm hover:bg-secondary"
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-warning/30 bg-warning/10 p-3 text-xs text-foreground/80">
            Doctors are added by the administrator after approval, to prevent fraudulent listings.
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-all hover:bg-mineral disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            Submit for review
          </button>
        </form>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground"
      />
    </div>
  );
}
