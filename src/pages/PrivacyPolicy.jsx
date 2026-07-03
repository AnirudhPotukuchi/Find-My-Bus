export default function PrivacyPolicy({ onBack }) {
  return (
    <main className="legal-container">
      <div className="legal-header">
        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-meta">Last Updated: June 2026</p>
      </div>
      
      <div className="legal-alert">
        <p>
          IMPORTANT NOTICE: By accessing or using Find My Bus, you automatically accept and agree to be bound by this Privacy Policy. If you do not agree, please do not use the application.
        </p>
      </div>

      <section className="legal-section">
        <h3>1. Introduction</h3>
        <p>
          Find My Bus is a real-time student transport tracking utility. We are committed to transparency in how location data is handled, ensuring that student and driver privacy is protected.
        </p>
      </section>

      <section className="legal-section">
        <h3>2. Information We Collect</h3>
        <p>
          This application does not collect personal profiles, email addresses, or phone numbers. The only information processed is location telemetry data:
        </p>
        <ul>
          <li><strong>GPS Coordinates:</strong> Temporary latitude and longitude streams are acquired solely when a student/driver actively initiates "Share Live Location" for a bus route.</li>
          <li><strong>Device Telemetry:</strong> Ephemeral indicators like speed (km/h), course heading (degrees), and sensor accuracy (meters) are processed to show smooth animations on the transit dashboard.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h3>3. Real-Time Synchronization</h3>
        <p>
          To ensure all students see active buses, live coordinates are broadcasted instantly:
        </p>
        <ul>
          <li><strong>Cloud Sync:</strong> If configured, location streams are synced globally across user devices using a secure Firebase Realtime Database layer.</li>
          <li><strong>Local Sandbox Sync:</strong> If Firebase is offline, local coordination is achieved locally across your browser tabs using BroadcastChannel streams.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h3>4. Data Retention and Deletion</h3>
        <p>
          We do not persist historical trip tracking paths:
        </p>
        <ul>
          <li><strong>Immediate Erasure:</strong> All coordinate telemetry fields are completely wiped and cleared from active database nodes immediately when sharing is manually stopped, or when the bus reaches CBIT (auto-termination at 100 meters).</li>
          <li><strong>Sandbox Storage:</strong> Sandbox configurations are stored locally inside your browser's <code>localStorage</code> and can be cleared by deleting your browser cache.</li>
        </ul>
      </section>

      <div className="legal-actions">
        <button className="btn-primary" onClick={onBack}>
          Accept & Back to Dashboard
        </button>
      </div>
    </main>
  );
}
