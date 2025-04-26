document.addEventListener("DOMContentLoaded", () => {
    const ua = navigator.userAgent;
    const isLine = /Line/i.test(ua);
    const isFacebook = /FBAV|FBAN/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
  
    if (isLine || isFacebook) {
      const warning = document.createElement("div");
      warning.className = "alert alert-warning text-center mb-3";
      warning.innerHTML = `
        🚫 ระบบนี้อาจใช้งานไม่สมบูรณ์ในแอป LINE หรือ Facebook<br>
        <b>กรุณาเปิดในเบราว์เซอร์ เช่น Chrome หรือ Safari</b><br><br>
        ${
          isAndroid
            ? `<a href="intent://alonepg.github.io/PSEntry/index.html#Intent;scheme=https;package=com.android.chrome;end"
                class="btn btn-sm btn-outline-primary">🚀 เปิดใน Chrome</a>`
            : isIOS
            ? `📱 กรุณากดแชร์ > เลือก "เปิดใน Safari"`
            : `กรุณาคัดลอกลิงก์ไปเปิดในเบราว์เซอร์`
        }
      `;
      document.body.prepend(warning);
    }
  });
  