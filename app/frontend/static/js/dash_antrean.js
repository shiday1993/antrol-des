// Script jam
setInterval(() => {
    const now = new Date();

    const tgl = String(now.getDate()).padStart(2, '0');
    const bln = String(now.getMonth() + 1).padStart(2, '0');
    const thn = now.getFullYear();

    const jam = String(now.getHours()).padStart(2, '0');
    const menit = String(now.getMinutes()).padStart(2, '0');
    const detik = String(now.getSeconds()).padStart(2, '0');

    const waktu = `${tgl}/${bln}/${thn} at ${jam}:${menit}:${detik}`;

    document.getElementById('jamRealtime').innerText = waktu;
}, 1000);

function batal() {
    window.location.href = "/antrol", tampilkan("#antreanonline");
};

$(document).ready(function () {
    const params = new URLSearchParams(window.location.search);
    const konten = params.get('tampilkan');
    if (konten) {
        tampilkan(`#${konten}`);
    }
});

//Fungsi antrean Per Tanggal
function getDokterMap() {
    const raw = localStorage.getItem('dataDokter') || getSession('dataDokter');
    const list = raw ? JSON.parse(raw) : [];
    const map = {};
    list.forEach(d => {
        map[d.kodedokter] = d.namadokter;
    });
    return map;
}



// Buat mapping kdpoli -> nmpoli
// function getPoliMap() {
//     const data = localStorage.getItem('dataPoli') || getSession('dataPoli');
//   const map = {};
//   data.forEach(item => {
//     // supaya tidak overwrite, cek dulu
//     if (!map[item.kdpoli]) {
//       map[item.kdpoli] = item.nmpoli;
//     }
//   });
//   return map;
// }

// function getPoliMap() {
//     const raw = localStorage.getItem('dataPoli') || getSession('dataPoli');
//     const list = raw ? JSON.parse(raw) : [];
//     const map = {};
//     list.forEach(d => {
//         map[d.kodepoli] = d.namapoli;
//     });
//     return map;
// }

[
    {
        "jeniskunjungan": 1,
        "nomorreferensi": "0137B0020825P000003",
        "createdtime": 1759805073440,
        "kodebooking": "071025INT001",
        "norekammedis": "00000132",
        "nik": "3201032802570002",
        "nokapst": "0002042882695",
        "noantrean": "KL-001",
        "kodepoli": "INT",
        "sumberdata": "Bridging Antrean",
        "estimasidilayani": 1759803569120,
        "kodedokter": 12007,
        "jampraktek": "16:00-17:00",
        "nohp": "085635228000",
        "tanggal": "2025-10-07",
        "ispeserta": true,
        "status": "Belum dilayani"
    }
]

// ======================================================
// ---- Start of Fungsi Antrean Poli----
// ======================================================

// --- Render Tabel Antrean dengan FIFO ---
function renderTabelAntrean(data) {
    const list = data.list || data || [];
    const $tbody = $('#tabel-antrean tbody');
    $tbody.empty();

    if (list.length === 0) {
        $tbody.append('<tr><td colspan="13" class="text-center">Tidak ada data.</td></tr>');
        return;
    }

    const dokterMap = getDokterMap();
    // const poliMap = getPoliMap();
    const firstIndexByDokter = {}; // tracking pasien pertama per dokter
    const busyDokterSet = new Set(
        list.filter(a => a.status === "Sedang Dilayani").map(a => a.kodedokter)
    );

    list.forEach((item, index) => {
        const dok = dokterMap[item.kodedokter] || item.kodedokter || '-';
        const pasien = `<b>NIK : </b>${item.nik}<br>
                        <b>No. Peserta : </b>${item.nokapst}<br>
                        <b>No. RM : </b>${item.norekammedis}<br>`;
        const poli = item.kodepoli || "-";
        const dokter = dok || '-';
        const peserta = item.ispeserta == 1 ? 'BPJS' : 'Umum';
        const kodebooking = item.kodebooking;
        const noantrean = item.noantrean;
        const jamdaftar = "" || formatTimestamp(item.createdtime);
        const jampanggil = "" || formatTimestamp(item.estimasidilayani);
        const status = item.status;
        const sumber = item.sumberdata || '-';
        const cetakBtn = `<button class="btn btn-sm btn-secondary" data-cetak=${kodebooking} onclick="cetakAntreanPoli('${kodebooking}')">Cetak</button>`;

        let aksiBtn = "";

        // === Logika FIFO per Dokter ===
        if (status === "Belum dilayani") {
            // Dokter sedang melayani pasien lain
            if (busyDokterSet.has(item.kodedokter)) {
                aksiBtn = `<span class="badge bg-light text-muted">Menunggu</span>`;
            }
            // Pasien pertama untuk dokter ini
            else if (!firstIndexByDokter[item.kodedokter]) {
                firstIndexByDokter[item.kodedokter] = true;
                busyDokterSet.add(item.kodedokter);
                aksiBtn = `
                    <div class="d-grid gap-1">
                        <button class="btn btn-sm btn-success py-1"
                            onclick="panggilPasien('${kodebooking}','${item.kodedokter}')">
                            Panggil
                        </button>
                        <span id="timer-${kodebooking}" class="small text-muted">00:00:00</span>
                    </div>`;
            } else {
                aksiBtn = `<span class="badge bg-light text-muted">Menunggu</span>`;
            }
        } else {
            // status lain ditangani oleh helper
            aksiBtn = getAksiHTML(item, item.kodedokter, kodebooking);
        }

        const row = `
            <tr class='align-center' 
                data-kodebooking="${kodebooking}" 
                data-status="${status}" 
                data-kodedokter="${item.kodedokter}"
                data-noantrean="${noantrean}">                
                <td>${index + 1}</td>
                <td class="td-pasien" style="white-space: nowrap;">${pasien}</td>
                <td class="td-poli">${poli}</td>
                <td class="td-dokter">${dokter}</td>
                <td class="td-peserta">${peserta}</td>
                <td class="td-kodebooking">${kodebooking}</td>
                <td class="td-noantrean">${noantrean}<div class="mt-1">${cetakBtn}</div></td>
                <td class="td-jamdaftar">${jamdaftar}</td>
                <td class="td-jampanggil">${jampanggil}</td>
                <td class="td-status">${status}</td>
                <td class="td-sumber">${sumber}</td>
                <td class="td-aksi" style="white-space: nowrap;">${aksiBtn}</td>
            </tr>
        `;
        $tbody.append(row);
    });
}

