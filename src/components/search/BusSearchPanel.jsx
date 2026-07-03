import { Search } from "lucide-react";
import { ALL_ROUTES } from "../../constants/routesData";

export default function BusSearchPanel({ selectedBusNumber, setSelectedBusNumber, onSearch }) {
  return (
    <div className="workspace-mockup-card">
      <div className="card-title-container">
        <Search style={{ color: "var(--colors-primary)" }} size={20} />
        <h3>Search Bus Schedule</h3>
      </div>
      <p className="text-muted text-sm mb-4">
        Select your designated route number to locate the transit bus, preview milestones, and check ETA.
      </p>

      <div className="form-group" style={{ textAlign: "left" }}>
        <label className="form-label" htmlFor="bus-select">Bus Route</label>
        <select 
          id="bus-select" 
          className="select-custom" 
          value={selectedBusNumber} 
          onChange={(e) => setSelectedBusNumber(e.target.value)}
        >
          <option value="">-- Choose Bus Number --</option>
          <optgroup label="Junior Routes">
            {ALL_ROUTES.filter(r => r.category === "Junior").map(route => (
              <option key={route.number} value={route.number}>
                Junior {route.number} : {route.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Senior Routes">
            {ALL_ROUTES.filter(r => r.category === "Senior").map(route => (
              <option key={route.number} value={route.number}>
                Senior {route.number} : {route.name}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      <button className="btn-primary w-full" onClick={onSearch} style={{ height: '44px' }}>
        <Search size={18} /> Locate Bus
      </button>
    </div>
  );
}
