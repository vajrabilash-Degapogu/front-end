
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

  const [form, setForm] = useState({
  name: "",
  phone: "",
  emergencyName: "",
  emergencyPhone: "",
  vehicleNumber: "",
  address: "",
  stickerType: "",
  whatsappUsername: "",
  whatsappUsernameLink: ""
});

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

  // Emergency Name
  // Emergency Contact Validation

const emergencyName = form.emergencyName.trim();
const emergencyPhone = form.emergencyPhone.trim();

// If name is entered, phone is mandatory
if (emergencyName && !emergencyPhone) {
  validationErrors.emergencyPhone =
    "Please enter the emergency contact number.";
}

// If phone is entered, name is mandatory
if (emergencyPhone && !emergencyName) {
  validationErrors.emergencyName =
    "Please enter the emergency contact name.";
}

// Validate emergency name
if (emergencyName) {
  if (!/^[A-Za-z ]+$/.test(emergencyName)) {
    validationErrors.emergencyName =
      "Emergency contact name should contain only alphabets.";
  } else if (emergencyName.replace(/\s/g, "").length < 4) {
    validationErrors.emergencyName =
      "Emergency contact name must contain at least 4 letters.";
  }
}

// Validate emergency phone
if (emergencyPhone && !/^[0-9]{10}$/.test(emergencyPhone)) {
  validationErrors.emergencyPhone =
    "Emergency contact number must contain exactly 10 digits.";
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
  const whatsappUsernameLink = form.whatsappUsernameLink.trim();
  if (Boolean(whatsappUsername) !== Boolean(whatsappUsernameLink)) {
    validationErrors.whatsapp = "Enter both the WhatsApp username and the official username sharing link, or leave both blank.";
  } else if (whatsappUsername && !/^[A-Za-z0-9._]{3,35}$/.test(whatsappUsername)) {
    validationErrors.whatsapp = "WhatsApp username must be 3-35 letters, numbers, dots or underscores.";
  }

  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  setErrors({});

  try {

    await api.post("/order", form);

    setSuccess(true);

    setForm({
      name: "",
      phone: "",
      emergencyName: "",
      emergencyPhone: "",
      vehicleNumber: "",
      address: "",
      stickerType: "",
      whatsappUsername: "",
      whatsappUsernameLink: ""
    });

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

          <div className="bg-white text-black p-8 rounded-2xl w-[90%] max-w-md shadow-2xl relative">

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
              className="w-full p-3 border rounded-lg"
              placeholder="👨 Emergency Contact Name (Optional)"
              value={form.emergencyName}
              onChange={(e) =>
                setForm({
                  ...form,
                  emergencyName:e.target.value.replace(/[^a-zA-Z ]/g,"")
                })
              }
            />
            {errors.emergencyName && (
            <p className="text-red-500 text-sm">
            {errors.emergencyName}
            </p>
            )}

            <div className="flex items-center border rounded-lg overflow-hidden">
            <span className="bg-gray-100 px-4 py-3 text-gray-700 font-semibold border-r">
              +91
            </span>

            <input
              className="flex-1 p-3 outline-none"
              placeholder="📞 Emergency Contact Number (Optional)"
              value={form.emergencyPhone}
              maxLength={10}
              onChange={(e) =>
                setForm({
                  ...form,
                  emergencyPhone: e.target.value.replace(/\D/g,"").slice(0,10)
                })
              }
            />
            {errors.emergencyPhone && (
            <p className="text-red-500 text-sm">
            {errors.emergencyPhone}
            </p>
            )}
          </div>

          <input
            className="w-full p-3 border rounded-lg"
            placeholder="WhatsApp username (optional, without @)"
            value={form.whatsappUsername}
            maxLength={35}
            onChange={(e) => setForm({ ...form, whatsappUsername: e.target.value.replace(/^@/, "") })}
          />

          <input
            className="w-full p-3 border rounded-lg"
            type="url"
            placeholder="Official WhatsApp username sharing link (optional)"
            value={form.whatsappUsernameLink}
            maxLength={500}
            onChange={(e) => setForm({ ...form, whatsappUsernameLink: e.target.value.trimStart() })}
          />
          <p className="text-gray-600 text-xs">
            Copy the username sharing link from WhatsApp. OwnTag will not use a phone-number link.
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