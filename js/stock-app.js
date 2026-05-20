const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            // Data dari dataBahanAjar.js
            upbjjList: dataBahanAjar.upbjjList,
            kategoriList: dataBahanAjar.kategoriList,
            stok: dataBahanAjar.stok,

            // Reactive state untuk filter, sort, dan tampilan tabel
            selectedUpbjj: "",
            selectedKategori: "",
            isSafety: false,
            sortBy: "",

            // Data untuk form tambah stok
            newData: {
                kode: "",
                judul: "",
                kategori: "",
                upbjj: "",
                lokasiRak: "",
                harga: 0,
                stok: 0,
                catatanHTML: ""
            }
        };
    },
    computed: {
        // untuk memfilter upbjj terlebih dahulu sebelum menampilkan kategori
        kategoriListFiltered() {
            if (!this.selectedUpbjj) return [];
            // ambil kategori unik yang hanya muncul di stok dengan UPBJJ yang dipilih
            const filtered = this.stok
                .filter(item => item.upbjj === this.selectedUpbjj)
                .map(item => item.kategori);
            return [...new Set(filtered)]; // hilangkan duplikat
        },

        // utk menampilkan data yg sudah difilter
        filteredData() {
            let data = [...this.stok];

            // filter UPBJJ
            if (this.selectedUpbjj)
                data = data.filter(i => i.upbjj === this.selectedUpbjj);

            // filter kategori (jika dipilih)
            if (this.selectedKategori)
                data = data.filter(i => i.kategori === this.selectedKategori);

            // filter stok menipis / kosong
            if (this.isSafety)
                data = data.filter(i => i.qty <= i.safety || i.qty === 0);

            // sorting
            if (this.sortBy === "judul")
                data.sort((a, b) => a.judul.localeCompare(b.judul));
            else if (this.sortBy === "qty")
                data.sort((a, b) => a.qty - b.qty);
            else if (this.sortBy === "harga")
                data.sort((a, b) => a.harga - b.harga);

            return data;
        }
    },
    methods: {
        // reset filter
        resetFilter() {
            this.selectedUpbjj = "";
            this.selectedKategori = "";
            this.isSafety = false;
            this.sortBy = "";
        },
        statusText(item) {
            if (item.qty === 0) return "Kosong";
            else if (item.qty < item.safety) return "Menipis";
            else return "Aman";
        },
        statusKelas(item) {
            if (item.qty === 0) return "danger";
            else if (item.qty < item.safety) return "warning";
            else return "success";
        },

        // ====== ADD ITEM ======
        async openAddModal() {
            const upbjjOptions = this.upbjjList.map(
                (u) => `<option value="${u}">${u}</option>`
            ).join("");

            const kategoriOptions = this.kategoriList.map(
                (k) => `<option value="${k}">${k}</option>`
            ).join("");

            // Tambahan: Membuat daftar opsi untuk Lokasi Rak
            const lokasiRakList = ['R1-A1', 'R1-A2', 'R1-B1', 'R1-B2', 'R1-C1', 'R1-C2', 'R2-A1', 'R2-A2', 'R2-B1', 'R2-B2', 'R2-C1', 'R2-C2', 'R3-A1', 'R3-A2', 'R3-B1', 'R3-B2', 'R3-C1', 'R3-C2', 'R4-A1', 'R4-A2', 'R4-B1', 'R4-B2'];
            const lokasiRakOptions = lokasiRakList.map(
                (r) => `<option value="${r}">${r}</option>`
            ).join("");

            const { value: formValues } = await Swal.fire({
                title: 'Tambah Bahan Ajar',
                width: 600,
                html: `
          <input id="kode" class="swal2-input" placeholder="Kode">
          <input id="judul" class="swal2-input" placeholder="Judul">
          <select id="kategori" class="swal2-select">
                <option value="">Pilih Kategori</option>${kategoriOptions}
            </select>
            <select id="upbjj" class="swal2-select">
                <option value="">Pilih UPBJJ</option>${upbjjOptions}
            </select>
          <select id="lokasiRak" class="swal2-select">
              <option value="">Pilih Lokasi Rak</option>${lokasiRakOptions}
          </select>
          <input id="harga" class="swal2-input" type="text" placeholder="Harga">
          <input id="qty" class="swal2-input" type="number" placeholder="Jumlah">
          <div style="text-align: left; font-size: 13px; color: #666; margin: 15px 0 8px 5px; font-weight: 600;">Catatan (Opsional):</div>
          <div id="catatanHTML" class="swal2-textarea" contenteditable="true" style="min-height: 100px; text-align: left; padding: 10px; font-size: 14px; overflow-y: auto; cursor: text; margin-top: 0;"></div>
          `,
                didOpen: () => {
              
                    const hargaInput = document.getElementById('harga');
                    hargaInput.addEventListener('input', function (e) {
                  
                        let value = this.value.replace(/[^0-9]/g, '');
                    
                        this.value = value ? parseInt(value, 10).toLocaleString('id-ID') : '';
                    });
                },
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: "Simpan",
                cancelButtonText: "Batal",
                preConfirm: () => {
                    return {
                        kode: document.getElementById('kode').value.trim(),
                        judul: document.getElementById('judul').value.trim(),
                        kategori: document.getElementById('kategori').value,
                        upbjj: document.getElementById('upbjj').value,
                        lokasiRak: document.getElementById('lokasiRak').value,
                        // Hapus titik sebelum mengubahnya jadi Number agar data tersimpan dengan benar
                        harga: Number(document.getElementById('harga').value.replace(/\./g, '')),
                        qty: Number(document.getElementById('qty').value),
                        // Ambil isi format HTML dari elemen div
                        catatanHTML: document.getElementById('catatanHTML').innerHTML.trim(),
                        safety: 10
                    };
                }
            });

            if (formValues) {
                if (!formValues.kode || !formValues.judul) {
                    Swal.fire("Gagal", "Semua field wajib diisi!", "error");
                    return;
                }

                // Cek kode duplikat
                if (this.stok.some(i => i.kode === formValues.kode)) {
                    Swal.fire("Gagal", "Kode sudah terdaftar!", "error");
                    return;
                }

                this.stok.push(formValues);
                Swal.fire("Berhasil", "Data bahan ajar ditambahkan!", "success");
            }
        },

        // ====== EDIT ITEM ======
        async editItem(item) {
            const upbjjOptions = this.upbjjList.map(
                (u) => `<option value="${u}" ${u === item.upbjj ? "selected" : ""}>${u}</option>`
            ).join("");

            const kategoriOptions = this.kategoriList.map(
                (k) => `<option value="${k}" ${k === item.kategori ? "selected" : ""}>${k}</option>`
            ).join("");

            const lokasiRakList = ['R1-A1', 'R1-A2', 'R1-B1', 'R1-B2', 'R1-C1', 'R1-C2', 'R2-A1', 'R2-A2', 'R2-B1', 'R2-B2', 'R2-C1', 'R2-C2', 'R3-A1', 'R3-A2', 'R3-B1', 'R3-B2', 'R3-C1', 'R3-C2', 'R4-A1', 'R4-A2', 'R4-B1', 'R4-B2'];
            if (item.lokasiRak && !lokasiRakList.includes(item.lokasiRak)) {
                lokasiRakList.push(item.lokasiRak);
            }
            const lokasiRakOptions = lokasiRakList.map(
                (r) => `<option value="${r}" ${r === item.lokasiRak ? "selected" : ""}>${r}</option>`
            ).join("");

            const { value: formValues } = await Swal.fire({
                title: 'Edit Data Bahan Ajar',
                width: 600,
                html: `
                <div style="text-align: left; font-size: 13px; color: #666; margin: 15px 0 8px 5px; font-weight: 600;">Judul:</div>
          <input id="judul" class="swal2-input" value="${item.judul}">
          <div style="text-align: left; font-size: 13px; color: #666; margin: 15px 0 8px 5px; font-weight: 600;">Kategori:</div>
          <select id="kategori" class="swal2-select">${kategoriOptions}</select>
          <div style="text-align: left; font-size: 13px; color: #666; margin: 15px 0 8px 5px; font-weight: 600;">UPBJJ:</div>
          <select id="upbjj" class="swal2-select">${upbjjOptions}</select>
          <div style="text-align: left; font-size: 13px; color: #666; margin: 15px 0 8px 5px; font-weight: 600;">Lokasi Rak:</div>
          <select id="lokasiRak" class="swal2-select">${lokasiRakOptions}</select>
          <div style="text-align: left; font-size: 13px; color: #666; margin: 15px 0 8px 5px; font-weight: 600;">Harga:</div>
          <input id="harga" class="swal2-input" type="text" value="${item.harga ? item.harga.toLocaleString('id-ID') : ''}">
          <div style="text-align: left; font-size: 13px; color: #666; margin: 15px 0 8px 5px; font-weight: 600;">Quantity:</div>
          <input id="qty" class="swal2-input" type="number" value="${item.qty}">
          <div style="text-align: left; font-size: 13px; color: #666; margin: 15px 0 8px 5px; font-weight: 600;">Catatan:</div>
          
          <div id="catatanHTML" class="swal2-textarea" contenteditable="true" style="min-height: 100px; text-align: left; padding: 10px; font-size: 14px; overflow-y: auto; cursor: text; margin-top: 0;">${item.catatanHTML || ""}</div>
        `,
                didOpen: () => {
                    // Logika format ribuan saat modal terbuka
                    const hargaInput = document.getElementById('harga');
                    hargaInput.addEventListener('input', function (e) {
                        // Hanya ambil angka
                        let value = this.value.replace(/[^0-9]/g, '');
                        // Format ke locale ID dengan titik
                        this.value = value ? parseInt(value, 10).toLocaleString('id-ID') : '';
                    });
                },
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: "Simpan Perubahan",
                cancelButtonText: "Batal",
                preConfirm: () => ({
                    judul: document.getElementById('judul').value.trim(),
                    kategori: document.getElementById('kategori').value,
                    upbjj: document.getElementById('upbjj').value,
                    lokasiRak: document.getElementById('lokasiRak').value,
                    // Hapus titik sebelum mengubahnya jadi Number agar data tersimpan dengan benar
                    harga: Number(document.getElementById('harga').value.replace(/\./g, '')),
                    qty: Number(document.getElementById('qty').value),
                    // Menyimpan kembali data format HTML-nya
                    catatanHTML: document.getElementById('catatanHTML').innerHTML.trim()
                })
            });
            if (formValues) {
                Object.assign(item, formValues);
                Swal.fire("Berhasil", "Data bahan ajar telah diperbarui!", "success");
            }
        },
        // ====== DELETE ITEM ======
        deleteItem(item) {
            Swal.fire({
                title: 'Yakin ingin menghapus?',
                text: `Data ${item.judul} akan dihapus!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Ya, hapus!',
                cancelButtonText: 'Batal'
            }).then(result => {
                if (result.isConfirmed) {
                    this.stok = this.stok.filter(i => i.kode !== item.kode);
                    Swal.fire("Terhapus!", "Data telah dihapus.", "success");
                }
            });
        }
    }
});

app.mount("#stockApp");