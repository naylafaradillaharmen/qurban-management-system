export interface Settings {
  masjid_name: string;
  is_dark_mode: boolean;
  tahun_qurban: string;
  harga_patungan_sapi: number;
  address: string;
  logo_url: string;
  whatsapp_api_active: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "Super Admin" | "Ketua Panitia" | "Panitia" | "Mudhohi";
  access: string;
}

export interface Panitia {
  id: string;
  name: string;
  jabatan: string;
  phone: string;
  absensi: {
    total_hadir: number;
    status_hari_ini: "Hadir" | "Sakit" | "Izin" | "Alpa" | "";
  };
}

export interface Mudhohi {
  id: string;
  name: string;
  phone: string;
  email?: string;
  type_hewan: "Sapi (Patungan)" | "Sapi (Mandiri)" | "Kambing";
  detail_qurban: string;
  nominal_patungan: number;
  total_pembayaran: number;
  payment_status: "Lunas" | "Belum Lunas";
  approved: boolean;
  image_url?: string;
  date: string;
  breed?: string;
  description?: string;
}

export interface HewanQurban {
  id: string;
  type: "Sapi" | "Kambing";
  code: string;
  weight: number;
  price: number;
  status: "Menunggu" | "Disembelih" | "Dikuliti" | "Dibagikan" | "Selesai";
  group_id: string; // kel-01, or kel-none
  assignees: string[]; // Mudhohi ID
  breed?: string;
  description?: string;
}

export interface KelompokQurban {
  id: string;
  name: string;
  type: "Sapi";
  max_quota: number;
  members_count: number;
  list_members: string[]; // mudhohi ID list
}

export interface Mustahiq {
  id: string;
  name: string;
  category: "Fakir & Miskin" | "Kerabat / Tetangga" | "Musafir" | "Panitia Kurban" | "Orang yang Berkurban" | "Lain-lain" | "Fakir" | "Miskin" | "Yatim/Piatu" | "Amil" | "Fii Sabilillah";
  address: string;
  phone?: string;
  session_id: string;
  claim_status: "Belum Diklaim" | "Sudah Diklaim";
  code: string;
  qr_code_url?: string;
  claim_date?: string | null;
}

export interface SesiDistribusi {
  id: string;
  name: string;
  max_quota: number;
  current_claims: number;
}

export interface Pembayaran {
  id: string;
  mudhohi_id: string;
  amount: number;
  date: string;
  status: string;
  method: string;
  desc: string;
}

export interface LaporanKeuangan {
  id: string;
  type: "Pemasukan" | "Pengeluaran";
  category: string;
  desc: string;
  amount: number;
  date: string;
}

export interface NotifikasiWA {
  id: string;
  mdn_id?: string;
  phone: string;
  message: string;
  status: "Sent" | "Failed" | "Pending";
  detail?: string;
  timestamp: string;
}

export interface DashboardStats {
  totalMudhohi: number;
  totalSapi: number;
  totalKambing: number;
  totalMustahiq: number;
  claimedMustahiq: number;
  progressDistribusi: number;
  totalPemasukan: number;
  totalPengeluaran: number;
  saldoSisa: number;
  recentActivities: Array<{ id: string; title: string; desc: string; time: string; type: string }>;
  hewanStatusCounts: {
    Menunggu: number;
    Disembelih: number;
    Dikuliti: number;
    Dibagikan: number;
    Selesai: number;
  };
}
