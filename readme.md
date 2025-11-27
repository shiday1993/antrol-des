## README.md — *ANTROL-DES*

# ANTROL-DES
Digitalisasi Pelayanan Publik Desa – Sistem Antrean Pelayanan Administrasi Berbasis Web

ANTROL-DES adalah aplikasi antrean pelayanan administrasi desa berbasis web yang
dikembangkan untuk mendukung transformasi digital di pemerintahan desa.  
Aplikasi ini membantu petugas dalam mengatur alur layanan, memanggil antrean,
dan menampilkan status antrean secara real-time kepada masyarakat.

---

## Fitur Utama
- Manajemen loket pelayanan
- Pengambilan nomor antrean otomatis berdasarkan tanggal
- Pemanggilan nomor secara real-time
- Status antrean: *menunggu*, *sedang dilayani*, *selesai*, *batal*
- Tampilan antrean publik (layar TV/monitor)
- Hak akses pengguna (Admin / Petugas)
- Monitoring harian antrean

---

## Teknologi Digunakan
| Komponen | Teknologi |
|--------|-----------|
| Backend | Python (Flask) |
| Database | PostgreSQL (psql) |
| Frontend | HTML + JS |
| API | REST JSON |
| Auth | Session-based login |

---

## Struktur Database PSQL
### Tabel: `loket`
| Kolom | Tipe | Keterangan |
|------|-----|------------|
| id | SERIAL (PK) | ID loket |
| nama | VARCHAR(50) | Nama loket |

```sql
CREATE TABLE loket (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(50) UNIQUE NOT NULL
);
````

### Tabel: `antrean_cs`

| Kolom         | Tipe        | Keterangan                                   |
| ------------- | ----------- | -------------------------------------------- |
| id            | SERIAL (PK) | ID antrean                                   |
| nomor         | INT         | Nomor urut harian                            |
| prefix        | VARCHAR(5)  | Awalan nomor                                 |
| tanggal       | DATE        | Tanggal antrean                              |
| status        | VARCHAR(50) | menunggu / sedang dilayani / selesai / batal |
| loket         | INT         | Loket yang melayani                          |
| waktu_panggil | TIMESTAMP   | Waktu dipanggil                              |
| waktu_selesai | TIMESTAMP   | Waktu selesai                                |

```sql
CREATE TABLE antrean_cs (
    id SERIAL PRIMARY KEY,
    nomor INT NOT NULL,
    prefix VARCHAR(5),
    tanggal DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'menunggu',
    loket INT REFERENCES loket(id),
    waktu_panggil TIMESTAMP NULL,
    waktu_selesai TIMESTAMP NULL
);
```

---

## Konfigurasi & Instalasi

### Clone Repository

```bash
git clone https://github.com/shiday1993/antrol-des.git
cd antrol-des
```

### Buat Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### Install Dependency

```bash
pip install -r requirements.txt
```

### Konfigurasi PostgreSQL

Masuk PostgreSQL:

```bash
sudo -u postgres psql
```

Buat database:

```sql
CREATE DATABASE antroldb;
CREATE USER antroluser WITH ENCRYPTED PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE antroldb TO antroluser;
```

Edit file konfigurasi di:

```
.env 
(dalam repo menggunakan .env.example)
```

Isi:

```python
DB_HOST = "localhost"
DB_NAME = "antroldb"
DB_USER = "antroluser"
DB_PASS = "password123"
API_KEY = "rahasia-key"
```

### Migrate database

```bash
psql -U antroluser -d antroldb -f database.sql
```

---

## Menjalankan Aplikasi

```bash
flask run
```

Akses via browser:

```
http://localhost:5000
```

---

## Dokumentasi API (Ringkas)

| Method | Endpoint           | Deskripsi             |
| ------ | ------------------ | --------------------- |
| GET    | `/loket`           | List loket            |
| POST   | `/loket`           | Tambah loket          |
| DELETE | `/loket`           | Hapus loket           |
| GET    | `/antrean`         | Data antrean hari ini |
| POST   | `/antrean`         | Ambil nomor antrean   |
| POST   | `/antrean/panggil` | Panggil antrean       |
| POST   | `/antrean/selesai` | Selesaikan antrean    |

---

## 🖼 Screenshot

> Contoh:
```
screenshots/
├── login.png
├── dashboard.png
├── display.png
```
---

## 👨‍💻 Pengembang

Nama: **Syamsul Hidayat & Ratna Eka Harlianti**
Program Studi: **Teknik Informatika**
Tempat Magang: **Kantor Desa Bumi Dipasena Utama, Kec. Rawajitu Timus,  Kab. Tulang Bawang, Lampung**

---

