import { useEffect, useMemo, useState } from "react";
import GlobalStyles from "./components/GlobalStyles";
import { useToast, Toasts } from "./components/Toast";
import Sidebar from "./components/Sidebar";
import { Ico } from "./components/Icons";
import ProductsPage from "./pages/ProductsPage";
import UploadPage from "./pages/UploadPage";
import CollectionsPage from "./pages/CollectionsPage";
import InventoryPage from "./pages/InventoryPage";
import ConnectStore from "./pages/ConnectStore";
import ExportPage from "./pages/ExportPage";

export default function App() {
  const [page, setPage] = useState("products");
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 1024);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeStore, setActiveStore] = useState(null);
  const [pageKey, setPageKey] = useState(0);
  const { toasts, add, remove } = useToast();

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const handler = () => setPageKey((k) => k + 1);
    window.addEventListener("store-switched", handler);
    return () => window.removeEventListener("store-switched", handler);
  }, []);

  const pageTitle = useMemo(() => {
    const labels = {
      products: "Products",
      upload: "Upload",
      collections: "Collections",
      inventory: "Inventory",
      export: "Export",
    };
    return labels[page] || "Dashboard";
  }, [page]);

  const handleSetPage = (nextPage) => {
    setPage(nextPage);
    if (isMobile) setIsSidebarOpen(false);
  };

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
      <div className="app-shell">
        <Sidebar
          page={page}
          setPage={handleSetPage}
          isMobile={isMobile}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeStore={activeStore}
          setActiveStore={setActiveStore}
        />
        {isMobile && isSidebarOpen && (
          <button
            type="button"
            className="app-sidebar-backdrop"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close navigation"
          />
        )}
        <main className="app-main">
          {isMobile && (
            <header className="app-mobile-header">
              <button
                type="button"
                className="app-mobile-menu-btn"
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                aria-label="Toggle navigation"
              >
                <Ico n="menu" size={18} />
              </button>
              <h1>{pageTitle}</h1>
            </header>
          )}

          {page === "products" && (
            <ProductsPage key={`products-${pageKey}`} toast={add} />
          )}
          {page === "upload" && (
            <UploadPage key={`upload-${pageKey}`} toast={add} />
          )}
          {page === "collections" && (
            <CollectionsPage key={`collections-${pageKey}`} />
          )}
          {page === "inventory" && (
            <InventoryPage key={`inventory-${pageKey}`} />
          )}
          {page === "export" && (
            <ExportPage
              key={`export-${pageKey}`}
              toast={add}
              activeStore={activeStore}
            />
          )}
          {page === "connect" && (
            <ConnectStore onConnected={handleStoreConnected} />
          )}
        </main>
      </div>
    </>
  );
}
