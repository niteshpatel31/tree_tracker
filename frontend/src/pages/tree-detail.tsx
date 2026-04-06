import { useParams, useLocation } from "wouter";
import { useGetTree, useUpdateTreeStatus, getListTreesQueryKey, getGetTreeQueryKey } from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import QRCode from "qrcode.react";
import { useRef, useState } from "react";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    planted: "bg-green-100 text-green-800 border-green-200",
    cut: "bg-red-100 text-red-800 border-red-200",
    at_risk: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };
  return (
    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full border ${colors[status] ?? "bg-muted text-muted-foreground"}`}>
      {status.replace("_", " ").toUpperCase()}
    </span>
  );
}

function SurvivalBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    healthy: "text-green-700 bg-green-50 border-green-200",
    at_risk: "text-yellow-700 bg-yellow-50 border-yellow-200",
    dead: "text-red-700 bg-red-50 border-red-200",
  };
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded border ${colors[status] ?? ""}`}>
      {status.toUpperCase()}
    </span>
  );
}

export default function TreeDetail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const id = parseInt(params.id ?? "0", 10);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const { data: tree, isLoading, error } = useGetTree(id);
  const updateStatus = useUpdateTreeStatus();
  const [showUpdate, setShowUpdate] = useState(false);
  const [newStatus, setNewStatus] = useState<"planted" | "cut" | "at_risk">("planted");
  const [newSurvival, setNewSurvival] = useState<"healthy" | "at_risk" | "dead">("healthy");
  const [notes, setNotes] = useState("");

  if (isLoading) {
    return <div className="max-w-2xl mx-auto px-4 py-12 text-center text-muted-foreground">Loading tree details...</div>;
  }

  if (error || !tree) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-destructive mb-4">Tree not found.</p>
        <button onClick={() => navigate("/trees")} className="text-primary text-sm hover:underline">Back to Trees</button>
      </div>
    );
  }

  async function handleUpdate() {
    await updateStatus.mutateAsync(
      { id, data: { status: newStatus, survivalStatus: newSurvival, notes } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetTreeQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getListTreesQueryKey() });
          setShowUpdate(false);
        },
      }
    );
  }

  function getQRCanvas(): HTMLCanvasElement | null {
    if (!qrCodeRef.current) return null;
    const canvas = qrCodeRef.current.querySelector("canvas");
    return canvas as HTMLCanvasElement;
  }

  function handlePrintQR() {
    setTimeout(() => {
      const canvas = getQRCanvas();
      if (!canvas) {
        alert("QR code is still loading. Please wait a moment and try again.");
        return;
      }

      try {
        const qrDataUrl = canvas.toDataURL("image/png");
        const printWindow = window.open("", "", "height=500,width=600");
        if (printWindow) {
          const html = `
            <!DOCTYPE html>
            <html>
              <head><title>Tree QR Code - ${tree?.treeCode}</title></head>
              <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 20px; font-family: Arial, sans-serif;">
                <h2 style="margin-bottom: 20px;">Tree ID: ${tree?.treeCode}</h2>
                <img src="${qrDataUrl}" style="border: 2px solid black; padding: 10px; width: 300px; height: 300px;" />
                <p style="font-size: 14px; margin-top: 20px; color: #666;">Scan this QR code to access tree details</p>
              </body>
            </html>
          `;
          printWindow.document.write(html);
          printWindow.document.close();
          setTimeout(() => printWindow.print(), 500);
        }
      } catch (err) {
        alert("Error generating QR code for print. Please try again.");
        console.error("Print QR error:", err);
      }
    }, 100);
  }

  function handleDownloadReportWithQR() {
    if (!tree) return;

    let qrDataUrl = "";
    const canvas = getQRCanvas();
    if (canvas) {
      try {
        qrDataUrl = canvas.toDataURL("image/png");
      } catch (err) {
        console.error("Error converting QR to data URL:", err);
      }
    }

    const reportText = `
TREE MONITORING REPORT
=================================
Tree Code: ${tree.treeCode}
Status: ${tree.status}
Survival Status: ${tree.survivalStatus}

LOCATION DETAILS
=================================
State: ${tree.state}
District: ${tree.district}
Latitude: ${tree.latitude}
Longitude: ${tree.longitude}

TREE INFORMATION
=================================
Species: ${tree.species}
Planted By: ${tree.plantedBy}
Plantation Date: ${new Date(tree.plantationDate).toLocaleDateString("en-IN")}
Carbon Credits: ${tree.carbonCredits.toFixed(1)} kg CO2

NOTES
=================================
${tree.notes || "No notes available"}

Generated: ${new Date().toLocaleString("en-IN")}
    `.trim();

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(reportText));
    element.setAttribute("download", `tree-report-${tree.treeCode}-${Date.now()}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  const plantDate = new Date(tree.plantationDate).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric"
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate("/trees")} className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1">
        &#8592; Back to Trees
      </button>

      <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-primary/5 border-b border-border px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Unique Tree ID</div>
              <div className="text-2xl font-mono font-bold text-primary tracking-widest">{tree.treeCode}</div>
            </div>
            <div className="flex flex-col items-center gap-2" ref={qrCodeRef}>
              <QRCode value={tree.treeCode} size={96} />
              <span className="text-xs text-muted-foreground">QR Code</span>
            </div>
          </div>
          <div className="mt-3 flex gap-3 flex-wrap items-center">
            <StatusBadge status={tree.status} />
            <SurvivalBadge status={tree.survivalStatus} />
          </div>
        </div>

        {/* Details */}
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <InfoRow label="Species" value={tree.species} />
            <InfoRow label="State" value={tree.state} />
            <InfoRow label="District" value={tree.district} />
            <InfoRow label="Planted By" value={tree.plantedBy} />
            <InfoRow label="Plantation Date" value={plantDate} />
            <InfoRow label="Carbon Credits" value={`${tree.carbonCredits.toFixed(1)} kg CO2`} />
            <InfoRow label="Latitude" value={String(tree.latitude)} />
            <InfoRow label="Longitude" value={String(tree.longitude)} />
          </div>

          {tree.notes && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Notes</div>
              <p className="text-sm text-foreground">{tree.notes}</p>
            </div>
          )}

          {tree.photoUrl && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Photo</div>
              <img src={tree.photoUrl} alt="Tree" className="max-h-48 rounded border border-border object-cover" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-border bg-muted/20 flex gap-3 flex-wrap">
          <button
            onClick={() => setShowUpdate(!showUpdate)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Update Status
          </button>
          <button
            onClick={handlePrintQR}
            className="px-4 py-2 border border-border rounded text-sm font-medium hover:bg-muted transition-colors"
          >
            Print QR Code
          </button>
          <button
            onClick={handleDownloadReportWithQR}
            className="px-4 py-2 border border-border rounded text-sm font-medium hover:bg-muted transition-colors"
          >
            Download Report
          </button>
          <button
            onClick={() => navigate("/report")}
            className="px-4 py-2 border border-border rounded text-sm font-medium hover:bg-muted transition-colors"
          >
            Report Issue
          </button>
        </div>

        {showUpdate && (
          <div className="px-6 py-4 border-t border-border bg-white">
            <h3 className="text-sm font-semibold text-foreground mb-3">Update Tree Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as "planted" | "cut" | "at_risk")}
                  className="w-full border border-input rounded px-2 py-1.5 text-sm bg-white"
                >
                  <option value="planted">Planted</option>
                  <option value="cut">Cut</option>
                  <option value="at_risk">At Risk</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Survival</label>
                <select
                  value={newSurvival}
                  onChange={(e) => setNewSurvival(e.target.value as "healthy" | "at_risk" | "dead")}
                  className="w-full border border-input rounded px-2 py-1.5 text-sm bg-white"
                >
                  <option value="healthy">Healthy</option>
                  <option value="at_risk">At Risk</option>
                  <option value="dead">Dead</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reason..."
                  className="w-full border border-input rounded px-2 py-1.5 text-sm"
                />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleUpdate}
                disabled={updateStatus.isPending}
                className="px-4 py-1.5 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 disabled:opacity-60"
              >
                {updateStatus.isPending ? "Saving..." : "Save Update"}
              </button>
              <button
                onClick={() => setShowUpdate(false)}
                className="px-4 py-1.5 border border-border rounded text-sm hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</div>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  );
}
