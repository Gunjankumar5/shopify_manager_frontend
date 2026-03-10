import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../api/config";

const MAX_PRODUCT_IMAGES = 10;
const createEmptyImageSlot = () => ({ file: null, preview: "", url: "" });

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    vendor: "",
    product_type: "",
    tags: "",
    status: "all",
    body_html: "",
  });
  const [imageSlots, setImageSlots] = useState([createEmptyImageSlot()]);

  const resetImageSlots = () => {
    setImageSlots([createEmptyImageSlot()]);
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || "");
        const commaIndex = result.indexOf(",");
        resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageSlotChange = (slotIndex, file) => {
    setImageSlots((prev) => {
      const next = [...prev];
      if (!next[slotIndex]) {
        next[slotIndex] = createEmptyImageSlot();
      }

      if (!file) {
        next[slotIndex] = { ...next[slotIndex], file: null, preview: "" };
      } else {
        next[slotIndex] = {
          ...next[slotIndex],
          file,
          preview: URL.createObjectURL(file),
          url: "",
        };
      }

      const hasEmptySlot = next.some(
        (slot) => !slot.file && !slot.preview && !slot.url,
      );
      if (!hasEmptySlot && next.length < MAX_PRODUCT_IMAGES) {
        next.push(createEmptyImageSlot());
      }

      return next.slice(0, MAX_PRODUCT_IMAGES);
    });
  };

  const handleImageUrlChange = (slotIndex, value) => {
    const nextUrl = String(value || "").trim();
    setImageSlots((prev) => {
      const next = [...prev];
      if (!next[slotIndex]) {
        next[slotIndex] = createEmptyImageSlot();
      }

      next[slotIndex] = {
        ...next[slotIndex],
        url: nextUrl,
        file: nextUrl ? null : next[slotIndex].file,
        preview:
          nextUrl ||
          (!nextUrl && next[slotIndex].file ? next[slotIndex].preview : ""),
      };

      const hasEmptySlot = next.some(
        (slot) => !slot.file && !slot.preview && !slot.url,
      );
      if (!hasEmptySlot && next.length < MAX_PRODUCT_IMAGES) {
        next.push(createEmptyImageSlot());
      }

      return next.slice(0, MAX_PRODUCT_IMAGES);
    });
  };

  const removeImageSlot = (slotIndex) => {
    setImageSlots((prev) => {
      const next = prev.filter((_, idx) => idx !== slotIndex);
      const normalized = next.length > 0 ? next : [createEmptyImageSlot()];
      const hasEmptySlot = normalized.some(
        (slot) => !slot.file && !slot.preview && !slot.url,
      );
      if (!hasEmptySlot && normalized.length < MAX_PRODUCT_IMAGES) {
        normalized.push(createEmptyImageSlot());
      }
      return normalized.slice(0, MAX_PRODUCT_IMAGES);
    });
  };

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const query = search ? `?search=${search}` : "";
      const url = query
        ? `${API_BASE_URL}/products/${query}`
        : `${API_BASE_URL}/products`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data.products || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const syncProducts = async () => {
    try {
      setSyncing(true);
      const response = await fetch(`${API_BASE_URL}/products/sync`);
      if (!response.ok) throw new Error("Failed to sync products");
      const data = await response.json();
      setProducts(data.products || []);
      setError(null);
      alert(`✅ Synced ${data.count} products from Shopify!`);
    } catch (err) {
      setError(err.message);
      alert(`❌ Sync failed: ${err.message}`);
      console.error("Error syncing products:", err);
    } finally {
      setSyncing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API_BASE_URL}/products/${editingId}`
        : `${API_BASE_URL}/products`;

      const selectedImageSlots = imageSlots
        .filter((slot) => slot.file || slot.url)
        .slice(0, MAX_PRODUCT_IMAGES);

      const payload = { ...formData };
      if (payload.status === "all") {
        delete payload.status;
      }
      if (selectedImageSlots.length > 0) {
        payload.images = await Promise.all(
          selectedImageSlots.map(async (slot) => {
            if (slot.url) {
              return { src: slot.url };
            }
            return {
              attachment: await fileToBase64(slot.file),
              filename: slot.file.name,
            };
          }),
        );
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save product");

      setFormData({
        title: "",
        vendor: "",
        product_type: "",
        tags: "",
        status: "all",
        body_html: "",
      });
      resetImageSlots();
      setShowNewProductForm(false);
      setEditingId(null);
      await fetchProducts();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete product");
      await fetchProducts();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      title: product.title || "",
      vendor: product.vendor || "",
      product_type: product.product_type || "",
      tags: product.tags ? product.tags.join(", ") : "",
      status: product.status || "all",
      body_html: product.body_html || "",
    });
    const existingImageSlots = (product.images || [])
      .slice(0, MAX_PRODUCT_IMAGES)
      .map((img) => ({
        file: null,
        preview: img?.src || "",
        url: img?.src || "",
      }))
      .filter((slot) => slot.preview || slot.url);
    setImageSlots(
      existingImageSlots.length < MAX_PRODUCT_IMAGES
        ? [...existingImageSlots, createEmptyImageSlot()]
        : existingImageSlots,
    );
    setEditingId(product.id);
    setShowNewProductForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="section-title text-white">Products</h1>
            <p className="section-subtitle text-gray-300">
              Manage and sync your Shopify products
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={syncProducts}
              disabled={syncing}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {syncing ? (
                <>
                  <span className="animate-spin">⏳</span> Syncing...
                </>
              ) : (
                <>
                  <span>🔄</span> Sync from Shopify
                </>
              )}
            </button>
            <button
              onClick={() => {
                setShowNewProductForm(!showNewProductForm);
                setEditingId(null);
                setFormData({
                  title: "",
                  vendor: "",
                  product_type: "",
                  tags: "",
                  status: "all",
                  body_html: "",
                });
                resetImageSlots();
              }}
              className="btn-secondary flex items-center gap-2"
            >
              <span>{showNewProductForm ? "✕" : "+"}</span>{" "}
              {showNewProductForm ? "Cancel" : "Add Product"}
            </button>
          </div>
        </div>

        {error && (
          <div className="alert-error mb-6 animate-fadeIn">{error}</div>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="🔍 Search by title or vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-6 py-3 border-2 border-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all text-white placeholder-gray-400 bg-gray-800"
          />
        </div>

        {/* New Product Form */}
        {showNewProductForm && (
          <div className="card card-hover p-8 mb-8 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingId ? "✏️ Edit Product" : "➕ Add New Product"}
            </h2>
            <form onSubmit={handleSubmit} className="grid gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input
                  type="text"
                  placeholder="Product Title *"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="col-span-2 md:col-span-1"
                />
                <input
                  type="text"
                  placeholder="Vendor"
                  value={formData.vendor}
                  onChange={(e) =>
                    setFormData({ ...formData, vendor: e.target.value })
                  }
                  className="col-span-2 md:col-span-1"
                />
                <input
                  type="text"
                  placeholder="Product Type"
                  value={formData.product_type}
                  onChange={(e) =>
                    setFormData({ ...formData, product_type: e.target.value })
                  }
                  className="col-span-2 md:col-span-1"
                />
                <input
                  type="text"
                  placeholder="Tags (comma-separated)"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  className="col-span-2 md:col-span-1"
                />
              </div>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="all">🌐 All</option>
                <option value="active">🟢 Active</option>
                <option value="draft">📝 Draft</option>
                <option value="archived">📦 Archived</option>
              </select>
              <textarea
                placeholder="Description (HTML optional)"
                value={formData.body_html}
                onChange={(e) =>
                  setFormData({ ...formData, body_html: e.target.value })
                }
                rows={4}
              />
              <div className="rounded-xl border border-slate-600 bg-slate-900 p-4 md:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-lg font-bold">
                    Product Photos
                  </h3>
                  <span className="text-xs text-slate-300">
                    Max {MAX_PRODUCT_IMAGES} images (
                    {
                      imageSlots.filter((s) => s.file || s.preview || s.url)
                        .length
                    }
                    /{MAX_PRODUCT_IMAGES})
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {imageSlots.map((slot, idx) => (
                    <div
                      key={`slot-${idx}`}
                      className="rounded-lg border-2 border-slate-600 p-3 bg-slate-950"
                    >
                      <label className="block text-xs text-slate-200 mb-2 font-semibold">
                        [Image {idx + 1}]
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageSlotChange(
                            idx,
                            e.target.files?.[0] || null,
                          )
                        }
                        className="mb-3"
                      />
                      <input
                        type="text"
                        placeholder="or paste image URL"
                        value={slot.url || ""}
                        onChange={(e) =>
                          handleImageUrlChange(idx, e.target.value)
                        }
                        className="mb-3"
                      />
                      <div className="h-36 rounded-md border-2 border-dashed border-slate-600 bg-slate-900 overflow-hidden flex items-center justify-center">
                        {slot.preview ? (
                          <img
                            src={slot.preview}
                            alt={`Product preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-slate-400">
                            Square image preview
                          </span>
                        )}
                      </div>
                      {(slot.file || slot.preview || slot.url) && (
                        <button
                          type="button"
                          onClick={() => removeImageSlot(idx)}
                          className="mt-3 w-full px-3 py-2 rounded-md text-xs bg-red-700 text-white hover:bg-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn-primary">
                {editingId ? "Update Product" : "Create Product"}
              </button>
            </form>
          </div>
        )}

        {/* Products Grid */}
        <div>
          {products.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-gray-300 text-lg">
                📭 No products found. Add one or sync from Shopify!
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="card card-hover p-6 hover:border-white transition-all"
                >
                  <div className="flex justify-between items-start gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-white">
                          {product.title}
                        </h3>
                        <span
                          className={`badge-${product.status === "active" ? "success" : product.status === "draft" ? "warning" : "danger"}`}
                        >
                          {product.status?.toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        {product.vendor && (
                          <p className="text-sm text-gray-300">
                            <span className="font-semibold text-white">
                              Vendor:
                            </span>{" "}
                            {product.vendor}
                          </p>
                        )}
                        {product.product_type && (
                          <p className="text-sm text-gray-300">
                            <span className="font-semibold text-white">
                              Type:
                            </span>{" "}
                            {product.product_type}
                          </p>
                        )}
                      </div>

                      {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {product.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-white"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="px-4 py-2 text-white font-semibold hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="px-4 py-2 text-white font-semibold hover:bg-red-700 rounded-lg transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
