/* Sidebar  */
document.addEventListener("DOMContentLoaded", function () {
    const currentPath = window.location.pathname;

    const sidebar = document.getElementById('sidebar');
    const sidebarBtn = document.getElementById('toggle-btn');
    const mainContent = document.getElementById('main-content');
    // const links = document.querySelectorAll(".sidebar a");
    const links = document.querySelectorAll('.btn-tampil');
    const contents = document.querySelectorAll('.konten');

    links.forEach(link => {
        link.addEventListener('click', function (e) {
            const target = this.getAttribute('data-target');
            const href = this.getAttribute('href');
            if (window.location.pathname === href) {
                e.preventDefault();
                links.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                document.querySelectorAll('.konten').forEach(content => {
                    if ('#' + content.id === target) {
                        content.classList.remove('d-none');
                    } else {
                        content.classList.add('d-none');
                    }
                });
                history.pushState(null, '', href + target);
            }
        });
    });

    window.addEventListener('popstate', () => {
        const current = window.location.hash;
        contents.forEach(konten => {
            if ('#' + konten.id === current) {
                konten.classList.remove('d-none');
            } else {
                konten.classList.add('d-none');
            }
        });

        links.forEach(link => {
            if (link.getAttribute('data-target') === current) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    });

    if (sidebar && sidebarBtn && mainContent) {
        if (window.innerWidth > 768) {
            sidebar.classList.add('closed');
            mainContent.classList.toggle('full');
        } else {
            sidebar.classList.toggle('open');
        }

        if (currentPath.includes('/login')) {
            mainContent.classList.add('full');
            sidebar.classList.add('closed'); // hide sidebar
        } else {
            sidebar.classList.toggle('open');
        }

        sidebarBtn.addEventListener('click', () => {
            if (window.innerWidth > 768) {
                sidebar.classList.toggle('closed');
                mainContent.classList.toggle('full');
            } else {
                sidebar.classList.toggle('open');
            }
        });

        mainContent.addEventListener('click', () => {
            if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                sidebar.classList.remove('open');
                sidebar.classList.remove('closed');
                mainContent.classList.remove('full');
            } else {
                sidebar.classList.remove('closed');
                sidebar.classList.remove('open');
                mainContent.classList.remove('full');
            }
        });
    }
});

//
function tampilkan(id) {
    console.log("Menampilkan:", id);
    $(".konten").addClass("d-none");
    $(id).removeClass("d-none");
    sessionStorage.setItem("tampilkan", id);
}
$(document).ready(function () {
    const params = new URLSearchParams(window.location.search);
    let id = params.get("tampilkan");
    if (!id) id = sessionStorage.getItem("tampilkan");
    if (id) tampilkan(id.startsWith("#") ? id : `#${id}`);
    $(document).on("click", ".btn-tampil", function () {
        const target = $(this).data("target");
        tampilkan(target);
    });
});

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


//Fungsi Vclaim 
function v() {
    const payload = {};
    const url = `endpoint_disini`; // Ganti dengan endpoint
    const method = "get"; //Ganti sesuai kebutuhan method(get, post, put, delete)

    vclaim_baru(url, method, payload, function (err, res) {
        if (err) {
            return Swal.fire('Server Error', 'Internal Server Error', 'error');
        }
        // console.log("ok: ", res, " error: ", err);
        const meta = res?.metaData || res?.metadata || {};
        const code = parseInt(meta.code);
        const msg = meta.message || 'Terjadi kesalahan';

        if (code === 200) {
            Swal.fire('', msg, 'success').then(() => {
                saveSession("", res.response);
                // Tambahkan aksi sukses di sini, misalnya:
                
            });
        } else if (code === 201) {
            Swal.fire('', msg, 'info').then(() => {
                const hasil = getDummy("")?.response;
                saveSession("", hasil);
                // Tambahkan aksi dummy di sini
            });
        } else {
            Swal.fire('', msg, 'error');
        }
    });
}



//Fungsi antrewan Online
function antrean() {
    const payload = {
        // isi data di sini kalau perlu
    };

    const url = 'isi_endpoint_di_sini'; // Ganti dengan endpoint
    const method = 'get'; // Bisa diganti jadi "post", "put", "delete" sesuai kebutuhan

    antrol_rs(url, method, payload, function (err, res) {
        if (err){ console.error("error :", err);};
        // console.log("ok: ", res, " error: ", err);
        const meta = res?.metaData || res?.metadata || {};
        const code = parseInt(meta.code);
        const msg = meta.message || 'Terjadi kesalahan';

        if (code === 200) {
            Swal.fire('', msg, 'success').then(() => {
                saveSession("", res.response);
                // Tambahkan aksi sukses di sini, misalnya:
                
            });
        } else if (code === 201) {
            Swal.fire('', msg, 'info').then(() => {
                const hasil = getDummy("")?.response;
                saveSession("", hasil);
                // Tambahkan aksi dummy di sini
            });
        } else {
            Swal.fire('', msg, 'error');
        }
    });
}

/*
 * Mengisi dropdown secara fleksibel dari data array.
 * 
 * @param {string} selector - Selector jQuery elemen <select>
 * @param {Array} dataArray - Data array yang ingin di-render
 * @param {string} valueKey - Nama properti di objek sebagai value <option>
 * @param {string} labelKey - Nama properti di objek sebagai label <option>
 * @param {string} placeholder - Teks placeholder opsional
 */
function dropdown(selector, data, valueKey, labelKey, kodeKey, placeholder = "-- Pilih --") {
    const drop = $(selector);
    drop.empty();
    drop.append(`<option value="">${placeholder}</option>`);
    if (Array.isArray(data)) {
        data.forEach(item => {
            const value = item[valueKey] !== undefined ? item[valueKey] : "";
            const label = item[labelKey] !== undefined ? item[labelKey] : "";
            const kode = item[kodeKey] !== undefined ? item[kodeKey] : "";
            drop.append(`<option value="${value}">${kode} - ${label}</option>`);
        });
    } else {
        console.warn("Data bukan array:", data);
    }
}

// Get Mapping DOkter
async function getDokterHarian() {
  return new Promise((resolve, reject) => {
    $.get("/getdatadokter", function(res) {
      const data = typeof res === "string" ? JSON.parse(res) : res;
      const meta = data.metaData || {};

      if (parseInt(meta.code) === 200) {
        const dokterList = data.response || [];
        localStorage.setItem('dataDokter', JSON.stringify(dokterList));
        console.log("Data dokter tersimpan:", dokterList);
        resolve(dokterList);
      } else {
        console.warn("Gagal ambil data dokter:", meta.message);
        reject(meta.message);
      }
    }).fail(function(err) {
      console.error("Request gagal:", err);
      reject(err);
    });
  });
}

// Get Mapping Poli
async function getPoliHarian() {
  return new Promise((resolve, reject) => {
    $.get("/getdatapoli", function(res) {
      const data = typeof res === "string" ? JSON.parse(res) : res;
      const meta = data.metaData || {};

      if (parseInt(meta.code) === 200) {
        const poliList = data.response || [];
        localStorage.setItem('dataPoli', JSON.stringify(poliList));
        console.log("Data poli tersimpan:", poliList);
        resolve(poliList);
      } else {
        console.warn("Gagal ambil data poli:", meta.message);
        reject(meta.message);
      }
    }).fail(function(err) {
      console.error("Request gagal:", err);
      reject(err);
    });
  });
}


// Get Jadwal Dokter
async function getJadwalHarian() {
  return new Promise((resolve, reject) => {
    $.get("/updatejadwaldokterbpjs", function(res) {
      const data = typeof res === "string" ? JSON.parse(res) : res;
      const meta = data.metaData || {};

      if (parseInt(meta.code) === 200) {
        const jadwalList = data.response || [];
        localStorage.setItem('jadwalDokter', JSON.stringify(jadwalList));
        console.log("Data Jadwal Dokter tersimpan:", jadwalList);
        resolve(jadwalList);
      } else {
        console.warn("Gagal ambil data poli:", meta.message);
        reject(meta.message);
      }
    }).fail(function(err) {
      console.error("Request gagal:", err);
      reject(err);
    });
  });
}

// Helper buat ambil nested value
function getNestedValue(obj, path) {
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined) ? o[k] : '', obj);
}

