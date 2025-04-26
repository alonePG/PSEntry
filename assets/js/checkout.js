
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("checkoutForm");
  const statusMsg = document.getElementById("statusMsg");
  const submitBtn = form.querySelector("button[type='submit']");
  const successSound = document.getElementById("successSound");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const plate = document.getElementById("plate").value.trim();
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

  function showMsg(msg, type = "info") {
    statusMsg.textContent = msg;
    statusMsg.className = `alert alert-${type}`;
    statusMsg.classList.remove("d-none");
  }
});