// --- Fungsi untuk mengatur tombol aksi berdasarkan status ---
function getAksiHTML(item, kodeDokter, kodebooking) {
    const status = item.status || "Belum dilayani";

    if (status === "Sedang Dilayani") {
        return `
            <div class="d-grid gap-1">
                <button class="btn btn-sm btn-info py-1"
                    onclick="selesaiPasien('${kodebooking}','${kodeDokter}')">Selesai</button>
                <button class="btn btn-sm btn-warning py-1"
                    onclick="lewatiPasien('${kodebooking}','${kodeDokter}')">Lewati</button>
                <button class="btn btn-sm btn-danger py-1"
                    onclick="batalPasien('${kodebooking}','${kodeDokter}')">Batal</button>
                <button class="btn btn-sm btn-success py-1"
                    onclick="panggilLagi('${kodebooking}','${kodeDokter}')">Panggil Lagi</button>
                <span id="timer-${kodebooking}" class="small text-muted">00:00:00</span>
            </div>`;
    }

    if (status === "Selesai Dilayani") {
        const total = item.totalWaktu || "-";
        return `<span class="badge bg-success">Selesai</span><br><small>Total: ${total}</small>`;
    }

    if (status === "Dilewati") {
        return `<span class="badge bg-warning text-dark">Dilewati</span>
        <div class="mt-1">
            <button class="btn btn-sm btn-success py-1"
                onclick="panggilLagi('${kodebooking}','${kodeDokter}')">Panggil Lagi</button>
        </div>`;
    }

    if (status === "Batal") {
        return `<span class="badge bg-danger">Batal</span>`;
    }

    return `<span class="badge bg-light text-muted">Menunggu</span>`;
}


// --- Variabel Global ---
let intervalId = {};   // { index: intervalId }
let startTime = {};    // { index: timestamp mulai panggil }
let endTime = {};      // { index: timestamp selesai }

// --- Format Durasi Helper ---
function formatDurasi(ms) {
    const s = Math.floor(ms / 1000);
    const jam = String(Math.floor(s / 3600)).padStart(2, "0");
    const menit = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const detik = String(s % 60).padStart(2, "0");
    return `${jam}:${menit}:${detik}`;
}

// --- Fungsi Auto-Refresh FIFO per Dokter ---
function refreshAntreanDokter(kodeDokter) {
    const $rows = $(`#tabel-antrean tbody tr[data-kodedokter='${kodeDokter}']`);
    let found = false;
    $rows.each(function (i, tr) {
        const $tr = $(tr);
        const status = $tr.attr("data-status");
        const kodebooking = $tr.attr("data-kodebooking"); // string tetap aman
        if (status === "Belum dilayani" && !found) {
            found = true;
            $tr.find(".td-aksi").html(`
                <div class="d-grid gap-1">
                    <button id="panggilpoli-${kodebooking}"
                        data-kodebooking="${kodebooking}"
                        data-kodedokter="${kodeDokter}"
                        class="btn btn-sm btn-success py-1" 
                        onclick="panggilPasien('${kodebooking}', '${kodeDokter}')">Panggil</button>
                    <span id="timer-${kodebooking}">00:00</span>                         
                </div>
            `);
        } else if (status === "Belum dilayani") {
            $tr.find(".td-aksi").html(`<span class="badge bg-light text-muted">Menunggu</span>`);
        }
    });
}

// // --- Fungsi Panggil Pasien (pakai kodebooking) ---
// function panggilPasien(kodebooking, kodeDokter) {
//     const $row = $(`#tabel-antrean tbody tr[data-kodebooking='${kodebooking}']`);
//     if (!$row.length) return;