//Render Table
function renderTable(selector, data, columns = [], actions = null, emptyMessage = "Belum ada data.", enableExport = false, exportKey = null) {
    const $table = $(selector);
    $table.empty();
    if (enableExport && exportKey) {
        sessionStorage.setItem(exportKey, JSON.stringify({ columns, data }));
    }
    // Buat header
    let headerHTML = "<tr>";
    columns.forEach(col => {
        headerHTML += `<th>${col.label}</th>`;
    });
    if (actions) {
        headerHTML += `<th>Aksi</th>`;
    }
    headerHTML += "</tr>";
    $table.append(`<thead class="table-info align-top">${headerHTML}</thead>`);

    // Buat body
    const $tbody = $("<tbody>");
    if (data && data.length > 0) {
        data.forEach((item, index) => {
            let rowHTML = "<tr>";
            columns.forEach(col => {
                const value = col.key === "index" ? (index + 1) : getNestedValue(item, col.key);
                rowHTML += `<td>${value}</td>`;
            });
            if (actions) {
                let aksiHTML = actions.map(act => {
                    return `<button class="btn btn-sm ${act.class}" data-id="${item[act.keyId]}" onclick="${act.onclick}('${item[act.keyId]}')">${act.label}</button>`;
                }).join(" ");
                rowHTML += `<td>${aksiHTML}</td>`;
            }
            rowHTML += "</tr>";
            $tbody.append(rowHTML);
        });
    } else {
        $tbody.append(`<tr><td colspan="${columns.length + (actions ? 1 : 0)}" class="text-center">${emptyMessage}</td></tr>`);
    }

    $table.append($tbody);
}

