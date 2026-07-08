import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import fs from "fs";
import QRCode from "qrcode";
import { createServer as createViteServer } from "vite";

// Define Database File
const DB_FILE = path.join(process.cwd(), "db.json");

// Helper function to read/write DB
function readRawDB(): string {
  if (!fs.existsSync(DB_FILE)) {
    const initialDB = {
      settings: {
        masjid_name: "Masjid Al-Barkah Manggarai",
        is_dark_mode: false,
        tahun_qurban: "1447 H / 2026 M",
        harga_patungan_sapi: 3500000,
        address: "Jl. Lapangan Roos No. 23, Tebet, Jakarta Selatan",
        logo_url: "",
        whatsapp_api_active: true
      },
      users: [
        { id: "usr-01", email: "panitia1@qurban.id", name: "Ustadz Ahmad Fauzi", role: "Ketua Panitia", access: "keteu" },
        { id: "usr-02", email: "panitia2@qurban.id", name: "Bambang Triyono", role: "Panitia", access: "staff" },
        { id: "usr-03", email: "panitia3@qurban.id", name: "Staff Panitia Qurban", role: "Panitia", access: "staff" },
        { id: "usr-04", email: "panitia4@qurban.id", name: "Rian Hidayat", role: "Panitia", access: "staff" },
        { id: "usr-05", email: "panitia5@qurban.id", name: "Joko Susilo", role: "Panitia", access: "staff" },
        { id: "usr-06", email: "panitia6@qurban.id", name: "Budi Santoso", role: "Panitia", access: "staff" },
        { id: "usr-07", email: "mudhohi@qurban.id", name: "Pak H. Budi Santoso", role: "Mudhohi", access: "read-only" }
      ],
      panitia: [
        { id: "pan-01", name: "Ustadz Ahmad Fauzi", jabatan: "Ketua Panitia", phone: "081234567801", absensi: { total_hadir: 12, status_hari_ini: "Hadir" } },
        { id: "pan-02", name: "Bambang Triyono", jabatan: "Sekretaris", phone: "081234567802", absensi: { total_hadir: 11, status_hari_ini: "Hadir" } },
        { id: "pan-03", name: "Staff Panitia Qurban", jabatan: "Bendahara & Keuangan", phone: "081234567803", absensi: { total_hadir: 12, status_hari_ini: "Hadir" } },
        { id: "pan-04", name: "Rian Hidayat", jabatan: "Divisi Perlengkapan & Logistik", phone: "081234567804", absensi: { total_hadir: 9, status_hari_ini: "Hadir" } },
        { id: "pan-05", name: "Joko Susilo", jabatan: "Divisi Jagal & Distribusi", phone: "081234567805", absensi: { total_hadir: 10, status_hari_ini: "Izin" } },
        { id: "pan-06", name: "Budi Santoso", jabatan: "Divisi Keamanan", phone: "081234567806", absensi: { total_hadir: 8, status_hari_ini: "Hadir" } }
      ],
      mudhohi: [
        { id: "mdh-01", name: "H. Budi Santoso", phone: "08111222333", email: "budi.santoso@gmail.com", type_hewan: "Sapi (Patungan)", detail_qurban: "Patungan Sapi Kelompok A (Baitullah)", nominal_patungan: 3500000, total_pembayaran: 3500000, payment_status: "Lunas", approved: true, image_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", date: "2026-05-10" },
        { id: "mdh-02", name: "Hj. Ratna Sari", phone: "08122334455", email: "ratnasari@yahoo.co.id", type_hewan: "Sapi (Patungan)", detail_qurban: "Patungan Sapi Kelompok A (Baitullah)", nominal_patungan: 3500000, total_pembayaran: 3500000, payment_status: "Lunas", approved: true, image_url: "", date: "2026-05-11" },
        { id: "mdh-03", name: "Dr. Irfan Hakim", phone: "08133445566", email: "irfan.hakim@outlook.com", type_hewan: "Kambing", detail_qurban: "Kambing Super Tipe A", nominal_patungan: 3200000, total_pembayaran: 3200000, payment_status: "Lunas", approved: true, image_url: "", date: "2026-05-12" },
        { id: "mdh-04", name: "Ibu Megawati", phone: "08139999000", email: "mega_sukarno@gmail.com", type_hewan: "Kambing", detail_qurban: "Kambing Al-Ardh (Premium)", nominal_patungan: 3800000, total_pembayaran: 3800000, payment_status: "Lunas", approved: true, image_url: "", date: "2026-05-14" },
        { id: "mdh-05", name: "Pak Ridwan Kamil", phone: "08125555432", email: "ridwan.kamil@jabar.go.id", type_hewan: "Sapi (Patungan)", detail_qurban: "Patungan Sapi Kelompok A (Baitullah)", nominal_patungan: 3500000, total_pembayaran: 1000000, payment_status: "Belum Lunas", approved: true, image_url: "", date: "2026-05-15" },
        { id: "mdh-06", name: "Pak Anies Baswedan", phone: "08119876543", email: "anies.baswedan@dki.id", type_hewan: "Sapi (Patungan)", detail_qurban: "Patungan Sapi Kelompok A (Baitullah)", nominal_patungan: 3500000, total_pembayaran: 3500000, payment_status: "Lunas", approved: true, image_url: "", date: "2026-05-16" },
        { id: "mdh-07", name: "Ibu Khofifah", phone: "08129876543", email: "khofifah@jatim.id", type_hewan: "Kambing", detail_qurban: "Kambing Sedang Tipe B", nominal_patungan: 2500000, total_pembayaran: 2500000, payment_status: "Lunas", approved: true, image_url: "", date: "2026-05-18" },
        { id: "mdh-08", name: "Pak Prabowo Subianto", phone: "08112233445", email: "prabowo.subianto@id.com", type_hewan: "Sapi (Mandiri)", detail_qurban: "Sapi Limosin Super Jumbo (Mandiri)", nominal_patungan: 45000000, total_pembayaran: 45000000, payment_status: "Lunas", approved: true, image_url: "", date: "2026-05-20" },
        { id: "mdh-09", name: "Gibran Rakabuming", phone: "08123344211", email: "gibran.solo@gmail.com", type_hewan: "Sapi (Patungan)", detail_qurban: "Patungan Sapi Kelompok A (Baitullah)", nominal_patungan: 3500000, total_pembayaran: 3500000, payment_status: "Lunas", approved: true, image_url: "", date: "2026-05-21" },
        { id: "mdh-10", name: "Mahfud MD", phone: "08234455122", email: "mahfud.md@polhukam.id", type_hewan: "Sapi (Patungan)", detail_qurban: "Patungan Sapi Kelompok A (Baitullah)", nominal_patungan: 3500000, total_pembayaran: 3500000, payment_status: "Lunas", approved: true, image_url: "", date: "2026-05-22" }
      ],
      hewan_qurban: [
        { id: "hwn-01", type: "Sapi", code: "SAPI-01", weight: 480, price: 24500000, status: "Selesai", group_id: "kel-01", assignees: ["mdh-01", "mdh-02", "mdh-05", "mdh-06", "mdh-09", "mdh-10", "mdh-11"] },
        { id: "hwn-02", type: "Sapi", code: "SAPI-02", weight: 512, price: 29800000, status: "Dikuliti", group_id: "kel-02", assignees: [] },
        { id: "hwn-03", type: "Sapi", code: "SAPI-03", weight: 890, price: 45000000, status: "Disembelih", group_id: "kel-none", assignees: ["mdh-08"] },
        { id: "hwn-04", type: "Kambing", code: "KAMB-01", weight: 42, price: 3500000, status: "Dibagikan", group_id: "kel-none", assignees: ["mdh-03"] },
        { id: "hwn-05", type: "Kambing", code: "KAMB-02", weight: 48, price: 3800000, status: "Menunggu", group_id: "kel-none", assignees: ["mdh-04"] },
        { id: "hwn-06", type: "Kambing", code: "KAMB-03", weight: 32, price: 2500000, status: "Menunggu", group_id: "kel-none", assignees: ["mdh-07"] }
      ],
      kelompok_qurban: [
        { id: "kel-01", name: "Kelompok A (Baitullah)", type: "Sapi", max_murtad: 7, members_count: 6, max_quota: 7, list_members: ["mdh-01", "mdh-02", "mdh-05", "mdh-06", "mdh-09", "mdh-10"] },
        { id: "kel-02", name: "Kelompok B (Madinah)", type: "Sapi", max_murtad: 7, members_count: 0, max_quota: 7, list_members: [] }
      ],
      mustahiq: [
        { id: "mst-01", name: "Ibu Sumiati", category: "Miskin", address: "Manggarai Utara Gang III, RT 02/RW 01", session_id: "ses-01", claim_status: "Belum Diklaim", code: "KP-01", qr_code_url: "", claim_date: null },
        { id: "mst-02", name: "Pak Jajang", category: "Fakir", address: "Manggarai Selatan RT 05/RW 12", session_id: "ses-01", claim_status: "Sudah Diklaim", code: "KP-02", qr_code_url: "", claim_date: "2026-05-26T08:30:10Z" },
        { id: "mst-03", name: "Pak Udin", category: "Miskin", address: "Bukit Duri Barat Gang IV, RT 09/RW 04", session_id: "ses-02", claim_status: "Sudah Diklaim", code: "KP-03", qr_code_url: "", claim_date: "2026-05-26T10:15:22Z" },
        { id: "mst-04", name: "Ibu Tarmini", category: "Yatim/Piatu", address: "Kampung Melayu Kecil RT 04/RW 03", session_id: "ses-02", claim_status: "Belum Diklaim", code: "KP-04", qr_code_url: "", claim_date: null },
        { id: "mst-05", name: "Ustadz Rustam", category: "Fii Sabilillah", address: "Jl. Lapangan Roos No. 10", session_id: "ses-02", claim_status: "Belum Diklaim", code: "KP-05", qr_code_url: "", claim_date: null }
      ],
      sesi_distribusi: [
        { id: "ses-01", name: "Sesi Pagi (08:00 - 10:00)", max_quota: 150, current_claims: 82 },
        { id: "ses-02", name: "Sesi Siang (10:30 - 12:30)", max_quota: 200, current_claims: 41 },
        { id: "ses-03", name: "Sesi Sore (13:30 - 15:30)", max_quota: 100, current_claims: 0 }
      ],
      pembayaran: [
        { id: "pby-01", mudhohi_id: "mdh-01", amount: 3500000, date: "2026-05-10T09:15:00Z", status: "Terverifikasi", method: "Transfer Bank BCA", desc: "Sapi Patungan Budi Santoso" },
        { id: "pby-02", mudhohi_id: "mdh-02", amount: 3500000, date: "2026-05-11T13:40:00Z", status: "Terverifikasi", method: "Transfer Bank Mandiri", desc: "Sapi Patungan Ratna Sari" },
        { id: "pby-03", mudhohi_id: "mdh-05", amount: 1000000, date: "2026-05-15T11:20:00Z", status: "Terverifikasi", method: "Cash via Bendahara", desc: "DP Patungan Ridwan Kamil" },
        { id: "pby-04", mudhohi_id: "mdh-08", amount: 45000000, date: "2026-05-20T10:00:00Z", status: "Terverifikasi", method: "Transfer Bank BNI", desc: "Sapi Mandiri Prabowo" }
      ],
      laporan_keuangan: [
        { id: "keu-01", type: "Pemasukan", category: "Sapi Patungan", desc: "Penerimaan Mudhohi Budi Santoso", amount: 3500000, date: "2026-05-10" },
        { id: "keu-02", type: "Pemasukan", category: "Sapi Patungan", desc: "Penerimaan Mudhohi Ratna Sari", amount: 3500000, date: "2026-05-11" },
        { id: "keu-03", type: "Pemasukan", category: "Kambing", desc: "Penerimaan Mudhohi Dr. Irfan Hakim", amount: 3200000, date: "2026-05-12" },
        { id: "keu-04", type: "Pemasukan", category: "Kambing", desc: "Penerimaan Mudhohi Ibu Megawati", amount: 3800000, date: "2026-05-14" },
        { id: "keu-05", type: "Pemasukan", category: "Sapi Patungan", desc: "Penerimaan DP Ridwan Kamil", amount: 1000000, date: "2026-05-15" },
        { id: "keu-06", type: "Pemasukan", category: "Sapi Patungan", desc: "Penerimaan Mudhohi Anies Baswedan", amount: 3500000, date: "2026-05-16" },
        { id: "keu-07", type: "Pemasukan", category: "Kambing", desc: "Penerimaan Mudhohi Ibu Khofifah", amount: 2500000, date: "2026-05-18" },
        { id: "keu-08", type: "Pemasukan", category: "Sapi Mandiri", desc: "Penerimaan Sapi Mandiri Prabowo Subianto", amount: 45000000, date: "2026-05-20" },
        { id: "keu-09", type: "Pengeluaran", category: "Pembelian Hewan", desc: "Pembelian Sapi Limosin SP-01 (Lunas)", amount: 23500000, date: "2026-05-12" },
        { id: "keu-10", type: "Pengeluaran", category: "Operasional", desc: "Buku Pembelian Tali, Terpal, & Bambu", amount: 1200000, date: "2026-05-14" },
        { id: "keu-11", type: "Pengeluaran", category: "Operasional", desc: "Buku Konsumsi & Snack Panitia Rapat", amount: 850000, date: "2026-05-16" },
        { id: "keu-12", type: "Pengeluaran", category: "Pembelian Hewan", desc: "Pembelian Kambing KB-01 & KB-02", amount: 5500000, date: "2026-05-18" }
      ],
      notifikasi: [
        { id: "ntf-01", mdn_id: "mdh-01", phone: "08111222333", message: "Yth. Budi Santoso, terima kasih pembayaran Qurban Anda Sapi Patungan sebesar Rp 3.500.000 dinyatakan LUNAS. - Masjid Al-Barkah Manggarai", status: "Sent", timestamp: "2026-05-10T09:20:00Z" },
        { id: "ntf-02", mdn_id: "mdh-05", phone: "08125555432", message: "Yth. Ridwan Kamil, pengingat DP Qurban Anda sebesar Rp 1.000.000 telah kami terima. Harap melunasi patungan sisa Rp 2.500.000 sebelum H-3. Syukron. - Masjid Al-Barkah Manggarai", status: "Sent", timestamp: "2026-05-15T11:25:00Z" }
      ]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), "utf8");
  }
  return fs.readFileSync(DB_FILE, "utf8");
}

