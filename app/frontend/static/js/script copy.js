document.addEventListener("DOMContentLoaded", function() {
    const url = new URL(window.location.href);
    const endpoint = window.location.pathname;
    ["token", "user", "system_url"].forEach(param => {
      if (url.searchParams.has(param)) {
          url.searchParams.delete(param);
      }
    });
    if (endpoint === "/patient/add"){isiDataTersimpan()};
    window.history.replaceState({}, document.title, url.toString());
    const params = new URLSearchParams(url.search);
    if (params.get('formpendaftaranpasien') === 'true') {
        tampilkan('#formpendaftaranpasien');
    }
    if (endpoint === "/logout"){ tutupwindow(); };
});

function tutupwindow() {
    const token = localStorage.getItem('token');
    if (token) return;
    localStorage.clear();
    sessionStorage.clear();
    window.open('', '_self'); 
    window.close();
    setTimeout(() => {
        window.location.href = '/login';
    }, 200);
}


function tampilkan(id) {
    console.log("Menampilkan:", id);
    $(".konten").addClass("d-none");
    $(id).removeClass("d-none");
    sessionStorage.setItem("tampilkan", id);
}

function saveSession(key, data) {
  if (typeof data === 'string') {
    sessionStorage.setItem(key, data);
  } else {
    sessionStorage.setItem(key, JSON.stringify(data));
  }
}

