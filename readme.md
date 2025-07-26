# 🌐 Cloudflare Worker: Daftar Subdomain Wildcard

Sistem ini memungkinkan pengguna mendaftarkan subdomain dinamis (seperti `tokopedia.apps.domain.com`) secara otomatis melalui Cloudflare Worker. Worker ini juga memfilter subdomain dengan kata-kata yang tidak pantas dan menampilkan daftar subdomain yang sudah terdaftar.

---

## 🚀 Fitur

- 🧩 Daftarkan subdomain otomatis via Worker
- ✅ Validasi domain agar sesuai format dan belum dipakai
- ⛔ Blokir kata-kata kasar berdasarkan daftar GitHub
- 📋 Menampilkan daftar subdomain aktif (klik + salin)
- 🎨 Antarmuka HTML sederhana & dark mode

---

## 📦 Persyaratan

- Akun Cloudflare
- Domain aktif di Cloudflare (misal: `domain.com`)
- Subdomain wildcard diarahkan ke Worker (`*.apps.domain.com`)

---

## 🔧 Bagian Kode yang Harus Diubah

### 1. **Format Subdomain**

Di bagian HTML (`htmlPage`), ubah:
```js
const full = wildcard + ".apps.domain.com";

---
Ganti apps.domain.com sesuai wildcard subdomain kamu.

### 2. **Konfigurasi Cloudflare API**

Di dalam objek `CloudflareApi`, ubah bagian ini:
```js
const cf = new CloudflareApi({
  apiKey: "GANTI_DENGAN_API_KEY_KAMU",
  apiEmail: "email@example.com",
  accountID: "cloudflare_account_id",
  zoneID: "cloudflare_zone_id",
  serviceName: "v1", // Nama worker/service kamu
  rootDomain: "domain.com", // Domain utama
  appDomain: "apps.domain.com", // Subdomain wildcard
});
```

## Cara Menggunakan

1. Buka URL Worker (contoh: `https://wildcard-subdomain.kamu.workers.dev`)
2. Masukkan subdomain yang diinginkan (contoh: `tokopedia.com`)
3. Klik tombol **🧩 Daftarkan**
4. Jika sukses, domain akan tersedia di:
   ```
   https://tokopedia.com.apps.domain.com
   ```

---

## ✅ Kode Status

| Kode | Arti |
|------|------|
| 200  | ✅ Berhasil didaftarkan |
| 400  | ❌ Format domain tidak valid |
| 403  | ⛔ Mengandung kata terlarang |
| 409  | ⚠️ Sudah terdaftar sebelumnya |

---

## 🛡 Filter Kata Kasar

Worker akan mengambil daftar kata dari:
> https://github.com/coffee-and-fun/google-profanity-words/blob/main/list.txt

Jika subdomain mengandung kata dalam daftar tersebut, permintaan akan ditolak (`403`).

---

## 📜 Lisensi

MIT - Bebas digunakan, dimodifikasi, dan dikembangkan kembali.

---

## 🙋 FAQ

### Q: Apakah bisa dipakai di subdomain selain `.apps.domain.com`?

A: Bisa. Ubah bagian:
```js
const full = wildcard + ".apps.domain.com";
```
Dan `appDomain` di konfigurasi Cloudflare API.

### Q: Haruskah pakai CNAME DNS wildcard?

A: Jika tidak pakai Route, ya. Tambahkan record:
```
Type: CNAME
Name: *.apps
Target: @
```

Kalau pakai Worker Route, cukup atur:
```
Route: *.apps.domain.com/*
Worker: v1
```

---

## ✨ Contoh Langsung

Subdomain baru bisa langsung digunakan jika berhasil:
```
https://tokopedia.com.apps.domain.com
```

---

## 📬 Kontak

Punya pertanyaan atau butuh bantuan?  
Buka issue di GitHub atau hubungi saya langsung.
