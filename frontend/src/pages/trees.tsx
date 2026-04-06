import { useState } from "react";
import { Link } from "wouter";
import { useListTrees } from "@/api";

const STATUSES = ["", "planted", "cut", "at_risk"];
const STATES = [
  "", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    planted: "bg-green-100 text-green-800 border-green-200",
    cut: "bg-red-100 text-red-800 border-red-200",
    at_risk: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded border ${colors[status] ?? "bg-muted text-muted-foreground"}`}>
      {status.replace("_", " ").toUpperCase()}
    </span>
  );
}

export default function Trees() {
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [status, setStatus] = useState("");

  const { data, isLoading } = useListTrees({
    state: state || undefined,
    district: district || undefined,
    status: (status as "planted" | "cut" | "at_risk") || undefined,
  });

  const trees = data?.trees ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-1">Browse Trees</h1>
      <p className="text-muted-foreground text-sm mb-6">
        {data?.total ?? 0} trees registered across India
      </p>

      <div className="bg-white border border-border rounded-lg p-4 mb-6 flex gap-3 flex-wrap items-end shadow-sm">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">State</label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="border border-input rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {STATES.map((s) => <option key={s} value={s}>{s || "All States"}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">District</label>
          <input
            type="text"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="Filter district..."
            className="border border-input rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-input rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s ? s.replace("_", " ").toUpperCase() : "All Status"}</option>)}
          </select>
        </div>
        <button
          onClick={() => { setState(""); setDistrict(""); setStatus(""); }}
          className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded transition-colors"
        >
          Clear
        </button>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-12">Loading trees...</div>
      ) : trees.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">No trees found. Try adjusting filters.</div>
      ) : (
        <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tree Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Species</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">State</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">District</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Planted Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Planted By</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {trees.map((tree) => (
                  <TreeRow key={tree.id} tree={tree} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function TreeRow({ tree }: { tree: { id: number; treeCode: string; species: string; state: string; district: string; status: string; plantationDate: string; plantedBy: string } }) {
  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 font-mono text-xs text-primary font-semibold">{tree.treeCode}</td>
      <td className="px-4 py-3 text-foreground">{tree.species}</td>
      <td className="px-4 py-3 text-foreground">{tree.state}</td>
      <td className="px-4 py-3 text-muted-foreground">{tree.district}</td>
      <td className="px-4 py-3"><StatusBadge status={tree.status} /></td>
      <td className="px-4 py-3 text-muted-foreground text-xs">
        {new Date(tree.plantationDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
      </td>
      <td className="px-4 py-3 text-muted-foreground">{tree.plantedBy}</td>
      <td className="px-4 py-3">
        <Link
          href={`/tree/${tree.id}`}
          className="text-xs text-primary font-medium hover:underline"
        >
          View
        </Link>
      </td>
    </tr>
  );
}
