document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("pendingTableBody");
  const statusMsg = document.getElementById("statusMsg");
  const successSound = new Audio("assets/sound/success.mp3");

  // 🧩 แสดงข้อความแจ้งเตือนแบบธรรมดา
  const showMsg = (msg, type = "info") => {
    statusMsg.textContent = msg;
    statusMsg.className = `alert alert-${type}`;
    statusMsg.classList.remove("d-none");
  };

  // 🚗 โหลดรายการรถที่ยังไม่ออก
  async function loadPendingCars() {
    try {
      const res = await fetch(`${SHEET_API_URL}?action=pendingDetails`);
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4">✅ รถทั้งหมดออกแล้ว</td></tr>`;
        return;
      }

      renderTable(data);
    } catch (err) {
      console.error("❌ Error loading pending cars:", err);
      tableBody.innerHTML = `<tr><td colspan="4">❌ โหลดข้อมูลล้มเหลว</td></tr>`;
      showMsg("ไม่สามารถโหลดข้อมูล: " + err.message, "danger");
    }
  }

  // 🖨 แสดงผลในตาราง
  function renderTable(data) {
    tableBody.innerHTML = "";
    data.forEach(({ plate, house, time }) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${plate}</td>
        <td>${house}</td>
        <td>${time}</td>
        <td>
          <button class="btn btn-sm btn-success" onclick="checkout('${plate}')">📤</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  loadPendingCars();

  // 🟢 ฟังก์ชันบันทึกเวลาออก
  window.checkout = async (plate) => {
    const confirmResult = await Swal.fire({
      title: 'ยืนยันบันทึกเวลาออก?',
      text: `ทะเบียน: ${plate}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '✅ ยืนยัน',
      cancelButtonText: '❌ ยกเลิก',
    });

    if (!confirmResult.isConfirmed) return;

    try {
      const res = await fetch(SHEET_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ action: "checkout", plate })
      });

      const result = await res.text();

      if (result.startsWith("✅")) {
        await Swal.fire({
          title: 'บันทึกสำเร็จ',
          text: result,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        successSound.play();
        loadPendingCars();
      } else {
        await Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: result,
          icon: 'error'
        });
      }

    } catch (err) {
      console.error("❌ บันทึกล้มเหลว:", err);
      await Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: err.message,
        icon: 'error'
      });
    }
  };
});