function saveLocal(key, data) {
  if (typeof data === 'string') {
    localStorage.setItem(key, data);
  } else {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

function getSession(key) {
  const data = sessionStorage.getItem(key);
  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
}

function getLocal(key) {
  const data = localStorage.getItem(key);
  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
};

function clearSession(key) {
    sessionStorage.removeItem(key);
}
function clearLocal(key) {
    localStorage.removeItem(key);
}


function formatTimestamp(ms) {
    if (!ms || isNaN(ms)) return "-";
    const date = new Date(ms); // milisecond to Date object
    const jam = date.getHours().toString().padStart(2, '0');
    const menit = date.getMinutes().toString().padStart(2, '0');
    return `${jam}:${menit} WIB`;
}

function batal() {
  window.location.replace("/");
};

async function bukaTambahPasien(){tampilkan('#formpendaftaranpasien')}

async function bukaSistemKlinik() {
  window.open(
    "https://sistemklinik.platy-monitor.ts.net:8000/patient",
    "_blank",
    "noopener,noreferrer"
  );
}

function gabungdata() {
  const peserta = getSession("datapeserta");
  const rujukan = getSession("datarujukan");
  const pasien = getSession("datapasien");
  const antrean = getSession("dataantrean");
  return { ...peserta, ...rujukan, ...pasien, ...antrean };
}

function getRujukan(data) {
  const nokartu = data;
  const url = "v_rujukanbynoka";
  const payload = { NoKartu: nokartu };
  vclaim_baru(url, "get", payload, function (err, res) {
    if (err) return Swal.fire("Server Error", "Internal Server Error", "error");
    const meta = res?.metaData || res?.metadata || {};
    const code = parseInt(meta.code);
    const msg = meta.message || "Terjadi kesalahan";
    if (code === 200) {
      saveSession("datarujukan", res.response);
    } else {
      Swal.fire("", msg, "error");
      console.error("error :", res);
    }
  });
}

// js nomor kartu
document.getElementById("jenis_pasien").addEventListener("change", function () {
  const value = this.value;
  document.getElementById("nomor_kartu_JKN").classList.add("d-none");
  document.getElementById("nomor_kartu_asuransi").classList.add("d-none");
  if (value === "JKN") {
    document.getElementById("nomor_kartu_JKN").classList.remove("d-none");
  } else if (value === "Asuransi") {
    document.getElementById("nomor_kartu_asuransi").classList.remove("d-none");
  }
});

document.getElementById("jenis_pasien_edit").addEventListener("change", function () {
  const value = this.value;
  document.getElementById("nomor_kartu_JKN_edit").classList.add("d-none");
  document.getElementById("nomor_kartu_asuransi_edit").classList.add("d-none");
  if (value === "JKN") {
    document.getElementById("nomor_kartu_JKN_edit").classList.remove("d-none");
  } else if (value === "Asuransi") {
    document.getElementById("nomor_kartu_asuransi_edit").classList.remove("d-none");
  }
});

// JS nama suami/istri
document.getElementById("statuskawin_edit").addEventListener("change", function () {
  const value = this.value;
  document.getElementById("status_sudah_kawin_edit").classList.add("d-none");
  if (value === "2") {
    document.getElementById("status_sudah_kawin_edit").classList.remove("d-none");
  }
});

//
$('#patientadd').on('submit', async function(e) {
  e.preventDefault();
  await previewpendaftaran();
});

$('#patientedit').on('submit', async function(e) {
  e.preventDefault();
  const dataLama = currentListData[window._indexRiwayatDipilih];
  // console.log('data di edit', dataLama)
  const jalan = $("#alamat_jalan_edit").val() || "";
  const rt = $("#rt_edit").val() || "";
  const rw = $("#rw_edit").val() || "";
  const kel = $("#namakelurahan_edit").val() || "";
  const kec = $("#namakecamatan_edit").val() || "";
  const kab = $("#namakabupaten_edit").val() || "";
  const prov = $("#namaprovinsi_edit").val() || "";
  const payload = {
    id: dataLama.id,
    norm: dataLama.norm,
    tipe_pasien: $("#jenis_pasien_edit").val(),
    nik: $("#no_ktp_edit").val(),
    nomorkartu: $("#nomor_kartu_edit").val(),
    noka_asuransi: $("#noka_asuransi_edit").val(),
    
    nama: $("#nama_lengkap_edit").val(),
    tempatlahir: $("#tempat_lahir_edit").val(),
    tanggallahir: $("#tgl_lahir_edit").val(),
    jeniskelamin: $("input[name='jenis_kelamin_edit']:checked").val(),
    golongandarah: $("#golongandarah_edit").val(),
    rhesus: $("#rhesus_edit").val(),
    agama: $("#agama_edit").val(),
    
    ayah: $("#nama_ayah_edit").val(),
    ibu: $("#nama_ibu_edit").val(),

    jalan: $("#alamat_jalan_edit").val(),
    rt: $("#rt_edit").val(),
    rw: $("#rw_edit").val(),
    kodekel: $("#kodekelurahan_edit").val(),
    kodekec: $("#kodekecamatan_edit").val(),
    kodedati2: $("#kodekabupaten_edit").val(),
    kodeprop: $("#kodeprovinsi_edit").val(),
    kelurahan: kel,
    kecamatan: kec,
    kabupaten: kab,
    provinsi: prov,
    alamat: `${jalan}, RT ${rt}/RW ${rw}, ${kel}, ${kec}, ${kab}, ${prov}`,

    status: $("#statuskawin_edit").val(),
    namapasangan: $("#nama_pasangan_edit").val(),

    nohp: $("#telepon_edit").val(),
    email: $("#email_edit").val(),
    pendidikan: $("#pendidikan_edit").val(),
    pekerjaan: $("#pekerjaan_edit").val(),

    // checkbox referensi array
    referensi: $('input[name="referensi_edit"]:checked').map(function() {
      return this.value;
    }).get()
  };

  const res = await fetch("/patient/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const hasil = await res.json();
  const {code, message} = hasil.metaData ||{};
  if (parseInt(code) === 200) {
    const norm = hasil.response?.norm;
    console.log("hasil oke update: ", hasil.response)
    Swal.fire({
      title: "",
      text: `Data pasien dengan No. RM: ${norm} berhasil diperbarui`,
      icon: "success"
    }).then(() => batal());
  } else {
    Swal.fire("", message, "warning");
  }
});


async function cekPasienTerdaftar(){

}

async function previewpendaftaran() {
  // Checkbox Referensi
  const referensi = [];
  if ($("#referensi_instagram").is(":checked")) referensi.push("Instagram");
  if ($("#referensi_facebook").is(":checked")) referensi.push("Facebook");
  if ($("#referensi_website").is(":checked")) referensi.push("Website");
  if ($("#referensi_tiktok").is(":checked")) referensi.push("Tiktok");
  if ($("#referensi_lainnya").is(":checked")) referensi.push("Lainnya");
  const jalan = $("#alamat_jalan").val() || '';
  const rt = $("#rt").val() || '';
  const rw = $("#rw").val() || '';
  const kel = $("#namakelurahan").val() || '';
  const kec = $("#namakecamatan").val() || '';
  const kab = $("#namakabupaten").val() || '';
  const prov = $("#namaprovinsi").val() || '';

  const alamatLengkap = `${jalan}, RT ${rt}/RW ${rw}, ${kel}, ${kec}, ${kab}, ${prov}`;

  const data = {
    tipe_pasien: $("#jenis_pasien").val(),
    nomorkartu: $("#nomor_kartu").val(),
    noka_asuransi: $("#noka_asuransi").val(),
    nik: $("#no_ktp").val(),
    nama: $("#nama_lengkap").val(),
    ayah: $("#nama_ayah").val(),
    ibu: $("#nama_ibu").val(),
    tempatlahir: $("#tempat_lahir").val(),
    tanggallahir: $("#tgl_lahir").val(),
    jeniskelamin: $("input[name='jenis_kelamin']:checked").val(),
    golongandarah: $("#golongandarah").val(),
    rhesus: $("#rhesus").val(),
    agama: $("#agama").val(),
    jalan: jalan,
    alamat: alamatLengkap,
    rt: rt,
    rw: rw,
    kodekel: $("#kodekelurahan").val(),
    kelurahan: kel,
    kodekec: $("#kodekecamatan").val(),
    kecamatan: kec,
    kodedati2: $("#kodekabupaten").val(),
    kabupaten: kab,
    kodeprop: $("#kodeprovinsi").val(),
    provinsi: prov,
    nohp: $("#telepon").val(),
    email: $("#email").val(),
    status: $("#statuskawin").val(),
    namapasangan: $("#nama_pasangan").val(),
    pendidikan: $("#pendidikan").val(),
    pekerjaan: $("#pekerjaan").val(),
    referensi: referensi,

  };
  const nik = data.nik;
  if (!/^\d{16}$/.test(nik)){
    Swal.fire("No. KTP / NIK tidak valid.", "", "warning");
    return;
  }
  if (!data.tipe_pasien) return Swal.fire("", 'Tipe Pasien belum dipilih.', 'warning');
  if (!data.nama) {
    Swal.fire("Nama pasien wajib diisi!", '', 'warning');
    return;
  }
  if (data.tipe_pasien === "JKN") {
    if (!data.nomorkartu || data.nomorkartu.trim() === "") {
      Swal.fire('Peringatan', 'Nomor kartu pasien JKN belum terisi!', 'warning');
      return;
    } else if (!/^\d{13}$/.test(data.nomorkartu)){
      Swal.fire("Nomor kartu JKN tidak valid.", "", "warning");
      return;
    }
  }

  const requiredFields = [
    { id: "#jenis_pasien", name: "Tipe Pasien" },
    { id: "#no_ktp", name: "Nomor KTP / NIK" },
    { id: "#nama_lengkap", name: "Nama Lengkap" },
    { id: "#tgl_lahir", name: "Tanggal Lahir" },
    { id: "#tempat_lahir", name: "Tempat Lahir" },
    { id: "input[name='jenis_kelamin']:checked", name: "Jenis Kelamin" },
    { id: "#alamat_jalan", name: "Alamat" },
    { id: "#telepon", name: "Telepon / Nomor HP" },
    { id: "#agama", name: "Agama" },
  ];

  for (let field of requiredFields) {
    const value = $(field.id).val() || $(field.id).is(":checked");
    if (!value) {
      Swal.fire("", `${field.name} harus diisi!`, "warning");
      return false;
    }
  }
  saveSession("previewpendaftaran", data);
  window.location.href = "/peserta/data";

};

function isiDataTersimpan(){
   const data = getSession('previewpendaftaran');
  if (!data) {
    console.warn("Data previewpendaftaran tidak ditemukan di session.");
    return;
  }
  const agama = data.agama != null ? data.agama : 0; 
  const pendidikan = data.pendidikan != null ? data.pendidikan : 0;
  const status = data.status != null ? data.status : 0;
  const pekerjaan = data.pekerjaan != null ? data.pekerjaan : 0;
  const jk = data.jeniskelamin || "";
  document.querySelectorAll('input[name="jenis_kelamin"]').forEach(el => {
    el.checked = (el.value === jk);
  });
  const jenisPasienEl = document.getElementById("jenis_pasien");
  jenisPasienEl.value = data.tipe_pasien || "";
  jenisPasienEl.dispatchEvent(new Event("change"));
  document.getElementById("no_ktp").value = data.nik || "-";
  document.getElementById("nomor_kartu").value = data.nomorkartu || "";
  document.getElementById("noka_asuransi").value = data.noka_asuransi || "-";
  document.getElementById("nama_lengkap").value = data.nama || "-";
  document.getElementById("tempat_lahir").value = data.tempatlahir || "-";
  document.getElementById("tgl_lahir").value = data.tanggallahir || "-";
  document.getElementById("golongandarah").value = data.golongandarah || "-";
  document.getElementById("rhesus").value = data.rhesus || "-";
  document.getElementById("agama").value = agama;
  document.getElementById("nama_ayah").value = data.ayah || "-";
  document.getElementById("nama_ibu").value= data.ibu || "-";
  document.getElementById("alamat_jalan").value = data.jalan || "-";
  document.getElementById("rt").value = data.rt || "-";
  document.getElementById("rw").value = data.rw || "-";

  document.getElementById("kelurahan").value = data.kodekel;
  document.getElementById("kecamatan").value = data.kodekec;
  document.getElementById("kabupaten").value = data.kodedati2;
  document.getElementById("provinsi").value = data.kodeprop;
 document.getElementById("kelurahan").dispatchEvent(new Event('change'));
  document.getElementById("kecamatan").dispatchEvent(new Event('change'));
  document.getElementById("kabupaten").dispatchEvent(new Event('change'));
  document.getElementById("provinsi").dispatchEvent(new Event('change'));
  
  document.getElementById("statuskawin").value= status;
  document.getElementById("nama_pasangan").value = data.namapasangan || "";
  document.getElementById("telepon").value = data.nohp || "";
  document.getElementById("email").value = data.email || "";
  document.getElementById("pendidikan").value = pendidikan;
  document.getElementById("pekerjaan").value = pekerjaan ;

  const referensiData = data.referensi || [];
  document.querySelectorAll('input[name="referensi"]').forEach(checkbox => {
    checkbox.checked = referensiData.includes(checkbox.value);
  });
}


// List Data Pasien

$('#formCariPasien').on('submit', function(e) {
  e.preventDefault();
  listDataPasien();
});

let currentListData = [];
let currentPage = 1;
const pageSize = 10; 

const sexMap = {
    "L": 'Laki - laki',
    "P": "Perempuan",
    "l": "Laki - laki",
    "p" :'Perempuan',
    "f": "Perempuan",
    "m": "Laki - laki",
    "F": "Perempuan",
    "M": "Laki - laki",
    "": "Tidak diketahui"
  };

function mapJenisKelamin(val) {
const sexMap = {
    "L": 'Laki - laki',
    "P": "Perempuan",
    "F": "Perempuan",
    "M": "Laki - laki",
    "": "Tidak diketahui"
  };
  return sexMap[(val || "").toUpperCase()] || "Tidak diketahui";
}

async function listDataPasien() {
  const keyword = $("#keyword").val() || '';
  if (!keyword) return Swal.fire("", "Kata Pencarian Masih Kosong", "info");

  try {
    const res = await fetch('/patient/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword })
    });
    const result = await res.json();
    // console.log("hasil List Data:", result);
    const meta = result?.metaData || {};
    const code = parseInt(meta.code);
    const msg = meta.message || 'Terjadi kesalahan';
    if (code === 200) {
      const data = result.response?.pasien || [];
      const data2 = result.response?.patient || [];
      const hasil_akhir = [...data, ...data2];
      currentListData = hasil_akhir.map(item => ({
        ...item,
        nama: item.nama || item.name || 'Tidak diketahui',
        nomorkartu: item.nomorkartu || "",
        nik: item.nik || item.card || 'Tidak diketahui',
        tanggallahir: item.tanggallahir || item.birthdate || 'Tidak diketahui',
        tempat: item.tempatlahir || item.place ||"Tidak diketahui",
        jeniskelamin: mapJenisKelamin(item.jeniskelamin || item.sex),
        norm: item.norm || item.nomr || item.mr || "Tidak diketahui"
      }));
      // console.table(currentListData);
      renderManualTable(1);    
    } else {
      const $tbody = $("#hasilCariData tbody");
      $tbody.empty();
      $tbody.append(`<tr><td colspan="4" class="text-center fw-bold">Belum ada data.</td></tr>`);
      Swal.fire("", msg, 'warning');
    }

  } catch (err) {
    console.error('Error:', err);
  }
}

function renderPaginationControls() {
  const totalPages = Math.ceil(currentListData.length / pageSize);
  const $pagination = $("#paginationControls");
  $pagination.empty();

  $pagination.append(`
    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="javascript:void(0)" onclick="changePage(${currentPage - 1})">
      <i class="fas fa-backward"></i> Previous
      </a>
    </li>
  `);

  for (let i = 1; i <= totalPages; i++) {
    $pagination.append(`
      <li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="javascript:void(0)" onclick="changePage(${i})">${i}</a>
      </li>
    `);
  }

  $pagination.append(`
    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="javascript:void(0)" onclick="changePage(${currentPage + 1})">
       Next <i class="fas fa-forward"></i>
       </a>
    </li>
  `);
}


function changePage(page) {
  const totalPages = Math.ceil(currentListData.length / pageSize);
  if (page < 1 || page > totalPages) return;
  renderManualTable(page);
}

function renderManualTable(page = 1) {
  currentPage = page;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = currentListData.slice(start, end);
  const $tbody = $("#hasilCariData tbody");
  $tbody.empty();
 if (paginatedData.length === 0) {
    $tbody.append(`<tr><td colspan="5" class="text-center fw-bold">Belum ada data.</td></tr>`);
    return;
  }

  paginatedData.forEach((item, index) => {
   
    $tbody.append(`
      <tr>
        <td>${start + index + 1}</td>
        <td>${item.norm}</td>
        <td>
          <b>${item.nama}</b>
          <br>NIK: ${item.nik}
          <br>BPJS: ${item.nomorkartu}
        </td>
        <td>${item.tempat}, ${item.tanggallahir}</td>
        <td><button class="btn btn-sm btn-secondary" onclick="lihatDetailRiwayat(${start + index + 1})">Lihat Detail</button></td>
      </tr>
    `);
  });

  renderPaginationControls();
}

function lihatDetailRiwayat(index) {
  const idx = parseInt(index, 10) - 1;
  const data = currentListData[idx];
  if (!data) return;
  window._indexRiwayatDipilih = idx;

  $("#detailNama").text(data.nama || '-');
  $("#detailNIK").text(data.nik);
  $("#detailRM").text(data.norm);
  $("#detailEmail").text(data.email);
  $("#detailBPJS").text(data.nomorkartu || '');
  $("#detailNoAsuransi").text(data.noka_asuransi || '-');
  $("#detailNomorHP").text(data.nohp || data.mobile || data.phone ||"-");
  $("#detailTempatLahir").text(data.tempat);
  $("#detailTglLahir").text(data.tanggallahir);
  $("#detailAlamat").text(data.alamat|| data.address || '-');
  $("#detailJenisKelamin").text(data.jeniskelamin);


    saveSession('nik', data.nik);
  const modalEl = document.getElementById('modalDetail');
  const modalInstance = new mdb.Modal(modalEl);
  modalInstance.show();
}

async function cariDataPasien(){
  const keyword = $("#no_ktp").val() || '';
  if (!keyword) return Swal.fire("", "Nomor KTP/NIK Masih Kosong", "info");

  try {
    const res = await fetch(`/patient/list?keyword=${encodeURIComponent(keyword)}`);
    const result = await res.json();
    const meta = result?.metaData || {};
    const code = parseInt(meta.code);
    const msg = meta.message || 'Terjadi kesalahan';
    if (code === 200) {
      const data = result.response?.pasien || [];
      const ListData = data.map(item => ({
        ...item,
        nama: item.nama || item.name || 'Tidak diketahui',
        nomorkartu: item.nomorkartu || "",
        nik: item.nik || item.card || 'Tidak diketahui',
        tanggallahir: item.tanggallahir || item.birthdate || 'Tidak diketahui',
        tempat: item.tempatlahir || item.place ||"Tidak diketahui",
        jeniskelamin: mapJenisKelamin(item.jeniskelamin) || mapJenisKelamin(item.sex),
        norm: item.norm || item.nomr || item.mr || "Tidak diketahui"

      }));

      await buatTabelCariDataPasien(ListData);
      const modalEl = document.getElementById('modalDetailDataPasien');
      const modalInstance = new mdb.Modal(modalEl);
      modalInstance.show();
    } else {
      const $tbody = $("#hasilCariDataPasien tbody");
      $tbody.empty();
      $tbody.append(`<tr><td colspan="4" class="text-center fw-bold">Belum ada data.</td></tr>`);
      Swal.fire("", msg, 'warning');
    }

  } catch (err) {
    console.error('Error:', err);
  }
  
}

async function buatTabelCariDataPasien(data) {
  const $tbody = $("#hasilCariDataPasien tbody");
  $tbody.empty();
 if (data.length === 0) {
    $tbody.append(`<tr><td colspan="5" class="text-center fw-bold">Belum ada data.</td></tr>`);
    return;
  }

  data.forEach((item, index) => {
  const jsonData = encodeURIComponent(JSON.stringify(item)); 
    $tbody.append(`
      <tr>
        <td>${index + 1}</td>
        <td>${item.norm}</td>
        <td>
          <b>${item.nama}</b>
          <br>NIK: ${item.nik}
          <br>BPJS: ${item.nomorkartu || ""}
        </td>
        <td>${item.tempat ||"Tidak diketahui"}, ${item.tanggallahir}</td>
        <td><button type="button" class="btn btn-sm btn-warning" 
              data-mdb-ripple-init
              data-pasien="${jsonData}"
              onclick="editPasienDipilih(this)"
            >
              <i class="fas fa-pen-to-square me-1"></i> Pilih dan edit
            </button>
        </td>
      </tr>
    `);
  });
}

async function editPasienDipilih() {
  const data = currentListData[window._indexRiwayatDipilih];
// console.log('Data diterima edit: ',data)
  const agama = data.agama != null ? data.agama : 0; 
  const pendidikan = data.pendidikan != null ? data.pendidikan : 0;
  const status = data.status != null ? data.status : 0;
  const pekerjaan = data.pekerjaan != null ? data.pekerjaan : 0;
  const jk = data.jeniskelamin || "";
  document.querySelectorAll('input[name="jenis_kelamin_edit"]').forEach(el => {
    el.checked = (el.value === jk);
  });
  const jenisPasienEditEl = document.getElementById("jenis_pasien_edit");
  jenisPasienEditEl.value = data.tipe_pasien || "NON JKN";
  jenisPasienEditEl.dispatchEvent(new Event("change"));
  document.getElementById("no_ktp_edit").value = data.nik || "";
  document.getElementById("nomor_kartu_edit").value = data.nomorkartu || "";
  document.getElementById("noka_asuransi_edit").value = data.noka_asuransi || "";
  document.getElementById("nama_lengkap_edit").value = data.nama || "";
  document.getElementById("tempat_lahir_edit").value = data.tempatlahir || "";
  document.getElementById("tgl_lahir_edit").value = data.tanggallahir || "";
  document.getElementById("golongandarah_edit").value = data.golongandarah || "";
  document.getElementById("rhesus_edit").value = data.rhesus || "";
  document.getElementById("agama_edit").value = agama;
  document.getElementById("nama_ayah_edit").value = data.ayah || "";
  document.getElementById("nama_ibu_edit").value= data.ibu || "";
  document.getElementById("alamat_jalan_edit").value = data.jalan || "";
  document.getElementById("rt_edit").value = data.rt || "";
  document.getElementById("rw_edit").value = data.rw || "";

  document.getElementById("kelurahan_edit").value = data.kodekel;
  document.getElementById("kecamatan_edit").value = data.kodekec;
  document.getElementById("kabupaten_edit").value = data.kodedati2;
  document.getElementById("provinsi_edit").value = data.kodeprop;
 document.getElementById("kelurahan_edit").dispatchEvent(new Event('change'));
  document.getElementById("kecamatan_edit").dispatchEvent(new Event('change'));
  document.getElementById("kabupaten_edit").dispatchEvent(new Event('change'));
  document.getElementById("provinsi_edit").dispatchEvent(new Event('change'));
  
  document.getElementById("statuskawin_edit").value= status;
  document.getElementById("nama_pasangan_edit").value = data.namapasangan || "";
  document.getElementById("telepon_edit").value = data.nohp || "";
  document.getElementById("email_edit").value = data.email || "";
  document.getElementById("pendidikan_edit").value = pendidikan;
  document.getElementById("pekerjaan_edit").value = pekerjaan ;

  const referensiData = data.referensi || [];
  document.querySelectorAll('input[name="referensi_edit"]').forEach(checkbox => {
    checkbox.checked = referensiData.includes(checkbox.value);
  });

  const modalEl = document.getElementById('modalDetail');
  const modalInstance = mdb.Modal.getInstance(modalEl);
  modalInstance.hide();
  tampilkan("#formeditpasien")
}


const nikInput = document.getElementById("no_ktp");
const warning = document.getElementById("nikWarning");
let timer;
nikInput.addEventListener("input", () => {
  clearTimeout(timer);
  timer = setTimeout(() => cekNIK(nikInput.value.trim()), 300);
});

async function cekNIK(nik) {
  warning.textContent = "";

  // cek kalau panjang 16 digit baru kirim request
  if (nik.length !== 16) return;

  try {
   const res = await fetch("/peserta/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nik: nik
      })
    });

    const data = await res.json();
    console.log("data cek KTP:", data)

    if (data.exists) {
      warning.textContent = "⚠️ NIK sudah terdaftar! Silahkan lakukan pencarian data pasien.";
      nikInput.style.borderColor = "red";
    }
  } catch (err) {
    console.error("Gagal cek NIK:", err);
  }
}