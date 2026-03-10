import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import CollectionsPage from "./pages/CollectionsPage";
import InventoryPage from "./pages/InventoryPage";

const API = "http://localhost:8000/api";

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { height: 100%; }
    body { font-family: 'DM Sans', sans-serif; background: #0a0a0f; color: #e8e8f0; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #13131a; }
    ::-webkit-scrollbar-thumb { background: #2a2a3d; border-radius: 3px; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
    @keyframes spin { to { transform: rotate(360deg); } }
    .fade-up { animation: fadeUp 0.35s ease forwards; }
    .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .card-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(99,102,241,0.15); }
    .btn-primary { background: linear-gradient(135deg,#6366f1,#8b5cf6); border:none; cursor:pointer; transition: all 0.2s; color:#fff; }
    .btn-primary:hover:not(:disabled) { opacity:0.9; transform:translateY(-1px); box-shadow:0 4px 20px rgba(99,102,241,0.4); }
    .btn-primary:disabled { opacity:0.4; cursor:not-allowed; }
    .btn-ghost { background:#1e1e2e; border:1px solid #2a2a3d; cursor:pointer; transition:all 0.2s; color:#888; }
    .btn-ghost:hover { background:#252538; border-color:#6366f1; color:#e8e8f0; }
    .field-input { background:#13131a; border:1px solid #2a2a3d; color:#e8e8f0; outline:none; transition:border-color 0.2s; font-family:inherit; width:100%; }
    .field-input:focus { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,0.1); }
    .chk { appearance:none; width:18px; height:18px; min-width:18px; border:2px solid #3d3d5c; border-radius:5px; cursor:pointer; background:#13131a; position:relative; transition:all 0.15s; }
    .chk:checked { background:#6366f1; border-color:#6366f1; }
    .chk:checked::after { content:'✓'; position:absolute; color:#fff; font-size:11px; top:50%; left:50%; transform:translate(-50%,-50%); }
    .skeleton { background:linear-gradient(90deg,#1a1a2e 25%,#252540 50%,#1a1a2e 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:10px; }
    .modal-overlay { position:fixed; top:0; left:0; right:0; bottom:0; z-index:9999; background:rgba(0,0,0,0.8); backdrop-filter:blur(6px); overflow-y:scroll; padding:40px 20px 80px; display:block; }
.modal-box { margin-left:auto; margin-right:auto; }
    .modal-box { background:#13131a; border:1px solid #2a2a3d; border-radius:20px; width:100%; box-shadow:0 24px 80px rgba(0,0,0,0.7); flex-shrink:0; }
  `}</style>
);

const api = {
  get: (p) => fetch(`${API}${p}`).then(r => r.json()),
  post: (p, b) => fetch(`${API}${p}`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(b) }).then(r => r.json()),
  put: (p, b) => fetch(`${API}${p}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(b) }).then(r => r.json()),
  delete: (p) => fetch(`${API}${p}`, { method:"DELETE" }).then(r => r.json()),
  upload: (p, fd) => fetch(`${API}${p}`, { method:"POST", body:fd }).then(r => r.json()),
};

const ICONS = {
  products:"M20 7l-8-4-8 4m16 0v10l-8 4-8-4V7m8 4v10M12 11L4 7",
  upload:"M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
  collections:"M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  inventory:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  grid:"M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
  list:"M4 6h16M4 10h16M4 14h16M4 18h16",
  plus:"M12 4v16m8-8H4",
  edit:"M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  trash:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  search:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0",
  x:"M6 18L18 6M6 6l12 12",
  check:"M5 13l4 4L19 7",
  percent:"M19 5L5 19M9 6.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM15 17.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
  image:"M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  tag:"M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
};

const Ico = ({ n, size=18, color="currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
    <path d={ICONS[n]||ICONS.products}/>
  </svg>
);

const Spin = ({ size=18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{animation:"spin 0.8s linear infinite",flexShrink:0}}>
    <circle cx="12" cy="12" r="10" stroke="#3d3d5c" strokeWidth="3"/>
    <path d="M12 2a10 10 0 0110 10" stroke="#6366f1" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const useToast = () => {
  const [toasts, set] = useState([]);
  const add = (msg, type="success") => {
    const id = Date.now();
    set(p => [...p, {id, msg, type}]);
    setTimeout(() => set(p => p.filter(t => t.id !== id)), 4000);
  };
  return { toasts, add, remove: id => set(p => p.filter(t => t.id !== id)) };
};

const Toasts = ({ toasts, remove }) => (
  <div style={{position:"fixed",top:20,right:20,zIndex:99999,display:"flex",flexDirection:"column",gap:8,pointerEvents:"none"}}>
    {toasts.map(t => (
      <div key={t.id} className="fade-up" style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",background:t.type==="success"?"#064e3b":t.type==="error"?"#7f1d1d":"#1e3a5f",border:`1px solid ${t.type==="success"?"#10b981":t.type==="error"?"#ef4444":"#3b82f6"}`,borderRadius:12,boxShadow:"0 8px 32px rgba(0,0,0,0.5)",minWidth:280,maxWidth:380,pointerEvents:"all"}}>
        <Ico n={t.type==="success"?"check":"x"} size={15} color={t.type==="success"?"#10b981":"#ef4444"}/>
        <span style={{flex:1,fontSize:13,color:"#e8e8f0"}}>{t.msg}</span>
        <button onClick={()=>remove(t.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#666",padding:2,display:"flex"}}><Ico n="x" size={13}/></button>
      </div>
    ))}
  </div>
);

const Badge = ({ status }) => {
  const C = {active:{bg:"rgba(16,185,129,0.15)",c:"#10b981",b:"rgba(16,185,129,0.3)"},draft:{bg:"rgba(245,158,11,0.15)",c:"#f59e0b",b:"rgba(245,158,11,0.3)"},archived:{bg:"rgba(107,114,128,0.15)",c:"#6b7280",b:"rgba(107,114,128,0.3)"}};
  const s = C[status]||C.draft;
  return <span style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:s.bg,color:s.c,border:`1px solid ${s.b}`,textTransform:"uppercase",letterSpacing:"0.5px"}}>{status||"draft"}</span>;
};

// THE FIXED MODAL - uses CSS class modal-overlay for proper scrolling
const Modal = ({ title, subtitle, onClose, children, maxWidth=660 }) => createPortal(
  <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
    <div className="modal-box fade-up" style={{maxWidth}}>
      <div style={{padding:"22px 28px 18px",borderBottom:"1px solid #1e1e2e",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
        <div>
          <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:700,color:"#fff"}}>{title}</h2>
          {subtitle && <p style={{fontSize:13,color:"#666",marginTop:3}}>{subtitle}</p>}
        </div>
        <button onClick={onClose} className="btn-ghost" style={{padding:8,borderRadius:10,display:"flex",flexShrink:0}}>
          <Ico n="x" size={16}/>
        </button>
      </div>
      <div style={{padding:"24px 28px 28px"}}>{children}</div>
    </div>
  </div>,
  document.body
);

const Field = ({ label, value, onChange, type="text", options, rows, pre, suf }) => (
  <div style={{display:"flex",flexDirection:"column",gap:6}}>
    <label style={{fontSize:11,fontWeight:600,color:"#888",textTransform:"uppercase",letterSpacing:"0.6px"}}>{label}</label>
    <div style={{position:"relative",display:"flex",alignItems:"center"}}>
      {pre && <span style={{position:"absolute",left:12,color:"#666",fontSize:14,pointerEvents:"none",zIndex:1}}>{pre}</span>}
      {options ? (
        <select value={value} onChange={e=>onChange(e.target.value)} className="field-input" style={{padding:"10px 14px",borderRadius:10,fontSize:14,appearance:"none",cursor:"pointer"}}>
          {options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
        </select>
      ) : type==="textarea" ? (
        <textarea value={value} onChange={e=>onChange(e.target.value)} rows={rows||3} className="field-input" style={{padding:"10px 14px",borderRadius:10,fontSize:14,resize:"vertical"}}/>
      ) : (
        <input type={type} value={value} onChange={e=>onChange(e.target.value)} className="field-input" style={{padding:`10px ${suf?"40px":"14px"} 10px ${pre?"36px":"14px"}`,borderRadius:10,fontSize:14}}/>
      )}
      {suf && <span style={{position:"absolute",right:12,color:"#666",fontSize:14,pointerEvents:"none"}}>{suf}</span>}
    </div>
  </div>
);

const PriceModal = ({ count, onApply, onClose }) => {
  const [mode, setMode] = useState("percent");
  const [val, setVal] = useState("");
  const [dir, setDir] = useState("increase");
  const preview = val ? (mode==="percent" ? (dir==="increase" ? (100*(1+parseFloat(val)/100)).toFixed(2) : (100*(1-parseFloat(val)/100)).toFixed(2)) : (dir==="increase" ? (100+parseFloat(val)).toFixed(2) : (100-parseFloat(val)).toFixed(2))) : null;
  return (
    <Modal title="Adjust Prices" subtitle={`${count} product${count!==1?"s":""} selected`} onClose={onClose} maxWidth={500}>
      <div style={{display:"flex",flexDirection:"column",gap:18}}>
        <div>
          <p style={{fontSize:11,fontWeight:600,color:"#888",textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:8}}>Type</p>
          <div style={{display:"flex",gap:8}}>
            {[{id:"percent",l:"% Percentage"},{id:"fixed",l:"$ Fixed"}].map(m=>(
              <button key={m.id} onClick={()=>setMode(m.id)} style={{flex:1,padding:"10px",borderRadius:10,fontSize:13,fontWeight:500,border:`2px solid ${mode===m.id?"#6366f1":"#2a2a3d"}`,background:mode===m.id?"rgba(99,102,241,0.12)":"#13131a",color:mode===m.id?"#818cf8":"#888",cursor:"pointer",transition:"all 0.15s"}}>{m.l}</button>
            ))}
          </div>
        </div>
        <div>
          <p style={{fontSize:11,fontWeight:600,color:"#888",textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:8}}>Direction</p>
          <div style={{display:"flex",gap:8}}>
            {[{id:"increase",l:"↑ Increase",c:"#10b981"},{id:"decrease",l:"↓ Decrease",c:"#ef4444"}].map(d=>(
              <button key={d.id} onClick={()=>setDir(d.id)} style={{flex:1,padding:"10px",borderRadius:10,fontSize:13,fontWeight:500,border:`2px solid ${dir===d.id?d.c:"#2a2a3d"}`,background:dir===d.id?`${d.c}18`:"#13131a",color:dir===d.id?d.c:"#888",cursor:"pointer",transition:"all 0.15s"}}>{d.l}</button>
            ))}
          </div>
        </div>
        <Field label={mode==="percent"?"Percentage":"Amount"} value={val} onChange={setVal} type="number" suf={mode==="percent"?"%":"$"}/>
        {preview && (
          <div style={{background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:10,padding:"12px 14px",fontSize:13,color:"#818cf8"}}>
            $100.00 → <strong style={{color:dir==="increase"?"#10b981":"#ef4444"}}>${preview}</strong>
          </div>
        )}
        <div style={{display:"flex",gap:10,paddingTop:4}}>
          <button onClick={()=>val&&onApply({mode,value:parseFloat(val),dir})} disabled={!val} className="btn-primary" style={{flex:1,padding:"12px",borderRadius:12,fontSize:14,fontWeight:600}}>
            Apply to {count} Products
          </button>
          <button onClick={onClose} className="btn-ghost" style={{padding:"12px 20px",borderRadius:12,fontSize:14}}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
};

const EditModal = ({ product, onSave, onClose }) => {
  const [f, setF] = useState({
    title:product?.title||"", vendor:product?.vendor||"", product_type:product?.product_type||"",
    tags:product?.tags||"", status:product?.status||"draft", body_html:product?.body_html||"",
    price:product?.variants?.[0]?.price||"", compare_at_price:product?.variants?.[0]?.compare_at_price||"",
    sku:product?.variants?.[0]?.sku||"", inventory_quantity:product?.variants?.[0]?.inventory_quantity||"",
    image_src:product?.images?.[0]?.src||"",
  });
  const [saving, setSaving] = useState(false);
  const s = k => v => setF(p=>({...p,[k]:v}));
  const save = async () => {
    setSaving(true);
    await onSave({ title:f.title, vendor:f.vendor, product_type:f.product_type, tags:f.tags, status:f.status, body_html:f.body_html,
      variants:[{price:f.price, compare_at_price:f.compare_at_price, sku:f.sku, inventory_quantity:parseInt(f.inventory_quantity)||0}],
      ...(f.image_src?{images:[{src:f.image_src}]}:{}) });
    setSaving(false);
  };
  return (
    <Modal title={product?"Edit Product":"Add Product"} subtitle={product?.title} onClose={onClose} maxWidth={740}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div style={{gridColumn:"1/-1"}}><Field label="Title *" value={f.title} onChange={s("title")}/></div>
        <Field label="Vendor" value={f.vendor} onChange={s("vendor")}/>
        <Field label="Product Type" value={f.product_type} onChange={s("product_type")}/>
        <Field label="Tags" value={f.tags} onChange={s("tags")}/>
        <Field label="Status" value={f.status} onChange={s("status")} options={[{v:"draft",l:"Draft"},{v:"active",l:"Active"},{v:"archived",l:"Archived"}]}/>
        <div style={{gridColumn:"1/-1",borderTop:"1px solid #1e1e2e",paddingTop:14,marginTop:2}}>
          <p style={{fontSize:11,fontWeight:600,color:"#555",textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:12}}>Pricing & Inventory</p>
        </div>
        <Field label="Price" value={f.price} onChange={s("price")} type="number" pre="$"/>
        <Field label="Compare At Price" value={f.compare_at_price} onChange={s("compare_at_price")} type="number" pre="$"/>
        <Field label="SKU" value={f.sku} onChange={s("sku")}/>
        <Field label="Inventory Qty" value={f.inventory_quantity} onChange={s("inventory_quantity")} type="number"/>
        <div style={{gridColumn:"1/-1",borderTop:"1px solid #1e1e2e",paddingTop:14,marginTop:2}}>
          <p style={{fontSize:11,fontWeight:600,color:"#555",textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:12}}>Media & Description</p>
        </div>
        <div style={{gridColumn:"1/-1"}}><Field label="Image URL" value={f.image_src} onChange={s("image_src")}/></div>
        <div style={{gridColumn:"1/-1"}}><Field label="Description (HTML)" value={f.body_html} onChange={s("body_html")} type="textarea" rows={4}/></div>
        <div style={{gridColumn:"1/-1",display:"flex",gap:10,paddingTop:6}}>
          <button onClick={save} disabled={saving||!f.title} className="btn-primary" style={{flex:1,padding:"13px",borderRadius:12,fontSize:15,fontWeight:600}}>
            {saving?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Spin size={16}/>Saving...</span>:"Save to Shopify"}
          </button>
          <button onClick={onClose} className="btn-ghost" style={{padding:"13px 24px",borderRadius:12,fontSize:15}}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
};

const ProductCard = ({ p, sel, onSel, onEdit, onDel }) => {
  const img = p.images?.[0]?.src;
  const price = p.variants?.[0]?.price;
  const cmp = p.variants?.[0]?.compare_at_price;
  const inv = p.variants?.reduce((s,v)=>s+(v.inventory_quantity||0),0);
  return (
    <div className="card-hover fade-up" style={{background:"#13131a",border:`2px solid ${sel?"#6366f1":"#1e1e2e"}`,borderRadius:16,overflow:"hidden",position:"relative"}}>
      <div style={{position:"absolute",top:10,left:10,zIndex:2}}><input type="checkbox" className="chk" checked={sel} onChange={()=>onSel(p.id)}/></div>
      <div style={{position:"absolute",top:10,right:10,zIndex:2}}><Badge status={p.status}/></div>
      <div style={{height:190,background:"#0d0d14",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
        {img ? <img src={img} alt={p.title} style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.3s"}} onMouseOver={e=>e.target.style.transform="scale(1.06)"} onMouseOut={e=>e.target.style.transform="scale(1)"}/>
          : <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,color:"#2a2a3d"}}><Ico n="image" size={36} color="#2a2a3d"/><span style={{fontSize:11}}>No image</span></div>}
      </div>
      <div style={{padding:14}}>
        <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:"#e8e8f0",marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.title}</h3>
        {p.vendor&&<p style={{fontSize:12,color:"#555",marginBottom:10}}>{p.vendor}</p>}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"baseline",gap:6}}>
            <span style={{fontSize:17,fontWeight:700,color:"#818cf8"}}>{price?`$${price}`:"—"}</span>
            {cmp&&<span style={{fontSize:12,color:"#555",textDecoration:"line-through"}}>${cmp}</span>}
          </div>
          <span style={{fontSize:11,color:inv>0?"#10b981":"#ef4444",background:inv>0?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)",padding:"2px 8px",borderRadius:20}}>{inv} in stock</span>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>onEdit(p)} className="btn-ghost" style={{flex:1,padding:"8px",borderRadius:10,color:"#818cf8",fontSize:13,fontWeight:500,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
            <Ico n="edit" size={13} color="#818cf8"/>Edit
          </button>
          <button onClick={()=>onDel(p.id)} className="btn-ghost" style={{padding:"8px 10px",borderRadius:10,color:"#ef4444",display:"flex"}}>
            <Ico n="trash" size={13} color="#ef4444"/>
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductsPage = ({ toast }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("all");
  const [sel, setSel] = useState(new Set());
  const [editM, setEditM] = useState(null);
  const [priceM, setPriceM] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { 
      const statusParam = statusF && statusF !== "all" ? `&status=${statusF}` : "";
      const d = await api.get(`/products?limit=250${statusParam}`); 
      setProducts(d.products||[]); 
    }
    catch { toast("Failed to load products","error"); }
    setLoading(false);
  }, [statusF]);

  useEffect(() => { load(); }, [load]);

  const filtered = products.filter(p => !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.vendor?.toLowerCase().includes(search.toLowerCase()));
  const toggleSel = id => setSel(p => { const n=new Set(p); n.has(id)?n.delete(id):n.add(id); return n; });
  const selAll = () => setSel(sel.size===filtered.length?new Set():new Set(filtered.map(p=>p.id)));

  const handleSave = async (payload) => {
    try {
      if (editM?.id) { await api.put(`/products/${editM.id}`, payload); toast("Product updated!"); }
      else { await api.post("/products", payload); toast("Product created!"); }
      setEditM(null); load();
    } catch { toast("Failed to save","error"); }
  };

  const handleDel = async id => {
    if (!window.confirm("Delete this product?")) return;
    setDeleting(id);
    try { await api.delete(`/products/${id}`); toast("Deleted"); load(); }
    catch { toast("Failed","error"); }
    setDeleting(null);
  };
  const handleRemoveDuplicates = async () => {
  try {
    const preview = await api.get("/products/find-duplicates");
    if (preview.duplicates_found === 0) {
      toast("No duplicate products found! ✅", "success");
      return;
    }
    const list = preview.duplicates.map(d => `• ${d.title}`).join("\n");
    if (!window.confirm(`Found ${preview.duplicates_found} duplicate(s):\n\n${list}\n\nDelete them? (keeps the first one)`)) return;
    const result = await api.post("/products/remove-duplicates", {});
    toast(`Deleted ${result.deleted} duplicate(s)!${result.failed ? ` (${result.failed} failed)` : ""}`, result.deleted > 0 ? "success" : "error");
    load();
  } catch {
    toast("Failed to remove duplicates", "error");
  }
};

  const handleBulkDel = async () => {
    if (!sel.size||!window.confirm(`Delete ${sel.size} products?`)) return;
    let ok=0,fail=0;
    for (const id of sel) { try { await api.delete(`/products/${id}`); ok++; } catch { fail++; } }
    toast(`Deleted ${ok}${fail?`, ${fail} failed`:""}`); setSel(new Set()); load();
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

  const handlePriceAdj = async ({mode,value,dir}) => {
    const prods = products.filter(p=>sel.has(p.id));
    let ok=0,fail=0;
    for (const p of prods) {
      const v = p.variants?.[0]; if (!v?.price) continue;
      const cur = parseFloat(v.price);
      let np = mode==="percent" ? (dir==="increase"?cur*(1+value/100):cur*(1-value/100)) : (dir==="increase"?cur+value:cur-value);
      np = Math.max(0,np).toFixed(2);
      try { await api.put(`/products/${p.id}`,{title:p.title,variants:[{...v,price:np}]}); ok++; }
      catch { fail++; }
    }
    toast(`Updated ${ok} prices${fail?`, ${fail} failed`:""}`); setPriceM(false); setSel(new Set()); load();
  };

  const stats = { total:products.length, active:products.filter(p=>p.status==="active").length, draft:products.filter(p=>p.status==="draft").length };

  return (
    <div className="fade-up">
      {editM!==null && <EditModal product={editM===true?null:editM} onSave={handleSave} onClose={()=>setEditM(null)}/>}
      {priceM && <PriceModal count={sel.size} onApply={handlePriceAdj} onClose={()=>setPriceM(false)}/>}

      <div style={{marginBottom:24}}>
        <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:30,fontWeight:800,color:"#fff",letterSpacing:"-0.5px"}}>Products</h1>
        <p style={{color:"#555",marginTop:4,fontSize:14}}>Manage your Shopify product catalog</p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
        {[{l:"Total",v:stats.total,c:"#818cf8",i:"products"},{l:"Active",v:stats.active,c:"#10b981",i:"check"},{l:"Drafts",v:stats.draft,c:"#f59e0b",i:"edit"}].map(s=>(
          <div key={s.l} style={{background:"#13131a",border:"1px solid #1e1e2e",borderRadius:14,padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:38,height:38,borderRadius:10,background:`${s.c}18`,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n={s.i} size={17} color={s.c}/></div>
            <div><div style={{fontSize:22,fontWeight:700,color:s.c,fontFamily:"'Syne',sans-serif"}}>{loading?"—":s.v}</div><div style={{fontSize:12,color:"#555"}}>{s.l}</div></div>
          </div>
        ))}
      </div>

      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:180}}>
          <div style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><Ico n="search" size={14} color="#555"/></div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..." className="field-input" style={{padding:"9px 14px 9px 34px",borderRadius:12,fontSize:14}}/>
        </div>
        <select value={statusF} onChange={e=>setStatusF(e.target.value)} className="field-input" style={{padding:"9px 14px",borderRadius:12,fontSize:14,cursor:"pointer",width:"auto"}}>
          {[{v:"all",l:"All Products"},{v:"active",l:"Active"},{v:"draft",l:"Draft"},{v:"archived",l:"Archived"}].map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
        <div style={{display:"flex",background:"#13131a",border:"1px solid #2a2a3d",borderRadius:10,padding:3,gap:3}}>
          {[{id:"grid",i:"grid"},{id:"list",i:"list"}].map(v=>(
            <button key={v.id} onClick={()=>setView(v.id)} style={{padding:"6px 9px",borderRadius:7,background:view===v.id?"#6366f1":"transparent",border:"none",cursor:"pointer",display:"flex",color:view===v.id?"#fff":"#555",transition:"all 0.15s"}}><Ico n={v.i} size={14}/></button>
          ))}
        </div>
        <button onClick={syncShopify} disabled={loading} className="btn-primary" style={{padding:"9px 16px",borderRadius:12,fontSize:14,fontWeight:600,display:"flex",alignItems:"center",gap:6,opacity:loading?0.6:1}}>
          🔄 Sync Shopify
        </button>
        <button onClick={()=>setEditM(true)} className="btn-primary" style={{padding:"9px 16px",borderRadius:12,fontSize:14,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
          <Ico n="plus" size={15} color="#fff"/>Add Product
        </button>
      </div>

      {sel.size>0&&(
        <div className="fade-up" style={{background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.25)",borderRadius:12,padding:"10px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <span style={{fontSize:13,color:"#818cf8",fontWeight:600}}>{sel.size} selected</span>
          <div style={{flex:1}}/>
          <button onClick={()=>setPriceM(true)} className="btn-ghost" style={{padding:"7px 14px",borderRadius:9,color:"#818cf8",fontSize:13,fontWeight:500,display:"flex",alignItems:"center",gap:6}}><Ico n="percent" size={13} color="#818cf8"/>Adjust Prices</button>
          <button onClick={handleRemoveDuplicates} className="btn-ghost" style={{padding:"7px 14px",borderRadius:9,color:"#f59e0b",fontSize:13,fontWeight:500,display:"flex",alignItems:"center",gap:6}}><Ico n="percent" size={13} color="#f59e0b"/>Remove Duplicates</button>
          <button onClick={handleBulkDel} className="btn-ghost" style={{padding:"7px 14px",borderRadius:9,color:"#ef4444",fontSize:13,fontWeight:500,display:"flex",alignItems:"center",gap:6}}><Ico n="trash" size={13} color="#ef4444"/>Delete</button>
          <button onClick={()=>setSel(new Set())} className="btn-ghost" style={{padding:"7px 9px",borderRadius:9,display:"flex"}}><Ico n="x" size={13}/></button>
        </div>
      )}

      {filtered.length>0&&(
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <input type="checkbox" className="chk" checked={sel.size===filtered.length&&filtered.length>0} onChange={selAll}/>
          <span style={{fontSize:13,color:"#555"}}>Select all {filtered.length}</span>
        </div>
      )}

      {loading ? (
        <div style={{display:"grid",gridTemplateColumns:view==="grid"?"repeat(auto-fill,minmax(220px,1fr))":"1fr",gap:14}}>
          {[...Array(8)].map((_,i)=><div key={i} className="skeleton" style={{height:view==="grid"?300:66}}/>)}
        </div>
      ) : view==="grid" ? (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:14}}>
          {filtered.map(p=><ProductCard key={p.id} p={p} sel={sel.has(p.id)} onSel={toggleSel} onEdit={setEditM} onDel={handleDel}/>)}
          {filtered.length===0&&<p style={{color:"#444",gridColumn:"1/-1",textAlign:"center",padding:60}}>No products found</p>}
        </div>
      ) : (
        <div style={{background:"#13131a",border:"1px solid #1e1e2e",borderRadius:14,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{borderBottom:"1px solid #1e1e2e"}}>
              <th style={{padding:"11px 14px",width:36}}></th>
              {["Product","Vendor","Price","Stock","Status",""].map(h=><th key={h} style={{padding:"11px 14px",textAlign:"left",fontSize:11,fontWeight:600,color:"#555",textTransform:"uppercase",letterSpacing:"0.5px"}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map((p,i)=>{
                const img=p.images?.[0]?.src; const price=p.variants?.[0]?.price; const inv=p.variants?.reduce((s,v)=>s+(v.inventory_quantity||0),0);
                return (
                  <tr key={p.id} style={{borderBottom:i<filtered.length-1?"1px solid #1a1a2e":"none"}} onMouseOver={e=>e.currentTarget.style.background="#17172a"} onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{padding:"10px 14px"}}><input type="checkbox" className="chk" checked={sel.has(p.id)} onChange={()=>toggleSel(p.id)}/></td>
                    <td style={{padding:"10px 14px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:40,height:40,borderRadius:8,background:"#0d0d14",overflow:"hidden",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                          {img?<img src={img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<Ico n="image" size={16} color="#2a2a3d"/>}
                        </div>
                        <div><div style={{fontSize:13,fontWeight:600,color:"#e8e8f0"}}>{p.title}</div>{p.product_type&&<div style={{fontSize:11,color:"#555"}}>{p.product_type}</div>}</div>
                      </div>
                    </td>
                    <td style={{padding:"10px 14px",fontSize:13,color:"#777"}}>{p.vendor||"—"}</td>
                    <td style={{padding:"10px 14px",fontSize:13,fontWeight:600,color:"#818cf8"}}>{price?`$${price}`:"—"}</td>
                    <td style={{padding:"10px 14px",fontSize:12,color:inv>0?"#10b981":"#ef4444"}}>{inv} units</td>
                    <td style={{padding:"10px 14px"}}><Badge status={p.status}/></td>
                    <td style={{padding:"10px 14px"}}>
                      <div style={{display:"flex",gap:6}}>
                        <button onClick={()=>setEditM(p)} className="btn-ghost" style={{padding:"6px 9px",borderRadius:8,display:"flex"}}><Ico n="edit" size={13} color="#818cf8"/></button>
                        <button onClick={()=>handleDel(p.id)} disabled={deleting===p.id} className="btn-ghost" style={{padding:"6px 9px",borderRadius:8,display:"flex",color:"#ef4444"}}>
                          {deleting===p.id?<Spin size={13}/>:<Ico n="trash" size={13} color="#ef4444"/>}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length===0&&<tr><td colSpan={7} style={{padding:"50px",textAlign:"center",color:"#444"}}>No products</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const UploadPage = ({ toast }) => {
  const [file,setFile]=useState(null); const [preview,setPreview]=useState(null); const [full,setFull]=useState(null);
  const [edited,setEdited]=useState({}); const [loading,setLoading]=useState(false); const [pushing,setPushing]=useState(false);
  const [results,setResults]=useState(null); const [drag,setDrag]=useState(false); const [step,setStep]=useState(1);

  const drop = f => { setFile(f); setPreview(null); setFull(null); setResults(null); setStep(1); };
  const doPreview = async () => { setLoading(true); const fd=new FormData(); fd.append("file",file); const d=await api.upload("/upload/preview",fd); if(d.columns){setPreview(d);setStep(2);}else toast(d.detail||"Failed","error"); setLoading(false); };
  const doParse = async () => { setLoading(true); const fd=new FormData(); fd.append("file",file); const d=await api.upload("/upload/parse",fd); if(d.columns){setFull(d);setEdited({});setStep(3);}else toast(d.detail||"Failed","error"); setLoading(false); };
  const doPush = async () => {
    if(!full||!window.confirm(`Push ${full.total_rows} rows to Shopify?`))return;
    setPushing(true);
    const prods=full.data.map((r,i)=>({...r,...edited[i]}));
    const d=await api.post("/upload/push-to-shopify",prods);
    setResults(d); toast(`${d.success?.length||0} products pushed!`); setPushing(false); setStep(4);
  };
  const steps=["Select File","Preview","Edit & Review","Done"];

  return (
    <div className="fade-up">
      <div style={{marginBottom:24}}>
        <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:30,fontWeight:800,color:"#fff",letterSpacing:"-0.5px"}}>Upload Products</h1>
        <p style={{color:"#555",marginTop:4,fontSize:14}}>Import Excel or CSV and push to Shopify</p>
      </div>
      <div style={{display:"flex",alignItems:"center",marginBottom:28,gap:0}}>
        {steps.map((s,i)=>(
          <div key={s} style={{display:"flex",alignItems:"center",flex:i<steps.length-1?1:"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <div style={{width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:step>i+1?"#6366f1":step===i+1?"linear-gradient(135deg,#6366f1,#8b5cf6)":"#1e1e2e",border:`2px solid ${step>=i+1?"#6366f1":"#2a2a3d"}`,fontSize:11,fontWeight:700,color:step>=i+1?"#fff":"#555",transition:"all 0.3s"}}>{step>i+1?"✓":i+1}</div>
              <span style={{fontSize:12,fontWeight:500,color:step===i+1?"#818cf8":step>i+1?"#e8e8f0":"#555"}}>{s}</span>
            </div>
            {i<steps.length-1&&<div style={{flex:1,height:1,background:step>i+1?"#6366f1":"#1e1e2e",margin:"0 10px",transition:"background 0.3s"}}/>}
          </div>
        ))}
      </div>
      <div style={{background:"#13131a",border:"1px solid #1e1e2e",borderRadius:18,padding:24,marginBottom:16}}>
        <div onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)drop(f);}} onClick={()=>document.getElementById("fi").click()}
          style={{border:`2px dashed ${drag?"#6366f1":file?"#10b981":"#2a2a3d"}`,borderRadius:12,padding:"40px 20px",textAlign:"center",cursor:"pointer",background:drag?"rgba(99,102,241,0.05)":file?"rgba(16,185,129,0.05)":"transparent",transition:"all 0.2s"}}>
          <input id="fi" type="file" accept=".xlsx,.xls,.csv" style={{display:"none"}} onChange={e=>e.target.files[0]&&drop(e.target.files[0])}/>
          <div style={{fontSize:36,marginBottom:10}}>📊</div>
          <p style={{fontSize:15,fontWeight:600,color:file?"#10b981":"#e8e8f0",marginBottom:4}}>{file?`✓ ${file.name}`:"Drop file here or click to browse"}</p>
          <p style={{fontSize:12,color:"#555"}}>Supports .xlsx, .xls, .csv</p>
        </div>
        {file&&(
          <div style={{display:"flex",gap:10,marginTop:14}}>
            <button onClick={doPreview} disabled={loading} className="btn-ghost" style={{flex:1,padding:"11px",borderRadius:11,color:"#818cf8",fontSize:14,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
              {loading&&step===1?<Spin size={15}/>:null}Preview (10 rows)
            </button>
            <button onClick={doParse} disabled={loading} className="btn-primary" style={{flex:1,padding:"11px",borderRadius:11,fontSize:14,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
              {loading?<Spin size={15}/>:null}Parse Full Data
            </button>
          </div>
        )}
      </div>
      {preview&&!full&&(
        <div style={{background:"#13131a",border:"1px solid #1e1e2e",borderRadius:18,padding:22,marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:700,color:"#fff"}}>Preview</h3>
            <span style={{fontSize:12,color:"#555"}}>{preview.total_rows} rows · first 10 shown</span>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{borderBottom:"1px solid #1e1e2e"}}>{preview.columns.map(c=><th key={c} style={{padding:"8px 10px",textAlign:"left",color:"#555",fontWeight:600,fontSize:10,textTransform:"uppercase",whiteSpace:"nowrap"}}>{c}</th>)}</tr></thead>
              <tbody>{(preview.preview||preview.data||[]).map((row,i)=><tr key={i} style={{borderBottom:"1px solid #1a1a2e"}}>{preview.columns.map(c=><td key={c} style={{padding:"8px 10px",color:"#777",maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{String(row[c]||"")}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </div>
      )}
      {full&&!results&&(
        <div style={{background:"#13131a",border:"1px solid #1e1e2e",borderRadius:18,padding:22,marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:700,color:"#fff"}}>Edit & Review</h3>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:12,color:"#555"}}>{full.total_rows} rows</span>
              <button onClick={doPush} disabled={pushing} className="btn-primary" style={{padding:"9px 18px",borderRadius:10,fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:7}}>
                {pushing?<><Spin size={14}/>Pushing...</>:"🚀 Push to Shopify"}
              </button>
            </div>
          </div>
          <div style={{overflowX:"auto",maxHeight:460,overflowY:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead style={{position:"sticky",top:0,background:"#13131a",zIndex:1}}>
                <tr style={{borderBottom:"1px solid #1e1e2e"}}>
                  <th style={{padding:"8px 10px",color:"#555",fontSize:10,fontWeight:600,textTransform:"uppercase"}}>#</th>
                  {full.columns.map(c=><th key={c} style={{padding:"8px 10px",textAlign:"left",color:"#555",fontSize:10,fontWeight:600,textTransform:"uppercase",whiteSpace:"nowrap"}}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {full.data.map((row,ri)=>(
                  <tr key={ri} style={{borderBottom:"1px solid #1a1a2e"}}>
                    <td style={{padding:"4px 10px",color:"#444",textAlign:"center"}}>{ri+1}</td>
                    {full.columns.map(c=>(
                      <td key={c} style={{padding:"3px 5px"}}>
                        <input value={edited[ri]?.[c]??String(row[c]||"")} onChange={e=>setEdited(p=>({...p,[ri]:{...p[ri],[c]:e.target.value}}))} className="field-input" style={{minWidth:75,padding:"4px 7px",borderRadius:6,fontSize:11}}/>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {results&&(
        <div className="fade-up" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div style={{background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:14,padding:22}}>
            <div style={{fontSize:38,fontWeight:800,color:"#10b981",fontFamily:"'Syne',sans-serif"}}>{results.success?.length}</div>
            <div style={{fontSize:13,color:"#10b981",marginTop:3}}>Created successfully</div>
          </div>
          <div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:14,padding:22}}>
            <div style={{fontSize:38,fontWeight:800,color:"#ef4444",fontFamily:"'Syne',sans-serif"}}>{results.errors?.length}</div>
            <div style={{fontSize:13,color:"#ef4444",marginTop:3}}>Failed</div>
          </div>
          <div style={{gridColumn:"1/-1"}}>
            <button onClick={()=>{setFile(null);setPreview(null);setFull(null);setResults(null);setStep(1);}} className="btn-primary" style={{padding:"12px 22px",borderRadius:12,fontSize:14,fontWeight:600}}>Upload Another</button>
          </div>
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ page, set }) => (
  <aside style={{width:210,background:"#0d0d14",borderRight:"1px solid #1a1a2e",display:"flex",flexDirection:"column",height:"100vh",position:"fixed",left:0,top:0,zIndex:100}}>
    <div style={{padding:"22px 18px 18px",borderBottom:"1px solid #1a1a2e"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🛍️</div>
        <div><div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,color:"#fff"}}>ShopManager</div><div style={{fontSize:10,color:"#555"}}>Shopify Control</div></div>
      </div>
    </div>
    <nav style={{flex:1,padding:"14px 10px",display:"flex",flexDirection:"column",gap:3}}>
      {[{id:"products",l:"Products",i:"products"},{id:"upload",l:"Upload",i:"upload"},{id:"collections",l:"Collections",i:"collections"},{id:"inventory",l:"Inventory",i:"inventory"}].map(({id,l,i})=>(
        <button key={id} onClick={()=>set(id)} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"9px 11px",borderRadius:11,border:"none",cursor:"pointer",background:page===id?"rgba(99,102,241,0.15)":"transparent",color:page===id?"#818cf8":"#555",fontSize:13,fontWeight:page===id?600:400,transition:"all 0.15s",textAlign:"left",borderLeft:page===id?"2px solid #6366f1":"2px solid transparent"}}>
          <Ico n={i} size={16} color={page===id?"#818cf8":"#444"}/>{l}
        </button>
      ))}
    </nav>
    <div style={{padding:"14px 10px",borderTop:"1px solid #1a1a2e"}}>
      <div style={{background:"#13131a",border:"1px solid #1e1e2e",borderRadius:11,padding:"11px 13px"}}>
        <div style={{fontSize:10,color:"#10b981",fontWeight:600,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.5px"}}>● Connected</div>
        <div style={{fontSize:12,color:"#e8e8f0",fontWeight:500}}>gunjanck-2</div>
        <div style={{fontSize:10,color:"#555"}}>myshopify.com</div>
      </div>
    </div>
  </aside>
);

export default function App() {
  const [page, setPage] = useState("products");
  const { toasts, add, remove } = useToast();
  return (
    <>
      <FontLoader/>
      <Toasts toasts={toasts} remove={remove}/>
      <div style={{display:"flex",minHeight:"100vh",background:"#0a0a0f",overflowX:"hidden"}}>
        <Sidebar page={page} set={setPage}/>
        <main style={{flex:1,marginLeft:210,width:"calc(100vw - 210px)",maxWidth:"calc(100vw - 210px)",padding:"32px 0",minHeight:"100vh",overflowX:"hidden"}}>
          <div style={{maxWidth:"100%",overflowX:"hidden"}}>
            {page==="products"&&<ProductsPage toast={add}/>}
            {page==="upload"&&<UploadPage toast={add}/>}
            {page==="collections"&&<CollectionsPage/>}
            {page==="inventory"&&<InventoryPage/>}
          </div>
        </main>
      </div>
    </>
  );
}
