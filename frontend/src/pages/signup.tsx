import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/auth";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

const DEPARTMENTS = [
  "Indian Forest Service (IFS)","State Forest Department","Ministry of Environment, Forest & Climate Change",
  "Forest Survey of India","Wildlife Institute of India","Central Empowered Committee",
  "National Tiger Conservation Authority","Zoological Survey of India",
];

const DESIGNATIONS = [
  "Forest Guard","Deputy Forest Ranger","Forest Ranger","Divisional Forest Officer (DFO)",
  "Deputy Conservator of Forests (DCF)","Conservator of Forests (CF)",
  "Chief Conservator of Forests (CCF)","Principal Chief Conservator of Forests (PCCF)",
];

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white";

export default function SignUp() {
  const { signUpCitizen, signUpOfficer } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<"citizen" | "officer">("citizen");

  // Citizen form
  const [cForm, setCForm] = useState({ name: "", email: "", state: "", password: "", confirm: "" });

  // Officer form
  const [oForm, setOForm] = useState({ name: "", email: "", state: "", employeeId: "", department: "", designation: "", password: "", confirm: "" });

  // OTP verification state
  const [otpState, setOtpState] = useState<{ officerId: number } | null>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function setC(f: string, v: string) { setCForm((p) => ({ ...p, [f]: v })); setError(""); }
  function setO(f: string, v: string) { setOForm((p) => ({ ...p, [f]: v })); setError(""); }

  async function handleCitizenSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cForm.name.trim()) return setError("Full name is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cForm.email)) return setError("Enter a valid email address.");
    if (!cForm.state) return setError("Please select your state.");
    if (cForm.password.length < 6) return setError("Password must be at least 6 characters.");
    if (cForm.password !== cForm.confirm) return setError("Passwords do not match.");

    setLoading(true);
    const result = await signUpCitizen({ name: cForm.name, email: cForm.email, state: cForm.state, password: cForm.password });
    setLoading(false);
    if (result.success) navigate("/");
    else setError(result.error ?? "Sign up failed.");
  }

  async function handleOfficerSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!oForm.name.trim()) return setError("Full name is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(oForm.email)) return setError("Enter a valid email address.");
    if (!oForm.employeeId.trim()) return setError("Employee ID is required.");
    if (!oForm.department) return setError("Please select your department.");
    if (!oForm.designation) return setError("Please select your designation.");
    if (!oForm.state) return setError("Please select your state.");
    if (oForm.password.length < 8) return setError("Officers require a minimum 8-character password.");
    if (oForm.password !== oForm.confirm) return setError("Passwords do not match.");

    setLoading(true);
    const result = await signUpOfficer({
      name: oForm.name, email: oForm.email, state: oForm.state,
      employeeId: oForm.employeeId, department: oForm.department,
      designation: oForm.designation, password: oForm.password,
    });
    setLoading(false);
    if (!result.success) return setError(result.error ?? "Sign up failed.");
    setOtpState({ officerId: result.officerId! });
  }

  // ── OTP Verification screen ──
  if (otpState) {
    return <OtpVerifyScreen otpState={otpState} error={error} loading={loading} setError={setError} navigate={navigate} />;
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-muted/30 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🌱</div>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-muted-foreground text-sm mt-1">Choose your account type to get started</p>
        </div>

        {/* Tab selector */}
        <div className="flex rounded-xl overflow-hidden border border-border mb-6">
          <button
            onClick={() => { setTab("citizen"); setError(""); }}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${tab === "citizen" ? "bg-primary text-primary-foreground" : "bg-white text-muted-foreground hover:bg-muted/50"}`}
          >
            👤 Citizen
          </button>
          <button
            onClick={() => { setTab("officer"); setError(""); }}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${tab === "officer" ? "bg-emerald-700 text-white" : "bg-white text-muted-foreground hover:bg-muted/50"}`}
          >
            🏛️ Forest Officer
          </button>
        </div>

        <div className="bg-white border border-border rounded-xl shadow-sm p-7">
          {tab === "citizen" ? (
            <>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">C</div>
                <div>
                  <div className="text-sm font-semibold">Citizen Account</div>
                  <div className="text-xs text-muted-foreground">Report tree events, track plantation near you</div>
                </div>
              </div>
              <form onSubmit={handleCitizenSubmit} className="space-y-4">
                <Field label="Full Name" required>
                  <input type="text" placeholder="Your full name" value={cForm.name} onChange={(e) => setC("name", e.target.value)} className={inputCls} />
                </Field>
                <Field label="Email Address" required>
                  <input type="email" placeholder="you@example.com" value={cForm.email} onChange={(e) => setC("email", e.target.value)} className={inputCls} />
                </Field>
                <Field label="State / UT" required>
                  <select value={cForm.state} onChange={(e) => setC("state", e.target.value)} className={inputCls}>
                    <option value="">Select your state</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Password" required>
                    <input type="password" placeholder="Min 6 characters" autoComplete="new-password" value={cForm.password} onChange={(e) => setC("password", e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Confirm Password" required>
                    <input type="password" placeholder="Re-enter" autoComplete="new-password" value={cForm.confirm} onChange={(e) => setC("confirm", e.target.value)} className={inputCls} />
                  </Field>
                </div>
                {error && <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-lg border border-destructive/20">{error}</div>}
                <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium text-sm hover:opacity-90 disabled:opacity-60">
                  {loading ? "Creating account..." : "Create Citizen Account"}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-emerald-700/10 text-emerald-700 flex items-center justify-center text-sm font-bold">G</div>
                <div>
                  <div className="text-sm font-semibold">Forest Officer Account</div>
                  <div className="text-xs text-muted-foreground">Government personnel only — requires OTP verification</div>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800 mb-4 flex gap-2">
                <span>🔐</span>
                <span>Your Employee ID will be verified. An OTP will be issued for secure account activation.</span>
              </div>
              <form onSubmit={handleOfficerSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Full Name" required>
                    <input type="text" placeholder="As per govt ID" value={oForm.name} onChange={(e) => setO("name", e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Government Email" required>
                    <input type="email" placeholder="officer@gov.in" value={oForm.email} onChange={(e) => setO("email", e.target.value)} className={inputCls} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Employee ID" required>
                    <input type="text" placeholder="e.g. FD-CG-2019-0045" value={oForm.employeeId} onChange={(e) => setO("employeeId", e.target.value)} className={inputCls} style={{ fontFamily: "monospace" }} />
                  </Field>
                  <Field label="State / UT" required>
                    <select value={oForm.state} onChange={(e) => setO("state", e.target.value)} className={inputCls}>
                      <option value="">Select state</option>
                      {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Department" required>
                  <select value={oForm.department} onChange={(e) => setO("department", e.target.value)} className={inputCls}>
                    <option value="">Select department</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="Designation" required>
                  <select value={oForm.designation} onChange={(e) => setO("designation", e.target.value)} className={inputCls}>
                    <option value="">Select designation</option>
                    {DESIGNATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Password" required>
                    <input type="password" placeholder="Min 8 characters" autoComplete="new-password" value={oForm.password} onChange={(e) => setO("password", e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Confirm Password" required>
                    <input type="password" placeholder="Re-enter" autoComplete="new-password" value={oForm.confirm} onChange={(e) => setO("confirm", e.target.value)} className={inputCls} />
                  </Field>
                </div>
                {error && <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-lg border border-destructive/20">{error}</div>}
                <button type="submit" disabled={loading} className="w-full bg-emerald-700 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-emerald-800 disabled:opacity-60">
                  {loading ? "Submitting..." : "Submit & Get OTP"}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-sm text-muted-foreground mt-5">
            Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function OtpVerifyScreen({ otpState, error, loading, setError, navigate }: {
  otpState: { officerId: number };
  error: string; loading: boolean;
  setError: (e: string) => void;
  navigate: (p: string) => void;
}) {
  const { verifyOfficer } = useAuth();
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (otp.trim().length !== 6) return setErr("Enter the 6-digit OTP.");
    setBusy(true);
    const result = await verifyOfficer(otpState.officerId, otp.trim());
    setBusy(false);
    if (result.success) navigate("/");
    else setErr(result.error ?? "Invalid OTP.");
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-muted/30 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="text-2xl font-bold">Verify Your Account</h1>
          <p className="text-muted-foreground text-sm mt-1">Enter the OTP to activate your Forest Officer account</p>
        </div>
        <div className="bg-white border border-border rounded-xl shadow-sm p-7">
          {/* OTP display */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 text-center">
            <div className="text-sm text-emerald-800 font-medium mb-1">Check your email</div>
            <div className="text-xs text-emerald-600">We've sent a 6-digit verification code to your government email address.</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Enter OTP <span className="text-destructive">*</span></label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setErr(""); }}
                className="w-full border border-input rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            {(err || error) && (
              <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-lg border border-destructive/20">{err || error}</div>
            )}
            <button type="submit" disabled={busy} className="w-full bg-emerald-700 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-emerald-800 disabled:opacity-60">
              {busy ? "Verifying..." : "Verify & Activate Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
