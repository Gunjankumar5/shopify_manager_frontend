import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../api/config";
import { Ico, Spin } from "../components/Icons"; // adjust path as needed

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingCollectionId, setEditingCollectionId] = useState(null);
  const [deletingCollectionId, setDeletingCollectionId] = useState(null);
  const [formData, setFormData] = useState({ title: "", body_html: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [editFormData, setEditFormData] = useState({
    title: "",
    body_html: "",
  });
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState("");

  const getCollectionImageSrc = (collection) => collection?.image?.src || "";

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/collections/`);
      if (!response.ok) throw new Error("Failed to fetch collections");
      const data = await response.json();
      setCollections(data.custom_collections || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchFromShopify = async () => {
    try {
      setRefreshing(true);
      await fetchCollections();
    } finally {
      setRefreshing(false);
    }
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

  const buildPayloadWithImage = async (basePayload, selectedFile) => {
    const payload = { ...basePayload };
    if (selectedFile) {
      const attachment = await fileToBase64(selectedFile);
      payload.image = { attachment, filename: selectedFile.name };
    }
    return payload;
  };

  const handleCreateImageChange = (e) => {
    const selected = e.target.files?.[0] || null;
    setImageFile(selected);
    setImagePreview(selected ? URL.createObjectURL(selected) : "");
  };

  const handleEditImageChange = (e) => {
    const selected = e.target.files?.[0] || null;
    setEditImageFile(selected);
    setEditImagePreview(selected ? URL.createObjectURL(selected) : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedTitle = formData.title.trim().toLowerCase();
    if (
      collections.some(
        (item) => (item.title || "").trim().toLowerCase() === normalizedTitle,
      )
    ) {
      alert("A collection with this title already exists.");
      return;
    }
    try {
      setSaving(true);
      const payload = await buildPayloadWithImage(formData, imageFile);
      const response = await fetch(`${API_BASE_URL}/collections/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to create collection");
      setFormData({ title: "", body_html: "" });
      setImageFile(null);
      setImagePreview("");
      setShowNewForm(false);
      await fetchCollections();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (collection) => {
    setEditingCollectionId(collection.id);
    setEditFormData({
      title: collection.title || "",
      body_html: collection.body_html || "",
    });
    setEditImageFile(null);
    setEditImagePreview(collection.image?.src || "");
  };

  const cancelEdit = () => {
    setEditingCollectionId(null);
    setEditFormData({ title: "", body_html: "" });
    setEditImageFile(null);
    setEditImagePreview("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const normalizedTitle = editFormData.title.trim().toLowerCase();
    if (
      collections.some(
        (item) =>
          item.id !== editingCollectionId &&
          (item.title || "").trim().toLowerCase() === normalizedTitle,
      )
    ) {
      alert("A collection with this title already exists.");
      return;
    }
    try {
      setSaving(true);
      const payload = await buildPayloadWithImage(editFormData, editImageFile);
      const response = await fetch(
        `${API_BASE_URL}/collections/${editingCollectionId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) throw new Error("Failed to update collection");
      cancelEdit();
      await fetchCollections();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (collection) => {
    if (!window.confirm(`Delete collection "${collection.title}"?`)) return;
    try {
      setDeletingCollectionId(collection.id);
      const response = await fetch(
        `${API_BASE_URL}/collections/${collection.id}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) throw new Error("Failed to delete collection");
      await fetchCollections();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setDeletingCollectionId(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-8">
        <div className="card p-12 text-center">
          <Spin size="xl" />
          <p className="text-muted mt-4">Loading collections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary p-8">
      <div className="container max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-primary flex items-center gap-2">
              <Ico n="collections" size="lg" /> Collections
            </h1>
            <p className="text-muted text-sm">
              Organize products into custom collections
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleFetchFromShopify}
              disabled={loading || refreshing}
              className="btn btn-secondary"
            >
              {refreshing ? <Spin size="sm" /> : <Ico n="upload" size="sm" />}
              <span>{refreshing ? "Syncing..." : "Sync from Shopify"}</span>
            </button>
            <button
              onClick={() => setShowNewForm(!showNewForm)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Ico n={showNewForm ? "x" : "plus"} size="sm" />
              {showNewForm ? "Cancel" : "New Collection"}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-danger-light text-danger p-4 rounded-lg mb-6 flex items-center gap-2">
            <Ico n="alert-circle" size="sm" /> {error}
          </div>
        )}

        {/* New Collection Form */}
        {showNewForm && (
          <div className="card card-hover p-6 mb-8 fade-up">
            <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
              <Ico n="plus" size="md" /> Create New Collection
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Collection Title *"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="field-input w-full"
              />
              <textarea
                placeholder="Description (HTML optional)"
                value={formData.body_html}
                onChange={(e) =>
                  setFormData({ ...formData, body_html: e.target.value })
                }
                rows={4}
                className="field-input w-full"
              />
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Collection Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCreateImageChange}
                  className="field-input w-full py-2"
                />
                <div className="mt-3 w-full max-w-sm h-48 rounded-lg border border-strong bg-secondary overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted gap-2">
                      <Ico n="image" size="xl" />
                      <span className="text-xs">No image selected</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary w-full"
              >
                {saving ? <Spin size="sm" /> : <Ico n="check" size="sm" />}
                {saving ? "Creating..." : "Create Collection"}
              </button>
            </form>
          </div>
        )}

        {/* Edit Collection Form */}
        {editingCollectionId && (
          <div className="card card-hover p-6 mb-8 fade-up">
            <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
              <Ico n="edit" size="md" /> Edit Collection
            </h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input
                type="text"
                placeholder="Collection Title *"
                required
                value={editFormData.title}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, title: e.target.value })
                }
                className="field-input w-full"
              />
              <textarea
                placeholder="Description (HTML optional)"
                value={editFormData.body_html}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    body_html: e.target.value,
                  })
                }
                rows={4}
                className="field-input w-full"
              />
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Collection Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageChange}
                  className="field-input w-full py-2"
                />
                <div className="mt-3 w-full max-w-sm h-48 rounded-lg border border-strong bg-secondary overflow-hidden">
                  {editImagePreview ? (
                    <img
                      src={editImagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted gap-2">
                      <Ico n="image" size="xl" />
                      <span className="text-xs">No image</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary flex-1"
                >
                  {saving ? <Spin size="sm" /> : <Ico n="check" size="sm" />}
                  {saving ? "Saving..." : "Update Collection"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Collections Grid */}
        {collections.length === 0 ? (
          <div className="card p-12 text-center">
            <Ico n="collections" size="xl" className="text-muted mb-3" />
            <p className="text-secondary">
              No collections found. Create one to get started!
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {collections.map((collection) => (
              <div key={collection.id} className="card card-hover p-6">
                <div className="flex flex-md:flex-row gap-6">
                  {/* Image */}
                  <div className="w-full md:w-48 h-48 rounded-lg border border-strong bg-secondary overflow-hidden flex-shrink-0">
                    {getCollectionImageSrc(collection) ? (
                      <img
                        src={getCollectionImageSrc(collection)}
                        alt={collection.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted gap-2">
                        <Ico n="image" size="xl" />
                        <span className="text-xs">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-display text-lg font-bold text-primary">
                        {collection.title}
                      </h3>
                      <span className="badge badge-accent text-xs">
                        {collection.collection_type?.toUpperCase() || "CUSTOM"}
                      </span>
                    </div>

                    {collection.body_html && (
                      <div
                        className="text-secondary text-sm mb-4 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: collection.body_html,
                        }}
                      />
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted mb-4">
                      <span>ID:</span>
                      <code className="bg-secondary px-2 py-1 rounded border border-subtle">
                        {collection.id}
                      </code>
                    </div>

                    {collection.collection_type === "custom" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(collection)}
                          className="btn btn-secondary btn-sm"
                        >
                          <Ico n="edit" size="xs" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(collection)}
                          disabled={deletingCollectionId === collection.id}
                          className="btn btn-danger btn-sm"
                        >
                          {deletingCollectionId === collection.id ? (
                            <Spin size="xs" />
                          ) : (
                            <Ico n="trash" size="xs" />
                          )}
                          Delete
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-muted">
                        Smart collections are read-only here.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
