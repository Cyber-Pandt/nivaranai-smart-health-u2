import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { setHospitalSession, verifyHospitalLogin } from "@/lib/hospitalAuth";

export const Route = createFileRoute("/login/hospital")({
  head: () => ({ meta: [{ title: "Hospital login — NivaranAI" }] }),
  component: HospitalLogin,
});

function HospitalLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    const cred = verifyHospitalLogin(username, password);
    setSubmitting(false);
    if (!cred) {
      toast.error("Invalid credentials", {
        description: "Use the username and password issued by the admin after approval.",
      });
      return;
    }
    setHospitalSession(cred.facilityId);
    toast.success("Welcome back");
    navigate({ to: "/dashboard/hospital" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-5 py-10">
        <form onSubmit={submit} className="w-full rounded-3xl border border-border bg-card p-8 shadow-soft">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background">
            <Building2 className="h-5 w-5" />
          </div>
          <h1 className="font-display mt-4 text-center text-2xl font-semibold">Hospital login</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Use the credentials issued after admin approval.
          </p>

          <label className="mt-6 block text-xs font-medium text-muted-foreground">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="apollocity123"
            className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            required
          />
          <label className="mt-4 block text-xs font-medium text-muted-foreground">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            required
          />

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background hover:bg-mineral disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
          </button>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Don't have credentials yet?{" "}
            <Link to="/signup/hospital" className="font-medium text-primary hover:underline">
              Register your facility
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
