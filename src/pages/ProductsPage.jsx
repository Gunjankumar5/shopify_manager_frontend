import { useState, useEffect, useCallback } from "react";
import { api } from "../api/api";
import { Ico, Spin } from "../components/Icons";
import { Badge } from "../components/UI";
import { PriceModal } from "../components/Modals";
import ProductCard from "../components/ProductCard";
import AddProductPage from "./AddProductPage";

const ProductsPage = ({ toast }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("all");
  const [sel, setSel] = useState(new Set());
  const [priceM, setPriceM] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // null = list view, true = new product form, object = edit product form
  const [formMode, setFormMode] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam =
        statusF && statusF !== "all" ? `?status=${statusF}` : "";
      const d = await api.get(`/products${statusParam}`);
      setProducts(d.products || []);
    } catch {
      toast("Failed to load products", "error");
    }
    setLoading(false);
  }, [statusF, toast]);

  useEffect(() => {
    load();
  }, [load]);

  // ── If form is open, render it full-page ─────────────────────────────────
  if (formMode !== null) {
    return (
      <AddProductPage
        toast={toast}
        editProduct={formMode === true ? null : formMode}
        onBack={() => {
          setFormMode(null);
          load();
        }}
      />
    );
  }

  const filtered = products.filter(
    (p) =>
      !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.vendor?.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleSel = (id) =>
    setSel((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const selAll = () =>
    setSel(
      sel.size === filtered.length
        ? new Set()
        : new Set(filtered.map((p) => p.id)),
    );

  const handleDel = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    setDeleting(id);
    try {
      await api.delete(`/products/${id}`);
      toast("Deleted");
      load();
    } catch {
      toast("Failed", "error");
    }
    setDeleting(null);
  };

  const handleRemoveDuplicates = async () => {
    try {
      const preview = await api.get("/products/find-duplicates");
      if (preview.duplicates_found === 0) {
        toast("No duplicate products found! ✅", "success");
        return;
      }
      const list = preview.duplicates.map((d) => `• ${d.title}`).join("\n");
      if (
        !window.confirm(
          `Found ${preview.duplicates_found} duplicate(s):\n\n${list}\n\nDelete them? (keeps the first one)`,
        )
      )
        return;
      const result = await api.post("/products/remove-duplicates", {});
      toast(
        `Deleted ${result.deleted} duplicate(s)!${result.failed ? ` (${result.failed} failed)` : ""}`,
        result.deleted > 0 ? "success" : "error",
      );
      load();
    } catch {
      toast("Failed to remove duplicates", "error");
    }
  };

  const handleBulkDel = async () => {
    if (!sel.size || !window.confirm(`Delete ${sel.size} products?`)) return;
    let ok = 0,
      fail = 0;
    for (const id of sel) {
      try {
        await api.delete(`/products/${id}`);
        ok++;
      } catch {
        fail++;
      }
    }
    toast(`Deleted ${ok}${fail ? `, ${fail} failed` : ""}`);
    setSel(new Set());
    load();
  };

  const syncShopify = async () => {
    try {
      setLoading(true);
      const d = await api.get("/products/sync");
      setProducts(d.products || []);
      toast(`✅ Synced ${d.count} products from Shopify!`);
    } catch {
      toast("Failed to sync from Shopify", "error");
    }
    setLoading(false);
  };

  const handlePriceAdj = async ({ mode, value, dir }) => {
    const prods = products.filter((p) => sel.has(p.id));
    let ok = 0,
      fail = 0;
    for (const p of prods) {
      const v = p.variants?.[0];
      if (!v?.price) continue;
      const cur = parseFloat(v.price);
      let np =
        mode === "percent"
          ? dir === "increase"
            ? cur * (1 + value / 100)
            : cur * (1 - value / 100)
          : dir === "increase"
            ? cur + value
            : cur - value;
      np = Math.max(0, np).toFixed(2);
      try {
        await api.put(`/products/${p.id}`, {
          title: p.title,
          variants: [{ ...v, price: np }],
        });
        ok++;
      } catch {
        fail++;
      }
    }
    toast(`Updated ${ok} prices${fail ? `, ${fail} failed` : ""}`);
    setPriceM(false);
    setSel(new Set());
    load();
  };

  const stats = {
    total: products.length,
    active: products.filter((p) => p.status === "active").length,
    draft: products.filter((p) => p.status === "draft").length,
  };

  return (
    <div className="fade-up container max-w-7xl mx-auto px-4 py-8">
      {priceM && (
        <PriceModal
          count={sel.size}
          onApply={handlePriceAdj}
          onClose={() => setPriceM(false)}
        />
      )}

      {/* Header */}
      <div className="mb-4">
        <h1 className="font-display text-2xl font-bold text-primary flex items-center gap-2">
          <Ico n="products" size="lg" /> Products
        </h1>
        <p className="text-muted text-xs mt-0.5">
          Manage your Shopify product catalog
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        {[
          {
            label: "Total",
            value: stats.total,
            color: "accent",
            icon: "products",
          },
          {
            label: "Active",
            value: stats.active,
            color: "success",
            icon: "check",
          },
          {
            label: "Drafts",
            value: stats.draft,
            color: "warning",
            icon: "edit",
          },
        ].map((s) => (
          <div key={s.label} className="card flex items-center gap-2 p-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: `var(--${s.color}-light)`,
                color: `var(--${s.color})`,
              }}
            >
              <Ico n={s.icon} size={16} color={`var(--${s.color})`} />
            </div>
            <div>
              <div className={`font-display text-lg font-bold text-${s.color}`}>
                {loading ? "—" : s.value}
              </div>
              <div className="text-muted text-xs">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div
        className="flex flex-row flex-wrap items-center gap-2 mb-6 p-2 rounded-xl"
        style={{
          background: "rgba(26,26,30,0.5)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(58,58,68,0.2)",
        }}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] group">
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            <Ico n="search" size={14} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg transition-all outline-none placeholder:text-muted/60"
            style={{
              background: "var(--bg-input)",
              border: "1px solid transparent",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.boxShadow =
                "0 0 0 4px rgba(99,102,241,0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={statusF}
            onChange={(e) => setStatusF(e.target.value)}
            className="appearance-none cursor-pointer px-4 py-2 pr-10 text-sm rounded-lg transition-all outline-none"
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border-strong)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.boxShadow =
                "0 0 0 4px rgba(99,102,241,0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border-strong)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {[
              { v: "all", l: "All Status" },
              { v: "active", l: "Active" },
              { v: "draft", l: "Draft" },
              { v: "archived", l: "Archived" },
            ].map((o) => (
              <option key={o.v} value={o.v}>
                {o.l}
              </option>
            ))}
          </select>
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--text-muted)" }}
          >
            <Ico n="chevron-down" size={12} />
          </div>
        </div>

        {/* View toggle */}
        <div
          className="flex p-1 rounded-lg"
          style={{
            background: "rgba(58,58,68,0.2)",
            border: "1px solid rgba(58,58,68,0.3)",
          }}
        >
          {[
            { id: "grid", icon: "grid" },
            { id: "list", icon: "list" },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className="flex items-center justify-center w-8 h-8 rounded-md transition-all"
              style={{
                background: view === v.id ? "var(--bg-card)" : "transparent",
                boxShadow: view === v.id ? "var(--shadow-sm)" : "none",
                color:
                  view === v.id ? "var(--text-primary)" : "var(--text-muted)",
              }}
              aria-label={`${v.id} view`}
            >
              <Ico n={v.icon} size={14} />
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={syncShopify}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-strong)",
              color: "var(--text-secondary)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--bg-elevated)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--bg-card)")
            }
          >
            {loading ? <Spin size={14} /> : <Ico n="sync" size={14} />}
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            onClick={() => setFormMode(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all active:scale-95"
            style={{
              background: "var(--accent-gradient)",
              color: "white",
              boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
            }}
          >
            <Ico n="plus" size={14} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {sel.size > 0 && (
        <div className="bg-accent-light border border-accent/25 rounded-lg p-2 mb-3 flex flex-wrap items-center gap-2 fade-up">
          <span className="text-xs font-semibold text-accent">
            {sel.size} selected
          </span>
          <div className="flex-1" />
          <button
            onClick={() => setPriceM(true)}
            className="btn btn-secondary btn-sm"
          >
            <Ico n="percent" size="xs" color="var(--accent)" /> Adjust Prices
          </button>
          <button
            onClick={handleRemoveDuplicates}
            className="btn btn-secondary btn-sm"
          >
            <Ico n="percent" size="xs" color="var(--warning)" /> Remove
            Duplicates
          </button>
          <button onClick={handleBulkDel} className="btn btn-danger btn-sm">
            <Ico n="trash" size="xs" /> Delete
          </button>
          <button
            onClick={() => setSel(new Set())}
            className="btn btn-secondary btn-sm"
            aria-label="Clear selection"
          >
            <Ico n="x" size="xs" />
          </button>
        </div>
      )}

      {/* Select All */}
      {filtered.length > 0 && (
        <div className="flex items-center gap-1.5 mb-2">
          <input
            type="checkbox"
            className="chk"
            checked={sel.size === filtered.length && filtered.length > 0}
            onChange={selAll}
            id="selectAll"
          />
          <label
            htmlFor="selectAll"
            className="text-xs text-secondary cursor-pointer"
          >
            Select all {filtered.length}
          </label>
        </div>
      )}

      {/* Product Grid/List */}
      {loading ? (
        <div
          className={
            view === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
              : "space-y-2"
          }
        >
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: view === "grid" ? 280 : 60 }}
            />
          ))}
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              p={p}
              sel={sel.has(p.id)}
              onSel={toggleSel}
              onEdit={() => setFormMode(p)}
              onDel={handleDel}
            />
          ))}
          {filtered.length === 0 && (
            <p className="text-muted text-center py-8 col-span-full">
              No products found
            </p>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-secondary border-b border-strong">
              <tr>
                <th className="p-2 w-8"></th>
                {["Product", "Vendor", "Price", "Stock", "Status", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="p-2 text-left text-[0.65rem] font-semibold text-muted uppercase"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const img = p.images?.[0]?.src;
                const price = p.variants?.[0]?.price;
                const inv = p.variants?.reduce(
                  (s, v) => s + (v.inventory_quantity || 0),
                  0,
                );
                return (
                  <tr
                    key={p.id}
                    className="border-b border-strong last:border-0 hover:bg-elevated transition-colors"
                  >
                    <td className="p-2">
                      <input
                        type="checkbox"
                        className="chk"
                        checked={sel.has(p.id)}
                        onChange={() => toggleSel(p.id)}
                        aria-label={`Select ${p.title}`}
                      />
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-secondary overflow-hidden flex items-center justify-center flex-shrink-0">
                          {img ? (
                            <img
                              src={img}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Ico n="image" size={12} className="text-muted" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-primary text-xs">
                            {p.title}
                          </div>
                          {p.product_type && (
                            <div className="text-[0.6rem] text-muted">
                              {p.product_type}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-2 text-secondary text-xs">
                      {p.vendor || "—"}
                    </td>
                    <td className="p-2 font-semibold text-accent text-xs">
                      {price ? `$${price}` : "—"}
                    </td>
                    <td
                      className={`p-2 text-xs ${inv > 0 ? "text-success" : "text-danger"}`}
                    >
                      {inv}
                    </td>
                    <td className="p-2">
                      <Badge status={p.status} />
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setFormMode(p)}
                          className="btn btn-secondary"
                          style={{ padding: "4px", fontSize: "0" }}
                          aria-label="Edit"
                        >
                          <Ico n="edit" size={12} color="var(--accent)" />
                        </button>
                        <button
                          onClick={() => handleDel(p.id)}
                          disabled={deleting === p.id}
                          className="btn btn-secondary"
                          style={{ padding: "4px", fontSize: "0" }}
                          aria-label="Delete"
                        >
                          {deleting === p.id ? (
                            <Spin size={12} />
                          ) : (
                            <Ico n="trash" size={12} color="var(--danger)" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-muted">
                    No products
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
