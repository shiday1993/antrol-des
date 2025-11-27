$('#loginForm').on('submit', async function (e) {
    e.preventDefault()
    const data = {
        username: $('#username').val(),
        password: $('#password').val(),
    };
    if (!data.username || !data.password) {
        Swal.fire('Perhatian', 'Username dan password wajib diisi', 'warning');
        return;
    }

    Swal.fire({
        title: 'Harap Tunggu...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
    });

    try {
        const res = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data),
        });
        const respon = await res.json();
        const meta = respon.metaData || respon.metadata || {};
        const code = parseInt(meta.code);
        const msg = meta.message || 'Terjadi kesalahan';
        console.log(respon)
        Swal.close();

        if (code === 200) {
            const r = respon.response;
            const token = r.token;
            const user = r.nama
            localStorage.setItem('token', token);

            Swal.fire('', `Login berhasil. Selamat datang ${user}`, 'success').then(() => {
                window.location.href = '/';
            });
        } else {
            Swal.fire('', msg, 'warning');
        }
    } catch (err) {
        Swal.close();
        Swal.fire('', 'Internal Server Error', 'error');
        console.error('Login error:', err);
    }
});