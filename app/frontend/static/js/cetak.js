// document.addEventListener("DOMContentLoaded", function () {
//     const data_raw = JSON.parse(sessionStorage.getItem("cetakSep") || "{}");
//     const data = data_raw?.sep || data_raw;
//     console.log(data);
//     tampilkanData();
// });

async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ format: "a5", orientation: "landscape" });

    let cetak = sessionStorage.getItem("cetak") ? parseInt(sessionStorage.getItem("cetak")) + 1 : 1;
    sessionStorage.setItem("cetak", cetak);

    let tgl_cetak = new Date().toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    }).replace(/\./g, ":");

    document.getElementById("cetakan-info").innerHTML = `<strong>Cetakan ke: ` + cetak + `</strong><br>Tanggal Cetak: ` + tgl_cetak;
    await new Promise(resolve => setTimeout(resolve, 300));
    const element = document.querySelector("#print-area");
    const canvas = await html2canvas(element, { useCORS: true, scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pageWidth = 210;
    const pageHeight = 148;
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    doc.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);

    return { doc, cetak };
};

// function downloadPDF() {
//     generatePDF().then(({ doc, cetak }) => {
//         doc.save(`Cetak_surat_` + cetak + `.pdf`);
//     });
// };
// function cetakPDF() {
//     generatePDF().then(({ doc, cetak }) => {
//         window.open(doc.output("bloburl"), "_blank");
//     });
// };

document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get('target');

    if (targetId) {
        renderAndCetak(targetId);
    }
});

async function renderAndCetak(targetId) {
    // Render data sesuai target
    if (targetId === 'print-sep') {
        renderSEP();
        tampilkan("#cetakSEP");

    } else if (targetId === 'print-kontrol') {
        renderKontrol();
        tampilkan("#cetakSuratKontrol");
    }

    // Tunggu sebentar agar DOM benar-benar ter-render
    await new Promise(resolve => setTimeout(resolve, 500));

    // // Buat PDF atau tampilkan preview
    // if (targetId === 'print-kontrol') {
    //     // Jika yang dicetak surat kontrol → tampilkan versi A5 di jendela baru siap print
    //     const printArea = document.getElementById(targetId);
    //     const newWin = window.open('', '_blank', 'width=900,height=650');
    //     newWin.document.open();
    //     newWin.document.write(`
    //         <html>
    //             <head>
    //                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //                 <style>
    //                 @page { size: A5 landscape; margin: 0; }
    //                 body { background:#f8f9fa; display:flex; justify-content:center; }
    //                 .a5-landscape { transform: scale(0.7); transform-origin:top center; }
    //                 @media print { .a5-landscape { transform:none!important; } }
    //                 </style>
    //             </head>
    //             <body>${konten}</body>
    //             </html>
    //         `);
    //     newWin.document.close();

    // } else {
    //     // Untuk target lain tetap gunakan generatePDF bawaan
        const doc = await generatePDF(targetId);
        window.open(doc.output("bloburl"), "_blank");
    }
// }

function renderSEP() {
    const data_raw = JSON.parse(sessionStorage.getItem("cetakSep") || "{}");
    const d = data_raw?.sep || data_raw;
    const tujuan = d.tujuanKunj?.nama || '-';
    const lahir = new Date(d.peserta?.tglLahir).toLocaleDateString("id-ID", { day: '2-digit', month: 'long', year: 'numeric' });
    document.getElementById("noSEP").innerText = d.noSep || '-';
    document.getElementById("JenisKepesertaan").innerText = d.peserta?.jnsPeserta || '-';
    document.getElementById("TanggalSEP").innerText = d.tglSep || '-';
    document.getElementById("JenisRawat").innerText = d.jnsPelayanan || '-';
    document.getElementById("noKartuBPJS").innerText = d.peserta?.noKartu || '-';
    document.getElementById("kelamin").innerText = d.peserta?.kelamin || '-';
    document.getElementById("JenisKunjungan").innerText = tujuan || '-';
    document.getElementById("NamaPeserta").innerText = d.peserta?.nama || '-';
    document.getElementById("PoliPerujuk").innerText = d.poliPerujuk || '-';
    document.getElementById("TanggalLahir").innerText = lahir || '-';
    document.getElementById("KelasHak").innerText = d.peserta?.hakKelas || '-';
    document.getElementById("noTelepon").innerText = d.noTelp || '-';
    document.getElementById("KelasRawat").innerText = d.kelasRawat || '-';
    document.getElementById("SubSpesialis").innerText = d.poli || '-';
    document.getElementById("Penjamin").innerText = d.penjamin || '-';
    document.getElementById("DokterDPJP").innerText = d.dpjp?.nmDPJP || '-';
    document.getElementById("FaskesPerujuk").innerText = d.faskesPerujuk || '-';
    document.getElementById("DiagnosaAwal").innerText = d.diagnosa || '-';
    document.getElementById("tandatanganpasien").innerText = d.nama || '-';
}


function renderKontrol() {
    const data_raw = getSession("dataSukon") || getLocal("dataSukon") || {};
    const t = data_raw.tambahan || {};
    const d = data_raw.suratKontrol || {};
    const lahir = new Date(d.tglLahir).toLocaleDateString("id-ID", { day: '2-digit', month: 'long', year: 'numeric' });
    const diagnosa = t.diagnosa;
    const poli = t.namaPoli;
    const dpjp = t.namaDokter;
    $("#noSuKon").text(d.noSuratKontrol || '');
    $("#nokaSuKon").text(d.noKartu || "");
    $("#namaSuKon").text(d.nama || "");
    $("#tglKontrolSuKon").text(d.tglRencanaKontrol || "");
    $("#lahirSuKon").text(lahir);
    $("#diagnosaSuKon").text(diagnosa || "");
    $("#poliSuKon").text(poli || "");
    $("#dokterSuKon").text(d.namaDokter || "");
    $("#kelaminSuKon").text(d.kelamin || "");
    $("#namaDPJP").text(dpjp || '');
}

function cetakPDF(id) {
    generatePDF(id).then(doc => {
        window.open(doc.output("bloburl"), "_blank");
    });
}
function downloadPDF(id) {
    generatePDF(id).then(doc => {
        doc.save(`Cetak_${id}.pdf`);
    });
}

async function generatePDF(targetId) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ format: "a5", orientation: "landscape" });

    const element = document.getElementById(targetId);
    if (!element) {
        Swal.fire("Error", `Element ${targetId} tidak ditemukan`, "error");
        return;
    }

    let cetak = getSession("cetak") ? parseInt(getSession("cetak")) + 1 : 1;
    saveSession("cetak", cetak);
    let tglEntri = new Date().toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).replace(/\./g, ":");
    let tgl_cetak = new Date().toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    }).replace(/\./g, ":");

    $(`#${targetId} .cetakan-info`).html(`
        <small>Tgl. Entri : ${tglEntri}</small> | <small>Tgl. Cetak : ${tgl_cetak}</small>        
    `);
    // $(".template-print").addClass("d-none");
    // Tampilkan target
    element.classList.remove("d-none");

    await new Promise(resolve => setTimeout(resolve, 1000));

    const canvas = await html2canvas(element, { useCORS: true, scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pageWidth = 210;
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    doc.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);

    return doc;
}
