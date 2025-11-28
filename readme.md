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
```

### Tabel: `antrean_cs`

| Kolom         | Tipe        | Keterangan                                   |
| ------------- | ----------- | -------------------------------------------- |
| id            | SERIAL (PK) | ID antrean                                   |
| nomor         | INT         | Nomor urut harian                            |
| prefix        | VARCHAR(5)  | Awalan nomor                                 |
| tanggal       | DATE        | Tanggal antrean                              |
| status        | VARCHAR(50) | menunggu / sedang dilayani / selesai / batal |
| loket         | VARCHAR(50) | Loket yang melayani                          |
| waktu_panggil | TIMESTAMP   | Waktu dipanggil                              |
| waktu_selesai | TIMESTAMP   | Waktu selesai                                |

```sql
CREATE TABLE antrean_cs (
    id SERIAL PRIMARY KEY,
    nomor INT NOT NULL,
    prefix VARCHAR(5),
    tanggal DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'menunggu',
    loket VARCHAR(50),
    waktu_panggil TIMESTAMP NULL,
    waktu_selesai TIMESTAMP NULL
);
```

### Tabel: `users`
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    realname VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    privilege VARCHAR(20) DEFAULT 'operator',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
CREATE DATABASE antrol_desa;
CREATE USER desa WITH ENCRYPTED PASSWORD 'desa1234';
GRANT ALL PRIVILEGES ON DATABASE antrol_desa TO desa;
```

Edit file konfigurasi di:

```
.env 
(dalam repo menggunakan .env.example)
```

Isi:

```python
DB_HOST = "localhost"
DB_NAME = "antrol_desa"
DB_USER = "desa"
DB_PASS = "desa1234"
API_KEY = "rahasia-key"
```

### Migrate database

```bash
psql -U desa -d antrol_desa -f database.sql
```

---

## Menjalankan Aplikasi

```bash
flask run
#atau 
python main.py 
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

