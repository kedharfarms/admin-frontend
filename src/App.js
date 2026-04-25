import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LoginPage } from "./components/auth/LoginPage";
import { UserManagement } from "./components/users/UserManagement";
import { InventoryManagement } from "./Pages/InventoryManagement";
import { CouponManagement } from "./Pages/CouponManagement";
import { Layout } from "./components/layout";
import { Outlet, useNavigate } from "react-router-dom";
import { ProductManagement } from "./Pages/ProductManagement";
import { Toaster } from 'react-hot-toast';
import { OrdersView } from "./Pages/OrderManagement";
import { SubscriptionManagement } from "./Pages/SubscriptionManagement";
import OngoingDeliveryManagement from "./Pages/OngoingDeliveryManagement";
import { OrderDetails } from "./Pages/OrderDetails";
import { SubscriptionDetails } from "./Pages/SubscriptionDetails";

// Protected Route
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

const LayoutWrapper = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Strips the leading "/" → "ongoing", "orders", etc.
  const activeTab = location.pathname.split("/")[1];

  return (
    <Layout activeTab={activeTab} onTabChange={(tab) => navigate(`/${tab}`)}>
      <Outlet />
    </Layout>
  );
};

// Login Wrapper
const LoginWrapper = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  if (token) return <Navigate to="/ongoing" replace />;

  return <LoginPage onLogin={() => navigate("/ongoing")} />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route path="/login" element={<LoginWrapper />} />

        {/* Protected */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <LayoutWrapper />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="ongoing" replace />} />
          <Route path="ongoing" element={<OngoingDeliveryManagement />} />
          <Route path="orders" element={<OrdersView />} />
          <Route path="orders/:id" element={<OrderDetails />} />
          <Route path="subscriptions" element={<SubscriptionManagement />} />
          <Route path="subscriptions/:id" element={<SubscriptionDetails />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="inventory" element={<InventoryManagement />} />
          <Route path="coupons" element={<CouponManagement />} />
        </Route>

      </Routes>

      <Toaster position="top-center" />
    </BrowserRouter>
  );
}