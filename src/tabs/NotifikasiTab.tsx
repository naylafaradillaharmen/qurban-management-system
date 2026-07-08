import React, { useState } from "react";
import { 
  Bell, 
  Smartphone, 
  Send, 
  CheckCheck, 
  Settings2, 
  Clock, 
  Filter, 
  Search, 
  Check, 
  RefreshCw,
  HelpCircle,
  MessageSquare
} from "lucide-react";
import { NotifikasiWA, Mudhohi } from "../types";

interface NotifikasiTabProps {
  notificationsList: NotifikasiWA[];
  mudhohiList: Mudhohi[];
  onTriggerManualNotification: (phone: string, text: string) => void;
  whatsappActive: boolean;
  onToggleWhatsappGateway: (active: boolean) => void;
}

export default function NotifikasiTab({
  notificationsList,
  mudhohiList,
  onTriggerManualNotification,
  whatsappActive,
  onToggleWhatsappGateway
}: NotifikasiTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [testReceiver, setTestReceiver] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredNotif = notificationsList.filter(n => {
    return n.phone.includes(searchTerm) || n.message.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredNotif.length / itemsPerPage);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages || 1);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedNotif = filteredNotif.slice(startIndex, startIndex + itemsPerPage);

  const handleSendTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testReceiver || !testMessage.trim()) {
      alert("Pilih penerima dan isi pesan testing!");
      return;
    }
    
    onTriggerManualNotification(testReceiver, testMessage);
    
    // Alert info
    alert(`Pesan Berhasil Dikirim! WhatsApp Gateway berhasil meneruskan pesan ke nomor ${testReceiver}`);
    setTestMessage("");
    setTestReceiver("");
  };

  // Preset templates
  const presets = [
    { title: "Tanda Terima Pembayaran Lunas", message: "Yth. [Nama Jemaah], kami menyatakan pembayaran qurban Anda berupa [Tipe Qurban] senilai Rp [Harga] dinyatakan LUNAS. Semoga ibadah qurban ini diridhai Allah SWT. - Masjid Al-Barkah" },
    { title: "Pengingat Cicilan Pelunasan", message: "Yth. [Nama Jemaah], kami mengingatkan sisa patungan qurban Anda Rp [Sisa] belum terbayarkan. Harap diselesaikan sebelum H-3 Idul Adha. Syukron. - Panitia Masjid" },
    { title: "Update Penyembelihan Syar'i", message: "Yth. [Nama Jemaah], Alhamdulillah, hewan qurban Anda ([Kode Hewan]) baru saja selesai di-*DISEMBELIH* secara syar'i. Doa dan keikhlasan Anda menyertai ibadah suci ini." }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top dashboard connection switch */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Toggle Connection card */}
        <div className="rounded-[24px] bg-white p-5 shadow-sm border border-gray-100 md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-md font-bold text-gray-950 font-sans">Integrasi WhatsApp Gateway (Fonnte API)</h3>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-extrabold ${
                whatsappActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
              }`}>
                ● {whatsappActive ? "API CONNECTED" : "OFFLINE / DEVELOPMENT MODE"}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Qurban App terintegrasi dengan WhatsApp Gateway otomatis (Fonnte/Waba API) untuk pengiriman tanda bukti transaksi instan, pengingat pelunasan jemaah, nomor urut sapi patungan, serta pembaruan langsung kala hewan disembelih.
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
            <span className="text-[11px] font-semibold text-gray-500">Aktifkan API Pengiriman Otomatis</span>
            <button
              onClick={() => onToggleWhatsappGateway(!whatsappActive)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                whatsappActive 
                  ? "bg-rose-950 text-rose-300 border border-rose-900" 
                  : "bg-emerald-800 text-white border border-emerald-950"
              }`}
            >
              {whatsappActive ? "Matikan Gateway" : "Aktifkan Gateway"}
            </button>
          </div>
        </div>

        {/* Right side manual testing suite */}
        <div className="rounded-[24px] bg-emerald-950 p-5 text-white shadow-sm border border-emerald-900">
          <div className="mb-3">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
              <Send size={12} />
              <span>Kirim Notifikasi Mandiri</span>
            </h3>
            <p className="text-[10px] text-emerald-100/60 mt-0.5">Kirimkan format pesan instan / broadcast ke nomor jemaah.</p>
          </div>

          <form onSubmit={handleSendTest} className="space-y-3 text-xs leading-none">
            <div>
              <label className="block text-[10px] font-bold text-emerald-300 mb-1">Pilih Target Jemaah</label>
              <select 
                value={testReceiver}
                onChange={(e) => {
                  setTestReceiver(e.target.value);
                  const selectedM = mudhohiList.find(m => m.phone === e.target.value);
                  if (selectedM) {
                    setTestMessage(`Assalamu'alaikum Warahmatullahi Wabarakatuh Bapak/Ibu ${selectedM.name}, kami mengonfirmasi pendaftaran Qurban Anda dengan ID ${selectedM.id} telah tercatat di database Masjid Al-Barkah. Terima kasih.`);
                  }
                }}
                className="w-full rounded-xl bg-[#09150e] border border-emerald-800 text-white px-2.5 py-2"
                required
              >
                <option value="">-- Jemaah (WhatsApp) --</option>
                {mudhohiList.map(m => (
                  <option key={m.id} value={m.phone}>{m.name} ({m.phone})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-emerald-300 mb-1">Pesan WhatsApp (Test)</label>
              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Isikan pesan notifikasi..."
                className="w-full rounded-xl bg-[#09150e] border border-emerald-800 text-white p-2.5 h-16 leading-normal text-[11px]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 font-semibold text-white text-xs h-9 shadow-sm transition-all"
            >
              <span>Kirim WhatsApp Sekarang</span>
            </button>
          </form>
        </div>
      </div>

      {/* Preset templates options guide */}
      <div className="rounded-[24px] bg-white p-6 shadow-sm border border-gray-100 space-y-4">
        <div>
          <h3 className="text-md font-bold text-gray-950 font-sans">Template Notifikasi Bawaan (Default System)</h3>
          <p className="text-xs text-gray-400">Pola otomatisasi pengiriman SMS / WhatsApp yang didukung sistem:</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {presets.map((p, idx) => (
            <div key={idx} className="rounded-2xl border border-gray-150 p-4 bg-gray-50/40 relative">
              <span className="absolute top-2.5 right-3 text-emerald-800 text-xs"><MessageSquare size={14} /></span>
              <h4 className="text-xs font-black text-gray-850 font-sans tracking-tight pr-5">{p.title}</h4>
              <p className="text-[10px] text-gray-500 leading-normal mt-2.5 border-t border-gray-100 pt-2">{p.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dispatch queue logs */}
      <div className="rounded-[24px] bg-white p-6 shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-3">
          <div>
            <h3 className="text-md font-bold text-gray-950 font-sans">Log Dashboard Pengiriman WhatsApp</h3>
            <p className="text-xs text-gray-400">Arsip status pesan keluar paling terupdate.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Search size={12} />
              </span>
              <input
                type="text"
                placeholder="Cari nomor/pesan..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full sm:w-56 rounded-xl border border-gray-200 bg-white pl-8 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-emerald-700 outline-none transition-all"
              />
            </div>
            <button className="p-2 hover:bg-gray-50 rounded-xl transition-all border border-gray-100" title="Refresh">
              <RefreshCw size={14} className="text-gray-400" />
            </button>
          </div>
        </div>

        {filteredNotif.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs font-bold font-sans">Belum ada data logs pengiriman.</div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="min-w-full divide-y divide-gray-100 text-left text-xs font-sans font-medium">
                <thead className="bg-gray-50/75 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                  <tr>
                    <th className="px-5 py-4 font-black">Penerima (Phone)</th>
                    <th className="px-5 py-4 font-black">Isi Pesan / SMS</th>
                    <th className="px-5 py-4 font-black">Timestamp</th>
                    <th className="px-5 py-4 text-center font-black">Status Kirim</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
                  {paginatedNotif.map((n) => (
                    <tr key={n.id} className="hover:bg-gray-50/80 transition-all font-sans">
                      {/* Receivers */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Smartphone size={12} className="text-gray-400" />
                          <span className="font-bold text-gray-900">{n.phone}</span>
                        </div>
                      </td>
                      {/* Message */}
                      <td className="px-5 py-4 max-w-sm truncate text-gray-700" title={n.message}>
                        {n.message}
                      </td>
                      {/* Date */}
                      <td className="px-5 py-4 text-[10px] font-bold text-gray-400 font-mono">
                        {n.timestamp.substring(11, 16)} WIB • {n.timestamp.substring(0, 10)}
                      </td>
                      {/* Status check icons */}
                      <td className="px-5 py-4 text-center">
                        {n.status === "Failed" ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-extrabold text-red-700 border border-red-100 shadow-sm">
                              <span>● Gagal</span>
                            </span>
                            {n.detail && (
                              <span className="text-[9px] text-gray-400 font-bold max-w-[120px] truncate" title={n.detail}>
                                {n.detail}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border shadow-sm ${
                              n.detail === "mock"
                                ? "bg-amber-50 text-amber-800 border-amber-100"
                                : "bg-green-50 text-green-800 border-green-100"
                            }`}>
                              <CheckCheck size={10} />
                              <span>{n.detail === "mock" ? "Simulasi" : "Terkirim"}</span>
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400 font-medium">
                  Menampilkan <span className="font-bold text-gray-700">{startIndex + 1}</span> sampai{" "}
                  <span className="font-bold text-gray-700">{Math.min(startIndex + itemsPerPage, filteredNotif.length)}</span> dari{" "}
                  <span className="font-bold text-gray-700">{filteredNotif.length}</span> log
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={safeCurrentPage === 1}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
                  >
                    Sebelumnya
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      if (totalPages > 5 && pageNum !== 1 && pageNum !== totalPages && Math.abs(pageNum - safeCurrentPage) > 1) {
                        if (pageNum === 2 || pageNum === totalPages - 1) {
                          return <span key={pageNum} className="text-gray-400 text-xs px-1">...</span>;
                        }
                        return null;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`h-8 w-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            safeCurrentPage === pageNum
                              ? "bg-emerald-800 text-white font-black"
                              : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={safeCurrentPage === totalPages}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
