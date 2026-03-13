import { useState, useEffect, useRef } from "react";
import { Ico } from "./Icons";
import { API_BASE_URL } from "../api/config";

const colors = {
  bgPrimary: "#0A0A0A",
  bgSecondary: "#111111",
  bgCard: "#1A1A1A",
  border: "#2A2A2A",
  textPrimary: "#FFFFFF",
  textMuted: "#A0A0A0",
  accent: "#3B82F6",
  accentGradient: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
};

const Sidebar = ({ page, setPage, activeStore, setActiveStore }) => {
  const [stores, setStores] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchStores = async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/auth/stores`);
      if (!r.ok) return;
      const data = await r.json();
      const nextStores = data.stores || [];
      setStores(nextStores);

      const active = nextStores.find((s) => s.is_active) || nextStores[0] || null;
      if (!active) {
        setActiveStore(null);
        return;
      }
      if (!activeStore || activeStore.shop_key !== active.shop_key) {
        setActiveStore(active);
      }
    } catch {}
  };

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const switchStore = async (shop_key) => {
    try {
      const r = await fetch(`${API_BASE_URL}/auth/active-store/${shop_key}`, { method: "POST" });
      if (!r.ok) return;

      setStores((prev) => prev.map((s) => ({ ...s, is_active: s.shop_key === shop_key })));

      const updated = stores.find((s) => s.shop_key === shop_key);
      if (updated) setActiveStore({ ...updated, is_active: true });

      setDropdownOpen(false);
      window.dispatchEvent(new CustomEvent("store-switched"));
    } catch {}
  };

  const disconnectStore = async (shop_key, e) => {
    e.stopPropagation();
    if (!window.confirm(`Disconnect ${shop_key}?`)) return;
    try {
      await fetch(`${API_BASE_URL}/auth/stores/${shop_key}`, { method: "DELETE" });
      await fetchStores();
      window.dispatchEvent(new CustomEvent("store-switched"));
    } catch {}
  };

  const navItems = [
    { id: "products", label: "Products", icon: "products" },
    { id: "upload", label: "Upload", icon: "upload" },
    { id: "collections", label: "Collections", icon: "collections" },
    { id: "inventory", label: "Inventory", icon: "inventory" },
    { id: "export", label: "Export", icon: "download" },
    { id: "connect", label: "Connect Store", icon: "tag" },
  ];

  return (
    <aside
      style={{
        width: 220,
        background: colors.bgSecondary,
        borderRight: `1px solid ${colors.border}`,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ padding: "24px 18px 18px", borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: colors.accentGradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            🛍️
          </div>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, color: colors.textPrimary }}>
              ShopManager
            </div>
            <div style={{ fontSize: 11, color: colors.textMuted }}>Shopify Control</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        {navItems.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setPage(id)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              background: page === id ? "rgba(59, 130, 246, 0.15)" : "transparent",
              color: page === id ? colors.accent : colors.textMuted,
              fontSize: 14,
              fontWeight: page === id ? 600 : 400,
              transition: "all 0.2s ease",
              textAlign: "left",
              borderLeft: `3px solid ${page === id ? colors.accent : "transparent"}`,
            }}
            onMouseEnter={(e) => {
              if (page !== id) e.currentTarget.style.background = "rgba(255,255,255,0.03)";
            }}
            onMouseLeave={(e) => {
              if (page !== id) e.currentTarget.style.background = "transparent";
            }}
          >
            <Ico n={icon} size={18} color={page === id ? colors.accent : colors.textMuted} />
            {label}
          </button>
        ))}
      </nav>

      <div style={{ padding: "16px 12px", borderTop: `1px solid ${colors.border}`, position: "relative" }} ref={dropdownRef}>
        <button
          onClick={() => stores.length > 0 && setDropdownOpen((v) => !v)}
          style={{
            width: "100%",
            background: colors.bgCard,
            border: `1px solid ${dropdownOpen ? colors.accent : colors.border}`,
            borderRadius: 8,
            padding: "12px 14px",
            cursor: stores.length > 0 ? "pointer" : "default",
            textAlign: "left",
            transition: "border-color 0.2s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 11, color: activeStore ? "#10B981" : colors.textMuted, fontWeight: 600, marginBottom: 3, textTransform: "uppercase" }}>
              ● {activeStore ? "Connected" : "No Store Connected"}
            </div>
            {stores.length > 1 && <div style={{ color: colors.textMuted, fontSize: 10 }}>▼</div>}
          </div>
          <div style={{ fontSize: 13, color: colors.textPrimary, fontWeight: 500 }}>
            {activeStore?.shop_name || activeStore?.shop_key || "—"}
          </div>
          <div style={{ fontSize: 11, color: colors.textMuted }}>
            {activeStore ? ".myshopify.com" : "Go to Connect Store"}
          </div>
        </button>

        {dropdownOpen && stores.length > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% - 60px)",
              left: 12,
              right: 12,
              background: "#1a1a2e",
              border: `1px solid ${colors.accent}`,
              borderRadius: 10,
              overflow: "hidden",
              boxShadow: "0 -8px 24px rgba(0,0,0,0.6)",
              zIndex: 200,
            }}
          >
            <div style={{ padding: "8px 12px 6px", fontSize: 10, color: colors.textMuted, fontWeight: 600, textTransform: "uppercase", borderBottom: `1px solid ${colors.border}` }}>
              Connected Stores ({stores.length})
            </div>

            {stores.map((s) => (
              <div
                key={s.shop_key}
                onClick={() => switchStore(s.shop_key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  cursor: "pointer",
                  background: s.is_active ? "rgba(59,130,246,0.1)" : "transparent",
                  borderLeft: `3px solid ${s.is_active ? colors.accent : "transparent"}`,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!s.is_active) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
                onMouseLeave={(e) => {
                  if (!s.is_active) e.currentTarget.style.background = "transparent";
                }}
              >
                <div>
                  <div style={{ fontSize: 13, color: s.is_active ? colors.accent : colors.textPrimary, fontWeight: s.is_active ? 600 : 400 }}>
                    {s.shop_name || s.shop_key}
                    {s.is_active && <span style={{ fontSize: 10, marginLeft: 6, color: "#10B981" }}>✓ active</span>}
                  </div>
                  <div style={{ fontSize: 11, color: colors.textMuted }}>{s.shop_key}</div>
                </div>

                <button
                  onClick={(e) => disconnectStore(s.shop_key, e)}
                  title="Disconnect"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 14, padding: "2px 6px", borderRadius: 4 }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                >
                  ✕
                </button>
              </div>
            ))}

            <div
              onClick={() => {
                setPage("connect");
                setDropdownOpen(false);
              }}
              style={{
                padding: "10px 12px",
                cursor: "pointer",
                borderTop: `1px solid ${colors.border}`,
                fontSize: 13,
                color: colors.accent,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(59,130,246,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              + Connect Another Store
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
