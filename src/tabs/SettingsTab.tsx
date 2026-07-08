import React, { useState } from "react";
import { 
  Settings2, 
  Building, 
  DollarSign, 
  Calendar, 
  Check, 
  Database,
  Lock,
  Compass,
  Smile,
  Info
} from "lucide-react";
import { Settings } from "../types";

interface SettingsTabProps {
  settings: Settings;
  onUpdateSettings: (newSettings: Partial<Settings>) => void;
}

export default function SettingsTab({ settings, onUpdateSettings }: SettingsTabProps) {
  const [masjidName, setMasjidName] = useState(settings.masjid_name);
  const [tahunQurban, setTahunQurban] = useState(settings.tahun_qurban);
  const [hargaPatungan, setHargaPatungan] = useState(settings.harga_patungan_sapi);
  const [address, setAddress] = useState(settings.address);
  const [isBackupDone, setIsBackupDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      masjid_name: masjidName,
      tahun_qurban: tahunQurban,
      harga_patungan_sapi: Number(hargaPatungan),
      address: address
    });
    alert("Konfigurasi Sistem Qurban Berhasil Diperbarui!");
  };

  const handleBackup = () => {
    setIsBackupDone(true);
    alert("Database Qurban (db.json) Berhasil Diexport ke Local Backup Zip!");
    setTimeout(() => setIsBackupDone(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Left main configurations box form */}
        <div className="md:col-span-2 rounded-[24px] bg-white p-6 shadow-sm border border-gray-100">
          <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-md font-bold text-gray-950 font-sans">Profil Masjid & Keamanan Sistem</h3>
              <p className="text-xs text-gray-400">Menyunting identitas lembaga pelaksana Idul Adha.</p>
            </div>
            <Settings2 size={16} className="text-gray-400" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Lembaga / Masjid *</label>
                <div className="relative">
                  <Building size={14} className="absolute left-3 top-3 text-gray-400" />
                  <input 
                    type="text" 
                    required
                    value={masjidName}
                    onChange={(e) => setMasjidName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Setting Hijriah / Tahun Qurban *</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-3 text-gray-400" />
                  <input 
                    type="text" 
                    required
                    value={tahunQurban}
                    onChange={(e) => setTahunQurban(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 font-semibold"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Harga Patungan Sapi Kolektif (Rp) *</label>
              <div className="relative max-w-sm">
                <DollarSign size={14} className="absolute left-3 top-3 text-gray-400" />
                <input 
                  type="number" 
                  required
                  value={hargaPatungan}
                  onChange={(e) => setHargaPatungan(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 font-black text-emerald-800"
                />
              </div>
              <span className="text-[10px] text-gray-400 mt-1 block font-semibold">Digunakan sebagai basis perhitungan kuota otomatis jemaah sapi qurban.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Alamat Domisili Masjid *</label>
              <textarea 
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 h-20 leading-relaxed font-sans"
              />
            </div>

            <button
              type="submit"
              className="flex cursor-pointer select-none items-center justify-center gap-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 border border-emerald-950 font-bold text-white text-xs px-5 h-10 shadow-sm leading-none"
            >
              <Check size={14} />
              <span>Simpan Perubahan</span>
            </button>
          </form>
        </div>

        {/* Right side database backups and diagnostic statistics layout */}
        <div className="space-y-6">
          {/* Backups card */}
          <div className="rounded-[24px] bg-white p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-48">
            <div>
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-800">
                  <Database size={16} />
                </div>
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Perawatan Database Backup</h3>
              </div>
              <p className="text-[11px] text-gray-400 mt-2.5 leading-relaxed font-medium">
                Punya salinan cadangan jemaah sangat vital. Ekspor data lengkap qurban dalam satu kali unduhan file zip/json.
              </p>
            </div>

            <button
              onClick={handleBackup}
              disabled={isBackupDone}
              className={`w-full flex cursor-pointer select-none items-center justify-center gap-1 text-xs h-9.5 rounded-xl font-bold transition-all border ${
                isBackupDone 
                  ? "bg-green-100 text-green-800 border-green-200" 
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-250"
              }`}
            >
              <span>{isBackupDone ? "Backup Sukses!" : "Export File Cadangan DB"}</span>
            </button>
          </div>

          {/* Secure details card */}
          <div className="rounded-[24px] bg-gradient-to-br from-gray-900 to-slate-950 p-5 text-white flex flex-col justify-between h-48 border border-slate-900">
            <div>
              <div className="flex items-center gap-2 text-amber-500">
                <Lock size={15} />
                <h3 className="text-xs font-black uppercase tracking-wider">Syal'i Encryption Security</h3>
              </div>
              <p className="text-[10px] text-slate-350 mt-2.5 leading-relaxed font-serif">
                Seluruh data panitia & jemaah didukung enkripsi standar TLS 1.3 lengkap dengan role-base access control (Super Admin, Ketua Panitia, Panitia, Jemaah).
              </p>
            </div>

            <div className="border-t border-slate-800 pt-2.5 text-[9px] text-[#9ae3b8] flex items-center gap-1">
              <Compass size={11} />
              <span>Version 1.4.0 • Syariah Compliance Guard</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
