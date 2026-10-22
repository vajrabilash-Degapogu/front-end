
import { useState } from "react";
import Navbar from "../components/NavBar";
import Hero from "../components/Hero";
import BrandStrip from "../components/BrandStrip";
import ImageCarousel from "../components/ImageCurousel";
import PricingSection from "../components/PricingSection";
import ReactPlayer from "react-player";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import Review from "../components/Review";
import FAQ from "../components/FAQ";
import CTA from "../components/CTA";
import Footer from "../components/Footer";
import api from "../services/api";

export default function LandingPage() {

  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [showVideo, setShowVideo] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpSentFor, setOtpSentFor] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");

  const [form, setForm] = useState({
  name: "",
  phone: "",
  email: "",
  vehicleNumber: "",
  address: "",
  stickerType: "",
  whatsappUsername: ""
});

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
      setErrors({});
      setOtpMessage("OTP sent to your email. Check your inbox and spam folder.");
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || "Could not send OTP. Check the email service configuration.");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyEmailOtp = async () => {
    const email = form.email.trim().toLowerCase();
    setError("");
    setOtpMessage("");
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
      setErrors({});
      setOtpMessage("Email verified successfully.");
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || "OTP verification failed.");
    } finally {
      setOtpLoading(false);
    }
  };

  const submit = async () => {

  const validationErrors = {};

  // Name
  const customerName = form.name.trim();

if (!customerName) {
  validationErrors.name = "Customer name is required.";
} else if (!/^[A-Za-z ]+$/.test(customerName)) {
  validationErrors.name = "Customer name should contain only alphabets.";
} else if (customerName.replace(/\s/g, "").length < 4) {
  validationErrors.name =
    "Customer name must contain at least 4 letters.";
}

  // Phone
  if (!/^[0-9]{10}$/.test(form.phone)) {
    validationErrors.phone = "Phone number must contain exactly 10 digits.";
  }

  // Email
  const email = form.email.trim().toLowerCase();
  if (!email) {
    validationErrors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    validationErrors.email = "Enter a valid email address.";
  } else if (verifiedEmail !== email) {
    validationErrors.email = "Verify your email with the OTP before placing your order.";
  }

  // Sticker
  if (!form.stickerType) {
    validationErrors.stickerType = "Please select sticker type.";
  }

  // Vehicle
  if (
    !/^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/.test(form.vehicleNumber)
  ) {
    validationErrors.vehicleNumber =
      "Vehicle number should be like AP40JA1234.";
  }

  // Address
  if (!form.address.trim()) {
    validationErrors.address = "Delivery address is required.";
  } else if (!/\b\d{6}\b/.test(form.address)) {
    validationErrors.address =
      "Delivery address must include a valid 6-digit PIN code.";
  }

  const whatsappUsername = form.whatsappUsername.trim().replace(/^@/, "");
  if (whatsappUsername && !/^[A-Za-z0-9._]{3,35}$/.test(whatsappUsername)) {
    validationErrors.whatsapp = "WhatsApp username must be 3-35 letters, numbers, dots or underscores.";
  }

  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  setErrors({});

  try {

    await api.post("/order", {
      ...form,
      email: form.email.trim().toLowerCase(),
      whatsappUsername: whatsappUsername
    });

    setSuccess(true);

    setForm({
      name: "",
      phone: "",
      email: "",
      vehicleNumber: "",
      address: "",
      stickerType: "",
      whatsappUsername: ""
    });
    setOtpCode("");
    setOtpSentFor("");
    setVerifiedEmail("");
    setOtpMessage("");

    setTimeout(() => {
      setSuccess(false);
      setShowForm(false);
    }, 2500);

  } catch (err) {

    let message = "Unable to place order.";

    const data = err.response?.data;

    if (typeof data === "string") {
      message = data;
    } else if (data?.message) {
      message = data.message;
    }

    setError(message);

    setTimeout(() => setError(""), 3000);

  }

};

  return (

    <div className="bg-gradient-to-br from-black via-indigo-900 to-purple-900 text-white">

      <Navbar onOrderClick={() => setShowForm(true)} showOrderButton={true} />

      <Hero
      onOrderClick={() => setShowForm(true)}
      onWatchDemo={() => setShowVideo(true)}
      />

      <BrandStrip />

      <ImageCarousel />

      <PricingSection onOrderClick={() => setShowForm(true)} />

      <Features />

      <HowItWorks />

      <Review />

      <FAQ />

      <CTA onOrderClick={() => setShowForm(true)} />

      <Footer />

      {/* ORDER POPUP */}

      {showForm && (

        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">

          <div className="bg-white text-black p-8 rounded-2xl w-[90%] max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative">

            <h2 className="text-2xl font-bold mb-6 text-center">
              🚗 Order Your QR Tag
            </h2>

            <div className="space-y-3">

              <input
              className="w-full p-3 border rounded-lg"
              placeholder="👤 Full Name *"
              value={form.name}
              onChange={(e)=>
                setForm({
                ...form,
                name:e.target.value.replace(/[^a-zA-Z ]/g,"")
                })
                }
            />
            {errors.name && (
            <p className="text-red-500 text-sm">
            {errors.name}
            </p>
            )}

            <div className="flex items-center border rounded-lg overflow-hidden">
  <span className="bg-gray-100 px-4 py-3 text-gray-700 font-semibold border-r">
    +91
  </span>

  <input
    className="flex-1 p-3 outline-none"
    placeholder="📱 Phone Number *"
    value={form.phone}
    maxLength={10}
    onChange={(e) =>
      setForm({
        ...form,
        phone:e.target.value.replace(/\D/g,"").slice(0,10)
      })
    }
  />
  {errors.phone && (
<p className="text-red-500 text-sm">
{errors.phone}
</p>
)}
</div>

            <input
              type="email"
              className="w-full p-3 border rounded-lg"
              placeholder="✉️ Email Address *"
              autoComplete="email"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                setOtpSentFor("");
                setVerifiedEmail("");
                setOtpCode("");
                setOtpMessage("");
              }}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          <input
            className="w-full p-3 border rounded-lg"
            placeholder="WhatsApp username (optional, without @)"
            value={form.whatsappUsername}
            maxLength={35}
            onChange={(e) => setForm({ ...form, whatsappUsername: e.target.value.replace(/^@/, "") })}
          />

          <p className="text-gray-600 text-xs">
            Enter the username exactly as it appears in WhatsApp. OwnTag creates the username contact link automatically.
          </p>
          {errors.whatsapp && (
            <p className="text-red-500 text-sm">{errors.whatsapp}</p>
          )}

          {/* <label className="font-semibold text-gray-700">
            🏷️ Sticker Type <span className="text-red-500">*</span>
          </label> */}

          <select
            className="w-full p-3 border rounded-lg bg-white"
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
              Reverse Print Sticker (Inside Windshield)
            </option>

            <option value="NORMAL">
              Normal Sticker (Outside Sticker)
            </option>
          </select>
          {errors.stickerType && (
          <p className="text-red-500 text-sm">
          {errors.stickerType}
          </p>
          )}

            <input
              className="w-full p-3 border rounded-lg"
              placeholder="🚘 Vehicle Number *"
              value={form.vehicleNumber}
              onChange={(e) =>
                setForm({
                  ...form,
                  vehicleNumber:e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,"")
                })
              }
            />
            {errors.vehicleNumber && (
            <p className="text-red-500 text-sm">
            {errors.vehicleNumber}
            </p>
            )}

            <textarea
              className="w-full p-3 border rounded-lg"
              placeholder="📍 Delivery Address *"
              value={form.address}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: e.target.value
                })
              }
            />
            {errors.address && (
            <p className="text-red-500 text-sm">
            {errors.address}
            </p>
            )}

            {otpMessage && <p role="status" className="text-green-700 text-sm font-semibold">{otpMessage}</p>}

            <button
              type="button"
              onClick={sendEmailOtp}
              disabled={otpLoading}
              className="w-full p-3 border border-indigo-500 rounded-lg font-semibold disabled:opacity-60"
            >
              {otpLoading ? "Please wait…" : "Send email OTP"}
            </button>

            {otpSentFor === form.email.trim().toLowerCase() && verifiedEmail !== form.email.trim().toLowerCase() && (
              <div className="flex gap-2">
                <input
                  className="flex-1 min-w-0 p-3 border rounded-lg"
                  placeholder="6-digit email OTP"
                  value={otpCode}
                  inputMode="numeric"
                  maxLength={6}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                />
                <button
                  type="button"
                  onClick={verifyEmailOtp}
                  disabled={otpLoading}
                  className="px-4 rounded-lg bg-indigo-700 text-white font-semibold disabled:opacity-60"
                >
                  Verify
                </button>
              </div>
            )}
            {verifiedEmail === form.email.trim().toLowerCase() && form.email && (
              <p className="text-green-700 text-sm font-semibold">✓ Email verified</p>
            )}


            </div>

            <button
              type="button"
              onClick={submit}
              className="w-full mt-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:scale-105 transition"
            >
              🚀 Place Order
            </button>

            <button
              onClick={() => setShowForm(false)}
              className="absolute top-3 right-4 text-gray-500 text-xl"
            >
              ✖
            </button>

          </div>

        </div>

      )}

      {/* ERROR */}

      {error && (

        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">

          {error}

        </div>

      )}

      {/* SUCCESS */}

      {success && (

        <div className="fixed inset-0 flex items-center justify-center z-50">

          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

          <div className="relative bg-white text-black rounded-2xl p-8 w-[90%] max-w-sm text-center shadow-2xl">

            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center">

              <span className="text-2xl text-white">
                ✔
              </span>

            </div>

            <h2 className="text-xl font-bold mb-2">
              Order Placed!
            </h2>

            <p className="text-gray-600 text-sm">
              Your QR Tag order has been received successfully.
            </p>

          </div>

        </div>

      )}

      {/* VIDEO POPUP */}

{showVideo && (

<div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[9999]">

    <div className="relative w-[95%] max-w-5xl rounded-2xl overflow-hidden shadow-2xl border border-white/20">

        {/* Close */}

        <button
            onClick={() => setShowVideo(false)}
            className="absolute top-4 right-4 z-50 w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white text-2xl font-bold flex items-center justify-center transition"
        >
            ✕
        </button>

        <ReactPlayer
            url="/videos/demo01.mp4"
            controls
            playing
            width="100%"
            height="75vh"
            style={{
                background: "#000"
            }}
        />

    </div>

</div>

)}

    </div>
  );
}