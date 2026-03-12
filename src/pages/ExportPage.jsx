import { useState, useRef, useCallback, useEffect } from "react";
import { API_BASE_URL } from "../api/config";
import { Ico, Spin } from "../components/Icons"; // adjust path if needed

// ─── CDN libs ─────────────────────────────────────────────────────────────────
const HOT_CSS =
  "https://cdn.jsdelivr.net/npm/handsontable/dist/handsontable.full.min.css";
const HOT_JS =
  "https://cdn.jsdelivr.net/npm/handsontable/dist/handsontable.full.min.js";
const XLSX_JS = "https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js";

function loadScript(src) {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) return res();
    const s = document.createElement("script");
    s.src = src;
    s.onload = res;
    s.onerror = rej;
    document.head.appendChild(s);
  });
}
function loadLink(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = href;
  document.head.appendChild(l);
}

const READONLY_COLS = new Set([
  "Product ID",
  "Variant ID",
  "Inventory Item ID",
  "Created At",
  "Updated At",
  "Published At",
  "Gift Card",
  "Fulfillment Service",
  "Sync Status",
  "Last Synced",
]);

const STATUS_COLORS = {
  UPDATED: "var(--success)",
  CREATED: "var(--accent)",
  ERROR: "var(--danger)",
  CONFLICT: "var(--warning)",
  DELETED: "var(--danger)",
};

const LOAD_STEPS = [
  "Starting bulk operation",
  "Waiting for Shopify",
  "Downloading product data",
  "Fetching inventory & collections",
  "Preparing grid",
];