/* Contoh Penggunaan
const columns = [
    { key: "nama", label: "Nama" },
    { key: "hari", label: "Hari" },
    { key: "jamBuka", label: "Jam Buka" },
    { key: "jamTutup", label: "Jam Tutup" }
];

const data = [
    { nama: "dr. A", hari: "Senin", jamBuka: "08:00", jamTutup: "12:00" },
    { nama: "dr. B", hari: "Selasa", jamBuka: "09:00", jamTutup: "13:00" }
];

const actions = [
    {
        name: "edit",
        label: "Edit",
        class: "btn btn-warning btn-sm"
    },
    {
        name: "delete",
        label: "Hapus",
        class: "btn btn-danger btn-sm"
    }
];

renderTable("#myTable", columns, data, actions);

$(document).on("click", "button[data-action]", function () {
    const row = $(this).data("row");
    const action = $(this).data("action");
    const key = $(this).data("key");
    console.log("Baris ke:", row, "Aksi:", action, "Key:", key);
    // Tambahkan logika berdasarkan action
});

*/

const kunjunganList = {
    "1": "Rujukan FKTP", "2": "Rujukan Internal", "3":"Kontrol", "4": "Rujukan Antar RS"
};

const hariList = {
    "1": "Senin", "2": "Selasa", "3": "Rabu", "4": "Kamis",
    "5": "Jumat", "6": "Sabtu", "7": "Minggu"
};

//Fungsi Export ke Excel
function exportToExcel(tableId, filename = "export.xlsx") {
    const table = document.getElementById(tableId);
    if (!table) {
        alert("Tabel tidak ditemukan!");
        return;
    }

    // Ambil header
    const headers = Array.from(table.querySelectorAll("thead th"))
        .map(th => th.innerText.trim());

    // Ambil data
    const rows = Array.from(table.querySelectorAll("tbody tr")).map(tr => {
        return Array.from(tr.querySelectorAll("td")).map(td => td.innerText.trim());
    });

    // Gabung header + data
    const data = [headers, ...rows];

    // Buat worksheet dari array
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Simpan file
    XLSX.writeFile(wb, filename);
}
/*cara pakai
exportTableToExcel("myTable", "data-antrean.xlsx");
*/

async function getDataHarian (){
    await getDokterHarian();
    await getPoliHarian();
    getJadwalHarian();
}

$(document).ready(function () {
    const status = $("#konten").val();

    if (status === "Kawin") {
        $("#kontentab").addClass("d-none");   // sembunyikan kontentab
        $("#kawin").removeClass("d-none");    // tampilkan kawin
    }
});


// Fungsi Cetak Surat
async function cetakSurat(jenis, payload) {
  try {
    const response = await fetch(`/cetaksurat/${jenis}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    console.log("hasil cetak:", result);

    if (result.status === "ok") {
      window.open(result.url, "_blank"); 
    } else {
      alert(result.error || "Gagal mencetak surat");
    }

  } catch (err) {
    console.error("Error cetak:", err);
  }
}
