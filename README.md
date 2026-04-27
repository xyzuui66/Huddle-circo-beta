# 🎉 Huddle - Platform Sosial All-in-One

**Huddle** adalah platform sosial modern untuk chat, komunitas, berbagi cerita, dan banyak lagi! 100% open source, gratis, dan siap untuk di-deploy.

## ✨ Fitur Utama

### 💬 Chat & Messaging
- **Global Chat** - Public chat room untuk semua pengguna
- **Direct Messages** - Chat pribadi 1-on-1
- **Group Chat** - Chat dalam grup dengan admin & moderator
- **Voice Messages** - Kirim pesan suara
- **Media Sharing** - Kirim foto, video, dan file
- **Sticker Support** - Kirim dan buat stiker custom
- **Read Receipts** - Status baca pesan
- **Online Status** - Lihat siapa yang online

### 🏘️ Komunitas & Grup
- **Communities** - Buat & kelola komunitas
- **Groups** - Grup chat publik/private
- **Invite System** - Generate link & QR code undangan
- **Member Management** - Kelola anggota dengan roles

### 📸 Konten & Cerita
- **Stories** - Upload cerita 24 jam (hilang otomatis)
- **Feeds/Posts** - Buat postingan dengan media
- **Like & Comment** - Interaksi dengan postingan
- **Channels** - Broadcast channel seperti WhatsApp

### 📞 Voice & Video
- **Voice Calls** - Panggilan suara 1-on-1 & group (Daily.co)
- **Video Calls** - Panggilan video HD (Daily.co)
- **Screen Sharing** - Bagikan layar saat call
- **Voice Rooms** - Ruang chat suara publik

### ⚙️ Pengaturan
- **Dark Mode** - Light/Dark/System theme
- **Multi-Language** - Indonesia/English + System Language
- **Notifications** - Push notification toggle
- **Privacy** - Kami tidak simpan data sensitif
- **Cache Management** - Clear cache dengan mudah

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ dan npm/yarn
- Akun Supabase (gratis di https://supabase.com)
- Daily.co API Key (gratis di https://daily.co)

### 1. Clone Repository
```bash
git clone <repo-url>
cd huddle
```

### 2. Install Dependencies
```bash
npm install
# atau
yarn install
```

### 3. Setup Environment
```bash
cp .env.example .env.local
```

Edit `.env.local` dan isi:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DAILY_API_KEY=your-daily-api-key
NEXT_PUBLIC_SUPPORT_EMAIL=your-email@gmail.com
```

### 4. Setup Supabase Database

Sudah ada SQL script untuk setup? Buka SQL Editor di Supabase dan jalankan script di `SUPABASE_SETUP.sql`

### 5. Run Development
```bash
npm run dev
```

Buka http://localhost:3000

## 📝 Panduan Setup Supabase

### 1. Create Project
1. Buka https://supabase.com
2. Klik "New Project"
3. Isi nama: "Huddle"
4. Pilih region: "Southeast Asia (Singapore)"
5. Setup database password
6. Klik "Create new project" (tunggu 2 menit)

### 2. Create Tables
Buka **SQL Editor** → **New query** → Copy paste script SQL di bawah:

[SQL Script sudah di-generate, tinggal run di Supabase]

### 3. Create Storage Buckets
Buka **Storage** → **New bucket**:
- `avatars` (public, 2MB)
- `media` (public, 50MB)
- `voice-messages` (public, 5MB)
- `stories` (public, 10MB)

### 4. Get API Keys
Buka **Settings** → **API**:
- Copy **Project URL**
- Copy **anon public** key

## 🎥 Setup Daily.co untuk Video Call

### 1. Create Account
1. Buka https://daily.co
2. Sign up (gratis!)
3. Go to **Dashboard**

### 2. Get API Key
- Klik **Developers** → **API Keys**
- Copy API key
- Paste di `.env.local` sebagai `DAILY_API_KEY`

### 3. Test
- Buka aplikasi
- Pergi ke **Global Chat**
- Klik tombol **Voice Room**
- Seharusnya bisa voice call! 🎤

## 🌐 Deploy ke Vercel

### 1. Push ke GitHub
```bash
git add .
git commit -m "Initial commit: Huddle platform"
git push origin main
```

### 2. Connect ke Vercel
1. Buka https://vercel.com
2. Klik "New Project"
3. Pilih repository Huddle
4. Klik "Deploy"

### 3. Add Environment Variables
Di **Settings** → **Environment Variables**, tambahkan:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
DAILY_API_KEY
NEXT_PUBLIC_SUPPORT_EMAIL
```

### 4. Deploy!
Vercel otomatis deploy, tinggal tunggu selesai! 🎉

## 📁 Project Structure

```
huddle/
├── src/
│   ├── app/              # Next.js 14 pages
│   ├── components/       # React components
│   ├── lib/              # Utilities & libraries
│   ├── types/            # TypeScript types
│   ├── contexts/         # Context & state management
│   ├── hooks/            # Custom hooks
│   ├── i18n/             # Translations
│   └── utils/            # Helper functions
├── public/               # Static files
├── .env.local           # Environment variables
├── next.config.ts       # Next.js config
├── tailwind.config.ts   # Tailwind CSS config
└── tsconfig.json        # TypeScript config
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Video Calls**: Daily.co
- **State**: Zustand
- **Translations**: i18n (Manual)
- **UI Components**: Custom + Lucide Icons
- **Notifications**: React Hot Toast

## 🔐 Privacy & Security

- ✅ **NO data collection** dari pengguna yang sensitif
- ✅ **All encrypted** komunikasi lewat HTTPS
- ✅ **Open source** - cek kode kapan saja
- ✅ **Self-hostable** - bisa host sendiri
- ✅ **MIT License** - gunakan untuk apapun

## 📧 Support

Ada pertanyaan? Hubungi: **fluxtecheng@gmail.com**

## 📄 License

MIT License - Gunakan, modifikasi, dan jual sesuai keinginan!

## 🎯 Roadmap

- [ ] Direct Messages yang lebih baik
- [ ] Story viewers & reactions
- [ ] Sticker pack sharing
- [ ] Search messages history
- [ ] User verification badges
- [ ] Crypto payments (optional)
- [ ] Mobile app (React Native)
- [ ] Video call recordings (Daily.co)
- [ ] Custom themes & colors
- [ ] Moderation dashboard

## ❤️ Credits

Made with ❤️ for the community. 

**Open source, forever free!**

---

**Huddle v1.0.0** | Open Source MIT License
