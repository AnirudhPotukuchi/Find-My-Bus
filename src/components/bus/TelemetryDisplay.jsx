import { Gauge, Navigation, Info } from "lucide-react";
import { CBIT_COORDS, getDistanceKm } from "../../constants/routesData";

export default function TelemetryDisplay({ liveBusCoordinates, activeSearchBus }) {
  if (liveBusCoordinates) {
    return (
      <div className="telemetry-grid">
        <div className="telemetry-card">
          <div className="telemetry-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Gauge size={12} /> Speed
          </div>
          <p className="telemetry-value">
            {Math.round((liveBusCoordinates.speed || 0) * 3.6)} <span className="text-xs text-muted">km/h</span>
          </p>
        </div>
        <div className="telemetry-card">
          <div className="telemetry-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Navigation size={12} /> Distance
          </div>
          <p className="telemetry-value">
            {getDistanceKm(liveBusCoordinates.latitude, liveBusCoordinates.longitude, CBIT_COORDS.lat, CBIT_COORDS.lng).toFixed(2)} 
            <span className="text-xs text-muted"> km</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "12px 16px", marginTop: "16px", display: "flex", alignItems: "center", gap: "10px", backgroundColor: "var(--colors-card-tint-peach)", border: "1px solid rgba(221, 91, 0, 0.2)", borderRadius: "8px", textAlign: "left" }}>
      <Info className="text-danger" size={18} style={{ flexShrink: 0 }} />
      <p className="text-xs" style={{ color: "var(--colors-brand-orange-deep)", lineHeight: "1.4" }}>
        Waiting for a driver/student to share live location for Bus {activeSearchBus.number}.
      </p>
    </div>
  );
}
