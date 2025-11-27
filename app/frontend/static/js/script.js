//Logout
document.getElementById('logoutBtn').addEventListener('click', function () {
    Swal.fire({
        title: 'Konfirmasi Keluar',
        text: "Apakah anda yakin ingin keluar?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = "/logout";
        }
    });
});

//Simpan Session Data
function saveSession(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
}

function localSession(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// Ambil Session Data
function getSession(key) {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
};
function getLocal(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
};

// Hapus session
function clearSession(key) {
    sessionStorage.removeItem(key);
}
function clearLocal(key) {
    localStorage.removeItem(key);
}


function formatWaktu(value) {
    // console.log('Waktu Diterima: ', value)
  if (!value) return undefined;
  let d;
  if (!isNaN(value) && typeof value === "number") {
    d = new Date(parseInt(value))
  }
  else if (typeof value === "string") {
    d = new Date(value);
  }
  if (!d || isNaN(d.getTime())) return "-"
  const jam = d.getHours().toString().padStart(2, "0");
    const menit = d.getMinutes().toString().padStart(2, "0");

    return `${jam}:${menit} WIB`;
}
