import { 
  Beef, 
  Users, 
  QrCode, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Award
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { DashboardStats, HewanQurban } from "../types";

interface DashboardTabProps {
  stats: DashboardStats;
  hewanList: HewanQurban[];
  onNavigateToTab: (tabId: string) => void;
}

export default function DashboardTab({ stats, hewanList, onNavigateToTab }: DashboardTabProps) {
  // Format Currency
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(value);
  };

  // Chart data for keuangan
  const financialChartData = [
    { label: "10 Mei", pemasukan: 3500000, pengeluaran: 0 },
    { label: "12 Mei", pemasukan: 10200000, pengeluaran: 23500000 },
    { label: "15 Mei", pemasukan: 11200000, pengeluaran: 24700000 },
    { label: "18 Mei", pemasukan: 17200000, pengeluaran: 31200000 },
    { label: "20 Mei", pemasukan: 62200000, pengeluaran: 31200000 },
    { label: "Skrg", pemasukan: stats.totalPemasukan, pengeluaran: stats.totalPengeluaran }
  ];

  // Pie chart data for animal status
  const statusColors: Record<string, string> = {
    Menunggu: "#ef4444",   // Red
    Disembelih: "#f59e0b", // Amber
    Dikuliti: "#3b82f6",   // Blue
    Dibagikan: "#06b6d4",  // Cyan
    Selesai: "#10b981"     // Emerald
  };

  const pieData = [
    { name: "Menunggu", value: stats.hewanStatusCounts.Menunggu },
    { name: "Disembelih", value: stats.hewanStatusCounts.Disembelih },
    { name: "Dikuliti", value: stats.hewanStatusCounts.Dikuliti },
    { name: "Dibagikan", value: stats.hewanStatusCounts.Dibagikan },
    { name: "Selesai", value: stats.hewanStatusCounts.Selesai }
  ].filter(item => item.value > 0);

  // Fallback for empty status counts
  const renderPieData = pieData.length > 0 ? pieData : [
    { name: "Menunggu", value: 3 },
    { name: "Disembelih", value: 1 },
    { name: "Selesai", value: 2 }
  ];

  return (
    <div className="space-y-6" id="dashboard-tab">
      {/* Upper Quick Info Widget */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white/40 rounded-[20px] p-6 border border-white/60 shadow-sm backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌙</span>
            <h3 className="text-md font-extrabold text-[#0d2e2e]">Operasional Hari Tasyrik & Idul Adha</h3>
          </div>
          <p className="text-xs font-medium text-teal-900/80">
            Seluruh penimbangan hewan, pencacahan dan penyembelihan wajib mengikuti panduan protokol Majelis Ulama Indonesia (MUI).
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onNavigateToTab("mudhohi")}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-800 text-white px-4 py-2.5 text-xs font-bold shadow-sm hover:bg-emerald-700 hover:scale-102 transition-all cursor-pointer"
          >
            <span>Daftar Mudhohi</span>
            <ArrowRight size={14} />
          </button>
          <button 
            onClick={() => onNavigateToTab("distribusi")}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-emerald-800 shadow-sm hover:bg-gray-50 transition-all cursor-pointer"
          >
            <QrCode size={14} className="text-emerald-800" />
            <span>Scan Kupon</span>
          </button>
        </div>
      </div>

      {/* Grid Analytics Indicators */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Mudhohi */}
        <div className="rounded-[24px] glass-card p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-[#0d2e2e]/5 p-3 text-[#d4af37]">
              <Users size={22} />
            </div>
            <span className="text-xs font-bold text-[#d4af37] bg-[#d4af37]/10 px-2.5 py-0.5 rounded-full">+100% Aktif</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-[#0d2e2e]">{stats.totalMudhohi} Orang</h3>
            <p className="text-xs font-semibold text-gray-500 mt-1">Total Pendaftar Qurban</p>
          </div>
        </div>

        {/* Total Stock Animals */}
        <div className="rounded-[24px] glass-card p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-amber-50/50 p-3 text-amber-600">
              <Beef size={22} />
            </div>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
              {stats.totalSapi} Sapi | {stats.totalKambing} Kambing
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-[#0d2e2e]">{stats.totalSapi + stats.totalKambing} Ekor</h3>
            <p className="text-xs font-semibold text-gray-500 mt-1">Total Hewan Qurban Masuk</p>
          </div>
        </div>

        {/* Total Recipient Distribution */}
        <div className="rounded-[24px] glass-card p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-teal-50/50 p-3 text-teal-600">
              <QrCode size={22} />
            </div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full">
              {stats.progressDistribusi}% Claimed
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-[#0d2e2e]">{stats.claimedMustahiq} / {stats.totalMustahiq}</h3>
            <p className="text-xs font-semibold text-gray-500 mt-1">Sembako / Daging Tersalurkan</p>
          </div>
        </div>

        {/* Financial Sisa/Saldo */}
        <div className="rounded-[24px] glass-card p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-emerald-900/10 p-3 text-[#d4af37]">
              <DollarSign size={22} />
            </div>
            <span className="text-xs font-bold text-[#0d2e2e] bg-white/50 px-2.5 py-0.5 rounded-full border border-white">Laporan Kas</span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-black text-[#0d2e2e] truncate">{formatRupiah(stats.saldoSisa)}</h3>
            <p className="text-xs font-semibold text-gray-500 mt-1">Sisa Anggaran Operasional</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Core Financial Area Chart */}
        <div className="lg:col-span-2 rounded-[24px] glass-card p-6 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-md font-extrabold text-[#0d2e2e]">Grafik Arus Keuangan Qurban</h2>
              <p className="text-xs text-gray-500">Pemasukan patungan mudhohi vs pengeluaran vendor & penunjang</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-[#0d2e2e]" />
                <span className="text-gray-600">Masuk ({formatRupiah(stats.totalPemasukan)})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-[#d4af37]" />
                <span className="text-gray-600">Keluar ({formatRupiah(stats.totalPengeluaran)})</span>
              </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialChartData}>
                <defs>
                  <linearGradient id="pemasukanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d2e2e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0d2e2e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="pengeluaranGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `Rp ${val/1000000}M`} tickLine={false} />
                <Tooltip formatter={(value) => formatRupiah(Number(value))} />
                <Area type="monotone" dataKey="pemasukan" stroke="#0d2e2e" strokeWidth={2} fillOpacity={1} fill="url(#pemasukanGrad)" />
                <Area type="monotone" dataKey="pengeluaran" stroke="#d4af37" strokeWidth={2} fillOpacity={1} fill="url(#pengeluaranGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Animal Slaughter Status Doughnut Chart */}
        <div className="rounded-[24px] glass-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-md font-extrabold text-[#0d2e2e]">Status Pemrosesan Hewan</h2>
            <p className="text-xs text-gray-500">Kondisi real-time pos pemotongan</p>
          </div>

          <div className="relative flex justify-center items-center h-48 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={renderPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {renderPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={statusColors[entry.name] || "#CBD5e1"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Summary Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase font-bold text-gray-400">Total Hewan</span>
              <span className="text-2xl font-black text-[#0d2e2e]">{hewanList.length}</span>
            </div>
          </div>

          {/* Color Indicators Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.keys(statusColors).map((key) => {
              const val = stats.hewanStatusCounts[key as keyof typeof stats.hewanStatusCounts] || 0;
              return (
                <div key={key} className="flex items-center gap-2 rounded-lg bg-white/40 p-1.5 border border-white">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColors[key] }} />
                  <span className="font-semibold text-gray-700 truncate capitalize">{key}</span>
                  <span className="ml-auto font-black text-gray-800">{val}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row with Recent Activities and Distribution status */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Updates list */}
        <div className="rounded-[24px] glass-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-md font-extrabold text-[#0d2e2e]">Aktivitas Terbaru Panitia</h2>
              <p className="text-xs text-gray-500">Log operasional real-time di area penyembelihan</p>
            </div>
            <Clock size={16} className="text-gray-400" />
          </div>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            {stats.recentActivities.slice(0, 8).map((act) => (
              <div key={act.id} className="group flex items-start gap-3.5 rounded-2xl p-3 border border-transparent hover:bg-white/40 hover:border-white transition-all">
                <div className={`mt-0.5 rounded-xl p-2.5 text-xs ${
                  act.type === "mudhohi" ? "bg-cyan-50/70 text-cyan-700" :
                  act.type === "animal" ? "bg-amber-50/70 text-amber-700" :
                  act.type === "payment" ? "bg-teal-50/80 text-[#0d2e2e]" :
                  "bg-purple-50/70 text-purple-700"
                }`}>
                  {act.type === "mudhohi" ? <Users size={16} /> :
                   act.type === "animal" ? <Beef size={16} /> :
                   act.type === "payment" ? <DollarSign size={16} /> :
                   <QrCode size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#0d2e2e] transition-colors">{act.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{act.desc}</p>
                  <span className="inline-block text-[10px] font-semibold text-gray-400 mt-1">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Syariah Compliance Verification Card */}
        <div className="rounded-[24px] bg-gradient-to-br from-[#0d2e2e] to-[#041212] p-6 text-white flex flex-col justify-between border border-[#d4af37]/30 shadow-xl relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex select-none items-center gap-2.5 rounded-xl bg-white/5 px-3.5 py-1.5 w-fit border border-[#d4af37]/25 text-[#d4af37]">
              <ShieldCheck size={16} />
              <span className="text-xs font-bold tracking-wider uppercase">Sertifikasi Halal MUI 2026</span>
            </div>
            
            <div className="space-y-2.5">
              <h3 className="text-xl font-extrabold text-[#d4af37] leading-tight">Teknis Penyembelihan Qurban Halalan Thayyiban</h3>
              <p className="text-xs text-teal-100/80 leading-relaxed font-sans">
                Aplikasi digital Qurban App menjamin status ketertelusuran (traceability) hewan dari proses timbang, validasi syar’i mudhohi 7 orang sapi, hingga distribusi barcode mustahiq pencegah klaim duplikasi.
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4.5 mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-[#09150e]/80 p-3 border border-white/5">
              <h5 className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider">Metode Potong</h5>
              <p className="text-xs font-black text-teal-100 mt-1">Manual Syar'i</p>
            </div>
            <div className="rounded-xl bg-[#09150e]/80 p-3 border border-white/5">
              <h5 className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider">Batas Waktu</h5>
              <p className="text-xs font-black text-teal-100 mt-1">H+3 Tasyrik</p>
            </div>
            <div className="rounded-xl bg-[#09150e]/80 p-3 border border-white/5">
              <h5 className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider">Skala Aman</h5>
              <p className="text-xs font-black text-teal-100 mt-1">Suku Dinas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
