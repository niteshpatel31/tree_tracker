import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/auth";

const inputCls = "w-full border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

export default function Login() {
  const { loginCitizen, loginOfficer } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<"citizen" | "officer">("citizen");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unverifiedId, setUnverifiedId] = useState<number | null>(null);

  function reset() { setEmail(""); setPassword(""); setError(""); setUnverifiedId(null); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return setError("Email is required.");
    if (!password) return setError("Password is required.");

    setLoading(true);
    const result = tab === "citizen"
      ? await loginCitizen(email, password)
      : await loginOfficer(email, password);
    setLoading(false);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.error ?? "Login failed.");
      if ("officerId" in result && result.officerId) {
        setUnverifiedId(result.officerId as number);
      }
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-muted/30 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">{tab === "citizen" ? "🌳" : "🏛️"}</div>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to your TreeTrack account</p>
        </div>

        {/* Tab selector */}
        <div className="flex rounded-xl overflow-hidden border border-border mb-6">
          <button
            onClick={() => { setTab("citizen"); reset(); }}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${tab === "citizen" ? "bg-primary text-primary-foreground" : "bg-white text-muted-foreground hover:bg-muted/50"}`}
          >
            👤 Citizen
          </button>
          <button
            onClick={() => { setTab("officer"); reset(); }}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${tab === "officer" ? "bg-emerald-700 text-white" : "bg-white text-muted-foreground hover:bg-muted/50"}`}
          >
            🏛️ Forest Officer
          </button>
        </div>

        <div className="bg-white border border-border rounded-xl shadow-sm p-7">
          {tab === "officer" && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-xs text-emerald-800 mb-4 flex gap-2">
              <span>🔒</span>
              <span>Government secure portal — Forest Department access only</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{tab === "officer" ? "Government Email" : "Email Address"}</label>
              <input
                type="email"
                placeholder={tab === "officer" ? "officer@gov.in" : "you@example.com"}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input
                type="password"
                placeholder="Your password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className={inputCls}
              />
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-lg border border-destructive/20">
                {error}
                {unverifiedId && (
                  <Link href="/signup" className="block mt-1 font-medium text-primary hover:underline">
                    Complete OTP verification →
                  </Link>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-lg font-medium text-sm disabled:opacity-60 ${tab === "officer" ? "bg-emerald-700 text-white hover:bg-emerald-800" : "bg-primary text-primary-foreground hover:opacity-90"}`}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
