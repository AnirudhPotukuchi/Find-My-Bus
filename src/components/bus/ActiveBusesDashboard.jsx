import { Bus } from "lucide-react";
import { ROUTES_BY_NUMBER } from "../../constants/routesData";

export default function ActiveBusesDashboard({ 
  allActiveBuses, 
  now, 
  setSelectedBusNumber, 
  setActiveSearchBus, 
  setIsShareModalOpen 
}) {
  const activeBusesList = Object.entries(allActiveBuses)
    .filter(([, data]) => data.isActive && data.lastUpdated && (now - data.lastUpdated < 30000))
    .map(([num, data]) => ({
      number: num,
      name: ROUTES_BY_NUMBER[num]?.name || "UNKNOWN ROUTE",
      ...data
    }));

  return (
    <div className="dashboard-grid-section">
      <div className="card-title-container" style={{ justifyContent: "flex-start", borderBottom: "none", marginBottom: "8px" }}>
        <div className="green-dot-blinking" style={{ marginRight: "6px" }}></div>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "600" }}>Live Commutes On Road</h3>
      </div>
      
      {activeBusesList.length === 0 ? (
        <div className="glass-panel text-center" style={{ padding: "48px 0" }}>
          <Bus size={36} className="text-muted" style={{ opacity: 0.3, marginBottom: "12px" }} />
          <p className="text-muted text-sm" style={{ fontWeight: "500" }}>No buses are broadcasting GPS signals right now.</p>
          <p className="text-muted text-xs mt-2">
            Click <strong style={{ color: "var(--colors-primary)", cursor: "pointer", textDecoration: "underline" }} onClick={() => setIsShareModalOpen(true)}>Share Live Location</strong> at the top to stream a live commute!
          </p>
        </div>
      ) : (
        <div className="live-board-grid">
          {activeBusesList.map((bus, idx) => {
            const cardTints = [
              "card-feature-sky",
              "card-feature-mint",
              "card-feature-lavender",
              "card-feature-peach",
              "card-feature-rose",
              "card-feature-yellow",
              "card-feature-cream"
            ];
            const cardTintClass = cardTints[idx % cardTints.length];
            return (
              <div key={bus.number} className={`bus-status-card ${cardTintClass}`} style={{ cursor: "pointer" }} onClick={() => {
                setSelectedBusNumber(bus.number);
                setActiveSearchBus(ROUTES_BY_NUMBER[bus.number]);
              }}>
                <div className="bus-badge-glow" style={{ backgroundColor: 'var(--colors-ink-deep)', color: '#ffffff' }}>{bus.number}</div>
                <div className="bus-status-details">
                  <p className="bus-status-route">{bus.name}</p>
                  <p className="bus-status-meta">Speed: {Math.round(bus.speed * 3.6)} km/h • Active</p>
                </div>
                <div className="status-indicator font-mono" style={{ color: "var(--colors-semantic-success)" }}>
                  <div className="green-dot-blinking"></div> LIVE
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
