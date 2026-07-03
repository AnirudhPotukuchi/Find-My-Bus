import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function NotificationAlert({ notification }) {
  if (!notification) return null;

  return (
    <div className="modal-overlay" style={{ background: "transparent", pointerEvents: "none", justifyContent: "flex-end", alignItems: "flex-start" }}>
      <div className={`glass-panel glow-${notification.type === "error" ? "red" : notification.type === "success" ? "cyan" : "violet"}`} style={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: "10px", margin: "16px", padding: "12px 20px" }}>
        {notification.type === "error" ? (
          <AlertCircle className="text-danger" size={20} />
        ) : (
          <CheckCircle2 className="text-success" size={20} />
        )}
        <span className="font-mono text-sm">{notification.message}</span>
      </div>
    </div>
  );
}
