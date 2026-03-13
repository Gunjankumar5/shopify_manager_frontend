import { useState, useEffect } from "react";
import { API_BASE_URL } from "../api/config";
import { Ico, Spin } from "../components/Icons";
import AddCollectionPage from "./Addcollectionpage";

export default function CollectionsPage({ toast }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // null = list, true = new, object = edit
  const [formMode, setFormMode] = useState(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  async function fetchCollections() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/collections/`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCollections(data.custom_collections || []);
    } catch (e) {
      toast?.(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    setRefreshing(true);
    await fetchCollections();
    setRefreshing(false);
  }

  // ── If form open, render full-page editor ───────────────────────────────
  if (formMode !== null) {
    return (
      <AddCollectionPage
        toast={toast}
        editCollection={formMode === true ? null : formMode}
        onBack={() => {
          setFormMode(null);
          fetchCollections();
        }}
      />
    );
  }

  const getImageSrc = (c) => c?.image?.src || "";

  const TYPE_COLORS = {
    custom: { bg: "rgba(59,130,246,.12)", color: "#60a5fa" },
    smart: { bg: "rgba(139,92,246,.12)", color: "#a78bfa" },
  };

  return (
    <div className="fade-up container max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 className="font-display text-2xl font-bold text-primary flex items-center gap-2">
            <Ico n="collections" size="lg" /> Collections
          </h1>
          <p className="text-muted text-sm mt-0.5">
            Organize products into custom collections
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleSync}
            disabled={loading || refreshing}
            className="btn btn-secondary"
          >
            {refreshing ? <Spin size={14} /> : <Ico n="sync" size={14} />}
            <span>{refreshing ? "Syncing…" : "Sync"}</span>
          </button>
          <button
            onClick={() => setFormMode(true)}
            className="btn btn-primary flex items-center gap-2"
            style={{
              background: "var(--accent-gradient)",
              boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
            }}
          >
            <Ico n="plus" size={14} />
            New Collection
          </button>
        </div>
      </div>

      {/* Stats bar */}
      {!loading && collections.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Total", value: collections.length, color: "accent" },
            {
              label: "Custom",
              value: collections.filter(
                (c) => c.collection_type === "custom" || !c.collection_type,
              ).length,
              color: "accent",
            },
            {
              label: "Smart",
              value: collections.filter((c) => c.collection_type === "smart")
                .length,
              color: "warning",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="card flex items-center gap-2 p-2"
              style={{ minWidth: 90 }}
            >
              <div>
                <div
                  className={`font-display text-lg font-bold text-${s.color}`}
                >
                  {s.value}
                </div>
                <div className="text-muted text-xs">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: "grid", gap: 12 }}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 110, borderRadius: 10 }}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && collections.length === 0 && (
        <div className="card p-12 text-center">
          <Ico n="collections" size="xl" className="text-muted mb-3" />
          <p className="text-secondary text-sm mt-3">
            No collections found. Create one to get started!
          </p>
          <button
            onClick={() => setFormMode(true)}
            className="btn btn-primary mt-4 mx-auto"
            style={{ background: "var(--accent-gradient)" }}
          >
            <Ico n="plus" size={14} /> New Collection
          </button>
        </div>
      )}

      {/* Collections list */}
      {!loading && collections.length > 0 && (
        <div style={{ display: "grid", gap: 10 }}>
          {collections.map((col) => {
            const imgSrc = getImageSrc(col);
            const type = col.collection_type || "custom";
            const tc = TYPE_COLORS[type] || TYPE_COLORS.custom;
            return (
              <div
                key={col.id}
                className="card card-hover"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "14px 18px",
                  cursor: "pointer",
                  transition: "all .15s",
                }}
                onClick={() => setFormMode(col)}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 8,
                    border: "1px solid var(--border-strong)",
                    overflow: "hidden",
                    flexShrink: 0,
                    background: "var(--bg-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={col.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Ico n="image" size={20} className="text-muted" />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 3,
                    }}
                  >
                    <span
                      className="font-display font-bold text-primary"
                      style={{ fontSize: 14 }}
                    >
                      {col.title}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: 4,
                        background: tc.bg,
                        color: tc.color,
                        textTransform: "uppercase",
                        letterSpacing: ".04em",
                      }}
                    >
                      {type}
                    </span>
                  </div>
                  {col.body_html && (
                    <div
                      className="text-muted"
                      style={{
                        fontSize: 12,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                      }}
                      dangerouslySetInnerHTML={{ __html: col.body_html }}
                    />
                  )}
                  <div
                    className="text-muted"
                    style={{ fontSize: 11, marginTop: 3 }}
                  >
                    ID:{" "}
                    <code
                      style={{
                        fontSize: 10,
                        background: "var(--bg-secondary)",
                        padding: "1px 5px",
                        borderRadius: 3,
                      }}
                    >
                      {col.id}
                    </code>
                  </div>
                </div>

                {/* Arrow */}
                <div
                  style={{
                    flexShrink: 0,
                    color: "var(--text-muted)",
                    opacity: 0.4,
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
