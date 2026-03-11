import { Ico } from "./Icons";

// Modern color scheme (can be moved to :root in global CSS)
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

const Sidebar = ({ page, setPage }) => (
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
    {/* Header with logo */}
    <div
      style={{
        padding: "24px 18px 18px",
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8, // Reduced from 12px
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
          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 16,
              fontWeight: 800,
              color: colors.textPrimary,
            }}
          >
            ShopManager
          </div>
          <div style={{ fontSize: 11, color: colors.textMuted }}>
            Shopify Control
          </div>
        </div>
      </div>
    </div>

    {/* Navigation */}
    <nav
      style={{
        flex: 1,
        padding: "16px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      {[
        { id: "products", label: "Products", icon: "products" },
        { id: "upload", label: "Upload", icon: "upload" },
        { id: "collections", label: "Collections", icon: "collections" },
        { id: "inventory", label: "Inventory", icon: "inventory" },
      ].map(({ id, label, icon }) => (
        <button
          key={id}
          onClick={() => setPage(id)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 14px",
            borderRadius: 6, // Reduced from 12px
            border: "none",
            cursor: "pointer",
            background:
              page === id
                ? `rgba(59, 130, 246, 0.15)` // Softer active background
                : "transparent",
            color: page === id ? colors.accent : colors.textMuted,
            fontSize: 14,
            fontWeight: page === id ? 600 : 400,
            transition: "all 0.2s ease",
            textAlign: "left",
            borderLeft: `3px solid ${
              page === id ? colors.accent : "transparent"
            }`,
          }}
          onMouseEnter={(e) => {
            if (page !== id) {
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
            }
          }}
          onMouseLeave={(e) => {
            if (page !== id) {
              e.currentTarget.style.background = "transparent";
            }
          }}
        >
          <Ico
            n={icon}
            size={18}
            color={page === id ? colors.accent : colors.textMuted}
          />
          {label}
        </button>
      ))}
    </nav>

    {/* Store connection status */}
    <div
      style={{
        padding: "16px 12px",
        borderTop: `1px solid ${colors.border}`,
      }}
    >
      <div
        style={{
          background: colors.bgCard,
          border: `1px solid ${colors.border}`,
          borderRadius: 8, // Reduced from 14px
          padding: "14px 16px",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "#10B981", // Fresh green
            fontWeight: 600,
            marginBottom: 4,
            textTransform: "uppercase",
          }}
        >
          ● Connected
        </div>
        <div
          style={{
            fontSize: 14,
            color: colors.textPrimary,
            fontWeight: 500,
          }}
        >
          gunjanck-2
        </div>
        <div style={{ fontSize: 11, color: colors.textMuted }}>
          myshopify.com
        </div>
      </div>
    </div>
  </aside>
);

export default Sidebar;
