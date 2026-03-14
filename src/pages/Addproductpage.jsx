import { useState, useRef, useEffect } from "react";
import { api } from "../api/api";
import { Spin } from "../components/Icons";

function useViewportWidth() {
  const [width, setWidth] = useState(() => window.innerWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return width;
}

// ── Shared style tokens matching existing app dark theme ──────────────────
const C = {
  bg: "#0A0A0A",
  surface: "#111111",
  card: "#1A1A1A",
  border: "#2A2A2A",
  borderFocus: "#3B82F6",
  text: "#FFFFFF",
  muted: "#A0A0A0",
  disabled: "#555555",
  accent: "#3B82F6",
  accentGrad: "linear-gradient(135deg,#3B82F6,#8B5CF6)",
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B",
};

// ── Reusable primitives ───────────────────────────────────────────────────
const Card = ({ children, style }) => (
  <div
    style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      marginBottom: 16,
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

const CardTitle = ({ children, right }) => (
  <div
    style={{
      padding: "14px 18px",
      borderBottom: `1px solid ${C.border}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontSize: 13,
      fontWeight: 600,
      color: C.text,
    }}
  >
    <span>{children}</span>
    {right}
  </div>
);

const CardBody = ({ children, style }) => (
  <div style={{ padding: "16px 18px", ...style }}>{children}</div>
);

const Field = ({ label, optional, children, help }) => (
  <div style={{ marginBottom: 14 }}>
    <label
      style={{
        display: "block",
        fontSize: 12,
        fontWeight: 500,
        color: C.muted,
        marginBottom: 5,
      }}
    >
      {label}
      {optional && (
        <span style={{ fontWeight: 400, color: C.disabled, marginLeft: 4 }}>
          (optional)
        </span>
      )}
    </label>
    {children}
    {help && (
      <div style={{ fontSize: 11, color: C.disabled, marginTop: 3 }}>
        {help}
      </div>
    )}
  </div>
);

const inputStyle = (focused) => ({
  width: "100%",
  padding: "8px 12px",
  background: "#0d0d0d",
  border: `1px solid ${focused ? C.borderFocus : C.border}`,
  borderRadius: 7,
  fontSize: 13,
  color: C.text,
  outline: "none",
  fontFamily: "inherit",
  boxShadow: focused ? `0 0 0 3px rgba(59,130,246,.12)` : "none",
  transition: "border-color .15s, box-shadow .15s",
});

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  style: s,
  prefix,
}) {
  const [focused, setFocused] = useState(false);
  if (prefix)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderRadius: 7,
          overflow: "hidden",
          border: `1px solid ${focused ? C.borderFocus : C.border}`,
          boxShadow: focused ? `0 0 0 3px rgba(59,130,246,.12)` : "none",
          transition: "border-color .15s, box-shadow .15s",
        }}
      >
        <span
          style={{
            padding: "8px 10px",
            background: "#0a0a0a",
            borderRight: `1px solid ${C.border}`,
            fontSize: 13,
            color: C.muted,
            whiteSpace: "nowrap",
          }}
        >
          {prefix}
        </span>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...inputStyle(false),
            border: "none",
            borderRadius: 0,
            boxShadow: "none",
            flex: 1,
            ...s,
          }}
        />
      </div>
    );
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...inputStyle(focused), ...s }}
    />
  );
}

function Textarea({ value, onChange, placeholder, minHeight = 120 }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputStyle(focused),
        resize: "vertical",
        minHeight,
        fontFamily: "inherit",
      }}
    />
  );
}

function Select({ value, onChange, options }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...inputStyle(focused),
          appearance: "none",
          paddingRight: 32,
          cursor: "pointer",
        }}
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
      <svg
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke={C.muted}
        strokeWidth="2"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}

function Btn({
  children,
  onClick,
  disabled,
  variant = "secondary",
  style: s,
  type = "button",
}) {
  const [hov, setHov] = useState(false);
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    borderRadius: 7,
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "inherit",
    cursor: disabled ? "not-allowed" : "pointer",
    border: "none",
    transition: "all .15s",
    opacity: disabled ? 0.5 : 1,
    ...s,
  };
  const variants = {
    primary: { background: hov ? "#2563eb" : C.accent, color: "#fff" },
    secondary: {
      background: hov ? "#222" : C.card,
      color: C.muted,
      border: `1px solid ${C.border}`,
    },
    danger: {
      background: hov ? "rgba(239,68,68,.15)" : "transparent",
      color: C.danger,
      border: `1px solid ${hov ? C.danger : C.border}`,
    },
    ghost: {
      background: "transparent",
      color: C.muted,
      border: "none",
      padding: "6px 10px",
    },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ ...base, ...variants[variant] }}
    >
      {children}
    </button>
  );
}

// ── Rich text toolbar ──────────────────────────────────────────────────────
function RichText({ valueRef }) {
  const [focused, setFocused] = useState(false);
  const fmt = (cmd) => {
    document.execCommand(cmd, false, null);
  };
  const tools = [
    { cmd: "bold", label: <b>B</b> },
    { cmd: "italic", label: <i>I</i> },
    { cmd: "underline", label: <u>U</u> },
    null,
    { cmd: "insertUnorderedList", label: "≡" },
    { cmd: "insertOrderedList", label: "⊟" },
    null,
    { cmd: "justifyLeft", label: "⬅" },
    { cmd: "justifyCenter", label: "↔" },
  ];
  return (
    <div
      style={{
        border: `1px solid ${focused ? C.borderFocus : C.border}`,
        borderRadius: 7,
        overflow: "hidden",
        boxShadow: focused ? `0 0 0 3px rgba(59,130,246,.12)` : "none",
        transition: "border-color .15s, box-shadow .15s",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 2,
          padding: 8,
          background: "#0d0d0d",
          borderBottom: `1px solid ${C.border}`,
          flexWrap: "wrap",
        }}
      >
        {tools.map((t, i) =>
          t === null ? (
            <div
              key={i}
              style={{ width: 1, background: C.border, margin: "2px 2px" }}
            />
          ) : (
            <button
              key={t.cmd}
              type="button"
              onClick={() => fmt(t.cmd)}
              style={{
                width: 28,
                height: 28,
                border: "none",
                background: "transparent",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 13,
                color: C.muted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = C.border;
                e.currentTarget.style.color = C.text;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = C.muted;
              }}
            >
              {t.label}
            </button>
          ),
        )}
      </div>
      <div
        ref={valueRef}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          padding: 12,
          minHeight: 140,
          outline: "none",
          fontSize: 13,
          color: C.text,
          background: "#0d0d0d",
          lineHeight: 1.6,
        }}
        data-placeholder="Describe your product..."
      />
    </div>
  );
}

// ── Media upload ───────────────────────────────────────────────────────────
function MediaUpload({ files, setFiles }) {
  const [drag, setDrag] = useState(false);

  function addFiles(fileList) {
    Array.from(fileList).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) =>
        setFiles((prev) => [...prev, { file, url: e.target.result }]);
      reader.readAsDataURL(file);
    });
  }

  return (
    <>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => document.getElementById("_mediaInput").click()}
        style={{
          border: `2px dashed ${drag ? C.accent : files.length ? C.success : C.border}`,
          borderRadius: 8,
          padding: "36px 20px",
          textAlign: "center",
          cursor: "pointer",
          background: drag
            ? "rgba(59,130,246,.05)"
            : files.length
              ? "rgba(16,185,129,.04)"
              : "transparent",
          transition: "all .2s",
        }}
      >
        <input
          id="_mediaInput"
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => addFiles(e.target.files)}
        />
        <div style={{ fontSize: 28, marginBottom: 8 }}>🖼️</div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: files.length ? C.success : C.text,
            marginBottom: 3,
          }}
        >
          {files.length
            ? `${files.length} image${files.length > 1 ? "s" : ""} selected`
            : "Drop images here or click to browse"}
        </div>
        <div style={{ fontSize: 12, color: C.muted }}>
          Supports .jpg, .png, .webp up to 20MB
        </div>
      </div>
      {files.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
            gap: 8,
            marginTop: 12,
          }}
        >
          {files.map((f, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                aspectRatio: "1",
                borderRadius: 7,
                overflow: "hidden",
                border: `1px solid ${C.border}`,
              }}
            >
              <img
                src={f.url}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              {i === 0 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 3,
                    left: 3,
                    background: "rgba(0,0,0,.7)",
                    color: "#fff",
                    fontSize: 9,
                    padding: "2px 5px",
                    borderRadius: 3,
                    fontWeight: 600,
                  }}
                >
                  Main
                </div>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFiles((p) => p.filter((_, j) => j !== i));
                }}
                style={{
                  position: "absolute",
                  top: 3,
                  right: 3,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,.65)",
                  border: "none",
                  color: "#fff",
                  fontSize: 10,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ── Tags input ─────────────────────────────────────────────────────────────
function TagInput({ tags, setTags }) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);

  function addTag(val) {
    const t = val.replace(/,/g, "").trim();
    if (t && !tags.includes(t)) setTags((p) => [...p, t]);
    setInput("");
  }

  function onKey(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length)
      setTags((p) => p.slice(0, -1));
  }

  return (
    <div
      onClick={() => document.getElementById("_tagInput").focus()}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        alignItems: "center",
        border: `1px solid ${focused ? C.borderFocus : C.border}`,
        borderRadius: 7,
        padding: "6px 8px",
        minHeight: 40,
        cursor: "text",
        background: "#0d0d0d",
        boxShadow: focused ? `0 0 0 3px rgba(59,130,246,.12)` : "none",
        transition: "border-color .15s, box-shadow .15s",
      }}
    >
      {tags.map((tag, i) => (
        <div
          key={i}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            background: "#2a2a2a",
            borderRadius: 4,
            padding: "2px 8px",
            fontSize: 12,
            color: C.text,
          }}
        >
          {tag}
          <button
            type="button"
            onClick={() => setTags((p) => p.filter((_, j) => j !== i))}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: C.muted,
              fontSize: 13,
              lineHeight: 1,
              padding: 0,
              display: "flex",
            }}
          >
            ×
          </button>
        </div>
      ))}
      <input
        id="_tagInput"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKey}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          if (input.trim()) addTag(input);
        }}
        placeholder={tags.length ? "" : "Vintage, cotton, summer"}
        style={{
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: 13,
          color: C.text,
          minWidth: 100,
          flex: 1,
          padding: "2px 0",
          fontFamily: "inherit",
        }}
      />
    </div>
  );
}

// ── Variants ───────────────────────────────────────────────────────────────
function VariantRow({ v, onChange, onRemove, isOnly, compact }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: compact ? "1fr" : "1fr 110px 110px 36px",
        gap: 8,
        alignItems: "center",
        padding: "10px 0",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <Input
        value={v.name}
        onChange={(e) => onChange("name", e.target.value)}
        placeholder="e.g. Small / Black"
      />
      <Input
        value={v.price}
        onChange={(e) => onChange("price", e.target.value)}
        placeholder="0.00"
        type="number"
        prefix="$"
      />
      <Input
        value={v.sku}
        onChange={(e) => onChange("sku", e.target.value)}
        placeholder="SKU"
      />
      <button
        type="button"
        onClick={onRemove}
        disabled={isOnly}
        style={{
          width: compact ? "100%" : 32,
          height: 32,
          border: `1px solid ${C.border}`,
          background: "transparent",
          borderRadius: 6,
          cursor: isOnly ? "not-allowed" : "pointer",
          color: C.muted,
          fontSize: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: isOnly ? 0.3 : 1,
          transition: "all .15s",
        }}
        onMouseEnter={(e) => {
          if (!isOnly) {
            e.currentTarget.style.background = "rgba(239,68,68,.1)";
            e.currentTarget.style.borderColor = C.danger;
            e.currentTarget.style.color = C.danger;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.borderColor = C.border;
          e.currentTarget.style.color = C.muted;
        }}
      >
        ×
      </button>
    </div>
  );
}

// ── SEO preview ────────────────────────────────────────────────────────────
function SeoSection({ title }) {
  const [open, setOpen] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [seoHandle, setSeoHandle] = useState("");

  useEffect(() => {
    if (!seoHandle) {
      setSeoHandle(
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      );
    }
  }, [title]);

  const previewTitle =
    seoTitle || "Add a title to see how this listing appears in search";
  const previewDesc =
    seoDesc || "Add a description to see how this listing appears in search";
  const previewHandle = seoHandle || "product-url-handle";

  return (
    <Card>
      <CardTitle
        right={
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            style={{
              background: "transparent",
              border: "none",
              color: C.accent,
              fontSize: 12,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {open ? "Collapse" : "Edit"}
          </button>
        }
      >
        Search engine listing
      </CardTitle>
      <CardBody>
        <div style={{ padding: "4px 0 8px" }}>
          <div
            style={{
              fontSize: 16,
              color: "#5b9cf6",
              marginBottom: 2,
              wordBreak: "break-word",
            }}
          >
            {previewTitle}
          </div>
          <div style={{ fontSize: 12, color: "#4ade80", marginBottom: 4 }}>
            your-store.myshopify.com/products/{previewHandle}
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>{previewDesc}</div>
        </div>
        {open && (
          <>
            <div
              style={{ borderTop: `1px solid ${C.border}`, margin: "12px 0" }}
            />
            <Field
              label="Page title"
              help={`${seoTitle.length} of 70 characters used`}
            >
              <Input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="e.g. Classic T-Shirt – Your Store"
              />
            </Field>
            <Field
              label="Meta description"
              optional
              help={`${seoDesc.length} of 320 characters used`}
            >
              <Textarea
                value={seoDesc}
                onChange={(e) => setSeoDesc(e.target.value)}
                placeholder="Describe your page for search engines..."
                minHeight={80}
              />
            </Field>
            <Field label="URL handle">
              <Input
                value={seoHandle}
                onChange={(e) => setSeoHandle(e.target.value)}
                placeholder="product-url-handle"
                prefix="your-store.myshopify.com/products/"
              />
            </Field>
          </>
        )}
      </CardBody>
    </Card>
  );
}

// ── Status dot ─────────────────────────────────────────────────────────────
function StatusDot({ status }) {
  const colors = { active: C.success, draft: C.muted, archived: C.danger };
  const labels = { active: "Active", draft: "Draft", archived: "Archived" };
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        fontSize: 13,
        fontWeight: 500,
        color: colors[status] || C.muted,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: colors[status] || C.muted,
          display: "inline-block",
        }}
      />
      {labels[status] || status}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
let _varId = 0;
function newVariant(name = "", price = "", sku = "", extra = {}) {
  return { _id: ++_varId, name, price, sku, ...extra };
}

export default function AddProductPage({ toast, onBack, editProduct }) {
  const isEdit = !!editProduct;
  const viewportWidth = useViewportWidth();
  const isTabletOrBelow = viewportWidth <= 1024;
  const isPhone = viewportWidth <= 640;

  // Form state
  const [title, setTitle] = useState(editProduct?.title || "");
  const [vendor, setVendor] = useState(editProduct?.vendor || "");
  const [productType, setProductType] = useState(
    editProduct?.product_type || "",
  );
  const [price, setPrice] = useState(editProduct?.variants?.[0]?.price || "");
  const [comparePrice, setComparePrice] = useState(
    editProduct?.variants?.[0]?.compare_at_price || "",
  );
  const [costPerItem, setCostPerItem] = useState(
    editProduct?.variants?.[0]?.cost || "",
  );
  const [sku, setSku] = useState(editProduct?.variants?.[0]?.sku || "");
  const [barcode, setBarcode] = useState(
    editProduct?.variants?.[0]?.barcode || "",
  );
  const [status, setStatus] = useState(editProduct?.status || "draft");
  const [trackQty, setTrackQty] = useState(
    Boolean(editProduct?.variants?.[0]?.inventory_management),
  );
  const [qty, setQty] = useState(
    String(editProduct?.variants?.[0]?.inventory_quantity ?? "0"),
  );
  const [isPhysical, setIsPhysical] = useState(true);
  const [weight, setWeight] = useState("");
  const [tags, setTags] = useState(() => {
    const raw = editProduct?.tags;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    return raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [variants, setVariants] = useState(() => {
    const existing = editProduct?.variants || [];
    if (!existing.length) return [newVariant()];
    return existing.map((v) =>
      newVariant(v.option1 || v.title || "", v.price || "", v.sku || "", {
        id: v.id,
        compare_at_price: v.compare_at_price || "",
        barcode: v.barcode || "",
        inventory_quantity: v.inventory_quantity,
      }),
    );
  });
  const [saving, setSaving] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const descRef = useRef(null);

  useEffect(() => {
    if (!isEdit || !editProduct?.id) {
      if (descRef.current) descRef.current.innerHTML = "";
      return;
    }

    let mounted = true;
    const loadFullProduct = async () => {
      setLoadingDetails(true);
      try {
        const res = await api.get(`/products/${editProduct.id}`);
        const p = res?.product || res;
        if (!mounted || !p) return;

        setTitle(p.title || "");
        setVendor(p.vendor || "");
        setProductType(p.product_type || "");
        setStatus(p.status || "draft");

        const productVariants = p.variants || [];
        const first = productVariants[0] || {};
        setPrice(first.price || "");
        setComparePrice(first.compare_at_price || "");
        setCostPerItem(first.cost || "");
        setSku(first.sku || "");
        setBarcode(first.barcode || "");
        setTrackQty(Boolean(first.inventory_management));
        setQty(String(first.inventory_quantity ?? "0"));

        const parsedTags = Array.isArray(p.tags)
          ? p.tags
          : String(p.tags || "")
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean);
        setTags(parsedTags);

        if (productVariants.length) {
          setVariants(
            productVariants.map((v) =>
              newVariant(
                v.option1 || v.title || "",
                v.price || "",
                v.sku || "",
                {
                  id: v.id,
                  compare_at_price: v.compare_at_price || "",
                  barcode: v.barcode || "",
                  inventory_quantity: v.inventory_quantity,
                },
              ),
            ),
          );
        }

        setMediaFiles(
          (p.images || []).map((img) => ({
            file: null,
            url: img.src,
            existing: true,
          })),
        );

        if (descRef.current) {
          descRef.current.innerHTML = p.body_html || "";
        }
      } catch {
        toast("Could not load full product details", "error");
      } finally {
        if (mounted) setLoadingDetails(false);
      }
    };

    loadFullProduct();

    return () => {
      mounted = false;
    };
  }, [isEdit, editProduct?.id, toast]);

  // Margin calc
  const margin = (() => {
    const p = parseFloat(price),
      c = parseFloat(costPerItem);
    if (p > 0 && c > 0) return (((p - c) / p) * 100).toFixed(1) + "%";
    return "—";
  })();

  function updateVariant(id, field, val) {
    setVariants((prev) =>
      prev.map((v) => (v._id === id ? { ...v, [field]: val } : v)),
    );
  }

  async function handleSave() {
    if (!title.trim()) {
      toast("Title is required", "error");
      return;
    }
    setSaving(true);
    try {
      const descHtml = descRef.current?.innerHTML || "";
      const payload = {
        title: title.trim(),
        body_html: descHtml,
        vendor: vendor.trim(),
        product_type: productType.trim(),
        status,
        tags: tags.join(", "),
        published: status === "active",
        variants: variants
          .filter((v) => v.name || variants.length === 1)
          .map((v, idx) => {
            const variantPayload = {
              option1: v.name || "Default Title",
              price: v.price || price || "0.00",
              sku: v.sku || (idx === 0 ? sku : ""),
              compare_at_price:
                v.compare_at_price || (idx === 0 ? comparePrice : "") || null,
              barcode: v.barcode || (idx === 0 ? barcode : "") || null,
            };

            if (trackQty) {
              variantPayload.inventory_management = "shopify";
              if (idx === 0 && qty !== "") {
                variantPayload.inventory_quantity = Number(qty);
              }
            }

            if (isEdit && v.id) {
              variantPayload.id = v.id;
            }

            return variantPayload;
          }),
        images: mediaFiles.map((f) => ({
          ...(f.existing
            ? { src: f.url }
            : {
                attachment: f.url.split(",")[1],
                filename: f.file?.name,
              }),
        })),
      };
      if (isEdit) {
        await api.put(`/products/${editProduct.id}`, payload);
        toast("Product updated!");
      } else {
        await api.post("/products", payload);
        toast("Product created!");
      }
      onBack();
    } catch {
      toast("Failed to save product", "error");
    }
    setSaving(false);
  }

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: isPhone ? "0 14px 120px" : "0 24px 120px",
        fontFamily: "inherit",
      }}
    >
      {/* Breadcrumb */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexWrap: "wrap",
          fontSize: 12,
          color: C.muted,
          marginBottom: 14,
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: C.muted,
            cursor: "pointer",
            fontSize: 12,
            padding: 0,
            fontFamily: "inherit",
          }}
        >
          Products
        </button>
        <span style={{ color: C.disabled }}>›</span>
        <span style={{ color: C.text }}>
          {isEdit ? "Edit product" : "Add product"}
        </span>
      </div>

      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: isPhone ? "flex-start" : "center",
          justifyContent: "space-between",
          marginBottom: 20,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>
          {isEdit ? "Edit product" : "Add product"}
        </h1>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            width: isPhone ? "100%" : "auto",
          }}
        >
          <Btn onClick={onBack} variant="secondary">
            Discard
          </Btn>
          {isEdit && <Btn variant="danger">🗑 Delete</Btn>}
          <Btn
            onClick={handleSave}
            disabled={saving || loadingDetails}
            variant="primary"
          >
            {saving ? (
              <>
                <Spin size={14} /> Saving…
              </>
            ) : loadingDetails ? (
              <>
                <Spin size={14} /> Loading…
              </>
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Save"
            )}
          </Btn>
        </div>
      </div>

      {/* Two-column grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isTabletOrBelow ? "1fr" : "1fr 270px",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* ── LEFT ── */}
        <div>
          {/* Title & Description */}
          <Card>
            <CardBody>
              <Field label="Title">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Short sleeve t-shirt"
                />
              </Field>
              <Field label="Description" optional style={{ marginBottom: 0 }}>
                <RichText valueRef={descRef} />
              </Field>
            </CardBody>
          </Card>

          {/* Media */}
          <Card>
            <CardTitle>Media</CardTitle>
            <CardBody>
              <MediaUpload files={mediaFiles} setFiles={setMediaFiles} />
            </CardBody>
          </Card>

          {/* Pricing */}
          <Card>
            <CardTitle>Pricing</CardTitle>
            <CardBody>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isPhone ? "1fr" : "1fr 1fr",
                  gap: 12,
                }}
              >
                <Field label="Price">
                  <Input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    type="number"
                    prefix="$"
                  />
                </Field>
                <Field label="Compare-at price" optional>
                  <Input
                    value={comparePrice}
                    onChange={(e) => setComparePrice(e.target.value)}
                    placeholder="0.00"
                    type="number"
                    prefix="$"
                  />
                </Field>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "10px 0",
                  borderTop: `1px solid ${C.border}`,
                  marginTop: 4,
                }}
              >
                <input
                  type="checkbox"
                  id="_chargeTax"
                  defaultChecked
                  style={{ accentColor: C.accent, width: 14, height: 14 }}
                />
                <label
                  htmlFor="_chargeTax"
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: C.text,
                    cursor: "pointer",
                  }}
                >
                  Charge tax on this product
                </label>
              </div>
              <div
                style={{
                  borderTop: `1px solid ${C.border}`,
                  margin: "8px 0 14px",
                }}
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isPhone ? "1fr" : "1fr 1fr",
                  gap: 12,
                }}
              >
                <Field label="Cost per item" optional>
                  <Input
                    value={costPerItem}
                    onChange={(e) => setCostPerItem(e.target.value)}
                    placeholder="0.00"
                    type="number"
                    prefix="$"
                  />
                </Field>
                <Field label="Margin">
                  <div
                    style={{
                      padding: "8px 12px",
                      background: "#0d0d0d",
                      border: `1px solid ${C.border}`,
                      borderRadius: 7,
                      fontSize: 13,
                      color:
                        costPerItem && price
                          ? parseFloat(margin) >= 0
                            ? C.success
                            : C.danger
                          : C.disabled,
                    }}
                  >
                    {margin}
                  </div>
                </Field>
              </div>
            </CardBody>
          </Card>

          {/* Inventory */}
          <Card>
            <CardTitle>Inventory</CardTitle>
            <CardBody>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isPhone ? "1fr" : "1fr 1fr",
                  gap: 12,
                }}
              >
                <Field label="SKU" optional>
                  <Input
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. TSHIRT-BLK-S"
                  />
                </Field>
                <Field label="Barcode" optional>
                  <Input
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="ISBN, UPC, GTIN"
                  />
                </Field>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 9,
                  paddingTop: 8,
                }}
              >
                <input
                  type="checkbox"
                  id="_trackQty"
                  checked={trackQty}
                  onChange={(e) => setTrackQty(e.target.checked)}
                  style={{
                    accentColor: C.accent,
                    width: 14,
                    height: 14,
                    marginTop: 2,
                  }}
                />
                <label htmlFor="_trackQty" style={{ cursor: "pointer" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>
                    Track quantity
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>
                    Shopify tracks this product's inventory
                  </div>
                </label>
              </div>
              {trackQty && (
                <>
                  <div
                    style={{
                      borderTop: `1px solid ${C.border}`,
                      margin: "12px 0",
                    }}
                  />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isPhone ? "1fr" : "1fr 100px",
                      gap: 12,
                      alignItems: "end",
                    }}
                  >
                    <Field label="Location">
                      <input
                        value="Default location"
                        readOnly
                        style={{
                          ...inputStyle(false),
                          background: "#0a0a0a",
                          color: C.disabled,
                        }}
                      />
                    </Field>
                    <Field label="Available">
                      <Input
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                        type="number"
                      />
                    </Field>
                  </div>
                </>
              )}
            </CardBody>
          </Card>

          {/* Shipping */}
          <Card>
            <CardTitle>Shipping</CardTitle>
            <CardBody>
              <div
                style={{ display: "flex", alignItems: "flex-start", gap: 9 }}
              >
                <input
                  type="checkbox"
                  id="_isPhysical"
                  checked={isPhysical}
                  onChange={(e) => setIsPhysical(e.target.checked)}
                  style={{
                    accentColor: C.accent,
                    width: 14,
                    height: 14,
                    marginTop: 2,
                  }}
                />
                <label htmlFor="_isPhysical" style={{ cursor: "pointer" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>
                    This is a physical product
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>
                    Customers will provide a shipping address at checkout
                  </div>
                </label>
              </div>
              {isPhysical && (
                <>
                  <div
                    style={{
                      borderTop: `1px solid ${C.border}`,
                      margin: "12px 0",
                    }}
                  />
                  <Field label="Weight" optional style={{ marginBottom: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        border: `1px solid ${C.border}`,
                        borderRadius: 7,
                        overflow: "hidden",
                      }}
                    >
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="0.0"
                        style={{
                          ...inputStyle(false),
                          border: "none",
                          borderRadius: 0,
                          flex: 1,
                          boxShadow: "none",
                        }}
                      />
                      <span
                        style={{
                          padding: "8px 12px",
                          background: "#0a0a0a",
                          borderLeft: `1px solid ${C.border}`,
                          fontSize: 13,
                          color: C.muted,
                        }}
                      >
                        kg
                      </span>
                    </div>
                  </Field>
                </>
              )}
            </CardBody>
          </Card>

          {/* Variants */}
          <Card>
            <CardTitle
              right={
                <Btn
                  onClick={() => setVariants((p) => [...p, newVariant()])}
                  variant="ghost"
                  style={{ fontSize: 12, padding: "4px 8px" }}
                >
                  + Add variant
                </Btn>
              }
            >
              Variants
            </CardTitle>
            <CardBody>
              <p style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>
                Add variants like size or color if this product comes in
                multiple options.
              </p>
              {/* Header row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isPhone ? "1fr" : "1fr 110px 110px 36px",
                  gap: 8,
                  paddingBottom: 8,
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                {["Option name", "Price", "SKU", ""].map((h) => (
                  <span
                    key={h}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: C.disabled,
                      textTransform: "uppercase",
                      letterSpacing: ".04em",
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>
              {variants.map((v) => (
                <VariantRow
                  key={v._id}
                  v={v}
                  compact={isPhone}
                  onChange={(f, val) => updateVariant(v._id, f, val)}
                  onRemove={() =>
                    setVariants((p) => p.filter((x) => x._id !== v._id))
                  }
                  isOnly={variants.length === 1}
                />
              ))}
            </CardBody>
          </Card>

          {/* SEO */}
          <SeoSection title={title} />
        </div>

        {/* ── RIGHT ── */}
        <div>
          {/* Status */}
          <Card>
            <CardTitle>Status</CardTitle>
            <CardBody>
              <Field style={{ marginBottom: 10 }}>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { v: "active", l: "Active" },
                    { v: "draft", l: "Draft" },
                    { v: "archived", l: "Archived" },
                  ]}
                />
              </Field>
              <StatusDot status={status} />
              <p style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>
                {status === "active"
                  ? "This product is visible on all sales channels."
                  : "This product will be hidden from all sales channels."}
              </p>
            </CardBody>
          </Card>

          {/* Publishing */}
          <Card>
            <CardTitle>Publishing</CardTitle>
            <CardBody style={{ paddingTop: 8 }}>
              {[
                { icon: "🛍️", name: "Online Store", note: "Not published" },
                { icon: "📱", name: "Point of Sale", note: "Not published" },
              ].map((ch) => (
                <div
                  key={ch.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 9 }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: "#222",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                      }}
                    >
                      {ch.icon}
                    </div>
                    <div>
                      <div
                        style={{ fontSize: 13, fontWeight: 500, color: C.text }}
                      >
                        {ch.name}
                      </div>
                      <div style={{ fontSize: 11, color: C.muted }}>
                        {ch.note}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Organization */}
          <Card>
            <CardTitle>Product organization</CardTitle>
            <CardBody>
              <Field label="Product type" optional>
                <Input
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  placeholder="e.g. Apparel"
                />
              </Field>
              <Field label="Vendor" optional>
                <Input
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  placeholder="e.g. Nike"
                />
              </Field>
              <Field label="Collections" optional>
                <Input placeholder="Search or create collections" />
              </Field>
              <Field
                label="Tags"
                optional
                help="Press Enter to add a tag"
                style={{ marginBottom: 0 }}
              >
                <TagInput tags={tags} setTags={setTags} />
              </Field>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Sticky save bar */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: isTabletOrBelow ? 0 : 220,
          right: 0,
          background: "#0d0d0d",
          borderTop: `1px solid ${C.border}`,
          padding: isPhone ? "10px 12px" : "12px 24px",
          display: "flex",
          alignItems: isPhone ? "stretch" : "center",
          flexDirection: isPhone ? "column" : "row",
          justifyContent: "space-between",
          gap: isPhone ? 8 : 0,
          zIndex: 200,
        }}
      >
        <span style={{ fontSize: 13, color: C.muted }}>
          {saving ? "Saving…" : isEdit ? "Unsaved changes" : "Unsaved product"}
        </span>
        <div
          style={{ display: "flex", gap: 8, width: isPhone ? "100%" : "auto" }}
        >
          <Btn onClick={onBack} variant="secondary">
            Discard
          </Btn>
          <Btn
            onClick={handleSave}
            disabled={saving || loadingDetails}
            variant="primary"
            style={isPhone ? { flex: 1, justifyContent: "center" } : {}}
          >
            {saving ? (
              <>
                <Spin size={14} /> Saving…
              </>
            ) : loadingDetails ? (
              <>
                <Spin size={14} /> Loading…
              </>
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Save"
            )}
          </Btn>
        </div>
      </div>
    </div>
  );
}
