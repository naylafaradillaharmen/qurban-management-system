import React, { useState, useRef } from "react";
import { 
  Contact, 
  Plus, 
  Trash2, 
  Award, 
  Check, 
  CheckCircle, 
  PhoneCall, 
  Printer, 
  Clock, 
  UserCheck2,
  Smile,
  ShieldCheck,
  Building,
  QrCode,
  Download
} from "lucide-react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import { Panitia } from "../types";

interface PanitiaTabProps {
  panitiaList: Panitia[];
  onAddPanitia: (data: Partial<Panitia>) => void;
  onUpdatePanitia: (id: string, data: Partial<Panitia>) => void;
  onDeletePanitia: (id: string) => void;
}

export default function PanitiaTab({
  panitiaList,
  onAddPanitia,
  onUpdatePanitia,
  onDeletePanitia
}: PanitiaTabProps) {
  // Add modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formName, setFormName] = useState("");
  const [formJabatan, setFormJabatan] = useState("Anggota");
  const [formPhone, setFormPhone] = useState("");

  // ID Card modal state
  const [idCardTarget, setIdCardTarget] = useState<Panitia | null>(null);
  const [idCardQr, setIdCardQr] = useState("");
  const idCardRef = useRef<HTMLDivElement>(null);

  const handlePrintIdCard = async () => {
    if (!idCardTarget) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 950;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw premium dark emerald rounded card background
      ctx.fillStyle = "#022c22"; // bg-emerald-95
      const rx = 0, ry = 0, rw = 600, rh = 950, rad = 40;
      ctx.beginPath();
      ctx.moveTo(rx + rad, ry);
      ctx.lineTo(rx + rw - rad, ry);
      ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + rad);
      ctx.lineTo(rx + rw, ry + rh - rad);
      ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - rad, ry + rh);
      ctx.lineTo(rx + rad, ry + rh);
      ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - rad);
      ctx.lineTo(rx, ry + rad);
      ctx.quadraticCurveTo(rx, ry, rx + rad, ry);
      ctx.closePath();
      ctx.fill();

      // Border accent representing physical cards
      ctx.strokeStyle = "#047857"; // border-emerald-700
      ctx.lineWidth = 14;
      ctx.stroke();

      // Strap clip slot visual loop
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.beginPath();
      const px = 220, py = 25, pw = 160, ph = 24, pr = 12;
      ctx.roundRect ? ctx.roundRect(px, py, pw, ph, pr) : ctx.rect(px, py, pw, ph);
      ctx.fill();

      // Header labels
      ctx.fillStyle = "#5eead4"; // teal-300
      ctx.font = "bold 20px 'Segoe UI', 'Inter', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("PANITIA RESMI QURBAN 1447 H", 300, 105);

      ctx.fillStyle = "#99f6e4"; // teal-200
      ctx.font = "bold 22px 'Segoe UI', 'Inter', sans-serif";
      ctx.fillText("MASJID AL-BARKAH MANGGARAI", 300, 145);

      // Separator border line
      ctx.strokeStyle = "#065f46";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(80, 175);
      ctx.lineTo(520, 175);
      ctx.stroke();

      // Person profile circular initials cover avatar
      ctx.fillStyle = "#064e3b"; // bg-emerald-900
      ctx.beginPath();
      ctx.arc(300, 280, 75, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#059669"; // border-emerald-600
      ctx.lineWidth = 6;
      ctx.stroke();

      // Initials Text letter
      ctx.fillStyle = "#34d399"; // text-emerald-400
      ctx.font = "bold 80px 'Segoe UI', 'Inter', sans-serif";
      ctx.fillText(idCardTarget.name.charAt(0).toUpperCase(), 300, 308);

      // Full Name
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 36px 'Segoe UI', 'Inter', sans-serif";
      ctx.fillText(idCardTarget.name, 300, 425);

      // Role Jabatan Badge Backplate
      ctx.fillStyle = "rgba(20, 184, 166, 0.18)"; // teal opacity
      ctx.beginPath();
      const bx = 160, by = 465, bw = 280, bh = 42, br = 20;
      ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, br) : ctx.rect(bx, by, bw, bh);
      ctx.fill();
      ctx.strokeStyle = "rgba(20, 184, 166, 0.35)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Badge role text
      ctx.fillStyle = "#2dd4bf"; // teal-400
      ctx.font = "bold 18px 'Segoe UI', 'Inter', sans-serif";
      ctx.fillText(idCardTarget.jabatan.toUpperCase(), 300, 492);

      // Draw login email under the badge
      const panIdx = panitiaList.findIndex(p => p.id === idCardTarget.id);
      const loginEmailStr = panIdx >= 0 ? `panitia${panIdx + 1}@qurban.id` : `panitia1@qurban.id`;
      ctx.fillStyle = "#a7f3d0"; // emerald-250
      ctx.font = "bold 16px monospace";
      ctx.fillText(`LOGIN EMAIL: ${loginEmailStr}`, 300, 525);

      const drawQRAndPrint = (qrSrc: string | null) => {
        const proceedPrint = () => {
          const imgData = canvas.toDataURL("image/png");
          
          const iframe = document.createElement("iframe");
          iframe.style.position = "absolute";
          iframe.style.width = "0";
          iframe.style.height = "0";
          iframe.style.border = "none";
          document.body.appendChild(iframe);

          const doc = iframe.contentWindow?.document;
          if (!doc) return;

          doc.open();
          doc.write(`
            <html>
              <head>
                <title>Cetak ID Card - ${idCardTarget.name}</title>
                <style>
                  @page {
                    size: A4;
                    margin: 0;
                  }
                  body {
                    margin: 0;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    background-color: white;
                  }
                  img {
                    max-height: 95vh;
                    max-width: 95vw;
                    object-fit: contain;
                  }
                </style>
              </head>
              <body>
                <img src="${imgData}" onload="window.print(); setTimeout(() => { window.parent.document.body.removeChild(window.frameElement); }, 1000);" />
              </body>
            </html>
          `);
          doc.close();
        };

        if (qrSrc) {
          const qImg = new Image();
          qImg.onload = () => {
            // Inner White block card
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            const qx = 175, qy = 545, qsize = 250, qrad = 24;
            ctx.roundRect ? ctx.roundRect(qx, qy, qsize, qsize, qrad) : ctx.rect(qx, qy, qsize, qsize);
            ctx.fill();

            // QR image
            ctx.drawImage(qImg, 190, 560, 220, 220);

            // Card guidelines / advice note
            ctx.fillStyle = "#9ca3af"; // gray-400
            ctx.font = "bold 15px 'Segoe UI', 'Inter', sans-serif";
            ctx.textBaseline = "middle";
            ctx.fillText("Gunakan ID Card ini selama mendistribusikan", 300, 865);
            ctx.fillText("daging asnaf di area penyembelihan.", 300, 895);
            proceedPrint();
          };
          qImg.src = qrSrc;
        } else {
          ctx.fillStyle = "#9ca3af";
          ctx.font = "bold 15px 'Segoe UI', 'Inter', sans-serif";
          ctx.fillText("Gunakan ID Card ini selama mendistribusikan", 300, 865);
          ctx.fillText("daging asnaf di area penyembelihan.", 300, 895);
          proceedPrint();
        }
      };

      drawQRAndPrint(idCardQr);

    } catch (err) {
      console.error("Gagal mencetak ID Card:", err);
      alert("Gagal mencetak ID Card.");
    }
  };

  const handleDownloadIdCard = async () => {
    if (!idCardTarget) return;
    try {
      // Build a premium high-DPI canvas to render a razor-sharp PNG download
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 950;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw premium dark emerald rounded card background
      ctx.fillStyle = "#022c22"; // bg-emerald-95
      const rx = 0, ry = 0, rw = 600, rh = 950, rad = 40;
      ctx.beginPath();
      ctx.moveTo(rx + rad, ry);
      ctx.lineTo(rx + rw - rad, ry);
      ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + rad);
      ctx.lineTo(rx + rw, ry + rh - rad);
      ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - rad, ry + rh);
      ctx.lineTo(rx + rad, ry + rh);
      ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - rad);
      ctx.lineTo(rx, ry + rad);
      ctx.quadraticCurveTo(rx, ry, rx + rad, ry);
      ctx.closePath();
      ctx.fill();

      // Border accent representing physical cards
      ctx.strokeStyle = "#047857"; // border-emerald-700
      ctx.lineWidth = 14;
      ctx.stroke();

      // Strap clip slot visual loop
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.beginPath();
      const px = 220, py = 25, pw = 160, ph = 24, pr = 12;
      ctx.roundRect ? ctx.roundRect(px, py, pw, ph, pr) : ctx.rect(px, py, pw, ph);
      ctx.fill();

      // Header labels
      ctx.fillStyle = "#5eead4"; // teal-300
      ctx.font = "bold 20px 'Segoe UI', 'Inter', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("PANITIA RESMI QURBAN 1447 H", 300, 105);

      ctx.fillStyle = "#99f6e4"; // teal-200
      ctx.font = "bold 22px 'Segoe UI', 'Inter', sans-serif";
      ctx.fillText("MASJID AL-BARKAH MANGGARAI", 300, 145);

      // Separator border line
      ctx.strokeStyle = "#065f46";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(80, 175);
      ctx.lineTo(520, 175);
      ctx.stroke();

      // Person profile circular initials cover avatar
      ctx.fillStyle = "#064e3b"; // bg-emerald-900
      ctx.beginPath();
      ctx.arc(300, 280, 75, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#059669"; // border-emerald-600
      ctx.lineWidth = 6;
      ctx.stroke();

      // Initials Text letter
      ctx.fillStyle = "#34d399"; // text-emerald-400
      ctx.font = "bold 80px 'Segoe UI', 'Inter', sans-serif";
      ctx.fillText(idCardTarget.name.charAt(0).toUpperCase(), 300, 308);

      // Full Name
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 36px 'Segoe UI', 'Inter', sans-serif";
      ctx.fillText(idCardTarget.name, 300, 425);

      // Role Jabatan Badge Backplate
      ctx.fillStyle = "rgba(20, 184, 166, 0.18)"; // teal opacity
      ctx.beginPath();
      const bx = 160, by = 465, bw = 280, bh = 42, br = 20;
      ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, br) : ctx.rect(bx, by, bw, bh);
      ctx.fill();
      ctx.strokeStyle = "rgba(20, 184, 166, 0.35)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Badge role text
      ctx.fillStyle = "#2dd4bf"; // teal-400
      ctx.font = "bold 18px 'Segoe UI', 'Inter', sans-serif";
      ctx.fillText(idCardTarget.jabatan.toUpperCase(), 300, 492);

      // Draw login email under the badge
      const panIdxDownload = panitiaList.findIndex(p => p.id === idCardTarget.id);
      const loginEmailStrDownload = panIdxDownload >= 0 ? `panitia${panIdxDownload + 1}@qurban.id` : `panitia1@qurban.id`;
      ctx.fillStyle = "#a7f3d0"; // emerald-250
      ctx.font = "bold 16px monospace";
      ctx.fillText(`LOGIN EMAIL: ${loginEmailStrDownload}`, 300, 525);

      // Draw secure QR Code validation block
      if (idCardQr) {
        const img = new Image();
        img.onload = () => {
          // Inner White block card
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          const qx = 175, qy = 545, qsize = 250, qrad = 24;
          ctx.roundRect ? ctx.roundRect(qx, qy, qsize, qsize, qrad) : ctx.rect(qx, qy, qsize, qsize);
          ctx.fill();

          // QR image
          ctx.drawImage(img, 190, 560, 220, 220);

          // Card guidelines / advice note
          ctx.fillStyle = "#9ca3af"; // gray-400
          ctx.font = "bold 15px 'Segoe UI', 'Inter', sans-serif";
          ctx.fillText("Gunakan ID Card ini selama mendistribusikan", 300, 865);
          ctx.fillText("daging asnaf di area penyembelihan.", 300, 895);

          // Build link and trigger click download
          const imgData = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.href = imgData;
          const safeName = idCardTarget.name.replace(/[^a-zA-Z0-9]/g, "_");
          link.download = `ID_Card_Panitia_${safeName}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };
        img.src = idCardQr;
      } else {
        // Fallback info text
        ctx.fillStyle = "#9ca3af";
        ctx.font = "bold 15px 'Segoe UI', 'Inter', sans-serif";
        ctx.fillText("Gunakan ID Card ini selama mendistribusikan", 300, 865);
        ctx.fillText("daging asnaf di area penyembelihan.", 300, 895);

        // Download fallback PNG instantly
        const imgData = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imgData;
        const safeName = idCardTarget.name.replace(/[^a-zA-Z0-9]/g, "_");
        link.download = `ID_Card_Panitia_${safeName}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error("Gagal mendownload ID Card:", err);
      alert("Gagal mengunduh gambar ID Card.");
    }
  };

  const handleOpenIdCardFile = async (pan: Panitia) => {
    setIdCardTarget(pan);
    try {
      const dataUrl = await QRCode.toDataURL(`PANITIA-ID-${pan.id}-${pan.name}`);
      setIdCardQr(dataUrl);
    } catch (err) {
      console.error(err);
    }
  };

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      alert("Masukkan nama dan No. WhatsApp panitia!");
      return;
    }
    onAddPanitia({
      name: formName,
      jabatan: formJabatan,
      phone: formPhone
    });
    setFormName("");
    setFormPhone("");
    setIsAddOpen(false);
  };

  const handleAbsensiUpdate = (id: string, status: "Hadir" | "Sakit" | "Izin" | "Alpa") => {
    const list = panitiaList.find(p => p.id === id);
    if (list) {
      const hadirDelta = status === "Hadir" ? 1 : 0;
      onUpdatePanitia(id, {
        absensi: {
          total_hadir: list.absensi.total_hadir + hadirDelta,
          status_hari_ini: status
        }
      });
    }
  };

  // Panitia pagination bounds
  const itemsPerPage = 8;
  const totalPages = Math.ceil(panitiaList.length / itemsPerPage);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages || 1);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedPanitia = panitiaList.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Overview stats of volunteers */}
      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between sm:flex-row sm:items-center gap-4">
        <div>
          <h3 className="text-md font-bold text-gray-950">Manajemen Panitia & Absensi Harian</h3>
          <p className="text-xs text-gray-400 mt-1">Mengorganisir status kehadiran divisi pelaksana disembelih, jagger, dan pembagi.</p>
        </div>

        <button 
          onClick={() => setIsAddOpen(true)}
          className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 h-10 px-4 text-xs font-bold text-white transition-all shadow-sm shrink-0"
        >
          <Plus size={14} />
          <span>Rekrut Staff Panitia</span>
        </button>
      </div>

      {/* Grid listing */}
      {panitiaList.length === 0 ? (
        <div className="py-12 bg-white rounded-2xl border text-center text-gray-400 text-xs font-bold">
          Belum ada panitia yang terdaftar.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedPanitia.map((pan) => (
              <div key={pan.id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                
                {/* Header block info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-100 text-emerald-800 font-semibold border border-emerald-150/80 shadow-inner shrink-0">
                      {pan.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-950 font-sans">{pan.name}</h4>
                      <span className="text-[10px] text-gray-400 font-medium block mt-0.5">{pan.jabatan}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block rounded-xl px-2 py-0.5 text-[9px] font-extrabold ${
                      pan.absensi.status_hari_ini === "Hadir" ? "bg-green-100 text-green-800" :
                      pan.absensi.status_hari_ini === "Izin" ? "bg-amber-100 text-amber-800" :
                      pan.absensi.status_hari_ini === "Sakit" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      ● {pan.absensi.status_hari_ini || "Belum Absen"}
                    </span>
                    <span className="block text-[9px] text-gray-400 mt-1">Total {pan.absensi.total_hadir} Kehadiran</span>
                  </div>
                </div>

                {/* Attendance action checker buttons row */}
                <div className="bg-gray-50/50 p-2.5 rounded-2xl border border-gray-100 space-y-2">
                  <span className="text-[9px] font-bold text-gray-400 tracking-wider uppercase block text-center">Set Absensi Hari Ini</span>
                  <div className="grid grid-cols-4 gap-1 text-center">
                    {[
                      { st: "Hadir", bg: "hover:bg-green-500 hover:text-white" },
                      { st: "Izin", bg: "hover:bg-amber-500 hover:text-white" },
                      { st: "Sakit", bg: "hover:bg-blue-500 hover:text-white" },
                      { st: "Alpa", bg: "hover:bg-red-500 hover:text-white" }
                    ].map((actObj) => (
                      <button
                        key={actObj.st}
                        onClick={() => handleAbsensiUpdate(pan.id, actObj.st as any)}
                        className={`rounded-lg py-1 text-[9px] font-bold transition-all border ${
                          pan.absensi.status_hari_ini === actObj.st 
                            ? "bg-emerald-800 text-white border-emerald-950 shadow-sm"
                            : `bg-white text-gray-500 border-gray-200 ${actObj.bg}`
                        }`}
                      >
                        {actObj.st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Operational Tools action print ID card */}
                <div className="flex items-center justify-between border-t border-gray-50 pt-3 text-[10px] text-gray-400">
                  <span>WA: {pan.phone}</span>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleOpenIdCardFile(pan)}
                      className="flex items-center gap-1 cursor-pointer text-emerald-850 hover:bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-100 text-[10px] font-bold"
                    >
                      <Award size={12} />
                      <span>ID Card</span>
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Pemberhentian / eliminasi panitia ${pan.name}?`)) onDeletePanitia(pan.id);
                      }}
                      className="rounded-xl border border-red-200 bg-red-55 p-1.5 text-red-700 hover:bg-red-105 cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400 font-medium">
                Menampilkan <span className="font-bold text-gray-700">{startIndex + 1}</span> sampai{" "}
                <span className="font-bold text-gray-700">{Math.min(startIndex + itemsPerPage, panitiaList.length)}</span> dari{" "}
                <span className="font-bold text-gray-700">{panitiaList.length}</span> staff pelaksana panitia
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={safeCurrentPage === 1}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-655 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
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
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                          safeCurrentPage === pageNum
                            ? "bg-emerald-800 text-white shadow-sm"
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
                  className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-655 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recrut Panitia Modal Add */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-100">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-md font-bold text-gray-950 font-sans">Rekrut Anggota Panitia</h3>
              <button onClick={() => setIsAddOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">✕</button>
            </div>

            <form onSubmit={submitAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Lengkap Anggota *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Joko Widodo"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Jabatan & Penugasan Deviasi</label>
                <select
                  value={formJabatan}
                  onChange={(e) => setFormJabatan(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="Ketua Panitia">Ketua Panitia</option>
                  <option value="Sekretaris">Sekretaris (Data Jemaah)</option>
                  <option value="Bendahara & Keuangan">Bendahara & Keuangan Ledger</option>
                  <option value="Divisi Jagal & Penyembelihan">Divisi Jagal (Butcher Crew)</option>
                  <option value="Divisi Pencacahan Daging">Divisi Pencacahan & Packaging</option>
                  <option value="Divisi Keamanan & Logistik">Divisi Keamanan & Logistik</option>
                  <option value="Divisi Distribusi Mustahiq">Divisi Distribusi Scan Kupon</option>
                  <option value="Anggota Relawan">Anggota Relawan Umum</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nomor WhatsApp Aktif *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: 0812XXXXXXXX"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-xs font-semibold text-gray-750 hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-emerald-900 cursor-pointer shadow-sm"
                >
                  Daftarkan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ID Card vertical printable badge modal */}
      {idCardTarget && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="w-full max-w-sm rounded-[24px] bg-white p-6 shadow-2xl border border-gray-200 text-center space-y-4 my-auto max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-xs font-bold text-gray-900 uppercase">Automated ID Card Panitia</h3>
              <button onClick={() => setIdCardTarget(null)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">✕</button>
            </div>

            {/* Simulated Vertical Neck-Strap ID Card Badge */}
            <div ref={idCardRef} className="mx-auto w-[240px] border-4 border-emerald-700 bg-emerald-950 p-5 rounded-2xl relative text-white space-y-4 shadow-xl">
              {/* Strap clip slot visual loop */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 h-2.5 w-10 bg-black/40 rounded-full border border-gray-500/20" />
              
              <div className="pt-2 text-center text-[8px] font-bold text-teal-300 uppercase tracking-widest leading-none">
                Panitia Resmi Qurban 1447 H
              </div>
              <div className="border-b border-emerald-800 pb-2 font-mono text-[9px] text-teal-200 font-bold">
                Masjid Al-Barkah Manggarai
              </div>

              {/* Person Placeholder details */}
              <div className="mx-auto h-16 w-16 bg-emerald-900 rounded-full border border-emerald-600 text-teal-200 flex items-center justify-center font-bold text-xl uppercase shadow-md leading-none">
                {idCardTarget.name.charAt(0)}
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-black text-white px-1 leading-tight">{idCardTarget.name}</h4>
                <span className="inline-block rounded-[10px] bg-teal-500/20 border border-teal-500/30 px-2.5 py-0.5 text-[9px] font-bold text-teal-350 uppercase tracking-wider mt-1">{idCardTarget.jabatan}</span>
                <div className="bg-black/40 border border-teal-850 rounded-xl px-2 py-1 mt-1 font-mono text-[9px] text-teal-350 inline-flex items-center gap-1">
                  <span>🔑 Email Login:</span>
                  <span className="font-extrabold text-teal-100">{
                    (() => {
                      const idx = panitiaList.findIndex(p => p.id === idCardTarget.id);
                      return idx >= 0 ? `panitia${idx + 1}@qurban.id` : `panitia1@qurban.id`;
                    })()
                  }</span>
                </div>
              </div>

              {/* QR verification */}
              <div className="flex justify-center bg-white p-2.5 w-28 h-28 mx-auto rounded-xl border border-emerald-850">
                {idCardQr ? (
                  <img src={idCardQr} alt="Panitia QR Badge Verification" className="w-full h-full" />
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}
              </div>

              <div className="text-[8px] text-gray-400 leading-tight">
                Gunakan ID Card ini selama mendistribusikan daging asnaf di area penyembelihan.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button 
                onClick={handlePrintIdCard}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-800 text-white px-3 py-2 text-xs font-bold hover:bg-emerald-900 cursor-pointer shadow-sm"
              >
                <Printer size={13} />
                <span>Cetak ID Card</span>
              </button>
              <button 
                onClick={handleDownloadIdCard}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-teal-800 text-white px-3 py-2 text-xs font-bold hover:bg-teal-900 cursor-pointer shadow-sm"
              >
                <Download size={13} />
                <span>Unduh Gambar</span>
              </button>
              <button 
                onClick={() => setIdCardTarget(null)}
                className="col-span-2 rounded-xl border border-gray-200 bg-white py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
