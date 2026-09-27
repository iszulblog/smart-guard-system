# Panduan Penerbitan Live Web Menggunakan Vercel & Supabase (SGVS)

Dokumen ini menyediakan panduan langkah demi langkah untuk menerbitkan sistem **Smart Guard Verification System (SGVS)** ke platform awam menggunakan **Supabase (Pangkalan Data Cloud PostgreSQL)** dan **Vercel (Hos Pelayan Web Serverless)** secara percuma.

---

## Bahagian 1: Penyediaan Pangkalan Data di Supabase (Percuma)

1. **Daftar / Log Masuk ke Supabase:**
   - Layari [https://supabase.com](https://supabase.com) dan log masuk (boleh menggunakan akaun GitHub).
   - Klik **New Project** dan namakan projek anda (contoh: `sgvs-attendance-db`).
   - Tetapkan kata laluan pangkalan data (*Database Password*) dan pilih zon rantau yang terdekat (contoh: *Singapore - Southeast Asia (Singapore)*).

2. **Jalankan Skrip SQL Pangkalan Data:**
   - Di menu sebelah kiri papan pemuka Supabase, klik **SQL Editor**.
   - Klik **New Query**.
   - Buka fail [`supabase_schema.sql`](./supabase_schema.sql) yang telah disediakan di dalam folder projek ini, salin kesemua kandungannya dan tampal (*paste*) ke dalam SQL Editor Supabase.
   - Klik butang **Run** (atau tekan `Ctrl + Enter`).
   - *Hasil:* Jadual `guard_posts`, `guards`, `attendance_logs`, dan `settings` berserta data contoh (Pos Utama, Gate B, Pengawal SG-101 hingga SG-104) akan terus dicipta secara automatik!

3. **Salin Kunci API Supabase:**
   - Di papan pemuka Supabase, pergi ke menu **Project Settings** (ikon gear di bawah) ➔ **API**.
   - Salin maklumat berikut untuk dimasukkan ke dalam Vercel:
     - **Project URL** (contoh: `https://xyzcompany.supabase.co`)
     - **Project API Keys ➔ `anon` `public`** (kunci awam)
     - **Project API Keys ➔ `service_role` `secret`** (kunci pentadbir sulit)

---

## Bahagian 2: Penerbitan Live Web ke Vercel (Percuma)

Terdapat 2 kaedah mudah untuk menerbitkan sistem ke Vercel:

### Kaedah A: Sambungan Melalui GitHub (Disyorkan & Paling Mudah)

1. Cipta satu repositori baharu di akaun [GitHub](https://github.com/new) anda (contoh: `smart-guard-system`).
2. Di terminal projek anda, hubungkan dan tolak kod ke GitHub:
   ```bash
   git remote add origin https://github.com/USERNAME-ANDA/smart-guard-system.git
   git branch -M main
   git push -u origin main
   ```
3. Buka [https://vercel.com](https://vercel.com) dan klik **Add New... ➔ Project**.
4. Pilih repositori `smart-guard-system` yang baru anda tolak dan klik **Import**.
5. Di bahagian **Environment Variables**, masukkan 3 pembolehubah penting ini:
   - `NEXT_PUBLIC_SUPABASE_URL` = *(Tampal Project URL Supabase)*
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = *(Tampal Kunci Anon Supabase)*
   - `SUPABASE_SERVICE_ROLE_KEY` = *(Tampal Kunci Service Role Supabase)*
   *(Pilihan: `TELEGRAM_BOT_TOKEN` dan `TELEGRAM_CHAT_ID` jika menggunakan notifikasi)*
6. Klik butang **Deploy**.
7. Dalam masa 1–2 minit, Vercel akan menghasilkan alamat web langsung kekal berstatus HTTPS (contoh: `https://smart-guard-system.vercel.app`)!

---

### Kaedah B: Terus Melalui Terminal Komputer (Vercel CLI)

Sekiranya anda ingin menerbitkan terus tanpa GitHub:
1. Buka terminal di dalam folder projek dan jalankan:
   ```bash
   npx vercel
   ```
2. Terminal akan meminta pengesahan log masuk pelayar web (*browser login*). Log masuk akaun Vercel anda.
3. Jawab soalan persediaan projek dengan menekan kekunci **Enter** (terima tetapan *default*).
4. Tambah Environment Variables ke projek Vercel anda:
   ```bash
   npx vercel env add NEXT_PUBLIC_SUPABASE_URL
   npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   npx vercel env add SUPABASE_SERVICE_ROLE_KEY
   ```
5. Bina dan terbitkan ke persekitaran produksi:
   ```bash
   npx vercel --prod
   ```

---

## Bahagian 3: Kelebihan Seni Bina Vercel + Supabase

- 🔒 **HTTPS Automatik & Sepenuh Masa:** Memastikan sensor kamera hadapan telefon pengawal (*Camera API*) dan bacaan geofencing (*Geolocation API*) berfungsi 100% tanpa sebarang halangan keselamatan pelayar.
- ⚡ **Pangkalan Data Awan Sebenar (PostgreSQL):** Rekod kehadiran pengawal, transaksi log, dan siasatan *flagged* disimpan terus secara berpusat di awan Supabase dan boleh diakses oleh mana-mana pegawai pentadbir secara masa nyata.
- 📱 **Keserasian Fail APK:** Fail Android APK yang telah dibina sebelum ini boleh terus menyambung ke domain Vercel anda (contoh: `https://projek-anda.vercel.app/guard/checkin`) dengan hanya menukar tetapan URL di dalam aplikasi!
