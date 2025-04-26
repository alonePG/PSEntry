document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("historyTableBody");
  const searchInput = document.getElementById("searchPlate");
  const filterSelect = document.getElementById("filterRange");
  const statusMsg = document.getElementById("statusMsg");
  const pagination = document.getElementById("pagination");

  let fullData = [];
  let currentPage = 1;
  const rowsPerPage = 10; // ✅ กำหนดกี่แถวต่อหน้า (ปรับได้)

  // แสดงข้อความสถานะ
  function showMsg(msg, type = "info") {
    if (!statusMsg) return;
    statusMsg.textContent = msg;
    statusMsg.className = `alert alert-${type}`;
    statusMsg.classList.remove("d-none");
  }

  // โหลดข้อมูลจาก Google Apps Script
  function loadHistory() {
    const range = filterSelect?.value || "all";
    const plate = searchInput?.value.trim() || "";

    const params = new URLSearchParams({ action: "history", range, plate });

    fetch(`${SHEET_API_URL}?${params}`)
      .then(res => {
        if (!res.ok) throw new Error("Fetch failed");
        return res.json();
      })
      .then(data => {
        fullData = data || [];
        currentPage = 1; // เริ่มที่หน้าแรกเสมอ
        renderPage();
        showMsg(`✅ พบข้อมูล ${fullData.length} รายการ`, "success");
      })
      .catch(err => {
        console.error("History load error:", err);
        showMsg("❌ โหลดข้อมูลล้มเหลว: " + err.message, "danger");
      });
  }

  // แสดงข้อมูลเฉพาะหน้าปัจจุบัน
  function renderPage() {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = fullData.slice(start, end);

    tableBody.innerHTML = "";

    if (pageData.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7">🚫 ไม่พบข้อมูล</td></tr>`;
      pagination.innerHTML = "";
      return;
    }

    for (const row of pageData) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.plate || "-"}</td>
        <td>${row.house || "-"}</td>
        <td>${row.inTime || "-"}</td>
        <td>${row.outTime || "-"}</td>
        <td>${row.duration || "-"}</td>
        <td>${row.status || "-"}</td>
        <td>
          ${row.photoUrl
            ? `<a href="${row.photoUrl}" target="_blank" class="btn btn-sm btn-outline-primary">📷</a>`
            : "-"}
        </td>
      `;
      tableBody.appendChild(tr);
    }

    renderPagination();
  }

  // สร้างปุ่มแบ่งหน้า (pagination)
  function renderPagination() {
    const pageCount = Math.ceil(fullData.length / rowsPerPage);
    pagination.innerHTML = "";
  
    if (pageCount <= 1) return; // ถ้ามีหน้าน้อยกว่า 2 ไม่ต้องมีตัวแบ่งหน้า
  
    const createPageButton = (page) => {
      const li = document.createElement("li");
      li.className = `page-item ${page === currentPage ? "active" : ""}`;
      li.innerHTML = `<span class="page-link">${page}</span>`;
      li.addEventListener("click", () => {
        if (currentPage !== page) {
          currentPage = page;
          renderPage();
        }
      });
      pagination.appendChild(li);
    };
  
    const createDots = () => {
      const li = document.createElement("li");
      li.className = "page-item disabled";
      li.innerHTML = `<span class="page-link">...</span>`;
      pagination.appendChild(li);
    };
  
    // หน้าแรก
    createPageButton(1);
  
    if (currentPage > 4) {
      createDots();
    }
  
    // หน้ารอบ ๆ ปัจจุบัน
    const start = Math.max(2, currentPage - 2);
    const end = Math.min(pageCount - 1, currentPage + 2);
  
    for (let i = start; i <= end; i++) {
      createPageButton(i);
    }
  
    if (currentPage < pageCount - 3) {
      createDots();
    }
  
    // หน้าสุดท้าย
    if (pageCount > 1) {
      createPageButton(pageCount);
    }
  }
  

  // Event Listener
  if (searchInput) searchInput.addEventListener("input", () => {
    currentPage = 1;
    loadHistory();
  });

  if (filterSelect) filterSelect.addEventListener("change", () => {
    currentPage = 1;
    loadHistory();
  });

  loadHistory(); // 🟢 โหลดครั้งแรก
});
