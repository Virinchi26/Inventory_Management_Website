import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Invoices from "./scenes/invoices";
import Products from "./scenes/product_list";
import Bar from "./scenes/bar";
import Form from "./scenes/form";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import EditProduct from "./scenes/edit_product";
import Geography from "./scenes/geography";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import LowStock from "./scenes/low_stock";
import WearhouseHandle from "./scenes/wearhouse";
import WarehouseStock from "./scenes/wearhouse_stock";
import TransferStock from "./scenes/transfer_stock";
import AddLocation from "./scenes/add_locations";
import StockAuditForm from "./scenes/stock_audit";
import LoginPage from "./scenes/auth/login";
import SignUpPage from "./scenes/auth/register";
import POSPage from "./scenes/point_of_sale";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/";

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          {/* Hide sidebar on login page */}
          {!isAuthPage && <Sidebar isSidebar={isSidebar} />}

          <main className="content">
            {/* Hide topbar on login page */}
            {!isAuthPage && <Topbar setIsSidebar={setIsSidebar} />}

            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<SignUpPage />} />

              <Route path="/" element={<LoginPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/team" element={<Team />} />
              <Route path="/products" element={<Products />} />
              <Route path="/low-stock" element={<LowStock />} />
              <Route path="/edit-product/:id" element={<EditProduct />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/form" element={<Form />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/bar" element={<Bar />} />
              <Route path="/pie" element={<Pie />} />
              <Route path="/line" element={<Line />} />
              <Route path="/geography" element={<Geography />} />
              <Route
                path="/add-product-location"
                element={
                  <PrivateRoute>
                    <WearhouseHandle />
                  </PrivateRoute>
                }
              />
              <Route
                path="/add-locations"
                element={
                  <PrivateRoute>
                    <AddLocation />
                  </PrivateRoute>
                }
              />
              <Route
                path="/warehouse-stock"
                element={
                  <PrivateRoute>
                    <WarehouseStock />
                  </PrivateRoute>
                }
              />
              <Route
                path="/transfer-stock"
                element={
                  <PrivateRoute>
                    <TransferStock />
                  </PrivateRoute>
                }
              />
              <Route
                path="/stock-audit"
                element={
                  <PrivateRoute>
                    <StockAuditForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/point-of-sale"
                element={
                  <PrivateRoute>
                    <POSPage />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
