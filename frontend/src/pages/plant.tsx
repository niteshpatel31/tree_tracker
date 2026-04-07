import { useState } from "react";
import { useCreateTree, getListTreesQueryKey, getGetDashboardStatsQueryKey } from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

const INDIAN_STATES = [
  { code: "AP", name: "Andhra Pradesh" },
  { code: "AR", name: "Arunachal Pradesh" },
  { code: "AS", name: "Assam" },
  { code: "BR", name: "Bihar" },
  { code: "CG", name: "Chhattisgarh" },
  { code: "GA", name: "Goa" },
  { code: "GJ", name: "Gujarat" },
  { code: "HR", name: "Haryana" },
  { code: "HP", name: "Himachal Pradesh" },
  { code: "JH", name: "Jharkhand" },
  { code: "KA", name: "Karnataka" },
  { code: "KL", name: "Kerala" },
  { code: "MP", name: "Madhya Pradesh" },
  { code: "MH", name: "Maharashtra" },
  { code: "MN", name: "Manipur" },
  { code: "ML", name: "Meghalaya" },
  { code: "MZ", name: "Mizoram" },
  { code: "NL", name: "Nagaland" },
  { code: "OD", name: "Odisha" },
  { code: "PB", name: "Punjab" },
  { code: "RJ", name: "Rajasthan" },
  { code: "SK", name: "Sikkim" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "TS", name: "Telangana" },
  { code: "TR", name: "Tripura" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "UK", name: "Uttarakhand" },
  { code: "WB", name: "West Bengal" },
  { code: "DL", name: "Delhi" },
];

import { SPECIES } from "@/lib/species";

import { useAuth } from "@/contexts/auth";

