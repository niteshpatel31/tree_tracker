import { useAuth } from "@/contexts/auth";
import { useLocation, Link } from "wouter";

const roleLabels: Record<string, string> = {
  citizen: "Citizen",
  officer: "Forest Officer",
};

export default function Profile() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-xl font-semibold mb-2">You're not signed in</h2>
        <p className="text-muted-foreground text-sm mb-6">Sign in or create an account to view your profile.</p>
        <div className="flex justify-center gap-3">
          <Link href="/login" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">Sign In</Link>
          <Link href="/signup" className="border border-primary text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/5">Sign Up</Link>
        </div>
      </div>
    );
  }

  const initials = user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const joinDate = new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const isOfficer = user.role === "officer";

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground mb-6">My Profile</h1>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-8 flex items-center gap-5 ${isOfficer ? "bg-emerald-700/10" : "bg-primary/10"}`}>
          <div className={`w-16 h-16 rounded-full text-white text-2xl font-bold flex items-center justify-center ${isOfficer ? "bg-emerald-700" : "bg-primary"}`}>
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${isOfficer ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-green-100 text-green-800 border-green-200"}`}>
                {isOfficer ? "🏛️ Forest Officer" : "👤 Citizen"}
              </span>
              <span className="text-sm text-muted-foreground">{user.state}</span>
            </div>
            {isOfficer && user.designation && (
              <div className="text-xs text-muted-foreground mt-1">{user.designation}</div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="px-6 py-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Email</div>
              <div className="text-sm text-foreground break-all">{user.email}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">State</div>
              <div className="text-sm text-foreground">{user.state}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Account Type</div>
              <div className="text-sm text-foreground">{roleLabels[user.role]}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Joined</div>
              <div className="text-sm text-foreground">{joinDate}</div>
            </div>
          </div>

          {isOfficer && (
            <div className="mt-2 pt-4 border-t border-border">
              <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-3">🏛️ Government Details</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Employee ID</div>
                  <div className="text-sm font-mono text-foreground">{user.employeeId ?? "—"}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Designation</div>
                  <div className="text-sm text-foreground">{user.designation ?? "—"}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Department</div>
                  <div className="text-sm text-foreground">{user.department ?? "—"}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                <span className="text-xs text-green-700 font-medium">Verified Account</span>
              </div>
            </div>
          )}

          <div className="pt-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">User ID</div>
            <div className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">{user.id}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <Link href="/trees" className="text-sm text-primary hover:underline">Browse Trees</Link>
          <button
            onClick={async () => { await logout(); navigate("/"); }}
            className="text-sm text-destructive font-medium hover:underline"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
