# Vulnerable Task Manager

Aplikasi ini sengaja dirancang dengan berbagai celah keamanan (intentionally vulnerable) sebagai target eksploitasi dalam proyek akhir "Vulnerable Package Exchange". Mengusung konsep _task manager_ sederhana, aplikasi ini berjalan di atas arsitektur 3 _container_ (Apache, Node.js/Express, dan MySQL).

⚠️ **PERINGATAN KERAS:** Jangan pernah menjalankan _environment_ ini di server _production_ atau jaringan publik yang tidak terisolasi.

## Persyaratan Sistem

Pastikan sistem lu sudah terpasang:

- Docker
- Docker Compose

## Cara Build & Menjalankan Aplikasi

Sesuai ketentuan, _environment_ ini dikonfigurasi agar bisa di-_build_ dan dijalankan cukup dengan satu perintah. Buka terminal, arahkan ke _root directory_ proyek ini, lalu eksekusi:

```bash
docker-compose up

```

_(Gunakan flag `-d` di akhir perintah jika ingin menjalankan container di background)._

## Port Aplikasi

Setelah seluruh _container_ berhasil berdiri, layanan dapat diakses melalui _port_ berikut:

- **Frontend (Web UI):** `http://localhost:80`
- **Backend (REST API):** `http://localhost:3000`
- **Database (MySQL):** `localhost:3306`

## Informasi Tambahan

Database akan otomatis melakukan _seeding_ data awal saat pertama kali _container_ MySQL berjalan. Tim penguji (Red Team) dapat menggunakan kredensial _default_ berikut untuk proses _login_ dan _assessment_:

- **Admin Account** -> Username: `admin` | Password: `admin123`
- **User Account** -> Username: `testuser` | Password: `password`

Silakan lakukan penetrasi, temukan celah, dan catat temuan kalian di Worksheet Assessment 2. _Happy hunting!_
