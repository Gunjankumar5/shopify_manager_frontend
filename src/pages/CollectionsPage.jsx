import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../api/config';

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingCollectionId, setEditingCollectionId] = useState(null);
  const [deletingCollectionId, setDeletingCollectionId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    body_html: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [editFormData, setEditFormData] = useState({
    title: '',
    body_html: ''
  });
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState('');

  const getCollectionImageSrc = (collection) => collection?.image?.src || '';

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/collections/`);
      if (!response.ok) throw new Error('Failed to fetch collections');
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
        const result = String(reader.result || '');
        const commaIndex = result.indexOf(',');
        resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const buildPayloadWithImage = async (basePayload, selectedFile) => {
    const payload = { ...basePayload };
    if (selectedFile) {
      const attachment = await fileToBase64(selectedFile);
      payload.image = {
        attachment,
        filename: selectedFile.name
      };
    }
    return payload;
  };

  const handleCreateImageChange = (e) => {
    const selected = e.target.files?.[0] || null;
    setImageFile(selected);
    if (selected) {
      setImagePreview(URL.createObjectURL(selected));
    } else {
      setImagePreview('');
    }
  };

  const handleEditImageChange = (e) => {
    const selected = e.target.files?.[0] || null;
    setEditImageFile(selected);
    if (selected) {
      setEditImagePreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedTitle = formData.title.trim().toLowerCase();
    const duplicate = collections.some(
      (item) => (item.title || '').trim().toLowerCase() === normalizedTitle
    );

    if (duplicate) {
      alert('A collection with this title already exists.');
      return;
    }

    try {
      setSaving(true);
      const payload = await buildPayloadWithImage(formData, imageFile);
      const response = await fetch(`${API_BASE_URL}/collections/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to create collection');
      
      setFormData({ title: '', body_html: '' });
      setImageFile(null);
      setImagePreview('');
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
      title: collection.title || '',
      body_html: collection.body_html || ''
    });
    setEditImageFile(null);
    setEditImagePreview(collection.image?.src || '');
  };

  const cancelEdit = () => {
    setEditingCollectionId(null);
    setEditFormData({ title: '', body_html: '' });
    setEditImageFile(null);
    setEditImagePreview('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const normalizedTitle = editFormData.title.trim().toLowerCase();
    const duplicate = collections.some(
      (item) =>
        item.id !== editingCollectionId &&
        (item.title || '').trim().toLowerCase() === normalizedTitle
    );

    if (duplicate) {
      alert('A collection with this title already exists.');
      return;
    }

    try {
      setSaving(true);
      const payload = await buildPayloadWithImage(editFormData, editImageFile);
      const response = await fetch(`${API_BASE_URL}/collections/${editingCollectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to update collection');

      cancelEdit();
      await fetchCollections();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (collection) => {
    if (!window.confirm(`Delete collection "${collection.title}"?`)) {
      return;
    }

    try {
      setDeletingCollectionId(collection.id);
      const response = await fetch(`${API_BASE_URL}/collections/${collection.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete collection');

      await fetchCollections();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setDeletingCollectionId(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 flex items-center justify-center">
      <div className="card p-12 text-center">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className="text-white font-medium">Loading collections...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="section-title">📚 Collections</h1>
            <p className="section-subtitle">Organize products into custom collections</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleFetchFromShopify}
              disabled={loading || refreshing}
              className="btn-secondary px-4 py-2 rounded-lg border border-slate-500 bg-slate-800 text-white font-medium hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {refreshing ? 'Fetching...' : 'Fetch from Shopify'}
            </button>
            <button
              onClick={() => setShowNewForm(!showNewForm)}
              className="btn-primary flex items-center gap-2"
            >
              <span>{showNewForm ? '✕' : '+'}</span> {showNewForm ? 'Cancel' : 'New Collection'}
            </button>
          </div>
        </div>

        {error && <div className="alert-error mb-6 animate-fadeIn">{error}</div>}

        {/* New Collection Form */}
        {showNewForm && (
          <div className="card card-hover p-8 mb-8 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white mb-6">➕ Create New Collection</h2>
            <form onSubmit={handleSubmit} className="grid gap-5">
              <input
                type="text"
                placeholder="Collection Title *"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
              <textarea
                placeholder="Description (HTML optional)"
                value={formData.body_html}
                onChange={(e) => setFormData({...formData, body_html: e.target.value})}
                rows={4}
              />
              <div className="grid gap-3">
                <label className="text-sm text-white font-semibold">Collection Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCreateImageChange}
                />
                <div className="w-full max-w-sm h-48 rounded-xl border-2 border-slate-600 bg-slate-900 overflow-hidden shadow-md">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Collection preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 font-medium">No image selected</div>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
              >
                {saving ? 'Saving...' : 'Create Collection'}
              </button>
            </form>
          </div>
        )}

        {editingCollectionId && (
          <div className="card card-hover p-8 mb-8 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white mb-6">✏️ Edit Collection</h2>
            <form onSubmit={handleUpdate} className="grid gap-5">
              <input
                type="text"
                placeholder="Collection Title *"
                required
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              />
              <textarea
                placeholder="Description (HTML optional)"
                value={editFormData.body_html}
                onChange={(e) => setEditFormData({ ...editFormData, body_html: e.target.value })}
                rows={4}
              />
              <div className="grid gap-3">
                <label className="text-sm text-white font-semibold">Collection Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageChange}
                />
                <div className="w-full max-w-sm h-48 rounded-xl border-2 border-slate-600 bg-slate-900 overflow-hidden shadow-md">
                  {editImagePreview ? (
                    <img
                      src={editImagePreview}
                      alt="Collection preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 font-medium">No image selected</div>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? 'Saving...' : 'Update Collection'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="btn-secondary px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Collections Grid */}
        <div>
          {collections.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-white text-lg">📭 No collections found. Create one to get started!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className="card card-hover p-6 hover:shadow-lg transition-all"
                >
                  <div className="relative w-full h-56 rounded-xl border-2 border-slate-700 bg-slate-900 overflow-hidden mb-4 shadow-lg">
                    {getCollectionImageSrc(collection) ? (
                      <img
                        src={getCollectionImageSrc(collection)}
                        alt={collection.title || 'Collection image'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 font-semibold">No collection image</div>
                    )}
                    <div className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-black/70 text-white border border-white/20">Image</div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{collection.title}</h3>

                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-slate-800 text-white border border-slate-600">
                      {(collection.collection_type || 'custom').toUpperCase()}
                    </span>
                    {collection.collection_type === 'custom' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(collection)}
                          className="btn-secondary px-3 py-1 rounded text-xs"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(collection)}
                          disabled={deletingCollectionId === collection.id}
                          className="px-3 py-1 rounded text-xs bg-red-700 text-white border border-red-800 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {deletingCollectionId === collection.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-300">Smart collections are read-only here.</span>
                    )}
                  </div>
                  
                  {collection.body_html && (
                    <div
                      className="text-white mb-4 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: collection.body_html }}
                    />
                  )}
                  
                  <div className="flex items-center gap-2 text-xs text-white border-t border-slate-700 pt-3 mt-3">
                    <span className="font-semibold">Collection ID:</span> 
                    <code className="bg-slate-800 text-white px-2 py-1 rounded font-mono">{collection.id}</code>
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