// ─── Loading overlay (redesigned with global tokens) ─────────────────────────
function LoadingOverlay({ step, elapsed }) {
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        background: "var(--bg-overlay)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="card"
        style={{ minWidth: 320, padding: "var(--space-6)" }}
      >
        <div className="flex justify-between items-center mb-4">
          <span
            className="badge badge-warning"
            style={{ fontSize: "var(--text-xs)" }}
          >
            LOADING FROM SHOPIFY
          </span>
          <span className="text-muted text-xs">{fmt(elapsed)}</span>
        </div>
        <div className="space-y-2 mb-4">
          {LOAD_STEPS.map((s, i) => {
            const done = step > i + 1,
              active = step === i + 1;
            return (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`flex items-center justify-center w-4 h-4 rounded-full border ${
                    done
                      ? "border-success bg-success-light"
                      : active
                        ? "border-warning bg-warning-light"
                        : "border-strong"
                  }`}
                >
                  {done && <Ico n="check" size={10} color="var(--success)" />}
                  {active && <Spin size={10} color="var(--warning)" />}
                </div>
                <span
                  className={`text-xs ${
                    done
                      ? "text-success"
                      : active
                        ? "text-primary"
                        : "text-muted"
                  }`}
                >
                  {s}
                </span>
              </div>
            );
          })}
        </div>
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-warning transition-all duration-700"
            style={{
              width: `${Math.min((step / LOAD_STEPS.length) * 100, 93)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Sync progress bar (redesigned) ───────────────────────────────────────────
function SyncProgressBar({ syncState, totalRows }) {
  if (!syncState) return null;
  const { results = {}, summary } = syncState;
  const done = Object.keys(results).length;
  const pct = totalRows > 0 ? Math.round((done / totalRows) * 100) : 0;
  const counts = Object.values(results).reduce((acc, s) => {
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const StatusPill = ({ label, count, color }) => {
    if (!count) return null;
    return (
      <span
        className="badge"
        style={{
          backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
          color,
          border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
        }}
      >
        {count} {label}
      </span>
    );
  };

  return (
    <div
      className="flex items-center gap-3 px-4 py-1 border-b border-strong"
      style={{ background: "var(--bg-secondary)", height: 32 }}
    >
      <div className="w-40 h-1 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-success transition-all duration-300"
          style={{ width: summary ? "100%" : `${pct}%` }}
        />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {!summary ? (
          <>
            <span className="text-xs font-semibold text-success min-w-[32px]">
              {pct}%
            </span>
            <StatusPill
              label="UPDATED"
              count={counts.UPDATED}
              color="var(--success)"
            />
            <StatusPill
              label="SKIPPED"
              count={counts.SKIPPED}
              color="var(--text-muted)"
            />
            <StatusPill
              label="ERROR"
              count={counts.ERROR}
              color="var(--danger)"
            />
            <StatusPill
              label="CONFLICT"
              count={counts.CONFLICT}
              color="var(--warning)"
            />
            <span className="text-xs text-muted">
              {done} / {totalRows}
            </span>
          </>
        ) : (
          <>
            <span className="text-xs font-semibold text-success uppercase tracking-wider">
              ✓ Sync Complete
            </span>
            <StatusPill
              label="UPDATED"
              count={summary.updated}
              color="var(--success)"
            />
            <StatusPill
              label="CREATED"
              count={summary.created}
              color="var(--accent)"
            />
            <StatusPill
              label="SKIPPED"
              count={summary.skipped}
              color="var(--text-muted)"
            />
            <StatusPill
              label="ERRORS"
              count={summary.errors}
              color="var(--danger)"
            />
            <StatusPill
              label="CONFLICT"
              count={summary.conflicts}
              color="var(--warning)"
            />
            <span className="text-xs text-muted ml-auto">
              {summary.duration_seconds}s
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main ExportPage ──────────────────────────────────────────────────────────
const ExportPage = ({ toast }) => {
  const containerRef = useRef(null);
  const hotRef = useRef(null);
  const rowsRef = useRef([]);
  const snapshotRef = useRef({});
  const gridChanges = useRef(new Map());
  const importedRows = useRef(new Set());
  const gridCols = useRef([]);
  const syncResults = useRef({});
  const wsRef = useRef(null);

  const [libsReady, setLibsReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [changedCount, setChangedCount] = useState(0);
  const [selectedRow, setSelectedRow] = useState(null);
  const [syncState, setSyncState] = useState(null);
  const [importLabel, setImportLabel] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadLink(HOT_CSS);
    Promise.all([loadScript(HOT_JS), loadScript(XLSX_JS)])
      .then(() => setLibsReady(true))
      .catch(() => toast?.("Failed to load grid libraries", "error"));

    const style = document.createElement("style");
    style.id = "hot-export-styles";
    style.textContent = `
      @keyframes spin { to { transform: rotate(360deg); } }
      #hot-export .handsontable th {
        background: var(--bg-secondary) !important;
        color: var(--text-muted) !important;
        border-color: var(--border-strong) !important;
        font-size: 10px !important;
        font-weight: 600 !important;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-family: 'IBM Plex Mono', monospace !important;
      }
      #hot-export .handsontable td {
        background: var(--bg-primary) !important;
        color: var(--text-primary) !important;
        border-color: var(--border-subtle) !important;
        font-size: 11px !important;
        font-family: 'IBM Plex Mono', monospace !important;
      }
      #hot-export .handsontable tr:nth-child(even) td {
        background: var(--bg-secondary) !important;
      }
      #hot-export .handsontable .ro-cell {
        background: var(--bg-card) !important;
        color: var(--text-muted) !important;
        font-style: italic;
      }
      #hot-export .handsontable .changed-cell {
        background: var(--warning-light) !important;
        color: var(--warning) !important;
      }
      #hot-export .handsontable .imported-cell {
        background: var(--accent-light) !important;
        color: var(--accent) !important;
      }
      #hot-export .handsontable .s-UPDATED  { background: var(--success-light) !important; color: #000 !important; }
      #hot-export .handsontable .s-CREATED  { background: var(--accent-light) !important; }
      #hot-export .handsontable .s-ERROR    { background: var(--danger-light) !important; }
      #hot-export .handsontable .s-CONFLICT { background: var(--warning-light) !important; }
      #hot-export .handsontable .s-DELETED  { background: var(--danger-light) !important; }
      #hot-export .handsontable .wtBorder.current { border-color: var(--accent) !important; }
      #hot-export .handsontable .htContextMenu table.htCore td {
        background: var(--bg-card) !important;
        color: var(--text-primary) !important;
        border-color: var(--border-strong) !important;
      }
      #hot-export .handsontable .htContextMenu table.htCore tr:hover td {
        background: var(--accent-light) !important;
        color: var(--accent) !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);

  const initGrid = useCallback((rows) => {
    if (!rows?.length || !containerRef.current) return;
    const HOT = window.Handsontable;
    if (!HOT) return;

    if (hotRef.current) {
      hotRef.current.destroy();
      hotRef.current = null;
    }

    const keys = Object.keys(rows[0]);
    gridCols.current = keys;

    const columns = keys.map((key) => {
      if (key === "Image URLs") {
        return {
          data: key,
          readOnly: true,
          renderer: function (instance, td, row, col, prop, value) {
            td.innerHTML = "";
            td.style.cssText = "padding:2px 4px;overflow:hidden;";
            const urls = String(value || "")
              .split(",")
              .map((u) => u.trim())
              .filter(Boolean);
            urls.slice(0, 3).forEach((url) => {
              const img = document.createElement("img");
              img.src = url;
              img.style.cssText =
                "height:38px;width:auto;max-width:44px;object-fit:cover;border-radius:var(--radius-sm);cursor:pointer;margin-right:2px;vertical-align:middle;";
              img.onclick = (e) => {
                e.stopPropagation();
                window.open(url, "_blank");
              };
              img.onerror = () => {
                img.style.display = "none";
              };
              td.appendChild(img);
            });
          },
        };
      }
      const col = { data: key, readOnly: READONLY_COLS.has(key) };
      if (key === "Status") {
        col.type = "dropdown";
        col.source = ["ACTIVE", "DRAFT", "ARCHIVED"];
      }
      if (key === "Delete") {
        col.type = "dropdown";
        col.source = ["", "YES"];
      }
      if (
        /Variant Price|Compare At Price|Cost per item|Variant Grams/.test(key)
      )
        col.type = "numeric";
      return col;
    });

    hotRef.current = new HOT(containerRef.current, {
      data: rows,
      columns,
      colHeaders: keys,
      rowHeaders: true,
      width: "100%",
      height: "100%",
      licenseKey: "non-commercial-and-evaluation",
      stretchH: "none",
      columnSorting: true,
      filters: true,
      dropdownMenu: true,
      contextMenu: true,
      manualColumnResize: true,
      manualColumnMove: true,
      autoWrapRow: true,
      wordWrap: false,
      rowHeight: 44,
      colWidths: (i) => {
        const k = keys[i];
        if (k === "Image URLs") return 140;
        if (k === "Title") return 220;
        if (k === "Body (HTML)" || k === "SEO Description") return 160;
        if (k === "Tags") return 180;
        return 120;
      },

      cells(row, col) {
        const key = keys[col];
        const status = syncResults.current[row];
        if (status && STATUS_COLORS[status])
          return { className: `s-${status}` };
        if (READONLY_COLS.has(key) || key === "Image URLs")
          return { className: "ro-cell" };
        const hot = hotRef.current;
        if (hot) {
          const di = keys.indexOf("Delete");
          if (
            di >= 0 &&
            String(hot.getDataAtCell(row, di) || "").toUpperCase() === "YES"
          )
            return { className: "s-DELETED" };
        }
        if (importedRows.current.has(row) && gridChanges.current.has(row))
          return { className: "imported-cell" };
        return {};
      },

      afterChange(changes, source) {
        if (!changes || source === "loadData") return;
        changes.forEach(([row, prop, oldVal, newVal]) => {
          if (oldVal === newVal) return;
          if (!gridChanges.current.has(row))
            gridChanges.current.set(row, {
              ...hotRef.current.getSourceDataAtRow(row),
            });
          gridChanges.current.get(row)[prop] = newVal;
          importedRows.current.delete(row);
          const ci = keys.indexOf(prop);
          hotRef.current.setCellMeta(row, ci, "className", "changed-cell");
        });
        hotRef.current.render();
        setChangedCount(gridChanges.current.size);
      },

      afterOnCellMouseDown(event, coords) {
        if (coords.row >= 0) setSelectedRow(coords.row);
      },
    });

    rowsRef.current = rows;
    setHasData(true);
    setRowCount(rows.length);
    setChangedCount(0);
    setSyncState(null);
    syncResults.current = {};
  }, []);

  const loadFromShopify = useCallback(async () => {
    if (!libsReady) return;
    setLoading(true);
    setLoadStep(1);
    setElapsed(0);
    setSyncState(null);
    syncResults.current = {};
    gridChanges.current.clear();
    importedRows.current.clear();
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    const handles = [3000, 8000, 25000, 50000].map((d, i) =>
      setTimeout(() => setLoadStep(i + 2), d),
    );
    try {
      const res = await fetch(`${API_BASE_URL}/export/json`);
      if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
      const data = await res.json();
      setLoadStep(5);
      const rows = (data.rows || []).map((r) => {
        const o = {};
        Object.keys(r).forEach((k) => {
          o[k] = r[k] ?? "";
        });
        return o;
      });
      snapshotRef.current = data.snapshot || {};
      setTimeout(() => initGrid(rows), 100);
      toast?.("Loaded " + rows.length + " rows", "success");
    } catch (err) {
      toast?.(err.message || "Failed to load", "error");
    } finally {
      handles.forEach(clearTimeout);
      clearInterval(timer);
      setLoading(false);
      setLoadStep(0);
      setElapsed(0);
    }
  }, [libsReady, toast, initGrid]);

  const handleImport = useCallback(
    async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      e.target.value = "";
      setImportLabel(`Parsing ${file.name}…`);
      try {
        const buf = await file.arrayBuffer();
        const wb = window.XLSX.read(buf, { type: "array", cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = window.XLSX.utils.sheet_to_json(ws, { defval: "" });
        if (!rows.length) throw new Error("No rows found");
        gridChanges.current.clear();
        importedRows.current.clear();
        snapshotRef.current = {};
        initGrid(rows);
        rows.forEach((row, i) => {
          if (row["Product ID"] && row["Variant ID"]) {
            gridChanges.current.set(i, { ...row });
            importedRows.current.add(i);
          }
        });
        setChangedCount(gridChanges.current.size);
        hotRef.current?.render();
        setImportLabel(`✓ ${rows.length} rows from ${file.name}`);
        toast?.(`Imported ${rows.length} rows`, "success");
      } catch (err) {
        toast?.(err.message || "Import failed", "error");
        setImportLabel("");
      } finally {
        setTimeout(() => setImportLabel(""), 3000);
      }
    },
    [initGrid, toast],
  );

  const exportXlsx = useCallback(() => {
    if (!window.XLSX || !hotRef.current) return;
    try {
      const data = hotRef.current.getData();
      const ws = window.XLSX.utils.aoa_to_sheet([gridCols.current, ...data]);
      const wb = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(wb, ws, "Products");
      window.XLSX.writeFile(
        wb,
        `shopify_products_${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
      toast?.("Exported!", "success");
    } catch (err) {
      toast?.(err.message || "Export failed", "error");
    }
  }, [toast]);

  const insertRow = useCallback(
    (mode) => {
      if (!hotRef.current || !rowsRef.current.length) return;
      const PROD_LEVEL = [
        "Product ID",
        "Title",
        "Body (HTML)",
        "Vendor",
        "Type",
        "Tags",
        "Status",
        "Handle",
        "SEO Title",
        "SEO Description",
        "Image URLs",
        "Image Alt Text",
        "Collection Handles",
        "Collection Names",
      ];
      const srcRow =
        selectedRow !== null
          ? hotRef.current.getSourceDataAtRow(selectedRow)
          : null;
      const blank = Object.fromEntries(
        gridCols.current.map((k) => {
          if (mode === "variant" && srcRow)
            return [k, PROD_LEVEL.includes(k) ? (srcRow[k] ?? "") : ""];
          return [k, ""];
        }),
      );
      const at =
        mode === "product"
          ? rowsRef.current.length
          : selectedRow !== null
            ? selectedRow + 1
            : rowsRef.current.length;
      hotRef.current.alter("insert_row_below", at - 1, 1);
      hotRef.current.populateFromArray(at, 0, [
        gridCols.current.map((k) => blank[k] ?? ""),
      ]);
      hotRef.current.scrollViewportTo({ row: at });
      setRowCount((r) => r + 1);
    },
    [selectedRow],
  );

  const removeRow = useCallback(() => {
    if (selectedRow === null || !hotRef.current) return;
    hotRef.current.alter("remove_row", selectedRow, 1);
    gridChanges.current.delete(selectedRow);
    setSelectedRow(null);
    setRowCount((r) => r - 1);
    setChangedCount(gridChanges.current.size);
  }, [selectedRow]);

  const handleSync = useCallback(async () => {
    if (!hotRef.current || syncing) return;
    const data = hotRef.current.getData();
    const rows = data.map((r) =>
      Object.fromEntries(gridCols.current.map((h, i) => [h, r[i] ?? ""])),
    );
    setSyncing(true);
    setSyncState({ results: {} });
    syncResults.current = {};
    try {
      const startRes = await fetch(`${API_BASE_URL}/export/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows, snapshot: snapshotRef.current }),
      });
      if (!startRes.ok) throw new Error(await startRes.text());
      const { session_id } = await startRes.json();

      const isLocal =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      const wsUrl = isLocal
        ? `ws://127.0.0.1:8000/api/export/sync/progress?session=${session_id}`
        : `wss://${window.location.host}/api/export/sync/progress?session=${session_id}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.auth_error) {
          toast?.("Access token expired", "error");
          setSyncing(false);
          ws.close();
          return;
        }
        if (msg.done) {
          setSyncState((prev) => ({ ...prev, summary: msg }));
          setSyncing(false);
          if (hotRef.current) {
            const si = gridCols.current.indexOf("Sync Status");
            if (si >= 0) {
              Object.entries(syncResults.current).forEach(([ri, st]) => {
                hotRef.current.setDataAtCell(
                  parseInt(ri),
                  si,
                  st,
                  "syncUpdate",
                );
              });
            }
          }
          gridChanges.current.clear();
          importedRows.current.clear();
          setChangedCount(0);
          ws.close();
        } else {
          const { row_index, status } = msg;
          syncResults.current[row_index] = status;
          setSyncState((prev) => ({
            ...prev,
            results: { ...(prev?.results || {}), [row_index]: status },
          }));
          hotRef.current?.render();
        }
      };
      ws.onerror = () => {
        toast?.("WebSocket error", "error");
        setSyncing(false);
      };
      ws.onclose = () => {
        if (syncing) setSyncing(false);
      };
    } catch (err) {
      toast?.(err.message || "Sync failed", "error");
      setSyncing(false);
    }
  }, [syncing, toast]);

  return (
    <div className="flex flex-col h-screen bg-primary font-mono">
      {/* Topbar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-secondary border-b border-strong flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-warning shadow-glow" />
          <span className="text-xs font-bold tracking-wider text-warning uppercase">
            PRODUCTS
          </span>
        </div>
        <div className="w-px h-6 bg-strong" />

        <button
          onClick={loadFromShopify}
          disabled={loading || !libsReady}
          className={`btn btn-sm ${!hasData ? "btn-primary" : "btn-secondary"}`}
        >
          {loading ? (
            <>
              <Spin size="xs" /> LOADING
            </>
          ) : (
            <>
              <Ico n="download" size="xs" /> {hasData ? "RELOAD" : "FETCH"}
            </>
          )}
        </button>

        <label
          className="btn btn-secondary btn-sm cursor-pointer"
          onMouseEnter={(e) =>
            (e.currentTarget.style.borderColor = "var(--accent)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.borderColor = "var(--border-strong)")
          }
        >
          <Ico n="upload" size="xs" /> IMPORT
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleImport}
            className="hidden"
          />
        </label>

        {importLabel && (
          <span
            className={`text-xs ${
              importLabel.startsWith("✓") ? "text-success" : "text-muted"
            }`}
          >
            {importLabel}
          </span>
        )}
        <div className="w-px h-6 bg-strong" />

        {hasData && (
          <>
            <button
              onClick={() => insertRow("product")}
              disabled={syncing}
              className="btn btn-secondary btn-sm"
            >
              <Ico n="plus" size="xs" /> New Product
            </button>
            {selectedRow !== null && (
              <>
                <button
                  onClick={() => insertRow("variant")}
                  disabled={syncing}
                  className="btn btn-secondary btn-sm"
                >
                  <Ico n="plus" size="xs" /> Variant #{selectedRow + 1}
                </button>
                {!rowsRef.current[selectedRow]?.["Variant ID"] && (
                  <button
                    onClick={removeRow}
                    disabled={syncing}
                    className="btn btn-danger btn-sm"
                  >
                    <Ico n="trash" size="xs" /> Remove
                  </button>
                )}
              </>
            )}
          </>
        )}

        <div className="flex-1" />
        {changedCount > 0 && (
          <span className="badge badge-warning text-xs">
            {changedCount} unsaved
          </span>
        )}
        {rowCount > 0 && (
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-primary">{rowCount}</span>
            <span className="text-xs text-muted tracking-wider">ROWS</span>
          </div>
        )}
        <div className="w-px h-6 bg-strong" />
        <button
          onClick={exportXlsx}
          disabled={!hasData}
          className="btn btn-secondary btn-sm"
        >
          <Ico n="download" size="xs" /> EXPORT
        </button>
        {hasData && (
          <button
            onClick={handleSync}
            disabled={syncing || loading}
            className="btn btn-primary btn-sm"
          >
            {syncing ? <Spin size="xs" /> : <Ico n="sync" size="xs" />}
            {syncing ? " SYNCING" : " SYNC"}
          </button>
        )}
      </div>

      <SyncProgressBar syncState={syncState} totalRows={rowCount} />

      {/* Grid Container */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        {loading && <LoadingOverlay step={loadStep} elapsed={elapsed} />}
        {!hasData && !loading && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <Ico n="grid" size={48} className="text-muted opacity-25" />
            <div className="text-muted">No data loaded</div>
            <div className="text-xs text-muted">
              Click FETCH to pull products from Shopify
            </div>
            <div className="flex gap-3 mt-2">
              <button
                onClick={loadFromShopify}
                disabled={!libsReady}
                className="btn btn-primary"
              >
                <Ico n="download" size="sm" /> FETCH
              </button>
              <label className="btn btn-secondary cursor-pointer">
                <Ico n="upload" size="sm" /> IMPORT .XLSX
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
        <div
          id="hot-export"
          ref={containerRef}
          className="w-full h-full"
          style={{ display: hasData ? "block" : "none" }}
        />
      </div>

      {/* Footer hints */}
      {hasData && (
        <div className="flex flex-wrap gap-4 px-4 py-1 bg-secondary border-t border-strong text-xs text-muted">
          <span>Ctrl+Z undo</span>
          <span>Ctrl+C/V copy-paste</span>
          <span>Right-click context menu</span>
          <span>▾ header to filter/sort</span>
          <span>Drag edges to resize</span>
          <span>Click row to select · + buttons add rows</span>
          <span>Set Delete=YES then SYNC to delete</span>
        </div>
      )}
    </div>
  );
};

export default ExportPage;
