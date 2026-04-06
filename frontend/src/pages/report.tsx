import { useState } from "react";
import { useCreateReport, getListReportsQueryKey } from "@/api";
import { useQueryClient } from "@tanstack/react-query";

const REPORT_TYPES = [
  { value: "plantation", label: "Plantation (New Tree)" },
  { value: "cutting", label: "Tree Cutting" },
  { value: "illegal_cutting", label: "Illegal Tree Cutting" },
  { value: "survival_check", label: "Survival Check" },
];

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];

export default function Report() {
  const queryClient = useQueryClient();
  const createReport = useCreateReport();

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    reportType: "cutting",
    reportedBy: "",
    description: "",
    state: "",
    district: "",
    treeCode: "",
    photoUrl: "",
    latitude: "",
    longitude: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gpsLoading, setGpsLoading] = useState(false);

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.reportedBy.trim()) errs.reportedBy = "Your name is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (!form.state) errs.state = "State is required";
    if (!form.district.trim()) errs.district = "District is required";
    return errs;
  }

  function detectLocation() {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: String(pos.coords.latitude.toFixed(6)),
          longitude: String(pos.coords.longitude.toFixed(6)),
        }));
        setGpsLoading(false);
      },
      () => setGpsLoading(false)
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    await createReport.mutateAsync(
      {
        data: {
          reportType: form.reportType as "plantation" | "cutting" | "illegal_cutting" | "survival_check",
          reportedBy: form.reportedBy.trim(),
          description: form.description.trim(),
          state: form.state,
          district: form.district.trim(),
          treeCode: form.treeCode.trim() || undefined,
          photoUrl: form.photoUrl.trim() || undefined,
          latitude: form.latitude ? Number(form.latitude) : undefined,
          longitude: form.longitude ? Number(form.longitude) : undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListReportsQueryKey() });
          setSubmitted(true);
        },
      }
    );
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="bg-white border border-border rounded-lg p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-green-600">&#10003;</span>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Report Submitted</h2>
          <p className="text-muted-foreground text-sm mb-6">Your report has been submitted and is under review.</p>
          <button
            onClick={() => { setSubmitted(false); setForm({ reportType: "cutting", reportedBy: "", description: "", state: "", district: "", treeCode: "", photoUrl: "", latitude: "", longitude: "" }); }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-1">Report Tree Event</h1>
      <p className="text-muted-foreground text-sm mb-6">Report a tree planting or cutting event to authorities.</p>

      <form onSubmit={handleSubmit} className="bg-white border border-border rounded-lg p-6 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Report Type *</label>
          <select
            value={form.reportType}
            onChange={(e) => setForm((f) => ({ ...f, reportType: e.target.value }))}
            className="w-full border border-input rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {REPORT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Your Name *</label>
          <input
            type="text"
            value={form.reportedBy}
            onChange={(e) => setForm((f) => ({ ...f, reportedBy: e.target.value }))}
            placeholder="Citizen / Officer name"
            className="w-full border border-input rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.reportedBy && <p className="text-destructive text-xs mt-1">{errors.reportedBy}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Description *</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Describe what happened..."
            rows={3}
            className="w-full border border-input rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          {errors.description && <p className="text-destructive text-xs mt-1">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">State *</label>
            <select
              value={form.state}
              onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
              className="w-full border border-input rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select State</option>
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.state && <p className="text-destructive text-xs mt-1">{errors.state}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">District *</label>
            <input
              type="text"
              value={form.district}
              onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
              placeholder="e.g. Raipur"
              className="w-full border border-input rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.district && <p className="text-destructive text-xs mt-1">{errors.district}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Tree Code (optional)</label>
          <input
            type="text"
            value={form.treeCode}
            onChange={(e) => setForm((f) => ({ ...f, treeCode: e.target.value }))}
            placeholder="e.g. CG-RPR-2026-000001"
            className="w-full border border-input rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Photo URL (optional)</label>
          <input
            type="url"
            value={form.photoUrl}
            onChange={(e) => setForm((f) => ({ ...f, photoUrl: e.target.value }))}
            placeholder="https://..."
            className="w-full border border-input rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">GPS Location (optional)</label>
          <div className="flex gap-2 mb-2">
            <input
              type="number"
              step="any"
              value={form.latitude}
              onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
              placeholder="Latitude"
              className="flex-1 border border-input rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="number"
              step="any"
              value={form.longitude}
              onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
              placeholder="Longitude"
              className="flex-1 border border-input rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="button"
            onClick={detectLocation}
            disabled={gpsLoading}
            className="text-xs text-primary font-medium border border-primary rounded px-3 py-1.5 hover:bg-primary/10 transition-colors disabled:opacity-60"
          >
            {gpsLoading ? "Detecting..." : "Detect My Location"}
          </button>
        </div>

        <button
          type="submit"
          disabled={createReport.isPending}
          className="w-full bg-primary text-primary-foreground rounded px-4 py-2.5 font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {createReport.isPending ? "Submitting Report..." : "Submit Report"}
        </button>

        {createReport.isError && (
          <p className="text-destructive text-sm text-center">Failed to submit report. Please try again.</p>
        )}
      </form>
    </div>
  );
}
