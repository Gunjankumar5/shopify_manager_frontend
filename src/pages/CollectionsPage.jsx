import { useEffect, useState } from "react";
import { API_ENDPOINTS, fetchJson } from "../api/config";

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchJson(API_ENDPOINTS.collections);
        const items = Array.isArray(data)
          ? data
          : data.custom_collections || data.collections || [];
        setCollections(items);
      } catch (e) {
        console.error("Failed to fetch collections:", e);
        setError("Failed to fetch collections");
      }
    };

    load();
  }, []);

  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Collections</h2>
      <ul>
        {collections.map((c) => (
          <li key={c.id}>{c.title}</li>
        ))}
      </ul>
    </div>
  );
}