//     $row.attr("data-status", "Sedang Dilayani");
//     $row.find(".td-status").text("Sedang Dilayani");

//     // bersihkan interval lama bila ada (safety)
//     if (intervalId[kodebooking]) {
//         clearInterval(intervalId[kodebooking]);
//         delete intervalId[kodebooking];
//     }

//     // Timer start
//     startTime[kodebooking] = Date.now();
//     intervalId[kodebooking] = setInterval(() => {
//         const elapsed = Date.now() - startTime[kodebooking];
//         $(`#timer-${kodebooking}`).text(formatDurasi(elapsed));
//     }, 1000);

//     // ubah tombol menjadi Selesai / Lewati / Batal
//     $row.find(".td-aksi").html(`
//         <div class="d-grid gap-1">
//             <button class="btn btn-sm btn-info py-1"
//                 onclick="selesaiPasien('${kodebooking}', '${kodeDokter}')">Selesai
//             </button>
//             <span id="timer-${kodebooking}">00:00:00</span>
//             <button class="btn btn-sm btn-warning py-1"
//                 onclick="lewatiPasien('${kodebooking}', '${kodeDokter}')">Lewati
//             </button>
//             <button class="btn btn-sm btn-danger py-1"
//                 onclick="batalPasien('${kodebooking}', '${kodeDokter}')">Batal
//             </button>
//         </div>        
//     `);
// }

// --- Fungsi Panggil Pasien (upgrade) ---
async function panggilPasien(kodebooking, kodeDokter) {
    const $row = $(`#tabel-antrean tbody tr[data-kodebooking='${kodebooking}']`);
    if (!$row.length) return;

    // ubah status lokal
    $row.attr("data-status", "Sedang Dilayani");
    $row.find(".td-status").text("Sedang Dilayani");

    // --- Jalankan TTS (text-to-speech) ---
    const noAntrean = $row.find(".td-noantrean").text().trim();
    const namaDokter = $row.find(".td-dokter").text().trim();
    speak(`Nomor antrean ${noAntrean}, silakan menuju ke ${namaDokter}`);

    // --- Timer Start ---
    if (intervalId[kodebooking]) clearInterval(intervalId[kodebooking]);
    startTime[kodebooking] = Date.now();
    intervalId[kodebooking] = setInterval(() => {
        const elapsed = Date.now() - startTime[kodebooking];
        $(`#timer-${kodebooking}`).text(formatDurasi(elapsed));
    }, 1000);

    // --- Update backend ---
    try {
        const res = await fetch("/antrean/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ kodebooking, status: "Sedang Dilayani" })
        });
        const json = await res.json();
        console.log("Update response:", json);
    } catch (err) {
        console.error("Error update backend:", err);
    }

    // --- Ubah tombol aksi (menggunakan helper getAksiHTML) ---
    const item = {
        status: "Sedang Dilayani"
    };
    const aksiHTML = getAksiHTML(item, kodeDokter, kodebooking);
    $row.find(".td-aksi").html(aksiHTML);
}

function panggilLagi(kodebooking, kodeDokter) {
    const $row = $(`#tabel-antrean tbody tr[data-kodebooking='${kodebooking}']`);
    const noAntrean = $row.find(".td-noantrean").text().trim();
    const namaDokter = $row.find(".td-dokter").text().trim();
    speak(`Nomor antrean ${noAntrean}, silakan menuju ke ${namaDokter}`);
}

// --- Fungsi Selesai Pasien (pakai kodebooking) ---
function selesaiPasien(kodebooking, kodeDokter) {
    // stop timer
    if (intervalId[kodebooking]) {
        clearInterval(intervalId[kodebooking]);
        delete intervalId[kodebooking];
    }
    endTime[kodebooking] = Date.now();

    const $row = $(`#tabel-antrean tbody tr[data-kodebooking='${kodebooking}']`);
    if (!$row.length) return;

    $row.attr("data-status", "Selesai Dilayani");
    $row.find(".td-status").text("Selesai Dilayani");

    const durasi = startTime[kodebooking] ? (endTime[kodebooking] - startTime[kodebooking]) : 0;
    $row.find(".td-aksi").html(`
        <span class="badge bg-secondary">Selesai</span>
        <div><small>Total: ${formatDurasi(durasi)}</small></div>
    `);

    // aktifkan pasien berikutnya untuk dokter ini
    refreshAntreanDokter(kodeDokter); // refresh tombol panggil

    // TODO: update ke server
}

// --- Fungsi Lewati Pasien ---
function lewatiPasien(kodebooking, kodeDokter) {
    // stop timer jika ada
    if (intervalId[kodebooking]) {
        clearInterval(intervalId[kodebooking]);
        delete intervalId[kodebooking];
    }

    const $row = $(`#tabel-antrean tbody tr[data-kodebooking='${kodebooking}']`);
    if (!$row.length) return;

    // set status Dilewati
    $row.attr("data-status", "Dilewati");
    $row.find(".td-status").text("Dilewati");
    $row.find(".td-aksi").html(`<span class="badge bg-warning text-dark">Dilewati</span>`);

    // refresh supaya pasien berikutnya untuk dokter yang sama dapat tombol Panggil
    refreshAntreanDokter(kodeDokter); // refresh tombol panggil

    // TODO: update ke server
}