function writeRawDB(dataString: string) {
  fs.writeFileSync(DB_FILE, dataString, "utf8");
}

interface ApplicationDB {
  settings: any;
  users: any[];
  panitia: any[];
  mudhohi: any[];
  hewan_qurban: any[];
  kelompok_qurban: any[];
  mustahiq: any[];
  sesi_distribusi: any[];
  pembayaran: any[];
  laporan_keuangan: any[];
  notifikasi: any[];
  activities?: any[];
}

function getDB(): ApplicationDB {
  const raw = readRawDB();
  const db = JSON.parse(raw);
  if (!db.activities) {
    db.activities = [
      { id: "act-1", title: "Sistem Terhubung", desc: "Aplikasi digitalisasi qurban Masjid Al-Barkah berhasil dihubungkan.", timestamp: new Date(Date.now() - 5000).toISOString(), type: "system" },
      { id: "act-2", title: "Pendaftaran Mudhohi Baru", desc: "Sdr. Mahfud MD mendaftar untuk Sapi Patungan Kelompok A", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), type: "mudhohi" },
      { id: "act-3", title: "Update Status Sembelih", desc: "Sapi SAPI-01 telah selesai dipotong, dilanjutkan ke penimbangan daging", timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), type: "animal" },
      { id: "act-4", title: "Pembayaran Qurban Lunas", desc: "Ibu Hj. Ratna Sari telah melunasi pembayaran via Bank Mandiri", timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), type: "payment" },
      { id: "act-5", title: "Distribusi Kupon", desc: "Warga RT 05/RW 12 Bapak Jajang menukarkan kupon qurban Sesi Pagi", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), type: "distribution" }
    ];
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
  }
  return db;
}

