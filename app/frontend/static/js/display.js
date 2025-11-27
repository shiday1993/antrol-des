
$(document).ready(function () {
   loadAntreanlist();
});

 async function loadAntreanlist() {
        try {
            const res = await fetch("/antreancs/ambil");
            let result = await res.json();
            // console.log(result);
            if (result.metaData.code === 200) {
                saveSession('antreanList', result.response.antrean);
            }
        } catch (err) {
            console.error("Error:", err);
        }
    }

function renderDisplay() {
    loadAntreanlist();
    let antreanList = [];
    const raw = sessionStorage.getItem('antreanList');

    if (raw) {
        try {
            antreanList = JSON.parse(raw);   // jadi array lagi
        } catch (e) {
            console.error("Format antreanList salah:", e);
            antreanList = [];
        }
    }

    if (!Array.isArray(antreanList)) {
        antreanList = [];
    }
    // Cari yg sedang dilayani
    let current = antreanList.find(a => a.status === "sedang dilayani");
    if (current) {
        document.getElementById("current-number").textContent = current.nomor;
        document.getElementById("current-loket").textContent = current.loket;

        // TTS hanya kalau berubah
        if (window.lastCalled !== current.id) {
            playTTS(current.nomor, current.loket);
            window.lastCalled = current.id;
        }
    } else {
        document.getElementById("current-number").textContent = "-";
        document.getElementById("current-loket").textContent = "-";
    }

    // Render menunggu
    let waitingList = antreanList.filter(a => a.status === "menunggu").slice(0, 4);
    let queueListEl = document.getElementById("queue-list");
    queueListEl.innerHTML = waitingList.map(a => `
    <div class="col-md-4 col-lg-3 col-6 mb-3">
        <div class="card text-center shadow-3 p-3">
        <div class="card-body justify-content-between h-100">
            <h5 class="card-title fw-bold mb-2">Antrean Admisi</h5>
            <div class="display-4 mb-2 fw-bold queue-number">${a.nomor}</div>
            <p class="card-text mb-1">${a.loket || "-"}</p>
            <span class="text-muted">Menunggu</span>
        </div>
        </div>
    </div>
    `).join("");
}

function playTTS(nomor, loket) {
    let msg = new SpeechSynthesisUtterance(`Nomor antrean ${nomor}, silakan ke ${loket}`);
    msg.lang = "id-ID";
    window.speechSynthesis.speak(msg);
}

// Refresh setiap 2 detik
setInterval(renderDisplay, 5000);
renderDisplay();