// --- Fungsi Batal Pasien ---
function batalPasien(kodebooking, kodeDokter) {
    // stop timer jika ada
    if (intervalId[kodebooking]) {
        clearInterval(intervalId[kodebooking]);
        delete intervalId[kodebooking];
    }

    // hapus baris yang tepat
    $(`#tabel-antrean tbody tr[data-kodebooking='${kodebooking}']`).remove();

    // refresh supaya tombol panggil muncul bila perlu
    refreshAntreanDokter(kodeDokter); // refresh tombol panggil

    // TODO: update ke server
}

function speak(text) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "id-ID";
    const voices = speechSynthesis.getVoices();
    const female = voices.find(v => v.lang.includes("id") && v.name.toLowerCase().includes("female"));
    if (female) utter.voice = female;
    speechSynthesis.speak(utter);
}

// -------------------- Cetak Thermal Antrean Poli (58mm) --------------------
function cetakAntreanPoli(kodebooking) {
  // cari baris antrean berdasarkan kodebooking
  const $row = $(`#tabel-antrean tbody tr[data-kodebooking='${kodebooking}']`);
  if (!$row.length) {
    Swal.fire("", "Data antrean tidak ditemukan.", "info");
    return;
  }

  // ambil data dari atribut dan kolom tabel
  const nomor   = $row.attr("data-noantrean") || "-";
  const dokter  = $row.find(".td-dokter").text().trim() || "-";
  const poli    = $row.find(".td-poli").text().trim() || "-";
  const tanggal = new Date().toLocaleString("id-ID");

  // buka jendela cetak thermal
  const win = window.open("", "_blank", "width=900,height=700");
  win.document.write(`
    <html>
      <head>
        <title>Cetak Antrean Poli</title>
        <style>
          @page { size: 56mm auto; margin: 10px; }
          body {
            font-family: 'Arial', sans-serif;
            text-align: center;
            margin: 0;
            padding: 8px;
            width: 58mm;
          }
          h1 {
            font-size: 42px;
            margin: 6px 0;
          }
          h2 {
            font-size: 16px;
            margin: 2px 0;
          }
            h3 {
            font-size: 16px;
            margin: 2px 0;
          }
          p {
            font-size: 12px;
            margin: 2px 0;
          }
          .line {
            border-top: 1px dashed #000;
            margin: 6px 0;
          }
        </style>
      </head>
      <body>
        <h2><strong>KL KLINIK</strong></h2>
        <div class="line"></div>
        <p>Nomor Antrean</p>        
        <h1>${nomor}</h1>
        <h3>Poli ${poli}</h3>
        <h2>${dokter}</h2>
        <div class="line"></div>
        <p>${tanggal}</p>
        <b>Terima kasih</b>
        <script>
          window.print();
          window.onafterprint = () => window.close();
        </script>
      </body>
    </html>
  `);
  win.document.close();
}

// ===================================================
// End of Fungsi Antrean Poli
// ===================================================


function batalPanggil() {
    batalAntrean();
}


function batalAntrean() {
    const payload = {
        "kodebooking": "16032021A001",
        "keterangan": "Terjadi perubahan jadwal dokter, silahkan daftar kembali"
    };
    const url = `antrean/batal`; // Ganti dengan endpoint
    const method = 'post'; // Bisa diganti jadi "post", "put", "delete" sesuai kebutuhan
    antrol_rs(url, method, payload, function (err, res) {
        if (err) {
            return Swal.fire('Server Error', 'Internal Server Error', 'error');
        }
        // console.log("ok: ", res, " error: ", err);
        const meta = res?.metaData || res?.metadata || {};
        const code = parseInt(meta.code);
        const msg = meta.message || 'Terjadi kesalahan';
        if (code === 200) {
            Swal.fire('', msg, 'success');
        } else if (code === 201) {
            Swal.fire('', msg, 'info');
        } else {
            Swal.fire('', msg, 'error');
        }
    });
}

$(document).ready(function () {
    if (!$("#tanggal_dashboard").val()) {
        const today = new Date().toISOString().split("T")[0];
        $("#tanggal_dashboard").val(today);
        $("#tanggal_farmasi").val(today);
    }
});


function antreanperhariini() {
    const tanggal = new Date().toISOString().slice(0, 10);
    const payload = { tanggal };
    const url = `antrean_pertanggal`;
    const method = "get"; 
    antrol_rs(url, method, payload, function (err, res) {
        if (err) return Swal.fire('Server Error', 'Internal Server Error', 'error');
        const meta = res.metadata || res.metaData || {};
        const { code, message } = meta;
        if (code === 200) {
            const hasil = res.response;
            console.log("Respon BPJS:",hasil)
            Swal.fire('', message, 'success').then((result) => {
                saveSession("antreantanggal", hasil);
                if (result.isConfirmed) { renderTabelAntrean(hasil); }
            });
        } else if (code === 201 || code === 204) {
            Swal.fire('', message, 'info').then((result) => {
                const hasil = getDummy("antreantanggal")?.response;
                saveSession("antreantanggal", hasil);
                if (result.isConfirmed) { renderTabelAntrean(hasil); }
            });
        } else {
            Swal.fire('', message || 'Terjadi kesalahan', 'error');
        }
    });
};

