import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";

import VehiclePage from "./pages/VehiclePage";
import OrdersPage from "./pages/OrdersPage";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./Auth/PrivateRoute";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import TrackPage from "./pages/TrackPage";
import CustomerLoginPage from "./pages/CustomerLoginPage";
import CustomerRegisterPage from "./pages/CustomerRegisterPage";
import CustomerRecoveryPage from "./pages/CustomerRecoveryPage";
import CustomerAccountPage from "./pages/CustomerAccountPage";

// ✅ WRAPPER TO FORCE RELOAD ON QR CHANGE
function VehiclePageWrapper() {
  const { code } = useParams();
  return <VehiclePage key={code} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔐 Login Page */}
        <Route path="/control-center" element={<LoginPage />} />

        {/* 🔐 Track Page */}
        <Route path="/track" element={<TrackPage />} />

        {/* Customer authentication and account */}
        <Route path="/customer-login" element={<CustomerLoginPage />} />
        <Route path="/customer-register" element={<CustomerRegisterPage />} />
        <Route path="/forgot-username" element={<CustomerRecoveryPage mode="username" />} />
        <Route path="/forgot-password" element={<CustomerRecoveryPage mode="password" />} />
        <Route path="/customer-account" element={<CustomerAccountPage />} />

        {/* 🚗 Public QR page (FIXED) */}
        <Route
    path="/vehicle/:code"
    element={<VehiclePageWrapper />}
/>

 <Route
          path="/v/:code"
          element={<VehiclePage />}
        />

        {/* 🧾 Orders */}
        <Route
    path="/orders"
    element={
        <PrivateRoute>
            <OrdersPage />
        </PrivateRoute>
    }
/>

        {/* 🏠 Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* 🔐 Protected Dashboard */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;