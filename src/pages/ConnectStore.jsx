import { useState } from "react";

const API = import.meta.env.VITE_API_ORIGIN
  ? `${import.meta.env.VITE_API_ORIGIN.trim().replace(/\/$/, "")}/api`
  : "http://127.0.0.1:8000/api";

const Spin = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" stroke="#3d3d5c" strokeWidth="3" />
    <path d="M12 2a10 10 0 0110 10" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export default function ConnectStore({ onConnected }) {
  const [form, setForm] = useState({
    shop_name: "",
    api_key: "",
    api_secret: "",
    api_version: "2026-01",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const f = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  const handleConnect = async () => {
    if (!form.shop_name || !form.api_key || !form.api_secret) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      console.log(`Connecting to ${API}/auth/connect with shop: ${form.shop_name}`);
      const res = await fetch(`${API}/auth/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Invalid JSON response:", text);
        throw new Error(`Server error: ${res.status} - ${text.substring(0, 100)}`);
      }
      
      if (!res.ok) {
        const errorMsg = data.detail || data.message || `HTTP ${res.status}`;
        console.error("Connection error:", errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log("✅ Connected successfully:", data);
      setSuccess(data);
      if (onConnected) onConnected(data);
    } catch (e) {
      const msg = e.message || "Failed to fetch - is the backend running?";
      console.error("❌ Connection failed:", msg);
      setError(msg);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: 20, width: "100%" }}>
        <div style={{ background: "#13131a", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 20, padding: 40, maxWidth: 480, width: "100%", textAlign: "center", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: "#10b981", marginBottom: 8 }}>
            Store Connected!
          </h2>
          <p style={{ color: "#555", marginBottom: 24, fontSize: 14 }}>{success.shop}</p>
          <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: 16, marginBottom: 24, textAlign: "left" }}>
            <div style={{ fontSize: 13, color: "#e8e8f0", marginBottom: 6 }}>
              <span style={{ color: "#555" }}>Store: </span>{success.shop_name}
            </div>
            <div style={{ fontSize: 13, color: "#e8e8f0", marginBottom: 6 }}>
              <span style={{ color: "#555" }}>API Version: </span>{success.api_version}
            </div>
            <div style={{ fontSize: 13, color: "#e8e8f0" }}>
              <span style={{ color: "#555" }}>Token: </span>
              <code style={{ color: "#10b981", fontSize: 12 }}>{success.token_preview}</code>
            </div>
            {success.auto_sync && (
              <div style={{ marginTop: 10, fontSize: 13, color: success.auto_sync.success ? '#10b981' : '#ef4444' }}>
                {success.auto_sync.success
                  ? `Auto-synced ${success.auto_sync.synced_count} products.`
                  : `Auto-sync failed: ${success.auto_sync.error}`}
              </div>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{ width: "100%", padding: "13px", borderRadius: 12, fontSize: 15, fontWeight: 600, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", color: "#fff", cursor: "pointer" }}
          >
            Go to Dashboard →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: "20px", width: "100%" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .inp { background:#0d0d14; border:1px solid #2a2a3d; color:#e8e8f0; outline:none; font-family:inherit; width:100%; padding:11px 14px; border-radius:10px; font-size:14px; box-sizing:border-box; transition:border-color 0.2s; }
        .inp:focus { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,0.1); }
        .inp::placeholder { color:#444; }
      `}</style>

      <div style={{ background: "#13131a", border: "1px solid #1e1e2e", borderRadius: 24, padding: 40, maxWidth: 480, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 16px" }}>🛍️</div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Connect Your Store</h1>
          <p style={{ color: "#555", fontSize: 14 }}>Enter your Shopify API credentials to get started</p>
        </div>

        {/* How to get credentials */}
        <div style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 12, padding: "12px 16px", marginBottom: 24, fontSize: 12, color: "#818cf8", lineHeight: 1.7 }}>
          <strong style={{ color: "#a5b4fc" }}>How to get your credentials:</strong><br />
          Shopify Admin → Settings → Apps → <strong>Develop apps</strong> → Create app → API credentials
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: 6 }}>Store Name *</label>
            <input className="inp" placeholder="mystore (without .myshopify.com)" value={form.shop_name} onChange={e => f("shop_name")(e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: 6 }}>API Key *</label>
            <input className="inp" placeholder="e36895244cf2e5be85d9..." value={form.api_key} onChange={e => f("api_key")(e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: 6 }}>API Secret / Access Token *</label>
            <input className="inp" type="password" placeholder="shpss_... or shpua_..." value={form.api_secret} onChange={e => f("api_secret")(e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: 6 }}>API Version</label>
            <select className="inp" value={form.api_version} onChange={e => f("api_version")(e.target.value)} style={{ cursor: "pointer", appearance: "none" }}>
              <option value="2026-01">2026-01 (Latest)</option>
              <option value="2025-10">2025-10</option>
              <option value="2025-07">2025-07</option>
              <option value="2025-04">2025-04</option>
            </select>
          </div>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#ef4444" }}>
              ❌ {error}
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={loading}
            style={{ width: "100%", padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 700, background: loading ? "#2a2a3d" : "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", color: loading ? "#555" : "#fff", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s", marginTop: 4 }}
          >
            {loading ? <><Spin size={16} />Connecting...</> : "🔗 Connect Store"}
          </button>
        </div>
      </div>
    </div>
  );
}
