import { useEffect, useState } from "react";
import GlobalStyles from "./components/GlobalStyles";
import { useToast, Toasts } from "./components/Toast";
import Sidebar from "./components/Sidebar";
import ProductsPage from "./pages/ProductsPage";
import UploadPage from "./pages/UploadPage";
import CollectionsPage from "./pages/CollectionsPage";
import InventoryPage from "./pages/InventoryPage";
import ConnectStore from "./pages/ConnectStore";
import ExportPage from "./pages/ExportPage";

export default function App() {
  const [page, setPage] = useState("products");
  const [activeStore, setActiveStore] = useState(null);
  const [pageKey, setPageKey] = useState(0);
  const { toasts, add, remove } = useToast();

  useEffect(() => {
    const handler = () => setPageKey((k) => k + 1);
    window.addEventListener("store-switched", handler);
    return () => window.removeEventListener("store-switched", handler);
  }, []);

  const handleStoreConnected = (data) => {
    setActiveStore({
      shop_key: data.shop_key,
      shop_name: data.shop_name,
      shop: data.shop,
      is_active: true,
    });
    add(`Connected to ${data.shop_name || data.shop}!`, "success");
    setPage("products");
    setPageKey((k) => k + 1);
  };

  return (
    <>
      <GlobalStyles />
      <Toasts toasts={toasts} remove={remove} />

      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "var(--bg-primary)",
          overflowX: "hidden",
        }}
      >
        <Sidebar
          page={page}
          setPage={setPage}
          activeStore={activeStore}
          setActiveStore={setActiveStore}
        />

        <main
          style={{
            flex: 1,
            marginLeft: 220,
            width: "calc(100vw - 220px)",
            padding: "32px 0",
            minHeight: "100vh",
          }}
        >
          {page === "products" && <ProductsPage key={`products-${pageKey}`} toast={add} />}
          {page === "upload" && <UploadPage key={`upload-${pageKey}`} toast={add} />}
          {page === "collections" && <CollectionsPage key={`collections-${pageKey}`} />}
          {page === "inventory" && <InventoryPage key={`inventory-${pageKey}`} />}
          {page === "export" && (
            <ExportPage key={`export-${pageKey}`} toast={add} activeStore={activeStore} />
          )}
          {page === "connect" && <ConnectStore onConnected={handleStoreConnected} />}
        </main>
      </div>
    </>
  );
}
