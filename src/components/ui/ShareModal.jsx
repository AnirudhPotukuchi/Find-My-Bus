import { Play } from "lucide-react";
import { ALL_ROUTES } from "../../constants/routesData";

export default function ShareModal({ isOpen, onClose, sharingState, setSharingState, onStartSharing }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ color: "var(--text-main)" }}>Share Live Location</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <p className="text-muted text-sm mb-4">
          Select your route and click start. The system will acquire location coordinates and stream them to the database.
        </p>
        
        <div className="form-group">
          <label className="form-label" htmlFor="share-bus-select">Bus Number</label>
          <select 
            id="share-bus-select" 
            className="select-custom" 
            value={sharingState.busNumber} 
            onChange={(e) => setSharingState(prev => ({ ...prev, busNumber: e.target.value }))}
          >
            <option value="">-- Select Bus Route --</option>
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

        <div className="flex-row-gap" style={{ marginTop: "24px" }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button 
            className="btn-primary" 
            disabled={!sharingState.busNumber} 
            onClick={() => onStartSharing(sharingState.busNumber)}
          >
            <Play size={16} /> Start Sharing
          </button>
        </div>
      </div>
    </div>
  );
}
