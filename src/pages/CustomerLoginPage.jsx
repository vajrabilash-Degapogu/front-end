import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import api from "../services/api";

export default function CustomerLoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async (event) => {
    event.preventDefault();
    setError("");
    if (!identifier.trim() || !password) {
      setError("Enter your username or email and password.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/customer-auth/login", {
        identifier: identifier.trim(),
        password
      });
      localStorage.setItem("customerToken", response.data.token);
      localStorage.setItem("customerUsername", response.data.username);
      localStorage.setItem("customerEmail", response.data.email);
      navigate("/customer-account");
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || "Unable to sign in. Check your username/email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-900 to-purple-900 text-white">
      <Navbar showOrderButton={false} showTrackButton={false} />
      <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-10">
        <form onSubmit={login} className="w-full max-w-md bg-white text-gray-900 rounded-2xl shadow-2xl p-7 space-y-4">
          <h1 className="text-2xl font-bold text-center">Customer Login</h1>
          <p className="text-sm text-gray-600 text-center">Sign in to your OwnTag customer account.</p>
          {error && <p role="alert" className="rounded-lg bg-red-100 text-red-700 p-3 text-sm">{error}</p>}
          <label className="block text-sm font-semibold">Username or email
            <input autoComplete="username" value={identifier} onChange={e => setIdentifier(e.target.value)} className="mt-1 w-full rounded-lg border p-3 font-normal" required />
          </label>
          <label className="block text-sm font-semibold">Password
            <input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border p-3 font-normal" required />
          </label>
          <button disabled={loading} className="w-full rounded-lg bg-orange-600 text-white font-semibold p-3 disabled:opacity-60">{loading ? "Signing in…" : "Login"}</button>
          <div className="flex flex-col gap-2 text-sm text-center">
            <Link className="text-indigo-700 hover:underline" to="/forgot-username">Forgot username?</Link>
            <Link className="text-indigo-700 hover:underline" to="/forgot-password">Forgot password?</Link>
            <p>New to OwnTag? <Link className="font-semibold text-indigo-700 hover:underline" to="/customer-register">Register</Link></p>
            <Link className="text-gray-500 hover:underline" to="/control-center">Admin login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
