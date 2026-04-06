import { useGetDashboardStats, useGetStateStats, useGetYearStats } from "@/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white border border-border rounded-lg p-5 shadow-sm">
      <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">{label}</div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: stateData, isLoading: stateLoading } = useGetStateStats();
  const { data: yearData } = useGetYearStats();

  const years = yearData?.years ?? [];
  const states = stateData?.states ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-1">Dashboard Analytics</h1>
      <p className="text-muted-foreground text-sm mb-6">State-wise and year-wise tree plantation overview.</p>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="text-muted-foreground text-sm mb-6">Loading stats...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Trees" value={stats?.totalTrees ?? 0} />
          <StatCard label="Planted" value={stats?.totalPlanted ?? 0} sub="Active trees" />
          <StatCard label="Cut Down" value={stats?.totalCut ?? 0} sub="Reported cut" />
          <StatCard label="At Risk" value={stats?.totalAtRisk ?? 0} sub="Need attention" />
          <StatCard label="States Covered" value={stats?.totalStates ?? 0} />
          <StatCard label="Reports Filed" value={stats?.totalReports ?? 0} />
          <StatCard label="Carbon Credits" value={`${(stats?.carbonCreditsTotal ?? 0).toFixed(1)} kg`} sub="CO2 offset" />
          <StatCard label="Survival Rate" value={`${stats?.survivalRate ?? 0}%`} sub="Healthy trees" />
        </div>
      )}

      {/* Year Chart */}
      {years.length > 0 && (
        <div className="bg-white border border-border rounded-lg p-5 shadow-sm mb-8">
          <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Year-wise Plantation Comparison</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={years} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="planted" fill="#16a34a" name="Planted" radius={[3, 3, 0, 0]} />
              <Bar dataKey="cut" fill="#dc2626" name="Cut" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* State Table */}
      <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">State-wise Rankings</h2>
        </div>
        {stateLoading ? (
          <div className="text-center text-muted-foreground py-8 text-sm">Loading state data...</div>
        ) : states.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 text-sm">No data available yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">State</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Planted</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cut</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">At Risk</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Survival %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {states.map((state, i) => (
                  <tr key={state.stateCode} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground font-medium">#{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{state.state}</div>
                      <div className="text-xs text-muted-foreground">{state.stateCode}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{state.totalTrees}</td>
                    <td className="px-4 py-3 text-right text-green-700">{state.planted}</td>
                    <td className="px-4 py-3 text-right text-red-700">{state.cut}</td>
                    <td className="px-4 py-3 text-right text-yellow-700">{state.atRisk}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${state.survivalRate >= 80 ? "text-green-700" : state.survivalRate >= 50 ? "text-yellow-700" : "text-red-700"}`}>
                        {state.survivalRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
