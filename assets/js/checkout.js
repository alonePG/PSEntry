document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("checkoutForm");
  const plateInput = document.getElementById("plate");
  const statusMsg = document.getElementById("statusMsg");
  const submitBtn = form.querySelector("button[type='submit']");
  const successSound = document.getElementById("successSound");
  const autocompleteList = document.getElementById("autocompleteList");

  let pendingPlates = [];

  async function loadPendingPlates() {
    try {
      const res = await fetch(`${SHEET_API_URL}?action=pending`);
      const plates = await res.json();
      pendingPlates = plates || [];
    } catch (err) {
      console.error("โหลดทะเบียนที่ยังไม่ออกล้มเหลว:", err);
    }
  }

  function showMsg(msg, type = "info") {
    statusMsg.textContent = msg;
    statusMsg.className = `alert alert-${type}`;
    statusMsg.classList.remove("d-none");
  }

  function renderAutocomplete(query) {
    autocompleteList.innerHTML = "";
    if (!query) {
      autocompleteList.classList.add("d-none");
      return;
    }

    const matches = pendingPlates.filter(p => p.toLowerCase().includes(query.toLowerCase())).slice(0, 10);
    if (matches.length === 0) {
      autocompleteList.classList.add("d-none");
      return;
    }

    matches.forEach(item => {
      const div = document.createElement("div");
      div.className = "autocomplete-item";
      div.textContent = item;
      div.addEventListener("click", () => {
        plateInput.value = item;
        autocompleteList.classList.add("d-none");
      });
      autocompleteList.appendChild(div);
    });

    autocompleteList.classList.remove("d-none");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const plate = plateInput.value.trim();
    if (!plate) {
      return showMsg("⚠️ กรุณาระบุทะเบียนรถ", "warning");
    }

    submitBtn.disabled = true;
    showMsg("⏳ กำลังบันทึกเวลาออก...", "secondary");

    try {
      const body = new URLSearchParams({ action: "checkout", plate });
      const res = await fetch(SHEET_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body
      });

      const result = await res.text();
      const isError = result.startsWith("🚫");

      showMsg(result, isError ? "danger" : "success");

      if (!isError && successSound) {
        successSound.play();
        setTimeout(() => (window.location.href = "index.html"), 2000);
      }
    } catch (err) {
      showMsg("❌ เกิดข้อผิดพลาด: " + err.message, "danger");
    } finally {
      submitBtn.disabled = false;
    }
  });

  // Input event
  plateInput.addEventListener("input", () => {
    const query = plateInput.value.trim();
    renderAutocomplete(query);
  });

  // คลิกที่อื่น ซ่อน list
  document.addEventListener("click", (e) => {
    if (!plateInput.contains(e.target) && !autocompleteList.contains(e.target)) {
      autocompleteList.classList.add("d-none");
    }
  });

  loadPendingPlates(); // 🟢 โหลดทะเบียนตอนเปิด
});
