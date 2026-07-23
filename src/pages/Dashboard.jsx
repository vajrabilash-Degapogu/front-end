import { useState } from "react";
import OrdersPage from "./OrdersPage";
import "../css/Dashboard.css";
import TagsSheetsPage from "./TagsSheetsPage";
import CustomersPage from "./CustomersPage";
// import AdminPage from "../pages/AdminPage"; // ✅ ADD THIS
import DashboardHome from "./DashBoardHome";
import { useNavigate } from "react-router-dom";

function Dashboard() {

  const [page, setPage] = useState("orders");
  const navigate = useNavigate();

  return (
    <div className="dashboard">

      {/* Sidebar */}
      <div className="sidebar">
        <h2>🚗 OwnTag</h2>

        <button onClick={() => setPage("orders")}>📦 Orders</button>
        <button onClick={() => setPage("tags")}>
        🏷️ Tags & Sheets
        </button>
        <button onClick={() => setPage("customers")}>👥 Customers</button>
         <button
  className="logout-btn"
  onClick={() => {
    localStorage.removeItem("token");
localStorage.removeItem("username");
navigate("/");
  }}
>
  🚪 Logout
</button>
        <DashboardHome />
      </div>

      

      {/* Content */}
      <div className="content">
        {page === "orders" && <OrdersPage />}
        {page === "tags" && <TagsSheetsPage />}
        {page === "customers" && <CustomersPage />}
        
       
      </div>

    </div>
  );
}

export default Dashboard;