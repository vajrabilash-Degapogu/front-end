import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/VehiclePAge.css";

function VehiclePage() {

  const { code } = useParams();

  const [vehicle, setVehicle] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSentFor, setOtpSentFor] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    vehicleNumber: "",
    stickerType: "",
    whatsappUsername: ""
  });

  // ✅ FIX: FORCE REFRESH + CLEAR OLD DATA
  useEffect(() => {
  let isMounted = true;

  setVehicle(null); // clear old data

  api.get(`/vehicle/${code}`, {
    headers: {
      "Cache-Control": "no-cache",
      "Pragma": "no-cache"
    },
    params: {
      t: Date.now() // force unique request
    }
  })
  .then(res => {
    if (isMounted) {
      setVehicle(res.data);
    }
  })
  .catch(err=>{

const message =
err.response?.data?.message ||
"Vehicle not found.";

setError(message);

});

  return () => {
    isMounted = false;
  };

}, [code]);
console.log("Loaded code:", code);

  const callEmergency = () => {
  setMessage("📞 Calling Emergency Contact...");

  setTimeout(() => {
    window.location.href = `${api.defaults.baseURL}/call-emergency/${code}`;
  }, 800);
};

  const whatsapp = () => {
    if (!vehicle?.whatsappAvailable) {
      setError("WhatsApp username contact is not configured for this vehicle yet.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setMessage("Opening WhatsApp...");
    window.location.href = `${api.defaults.baseURL}/whatsapp/${code}`;
  };

  const sendEmailOtp = async () => {
    const email = form.email.trim().toLowerCase();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError("Enter a valid email address first.");
      return;
    }
    setOtpLoading(true);
    try {
      await api.post("/email-otp/order/send", { email });
      setOtpSentFor(email);
      setVerifiedEmail("");
      setOtpCode("");
      setMessage("Email OTP sent. Check your inbox and spam folder.");
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || "Could not send OTP. Check email service configuration.");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyEmailOtp = async () => {
    const email = form.email.trim().toLowerCase();
    setError("");
    if (otpSentFor !== email) {
      setError("Send an OTP to this email address first.");
      return;
    }
    if (!/^[0-9]{6}$/.test(otpCode)) {
      setError("Enter the six-digit OTP.");
      return;
    }
    setOtpLoading(true);
    try {
      await api.post("/email-otp/order/verify", { email, otp: otpCode });
      setVerifiedEmail(email);
      setMessage("Email verified successfully.");
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || "OTP verification failed.");
    } finally {
      setOtpLoading(false);
    }
  };

  const submitOrder = async () => {

  const data = {
    name: form.name.trim(),
    phone: form.phone.trim(),
    email: form.email.trim().toLowerCase(),
    address: form.address.trim(),
    vehicleNumber: form.vehicleNumber.trim().toUpperCase(),
    vehicleCode: code,
    stickerType: form.stickerType,
    whatsappUsername: form.whatsappUsername.trim().replace(/^@/, ""),
};

  if (data.whatsappUsername && !/^[A-Za-z0-9._]{3,35}$/.test(data.whatsappUsername)) {
    setError("WhatsApp username must be 3-35 letters, numbers, dots or underscores.");
    setTimeout(() => setError(""), 3000);
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) {
    setError("Enter a valid email address.");
    setTimeout(() => setError(""), 3000);
    return;
  }

  if (verifiedEmail !== data.email) {
    setError("Verify your email with the OTP before placing your order.");
    setTimeout(() => setError(""), 3000);
    return;
  }

  if (
    !data.name ||
    !data.phone ||
    !data.email ||
    !data.address ||
    !data.vehicleNumber ||
    !form.stickerType
  ) {
    setError("Please complete all required fields and select sticker type.");
    setTimeout(() => setError(""), 2500);
    return;
  }

  try {

    await api.post("/order", data);

    setMessage("✅ Order placed successfully!");

    setForm({
    name: "",
    phone: "",
    email: "",
    address: "",
    vehicleNumber: "",
    stickerType: "",
    whatsappUsername: ""
  });
    setOtpCode("");
    setOtpSentFor("");
    setVerifiedEmail("");

    setShowForm(false);

    setTimeout(() => setMessage(""), 2500);

  } catch (err) {

  let message = "Unable to place order.";

  const data = err.response?.data;

  if (typeof data === "string") {
    message = data;
  }
  else if (data?.message) {
    message = data.message;
  }
  else if (data?.errors) {
    message = Object.values(data.errors).join("\n");
  }
  else if (data?.phone) {
    message = data.phone;
  }
  else if (data?.vehicleNumber) {
    message = data.vehicleNumber;
  }
  else if (data?.address) {
    message = data.address;
  }

  setError(message);

  setTimeout(() => {
    setError("");
  }, 3000);
}
};

  if (!vehicle) return (
<div className="min-h-screen flex items-center justify-center">
<h3>Loading...</h3>
</div>
);

  return (
    <>
      {/* SUCCESS MESSAGE */}
      {message && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {message}
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}

      <div className="main-bg">
        <div className="container">
          <div className="card">

            <h2>🚗 OwnTag</h2>

            <div style={{ backgroundColor: "orange" }} className="vehicle-info">
              <p style={{ color: "black" }}>
                <b>Owner:</b> {vehicle.ownerName}
              </p>
              <p style={{ color: "black" }}>
                <b>Vehicle No:</b> {vehicle.vehicleNumber}
              </p>
            </div>

            <h3>👇 Contact The Owner 👍</h3>

            <div className="buttons">

              {vehicle.emergencyContactAvailable && (
                <button
                  style={{ backgroundColor: "#ff9800", color: "white" }}
                  onClick={callEmergency}
                >
                  🚨 Emergency Contact
                </button>
              )}

              <button
                style={{ backgroundColor: "green", opacity: vehicle.whatsappAvailable ? 1 : 0.55 }}
                onClick={whatsapp}
                disabled={!vehicle.whatsappAvailable}
                title={!vehicle.whatsappAvailable ? "Owner has not configured WhatsApp username contact yet" : "Open WhatsApp"}
              >
                💬 Chat & Call on WhatsApp
              </button>

          </div>

            {vehicle.whatsappAvailable && (
              <>
                <p style={{ color: "black", marginTop: "8px" }}>
                  WhatsApp username: @{vehicle.whatsappUsername}
                </p>
                <p style={{ color: "black", fontSize: "0.9rem" }}>
                  Start the chat in WhatsApp, then tap its voice-call icon to speak with the owner.
                </p>
              </>
            )}
            {!vehicle.whatsappAvailable && (
              <p style={{ color: "black", marginTop: "8px", fontSize: "0.9rem" }}>
                WhatsApp username contact is not configured for this vehicle yet.
              </p>
            )}

            <hr />

            <p style={{ color: "black" }}>Want your own QR sticker?</p>

            <button className="order" onClick={() => setShowForm(!showForm)}>
              🛒 Order QR Sticker
            </button>
            

            {showForm && (
              <div className="order-form">

                <input
                className="text-black"
                placeholder="👤 Full Name *"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />

              <input
                className="text-black"
                placeholder="📱 Phone Number *"
                value={form.phone}
                maxLength={10}
                onChange={e =>
                  setForm({
                    ...form,
                    phone: e.target.value.replace(/\D/g, "")
                  })
                }
              />

              <input
                type="email"
                className="text-black"
                placeholder="✉️ Email Address *"
                autoComplete="email"
                value={form.email}
                onChange={e => {
                  setForm({ ...form, email: e.target.value });
                  setOtpSentFor("");
                  setVerifiedEmail("");
                  setOtpCode("");
                }}
              />

              <input
                className="text-black"
                placeholder="WhatsApp username (optional, without @)"
                value={form.whatsappUsername}
                maxLength={35}
                onChange={e => setForm({ ...form, whatsappUsername: e.target.value.replace(/^@/, "") })}
              />

              <p style={{ color: "black", fontSize: "0.8rem" }}>
                Enter the username exactly as it appears in WhatsApp. OwnTag creates the contact link automatically.
              </p>

              <textarea
                className="text-black"
                placeholder="📍 Delivery Address *"
                value={form.address}
                onChange={e =>
                  setForm({
                    ...form,
                    address: e.target.value
                  })
                }
              />
              {/* <label className="form-label">
    Sticker Type <span style={{ color: "red" }}>*</span>
</label> */}

<select
    className="text-black"
    value={form.stickerType}
    onChange={(e) =>
        setForm({
            ...form,
            stickerType: e.target.value
        })
    }
>
    <option value="">Select Sticker Type</option>

    <option value="REVERSE">
        Reverse Print Sticker (Stick From Inside)
    </option>

    <option value="NORMAL">
        Normal Sticker (Outside Sticker)
    </option>

</select>

              <input
                className="text-black"
                placeholder="🚘 Vehicle Number *"
                value={form.vehicleNumber}
                onChange={e =>
                  setForm({
                    ...form,
                    vehicleNumber: e.target.value.toUpperCase()
                  })
                }
              />

              <button
                type="button"
                onClick={sendEmailOtp}
                disabled={otpLoading}
                className="rounded-lg border border-indigo-600 p-3 font-semibold disabled:opacity-60"
              >
                {otpLoading ? "Please wait…" : "Send email OTP"}
              </button>

              {otpSentFor === form.email.trim().toLowerCase() && verifiedEmail !== form.email.trim().toLowerCase() && (
                <div className="flex gap-2">
                  <input
                    className="text-black min-w-0 flex-1"
                    placeholder="6-digit email OTP"
                    value={otpCode}
                    inputMode="numeric"
                    maxLength={6}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  />
                  <button
                    type="button"
                    onClick={verifyEmailOtp}
                    disabled={otpLoading}
                    className="rounded-lg bg-indigo-700 px-4 text-white font-semibold disabled:opacity-60"
                  >
                    Verify
                  </button>
                </div>
              )}
              {verifiedEmail === form.email.trim().toLowerCase() && form.email && (
                <p className="text-green-700 text-sm font-semibold">✓ Email verified</p>
              )}

                <button style={{ color: "black" }} onClick={submitOrder}>
                  Submit Order
                </button>

              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}

export default VehiclePage;