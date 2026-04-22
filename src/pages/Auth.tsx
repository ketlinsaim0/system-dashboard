import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { authSchema } from "@/lib/validation";
import { toast } from "sonner";

export default function Auth() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = authSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        toast.success("Account created. You can sign in now.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/", { replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-card border border-border rounded-lg p-6 space-y-4"
      >
        <header>
          <h1 className="text-lg font-semibold text-foreground">
            {mode === "signin" ? "Sign in" : "Create account"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Access the Nexus ERP dashboard.
          </p>
        </header>
        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-9 px-3 text-sm rounded-md bg-muted/60 border border-border focus:bg-card focus:border-ring focus:outline-none"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-9 px-3 text-sm rounded-md bg-muted/60 border border-border focus:bg-card focus:border-ring focus:outline-none"
            required
            minLength={6}
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
        </button>
        <button
          type="button"
          onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
          className="w-full text-xs text-muted-foreground hover:text-foreground"
        >
          {mode === "signin" ? "No account? Sign up" : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}