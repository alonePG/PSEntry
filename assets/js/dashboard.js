
document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const inTotalEl = $("inTotal");
  const outTotalEl = $("outTotal");
  const pendingEl = $("pending");
  const statusMsg = $("statusMsg");

  const showMsg = (msg, type = "info") => {
    if (!statusMsg) return;
    statusMsg.textContent = msg;
    statusMsg.className = `alert alert-${type}`;
    statusMsg.classList.remove("d-none");
  };

  async function loadDashboard() {
    showMsg("⏳ กำลังโหลดข้อมูลจากระบบ...", "secondary");

    try {
      const res = await fetch(`${SHEET_API_URL}?action=summary`);
      if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
      const data = await res.json();

      if (inTotalEl) inTotalEl.textContent = data.inTotal ?? "-";
      if (outTotalEl) outTotalEl.textContent = data.outTotal ?? "-";
      if (pendingEl) pendingEl.textContent = data.pending ?? "-";

      showMsg("✅ โหลดข้อมูลสำเร็จ", "success");
    } catch (err) {
      console.error("❌ โหลดข้อมูลไม่สำเร็จ:", err);
      showMsg("❌ โหลดข้อมูลล้มเหลว: " + err.message, "danger");
    }
  }

  loadDashboard();
});
