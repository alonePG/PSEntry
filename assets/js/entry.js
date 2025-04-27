document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("entryForm");
  const houseSelect = document.getElementById("house");
  const purposeSelect = document.getElementById("purpose");
  const otherPurposeGroup = document.getElementById("otherPurposeGroup");
  const otherPurposeInput = document.getElementById("otherPurpose");
  const statusMsg = document.getElementById("statusMsg");
  const submitBtn = form.querySelector("button[type='submit']");
  const successSound = new Audio("assets/sound/success.mp3");

  const idCardImg = document.getElementById("idCardImg");
  const openCameraBtn = document.getElementById("openCameraBtn");
  const fileNameText = document.getElementById("fileNameText");

  loadHouseList();

  purposeSelect.addEventListener("change", () => {
    otherPurposeGroup.style.display = (purposeSelect.value === "อื่น ๆ") ? "block" : "none";
  });

  openCameraBtn.addEventListener("click", () => {
    idCardImg.click();
  });

  idCardImg.addEventListener("change", () => {
    if (idCardImg.files.length > 0) {
      fileNameText.textContent = `📷 เลือกแล้ว: ${idCardImg.files[0].name}`;
    } else {
      fileNameText.textContent = "";
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!navigator.onLine) {
      return showMsg("📴 กรุณาเชื่อมต่ออินเทอร์เน็ตก่อน", "danger");
    }

    const startTime = performance.now(); // ⏱️ เริ่มจับเวลา

    const plate = document.getElementById("plate").value.replace(/\s/g, "").trim();
    const house = houseSelect.value;
    const purpose = (purposeSelect.value === "อื่น ๆ")
      ? otherPurposeInput.value.trim()
      : purposeSelect.value;
    const note = document.getElementById("note").value.trim();

    if (!plate || !house || !purpose || !idCardImg.files[0]) {
      return showMsg("⚠️ กรุณากรอกข้อมูลให้ครบ", "warning");
    }

    submitBtn.disabled = true;
    showMsg("⏳ กำลังบันทึกข้อมูล...", "secondary");

    try {
      const base64Image = await compressAndWatermark(idCardImg.files[0]);

      const data = new URLSearchParams({
        plate, house, purpose, note,
        filename: idCardImg.files[0].name,
        file: base64Image
      });

      const res = await fetch(SHEET_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: data
      });

      const result = await res.text();
      const isError = result.startsWith("🚫");

      const endTime = performance.now();
      const durationSec = ((endTime - startTime) / 1000).toFixed(2);

      const finalMsg = isError
        ? result
        : `${result} (ใช้เวลา ${durationSec} วินาที)`;

      showMsg(finalMsg, isError ? "danger" : "success");

      if (!isError) {
        successSound.play();
        setTimeout(() => window.location.href = "index.html", 2000);
      }
    } catch (err) {
      showMsg("❌ เกิดข้อผิดพลาด: " + err.message, "danger");
    } finally {
      submitBtn.disabled = false;
    }
  });
});

// 📢 แสดงข้อความ
function showMsg(msg, type = "info") {
  const status = document.getElementById("statusMsg");
  status.textContent = msg;
  status.className = `alert alert-${type}`;
  status.classList.remove("d-none");
}

// ✅ โหลดสถานที่
function loadHouseList() {
  fetch(`${SHEET_API_URL}?action=houseList`)
    .then(res => res.json())
    .then(data => {
      const houseSelect = document.getElementById("house");
      data.forEach(house => {
        const opt = document.createElement("option");
        opt.value = house;
        opt.textContent = house;
        houseSelect.appendChild(opt);
      });
    })
    .catch(err => {
      console.warn("❌ ไม่สามารถโหลดรายชื่อสถานที่:", err);
    });
}

// 🖼️ บีบอัดรูปและใส่ลายน้ำ
async function compressAndWatermark(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const maxW = 800;
        const scale = maxW / img.width;
        canvas.width = maxW;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // ลายน้ำ
        const watermark = "สำหรับใช้ในระบบ PSV เท่านั้น";
        const fontSize = Math.floor(canvas.width / 20);
        ctx.font = `${fontSize}px sans-serif`;
        ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(watermark, 0, 0);
        ctx.restore();

        const base64 = canvas.toDataURL("image/jpeg", 0.85).split(",")[1];
        resolve(base64);
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
