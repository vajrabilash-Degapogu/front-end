import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/TagsSheetsPage.css";

function TagsSheetsPage() {

  const [sheets, setSheets] = useState([]);
  const [filteredSheets, setFilteredSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [tags, setTags] = useState([]);

  const [search, setSearch] = useState("");

  const [showGenerate, setShowGenerate] = useState(false);
  const [showTags, setShowTags] = useState(false);

  const [stats, setStats] = useState({
    totalTags: 0,
    available: 0,
    assigned: 0,
    totalSheets: 0
  });

  const [form, setForm] = useState({
  stickerType: "REVERSE",
  vehicleCount: 10
});

  useEffect(() => {
    loadSheets();
  }, []);

  useEffect(() => {

    if (!search) {
      setFilteredSheets(sheets);
      return;
    }

    const keyword = search.toLowerCase();

    setFilteredSheets(
      sheets.filter(s =>
        s.batchCode.toLowerCase().includes(keyword) ||
        s.sheetCode.toLowerCase().includes(keyword)
      )
    );

  }, [search, sheets]);

  const loadSheets = async () => {
  try {
    console.log("Loading sheets...");

    const res = await api.get("/tag-sheet");

    console.log("Status:", res.status);
    console.log("Response:", res.data);

    setSheets(res.data);
    setFilteredSheets(res.data);

    let totalVehicles = 0;

    res.data.forEach(sheet => {
      totalVehicles += sheet.vehiclesCount;
    });

    setStats({
      totalPairs: totalVehicles,
      availablePairs: res.data.reduce(
        (sum, s) => sum + (s.availableTags || 0),
        0
      ),
      assignedPairs: res.data.reduce(
        (sum, s) => sum + (s.assignedTags || 0),
        0
      ),
      totalSheets: res.data.length
    });

  } catch (err) {
    console.error(err);
  }
};


  const openSheet = async (sheetCode) => {

  try {

    const res = await api.get(`/tag-sheet/${sheetCode}/tags`);

    setSelectedSheet(sheetCode);
    setTags(res.data);
    setShowTags(true);

  } catch (err) {
    console.error(err);
  }

};

const downloadPdf = async (sheetCode) => {
  try {
    const response = await api.get(`/tag-sheet/${sheetCode}/pdf`, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: "application/pdf",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${sheetCode}.pdf`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error(err);
    alert("PDF Download Failed");
  }
};

  const generateSheet = async () => {

  try {

    await api.post("/tag-batch/generate", {
      stickerType: form.stickerType || "REVERSE",
      vehicleCount: Number(form.vehicleCount || 10)
    });

    setShowGenerate(false);

    await loadSheets();

    alert("Sheet Generated Successfully");

  } catch (err) {
    alert(err.response?.data || "Generation Failed");
  }

};
console.log("Sheets:", sheets);
console.log("Filtered:", filteredSheets);

  return (
    <div className="tags-page">

      <div className="page-header">

        <h2>🏷 Tags & Sheets</h2>

        <button
          className="generate-btn"
          onClick={() => setShowGenerate(true)}
        >
          + Generate New Sheet
        </button>

      </div>

      <div className="stats-grid">

        <div className="stat-card">
          <h3>Total Pairs</h3>
          <h1>{stats.totalPairs}</h1>
        </div>

        <div className="stat-card">
          <h3>Available Pairs</h3>
          <h1>{stats.availablePairs}</h1>
        </div>

        <div className="stat-card">
          <h3>Assigned Pairs</h3>
          <h1>{stats.assignedPairs}</h1>
        </div>

        <div className="stat-card">
          <h3>Sheets</h3>
          <h1>{stats.totalSheets}</h1>
        </div>

      </div>

      <input
        className="search-box"
        placeholder="Search Sheet / Batch..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="sheet-table">

        <thead>

          <tr>
            <th>Sheet</th>
            <th>Batch</th>
            <th>Total</th>
            <th>Available</th>
            <th>Assigned</th>
            <th>Action</th>
          </tr>

        </thead>

        <tbody>

          {filteredSheets.map(sheet => (

            <tr key={sheet.sheetCode}>

              <td>{sheet.sheetCode}</td>

              <td>{sheet.batchCode}</td>

              <td>{sheet.vehiclesCount}</td>
              <td>{sheet.availableTags}</td>
              <td>{sheet.assignedTags}</td>

              <td className="action-buttons">

  <button
    className="view-btn"
    onClick={() => openSheet(sheet.sheetCode)}
  >
    View Tags
  </button>

  <button
    className="download-btn"
    onClick={() => downloadPdf(sheet.sheetCode)}
  >
    Download PDF
  </button>

</td>

            </tr>

          ))}

        </tbody>

      </table>

            {/* ================= GENERATE SHEET MODAL ================= */}

      {showGenerate && (
        <div className="modal-overlay">

          <div className="modal">

            <h2>Generate New Tags</h2>

<label>Sticker Type</label>

<select
    value={form.stickerType || "REVERSE"}
    onChange={(e) =>
        setForm({
            ...form,
            stickerType: e.target.value
        })
    }
>
    <option value="REVERSE">Reverse</option>
    <option value="NORMAL">Normal</option>
</select>

<label>Vehicle Count</label>

<input
    type="number"
    value={form.vehicleCount || 10}
    onChange={(e)=>
        setForm({
            ...form,
            vehicleCount:Number(e.target.value)
        })
    }
/>

            <h3>
Total Stickers : {(form.vehicleCount || 10) * 2}
</h3>

            <div className="modal-buttons">

              <button
                className="save-btn"
                onClick={generateSheet}
              >
                Generate
              </button>

              <button
                className="cancel-btn"
                onClick={() => setShowGenerate(false)}
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ================= VIEW TAGS MODAL ================= */}

      {showTags && (

        <div className="modal-overlay">

          <div className="modal large">

            <div className="modal-header">

              <h2>Tags - {selectedSheet}</h2>

              <button
                className="close-btn"
                onClick={() => setShowTags(false)}
              >
                ✕
              </button>

            </div>

            <table className="tag-table">

              <thead>

                <tr>

                  <th>Tag ID</th>

                  <th>QR UUID</th>

                  <th>Status</th>

                </tr>

              </thead>

              <tbody>

                {tags.map(tag => (

                  <tr key={tag.tagId}>

                    <td>{tag.tagId}</td>

                    <td>{tag.uniqueCode}</td>

                    <td>

                      {tag.assigned ? (

                        <span className="assigned">
                          Assigned
                        </span>

                      ) : (

                        <span className="available">
                          Available
                        </span>

                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>

  );

}

export default TagsSheetsPage;