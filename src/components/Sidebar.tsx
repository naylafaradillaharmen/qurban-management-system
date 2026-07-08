import { 
  LayoutDashboard, 
  Users, 
  Beef, 
  QrCode, 
  Landmark, 
  Contact, 
  Bell, 
  Settings2, 
  LogOut, 
  User as UserIcon,
  Menu,
  ChevronLeft,
  X
} from "lucide-react";
import { motion } from "motion/react";

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  user: { name: string; role: string } | null;
  onLogout: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  masjidName: string;
}

export default function Sidebar({
  currentTab,
  setTab,
  user,
  onLogout,
  sidebarOpen,
  setSidebarOpen,
  masjidName
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", name: "Dashboard Utama", icon: LayoutDashboard },
    { id: "mudhohi", name: "Manajemen Mudhohi", icon: Users },
    { id: "hewan", name: "Manajemen Hewan", icon: Beef },
    { id: "distribusi", name: "Distribusi Mustahiq", icon: QrCode },
    { id: "keuangan", name: "Laporan Keuangan", icon: Landmark },
    { id: "panitia", name: "Manajemen Panitia", icon: Contact },
    { id: "notifikasi", name: "Notifikasi WhatsApp", icon: Bell },
    { id: "pengaturan", name: "Pengaturan Sistem", icon: Settings2 },
  ];

  const handleNav = (tabId: string) => {
    setTab(tabId);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-[280px] flex-col justify-between border-r border-white/5 bg-[#435f68] lg:border-r-0 text-white shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header Branding */}
        <div className="flex flex-col border-b border-white/5 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/10 shadow-inner">
                <span className="text-xl font-bold text-teal-50">🕌</span>
              </div>
              <div>
                <h1 className="text-md font-bold tracking-tight text-white">Qurban App</h1>
                <p className="text-[10px] font-bold tracking-widest uppercase text-teal-200">Panel Syari'ah</p>
              </div>
            </div>
            
            <button 
              className="rounded-lg p-1 text-teal-300 hover:bg-white/10 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-4 rounded-xl bg-white/5 p-3 text-center border border-white/10 backdrop-blur-sm">
            <p className="overflow-hidden text-ellipsis whitespace-nowrap text-xs font-semibold text-teal-100">
              {masjidName || "Masjid Al-Barkah Manggarai"}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-thin scrollbar-thumb-teal-800">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`group flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-[#e8f0f1] text-[#1b2a2d] shadow-sm font-bold"
                    : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                <IconComponent 
                  size={18} 
                  className={`transition-colors duration-200 ${
                    isActive ? "text-[#1b2a2d]" : "text-teal-300/70 group-hover:text-white"
                  }`} 
                />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Panitia Profile & Logout */}
        <div className="border-t border-white/5 bg-[#3a525a]/40 p-4.5">
          {user ? (
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/5 p-2.5 border border-white/10 backdrop-blur-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 border border-white/5 text-white">
                <UserIcon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-white leading-tight">{user.name}</p>
                <span className="inline-block rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-semibold text-teal-100 border border-white/10 mt-1">
                  {user.role}
                </span>
              </div>
            </div>
          ) : null}

          <button
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-950 bg-rose-950/20 px-4 py-2.5 text-xs font-semibold text-rose-300 transition-all hover:bg-rose-900 hover:text-white cursor-pointer"
          >
            <LogOut size={14} />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>
    </>
  );
}
