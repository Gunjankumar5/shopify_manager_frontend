import { useState } from "react";
import GlobalStyles from "./components/GlobalStyles";
import { useToast, Toasts } from "./components/Toast";
import Sidebar from "./components/Sidebar";
import ProductsPage from "./pages/ProductsPage";
import UploadPage from "./pages/UploadPage";
import CollectionsPage from "./pages/CollectionsPage";
import InventoryPage from "./pages/InventoryPage";
import ExportPage from "./pages/ExportPage";

export default function App() {
  const [page, setPage] = useState("products");
  const { toasts, add, remove } = useToast();
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
        <Sidebar page={page} setPage={setPage} />
        <main
          style={{
            flex: 1,
            marginLeft: 220,
            width: "calc(100vw - 220px)",
            padding: "32px 0",
            minHeight: "100vh",
          }}
        >
          {page === "products" && <ProductsPage toast={add} />}
          {page === "upload" && <UploadPage toast={add} />}
          {page === "collections" && <CollectionsPage />}
          {page === "inventory" && <InventoryPage />}
          {page === "export" && <ExportPage toast={add} />}
        </main>
      </div>
    </>
  );
}