function antreantanggal() {
    const tanggal = $("#tanggal_dashboard").val();
    if (!tanggal) { Swal.fire("", "Harap Pilih Tanggal Terlebih Dahulu!.", 'warning'); return; };
    const payload = { tanggal };
    const url = `antrean_pertanggal`;
    const method = "get"; //ganti method dengan "get", "post", "put", "delete"

    antrol_rs(url, method, payload, function (err, res) {
        if (err) return Swal.fire('Server Error', 'Internal Server Error', 'error');
        const meta = res.metadata || res.metaData || {};
        const { code, message } = meta;
        if (code === 200) {
            const hasil = res.response;
            console.log("Respon BPJS:",hasil)
            Swal.fire('', message, 'success').then((result) => {
                saveSession("antreantanggal", hasil);
                if (result.isConfirmed) { renderTabelAntrean(hasil); }
            });
        } else if (code === 201 || code === 204) {
            Swal.fire('', message, 'info').then((result) => {
                const hasil = getDummy("antreantanggal")?.response;
                saveSession("antreantanggal", hasil);
                if (result.isConfirmed) { renderTabelAntrean(hasil); }
            });
        } else {
            Swal.fire('', message || 'Terjadi kesalahan', 'error');
        }
    });
};

function cariDataRujukan() {
    const kartu = $('input[name="kartu"]:checked').val();
    let identitas = kartu === "nik" ? $("#no_nik").val() : $("#nokartu_bpjs").val();

    if (!identitas) return Swal.fire("", "Harap isi nomor kartu terlebih dahulu!", 'warning');

    const url = `Rujukan/RS/Peserta/${identitas}`;
    const method = 'get';

    vclaim_baru(url, method, {}, function (err, res) {
        if (err) { console.error("error: ", err) };

        const meta = res?.metaData || res?.metadata || {};
        const code = parseInt(meta.code);
        const msg = meta.message;

        if (code === 200) {
            Swal.fire('', msg, 'success').then(() => {
                const data = res?.response || {};
                saveSession("rujukan_bpjs", data);
                tampilkanDataRujukan(data);
                const modal = new mdb.Modal(document.getElementById("dataRujukan"));
                modal.show();
            });
        } else {
            Swal.fire('', msg, 'error').then(() => {
                const data = getDummy("rujukan")?.response || {};
                saveSession("rujukan_bpjs", data);
                // console.log(data);
                tampilkanDataRujukan(data);
                const modal = new mdb.Modal(document.getElementById("dataRujukan"));
                modal.show();
            });

        }
    });
}



function tampilkanDataRujukan() {
    const data = getSession("rujukan_bpjs")?.rujukan || getSession("rujukan_bpjs") || {};
    const p = data.peserta;
    console.log(data);
    if (!data) return;
    $("#nik_bpjs").text(p.nik);
    $("#nomorRujukan_bpjs").text(data.noKunjungan);
    $("#norujukan_bpjs").val(data.noKunjungan);
    $("#nama_bpjs").val(p.nama);
    $("#jk_bpjs").val(p.sex);
    $("#nokartu_bpjs").val(p.nokartu);
    $("#tgllahir_bpjs").text(p.tglLahir);
    $("#tgllahir_bpjs").text(p.tglLahir);
    $("#jnsrujukan_bpjs").text(data.pelayanan.nama);
    $("#tglRujukan_bpjs").text(data.tglKunjungan);
    $("#namars_bpjs").text(data.provPerujuk.nama);
    $("#namapoli_bpjs").text(data.poliRujukan.nama);
}

