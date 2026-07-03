import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import TelemetryDisplay from "../components/bus/TelemetryDisplay";
import BusRouteTimeline from "../components/bus/BusRouteTimeline";
import BusMap from "../components/map/BusMap";

export default function TrackingDashboard({
  activeSearchBus,
  liveBusCoordinates,
  theme,
  onBack
}) {
  useEffect(() => {
    if (activeSearchBus?.number && activeSearchBus?.name) {
      document.title = `${activeSearchBus.number}: ${activeSearchBus.name} - Find My Bus`;
    } else {
      document.title = "Find My Bus";
    }

    return () => {
      document.title = "Find My Bus";
    };
  }, [activeSearchBus]);

  return (
    <main className="dashboard-container">
      {/* Left Panel: Route Milestones timeline & telemetry */}
      <section className="dashboard-sidebar">
        <div className="sidebar-header">
          <button className="btn-secondary w-full" style={{ marginBottom: "16px", height: "40px" }} onClick={onBack}>
            <ArrowLeft size={16} /> Back to Search
          </button>
          
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", textAlign: "left" }}>
            <div>
              <h4 className="text-muted font-mono text-xs" style={{ letterSpacing: "0.05em" }}>BUS COMMUTE ACTIVE</h4>
              <h2 style={{ fontSize: "1.25rem", marginTop: "4px", fontWeight: "600" }}>Route {activeSearchBus.number}: {activeSearchBus.name}</h2>
            </div>
            <div className={`status-indicator ${liveBusCoordinates ? "text-success" : "text-muted"}`} style={{ marginTop: "4px", whiteSpace: "nowrap" }}>
              <div className={liveBusCoordinates ? "green-dot-blinking" : "status-dot bg-violet"}></div>
              {liveBusCoordinates ? "LIVE FEED" : "STANDBY"}
            </div>
          </div>
          
          <TelemetryDisplay
            liveBusCoordinates={liveBusCoordinates}
            activeSearchBus={activeSearchBus}
          />
        </div>

        <BusRouteTimeline
          stops={activeSearchBus.stops}
          busLocation={liveBusCoordinates}
        />
      </section>

      {/* Right Panel: Interactive Maps widget */}
      <section className="dashboard-map-panel">
        <BusMap
          stops={activeSearchBus.stops}
          busLocation={liveBusCoordinates}
          activeRoute={activeSearchBus}
          theme={theme}
        />
      </section>
    </main>
  );
}
