# Manual Setup Firebase (Spark / Free Plan)

Panduan bikin & deploy backend Firebase buat app ini. Semua langkah di sini
gratis (Spark plan), gak perlu kartu kredit/billing account.

## 1. Bikin Firebase Project

1. Buka [console.firebase.google.com](https://console.firebase.google.com)
2. Klik **Add project** (atau "Create a project")
3. Kasih nama (misal `timeline-task-ios`), lanjut
4. Google Analytics boleh di-skip (gak perlu buat app ini)
5. Tunggu project selesai dibuat

## 2. Aktifkan Authentication (Email/Password + Google)

1. Di sidebar kiri, klik **Build → Authentication**
2. Klik **Get started**
3. Di tab **Sign-in method**, klik **Email/Password**
4. Toggle **Enable**, klik **Save**
5. Kembali ke daftar provider, klik **Google**
6. Toggle **Enable**
7. Isi **Project support email** (pilih email kamu dari dropdown)
8. Klik **Save**

Firebase otomatis bikinin OAuth client buat provider Google-nya — gak perlu
bolak-balik ke Google Cloud Console kayak kalau bikin OAuth manual.

Catatan: beda dari Supabase, Firebase Auth **tidak** wajib konfirmasi email
secara default — daftar langsung bisa login, jadi migrasi data tamu
langsung jalan setelah daftar (sudah sesuai keputusan sebelumnya). Ini juga
berlaku buat Google Sign-In.

## 3. Bikin Firestore Database

1. Di sidebar kiri, klik **Build → Firestore Database**
2. Klik **Create database**
3. Pilih mode **Production mode** (bukan test mode — kita udah punya security
   rules sendiri)
4. Pilih lokasi server (misal `asia-southeast1` / Singapore biar dekat &
   cepat) — **tidak bisa diganti setelah dipilih**, jadi pilih yang paling
   sesuai target user
5. Klik **Enable**

## 4. Deploy Security Rules

File aturannya sudah disiapkan di `firestore.rules` (root project ini).
Isinya cuma satu aturan: user cuma boleh baca/tulis data di bawah
`users/{uid-mereka-sendiri}` — data user lain otomatis gak bisa diakses.

**Cara paling gampang (tanpa install apapun):**

1. Di Firebase Console, buka **Firestore Database → Rules** (tab di atas)
2. Hapus isi default, ganti dengan isi file `firestore.rules` di project ini
3. Klik **Publish**

**Cara alternatif (pakai Firebase CLI, kalau sudah familiar):**

```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # pilih project yang tadi dibuat, pakai firestore.rules yang sudah ada
firebase deploy --only firestore:rules
```

## 5. Ambil Konfigurasi Web App

1. Klik ikon gear ⚙️ di sidebar kiri → **Project settings**
2. Scroll ke bawah ke bagian **Your apps**
3. Klik ikon **</>** (Web) buat daftarin app baru
4. Kasih nickname (misal "timeline-web"), **jangan** centang Firebase Hosting
   (kita pakai Vercel)
5. Klik **Register app** — akan muncul objek `firebaseConfig` seperti ini:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "timeline-task-ios.firebaseapp.com",
  projectId: "timeline-task-ios",
  storageBucket: "timeline-task-ios.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

6. Copy tiap nilainya ke `.env.local` (bikin file baru di root project, isi
   sesuai `.env.example`):

```
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="timeline-task-ios.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="timeline-task-ios"
VITE_FIREBASE_STORAGE_BUCKET="timeline-task-ios.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:abcdef1234567890"
```

## 6. Test Lokal

```bash
npm run dev
```

Buka app, ke tab **Profil**, klik **Daftar Sekarang**, daftar pakai email
baru. Kalau berhasil, buka Firebase Console → Firestore Database → Data,
harusnya muncul koleksi `users/<uid-kamu>/tasks` dan `users/<uid-kamu>/projects`
berisi data demo yang otomatis ke-migrasi.

## 7. Deploy ke Vercel

1. Buka project di [vercel.com](https://vercel.com) → **Settings → Environment Variables**
2. Tambahkan 6 variabel `VITE_FIREBASE_*` di atas (untuk Production, dan
   Preview kalau perlu)
3. Redeploy (env var baru butuh build ulang — Vite nge-inline nilainya pas
   build, jadi restart server aja gak cukup)
4. **Wajib buat Google Sign-In:** balik ke Firebase Console → Authentication
   → tab **Settings** → **Authorized domains** → **Add domain** → masukkan
   domain Vercel kamu (misal `timeline-task-ios.vercel.app`, dan custom
   domain kalau ada). Tanpa ini, Google Sign-In error `auth/unauthorized-domain`
   di production walau di local (`localhost`) tetap jalan normal (localhost
   otomatis udah di-whitelist).

## Batas Gratis (Spark Plan)

Buat referensi, ini batas harian Firestore di Spark plan (biasanya lebih
dari cukup buat awal-awal):

- 50.000 baca / hari
- 20.000 tulis / hari
- 20.000 hapus / hari
- 1 GiB storage total

Auth (Email/Password) di Spark plan gratis tanpa batas jumlah user.