function updateDB(db: ApplicationDB) {
  writeRawDB(JSON.stringify(db, null, 2));
}

function getRelativeTime(timestampStr: string): string {
  try {
    const now = new Date();
    const then = new Date(timestampStr);
    const diffMs = now.getTime() - then.getTime();
    if (isNaN(diffMs)) return "Baru saja";
    const diffMins = Math.max(0, Math.floor(diffMs / (60 * 1000)));
    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} hari yang lalu`;
  } catch (err) {
    return "Baru saja";
  }
}

function logActivity(db: ApplicationDB, title: string, desc: string, type: "mudhohi" | "animal" | "payment" | "distribution" | "system" | "panitia") {
  if (!db.activities) {
    db.activities = [];
  }
  const newActivity = {
    id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title,
    desc,
    timestamp: new Date().toISOString(),
    type
  };
  db.activities.unshift(newActivity);
  if (db.activities.length > 50) {
    db.activities = db.activities.slice(0, 50);
  }
}

// Generate an id utility
const genId = (prefix: string) => `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

// Send WhatsApp via Fonnte integration if configured
async function sendWhatsApp(phone: string, message: string): Promise<{ success: boolean; detail?: string }> {
  if (!phone || typeof phone !== "string" || !phone.trim()) {
    console.log(`[WA SENDER WARNING] Phone number is empty or invalid. Msg: "${message}"`);
    return { success: false, detail: "Nomor telepon kosong" };
  }

  const token = process.env.FONNTE_TOKEN;
  if (!token) {
    console.log(`[WA MOCK SENDER] To: ${phone} | Msg: "${message}" (FONNTE_TOKEN not set in environment)`);
    return { success: true, detail: "mock" };
  }

  try {
    // Normalize Indonesian phone number format
    let cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    }

    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        "Authorization": token,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        target: cleanPhone,
        message: message
      })
    });

    const data = await response.json() as any;
    if (response.ok && (data.status === true || data.status === "true")) {
      console.log(`[WA FONNTE SUCCESS] Sent successfully to ${cleanPhone}. Message ID: ${data.id || "unknown"}`);
      return { success: true, detail: String(data.id || "ok") };
    } else {
      console.error(`[WA FONNTE ERROR] Failed to send to ${cleanPhone}:`, data);
      return { success: false, detail: data.reason || "Fonnte rejected request" };
    }
  } catch (error: any) {
    console.error("[WA FONNTE CRASH] Fetch exception:", error.message || error);
    return { success: false, detail: error.message || "Network error" };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ extended: true, limit: "20mb" }));

  // Helper auth check endpoint
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    
    // Strict block of admin login as per instruction to only keep panitia
    if (email === "admin@qurban.id") {
      return res.status(401).json({ success: false, message: "Akses login Admin dinonaktifkan. Gunakan akun Panitia." });
    }

    const db = getDB();
    const user = db.users.find((u) => u.email === email);

    // Dynamic simple bypass for realistic Indonesian experience
    if (user && password) {
      logActivity(db, "Login Terdeteksi", `Panitia ${user.name} (${user.role}) masuk ke sistem.`, "system");
      updateDB(db);
      // successful simulation of token & user info
      return res.json({
        success: true,
        token: `mock-jwt-token-for-${user.id}-${Date.now()}`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          access: user.access,
        },
      });
    }

    return res.status(401).json({ success: false, message: "Email atau Password panitia salah." });
  });

  app.post("/api/auth/forgot-password", (req, res) => {
    const { email } = req.body;
    return res.json({ success: true, message: `Instruksi pengaturan ulang sandi telah dikirim ke WhatsApp / email ${email}` });
  });

  // Settings
  app.get("/api/settings", (req, res) => {
    const db = getDB();
    res.json(db.settings);
  });

  app.put("/api/settings", (req, res) => {
    const db = getDB();
    db.settings = { ...db.settings, ...req.body };
    updateDB(db);
    res.json({ success: true, settings: db.settings });
  });

  // Dashboard Stats Endpoint
  app.get("/api/stats", (req, res) => {
    const db = getDB();
    const totalMudhohi = db.mudhohi.length;
    
    // Sum numbers
    let totalSapi = db.hewan_qurban.filter(h => h.type === "Sapi").length;
    let totalKambing = db.hewan_qurban.filter(h => h.type === "Kambing").length;
    
    const totalMustahiq = db.mustahiq.length;
    const claimedMustahiq = db.mustahiq.filter(m => m.claim_status === "Sudah Diklaim").length;
    const progressDistribusi = totalMustahiq > 0 ? Math.round((claimedMustahiq / totalMustahiq) * 100) : 0;

    const totalPemasukan = db.laporan_keuangan
      .filter(l => l.type === "Pemasukan")
      .reduce((sum, item) => sum + item.amount, 0);

    const totalPengeluaran = db.laporan_keuangan
      .filter(l => l.type === "Pengeluaran")
      .reduce((sum, item) => sum + item.amount, 0);

    const saldoSisa = totalPemasukan - totalPengeluaran;

    // Latest Activities
    const rawActs = (db.activities || []).slice(0, 8);
    const recentActivities = rawActs.map((act: any) => ({
      id: act.id,
      title: act.title,
      desc: act.desc,
      time: getRelativeTime(act.timestamp),
      type: act.type
    }));

    // Status calculations
    const hewanStatusCounts = {
      Menunggu: db.hewan_qurban.filter(h => h.status === "Menunggu").length,
      Disembelih: db.hewan_qurban.filter(h => h.status === "Disembelih").length,
      Dikuliti: db.hewan_qurban.filter(h => h.status === "Dikuliti").length,
      Dibagikan: db.hewan_qurban.filter(h => h.status === "Dibagikan").length,
      Selesai: db.hewan_qurban.filter(h => h.status === "Selesai").length,
    };

    res.json({
      totalMudhohi,
      totalSapi,
      totalKambing,
      totalMustahiq,
      claimedMustahiq,
      progressDistribusi,
      totalPemasukan,
      totalPengeluaran,
      saldoSisa,
      recentActivities,
      hewanStatusCounts,
    });
  });

  // CRUD Mudhohi
  app.get("/api/mudhohi", (req, res) => {
    const db = getDB();
    const { search, payment_status } = req.query;
    let list = [...db.mudhohi];
    
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q) || m.phone.includes(q) || (m.email && m.email.toLowerCase().includes(q)));
    }
    if (payment_status) {
      list = list.filter(m => m.payment_status === payment_status);
    }
    res.json(list);
  });

  app.post("/api/mudhohi", async (req, res) => {
    const db = getDB();
    const { name, phone, email, type_hewan, detail_qurban, nominal_patungan, total_pembayaran, image_url, breed, description } = req.body;
    
    const newMudhohi = {
      id: genId("mdh"),
      name: name || "Mudhohi Baru",
      phone: phone || "0812345678",
      email: email || "",
      type_hewan: type_hewan || "Kambing",
      detail_qurban: detail_qurban || "Qurban Idul Adha",
      nominal_patungan: Number(nominal_patungan) || 3505000,
      total_pembayaran: Number(total_pembayaran) || 0,
      payment_status: Number(total_pembayaran) >= Number(nominal_patungan) ? "Lunas" : "Belum Lunas",
      approved: true,
      image_url: image_url || "",
      date: new Date().toISOString().split("T")[0]
    };

    db.mudhohi.unshift(newMudhohi);

    // Auto trigger kelompok qurban mapping for "Sapi (Patungan)"
    if (newMudhohi.type_hewan === "Sapi (Patungan)") {
      let assigned = false;
      // Search for open kelompok
      for (const kel of db.kelompok_qurban) {
        if (kel.list_members.length < kel.max_quota) {
          kel.list_members.push(newMudhohi.id);
          kel.members_count = kel.list_members.length;
          assigned = true;
          break;
        }
      }
      // If none open, create a new cow group
      if (!assigned) {
        const newKelId = genId("kel");
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const groupLetter = alphabet[db.kelompok_qurban.length] || `${db.kelompok_qurban.length + 1}`;
        const newGroup = {
          id: newKelId,
          name: `Kelompok ${groupLetter} (${detail_qurban || "Kolektif"})`,
          type: "Sapi",
          max_quota: 7,
          members_count: 1,
          list_members: [newMudhohi.id]
        };
        db.kelompok_qurban.push(newGroup);
        
        // Also add a corresponding Sapi to our hewan_qurban list assigned to the group
        const newHewanId = genId("hwn");
        db.hewan_qurban.push({
          id: newHewanId,
          type: "Sapi",
          code: `SAPI-0${db.hewan_qurban.filter(v => v.type === "Sapi").length + 1}`,
          weight: 400,
          price: 24500000,
          status: "Menunggu",
          group_id: newKelId,
          assignees: [newMudhohi.id],
          breed: breed || "Sapi Bali Premium",
          description: description || "Sapi Bali pilihan panitia. Daging melimpah tinggi karkas, higienis, dan teruji sehat sesuai syariat."
        });
      } else {
        // Find group and append assignee to its animal listing
        const matchingGroupIndex = db.kelompok_qurban.findIndex(k => k.list_members.includes(newMudhohi.id));
        if (matchingGroupIndex !== -1) {
          const matchingGroup = db.kelompok_qurban[matchingGroupIndex];
          const matchedAnimal = db.hewan_qurban.find(h => h.group_id === matchingGroup.id);
          if (matchedAnimal) {
            if (!matchedAnimal.assignees.includes(newMudhohi.id)) {
              matchedAnimal.assignees.push(newMudhohi.id);
            }
            if (breed) matchedAnimal.breed = breed;
            if (description) matchedAnimal.description = description;
          }
        }
      }
    } else {
      // It is "Kambing" or "Sapi (Mandiri)" -> Add direct linked animal item!
      const parentType = newMudhohi.type_hewan === "Kambing" ? "Kambing" : "Sapi";
      const countForType = db.hewan_qurban.filter(v => v.type === parentType).length + 1;
      const animalCode = parentType === "Kambing" ? `KAMB-0${countForType}` : `SAPI-0${countForType}`;
      
      db.hewan_qurban.push({
        id: genId("hwn"),
        type: parentType,
        code: animalCode,
        weight: parentType === "Kambing" ? 42 : 450,
        price: Number(nominal_patungan) || (parentType === "Kambing" ? 3200000 : 24500000),
        status: "Menunggu",
        group_id: "kel-none",
        assignees: [newMudhohi.id],
        breed: breed || (parentType === "Kambing" ? "Kambing Kacang / Jawa" : "Sapi Jawa Peranakan Ongole"),
        description: description || (parentType === "Kambing" ? "Kambing jantan lincah, gemuk sekel, nafsu makan baik, gigi taring sudah ganti kupak, sah qurban." : "Sapi PO putih pilihan, postur prima berpunuk gagah, terawat saksama.")
      });
    }

    // Append to Keuangan logs if any initial payment made
    if (newMudhohi.total_pembayaran > 0) {
      db.pembayaran.push({
        id: genId("pby"),
        mudhohi_id: newMudhohi.id,
        amount: newMudhohi.total_pembayaran,
        date: new Date().toISOString(),
        status: "Terverifikasi",
        method: "Cash via Bendahara",
        desc: `Pembayaran Qurban ${newMudhohi.name}`
      });

      db.laporan_keuangan.push({
        id: genId("keu"),
        type: "Pemasukan",
        category: newMudhohi.type_hewan,
        desc: `Funder Mudhohi ${newMudhohi.name} (${newMudhohi.type_hewan})`,
        amount: newMudhohi.total_pembayaran,
        date: new Date().toISOString().split("T")[0]
      });
    }

    // Auto trigger push Notification WhatsApp simulate
    const waMessage = `Yth. ${newMudhohi.name}, pendaftaran qurban (${newMudhohi.type_hewan}) Anda berhasil. Status Pembayaran: ${newMudhohi.payment_status} (Semoga Allah SWT menerima amal ibadah qurban Anda). - Masjid Al-Barkah Manggarai`;
    const { success, detail } = await sendWhatsApp(newMudhohi.phone, waMessage);

    db.notifikasi.unshift({
      id: genId("ntf"),
      mdn_id: newMudhohi.id,
      phone: newMudhohi.phone,
      message: waMessage,
      status: success ? "Sent" : "Failed",
      detail: detail,
      timestamp: new Date().toISOString()
    });

    logActivity(db, "Pendaftaran Mudhohi Baru", `Jemaah ${newMudhohi.name} (${newMudhohi.type_hewan}) berhasil didaftarkan.`, "mudhohi");
    if (newMudhohi.total_pembayaran > 0) {
      logActivity(db, "Pembayaran Qurban Masuk", `Terima dana qurban jemaah ${newMudhohi.name} sebesar Rp ${newMudhohi.total_pembayaran.toLocaleString('id-ID')}.`, "payment");
    }

    updateDB(db);
    res.json({ success: true, mudhohi: newMudhohi });
  });

  app.put("/api/mudhohi/:id", async (req, res) => {
    const db = getDB();
    const index = db.mudhohi.findIndex(m => m.id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: "Mudhohi tidak ditemukan" });
    
    const prevPayment = db.mudhohi[index].total_pembayaran;
    db.mudhohi[index] = { ...db.mudhohi[index], ...req.body };
    
    // Check if payment changed
    const currPayment = db.mudhohi[index].total_pembayaran;
    const nominal = db.mudhohi[index].nominal_patungan;
    db.mudhohi[index].payment_status = currPayment >= nominal ? "Lunas" : "Belum Lunas";

    if (currPayment > prevPayment) {
      const added = currPayment - prevPayment;
      db.pembayaran.push({
        id: genId("pby"),
        mudhohi_id: req.params.id,
        amount: added,
        date: new Date().toISOString(),
        status: "Terverifikasi",
        method: "Update Saldo via Admin",
        desc: `Penerimaan Pembayaran ${db.mudhohi[index].name}`
      });

      db.laporan_keuangan.push({
        id: genId("keu"),
        type: "Pemasukan",
        category: db.mudhohi[index].type_hewan,
        desc: `Penerimaan Tambahan Qurban ${db.mudhohi[index].name}`,
        amount: added,
        date: new Date().toISOString().split("T")[0]
      });

      logActivity(db, "Pembayaran Qurban Masuk", `Koran pembayaran tambahan jemaah ${db.mudhohi[index].name} sebesar Rp ${added.toLocaleString('id-ID')} dicatat.`, "payment");

      // WA Notification update
      const updateMsg = `Assalamu'alaikum ${db.mudhohi[index].name}, kami menerima update pembayaran qurban Anda Rp ${added.toLocaleString('id-ID')}. Total terbayar: Rp ${currPayment.toLocaleString('id-ID')}. Status: ${db.mudhohi[index].payment_status}. Syukron.`;
      const { success, detail } = await sendWhatsApp(db.mudhohi[index].phone, updateMsg);

      db.notifikasi.unshift({
        id: genId("ntf"),
        mdn_id: req.params.id,
        phone: db.mudhohi[index].phone,
        message: updateMsg,
        status: success ? "Sent" : "Failed",
        detail: detail,
        timestamp: new Date().toISOString()
      });
    } else {
      logActivity(db, "Update Profil Mudhohi", `Detail profil jemaah ${db.mudhohi[index].name} diperbarui oleh Panitia.`, "mudhohi");
    }

    updateDB(db);
    res.json({ success: true, mudhohi: db.mudhohi[index] });
  });

  app.delete("/api/mudhohi/:id", (req, res) => {
    const db = getDB();
    const cleanId = req.params.id;
    const findMudhohi = db.mudhohi.find(m => m.id === cleanId);
    
    // Remove from groups
    db.kelompok_qurban.forEach(kel => {
      kel.list_members = kel.list_members.filter((m: any) => m !== cleanId);
      kel.members_count = kel.list_members.length;
    });

    // Remove from animal assigned list
    db.hewan_qurban.forEach(hew => {
      hew.assignees = hew.assignees.filter((m: any) => m !== cleanId);
    });

    if (findMudhohi) {
      logActivity(db, "Mudhohi Berhasil Dihapus", `Kontrak qurban jemaah ${findMudhohi.name} dicabut / dihapus dari sistem.`, "mudhohi");
    }

    db.mudhohi = db.mudhohi.filter(m => m.id !== cleanId);
    updateDB(db);
    res.json({ success: true, message: "Mudhohi berhasil dihapus" });
  });

  // CRUD Hewan Qurban
  app.get("/api/hewan", (req, res) => {
    const db = getDB();
    const { search, type, status } = req.query;
    let list = [...db.hewan_qurban];

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(h => h.code.toLowerCase().includes(q) || h.type.toLowerCase().includes(q) || (h.group_id && h.group_id.toLowerCase().includes(q)));
    }
    if (type) {
      list = list.filter(h => h.type === type);
    }
    if (status) {
      list = list.filter(h => h.status === status);
    }
    res.json(list);
  });

  app.post("/api/hewan", (req, res) => {
    const db = getDB();
    const { type, weight, price, status, group_id } = req.body;

    const countExist = db.hewan_qurban.filter(v => v.type === type).length + 1;
    const prefix = type === "Sapi" ? "SAPI" : "KAMB";

    const newHewan = {
      id: genId("hwn"),
      type: type || "Kambing",
      code: `${prefix}-0${countExist}`,
      weight: Number(weight) || 40,
      price: Number(price) || 3000000,
      status: status || "Menunggu",
      group_id: group_id || "kel-none",
      assignees: []
    };

    db.hewan_qurban.push(newHewan);
    
    // Ledger register
    db.laporan_keuangan.push({
      id: genId("keu"),
      type: "Pengeluaran",
      category: "Pembelian Hewan",
      desc: `Pembelian fisik ${newHewan.type} ${newHewan.code}`,
      amount: newHewan.price,
      date: new Date().toISOString().split("T")[0]
    });

    logActivity(db, "Hewan Qurban Baru", `Fisik ${newHewan.type} baru (${newHewan.code}) didaftarkan seharga Rp ${newHewan.price.toLocaleString('id-ID')}.`, "animal");

    updateDB(db);
    res.json({ success: true, hewan: newHewan });
  });

  app.put("/api/hewan/:id", async (req, res) => {
    const db = getDB();
    const idx = db.hewan_qurban.findIndex(h => h.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: "Hewan tidak ditemukan" });

    const beforeStatus = db.hewan_qurban[idx].status;
    db.hewan_qurban[idx] = { ...db.hewan_qurban[idx], ...req.body };
    const afterStatus = db.hewan_qurban[idx].status;

    if (beforeStatus !== afterStatus) {
      logActivity(db, "Status Hewan Diperbarui", `Hewan ${db.hewan_qurban[idx].code} bergeser ke fase *${afterStatus}*.`, "animal");
    } else {
      logActivity(db, "Info Hewan Diperbarui", `Informasi fisik ${db.hewan_qurban[idx].code} diperbarui.`, "animal");
    }

    // Trigger dynamic notifications if animal slaughter status matches transition
    if (beforeStatus !== afterStatus && db.hewan_qurban[idx].assignees.length > 0) {
      for (const memberId of db.hewan_qurban[idx].assignees) {
        const participant = db.mudhohi.find(m => m.id === memberId);
        if (participant) {
          const statusMsg = `Alhamdulillah, hewan qurban Anda (${db.hewan_qurban[idx].code}) berstatus: *${afterStatus.toUpperCase()}*. Semoga berkah. - Masjid Al-Barkah Manggarai`;
          const { success, detail } = await sendWhatsApp(participant.phone, statusMsg);

          db.notifikasi.unshift({
            id: genId("ntf"),
            mdn_id: participant.id,
            phone: participant.phone,
            message: statusMsg,
            status: success ? "Sent" : "Failed",
            detail: detail,
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    updateDB(db);
    res.json({ success: true, hewan: db.hewan_qurban[idx] });
  });

  app.delete("/api/hewan/:id", (req, res) => {
    const db = getDB();
    const findH = db.hewan_qurban.find(h => h.id === req.params.id);
    if (findH) {
      logActivity(db, "Hewan Qurban Dihapus", `Hewan ${findH.code} dihapus dari daftar operasional qurban.`, "animal");
    }
    db.hewan_qurban = db.hewan_qurban.filter(h => h.id !== req.params.id);
    updateDB(db);
    res.json({ success: true, message: "Data hewan qurban berhasil diarsip/dihapus." });
  });

  // Kelompok Qurban Grouping Joint cow
  app.get("/api/kelompok", (req, res) => {
    const db = getDB();
    res.json(db.kelompok_qurban);
  });

  app.post("/api/kelompok", (req, res) => {
    const db = getDB();
    const { name, max_quota } = req.body;
    const newGroup = {
      id: genId("kel"),
      name: name || `Kelompok Patungan Baru`,
      type: "Sapi",
      max_quota: Number(max_quota) || 7,
      members_count: 0,
      list_members: []
    };
    db.kelompok_qurban.push(newGroup);
    updateDB(db);
    res.json({ success: true, kelompok: newGroup });
  });

  // Mustahiq coupon database scanning, status matching
  app.get("/api/mustahiq", (req, res) => {
    const db = getDB();
    const { search, category, claim_status } = req.query;
    let list = [...db.mustahiq];

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q) || m.address.toLowerCase().includes(q) || m.code.toLowerCase().includes(q));
    }
    if (category) {
      list = list.filter(m => m.category === category);
    }
    if (claim_status) {
      list = list.filter(m => m.claim_status === claim_status);
    }
    res.json(list);
  });

  app.post("/api/mustahiq", async (req, res) => {
    const db = getDB();
    const { name, category, address, session_id, phone } = req.body;
    
    const countExist = db.mustahiq.length + 1;
    const newMustahiq = {
      id: genId("mst"),
      name: name || "Penerima Baru",
      category: category || "Fakir & Miskin",
      address: address || "",
      phone: phone || "",
      session_id: session_id || "ses-01",
      claim_status: "Belum Diklaim",
      code: `KP-${countExist < 10 ? '0' + countExist : countExist}`,
      qr_code_url: "",
      claim_date: null
    };

    db.mustahiq.unshift(newMustahiq);

    // Auto-trigger WhatsApp receipt message if phone is provided
    if (phone) {
      const selectedSession = db.sesi_distribusi.find(s => s.id === (session_id || "ses-01"));
      const sessionName = selectedSession ? selectedSession.name : "Jadwal Ditentukan";

      // Dynamically resolve server host and scheme to construct the real coupon URL
      let couponUrl = "";
      if (process.env.APP_URL && process.env.APP_URL !== "MY_APP_URL") {
        const baseUrl = process.env.APP_URL.replace(/\/$/, "");
        couponUrl = `${baseUrl}/print-coupon/${newMustahiq.code}`;
      } else {
        const host = req.get('host') || "localhost:3000";
        const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
        const protocol = isHttps ? 'https' : 'http';
        couponUrl = `${protocol}://${host}/print-coupon/${newMustahiq.code}`;
      }

      const waMessage = `Yth. Ibu/Bapak *${newMustahiq.name}*, pendaftaran sebagai Penerima Qurban (Mustahiq) berhasil.

🎫 *DETAIL KUPON DIGITAL QURBAN*
• Kategori: ${newMustahiq.category}
• Nomor Kupon: *${newMustahiq.code}*
• Sesi Pengambilan: *${sessionName}*

Silakan buka tautan di bawah ini untuk melihat Kupon Digital & QR Code resmi Anda. Anda tidak perlu mencetak fisik kupon ini, cukup tunjukkan halaman ini ke panitia di lokasi saat pembagian daging untuk di-scan:
🔗 *LINK KUPON QR:* ${couponUrl}

*(PENTING: Jangan memberikan link ini kepada orang lain untuk mencegah kupon Anda disalahgunakan atau diclaim ganda).*

Terima kasih.
- Panitia Qurban Masjid Al-Barkah Manggarai`;
      
      const { success, detail } = await sendWhatsApp(phone, waMessage);
      
      db.notifikasi.unshift({
        id: genId("ntf"),
        mdn_id: newMustahiq.id,
        phone: phone,
        message: waMessage,
        status: success ? "Sent" : "Failed",
        detail: detail,
        timestamp: new Date().toISOString()
      });
    }

    logActivity(db, "Mustahiq Baru Mendaftar", `Kupons ${newMustahiq.code} dialokasikan untuk ${newMustahiq.name} (${newMustahiq.category}).`, "distribution");

    updateDB(db);
    res.json({ success: true, mustahiq: newMustahiq });
  });

  // QR Scanning Claim coupon handler (Anti double-claim)
  app.post("/api/mustahiq/claim", (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, message: "Format kupon QR tidak valid." });
    
    const db = getDB();
    const idx = db.mustahiq.findIndex(m => m.code.toUpperCase() === code.toUpperCase() || m.id === code);
    
    if (idx === -1) {
      return res.status(404).json({ success: false, message: "Kupon tidak terdaftar atau tidak ditemukan." });
    }

    const recipient = db.mustahiq[idx];
    if (recipient.claim_status === "Sudah Diklaim") {
      logActivity(db, "🚨 PERINGATAN GANDA", `Deteksi klaim jatah berganda kupon ${recipient.code} oleh ${recipient.name}!`, "distribution");
      updateDB(db);
      return res.status(400).json({ 
        success: false, 
        message: `PERINGATAN! Daging Qurban sudah pernah diambil oleh ${recipient.name} pada ${new Date(recipient.claim_date).toLocaleTimeString('id-ID')} WIB.`,
        double_claim: true,
        mustahiq: recipient
      });
    }

    // Process valid claim
    recipient.claim_status = "Sudah Diklaim";
    recipient.claim_date = new Date().toISOString();

    // Increment corresponding Session Distribution claims status
    const sesIdx = db.sesi_distribusi.findIndex(s => s.id === recipient.session_id);
    if (sesIdx !== -1) {
      db.sesi_distribusi[sesIdx].current_claims += 1;
    }

    logActivity(db, "Penyerahan Paket Qurban", `Paket daging kupon ${recipient.code} sukses diserahkan ke ${recipient.name} (${recipient.category}).`, "distribution");

    updateDB(db);
    return res.json({
      success: true,
      message: `PENGAMBILAN BERHASIL! Kupon ${recipient.code} atas nama ${recipient.name} (${recipient.category}) telah berhasil diverifikasi.`,
      mustahiq: recipient
    });
  });

  app.put("/api/mustahiq/:id", (req, res) => {
    const db = getDB();
    const idx = db.mustahiq.findIndex(m => m.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: "Mustahiq tidak ditemukan" });

    db.mustahiq[idx] = { ...db.mustahiq[idx], ...req.body };
    updateDB(db);
    res.json({ success: true, mustahiq: db.mustahiq[idx] });
  });

  app.delete("/api/mustahiq/:id", (req, res) => {
    const db = getDB();
    const findMst = db.mustahiq.find(m => m.id === req.params.id);
    if (findMst) {
      logActivity(db, "Mustahiq Dihapus", `Kontrak penerimaan kupon ${findMst.code} milik ${findMst.name} dihapus.`, "distribution");
    }
    db.mustahiq = db.mustahiq.filter(m => m.id !== req.params.id);
    updateDB(db);
    res.json({ success: true, message: "Mustahiq berhasil dihapus" });
  });

  // Sessions Distribution list
  app.get("/api/sessions", (req, res) => {
    const db = getDB();
    res.json(db.sesi_distribusi);
  });

  // Panitia CRUD
  app.get("/api/panitia", (req, res) => {
    const db = getDB();
    res.json(db.panitia);
  });

  app.post("/api/panitia", (req, res) => {
    const db = getDB();
    const { name, jabatan, phone } = req.body;
    const newPan = {
      id: genId("pan"),
      name: name || "Staff Baru",
      jabatan: jabatan || "Anggota",
      phone: phone || "0812345000",
      absensi: { total_hadir: 0, status_hari_ini: "Hadir" }
    };
    db.panitia.push(newPan);
    logActivity(db, "Kepanitiaan Baru", `Staff ${newPan.name} (${newPan.jabatan}) berhasil didaftarkan ke sistem.`, "panitia");
    updateDB(db);
    res.json({ success: true, panitia: newPan });
  });

  app.put("/api/panitia/:id", (req, res) => {
    const db = getDB();
    const idx = db.panitia.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: "Panitia tidak ditemukan" });

    db.panitia[idx] = { ...db.panitia[idx], ...req.body };
    logActivity(db, "Pembaruan Panitia", `Data staf ${db.panitia[idx].name} diperbarui oleh operasional.`, "panitia");
    updateDB(db);
    res.json({ success: true, panitia: db.panitia[idx] });
  });

  app.delete("/api/panitia/:id", (req, res) => {
    const db = getDB();
    const findPan = db.panitia.find(p => p.id === req.params.id);
    if (findPan) {
      logActivity(db, "Panitia Dinonaktifkan", `Staf ${findPan.name} (${findPan.jabatan}) dihapus dari daftar operasional.`, "panitia");
    }
    db.panitia = db.panitia.filter(p => p.id !== req.params.id);
    updateDB(db);
    res.json({ success: true, message: "Panitia berhasil dihapus" });
  });

  // Financial Logs Ledger CRUD
  app.get("/api/keuangan", (req, res) => {
    const db = getDB();
    res.json(db.laporan_keuangan);
  });

  app.post("/api/keuangan", (req, res) => {
    const db = getDB();
    const { type, category, desc, amount } = req.body;
    
    const newKeuangan = {
      id: genId("keu"),
      type: type || "Pengeluaran",
      category: category || "Lain-lain",
      desc: desc || "Transaksi Keuangan",
      amount: Number(amount) || 0,
      date: new Date().toISOString().split("T")[0]
    };

    db.laporan_keuangan.push(newKeuangan);
    logActivity(
      db, 
      newKeuangan.type === "Pemasukan" ? "Arus Kas Masuk" : "Arus Kas Keluar", 
      `${newKeuangan.category}: ${newKeuangan.desc} - Rp ${newKeuangan.amount.toLocaleString('id-ID')}`, 
      "payment"
    );
    updateDB(db);
    res.json({ success: true, keuangan: newKeuangan });
  });

  // Notifications Queue List
  app.get("/api/notifications", (req, res) => {
    const db = getDB();
    res.json(db.notifikasi);
  });

  // Manual target trigger WhatsApp API
  app.post("/api/notifications/send", async (req, res) => {
    const { phone, message } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ success: false, message: "Nomor handphone dan isi pesan wajib disertakan." });
    }

    const { success, detail } = await sendWhatsApp(phone, message);

    const db = getDB();
    const newNotif = {
      id: genId("ntf"),
      mdn_id: "manual",
      phone,
      message,
      status: success ? "Sent" : "Failed",
      timestamp: new Date().toISOString()
    };

    db.notifikasi.unshift(newNotif);
    updateDB(db);

    res.json({ success, detail, notification: newNotif });
  });

  // Mock upload endpoint (stores Base64 in db)
  app.post("/api/upload", (req, res) => {
    const { fileBase64, filename } = req.body;
    res.json({
      success: true,
      url: fileBase64 || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"
    });
  });

  // Printable web layout for a specific coupon
  app.get("/print-coupon/:code", async (req, res) => {
    const { code } = req.params;
    const db = getDB();
    const mustahiq = db.mustahiq.find(m => m.code.toUpperCase() === code.toUpperCase() || m.id === code);
    
    if (!mustahiq) {
      return res.status(404).send("<h3 style='font-family:sans-serif; text-align:center; margin-top:50px;'>Kupon tidak ditemukan.</h3>");
    }

    const selectedSession = db.sesi_distribusi.find(s => s.id === mustahiq.session_id);
    const sessionName = selectedSession ? selectedSession.name : "Jadwal Ditentukan";
    const safeName = (mustahiq.name || "Mustahiq").replace(/["']/g, "").replace(/[^a-zA-Z0-9\s-_]/g, "").trim().replace(/\s+/g, "_");

    let qrBase64 = "";
    try {
      qrBase64 = await QRCode.toDataURL(mustahiq.code);
    } catch (err) {
      console.error("Gagal membuat QR coupon:", err);
    }

    res.send(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kupon Qurban - ${mustahiq.name}</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
        <style>
          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
            background-color: #f0fdf4;
            box-sizing: border-box;
          }
          .toolbar {
            width: 100%;
            max-width: 400px;
            background-color: #ffffff;
            border-radius: 16px;
            padding: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            margin-bottom: 24px;
            text-align: center;
            border: 1px solid #e5e7eb;
          }
          .toolbar-title {
            font-size: 14px;
            font-weight: 800;
            color: #065f46;
            margin: 0 0 4px 0;
          }
          .toolbar-desc {
            font-size: 11px;
            color: #6b7280;
            margin: 0 0 16px 0;
            line-height: 1.4;
          }
          .ticket-container {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 10px;
            background: transparent;
            border-radius: 28px;
          }
          .ticket {
            background-color: #ffffff;
            border: 4px dashed #047857;
            border-radius: 24px;
            width: 310px;
            padding: 28px;
            text-align: center;
            box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.1);
            position: relative;
            box-sizing: border-box;
          }
          .header {
            font-size: 11px;
            font-weight: 800;
            color: #047857;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            margin-bottom: 4px;
          }
          .sub-header {
            font-size: 9px;
            color: #059669;
            font-weight: 700;
            border-bottom: 2px solid #f0fdf4;
            padding-bottom: 12px;
            margin-bottom: 18px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .code-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #6b7280;
            font-weight: bold;
          }
          .code {
            font-size: 38px;
            font-weight: 900;
            color: #047857;
            letter-spacing: 1px;
            margin: 5px 0 12px 0;
          }
          .qr-img {
            width: 165px;
            height: 165px;
            border: 2px solid #e5e7eb;
            border-radius: 16px;
            padding: 8px;
            background: white;
            margin: 12px auto;
            display: block;
          }
          .name {
            font-size: 18px;
            font-weight: 800;
            color: #111827;
            margin: 12px 0 6px 0;
            text-transform: capitalize;
          }
          .meta {
            font-size: 12px;
            color: #4b5563;
            margin-bottom: 18px;
            font-weight: 600;
            background: #f3f4f6;
            padding: 5px 12px;
            border-radius: 8px;
            display: inline-block;
          }
          .session-box {
            background-color: #ecfdf5;
            border: 1px solid #a7f3d0;
            border-radius: 14px;
            padding: 12px;
            font-size: 12px;
            font-weight: 700;
            color: #065f46;
            line-height: 1.4;
          }
          .info {
            font-size: 10px;
            color: #9cb3af;
            margin-top: 25px;
            border-top: 1px solid #f3f4f6;
            padding-top: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.03em;
          }
          .btn-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 10px;
          }
          .btn {
            background-color: #047857;
            color: white;
            border: none;
            padding: 12px 14px;
            font-size: 12px;
            font-weight: 700;
            border-radius: 12px;
            cursor: pointer;
            text-decoration: none;
            box-shadow: 0 4px 6px -1px rgba(4, 120, 87, 0.2);
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          }
          .btn:hover {
            background-color: #065f46;
            transform: translateY(-1px);
          }
          .btn-amber {
            background-color: #d97706;
            box-shadow: 0 4px 6px -1px rgba(217, 119, 6, 0.2);
          }
          .btn-amber:hover {
            background-color: #b45309;
          }
          .btn-outline {
            background-color: transparent;
            color: #4b5563;
            border: 1.5px solid #d1d5db;
            grid-column: span 2;
            box-shadow: none;
          }
          .btn-outline:hover {
            background-color: #f9fafb;
            color: #1f2937;
          }
          
          /* Print Styling */
          @media print {
            body {
              background-color: white !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            .toolbar {
              display: none !important;
            }
            .ticket {
              box-shadow: none !important;
              border-color: #000 !important;
              margin: 20px auto !important;
            }
          }
        </style>
      </head>
      <body>
        
        <!-- Controls Toolbar (Hidden on print) -->
        <div class="toolbar">
          <h4 class="toolbar-title">Kupon Pengambilan Daging Qurban</h4>
          <p class="toolbar-desc">Anda dapat mencetak kupon fisik ini atau menyimpannya sebagai berkas gambar di HP Anda.</p>
          
          <div class="btn-grid">
            <button class="btn" onclick="window.print()">
              🖨️ Cetak / PDF
            </button>
            <button class="btn btn-amber" id="download-btn" onclick="downloadCouponImage()">
              📥 Unduh Gambar
            </button>
            <button class="btn btn-outline" onclick="window.close()">
              Tutup Halaman Ini
            </button>
          </div>
        </div>

        <!-- Main Ticket Coupon Wrapper to be downloaded -->
        <div class="ticket-container" id="ticket-capture-area">
          <div class="ticket">
            <div class="header">Kupon Penerima Qurban</div>
            <div class="sub-header">Masjid Al-Barkah Manggarai</div>
            
            <div class="code-label">No. Kupon</div>
            <div class="code">${mustahiq.code}</div>
            
            <img class="qr-img" src="${qrBase64}" alt="QR Coupon Code" />
            
            <div class="name">${mustahiq.name}</div>
            <div class="meta">${mustahiq.category} &bull; ${mustahiq.address}</div>
            
            <div class="session-box">
              <span style="font-size: 9px; text-transform: uppercase; letter-spacing:0.05em; color: #047857; display:block; margin-bottom:2px;">Sesi Ambil Daging</span>
              <strong>${sessionName}</strong>
            </div>
            
            <div class="info">Sistem Qurban Digital Syar'iah Masjid Al-Barkah</div>
          </div>
        </div>

        <script>
          async function downloadCouponImage() {
            const btn = document.getElementById("download-btn");
            const originalText = btn.innerHTML;
            btn.innerHTML = "⌛ Memproses...";
            btn.disabled = true;
            
            try {
              // Target capturing area
              const captureArea = document.getElementById("ticket-capture-area");
              
              // Call html2canvas
              const canvas = await html2canvas(captureArea, {
                backgroundColor: null,
                scale: 3, // Increase scale for ultra-sharp result
                useCORS: true,
                logging: false,
              });
              
              // Generate image data
              const imgData = canvas.toDataURL("image/png");
              
              // Trigger file download
              const link = document.createElement("a");
              link.href = imgData;
              link.download = "Kupon_Qurban_${mustahiq.code}_${safeName}.png";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            } catch (err) {
              console.error("Gagal mendownload gambar kupon:", err);
              alert("Ada kendala mendownload gambar kupon. Silakan gunakan tombol Cetak / PDF.");
            } finally {
              btn.innerHTML = originalText;
              btn.disabled = false;
            }
          }
        </script>
      </body>
      </html>
    `);
  });

  // Handle Vite in dev mode, Static Assets in Production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Qurban App] Backend API & UI listening on http://0.0.0.0:${PORT}`);
  });
}

// Automatically seed data first
readRawDB();

// Start
startServer().catch(err => {
  console.error("Gagal memulai server Qurban App:", err);
});
