import React, { useState, useEffect } from "react";
import { 
  Key, 
  Mail, 
  LogOut, 
  User as UserIcon, 
  ChevronRight, 
  Bell, 
  Smartphone, 
  Sparkles,
  Lock,
  Moon,
  Sun,
  X,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

// Components & Tabs
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardTab from "./tabs/DashboardTab";
import MudhohiTab from "./tabs/MudhohiTab";
import HewanTab from "./tabs/HewanTab";
import DistribusiTab from "./tabs/DistribusiTab";
import KeuanganTab from "./tabs/KeuanganTab";
import PanitiaTab from "./tabs/PanitiaTab";
import NotifikasiTab from "./tabs/NotifikasiTab";
import SettingsTab from "./tabs/SettingsTab";

// Types
import { 
  Settings, 
  User, 
  Mudhohi, 
  HewanQurban, 
  KelompokQurban, 
  Mustahiq, 
  SesiDistribusi, 
  LaporanKeuangan, 
  NotifikasiWA, 
  DashboardStats 
} from "./types";

export default function App() {
  // Session States
  const [token, setToken] = useState<string | null>(localStorage.getItem("qurban_token"));
  const [user, setUser] = useState<User | null>(
    localStorage.getItem("qurban_user") ? JSON.parse(localStorage.getItem("qurban_user")!) : null
  );

  // Layout states
  const [currentTab, setTab] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);

  // Floating notifications feedback banner
  const [activeAlert, setActiveAlert] = useState<{ message: string; phone: string } | null>(null);

  // Authentication Fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [forgotPasswordActive, setForgotPasswordActive] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  // Master Data States
  const [settings, setSettings] = useState<Settings>({
    masjid_name: "Masjid Al-Barkah Manggarai",
    is_dark_mode: false,
    tahun_qurban: "1447 H / 2026 M",
    harga_patungan_sapi: 3500000,
    address: "Jl. Lapangan Roos No. 10, Tebet, Jakarta Selatan",
    logo_url: "",
    whatsapp_api_active: true
  });

  const [stats, setStats] = useState<DashboardStats>({
    totalMudhohi: 0,
    totalSapi: 0,
    totalKambing: 0,
    totalMustahiq: 0,
    claimedMustahiq: 0,
    progressDistribusi: 0,
    totalPemasukan: 0,
    totalPengeluaran: 0,
    saldoSisa: 0,
    recentActivities: [],
    hewanStatusCounts: { Menunggu: 0, Disembelih: 0, Dikuliti: 0, Dibagikan: 0, Selesai: 0 }
  });

  const [mudhohiList, setMudhohiList] = useState<Mudhohi[]>([]);
  const [hewanList, setHewanList] = useState<HewanQurban[]>([]);
  const [kelompokList, setKelompokList] = useState<KelompokQurban[]>([]);
  const [mustahiqList, setMustahiqList] = useState<Mustahiq[]>([]);
  const [sessionsList, setSessionsList] = useState<SesiDistribusi[]>([]);
  const [panitiaList, setPanitiaList] = useState<any[]>([]);
  const [keuanganList, setKeuanganList] = useState<LaporanKeuangan[]>([]);
  const [notificationsList, setNotificationsList] = useState<NotifikasiWA[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);
  const prevNotifLenRef = React.useRef<number>(-1);

  // Safe tracking of unread notifications count
  useEffect(() => {
    if (notificationsList.length > 0) {
      if (prevNotifLenRef.current === -1) {
        setUnreadNotifCount(notificationsList.length);
      } else {
        const diff = notificationsList.length - prevNotifLenRef.current;
        if (diff > 0 && currentTab !== "notifikasi") {
          setUnreadNotifCount(prev => prev + diff);
        }
      }
      prevNotifLenRef.current = notificationsList.length;
    }
  }, [notificationsList, currentTab]);

  // Fetch all collections on initial login or reload
  const fetchAllData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const getSettings = await fetch("/api/settings").then(r => r.json());
      const getStats = await fetch("/api/stats").then(r => r.json());
      const getMudhohi = await fetch("/api/mudhohi").then(r => r.json());
      const getHewan = await fetch("/api/hewan").then(r => r.json());
      const getKelompok = await fetch("/api/kelompok").then(r => r.json());
      const getMustahiq = await fetch("/api/mustahiq").then(r => r.json());
      const getSessions = await fetch("/api/sessions").then(r => r.json());
      const getPanitia = await fetch("/api/panitia").then(r => r.json());
      const getKeuangan = await fetch("/api/keuangan").then(r => r.json());
      const getNotif = await fetch("/api/notifications").then(r => r.json());

      if (getSettings) setSettings(getSettings);
      if (getStats) setStats(getStats);
      if (getMudhohi) setMudhohiList(getMudhohi);
      if (getHewan) setHewanList(getHewan);
      if (getKelompok) setKelompokList(getKelompok);
      if (getMustahiq) setMustahiqList(getMustahiq);
      if (getSessions) setSessionsList(getSessions);
      if (getPanitia) setPanitiaList(getPanitia);
      if (getKeuangan) setKeuanganList(getKeuangan);
      if (getNotif) {
        setNotificationsList(getNotif);
      }
    } catch (err) {
      console.error("Gagal menyinkronkan database dengan API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAllData();
    }
  }, [token]);

  useEffect(() => {
    if (currentTab === "notifikasi") {
      setUnreadNotifCount(0);
    }
  }, [currentTab]);

  // Auth Operations
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      }).then(r => r.json());

      if (response.success) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem("qurban_token", response.token);
        localStorage.setItem("qurban_user", JSON.stringify(response.user));
      } else {
        setLoginError(response.message || "Email atau password salah.");
      }
    } catch (err) {
      setLoginError("Koneksi gagal ke server. Periksa port backend.");
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail })
    });
    alert(`Instruksi pemulihan sandi telah berhasil dikirim ke email: ${forgotEmail}`);
    setForgotPasswordActive(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("qurban_token");
    localStorage.removeItem("qurban_user");
    setToken(null);
    setUser(null);
    setTab("dashboard");
  };

  // REST Operations helpers

  // Mudhohi Add
  const addMudhohi = async (data: Partial<Mudhohi>) => {
    try {
      const result = await fetch("/api/mudhohi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).then(r => r.json());

      if (result.success) {
        // Find newly logged notif and pop a floating toast alert
        triggerDispatchedAlert(
          `${result.mudhohi.name} (${result.mudhohi.type_hewan}) Berhasil Terdaftar!`,
          result.mudhohi.phone
        );
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Mudhohi Update
  const updateMudhohi = async (id: string, data: Partial<Mudhohi>) => {
    try {
      await fetch(`/api/mudhohi/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Mudhohi Delete
  const deleteMudhohi = async (id: string) => {
    try {
      await fetch(`/api/mudhohi/${id}`, { method: "DELETE" });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Hewan Operations
  const addHewan = async (data: Partial<HewanQurban>) => {
    try {
      await fetch("/api/hewan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const updateHewan = async (id: string, data: Partial<HewanQurban>) => {
    try {
      const response = await fetch(`/api/hewan/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).then(r => r.json());

      if (response.success && response.hewan) {
        // Trigger a simulated notification banner update!
        triggerDispatchedAlert(
          `Status Hewan ${response.hewan.code} maju ke: *${response.hewan.status.toUpperCase()}*`,
          "Notifikasi Terdiseminasikan ke Jemaah"
        );
      }
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteHewan = async (id: string) => {
    try {
      await fetch(`/api/hewan/${id}`, { method: "DELETE" });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Mustahiq Actions
  const addMustahiq = async (data: Partial<Mustahiq>) => {
    try {
      await fetch("/api/mustahiq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMustahiq = async (id: string) => {
    try {
      await fetch(`/api/mustahiq/${id}`, { method: "DELETE" });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Mustahiq QR Scan Coupon Verification Claim (Anti Double-Claim)
  const verifyCouponClaim = async (code: string) => {
    try {
      const result = await fetch("/api/mustahiq/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      }).then(r => r.json());

      if (result.success) {
        triggerDispatchedAlert(
          `Kupon ${result.mustahiq.code} Sukses Diklaim oleh: *${result.mustahiq.name}*`,
          result.mustahiq.category
        );
      } else {
        triggerDispatchedAlert(
          `ALARM: Double Claim Warning! ${code}`,
          "Daging telah diambil sebelumnya!"
        );
      }
      fetchAllData();
      return result;
    } catch (err) {
      console.error(err);
      return { success: false, message: "Kesalahan server verifikasi." };
    }
  };

  // Ledger Cash Add
  const addKeuangan = async (data: Partial<LaporanKeuangan>) => {
    try {
      await fetch("/api/keuangan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Panitia Operations
  const addPanitia = async (data: any) => {
    try {
      await fetch("/api/panitia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const updatePanitia = async (id: string, data: any) => {
    try {
      await fetch(`/api/panitia/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const deletePanitia = async (id: string) => {
    try {
      await fetch(`/api/panitia/${id}`, { method: "DELETE" });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Simulated push WA
  const triggerManualNotification = async (phone: string, text: string) => {
    triggerDispatchedAlert(text, phone);
    try {
      await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, message: text })
      });
      fetchAllData();
    } catch (err) {
      console.error("Gagal mengirim WA:", err);
    }
  };

  const triggerDispatchedAlert = (message: string, phone: string) => {
    setActiveAlert({ message, phone });
    setTimeout(() => {
      setActiveAlert(null);
    }, 4500);
  };

  // Settings
  const updateSettings = async (data: Partial<Settings>) => {
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Rendering of different tabs conditionally
  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex h-96 flex-col items-center justify-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-800 border-t-transparent" />
          <p className="text-xs font-semibold text-gray-500">Menghubungkan ke Database Syari'ah...</p>
        </div>
      );
    }

    switch (currentTab) {
      case "dashboard":
        return (
          <DashboardTab 
            stats={stats} 
            hewanList={hewanList} 
            onNavigateToTab={(tabId) => setTab(tabId)} 
          />
        );
      case "mudhohi":
        return (
          <MudhohiTab 
            mudhohiList={mudhohiList} 
            kelompokList={kelompokList}
            hewanList={hewanList}
            onAddMudhohi={addMudhohi} 
            onUpdateMudhohi={updateMudhohi} 
            onDeleteMudhohi={deleteMudhohi} 
            onSendWhatsappSimulate={(mudhohiId, type) => {
              const item = mudhohiList.find(m => m.id === mudhohiId);
              if (item) {
                const message = type === "whatsapp_lunas" 
                  ? `Alhamdulillah Bapak/Ibu ${item.name}, qurban Anda berupa Sapi Patungan dinyatakan Lunas. Jazakumullah Khairan.`
                  : `Yth. ${item.name}, harap menyelesaikan sisa dana patungan qurban Anda via panitia Bendahara.`;
                triggerManualNotification(item.phone, message);
              }
            }}
            hargaPatungan={settings.harga_patungan_sapi}
          />
        );
      case "hewan":
        return (
          <HewanTab 
            hewanList={hewanList} 
            mudhohiList={mudhohiList}
            onAddHewan={addHewan} 
            onUpdateHewan={updateHewan} 
            onDeleteHewan={deleteHewan} 
          />
        );
      case "distribusi":
        return (
          <DistribusiTab 
            mustahiqList={mustahiqList} 
            sessionsList={sessionsList} 
            onAddMustahiq={addMustahiq} 
            onUpdateMustahiq={updateMudhohi as any}
            onDeleteMustahiq={deleteMustahiq}
            onVerifyCouponClaim={verifyCouponClaim}
          />
        );
      case "keuangan":
        return (
          <KeuanganTab 
            keuanganList={keuanganList} 
            onAddKeuangan={addKeuangan} 
            totalPemasukan={stats.totalPemasukan} 
            totalPengeluaran={stats.totalPengeluaran} 
            saldoSisa={stats.saldoSisa} 
          />
        );
      case "panitia":
        return (
          <PanitiaTab 
            panitiaList={panitiaList} 
            onAddPanitia={addPanitia} 
            onUpdatePanitia={updatePanitia} 
            onDeletePanitia={deletePanitia} 
          />
        );
      case "notifikasi":
        return (
          <NotifikasiTab 
            notificationsList={notificationsList} 
            mudhohiList={mudhohiList}
            onTriggerManualNotification={triggerManualNotification}
            whatsappActive={settings.whatsapp_api_active}
            onToggleWhatsappGateway={(act) => updateSettings({ whatsapp_api_active: act })}
          />
        );
      case "pengaturan":
        return (
          <SettingsTab 
            settings={settings} 
            onUpdateSettings={updateSettings} 
          />
        );
      default:
        return <div>Fitur Sedang Dikembangkan</div>;
    }
  };

  // If no auth, render the premium Login screen
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7f5] px-4 py-12 relative overflow-hidden">
        {/* Abstract modern Islamic background pattern ornaments */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_0.8px,transparent_0.8px)] [background-size:24px_24px] opacity-10" />
        <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -translate-x-12 -translate-y-12" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl translate-x-12 translate-y-12" />

        <div className="relative w-full max-w-md space-y-6">
          {/* Logo center header */}
          <div className="text-center space-y-2 select-none">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-800 to-teal-900 border-2 border-amber-500/30 text-white shadow-lg">
              <span className="text-3xl">🕌</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-gray-950 font-sans">Portal Akun Qurban App</h1>
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-widest leading-none">Sistem Kepanitiaan Syari'ah Modern</p>
          </div>

          {/* Form container card representing high-contrast soft shadows */}
          <div className="rounded-[28px] bg-white p-7 shadow-xl border border-gray-150 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-800 via-amber-400 to-teal-900" />
            
            {!forgotPasswordActive ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="text-center pb-2 border-b border-gray-50">
                  <span className="text-xs text-gray-400 font-semibold">Silakan masukkan kredensial panitia terdaftar</span>
                </div>

                {loginError && (
                  <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-800 border border-rose-100 flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0 animate-bounce" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Quick select buttons */}
                <div className="space-y-1.5">
                  <span className="block text-[10px] uppercase font-black tracking-tight text-emerald-800">Gunakan Akun Panitia Cepat</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { email: "panitia1@qurban.id", label: "panitia1 (Ustd. Fauzi)" },
                      { email: "panitia2@qurban.id", label: "panitia2 (B. Triyono)" },
                      { email: "panitia3@qurban.id", label: "panitia3 (Staff Bendahara)" },
                      { email: "panitia4@qurban.id", label: "panitia4 (Rian H.)" },
                      { email: "panitia5@qurban.id", label: "panitia5 (Joko S.)" },
                      { email: "panitia6@qurban.id", label: "panitia6 (Budi S.)" }
                    ].map((pacc) => (
                      <button
                        key={pacc.email}
                        type="button"
                        onClick={() => {
                          setLoginEmail(pacc.email);
                          setLoginPassword("panitia123");
                        }}
                        className="rounded-lg border border-gray-150 bg-gray-50 px-2.5 py-1.5 text-left text-[9px] font-bold text-gray-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-950 transition-all cursor-pointer truncate"
                      >
                        👥 {pacc.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 text-xs leading-none">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Email Panitia (Username)</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
                      <input 
                        type="email" 
                        required
                        placeholder="panitia1@qurban.id"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 py-3.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-gray-700">Password Sandi</label>
                      <button 
                        type="button"
                        onClick={() => setForgotPasswordActive(true)}
                        className="text-[10px] font-bold text-emerald-800 hover:underline"
                      >
                        Lupa Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Key size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
                      <input 
                        type="password" 
                        required
                        placeholder="Contoh: panitia123"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 py-3.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex cursor-pointer select-none items-center justify-center gap-1.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 border border-emerald-950 font-black text-white text-xs h-11 shadow-sm mt-2 transition-transform active:scale-98"
                >
                  <span>Masuk Sistem Syari'ah</span>
                  <ChevronRight size={14} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="text-center pb-2 border-b border-gray-50">
                  <h3 className="text-sm font-bold text-gray-900">Pulihkan Password Panitia</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Kami akan mereset instruksi sandi Anda segera.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Alamat Email Terdaftar</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
                    <input 
                      type="email" 
                      required
                      placeholder="Masukkan email pemulihan..."
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 py-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordActive(false)}
                    className="flex-1 rounded-2xl border border-gray-200 py-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-2xl bg-emerald-800 text-white font-black text-xs py-3 hover:bg-emerald-900 cursor-pointer"
                  >
                    Kirim Instruksi
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Authentic Admin Dashboard Screen
  return (
    <div className={`min-h-screen bg-[#435f68] flex text-gray-800 font-sans relative overflow-hidden ${isDark ? "dark animate-fade-in" : ""}`}>
      
      {/* Bottom Floating Decoration for Frosted Glass feel */}
      <div className="fixed -bottom-32 -right-32 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="fixed -top-32 -left-32 w-96 h-96 bg-[#0d2e2e]/3 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Dynamic WhatsApp Simulated Floating SMS Alert feedback popups */}
      {activeAlert && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-[#0d2e2e] text-white p-4 max-w-sm border border-teal-800/50 shadow-2xl animate-bounce backdrop-blur-md">
          <div className="flex items-start gap-3">
            <div className="rounded-xl p-2.5 bg-black/20 border border-[#d4af37]/25 text-[#d4af37] shrink-0">
               <Smartphone size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#d4af37]">WhatsApp Gateway Terkirim</span>
                <span className="text-[9px] text-teal-300 font-semibold">{activeAlert.phone}</span>
              </div>
              <p className="text-[11px] leading-relaxed mt-1 text-slate-100 italic">"{activeAlert.message}"</p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive left navigation bar */}
      <Sidebar 
        currentTab={currentTab} 
        setTab={setTab} 
        user={user} 
        onLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        masjidName={settings.masjid_name}
      />

      {/* Main content viewport space */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 lg:my-4 lg:mr-4 lg:bg-[#f6f9f9] lg:rounded-[32px] lg:shadow-2xl overflow-hidden">
        <Header 
          setSidebarOpen={setSidebarOpen} 
          user={user} 
          tahunQurban={settings.tahun_qurban} 
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
          onOpenNotifications={() => {
            setTab("notifikasi");
            setShowNotifications(true);
          }}
          notificationCount={unreadNotifCount}
        />

        {/* Viewport content */}
        <main className="flex-1 overflow-y-auto px-6 py-6 max-w-7xl w-full mx-auto">
          {renderTabContent()}
        </main>
      </div>

    </div>
  );
}