function add_AntreanBPJS() {
    const estimasi = $("#estimasi").val();
    let estimasidilayani = null;
    if (estimasi) {
        estimasidilayani = new Date(estimasi).getTime();
    }
    const payload = {
        "kodebooking": $("#kodebooking_add").val(),
        "jenispasien": "JKN",
        "nomorkartu": $("#nokartu_bpjs").val(),
        "nik": $("#no_nik_add").val(),
        "nohp": $("#nohp_add").val(),
        "kodepoli": $("#kodepoli_add").val(),
        "namapoli": $("#namapoli_add").val(),
        "pasienbaru": $("#pasienLama").val(),
        "norm": $("#norm_add").val(),
        "tanggalperiksa": $("#tanggalperiksa_add").val(),
        "kodedokter": $("#kodedokter_add").val(),
        "namadokter": $("#namadokter_add").val(),
        "jampraktek": $("#jampraktekdokter_add").val(),
        "jeniskunjungan": $("#jeniskunjungan_add").val(),
        "nomorreferensi": $("#momorreferensi_add").val(),
        "nomorantrean": $("#nomorantrean_add").val(),
        "angkaantrean": $("#angkaantrean_add").val(),
        "estimasidilayani": estimasidilayani,
        "sisakuotajkn": $("#sisakuotajkn_add").val() || "",
        "kuotajkn": $("#kuotajkn_add").val() || "",
        "sisakuotanonjkn": $("#sisakuotanonjkn_add").val() || "",
        "kuotanonjkn": $("#kuotanonjkn_add").val() || "",
        "keterangan": $("#keterangan_add").val() || ""
    };
    const url = `antrean_add`;
    const method = "post"; //ganti method dengan "get", "post", "put", "delete"
    console.log(payload);
    antrol_rs(url, method, payload, function (err, res) {
        if (err) { console.error("error :", err); };
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
};

function pilihPeserta() {
    const modal = mdb.Modal.getInstance(document.getElementById("dataRujukan"));
    if (modal) { modal.hide(); };
}
function antreanfarmasi() {
    const payload = {
        "kodebooking": "16032021A001",
        "jenisresep": "racikan",
        "nomorantrean": 1,
        "keterangan": ""
    };

    const url = `antrean/farmasi/add`;
    const method = "post"; //ganti method dengan "get", "post", "put", "delete"

    antrol_rs(url, method, payload, function (err, res) {
        if (err) {
            return Swal.fire('Server Error', 'Internal Server Error', 'error');
        }
        // console.log("ok: ", res, " error: ", err);
        const meta = res?.metaData || res?.metadata || {};
        const code = parseInt(meta.code);
        const msg = meta.message || 'Terjadi kesalahan';

        if (code === 200) {
            Swal.fire(msg, '', 'success');
        } else if (code === 201) {
            Swal.fire('', msg, 'info');
        } else {
            Swal.fire('', msg, 'error');
        }
    });
};


function excel_dash_antrean() {
    const data = getSession('antreantanggal');
    const list = data.list || [];

    // Buat data yang akan diekspor (bisa dipilih kolom mana saja yang mau disertakan)
    const exportData = list.map((item, index) => {
        return {
            No: index + 1,
            'NIK': item.nik,
            'No. Peserta': item.nokapst,
            'No. RM': item.norekammedis,
            'Poli': item.kodepoli,
            'Dokter': getDokterMap()[item.kodedokter] || item.kodedokter || '-',
            'Peserta': item.ispeserta == 1 ? 'BPJS' : 'Umum',
            'Kode Booking': item.kodebooking,
            'No Antrean': item.noantrean,
            'Jam Daftar': formatTimestamp(item.createdtime),
            'Jam Panggil': formatTimestamp(item.estimasidilayani),
            'Status': item.status || '-',
            'Sumber': item.sumberdata || '-',
            'Check-in': item.jeniskunjungan === 1 ? 'Rujukan' : 'Mandiri'
        };
    });

    // Buat worksheet dan workbook
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Antrean");

    // Buat nama file berdasarkan tanggal hari ini
    const today = new Date();
    const tanggal = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `antrean(${tanggal}).xlsx`;

    // Simpan file
    XLSX.writeFile(wb, filename);
}

function updateDokter() {
    const payload = {
        kodepoli: $('#kodePoliJadwal').val(),
        kodesubspesialis: $('#kodeSubspesialisJadwal').val(),
        kodedokter: parseInt($('#kodeDokterJadwal').val()),
        jadwal: ambilJadwalDariTabel()
    };
    console.log(payload);
    antrol_rs('jadwaldokter/updatejadwaldokter', 'post', payload, function (err, res) {
        if (err) return Swal.fire('Server Error', 'Internal Server Error', 'error');

        const meta = res?.metaData || res?.metadata || {};
        const code = parseInt(meta.code);
        const msg = meta.message || 'Terjadi kesalahan';

        if (code === 200) {
            Swal.fire('', msg, 'success').then(() => {
                saveSession("", res.response);
            });
        } else if (code === 201) {
            Swal.fire('', msg, 'info').then(() => {
                const hasil = getDummy("")?.response;
                saveSession("", hasil);
            });
        } else {
            Swal.fire('', msg, 'error');
        }
    });
}

// function tampilkanDaftarDokter() {
//     refDokter();
//     // const list = getLocal('dataDokter');
//     const list = getSession('datadokter');
//     const $tbody = $("#dokterList");
//     $tbody.empty();

//     list.forEach((d, i) => {
//         const $tr = $(`
//       <tr>
//         <td>${i + 1}</td>
//         <td><a href="#" class="buka-jadwal" 
//                data-kodedokter="${d.kodedokter}" 
//                data-namadokter="${d.namadokter}" 
//                data-kodepoli="${d.kodepoli}" 
//                data-kodesub="${d.kodesubspesialis}|| ${d.kodedokter}">
//               ${d.namadokter}
//             </a>
//         </td>
//         <td>${d.namapoli}</td>
//         <td>${d.namasubspesialis}</td>
//         <td>${d.kodesubspesialis}</td>
//       </tr>
//     `);
//         $tbody.append($tr);
//     });

//     // Tambahkan event listener ke link setelah elemen dimasukkan ke DOM
//     $tbody.on("click", ".buka-jadwal", function (e) {
//         e.preventDefault();
//         const $a = $(this);
//         const kodedokter = $a.data("kodedokter");
//         const namadokter = $a.data("namadokter");
//         const kodepoli = $a.data("kodepoli");
//         const kodesub = $a.data("kodesub");

//         bukaFormJadwal(kodedokter, namadokter, kodepoli, kodesub);
//     });
// }


function cariDataDokter() {
    cari_data_dokter();
}

let poliLoaded = false;
$("#pilih_poli_data").on("click", function () {
    if (!poliLoaded) {
        cari_data_poli();
        poliLoaded = true;
    }
});


function cari_data_poli() {
    const payload = {};
    const url = `ref/poli`;
    const method = "get";
    antrol_rs(url, method, payload, function (err, res) {
        if (err) {
            Swal.fire('Server Error', 'Internal Server Error', 'error');
            return;
        }
        const meta = res.metaData || res.metadata || {};
        const data = res?.response || [];
        // console.log(data);

        if (meta.message === "OK") {
            saveSession('dataPoli', data);
            dropdown("#pilih_poli_data", data, "kdpoli", "nmsubspesialis", "nmpoli", "-- Pilih Poli --");
        } else {
            Swal.fire('Gagal', meta.message, 'error');
        }
    });

    // const data = getSession("dataPoli") || [];
    // // console.log(data);
    // dropdown("#pilih_poli_data", data, "kdpoli", "nmsubspesialis","nmpoli", "-- Pilih Poli --");

}

function cari_data_dokter() {
    const poli = $("#pilih_poli_data").val();
    const tgl = $("#pilih_tanggal_data").val();
    if (!poli || !tgl) {
        Swal.fire("", 'Poli atau Tanggal belum terisi. Harap Periksa data kembali!', 'warning');
        return;
    }

    const payload = {};
    const url = `jadwaldokter/kodepoli/${poli}/tanggal/${tgl}`;
    const method = "get";

    antrol_rs(url, method, payload, function (err, res) {
        if (err) return Swal.fire('Server Error', 'Internal Server Error', 'error');
        const meta = res.metaData;
        const data = res.response?.list || res.response;

        if (meta.code === 200) {
            Swal.fire(meta.message, '', 'success');
            saveSession('dataDokter', data);
            console.log(data);
            tampilkanDaftarDokter();
        } else {
            Swal.fire('', meta.message, 'error');
            const $tbody = $("#dokterList");
            $tbody.empty().append(`
                <tr>
                    <td colspan="5" class="text-center">Belum ada data.</td>
                </tr>
            `);
            clearSession("dataDokter");
        }
    });

};

function tampilkanDaftarDokter() {
    let list = getSession('dataDokter');
    if (typeof list === "string") {
        try {
            list = JSON.parse(list);
        } catch (e) {
            console.error("Data dokter gagal di-parse", e);
            list = [];
        }
    }

    const $tbody = $("#dokterList");
    $tbody.empty();
    // console.log(list);
    list.forEach((d, i) => {
        const dokterJSON = JSON.stringify(d).replace(/"/g, '&quot;'); // escape " jadi &quot;
        const $tr = $(`
      <tr>
        <td>${i + 1}</td>
        <td><a href="#" class="buka-jadwal" 
                data-dokter="${dokterJSON}">
               ${d.kodedokter} - ${d.namadokter}
            </a>
        </td>
        <td>${d.namapoli}</td>
        <td>${d.namasubspesialis}</td>
        <td>${d.kodesubspesialis}</td>
      </tr>
    `);
        $tbody.append($tr);
    });

    // Tambahkan event listener ke link setelah elemen dimasukkan ke DOM
    $tbody.off("click", ".buka-jadwal").on("click", ".buka-jadwal", function (e) {
        e.preventDefault();
        const $a = $(this);
        const data = JSON.parse($a.attr("data-dokter").replace(/&quot;/g, '"'));

        bukaFormJadwal(data);
    });
}

function bukaFormJadwal(data) {
    // Set data ke form
    $("#kodeDokterJadwal").val(data.kodedokter);
    $("#kodePoliJadwal").val(data.kodepoli);
    $("#kodeSubspesialisJadwal").val(data.kodesubspesialis);
    $("#namaDokterJadwal").text(data.namadokter);
    $("#formJadwalDokter").removeClass("d-none");

    const tbody = document.querySelector("#jadwalDokter tbody");
    tbody.innerHTML = "";

    // Siapkan jam buka & tutup
    let buka = "", tutup = "";
    if (data.jadwal && data.jadwal.includes("-")) {
        [buka, tutup] = data.jadwal.split("-");
    }

    // Tambahkan baris
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>
            <select class="form-select" name="hari">
                ${Object.entries(hariList).map(([val, label]) =>
        `<option value="${val}">${label}</option>`).join("")}
            </select>
        </td>
        <td><input type="text" name="poli" class="form-control" value="${data.namapoli}" readonly></td>
        <td><input type="text" name="jam" class="form-control" value="${data.jadwal}" readonly></td>
        <td><input type="number" name="kuota" class="form-control" value="${data.kapasitaspasien}"></td>
        <td><input type="time" class="form-control " name="buka" value="${buka}"/></td>
        <td><input type="time" class="form-control " name="tutup" value="${tutup}"/></td>
        <td><button type="button" class="btn btn-danger btn-sm" onclick="hapusBaris(this)">Hapus</button></td>
    `;
    tbody.appendChild(row);
}

function tutupFormJadwal() {
    $("#formJadwalDokter").addClass("d-none");
}


function tambahBarisJadwal() {
    const tbody = document.querySelector("#jadwalDokter tbody");
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>
            <select class="form-select form-select-sm" name="hari">
                ${Object.entries(hariList).map(([val, label]) =>
        `<option value="${val}">${label}</option>`).join("")}
            </select>
        </td>
         <td><input type="text" name="poli" class="form-control" value="${data.namapoli}" readonly></td>
        <td><input type="text" name="jam" class="form-control" value="${data.jadwal}" readonly></td>
        <td><input type="number" name="kuota" class="form-control" value="${data.kapasitaspasien}"></td>
        <td><input type="time" class="form-control" name="buka" value="${buka}"/></td>
        <td><input type="time" class="form-control" name="tutup" value="${tutup}"/></td>
        <td><button type="button" class="btn btn-danger" onclick="hapusBaris(this)">Hapus</button></td>
    `;
    tbody.appendChild(row);
}

function hapusBaris(btn) {
    btn.closest("tr").remove();
}

function ambilJadwalDariTabel() {
    const rows = document.querySelectorAll("#jadwalDokter tbody tr");
    const jadwal = [];
    for (const row of rows) {
        const hari = row.querySelector("select[name='hari']").value;
        const bukaInput = row.querySelector("input[name='buka']");
        const tutupInput = row.querySelector("input[name='tutup']");

        const buka = bukaInput.value;
        const tutup = tutupInput.value;

        if (hari && buka && tutup) {
            if (buka >= tutup) {
                Swal.fire('', `Jam buka (${buka}) harus lebih awal dari tutup (${tutup})`, 'info');
                buka.focus();
                return [];
            } else {
                jadwal.push({ hari, buka, tutup });
            }
        }
    }
    return jadwal;
}


//Fungsi Referensi Dokter
function refDokter() {
    const payload = {};
    const url = "ref_dokter";
    const method = "get";

    antrol_rs(url, method, payload, function (err, res) {
        if (err) return Swal.fire('Server Error', 'Internal Server Error', 'error');
        const meta = res.metaData || res.metadata || {};
        const data = res.response || res.response.list;

        if (meta.message === "OK") {
            saveSession("datadokter", data);

        } else {
            saveSession("datadokter", data);
            console.log("error: ", res, err);
        }
    });
};

$("#pilihDokter_nik").one("focus", function () {
    ambilDataDokter();
});
$("#pilihDokter_bpjs").one("focus", function () {
    dokterBpjs();
});

function ambilDataDokter() {
    refDokter();
    const data = getSession("datadokter");
    const pilih = $("#pilihDokter_nik");
    // console.log(data);
    pilih.empty();
    pilih.append(`<option value="">-- Pilih Dokter --</option>`);

    if (Array.isArray(data)) {
        data.forEach(s => {
            pilih.append(`<option value="${s.kodedokter}">${s.namadokter}</option>`);
        });
    } else {
        console.warn("Data dokter bukan array:", data);
    }
}
function dokterBpjs() {
    refDokter();
    const data = getSession("datadokter");
    const pilih = $("#pilihDokter_bpjs");
    // console.log(data);
    pilih.empty();
    pilih.append(`<option value="">-- Pilih Dokter --</option>`);
    if (Array.isArray(data)) {
        data.forEach(s => {
            pilih.append(`<option value="${s.kodedokter}">${s.namadokter}</option>`);
        });
    } else {
        console.warn("Data dokter bukan array:", data);
    }
}


function antreanBelumDilayani() {

    const payload = {};
    const url = `antrean/pendaftaran/aktif`;
    const method = "get"; //ganti method dengan "get", "post", "put", "delete"

    antrol_rs(url, method, payload, function (err, res) {
        if (err) { console.error("error: ", err); };
        const meta = res.metadata || res.metaData || {};
        const { code, message } = meta;
        if (code === 200) {
            const hasil = res.response;
            Swal.fire('', message, 'success').then((result) => {
                saveSession("antreanBelumDilayani", hasil);
                if (result.isConfirmed) { }
            });
        } else if (code === 201 || code === 204) {
            Swal.fire('', message, 'info').then((result) => {
                const hasil = getDummy("antreanbelumdilayani")?.response;
                saveSession("antreanBelumDilayani", hasil);
                if (result.isConfirmed) { }
            });
        } else {
            Swal.fire('', message, 'error');
        }
    });
};
