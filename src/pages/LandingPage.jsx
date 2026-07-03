import BusSearchPanel from "../components/search/BusSearchPanel";
import ActiveBusesDashboard from "../components/bus/ActiveBusesDashboard";
import { Share2, Search } from "lucide-react";

export default function LandingPage({
  selectedBusNumber,
  setSelectedBusNumber,
  allActiveBuses,
  now,
  setIsShareModalOpen,
  handleSearch,
  setActiveSearchBus
}) {
  return (
    <main className="app-container">
      <div className="hero-section">
        {/* Scattered SVG mesh wires & sticky note dots in brand colors */}
        <div className="hero-decorations" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "15%", left: "12%", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "var(--colors-brand-yellow)" }}></div>
          <div style={{ position: "absolute", top: "28%", right: "14%", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--colors-brand-pink)" }}></div>
          <div style={{ position: "absolute", bottom: "35%", left: "16%", width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "var(--colors-brand-teal)" }}></div>
          <div style={{ position: "absolute", bottom: "45%", right: "20%", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "var(--colors-brand-orange)" }}></div>
          
          <svg style={{ position: "absolute", top: "8%", left: "6%", opacity: 0.15 }} width="120" height="120" viewBox="0 0 100 100" fill="none" stroke="currentColor">
            <path d="M10,10 C30,40 40,20 70,50 C80,60 90,80 90,90" strokeWidth="0.75" />
            <circle cx="70" cy="50" r="2" fill="currentColor" />
          </svg>
          <svg style={{ position: "absolute", bottom: "12%", right: "6%", opacity: 0.15 }} width="130" height="130" viewBox="0 0 100 100" fill="none" stroke="currentColor">
            <path d="M10,90 C40,70 20,40 50,20 C60,10 80,10 90,10" strokeWidth="0.75" />
            <circle cx="50" cy="20" r="2" fill="currentColor" />
          </svg>
        </div>

        <h1 className="hero-title">Track Campus Commutes in Real-Time</h1>
        <p className="hero-subtitle">
          Interactive digital transit deck for Chaitanya Bharathi Institute of Technology. Search route lines, locate bus schedules, and view GPS signals live.
        </p>
        <div className="hero-buttons">
          <button className="btn-on-dark" onClick={() => setIsShareModalOpen(true)}>
            <Share2 size={16} /> Share Live Location
          </button>
          <button className="btn-secondary-on-dark" onClick={() => {
            const el = document.getElementById("bus-select");
            if (el) {
              el.focus();
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }}>
            <Search size={16} /> Search Routes
          </button>
        </div>

        {/* Wavy bottom divider transition between navy band and white page */}
        <div className="hero-divider" style={{ position: "absolute", bottom: -1, left: 0, width: "100%", overflow: "hidden", lineHeight: 0, zIndex: 1 }}>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ position: "relative", display: "block", width: "100%", height: "55px" }}>
            <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" fill="var(--bg-primary)"></path>
          </svg>
        </div>
      </div>

      <div className="search-center-container">
        <BusSearchPanel
          selectedBusNumber={selectedBusNumber}
          setSelectedBusNumber={setSelectedBusNumber}
          onSearch={handleSearch}
        />
      </div>

      <ActiveBusesDashboard
        allActiveBuses={allActiveBuses}
        now={now}
        setSelectedBusNumber={setSelectedBusNumber}
        setActiveSearchBus={setActiveSearchBus}
        setIsShareModalOpen={setIsShareModalOpen}
      />
    </main>
  );
}
