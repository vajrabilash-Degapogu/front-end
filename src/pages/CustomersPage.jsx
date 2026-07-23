import { useEffect, useState, useCallback, useRef } from "react";
import api from "../services/api";
import "../css/CustomersPage.css";
// import { toPng } from "html-to-image";

function CustomersPage() {

  const [customers, setCustomers] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const tagRef = useRef();

  // ✅ LOAD CUSTOMERS
  const loadCustomers = useCallback(() => {
    api.get(`/vehicle/paginated?page=${page}&size=9`)
      .then(res => {
        setCustomers(res.data.content);
        setTotalPages(res.data.totalPages);
      })
      .catch(() => {
        setError("❌ Failed to load customers");
        setTimeout(() => setError(""), 2000);
      });
  }, [page]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);


  //PDF download
//   const downloadPDF = async (code, name, phone) => {
//   try {
//     const safeName = (name || "customer").replace(/[^a-zA-Z0-9]/g, "_");
//     const first5 = (phone || "00000").replace(/\D/g, "").substring(0, 5);

//     const res = await api.get(`/tag-pdf/${code}`, {
//       responseType: "blob"   // 🔥 IMPORTANT
//     });

//     const url = window.URL.createObjectURL(new Blob([res.data]));

//     const link = document.createElement("a");
//     link.href = url;
//     link.download = `${safeName}_${first5}.pdf`; // ✅ FINAL NAME
//     document.body.appendChild(link);
//     link.click();
//     link.remove();

//   } catch (err) {
//   setError(
//     err.response?.data?.message ||
//     err.response?.data ||
//     "❌ PDF download failed"
//   );

//   setTimeout(() => setError(""), 3000);
// }
// };
const downloadPdf = async (sheetCode) => {

    console.log("Token:", localStorage.getItem("token"));

    const response = await api.get(
        `/tag-sheet/${sheetCode}/pdf`,
        {
            responseType: "blob"
        }
    );

    console.log(response);

};

  // ✅ FINAL TAG DOWNLOAD (FULL TAG WITH QR)
  // const downloadTag = async (code, name, phone) => {
  //   try {
  //     const qrUrl = `${api.defaults.baseURL}/qr/${code}?t=${Date.now()}`;

  //     const qrImg = tagRef.current.querySelector("#qr-img");

  //     // force refresh QR
  //     qrImg.src = "";
  //     qrImg.src = qrUrl;

  //     await new Promise((resolve, reject) => {
  //       qrImg.onload = resolve;
  //       qrImg.onerror = reject;
  //     });

  //     const dataUrl = await toPng(tagRef.current);

  //     const safeName = (name || "customer").replace(/[^a-zA-Z0-9]/g, "_");
  //     const safePhone = (phone || "0000").replace(/\D/g, "");

  //     const link = document.createElement("a");
  //     link.download = `${safeName}_${safePhone}.png`;
  //     link.href = dataUrl;
  //     link.click();

  //   } catch (err) {
  //     console.error("Tag error", err);
  //   }
  // };

  // 🗑️ DELETE CUSTOMER
  const deleteCustomer = async () => {
    try {
      await api.delete(`/vehicle/${deleteId}`);
      setMessage("🗑️ Customer deleted");
      setTimeout(() => setMessage(""), 2000);
      setDeleteId(null);
      loadCustomers();
    } catch (err) {

  const message =
    err.response?.data?.message ||
    err.response?.data ||
    "❌ Delete failed";

  setError(message);

  setTimeout(() => setError(""), 3000);
}
  };

  // ✏️ UPDATE CUSTOMER
  const updateCustomer = async () => {

  const data = {
    ...editingCustomer,
    ownerName: editingCustomer.ownerName.trim(),
    phoneNumber: editingCustomer.phoneNumber.trim(),
    emergencyName: editingCustomer.emergencyName.trim(),
    emergencyPhone: editingCustomer.emergencyPhone.trim(),
    vehicleNumber: editingCustomer.vehicleNumber.trim().toUpperCase(),
    address: editingCustomer.address.trim()
  };

  try {

    await api.put(`/vehicle/${editingCustomer.id}`, data);

    setMessage("✅ Customer updated");

    setTimeout(() => setMessage(""), 2000);

    setEditingCustomer(null);

    loadCustomers();

  } catch (err) {

    const message =
      err.response?.data?.message ||
      err.response?.data ||
      "❌ Update failed";

    setError(message);

    setTimeout(() => setError(""), 3000);
  }
};

  return (
    <>
      {/* TOASTS */}
      {message && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {message}
        </div>
      )}

      {error && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}

      <div>
        <h2>👥 Customers</h2>

        <table className="customers-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Vehicle</th>
              <th>Tag ID</th>
              <th>Sheet</th>
              <th>Address</th>
              <th>Emergency Name</th>
              <th>Emergency Phone</th>
              <th>QR</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.ownerName}</td>
                <td>{c.phoneNumber}</td>
                <td>{c.vehicleNumber}</td>
                <td>{c.tagId}</td>
                <td>{c.sheetCode}</td>
                <td>{c.address}</td>
                <td>{c.emergencyName}</td>
                <td>{c.emergencyPhone}</td>

                <td>
                  <button
                    style={{ backgroundColor: "green", color: "black" }}
                    onClick={() => downloadPDF(c.uniqueCode, c.ownerName, c.phoneNumber)}
                  >
                    ⬇️ Download Tag
                  </button>
                </td>

                <td>
                  <button onClick={() => setEditingCustomer(c)}>✏️ Edit</button>
                  <button onClick={() => setDeleteId(c.id)}>🗑️ Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="pagination">
          <button disabled={page === 0} onClick={() => setPage(page - 1)}>
            ⬅ Prev
          </button>

          <span>Page {page + 1} / {totalPages || 1}</span>

          <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
            Next ➡
          </button>
        </div>

        {/* EDIT MODAL */}
        {editingCustomer && (
          <div className="modal-overlay">
            <div className="modal">

              <h3>Edit Customer</h3>

              <input
                value={editingCustomer.ownerName}
                onChange={e =>
                  setEditingCustomer({ ...editingCustomer, ownerName: e.target.value })
                }
              />

              <input
                value={editingCustomer.phoneNumber}
                onChange={e =>
                  setEditingCustomer({ ...editingCustomer, phoneNumber: e.target.value.replace(/\D/g,"") })
                }
                maxLength={10}
              />

              <input
                value={editingCustomer.emergencyName || ""}
                placeholder="Emergency Contact Name"
                onChange={e =>
                  setEditingCustomer({
                    ...editingCustomer,
                    emergencyName: e.target.value
                  })
                }
              />

              <input
                value={editingCustomer.emergencyPhone || ""}
                placeholder="Emergency Contact Number"
                maxLength={10}
                onChange={e =>
                  setEditingCustomer({
                    ...editingCustomer,
                    emergencyPhone: e.target.value.replace(/\D/g, "")
                  })
                }
              />

              <input
                value={editingCustomer.vehicleNumber}
                onChange={e =>
                  setEditingCustomer({ ...editingCustomer, vehicleNumber: e.target.value.toUpperCase() })
                }
              />

              <input
                value={editingCustomer.address || ""}
                onChange={e =>
                  setEditingCustomer({ ...editingCustomer, address: e.target.value })
                }
              />

              <div className="modal-buttons">
                <button onClick={updateCustomer}>Save</button>
                <button onClick={() => setEditingCustomer(null)}>Cancel</button>
              </div>

            </div>
          </div>
        )}

        {/* DELETE MODAL */}
        {deleteId && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Delete this customer?</h3>
              <div className="modal-buttons">
                <button onClick={deleteCustomer}>Yes, Delete</button>
                <button onClick={() => setDeleteId(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🔥 HIDDEN TAG TEMPLATE */}
      <div style={{ position: "absolute", left: "-9999px" }}>
        <div ref={tagRef} style={{ width: "600px", position: "relative" }}>

          <img src="/tag.png" style={{ width: "100%" }} alt="tag" />

          <img
            id="qr-img"
            src=""
            style={{
              position: "absolute",
              right: "40px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "150px",
              height: "150px"
            }}
            alt="qr"
          />

        </div>
      </div>

    </>
  );
}

export default CustomersPage;