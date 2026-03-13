import { useState, useRef, useEffect } from "react";
import { api } from "../api/api";
import { Spin } from "../components/Icons";

// ── Design tokens ─────────────────────────────────────────────────────────
const C = {
  card: "#1A1A1A",
  border: "#2A2A2A",
  borderFocus: "#3B82F6",
  text: "#FFFFFF",
  muted: "#A0A0A0",
  disabled: "#555555",
  accent: "#3B82F6",
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B",
};

// ── Primitives ────────────────────────────────────────────────────────────
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

const Field = ({ label, optional, children, help, style: s }) => (
  <div style={{ marginBottom: 14, ...s }}>
    {label && (
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
    )}
    {children}
    {help && (
      <div style={{ fontSize: 11, color: C.disabled, marginTop: 3 }}>
        {help}
      </div>
    )}
  </div>
);

function useInputStyle(focused) {
  return {
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
  };
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  prefix,
  readOnly,
  style: s,
}) {
  const [focused, setFocused] = useState(false);
  const base = useInputStyle(focused);
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
            fontSize: 12,
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
            ...base,
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
      readOnly={readOnly}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...base,
        ...(readOnly
          ? { background: "#0a0a0a", color: C.disabled, cursor: "default" }
          : {}),
        ...s,
      }}
    />
  );
}

function Textarea({ value, onChange, placeholder, minHeight = 80 }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...useInputStyle(focused),
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
          ...useInputStyle(focused),
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

function Btn({ children, onClick, disabled, variant = "secondary", style: s }) {
  const [hov, setHov] = useState(false);
  const variants = {
    primary: {
      background: hov ? "#2563eb" : C.accent,
      color: "#fff",
      border: "none",
    },
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
      padding: "4px 10px",
    },
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 16px",
        borderRadius: 7,
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "inherit",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all .15s",
        opacity: disabled ? 0.5 : 1,
        ...variants[variant],
        ...s,
      }}
    >
      {children}
    </button>
  );
}

// ── Rich text ─────────────────────────────────────────────────────────────
function RichText({ valueRef, initialHtml }) {
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (valueRef.current && initialHtml) {
      valueRef.current.innerHTML = initialHtml;
    }
  }, [initialHtml]);

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
              onClick={() => {
                document.execCommand(t.cmd, false, null);
                valueRef.current?.focus();
              }}
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
        data-placeholder="Describe this collection..."
      />
    </div>
  );
}

