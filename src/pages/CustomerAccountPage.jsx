import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import api from "../services/api";

export default function CustomerAccountPage() {
  const [account, setAccount] = useState(null);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [error, setError] = useState("");
  const [tagsError, setTagsError] = useState("");
  const [reorderTarget, setReorderTarget] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [reorderBusy, setReorderBusy] = useState(false);
  const [reorderError, setReorderError] = useState("");
  const [reorderMessage, setReorderMessage] = useState("");
  const [notice, setNotice] = useState("");
  const navigate = useNavigate();

  const token = () => localStorage.getItem("customerToken");
  const authConfig = () => ({ headers: { Authorization: "Bearer " + token() } });

  const loadTags = useCallback(async () => {
    setTagsLoading(true);
    setTagsError("");
    try {
      const response = await api.get("/customer-auth/my-tags", authConfig());
      setTags(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setTagsError(err.response?.data?.detail || err.response?.data?.message || "Could not load your tags. Please refresh.");
    } finally {
      setTagsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const customerToken = localStorage.getItem("customerToken");
    if (!customerToken) {
      navigate("/customer-login", { replace: true });
      return () => { active = false; };
    }

    api.get("/customer-auth/me", { headers: { Authorization: "Bearer " + customerToken } })
      .then(response => {
        if (active) setAccount(response.data);
      })
      .catch(() => {
        if (!active) return;
        localStorage.removeItem("customerToken");
        localStorage.removeItem("customerUsername");
        localStorage.removeItem("customerEmail");
        setError("Your customer session expired. Please log in again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    api.get("/customer-auth/my-tags", { headers: { Authorization: "Bearer " + customerToken } })
      .then(response => {
        if (active) setTags(Array.isArray(response.data) ? response.data : []);
      })
      .catch(err => {
        if (active) setTagsError(err.response?.data?.detail || err.response?.data?.message || "Could not load your tags. Please refresh.");
      })
      .finally(() => {
        if (active) setTagsLoading(false);
      });

    return () => { active = false; };
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerUsername");
    localStorage.removeItem("customerEmail");
    navigate("/customer-login");
  };

  const closeReorder = () => {
    setReorderTarget(null);
    setOtp("");
    setOtpSent(false);
    setVerifiedEmail("");
    setReorderError("");
    setReorderMessage("");
    setReorderBusy(false);
  };

  const startReorder = async tag => {
    setReorderTarget(tag);
    setOtp("");
    setOtpSent(false);
    setVerifiedEmail("");
    setReorderError("");
    setReorderMessage("");
    if (!account?.email) {
      setReorderError("Your account email could not be loaded. Please refresh and try again.");
      return;
    }
    setReorderBusy(true);
    try {
      await api.post("/email-otp/order/send", { email: account.email }, authConfig());
      setOtpSent(true);
      setReorderMessage("We sent a six-digit verification code to " + account.email + ". Check your inbox and spam folder.");
    } catch (err) {
      setReorderError(err.response?.data?.detail || err.response?.data?.message || "Could not send an email OTP. Please try again later.");
    } finally {
      setReorderBusy(false);
    }
  };

  const verifyReorderOtp = async () => {
    setReorderError("");
    setReorderMessage("");
    if (!/^[0-9]{6}$/.test(otp)) {
      setReorderError("Enter the six-digit OTP.");
      return;
    }
    setReorderBusy(true);
    try {
      await api.post("/email-otp/order/verify", { email: account.email, otp }, authConfig());
      setVerifiedEmail(account.email.trim().toLowerCase());
      setReorderMessage("Email verified. Confirm your reorder below.");
    } catch (err) {
      setReorderError(err.response?.data?.detail || err.response?.data?.message || "OTP verification failed.");
    } finally {
      setReorderBusy(false);
    }
  };

  const placeReorder = async () => {
    if (!reorderTarget || verifiedEmail !== account?.email?.trim().toLowerCase()) {
      setReorderError("Verify your email before placing this reorder.");
      return;
    }
    setReorderError("");
    setReorderMessage("");
    setReorderBusy(true);
    try {
      const response = await api.post(
        "/customer-auth/my-tags/" + encodeURIComponent(reorderTarget.tagId) + "/reorder",
        {},
        authConfig()
      );
      setReorderMessage(response.data?.message || "Your reorder request was submitted.");
      setNotice("Reorder request #" + response.data.orderId + " submitted successfully.");
      setOtp("");
      setOtpSent(false);
      setVerifiedEmail("");
    } catch (err) {
      setReorderError(err.response?.data?.detail || err.response?.data?.message || "Could not place the reorder. The OTP may have expired; please try again.");
    } finally {
      setReorderBusy(false);
    }
  };

  const formatStickerType = type => {
    if (type === "REVERSE") return "Reverse print (inside windshield)";
    if (type === "NORMAL") return "Normal sticker (outside)";
    return type || "Not available";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-900 to-purple-900 text-white">
      <Navbar showOrderButton={false} showTrackButton={false} />
      <main className="mx-auto min-h-screen max-w-6xl px-4 pb-12 pt-28 sm:px-6">
        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-gray-700 shadow-xl">Loading your customer dashboard…</div>
        ) : error ? (
          <section className="rounded-2xl bg-white p-8 text-gray-900 shadow-xl">
            <h1 className="text-2xl font-bold">Customer Dashboard</h1>
            <p role="alert" className="mt-4 rounded-lg bg-red-100 p-3 text-red-700">{error}</p>
            <button onClick={() => navigate("/customer-login")} className="mt-5 rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white">Go to login</button>
          </section>
        ) : account && (
          <>
            <section className="rounded-2xl border border-white/15 bg-white/10 p-6 shadow-xl backdrop-blur sm:p-8">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-300">OwnTag Customer Portal</p>
                  <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Customer Dashboard</h1>
                  <p className="mt-3 text-white/80">Welcome, {account.username}.</p>
                  <p className="mt-1 break-all text-sm text-white/70">Registered email: {account.email}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link to="/" className="rounded-lg bg-orange-600 px-4 py-3 text-center font-semibold text-white hover:bg-orange-500">Order a new tag</Link>
                  <button onClick={logout} className="rounded-lg border border-white/40 px-4 py-3 font-semibold text-white hover:bg-white/10">Log out</button>
                </div>
              </div>
            </section>

            {notice && (
              <p role="status" className="mt-5 rounded-xl border border-green-300/30 bg-green-500/15 p-4 text-green-100">{notice}</p>
            )}

            <section className="mt-8">
              <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                  <h2 className="text-2xl font-bold">Your QR Tags</h2>
                  <p className="mt-1 text-white/70">Tags registered with your account email are listed here.</p>
                </div>
                {!tagsLoading && <span className="inline-flex w-fit items-center rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white">{tags.length} {tags.length === 1 ? "tag" : "tags"}</span>}
              </div>

              {tagsLoading ? (
                <div className="rounded-xl bg-white p-6 text-gray-700">Loading your tags…</div>
              ) : tagsError ? (
                <div className="rounded-xl border border-red-300/30 bg-red-500/10 p-5 text-red-100">
                  <p>{tagsError}</p>
                  <button onClick={loadTags} className="mt-3 rounded-lg border border-white/40 px-4 py-2 font-semibold text-white">Try again</button>
                </div>
              ) : tags.length === 0 ? (
                <div className="rounded-2xl bg-white p-8 text-gray-900 shadow-xl">
                  <div className="text-4xl" aria-hidden="true">🏷️</div>
                  <h3 className="mt-3 text-xl font-bold">No QR tags found yet</h3>
                  <p className="mt-2 max-w-xl text-gray-600">We couldn’t find an assigned tag linked to {account.email}. Make sure you registered and ordered using the same email address. Tags appear here after an order has been assigned a QR tag.</p>
                  <Link to="/" className="mt-5 inline-flex rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white">Order your first tag</Link>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {tags.map((tag, index) => (
                    <article key={tag.tagId || tag.uniqueCode || index} className="overflow-hidden rounded-2xl border-2 border-orange-400 bg-white text-gray-900 shadow-2xl">
                      <div className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-4 text-white">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.16em]">OwnTag QR Tag</p>
                          <h3 className="mt-1 text-2xl font-extrabold">{tag.tagId ? "Tag #" + tag.tagId : "Your tag"}</h3>
                        </div>
                        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">Active</span>
                      </div>
                      <div className="space-y-4 p-5">
                        <div className="rounded-xl bg-orange-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-orange-800">Vehicle number</p>
                          <p className="mt-1 text-xl font-extrabold tracking-wide">{tag.vehicleNumber || "Not available"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Sticker type</p>
                          <p className="mt-1 font-semibold">{formatStickerType(tag.stickerType)}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-lg bg-gray-50 p-3">
                            <p className="text-xs text-gray-500">Sheet code</p>
                            <p className="mt-1 break-all font-semibold">{tag.sheetCode || "—"}</p>
                          </div>
                          <div className="rounded-lg bg-gray-50 p-3">
                            <p className="text-xs text-gray-500">Sheet number</p>
                            <p className="mt-1 font-semibold">{tag.sheetNumber ?? "—"}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 pt-1">
                          {tag.uniqueCode && <Link to={"/v/" + tag.uniqueCode} target="_blank" rel="noreferrer" className="rounded-lg border border-indigo-200 px-4 py-3 text-center font-semibold text-indigo-700 hover:bg-indigo-50">View QR page ↗</Link>}
                          <button onClick={() => startReorder(tag)} className="rounded-lg bg-orange-600 px-4 py-3 font-bold text-white hover:bg-orange-700">Reorder this tag</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {reorderTarget && account && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-labelledby="reorder-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 text-gray-900 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-700">Replacement tag order</p>
                <h2 id="reorder-title" className="mt-2 text-2xl font-bold">Reorder {reorderTarget.tagId ? "Tag #" + reorderTarget.tagId : "QR Tag"}</h2>
                <p className="mt-2 text-gray-600">Vehicle: <strong>{reorderTarget.vehicleNumber}</strong></p>
              </div>
              <button onClick={closeReorder} aria-label="Close reorder dialog" className="rounded-lg px-3 py-1 text-2xl text-gray-500 hover:bg-gray-100">×</button>
            </div>

            <div className="mt-5 rounded-xl bg-orange-50 p-4 text-sm text-orange-950">
              We’ll send an OTP to <strong className="break-all">{account.email}</strong>. After verification, your reorder will be submitted for admin processing. Your existing tag remains active.
            </div>
            {reorderError && <p role="alert" className="mt-4 rounded-lg bg-red-100 p-3 text-sm text-red-800">{reorderError}</p>}
            {reorderMessage && <p role="status" className="mt-4 rounded-lg bg-green-100 p-3 text-sm text-green-800">{reorderMessage}</p>}

            {!verifiedEmail && otpSent && (
              <div className="mt-5 space-y-3">
                <label className="block text-sm font-semibold">Six-digit email OTP
                  <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" maxLength={6} autoComplete="one-time-code" className="mt-1 w-full rounded-lg border p-3 font-normal" placeholder="Enter OTP" />
                </label>
                <button onClick={verifyReorderOtp} disabled={reorderBusy} className="w-full rounded-lg bg-indigo-700 px-4 py-3 font-semibold text-white disabled:opacity-60">{reorderBusy ? "Please wait…" : "Verify OTP"}</button>
              </div>
            )}
            {!otpSent && !verifiedEmail && (
              <p className="mt-4 text-sm text-gray-600">{reorderBusy ? "Sending verification code…" : "Request an email OTP to continue."}</p>
            )}
            {verifiedEmail && (
              <button onClick={placeReorder} disabled={reorderBusy} className="mt-5 w-full rounded-lg bg-orange-600 px-4 py-3 font-bold text-white disabled:opacity-60">{reorderBusy ? "Submitting…" : "Confirm Reorder"}</button>
            )}
            {reorderMessage.startsWith("Your reorder request was submitted") && (
              <button onClick={closeReorder} className="mt-3 w-full rounded-lg border px-4 py-3 font-semibold">Done</button>
            )}
            {!reorderMessage.startsWith("Your reorder request was submitted") && (
              <button onClick={closeReorder} className="mt-3 w-full rounded-lg border px-4 py-3 font-semibold">Cancel</button>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
