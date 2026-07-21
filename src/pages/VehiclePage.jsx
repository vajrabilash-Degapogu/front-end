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

  const [form, setForm] = useState({
    name: "",
    phone: "",
    emergencyName: "",
    emergencyPhone: "",
    address: "",
    vehicleNumber: "",
    stickerType: ""
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

  const callNow = () => {
    setMessage("📞 Connecting call...");
    setTimeout(() => {
      window.location.href = `${api.defaults.baseURL}/call/${code}`;
    }, 800);
  };

  const callEmergency = () => {
  setMessage("📞 Calling Emergency Contact...");

  setTimeout(() => {
    window.location.href = `${api.defaults.baseURL}/call-emergency/${code}`;
  }, 800);
};

  const whatsapp = () => {
    setMessage("Opening WhatsApp...");
    setTimeout(() => {
      window.location.href = `${api.defaults.baseURL}/whatsapp/${code}`;
    }, 800);
  };

  const submitOrder = async () => {

  const data = {
    name: form.name.trim(),
    phone: form.phone.trim(),
    emergencyName: form.emergencyName.trim(),
    emergencyPhone: form.emergencyPhone.trim(),
    address: form.address.trim(),
    vehicleNumber: form.vehicleNumber.trim().toUpperCase(),
    vehicleCode: code,
    stickerType: form.stickerType
};

  if (
    !data.name ||
    !data.phone ||
    !data.address ||
    !data.vehicleNumber ||
    !form.stickerType
) {
    setError("Please select sticker type.");
    setTimeout(() => setError(""), 2500);
    return;
}

  try {

    await api.post("/order", data);

    setMessage("✅ Order placed successfully!");

    setForm({
    name: "",
    phone: "",
    emergencyName: "",
    emergencyPhone: "",
    address: "",
    vehicleNumber: ""
  });

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

            <button
                style={{ backgroundColor: "white", color: "blue" }}
                onClick={callNow}
              >
                📞 Call Owner
              </button>

              {vehicle.emergencyPhone && vehicle.emergencyPhone.trim() !== "" && (
                <button
                  style={{ backgroundColor: "#ff9800", color: "white" }}
                  onClick={callEmergency}
                >
                  🚨 Emergency Contact
                </button>
              )}

              <button
                style={{ backgroundColor: "green" }}
                onClick={whatsapp}
              >
                💬 WhatsApp
              </button>

          </div>

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
                className="text-black"
                placeholder="👨 Emergency Contact Name (Optional)"
                value={form.emergencyName}
                onChange={e =>
                  setForm({
                    ...form,
                    emergencyName: e.target.value
                  })
                }
              />

              <input
                className="text-black"
                placeholder="📞 Emergency Contact Number (Optional)"
                value={form.emergencyPhone}
                maxLength={10}
                onChange={e =>
                  setForm({
                    ...form,
                    emergencyPhone: e.target.value.replace(/\D/g, "")
                  })
                }
              />

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