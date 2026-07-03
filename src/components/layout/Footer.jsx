import { Activity } from "lucide-react";

export default function Footer({ onDashboardClick, onShareClick, onPrivacyClick, onTermsClick }) {
  return (
    <footer className="footer-container">
      <div className="footer-top-grid">
        <div className="footer-tagline">
          Experience seamless transit control.
        </div>
        <div className="footer-grid-column">
          <span className="footer-grid-title">System</span>
          <a onClick={onDashboardClick} className="footer-grid-link" style={{ cursor: "pointer" }}>Transit Dashboard</a>
          <a onClick={onShareClick} className="footer-grid-link" style={{ cursor: "pointer" }}>Share Location</a>
          <a href="#mappls-map-container" className="footer-grid-link">Telemetry Feed</a>
        </div>
        <div className="footer-grid-column">
          <span className="footer-grid-title">Resources</span>
          <a href="/src/assets/Buses-for-Junior-Students-_CBIT-_Transport_08-07-2025-2025-26-1.png" target="_blank" rel="noreferrer" className="footer-grid-link">Junior Schedule</a>
          <a href="/src/assets/Buses-for-Senior-Students-_CBIT-_Transport_08-07-2025-2025-26-1.png" target="_blank" rel="noreferrer" className="footer-grid-link">Senior Schedule</a>
          <a href="https://cbit.ac.in" target="_blank" rel="noreferrer" className="footer-grid-link">CBIT</a>
        </div>
        <div className="footer-grid-column">
          <span className="footer-grid-title">Legal</span>
          <a onClick={onPrivacyClick} className="footer-grid-link" style={{ cursor: "pointer" }}>Privacy Policy</a>
          <a onClick={onTermsClick} className="footer-grid-link" style={{ cursor: "pointer" }}>Terms & Conditions</a>
          <span className="text-muted text-xs mt-2" style={{ lineHeight: 1.4 }}>
            Using this application implies automatic acceptance of our privacy policies and terms of service.
          </span>
        </div>
      </div>

      <div className="footer-logo-text">
        Find My Bus
      </div>

      <div className="footer-bottom">
        <p className="text-muted text-xs font-mono">
          © {new Date().getFullYear()} All rights reserved by Sai Raghavendra Anirudh Potukuchi
        </p>
        <div style={{ display: "flex", gap: "16px" }}>
          <span className="font-mono text-xs text-muted" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Activity size={12} className="text-success" /> LATENCY: ~40ms
          </span>
          <a href="https://github.com/AnirudhPotukuchi/Find-My-Bus" target="_blank" rel="noreferrer" className="text-muted text-xs font-mono" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg> SOURCE CODE
          </a>
        </div>
      </div>
    </footer>
  );
}
