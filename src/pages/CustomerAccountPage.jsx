import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import api from "../services/api";

export default function CustomerAccountPage() {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    if (!token) {
      navigate("/customer-login", { replace: true });
      return;
    }
    api.get("/customer-auth/me", { headers: { Authorization: "Bearer " + token } })
      .then(response => setAccount(response.data))
      .catch(() => {
        localStorage.removeItem("customerToken");
        localStorage.removeItem("customerUsername");
        localStorage.removeItem("customerEmail");
        setError("Your customer session expired. Please log in again.");
      });
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerUsername");
    localStorage.removeItem("customerEmail");
    navigate("/customer-login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-900 to-purple-900 text-white">
      <Navbar showOrderButton={false} showTrackButton={false} />
      <main className="min-h-screen flex items-center justify-center px-4 pt-24 pb-10">
        <section className="w-full max-w-lg rounded-2xl bg-white p-8 text-gray-900 shadow-2xl">
          <h1 className="text-2xl font-bold">Your OwnTag Account</h1>
          {error && <p role="alert" className="mt-4 rounded-lg bg-red-100 text-red-700 p-3">{error}</p>}
          {!account && !error && <p className="mt-4 text-gray-600">Loading your account…</p>}
          {account && <>
            <p className="mt-4">Welcome, <strong>{account.username}</strong>.</p>
            <p className="mt-2 text-gray-600">Verified email: {account.email}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/track" className="rounded-lg bg-orange-600 px-4 py-2 text-white font-semibold">Track an order</Link>
              <button onClick={logout} className="rounded-lg border px-4 py-2 font-semibold">Log out</button>
            </div>
          </>}
        </section>
      </main>
    </div>
  );
}
