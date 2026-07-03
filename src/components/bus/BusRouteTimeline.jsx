import { getDistanceKm } from "../../constants/routesData";

const getTimelineMilestoneStates = (stops, busLoc) => {
  if (!busLoc || !busLoc.latitude) {
    return { activeIndex: 0, passedIndices: [] };
  }
  
  let closestIndex = 0;
  let minDistance = Infinity;

  stops.forEach((stop, idx) => {
    const dist = getDistanceKm(busLoc.latitude, busLoc.longitude, stop.lat, stop.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestIndex = idx;
    }
  });

  const passedIndices = [];
  for (let i = 0; i < closestIndex; i++) {
    passedIndices.push(i);
  }

  return { activeIndex: closestIndex, passedIndices };
};

export default function BusRouteTimeline({ stops, busLocation }) {
  const milestoneStates = getTimelineMilestoneStates(stops, busLocation);
  
  const fillPercent = stops && stops.length > 1 
    ? (milestoneStates.activeIndex / (stops.length - 1)) * 100 
    : 0;

  return (
    <div className="sidebar-scrollable">
      <h4 className="font-mono text-xs text-muted mb-4" style={{ letterSpacing: "0.05em", textAlign: "left" }}>ROUTE MILESTONES</h4>
      <div className="timeline-container">
        <div className="timeline-line"></div>
        <div className="timeline-line-filled" style={{ height: `${fillPercent}%` }}></div>
        
        {stops.map((stop, index) => {
          let status = "upcoming"; // passed, active, upcoming
          if (milestoneStates.passedIndices.includes(index)) {
            status = "passed";
          } else if (milestoneStates.activeIndex === index && busLocation) {
            status = "active";
          }
          
          return (
            <div key={index} className={`timeline-item ${status}`}>
              <div className="timeline-node">
                <div className="timeline-node-inner"></div>
              </div>
              <div className="timeline-content">
                <p className="timeline-stop-name">{stop.name}</p>
                {status === "active" && (
                  <span className="font-mono text-xs font-bold" style={{ display: "block", marginTop: "4px", color: "var(--accent-purple)" }}>
                    CURRENT STATION
                  </span>
                )}
                {status === "passed" && (
                  <span className="font-mono text-xs text-muted" style={{ display: "block", marginTop: "2px", opacity: 0.5 }}>
                    Passed
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
