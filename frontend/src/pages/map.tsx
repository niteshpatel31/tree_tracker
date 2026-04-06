import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { useListTrees, useGetDashboardStats } from "@/api";
import type { Map as LeafletMap, CircleMarker } from "leaflet";

export default function Home() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<CircleMarker[]>([]);
  const [mapReady, setMapReady] = useState(false);

  const { data: treesData } = useListTrees({ query: { limit: 500 } });
  const { data: stats } = useGetDashboardStats();

  // Initialize map once on mount
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !mapRef.current || mapInstanceRef.current) return;

      try {
        const map = L.map(mapRef.current, { zoomControl: true }).setView([20.5937, 78.9629], 5);
        mapInstanceRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        setMapReady(true);
      } catch {
        // Map already initialized — ignore
      }
    })();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMapReady(false);
      }
    };
  }, []);

  // Update markers whenever tree data OR map readiness changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady || !treesData?.trees) return;

    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled) return;

      // Remove old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      treesData.trees.forEach((tree) => {
        if (!tree.latitude || !tree.longitude) return;

        const color =
          tree.status === "planted" ? "#16a34a"
          : tree.status === "cut" ? "#dc2626"
          : "#d97706";

        const marker = L.circleMarker([tree.latitude, tree.longitude], {
          radius: 8,
          fillColor: color,
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.85,
        });

        marker.bindPopup(`
          <div style="min-width:160px;font-family:sans-serif;">
            <div style="font-weight:700;font-size:13px;margin-bottom:4px;">${tree.treeCode}</div>
            <div style="font-size:12px;color:#555;">
              <div><b>Species:</b> ${tree.species}</div>
              <div><b>Location:</b> ${tree.district}, ${tree.state}</div>
              <div><b>Status:</b> <span style="color:${color};font-weight:600;">${tree.status.toUpperCase()}</span></div>
              <div><b>Planted by:</b> ${tree.plantedBy}</div>
            </div>
            <div style="margin-top:6px;">
              <a href="/tree/${tree.id}" style="color:#16a34a;font-size:12px;text-decoration:underline;">View Details</a>
            </div>
          </div>
        `);

        marker.addTo(map);
        markersRef.current.push(marker);
      });
    })();

    return () => { cancelled = true; };
  }, [treesData, mapReady]);

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 56px)" }}>
      {/* Stats bar */}
      <div className="bg-white border-b border-border px-4 py-2 flex items-center gap-6 text-sm flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-600 inline-block"></span>
          <span className="text-muted-foreground">Planted:</span>
          <span className="font-semibold text-green-700">{stats?.totalPlanted ?? 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-600 inline-block"></span>
          <span className="text-muted-foreground">Cut:</span>
          <span className="font-semibold text-red-700">{stats?.totalCut ?? 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-yellow-600 inline-block"></span>
          <span className="text-muted-foreground">At Risk:</span>
          <span className="font-semibold text-yellow-700">{stats?.totalAtRisk ?? 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">States:</span>
          <span className="font-semibold">{stats?.totalStates ?? 0}</span>
        </div>
        <div className="ml-auto">
          <Link
            href="/plant"
            className="bg-primary text-primary-foreground px-3 py-1.5 rounded text-xs font-medium hover:opacity-90 transition-opacity"
          >
            + Plant Tree
          </Link>
        </div>
      </div>

      {/* Map */}
      <div className="relative flex-1 w-full">
        <div ref={mapRef} className="absolute inset-0" />

        {/* Legend */}
        <div className="absolute bottom-6 left-4 bg-white border border-border rounded shadow-md px-3 py-2 z-[999] text-xs space-y-1">
          <div className="font-semibold text-foreground mb-1">Map Legend</div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-600 inline-block"></span> Planted
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600 inline-block"></span> Cut
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-600 inline-block"></span> At Risk
          </div>
        </div>
      </div>
    </div>
  );
}
