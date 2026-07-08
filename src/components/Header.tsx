import { Menu, Bell, Sun, Moon, Sparkles, UserCheck } from "lucide-react";

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  user: any;
  tahunQurban: string;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenNotifications: () => void;
  notificationCount: number;
}

export default function Header({
  setSidebarOpen,
  user,
  tahunQurban,
  isDark,
  onToggleTheme,
  onOpenNotifications,
  notificationCount
}: HeaderProps) {
  // Simple Indonesian local date logic helper
  const getCurrentDateIndo = () => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const now = new Date();
    return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/40 bg-white/50 px-6 backdrop-blur-md">
      {/* Handlers and Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-xl border border-gray-200 p-2.5 text-gray-600 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d2e2e] lg:hidden"
        >
          <Menu size={20} />
        </button>
        
        <div className="hidden flex-col sm:flex flex-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sistem Manajemen Qurban</p>
          <div className="flex items-center gap-2 mt-0.5">
            <h2 className="text-md font-extrabold text-[#0d2e2e] leading-tight">Selamat Datang di Portal Panitia</h2>
            <div className="hidden xl:flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-teal-100">
              <UserCheck size={12} className="text-emerald-700" />
              <span>Sesi Syar'i Terverifikasi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges / Quick Controls */}
      <div className="flex items-center gap-3">
        {/* Localized Date Badge */}
        <div className="hidden md:flex flex-col items-end text-right px-1">
          <span className="text-xs font-bold text-gray-800">{getCurrentDateIndo()}</span>
          <span className="text-[10px] font-bold text-emerald-800">IDUL ADHA {tahunQurban || "1447 H / 2026 M"}</span>
        </div>

        {/* Year Badge */}
        <div className="flex items-center gap-1.5 rounded-2xl bg-emerald-800 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm border border-emerald-700">
          <Sparkles size={12} className="text-emerald-300 rotate-12" />
          <span>{tahunQurban || "1447 H / 2026 M"}</span>
        </div>

        {/* Bell Alerts */}
        <button 
          onClick={onOpenNotifications}
          className="relative rounded-xl border border-gray-200 p-2.5 text-gray-600 hover:bg-gray-50 transition-all focus:outline-none"
        >
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
              {notificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
