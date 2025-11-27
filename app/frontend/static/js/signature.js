function initSignature(canvasId, clearBtnId) {
  const canvas = document.getElementById(canvasId);
  const clearBtn = document.getElementById(clearBtnId);

  if (!canvas) return console.error(`Canvas ${canvasId} tidak ditemukan`);

  const pad = new SignaturePad(canvas);

  clearBtn?.addEventListener("click", () => pad.clear());

  return pad; // bisa dipakai lagi di luar
}

const signaturePads = [
  initSignature("sign-pasien", "clear-pasien"),
  initSignature("sign-petugas", "clear-petugas"),
];