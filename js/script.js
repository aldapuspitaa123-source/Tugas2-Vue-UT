// Halaman login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        const user = dataPengguna.find(
            (u) => u.email === email && u.password === password
        );

        if (user) {
            localStorage.setItem('namaUser', user.nama);
            Swal.fire({
                title: 'Login Berhasil!',
                text: `Selamat datang, ${user.nama}!`,
                icon: 'success',
                confirmButtonText: 'Lanjutkan',
            }).then(() => window.location.href = 'dashboard.html');
        } else {
            Swal.fire({
                title: 'Login Gagal!',
                text: 'Email atau password salah. Silakan coba lagi.',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    });
}

// Pop up untuk lupa password dan buat akun baru
const forgetLink = document.getElementById('forgetLink');
const registerLink = document.getElementById('registerLink');
if (forgetLink) {
    forgetLink.addEventListener('click', () => {
        Swal.fire({
            title: 'Lupa Password?',
            text: 'Silakan hubungi admin UT untuk reset password.',
            icon: 'info'
        });
    });
}
if (registerLink) {
    registerLink.addEventListener('click', () => {
        Swal.fire({
            title: 'Buat Akun Baru',
            text: 'Kunjungi laman MyUT untuk membuat akun baru.',
            icon: 'question'
        });
    });
}

// Halaman dashboard
const greeting = document.getElementById('greeting');
if (greeting) {
    const namaUser = localStorage.getItem('namaUser');
    const hour = new Date().getHours();
    let timeOfDay;
    if (hour < 11) {
        timeOfDay = 'Selamat Pagi';
    } else if (hour < 15) {
        timeOfDay = 'Selamat Siang';
    } else if (hour < 19) {
        timeOfDay = 'Selamat Sore';
    } else {
        timeOfDay = 'Selamat Malam';
    }

    greeting.innerHTML = namaUser
        ? `${timeOfDay}, <span class="highlight">${namaUser}</span>!`
        : `${timeOfDay}!`;
;

}

const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.addEventListener('click', () => {
    // console.log("ok");
    Swal.fire({
        title: 'Yakin ingin logout?',
        text: 'Anda akan keluar dari sistem.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Logout',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('namaUser');
            Swal.fire({
                title: 'Logout Berhasil',
                text: 'Anda telah keluar dari sistem.',
                icon: 'info',
                confirmButtonText: 'OK'
            }).then(() => window.location.href = 'index.html');
        }
    });
});

// Halaman tracking
const findBtn = document.getElementById('findBtn');
if (findBtn) {
    findBtn.addEventListener('click', () => {
        const doNumber = document.getElementById('inputDO').value.trim();
        const resultContainer = document.getElementById('trackingResult');

        if (!doNumber) {
            Swal.fire({
                title: 'Nomor DO Kosong',
                text: 'Masukkan Nomor DO terlebih dahulu.',
                icon: 'warning'
            });
            return;
        }

        const data = dataTracking[doNumber];
        if (!data) {
            Swal.fire({
                title: 'Data Tidak Ditemukan',
                text: `Nomor DO ${doNumber} tidak tersedia dalam sistem.`,
                icon: 'error'
            });
            return;
        }

        // untuk data tracking
        let perjalananHTML = '';
        data.perjalanan.forEach(item => {
            perjalananHTML += `
        <li>
          <div class="timeline-dot"></div>
          <div class="timeline-info">
            <span class="timeline-time">${item.waktu}</span>
            <p class="timeline-text">${item.keterangan}</p>
          </div>
        </li>`;
        });

        resultContainer.innerHTML = `
      <div class="tracking-card">
        <h3>Detail Pengiriman</h3>
        <div class="tracking-info">
          <p><b>Nomor DO:</b> ${data.nomorDO}</p>
          <p><b>Nama:</b> ${data.nama}</p>
          <p><b>Status:</b> <span class="status">${data.status}</span></p>
          <p><b>Ekspedisi:</b> ${data.ekspedisi}</p>
          <p><b>Tanggal Kirim:</b> ${data.tanggalKirim}</p>
          <p><b>Kode Paket:</b> ${data.paket}</p>
          <p><b>Total Pembayaran:</b> ${data.total}</p>
        </div>

        <h4>Riwayat Perjalanan</h4>
        <ul class="timeline">
          ${perjalananHTML}
        </ul>
      </div>`;
    });
}

// Halaman informasi stok bahan ajar
if (typeof dataBahanAjar !== 'undefined') {
    const tbody = document.querySelector('#tabelStok tbody');
    const renderTable = () => {
        tbody.innerHTML = '';
        dataBahanAjar.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
        <td>${item.kodeBarang}</td>
        <td>${item.namaBarang}</td>
        <td>${item.stok}</td>
        <td>${item.kodeLokasi}</td>
        <td>
            <a href="../${item.cover}" target="_blank">Klik untuk melihat cover ${item.namaBarang}</a>
        </td>
      `;
            tbody.appendChild(row);
        });
    };
    renderTable();

    document.getElementById('formTambah').addEventListener('submit', e => {
        e.preventDefault();
        const kodeBarang = document.getElementById('kode').value;
        const namaBarang = document.getElementById('nama').value;
        const stok = document.getElementById('stok').value;
        const kodeLokasi = document.getElementById('lokasi').value;
        const cover = document.getElementById('cover').value;

        dataBahanAjar.push({ kodeBarang, namaBarang, stok, kodeLokasi, cover });
        renderTable();

        console.log(dataBahanAjar);

        Swal.fire({
            title: 'Data Ditambahkan!',
            text: 'Stok bahan ajar baru berhasil ditambahkan.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });

        e.target.reset();
    });
}