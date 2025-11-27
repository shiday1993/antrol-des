$(document).ready(function () {
  // --- Load Provinsi ---
  fetch("/wilayah/provinces.json")
    .then(r => r.json())
    .then(res => {
      // console.log('data wilayah ', res);
      const select = $('#provinsi');
      select.html('<option value="">Pilih Provinsi</option>');
      res.data.forEach(p => select.append(`<option value="${p.code}">${p.name}</option>`));
    });

  // --- Load Kabupaten saat provinsi berubah ---
  $('#provinsi').on('change', function () {
    const provID = $(this).val();
    $('#kabupaten').html('<option value="">Pilih Kabupaten</option>');
    $('#kecamatan').html('<option value="">Pilih Kecamatan</option>');
    $('#kelurahan').html('<option value="">Pilih Kelurahan</option>');
    if (!provID) return;

    fetch(`/wilayah/regencies/${provID}.json`)
      .then(r => r.json())
      .then(res => {
        res.data.forEach(kab => $('#kabupaten').append(`<option value="${kab.code}">${kab.name}</option>`));
      });
    updateHidden();
  });

  // --- Load Kecamatan saat kabupaten berubah ---
  $('#kabupaten').on('change', function () {
    const kabID = $(this).val();
    $('#kecamatan').html('<option value="">Pilih Kecamatan</option>');
    $('#kelurahan').html('<option value="">Pilih Kelurahan</option>');
    if (!kabID) return;

    fetch(`/wilayah/districts/${kabID}.json`)
      .then(r => r.json())
      .then(res => {
        res.data.forEach(kec => $('#kecamatan').append(`<option value="${kec.code}">${kec.name}</option>`));
      });
    updateHidden();
  });

  // --- Load Kelurahan saat kecamatan berubah ---
  $('#kecamatan').on('change', function () {
    const kecID = $(this).val();
    $('#kelurahan').html('<option value="">Pilih Kelurahan</option>');
    if (!kecID) return;

    fetch(`/wilayah/villages/${kecID}.json`)
      .then(r => r.json())
      .then(res => {
        res.data.forEach(desa => $('#kelurahan').append(`<option value="${desa.code}">${desa.name}</option>`));
      });
    updateHidden();
  });

  // --- Update hidden inputs setiap kali ada perubahan ---
  function updateHidden() {
    $('#kodepropinsi').val($('#provinsi').val() || '');
    $('#kodekabupaten').val($('#kabupaten').val() || '');
    $('#kodekecamatan').val($('#kecamatan').val() || '');
    $('#kodekelurahan').val($('#kelurahan').val() || '');
  }

  $('#provinsi, #kabupaten, #kecamatan, #kelurahan').on('change', updateHidden);
});