export default function PlantTree() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const createTree = useCreateTree();
  const { user } = useAuth();

  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [form, setForm] = useState({
    state: "",
    stateCode: "",
    district: "",
    districtCode: "",
    latitude: "",
    longitude: "",
    species: "",
    plantedBy: user?.name || "",
    photoUrl: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [speciesSearch, setSpeciesSearch] = useState("");
  const [showSpeciesDropdown, setShowSpeciesDropdown] = useState(false);

  const filteredSpecies = SPECIES.filter((s) =>
    s.toLowerCase().includes(speciesSearch.toLowerCase())
  );

  function handleStateChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = INDIAN_STATES.find((s) => s.code === e.target.value);
    setForm((f) => ({
      ...f,
      state: selected?.name ?? "",
      stateCode: selected?.code ?? "",
    }));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.state) errs.state = "State is required";
    if (!form.district.trim()) errs.district = "District is required";
    if (!form.species) errs.species = "Species is required";
    if (!form.plantedBy.trim()) errs.plantedBy = "Planted by is required";
    if (!form.latitude || isNaN(Number(form.latitude))) errs.latitude = "Valid latitude required";
    if (!form.longitude || isNaN(Number(form.longitude))) errs.longitude = "Valid longitude required";
    return errs;
  }

  function detectLocation() {
    setGpsLoading(true);
    setGpsError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: String(pos.coords.latitude.toFixed(6)),
          longitude: String(pos.coords.longitude.toFixed(6)),
        }));
        setGpsLoading(false);
      },
      () => {
        setGpsError("Could not detect location. Please enter manually.");
        setGpsLoading(false);
      }
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

    const districtCode = form.district.trim().substring(0, 3).toUpperCase();

    await createTree.mutateAsync(
      {
        data: {
          state: form.state,
          stateCode: form.stateCode,
          district: form.district.trim(),
          districtCode,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          species: form.species,
          plantedBy: form.plantedBy.trim(),
          planterEmail: user?.email || undefined,
          photoUrl: form.photoUrl.trim() || undefined,
          notes: form.notes.trim() || undefined,
        },
      },
      {
        onSuccess: (tree) => {
          setGeneratedCode(tree.treeCode);
          queryClient.invalidateQueries({ queryKey: getListTreesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        },
      }
    );
  }

  if (generatedCode) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="bg-white border border-border rounded-lg p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-green-600">&#10003;</span>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Tree Registered Successfully</h2>
          <p className="text-muted-foreground text-sm mb-6">Your tree has been assigned a unique identification code.</p>
          <div className="bg-green-50 border border-green-200 rounded-lg px-6 py-4 mb-6">
            <div className="text-xs text-green-700 uppercase tracking-wider font-semibold mb-1">Unique Tree ID</div>
            <div className="text-2xl font-mono font-bold text-green-800 tracking-widest">{generatedCode}</div>
          </div>
          <div className="text-xs text-muted-foreground mb-6">
            Format: STATE-DISTRICT-YEAR-SERIAL
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setGeneratedCode("")}
              className="px-4 py-2 border border-border rounded text-sm font-medium hover:bg-muted transition-colors"
            >
              Plant Another Tree
            </button>
            <button
              onClick={() => navigate("/trees")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity"
            >
              View All Trees
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-1">Register New Tree</h1>
      <p className="text-muted-foreground text-sm mb-6">Fill in the details to assign a unique tree ID.</p>

      <form onSubmit={handleSubmit} className="bg-white border border-border rounded-lg p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">State *</label>
            <select
              value={form.stateCode}
              onChange={handleStateChange}
              className="w-full border border-input rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select State</option>
              {INDIAN_STATES.map((s) => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
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

        <div className="relative">
          <label className="block text-sm font-medium text-foreground mb-1">Species *</label>
          <input
            type="text"
            value={showSpeciesDropdown ? speciesSearch : form.species}
            onChange={(e) => {
              setSpeciesSearch(e.target.value);
              if (!showSpeciesDropdown) setShowSpeciesDropdown(true);
            }}
            onFocus={() => {
              setShowSpeciesDropdown(true);
              setSpeciesSearch("");
            }}
            onBlur={() => setShowSpeciesDropdown(false)}
            placeholder="Search and select species"
            className="w-full border border-input rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {showSpeciesDropdown && (
            <ul className="absolute z-10 w-full bg-white border border-input rounded-md mt-1 max-h-60 overflow-auto shadow-lg">
              {filteredSpecies.length > 0 ? (
                filteredSpecies.map((s) => (
                  <li
                    key={s}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setForm((f) => ({ ...f, species: s }));
                      setShowSpeciesDropdown(false);
                    }}
                    className="px-3 py-2 text-sm hover:bg-muted cursor-pointer"
                  >
                    {s}
                  </li>
                ))
              ) : (
                <li className="px-3 py-2 text-sm text-muted-foreground p-2">No species found</li>
              )}
            </ul>
          )}
          {errors.species && <p className="text-destructive text-xs mt-1">{errors.species}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Planted By *</label>
          <input
            type="text"
            value={form.plantedBy}
            onChange={(e) => setForm((f) => ({ ...f, plantedBy: e.target.value }))}
            placeholder="Name of person/organization"
            className="w-full border border-input rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.plantedBy && <p className="text-destructive text-xs mt-1">{errors.plantedBy}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">GPS Location *</label>
          <div className="flex flex-col gap-3 mb-3 sm:flex-row sm:items-center sm:gap-2">
            <input
              type="number"
              step="any"
              value={form.latitude}
              onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
              placeholder="Latitude"
              className="w-full min-w-0 border border-input rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="number"
              step="any"
              value={form.longitude}
              onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
              placeholder="Longitude"
              className="w-full min-w-0 border border-input rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="button"
            onClick={detectLocation}
            disabled={gpsLoading}
            className="w-full sm:w-auto text-xs text-primary font-medium border border-primary rounded px-3 py-1.5 hover:bg-primary/10 transition-colors disabled:opacity-60"
          >
            {gpsLoading ? "Detecting..." : "Detect My Location"}
          </button>
          {gpsError && <p className="text-destructive text-xs mt-1">{gpsError}</p>}
          {(errors.latitude || errors.longitude) && (
            <p className="text-destructive text-xs mt-1">Valid GPS coordinates required</p>
          )}
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
          <label className="block text-sm font-medium text-foreground mb-1">Notes (optional)</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Any additional information..."
            rows={3}
            className="w-full border border-input rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={createTree.isPending}
          className="w-full bg-primary text-primary-foreground rounded px-4 py-2.5 font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {createTree.isPending ? "Registering Tree..." : "Register Tree & Generate ID"}
        </button>

        {createTree.isError && (
          <p className="text-destructive text-sm text-center">Failed to register tree. Please try again.</p>
        )}
      </form>
    </div>
  );
}
