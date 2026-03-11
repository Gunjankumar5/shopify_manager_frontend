import { Ico } from "./Icons";
import { Badge } from "./UI";

const ProductCard = ({ p, sel, onSel, onEdit, onDel }) => {
  const img = p.images?.[0]?.src;
  const price = p.variants?.[0]?.price;
  const cmp = p.variants?.[0]?.compare_at_price;
  const inv = p.variants?.reduce((s, v) => s + (v.inventory_quantity || 0), 0);

  // Determine inventory status color
  const getInventoryStatus = () => {
    if (inv === 0)
      return {
        color: "var(--danger)",
        bg: "rgba(239,68,68,0.1)",
        label: "Out of stock",
      };
    if (inv < 5)
      return {
        color: "var(--warning)",
        bg: "rgba(245,158,11,0.1)",
        label: `Only ${inv} left`,
      };
    return {
      color: "var(--success)",
      bg: "rgba(16,185,129,0.1)",
      label: `${inv} in stock`,
    };
  };
  const invStatus = getInventoryStatus();

  return (
    <div
      className="card-hover"
      style={{
        background: "var(--bg-card)",
        border: `2px solid ${sel ? "var(--accent)" : "var(--border-strong)"}`,
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        position: "relative",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        boxShadow: "var(--shadow-sm)", // subtle default shadow
      }}
    >
      {/* Selection checkbox */}
      <div
        style={{
          position: "absolute",
          top: "var(--space-3)",
          left: "var(--space-3)",
          zIndex: 5,
          background: "rgba(0,0,0,0.3)",
          borderRadius: "var(--radius-sm)",
          padding: "2px",
          backdropFilter: "blur(2px)",
        }}
      >
        <input
          type="checkbox"
          className="chk"
          checked={sel}
          onChange={() => onSel(p.id)}
          aria-label={`Select ${p.title}`}
        />
      </div>

      {/* Sale badge (if compare at price exists) */}
      {cmp && (
        <div
          style={{
            position: "absolute",
            top: "var(--space-3)",
            left: "calc(var(--space-8) + 8px)", // positioned after checkbox
            zIndex: 5,
            background: "var(--accent)",
            color: "white",
            fontSize: "var(--text-xs)",
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: "var(--radius-full)",
            boxShadow: "var(--shadow-sm)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Sale
        </div>
      )}

      {/* Status badge (from props) */}
      <div
        style={{
          position: "absolute",
          top: "var(--space-3)",
          right: "var(--space-3)",
          zIndex: 5,
        }}
      >
        <Badge status={p.status} />
      </div>

      {/* Image area with overlay on hover */}
      <div
        style={{
          height: 190,
          background: "var(--bg-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {img ? (
          <>
            <img
              src={img}
              alt={p.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.3s var(--transition-base)",
                willChange: "transform",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.08)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            />
            {/* Image overlay on hover */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.3)",
                opacity: 0,
                transition: "opacity 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
              className="image-overlay"
            >
              <Ico n="eye" size={24} color="white" />
            </div>
            <style>{`
              .card-hover:hover .image-overlay { opacity: 1; }
            `}</style>
          </>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "var(--space-1)",
              color: "var(--border-strong)",
            }}
          >
            <Ico n="image" size={36} color="var(--border-strong)" />
            <span style={{ fontSize: "var(--text-xs)" }}>No image</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "var(--space-4)" }}>
        {/* Title and vendor with icon */}
        <div style={{ marginBottom: "var(--space-2)" }}>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-base)",
              fontWeight: 700,
              color: "var(--text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {p.title}
          </h3>
          {p.vendor && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "var(--text-xs)",
                color: "var(--text-muted)",
                marginTop: "2px",
              }}
            >
              <Ico n="store" size={12} color="var(--text-muted)" />
              <span>{p.vendor}</span>
            </div>
          )}
        </div>

        {/* Price & stock */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "var(--space-4)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "var(--space-2)",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: "var(--text-lg)",
                fontWeight: 700,
                color: "var(--accent)",
              }}
            >
              {price ? `$${price}` : "—"}
            </span>
            {cmp && (
              <span
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-muted)",
                  textDecoration: "line-through",
                }}
              >
                ${cmp}
              </span>
            )}
          </div>

          <span
            style={{
              fontSize: "var(--text-xs)",
              color: invStatus.color,
              background: invStatus.bg,
              padding: "var(--space-1) var(--space-2)",
              borderRadius: "var(--radius-full)",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {invStatus.label}
          </span>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <button
            onClick={() => onEdit(p)}
            className="btn btn-secondary"
            style={{
              flex: 1,
              padding: "var(--space-2) var(--space-3)",
              fontSize: "var(--text-xs)",
            }}
            aria-label="Edit product"
            title="Edit product"
          >
            <Ico n="edit" size={13} color="var(--accent)" /> Edit
          </button>
          <button
            onClick={() => onDel(p.id)}
            className="btn btn-danger"
            style={{ padding: "var(--space-2) var(--space-3)" }}
            aria-label="Delete product"
            title="Delete product"
          >
            <Ico n="trash" size={13} color="var(--danger)" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
