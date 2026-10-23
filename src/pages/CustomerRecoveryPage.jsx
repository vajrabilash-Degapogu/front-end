import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/NavBar";
import api from "../services/api";

const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

export default function CustomerRecoveryPage({ mode = "password" }) {
  const isUsername = mode === "username";
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const base = isUsername ? "/customer-auth/forgot-username" : "/customer-auth/forgot-password";

  const sendOtp = async () => {
    setError(""); setMessage("");
    if (!validEmail(email)) { setError("Enter a valid email address."); return; }
    setLoading(true);
    try {
      await api.post(base + "/send-otp", { email: email.trim().toLowerCase() });
      setOtpSent(true);
      setMessage("If you can access this email, a verification code should arrive shortly. Check spam too.");
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || "Could not send OTP. Check the email service configuration.");
    } finally { setLoading(false); }
  };

  const submit = async event => {
    event.preventDefault(); setError(""); setMessage("");
    if (!otpSent) { setError("Request an OTP first."); return; }
    if (!/^[0-9]{6}$/.test(otp)) { setError("Enter the six-digit OTP."); return; }
    if (!isUsername && (newPassword.length < 8 || newPassword.length > 72)) { setError("Password must be 8-72 characters."); return; }
    setLoading(true);
    try {
      if (isUsername) {
        const response = await api.post(base + "/verify-otp", { email: email.trim().toLowerCase(), otp });
        setMessage(response.data.message);
        setOtpSent(false);
        setOtp("");
      } else {
        const response = await api.post(base + "/reset", { email: email.trim().toLowerCase(), otp, newPassword });
        setMessage(response.data.message);
        setOtp("");
        setNewPassword("");
        setOtpSent(false);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || (isUsername ? "OTP verification failed." : "Password reset failed."));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-900 to-purple-900 text-white">
      <Navbar showOrderButton={false} showTrackButton={false} />
      <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-10">
        <form onSubmit={submit} className="w-full max-w-md bg-white text-gray-900 rounded-2xl shadow-2xl p-7 space-y-4">
          <h1 className="text-2xl font-bold text-center">{isUsername ? "Forgot Username" : "Forgot Password"}</h1>
          <p className="text-sm text-gray-600 text-center">We will verify access to your registered email.</p>
          {error && <p role="alert" className="rounded-lg bg-red-100 text-red-700 p-3 text-sm">{error}</p>}
          {message && <p role="status" className="rounded-lg bg-green-100 text-green-800 p-3 text-sm">{message}</p>}
          <label className="block text-sm font-semibold">Registered email address
            <input type="email" autoComplete="email" value={email} onChange={e => { setEmail(e.target.value); setOtpSent(false); setOtp(""); }} className="mt-1 w-full rounded-lg border p-3 font-normal" required />
          </label>
          <button type="button" onClick={sendOtp} disabled={loading} className="w-full rounded-lg border border-indigo-600 text-indigo-700 font-semibold p-3 disabled:opacity-60">{loading ? "Please wait…" : "Send email OTP"}</button>
          {otpSent && <>
            <label className="block text-sm font-semibold">6-digit OTP
              <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} className="mt-1 w-full rounded-lg border p-3 font-normal" inputMode="numeric" maxLength={6} required />
            </label>
            {!isUsername && <label className="block text-sm font-semibold">New password
              <input type="password" autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 w-full rounded-lg border p-3 font-normal" minLength={8} maxLength={72} required />
            </label>}
            <button disabled={loading} className="w-full rounded-lg bg-orange-600 text-white font-semibold p-3 disabled:opacity-60">{isUsername ? "Verify and email my username" : "Reset password"}</button>
          </>}
          <p className="text-center text-sm"><Link className="text-indigo-700 font-semibold hover:underline" to="/customer-login">Back to customer login</Link></p>
        </form>
      </div>
    </div>
  );
}