// ── Image upload card ──────────────────────────────────────────────────────
function CollectionImageCard({ imageUrl, imageFile, onFileChange, onRemove }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);

  function handleFiles(files) {
    const file = files[0];
    if (!file || !file.type.startsWith("image/")) return;
    onFileChange(file);
  }

  const previewSrc = imageFile
    ? URL.createObjectURL(imageFile)
    : imageUrl || null;

  return (
    <Card>
      <CardTitle>Collection image</CardTitle>
      <CardBody>
        {previewSrc ? (
          <>
            <img
              src={previewSrc}
              alt="Collection"
              style={{
                width: "100%",
                aspectRatio: "1",
                objectFit: "cover",
                borderRadius: 7,
                border: `1px solid ${C.border}`,
                display: "block",
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <Btn
                onClick={() => inputRef.current?.click()}
                variant="secondary"
                style={{ fontSize: 12, padding: "5px 12px" }}
              >
                Replace
              </Btn>
              <Btn
                onClick={onRemove}
                variant="danger"
                style={{ fontSize: 12, padding: "5px 12px" }}
              >
                Remove
              </Btn>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${drag ? C.accent : C.border}`,
              borderRadius: 8,
              padding: "32px 20px",
              textAlign: "center",
              cursor: "pointer",
              background: drag ? "rgba(59,130,246,.05)" : "transparent",
              transition: "all .2s",
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div style={{ fontSize: 24, marginBottom: 8 }}>🖼</div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: C.text,
                marginBottom: 3,
              }}
            >
              Add image
            </div>
            <div style={{ fontSize: 12, color: C.muted }}>
              Upload or drag and drop
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// ── Status dot ─────────────────────────────────────────────────────────────
function StatusDot({ status }) {
  const map = { active: C.success, draft: C.muted, archived: C.danger };
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        fontSize: 13,
        fontWeight: 500,
        color: map[status] || C.muted,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: map[status] || C.muted,
          display: "inline-block",
        }}
      />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  );
}

// ── Smart conditions ───────────────────────────────────────────────────────
const COND_FIELDS = [
  { value: "title", label: "Product title" },
  { value: "type", label: "Product type" },
  { value: "vendor", label: "Product vendor" },
  { value: "variant_price", label: "Price" },
  { value: "tag", label: "Product tag" },
  { value: "variant_weight", label: "Weight" },
  { value: "variant_inventory", label: "Inventory stock" },
];
const NUMERIC_FIELDS = new Set([
  "variant_price",
  "variant_weight",
  "variant_inventory",
]);
const TEXT_OPS = [
  { v: "equals", l: "is equal to" },
  { v: "not_equals", l: "is not equal to" },
  { v: "starts_with", l: "starts with" },
  { v: "ends_with", l: "ends with" },
  { v: "contains", l: "contains" },
  { v: "not_contains", l: "does not contain" },
];
const NUM_OPS = [
  { v: "greater_than", l: "is greater than" },
  { v: "less_than", l: "is less than" },
  { v: "equals", l: "is equal to" },
  { v: "not_equals", l: "is not equal to" },
];

let _condId = 0;
const newCond = () => ({
  _id: ++_condId,
  field: "title",
  operator: "equals",
  value: "",
});

function ConditionRow({ cond, onChange, onRemove, isOnly }) {
  const isNum = NUMERIC_FIELDS.has(cond.field);
  const ops = isNum ? NUM_OPS : TEXT_OPS;
  const [focused, setFocused] = useState(false);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 36px",
        gap: 8,
        alignItems: "center",
        marginBottom: 10,
      }}
    >
      {/* Field */}
      <div style={{ position: "relative" }}>
        <select
          value={cond.field}
          onChange={(e) => onChange("field", e.target.value)}
          style={{
            ...useInputStyle(false),
            appearance: "none",
            paddingRight: 28,
            cursor: "pointer",
          }}
        >
          {COND_FIELDS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <svg
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke={C.muted}
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {/* Operator */}
      <div style={{ position: "relative" }}>
        <select
          value={cond.operator}
          onChange={(e) => onChange("operator", e.target.value)}
          style={{
            ...useInputStyle(false),
            appearance: "none",
            paddingRight: 28,
            cursor: "pointer",
          }}
        >
          {ops.map((o) => (
            <option key={o.v} value={o.v}>
              {o.l}
            </option>
          ))}
        </select>
        <svg
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke={C.muted}
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {/* Value */}
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
        {cond.field === "variant_price" && (
          <span
            style={{
              padding: "8px 8px",
              background: "#0a0a0a",
              borderRight: `1px solid ${C.border}`,
              fontSize: 12,
              color: C.muted,
            }}
          >
            $
          </span>
        )}
        <input
          type={isNum ? "number" : "text"}
          value={cond.value}
          onChange={(e) => onChange("value", e.target.value)}
          placeholder={isNum ? "0.00" : "Enter value"}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            padding: "8px 12px",
            background: "#0d0d0d",
            border: "none",
            outline: "none",
            fontSize: 13,
            color: C.text,
            fontFamily: "inherit",
            minWidth: 0,
          }}
        />
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        disabled={isOnly}
        style={{
          width: 36,
          height: 36,
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

// ── SEO section ────────────────────────────────────────────────────────────
function SeoSection({ collectionTitle, handle }) {
  const [open, setOpen] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [seoHandle, setSeoHandle] = useState("");

  useEffect(() => {
    if (!seoHandle && handle) setSeoHandle(handle);
  }, [handle]);

  useEffect(() => {
    if (!seoHandle && collectionTitle) {
      setSeoHandle(
        collectionTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      );
    }
  }, [collectionTitle]);

  const previewTitle = seoTitle || collectionTitle || "Collection title";
  const previewDesc =
    seoDesc ||
    "Add a description to see how this collection appears in search results.";
  const previewHandle = seoHandle || "collection-handle";

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
        <div style={{ padding: "4px 0 10px" }}>
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
            your-store.myshopify.com/collections/{previewHandle}
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
                placeholder="e.g. Summer Collection – Your Store"
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
                placeholder="Describe this collection for search engines..."
                minHeight={80}
              />
            </Field>
            <Field label="URL handle" style={{ marginBottom: 0 }}>
              <Input
                value={seoHandle}
                onChange={(e) => setSeoHandle(e.target.value)}
                placeholder="collection-handle"
                prefix="/collections/"
              />
            </Field>
          </>
        )}
      </CardBody>
    </Card>
  );
}

// ── Products in collection (read-only list) ────────────────────────────────
function ProductsList({ products }) {
  if (!products || products.length === 0) {
    return (
      <div
        style={{
          fontSize: 13,
          color: C.muted,
          fontStyle: "italic",
          padding: "8px 0",
        }}
      >
        No products in this collection.
      </div>
    );
  }
  return products.map((p, i) => (
    <div
      key={p.id || i}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
        borderBottom:
          i < products.length - 1 ? `1px solid ${C.border}` : "none",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 6,
          border: `1px solid ${C.border}`,
          overflow: "hidden",
          flexShrink: 0,
          background: "#0d0d0d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {p.image ? (
          <img
            src={p.image}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: 16 }}>📦</span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: C.text,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {p.title}
        </div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
          {(p.status || "draft").charAt(0).toUpperCase() +
            (p.status || "draft").slice(1)}
        </div>
      </div>
    </div>
  ));
}

// ── Main AddCollectionPage ─────────────────────────────────────────────────
export default function AddCollectionPage({ toast, onBack, editCollection }) {
  const isEdit = !!editCollection;

  const [title, setTitle] = useState(editCollection?.title || "");
  const [status, setStatus] = useState(
    editCollection?.published_at ? "active" : "draft",
  );
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(editCollection?.image?.src || "");
  const [removeImg, setRemoveImg] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [conditions, setConditions] = useState([newCond()]);
  const [matchType, setMatchType] = useState("all");
  const [products, setProducts] = useState([]);
  const descRef = useRef(null);

  const isSmartEdit = editCollection?.collection_type === "smart";

  // Load products for existing collection
  useEffect(() => {
    if (isEdit && editCollection?.id) {
      api
        .get(`/collections/${editCollection.id}`)
        .then((d) => {
          if (d.products) setProducts(d.products);
          if (d.rules?.length) {
            setConditions(
              d.rules.map((r) => ({
                _id: ++_condId,
                field: r.column,
                operator: r.relation,
                value: r.condition,
              })),
            );
            setMatchType(d.disjunctive ? "any" : "all");
          }
        })
        .catch(() => {});
    }
  }, []);

  function updateCond(id, field, val) {
    setConditions((prev) =>
      prev.map((c) => {
        if (c._id !== id) return c;
        // Reset operator if field type changes
        const wasNum = NUMERIC_FIELDS.has(c.field);
        const isNum = NUMERIC_FIELDS.has(field === "field" ? val : c.field);
        if (field === "field" && wasNum !== isNum) {
          return {
            ...c,
            field: val,
            operator: (isNum ? NUM_OPS : TEXT_OPS)[0].v,
            value: "",
          };
        }
        return { ...c, [field]: val };
      }),
    );
  }

  async function handleSave() {
    if (!title.trim()) {
      toast("Title is required", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        body_html: descRef.current?.innerHTML || "",
      };

      // Image
      if (imageFile) {
        const b64 = await new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const r = String(e.target.result || "");
            const idx = r.indexOf(",");
            res(idx >= 0 ? r.slice(idx + 1) : r);
          };
          reader.onerror = rej;
          reader.readAsDataURL(imageFile);
        });
        payload.image = { attachment: b64, filename: imageFile.name };
      } else if (removeImg) {
        payload.image = null;
      }

      if (isEdit) {
        await api.put(`/collections/${editCollection.id}`, payload);
        toast("Collection updated!");
      } else {
        await api.post("/collections/", payload);
        toast("Collection created!");
      }
      onBack();
    } catch (e) {
      toast(e?.message || "Failed to save collection", "error");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.delete(`/collections/${editCollection.id}`);
      toast("Collection deleted");
      onBack();
    } catch {
      toast("Failed to delete", "error");
    }
    setDeleting(false);
  }

  const filledConds = conditions.filter((c) => c.value.trim() !== "");

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "0 32px 100px",
        fontFamily: "inherit",
      }}
    >
      {/* Breadcrumb */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
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
          Collections
        </button>
        <span style={{ color: C.disabled }}>›</span>
        <span style={{ color: C.text }}>
          {isEdit ? title || "Edit collection" : "Add collection"}
        </span>
      </div>

      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          gap: 12,
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>
          {isEdit ? title || "Edit collection" : "Add collection"}
        </h1>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={onBack} variant="secondary">
            Discard
          </Btn>
          {isEdit && (
            <Btn onClick={handleDelete} disabled={deleting} variant="danger">
              {deleting ? (
                <>
                  <Spin size={14} /> Deleting…
                </>
              ) : (
                "🗑 Delete"
              )}
            </Btn>
          )}
          <Btn onClick={handleSave} disabled={saving} variant="primary">
            {saving ? (
              <>
                <Spin size={14} /> Saving…
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
          gridTemplateColumns: "1fr 270px",
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
                  placeholder="e.g. Summer Collection"
                />
              </Field>
              <Field label="Description" optional style={{ marginBottom: 0 }}>
                <RichText
                  valueRef={descRef}
                  initialHtml={editCollection?.body_html || ""}
                />
              </Field>
            </CardBody>
          </Card>

          {/* Conditions — shown for smart collections when editing, always shown for new */}
          {(!isEdit || isSmartEdit) && (
            <Card>
              <CardTitle>Conditions</CardTitle>
              <CardBody>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    marginBottom: 16,
                    fontSize: 13,
                  }}
                >
                  <span style={{ fontWeight: 500, color: C.text }}>
                    Products must match:
                  </span>
                  {["all", "any"].map((v) => (
                    <label
                      key={v}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        cursor: "pointer",
                        color: C.text,
                        fontSize: 13,
                      }}
                    >
                      <input
                        type="radio"
                        name="matchType"
                        value={v}
                        checked={matchType === v}
                        onChange={() => setMatchType(v)}
                        style={{ accentColor: C.accent, width: 16, height: 16 }}
                      />
                      {v} conditions
                    </label>
                  ))}
                </div>

                {conditions.map((c) => (
                  <ConditionRow
                    key={c._id}
                    cond={c}
                    onChange={(f, v) => updateCond(c._id, f, v)}
                    onRemove={() =>
                      setConditions((prev) => {
                        const next = prev.filter((x) => x._id !== c._id);
                        return next.length ? next : [newCond()];
                      })
                    }
                    isOnly={conditions.length === 1}
                  />
                ))}

                {filledConds.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      alignItems: "flex-start",
                      fontSize: 12,
                      color: "#fbbf24",
                      background: "rgba(251,191,36,.08)",
                      border: "1px solid rgba(251,191,36,.2)",
                      borderRadius: 7,
                      padding: "8px 12px",
                      margin: "12px 0",
                    }}
                  >
                    <span>ⓘ</span>
                    <span>
                      This collection will include all products matching{" "}
                      {matchType === "all" ? "all" : "any"} of:{" "}
                      {[
                        ...new Set(
                          filledConds.map(
                            (c) =>
                              COND_FIELDS.find((f) => f.value === c.field)
                                ?.label,
                          ),
                        ),
                      ].join(", ")}
                      .
                    </span>
                  </div>
                )}

                <Btn
                  onClick={() => setConditions((p) => [...p, newCond()])}
                  variant="secondary"
                  style={{ marginTop: 4, fontSize: 12 }}
                >
                  + Add another condition
                </Btn>
              </CardBody>
            </Card>
          )}

          {/* Products in collection (edit mode) */}
          {isEdit && (
            <Card>
              <CardTitle
                right={
                  <span
                    style={{ fontSize: 12, fontWeight: 400, color: C.muted }}
                  >
                    {products.length} product{products.length !== 1 ? "s" : ""}
                  </span>
                }
              >
                Products
              </CardTitle>
              <CardBody>
                <ProductsList products={products} />
              </CardBody>
            </Card>
          )}

          {/* SEO */}
          <SeoSection collectionTitle={title} handle={editCollection?.handle} />
        </div>

        {/* ── RIGHT ── */}
        <div>
          {/* Visibility */}
          <Card>
            <CardTitle>Visibility</CardTitle>
            <CardBody>
              <Field style={{ marginBottom: 10 }}>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { v: "active", l: "Active" },
                    { v: "draft", l: "Draft" },
                  ]}
                />
              </Field>
              <StatusDot status={status} />
              <p style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>
                {status === "active"
                  ? "This collection is visible in your online store."
                  : "This collection is hidden from your online store."}
              </p>
            </CardBody>
          </Card>

          {/* Collection image */}
          <CollectionImageCard
            imageUrl={removeImg ? null : imageUrl}
            imageFile={imageFile}
            onFileChange={(f) => {
              setImageFile(f);
              setRemoveImg(false);
            }}
            onRemove={() => {
              setImageFile(null);
              setImageUrl("");
              setRemoveImg(true);
            }}
          />

          {/* Collection details (edit only) */}
          {isEdit && editCollection && (
            <Card>
              <CardTitle>Collection details</CardTitle>
              <CardBody>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>
                  Handle
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: C.text,
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                    marginBottom: 14,
                  }}
                >
                  {editCollection.handle || "—"}
                </div>
                <div
                  style={{
                    borderTop: `1px solid ${C.border}`,
                    marginBottom: 12,
                  }}
                />
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>
                  Collection type
                </div>
                <div style={{ fontSize: 12, color: C.text, marginBottom: 14 }}>
                  {editCollection.collection_type
                    ? editCollection.collection_type.charAt(0).toUpperCase() +
                      editCollection.collection_type.slice(1)
                    : "Custom"}
                </div>
                <div
                  style={{
                    borderTop: `1px solid ${C.border}`,
                    marginBottom: 12,
                  }}
                />
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>
                  Collection ID
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: C.disabled,
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                  }}
                >
                  {editCollection.id}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Sticky save bar */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 220,
          right: 0,
          background: "#0d0d0d",
          borderTop: `1px solid ${C.border}`,
          padding: "12px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 200,
        }}
      >
        <span style={{ fontSize: 13, color: C.muted }}>
          {saving
            ? "Saving…"
            : isEdit
              ? "Unsaved changes"
              : "Unsaved collection"}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={onBack} variant="secondary">
            Discard
          </Btn>
          <Btn onClick={handleSave} disabled={saving} variant="primary">
            {saving ? (
              <>
                <Spin size={14} /> Saving…
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
