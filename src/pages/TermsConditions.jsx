export default function TermsConditions({ onBack }) {
  return (
    <main className="legal-container">
      <div className="legal-header">
        <h1 className="legal-title">Terms & Conditions</h1>
        <p className="legal-meta">Last Updated: June 2026</p>
      </div>
      
      <div className="legal-alert">
        <p>
          IMPORTANT NOTICE: By accessing or using Find My Bus, you automatically accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use the application.
        </p>
      </div>

      <section className="legal-section">
        <h3>1. Acceptable Use</h3>
        <p>
          This app is designed to help students track Chaitanya Bharathi Institute of Technology transit routes. You agree to use this platform in accordance with academic integrity guidelines:
        </p>
        <ul>
          <li><strong>Accurate Sharing:</strong> You must only broadcast your GPS coordinates if you are physically present on the corresponding transit route.</li>
          <li><strong>No Falsification:</strong> Falsifying location feeds, spoofing GPS coordinates, or using tools to simulate fake coordinates outside of the built-in Sandbox Simulation Mode is strictly prohibited.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h3>2. Sharing Mechanism & Locks</h3>
        <p>
          To prevent duplicate coordinate streaming, the system employs exclusive route locks:
        </p>
        <ul>
          <li><strong>Exclusive Access:</strong> Only one user session can lock and broadcast telemetry for a specific bus number at any given time.</li>
          <li><strong>Lock Expiry:</strong> Abandoned locks automatically expire after 20 seconds of telemetry inactivity. You must not attempt to disrupt active lock ownership.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h3>3. "As-Is" Service & Disclaimers</h3>
        <p>
          Find My Bus is offered as a student assistance utility. It is not an official guarantee of bus arrivals:
        </p>
        <ul>
          <li><strong>Coordinate Latency:</strong> Coordinates and estimated milestones are subject to network delay, mobile cellular coverage dropouts, and GPS hardware sensor variances.</li>
          <li><strong>Academic Commutes:</strong> Always plan your campus commutes with a safe time buffer. Do not rely solely on this app for critical exams or scheduling.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h3>4. Limitation of Liability</h3>
        <p>
          Under no circumstances shall the developers or CBIT Transport be held liable for any missed commutes, delayed routes, or coordination failures resulting from the use or reliance on this application.
        </p>
      </section>

      <div className="legal-actions">
        <button className="btn-primary" onClick={onBack}>
          Accept & Back to Dashboard
        </button>
      </div>
    </main>
  );
}
