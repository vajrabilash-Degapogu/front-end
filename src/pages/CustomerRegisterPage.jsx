import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import api from "../services/api";

const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

export default function CustomerRegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendOtp = async () => {
    setError(""); setMessage("");
    if (!validEmail(email)) { setError("Enter a valid email address."); return; }
    setLoading(true);
    try {
      await api.post("/customer-auth/register/send-otp", { email: email.trim().toLowerCase() });
      setOtpSent(true);
      setVerifiedEmail("");
      setMessage("OTP sent. Check your inbox and spam folder.");
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || "Could not send OTP. Check the email service configuration.");
    } finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    setError(""); setMessage("");
    if (!/^[0-9]{6}$/.test(otp)) { setError("Enter the six-digit OTP."); return; }
    setLoading(true);
    try {
      await api.post("/customer-auth/register/verify-otp", { email: email.trim().toLowerCase(), otp });
      setVerifiedEmail(email.trim().toLowerCase());
      setMessage("Email verified. You can create your account now.");
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || "OTP verification failed.");
    } finally { setLoading(false); }
  };

  const register = async event => {
    event.preventDefault(); setError(""); setMessage("");
    if (!/^[A-Za-z0-9._-]{3,30}$/.test(username.trim())) { setError("Username must be 3-30 letters, numbers, dots, underscores or hyphens."); return; }
    if (!validEmail(email)) { setError("Enter a valid email address."); return; }
    if (verifiedEmail !== email.trim().toLowerCase()) { setError("Verify this email address before registering."); return; }
    if (password.length < 8 || password.length > 72) { setError("Password must be 8-72 characters."); return; }
    setLoading(true);
    try {
      const response = await api.post("/customer-auth/register", { username: username.trim(), email: email.trim().toLowerCase(), password });
      localStorage.setItem("customerToken", response.data.token);
      localStorage.setItem("customerUsername", response.data.username);
      localStorage.setItem("customerEmail", response.data.email);
      navigate("/customer-account");
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || "Could not create account.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-900 to-purple-900 text-white">
      <Navbar showOrderButton={false} showTrackButton={false} />
      <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-10">
        <form onSubmit={register} className="w-full max-w-md bg-white text-gray-900 rounded-2xl shadow-2xl p-7 space-y-4">
          <h1 className="text-2xl font-bold text-center">Create Customer Account</h1>
          <p className="text-sm text-gray-600 text-center">Verify your email to register.</p>
          {error && <p role="alert" className="rounded-lg bg-red-100 text-red-700 p-3 text-sm">{error}</p>}
          {message && <p role="status" className="rounded-lg bg-green-100 text-green-800 p-3 text-sm">{message}</p>}
          <label className="block text-sm font-semibold">Username
            <input autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} className="mt-1 w-full rounded-lg border p-3 font-normal" minLength={3} maxLength={30} required />
          </label>
          <label className="block text-sm font-semibold">Email address
            <input type="email" autoComplete="email" value={email} onChange={e => { setEmail(e.target.value); setVerifiedEmail(""); }} className="mt-1 w-full rounded-lg border p-3 font-normal" required />
          </label>
          <button type="button" onClick={sendOtp} disabled={loading} className="w-full rounded-lg border border-indigo-600 text-indigo-700 font-semibold p-3 disabled:opacity-60">{loading ? "Please wait…" : "Send email OTP"}</button>
          {otpSent && verifiedEmail !== email.trim().toLowerCase() && <div className="flex gap-2">
            <input aria-label="Email OTP" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} className="min-w-0 flex-1 rounded-lg border p-3" placeholder="6-digit OTP" inputMode="numeric" maxLength={6} />
            <button type="button" onClick={verifyOtp} disabled={loading} className="rounded-lg bg-indigo-700 px-4 text-white font-semibold disabled:opacity-60">Verify</button>
          </div>}
          {verifiedEmail === email.trim().toLowerCase() && <p className="text-green-700 font-semibold text-sm">✓ Email verified</p>}
          <label className="block text-sm font-semibold">Password
            <input type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border p-3 font-normal" minLength={8} maxLength={72} required />
          </label>
          <button disabled={loading || verifiedEmail !== email.trim().toLowerCase()} className="w-full rounded-lg bg-orange-600 text-white font-semibold p-3 disabled:opacity-50">{loading ? "Please wait…" : "Register"}</button>
          <p className="text-center text-sm">Already registered? <Link className="text-indigo-700 font-semibold hover:underline" to="/customer-login">Login</Link></p>
        </form>
      </div>
    </div>
  );
}
