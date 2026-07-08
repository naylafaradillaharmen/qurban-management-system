import React, { useState, useRef } from "react";
import { 
  Scan, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  Smartphone, 
  Users, 
  Clock, 
  Plus, 
  Sparkles,
  QrCode,
  XCircle,
  HelpCircle,
  Award,
  Printer,
  Download
} from "lucide-react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import { Html5Qrcode } from "html5-qrcode";
import { Mustahiq, SesiDistribusi } from "../types";

interface DistribusiTabProps {
  mustahiqList: Mustahiq[];
  sessionsList: SesiDistribusi[];
  onAddMustahiq: (data: Partial<Mustahiq>) => void;
  onUpdateMustahiq: (id: string, data: Partial<Mustahiq>) => void;
  onDeleteMustahiq: (id: string) => void;
  onVerifyCouponClaim: (code: string) => Promise<{ success: boolean; message: string; double_claim?: boolean; mustahiq?: Mustahiq }>;
}

export default function DistribusiTab({
  mustahiqList,
  sessionsList,
  onAddMustahiq,
  onUpdateMustahiq,
  onDeleteMustahiq,
  onVerifyCouponClaim
}: DistribusiTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [claimFilter, setClaimFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSessionId, setSelectedSessionId] = useState("ses-01");

  // Scanner UI Simulator states
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; double_claim?: boolean; mustahiq?: Mustahiq } | null>(null);

  // Real Camera scan states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const qrScannerRef = React.useRef<Html5Qrcode | null>(null);

  // Add recipient form states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<any>("Fakir & Miskin");
  const [formAddress, setFormAddress] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formSession, setFormSession] = useState("ses-01");

  // Printable QR Coupon Popup Modal
  const [printCoupon, setPrintCoupon] = useState<Mustahiq | null>(null);
  const [printQrUrl, setPrintQrUrl] = useState("");
  const couponCardRef = useRef<HTMLDivElement>(null);

  const handlePrintCoupon = () => {
    if (!couponCardRef.current || !printCoupon) return;
    const el = couponCardRef.current;
    
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.top = "-10000px";
    iframe.style.left = "-10000px";
    iframe.style.width = "0";
    iframe.style.height = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.write(`
      <html>
        <head>
          <title>Cetak Kupon - ${printCoupon.name}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700;800&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: white;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            @page {
              size: auto;
              margin: 0mm;
            }
          </style>
        </head>
        <body>
          <div style="transform: scale(1.2); transform-origin: center;">
            ${el.outerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.parent.document.body.removeChild(window.frameElement);
                }, 100);
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    doc.close();
  };

  const handleDownloadCoupon = async () => {
    if (!printCoupon) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 920;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw premium dark emerald rounded card background
      ctx.fillStyle = "#022c22"; // bg-emerald-95
      const rx = 0, ry = 0, rw = 600, rh = 920, rad = 40;
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
      ctx.fillText("KUPON RESMI PENGAMBILAN QURBAN", 300, 105);

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

      // NO. KUPON
      ctx.fillStyle = "#2dd4bf"; // teal-400
      ctx.font = "bold 16px 'Segoe UI', 'Inter', sans-serif";
      ctx.fillText("NO. KUPON", 300, 215);

      // Ticket Box
      ctx.fillStyle = "#064e3b"; // bg-emerald-900
      ctx.beginPath();
      const tx = 180, ty = 235, tw = 240, th = 55, tr = 20;
      ctx.roundRect ? ctx.roundRect(tx, ty, tw, th, tr) : ctx.rect(tx, ty, tw, th);
      ctx.fill();
      ctx.strokeStyle = "#059669";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Ticket Code
      ctx.fillStyle = "#5eead4"; // teal-300
      ctx.font = "900 32px monospace";
      ctx.fillText(printCoupon.code, 300, 274);

      const drawQRAndSave = () => {
        const imgData = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imgData;
        const safeName = printCoupon.name.replace(/[^a-zA-Z0-9]/g, "_");
        link.download = `Kupon_Qurban_${printCoupon.code}_${safeName}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      if (printQrUrl) {
        const qImg = new Image();
        qImg.onload = () => {
          // Inner White block card
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          const qx = 160, qy = 320, qsize = 280, qrad = 24;
          ctx.roundRect ? ctx.roundRect(qx, qy, qsize, qsize, qrad) : ctx.rect(qx, qy, qsize, qsize);
          ctx.fill();

          // QR image
          ctx.drawImage(qImg, 180, 340, 240, 240);

          // Mustahiq name text info below QR
          ctx.fillStyle = "#ffffff";
          ctx.font = "900 30px 'Segoe UI', 'Inter', sans-serif";
          ctx.fillText(printCoupon.name, 300, 645);

          // Category tag
          ctx.fillStyle = "rgba(45, 212, 191, 0.15)";
          ctx.beginPath();
          const tagx = 150, tagy = 665, tagw = 300, tagh = 36, tagrad = 18;
          ctx.roundRect ? ctx.roundRect(tagx, tagy, tagw, tagh, tagrad) : ctx.rect(tagx, tagy, tagw, tagh);
          ctx.fill();
          ctx.strokeStyle = "#2dd4bf";
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = "#2dd4bf";
          ctx.font = "bold 16px 'Segoe UI', 'Inter', sans-serif";
          ctx.fillText(printCoupon.category.toUpperCase(), 300, 689);

          // Address
          ctx.fillStyle = "#9ca3af";
          ctx.font = "medium 15px 'Segoe UI', 'Inter', sans-serif";
          ctx.fillText(printCoupon.address.length > 55 ? printCoupon.address.substring(0, 52) + "..." : printCoupon.address, 300, 745);

          // Disclaimer note
          ctx.fillStyle = "#14b8a6"; // teal-500
          ctx.font = "bold 14px 'Segoe UI', 'Inter', sans-serif";
          ctx.fillText("Tunjukkan QR ini pada meja pelayanan", 300, 835);
          ctx.fillText("pendistribusikan daging qurban.", 300, 860);

          drawQRAndSave();
        };
        qImg.src = printQrUrl;
      } else {
        drawQRAndSave();
      }
    } catch (err) {
      console.error("Gagal mengunduh kupon:", err);
      alert("Gagal mengunduh kupon gambar.");
    }
  };

  // Camera Scanner controls
  const stopScanning = async () => {
    if (qrScannerRef.current) {
      try {
        await qrScannerRef.current.stop();
      } catch (err) {
        console.error("Gagal stop QR scanner:", err);
      }
      qrScannerRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startScanning = async () => {
    setScanResult(null);
    setIsCameraActive(true);

    setTimeout(async () => {
      try {
        const qrCode = new Html5Qrcode("qr-reader");
        qrScannerRef.current = qrCode;
        await qrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (width, height) => {
              const size = Math.min(width, height) * 0.92;
              return { width: size, height: size };
            }
          },
          async (decodedText) => {
            setIsScanning(true);
            const result = await onVerifyCouponClaim(decodedText);
            setScanResult(result);
            setIsScanning(false);
            stopScanning();
          },
          () => {} // silent on frame errors
        );
      } catch (err) {
        console.error("Gagal start camera:", err);
        setIsCameraActive(false);
        alert("Kamera gagal diaktifkan. Mohon pastikan izin kamera aktif.");
      }
    }, 300);
  };

  React.useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const handlePrintCouponOpen = async (mst: Mustahiq) => {
    setPrintCoupon(mst);
    try {
      const dataUrl = await QRCode.toDataURL(mst.code);
      setPrintQrUrl(dataUrl);
    } catch (err) {
      console.error(err);
    }
  };

  const processDirectCouponClaim = async (code: string) => {
    setIsScanning(true);
    setScanResult(null);
    
    // Coupon processing delay
    setTimeout(async () => {
      const result = await onVerifyCouponClaim(code);
      setScanResult(result);
      setIsScanning(false);
    }, 1000);
  };

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formAddress.trim()) {
      alert("Nama dan Alamat mustahiq wajib diisi!");
      return;
    }
    onAddMustahiq({
      name: formName,
      category: formCategory,
      address: formAddress,
      phone: formPhone,
      session_id: formSession
    });
    setFormName("");
    setFormAddress("");
    setFormPhone("");
    setIsAddOpen(false);
  };

  // Filters calculation
  const filteredMustahiq = mustahiqList.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.address.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "" || m.category === categoryFilter;
    const matchesClaim = claimFilter === "" || m.claim_status === claimFilter;
    return matchesSearch && matchesCategory && matchesClaim;
  });

  // Mustahiq pagination bounds
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredMustahiq.length / itemsPerPage);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages || 1);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedMustahiq = filteredMustahiq.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Session tracker and scanner box */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Left section: Sesi Pembagian list limits */}
        <div className="md:col-span-2 rounded-[24px] bg-white p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-md font-bold text-gray-950">Sesi Kuota Distribusi Daging & Sembako</h3>
            <p className="text-xs text-gray-400 mt-1">Mengatur slot penukaran kupon demi menghindari kerumunan massal.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 my-4">
            {sessionsList.map((ses) => {
              const countRecipient = mustahiqList.filter(m => m.session_id === ses.id).length;
              const percentage = Math.min(100, Math.round((ses.current_claims / ses.max_quota) * 100));
              
              return (
                <div key={ses.id} className="rounded-2xl border border-gray-150 p-4 bg-gray-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-emerald-800 uppercase tracking-tight">{ses.name.split(" ")[0]}</span>
                    <Clock size={12} className="text-gray-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">{ses.name}</h4>
                    <p className="text-[10px] text-gray-400 mt-1">Terdaftar: {countRecipient} Jiwa</p>
                  </div>
                  {/* Progress Claims */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold text-gray-500">
                      <span>Tukkar: {ses.current_claims} / {ses.max_quota}</span>
                      <span>{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl bg-teal-50/60 p-3.5 border border-teal-100 text-[10px] text-teal-900 leading-relaxed font-semibold">
             🔑 SISTEM SYARI'AH: Kupon Kuota Sesi membatasi jumlah jiwa per-jam sehingga memuliakan kaum mustahiq saat antri daging.
          </div>
        </div>

        {/* Right Section: Compact Real-time QR Scanner Simulator (Anti Double Claim Console) */}
        <div className="rounded-[24px] bg-emerald-950 p-4 text-white shadow-lg border border-emerald-900 flex flex-col justify-between space-y-3.5" id="qr-scanner-card">
          <div>
            <div className="flex select-none items-center gap-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[10px] text-amber-400 font-bold w-fit uppercase">
              <Scan size={12} />
              <span>Syar'i QR Verifier</span>
            </div>
            <h3 className="text-sm font-extrabold text-white mt-1.5">Penukaran Kupon Antara-Klaim</h3>
            <p className="text-[10px] text-emerald-100/60 leading-tight">Gunakan kamera atau pilih jemaah untuk verifikasi real-time bebas antrean.</p>
          </div>

          {/* Camera Scan Viewport (Reduced Height & Responsive) */}
          <div className="relative rounded-2xl bg-black border-2 border-emerald-800 h-52 flex flex-col items-center justify-center overflow-hidden shadow-inner w-full">
            <div id="qr-reader" className="w-full h-full" style={{ display: isCameraActive ? "block" : "none" }} />
            
            {!isCameraActive && (
              <div className="text-center space-y-2 z-10 px-3">
                <QrCode size={32} className="text-emerald-500/40 mx-auto" />
                <p className="text-[10px] text-gray-200 font-bold">Kamera Mati</p>
                <p className="text-[9px] text-gray-400 leading-normal max-w-[200px] mx-auto">Nyalakan kamera untuk membaca barcode / kupon digital penerima.</p>
              </div>
            )}

            {isScanning && (
              <div className="absolute inset-0 bg-black/75 flex items-center justify-center z-20">
                <div className="space-y-1.5 text-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent mx-auto" />
                  <p className="text-[9px] text-amber-400 font-bold tracking-widest uppercase">Membaca QR...</p>
                </div>
              </div>
            )}
            
            {/* Visual Red Laser line scanning */}
            {isCameraActive && !isScanning && (
              <div className="absolute left-0 w-full h-0.5 bg-red-500 shadow-[0_0_8px_25%] animate-bounce top-1/2 pointer-events-none z-10" />
            )}
          </div>

          {/* Action buttons list */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={isCameraActive ? stopScanning : startScanning}
              className={`w-full py-2 px-3 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                isCameraActive 
                  ? "bg-rose-600 hover:bg-rose-700 text-white" 
                  : "bg-emerald-600 hover:bg-emerald-750 text-white"
              }`}
            >
              <Scan size={13} />
              <span>{isCameraActive ? "Matikan Kamera" : "Aktifkan Scanner"}</span>
            </button>
          </div>

          {/* Dynamic feedback panel with clean height constraints & scroll bar handling */}
          {scanResult && (
            <div className={`p-2.5 rounded-xl text-[11px] leading-relaxed max-h-[120px] overflow-y-auto scrollbar-thin ${
              scanResult.success 
                ? "bg-green-950/80 text-green-100 border border-green-500/30" 
                : "bg-rose-950/80 text-rose-100 border border-rose-500/30"
            }`}>
              <div className="flex items-center gap-1.5 font-black">
                {scanResult.success ? (
                  <CheckCircle size={13} className="text-green-400 shrink-0" />
                ) : (
                  <AlertTriangle size={13} className="text-rose-400 shrink-0 animate-bounce" />
                )}
                <span className="uppercase tracking-wider">{scanResult.success ? "VERIFIKASI SUKSES" : "KLAIM DITOLAK!"}</span>
              </div>
              <p className="text-[10px] leading-relaxed mt-1 font-medium text-gray-100">{scanResult.message}</p>
            </div>
          )}
        </div>

      </div>

      {/* Mustahiq Directory Container list */}
      <div className="rounded-[24px] bg-white p-6 shadow-sm border border-gray-100 space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-md font-bold text-gray-950">Daftar Jemaah Penerima Qurban (Mustahiq)</h3>
            <p className="text-xs text-gray-400">Total terdata penerima hak distribusi daging.</p>
          </div>

          <button 
            onClick={() => setIsAddOpen(true)}
            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white hover:scale-102 hover:shadow h-10 px-4 text-xs font-semibold transition-all shadow-sm"
          >
            <Plus size={16} />
            <span>Kupon / Mustahiq Baru</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
          <div className="relative flex-1 max-w-lg">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Cari kode kupon, nama mustahiq, RT/RW, maupun alamat..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 bg-gray-50/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category selection */}
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              <option value="">Semua Golongan</option>
              <option value="Fakir & Miskin">Fakir & Miskin</option>
              <option value="Kerabat / Tetangga">Kerabat / Tetangga</option>
              <option value="Musafir">Musafir</option>
              <option value="Panitia Kurban">Panitia Kurban</option>
              <option value="Orang yang Berkurban">Orang yang Berkurban</option>
              <option value="Fakir">Fakir (Legacy)</option>
              <option value="Miskin">Miskin (Legacy)</option>
              <option value="Yatim/Piatu">Yatim / Piatu</option>
              <option value="Lain-lain">Lain-lain</option>
            </select>

            {/* Claim status selection */}
            <select
              value={claimFilter}
              onChange={(e) => { setClaimFilter(e.target.value); setCurrentPage(1); }}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              <option value="">Semua Status Klaim</option>
              <option value="Belum Diklaim">Belum Diklaim</option>
              <option value="Sudah Diklaim">Sudah Diklaim</option>
            </select>
          </div>
        </div>

        {/* Mustahiq table database */}
        {filteredMustahiq.length === 0 ? (
          <div className="py-12 text-center text-gray-450 text-xs font-bold">
            Tidak ada penerima qurban yang terdaftar.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
              <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
                <thead className="bg-gray-50/75 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                  <tr>
                    <th className="px-5 py-4">Kode Kupon</th>
                    <th className="px-5 py-4">Nama Mustahiq</th>
                    <th className="px-5 py-4">Asnaf / Golongan</th>
                    <th className="px-5 py-4">Alamat Domisili</th>
                    <th className="px-5 py-4">Jadwal Sesi</th>
                    <th className="px-5 py-4 text-center">Status</th>
                    <th className="px-5 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white font-medium text-gray-700">
                  {paginatedMustahiq.map((m) => {
                    const correlatedSes = sessionsList.find(s => s.id === m.session_id);
                    return (
                      <tr key={m.id} className="hover:bg-gray-50/80 transition-all">
                        {/* Code */}
                        <td className="px-5 py-4">
                          <span className="font-mono font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs">
                            {m.code}
                          </span>
                        </td>
                        {/* Name */}
                        <td className="px-5 py-4">
                          <h4 className="font-bold text-gray-950">{m.name}</h4>
                        </td>
                        {/* Category */}
                        <td className="px-5 py-4">
                          <span className="inline-block rounded-full bg-gray-100 border border-gray-200 px-2 py-0.5 text-[9px] font-bold text-gray-500">
                            {m.category}
                          </span>
                        </td>
                        {/* Address */}
                        <td className="px-5 py-4 text-xs text-gray-450 max-w-xs truncate" title={m.address}>
                          {m.address}
                        </td>
                        {/* Correlated session details */}
                        <td className="px-5 py-4 text-[11px] font-semibold text-emerald-800">
                          {correlatedSes ? correlatedSes.name.split(" ")[0] + " " + correlatedSes.name.split(" ")[1] : "Sesi Standard"}
                        </td>
                        {/* Claim state status feedback */}
                        <td className="px-5 py-4">
                          <div className="flex flex-col items-center">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold ${
                              m.claim_status === "Sudah Diklaim" 
                                ? "bg-green-100 text-green-800"
                                : "bg-amber-100 text-amber-800"
                            }`}>
                              {m.claim_status}
                            </span>
                            {m.claim_date && (
                              <span className="text-[9px] text-gray-400 font-bold mt-1 font-mono">
                                {new Date(m.claim_date).toLocaleTimeString('id-ID')} WIB
                              </span>
                            )}
                          </div>
                        </td>
                        {/* Actions print QR Code and Delete button */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => handlePrintCouponOpen(m)}
                              className="inline-flex rounded-lg border border-amber-200 bg-amber-50 p-2 text-amber-700 hover:bg-amber-100 cursor-pointer"
                              title="Print Kupon QR Daging"
                            >
                              <QrCode size={13} />
                            </button>
                            
                            {/* Manual single click Claim triggers for panel ease */}
                            {m.claim_status !== "Sudah Diklaim" && (
                              <button 
                                onClick={() => processDirectCouponClaim(m.code)}
                                className="inline-flex text-[10px] font-bold rounded-lg bg-emerald-850 hover:bg-emerald-900 border border-emerald-950 px-2.5 py-1 text-white cursor-pointer"
                              >
                                Klaim
                              </button>
                            )}

                            <button 
                              onClick={() => {
                                if (confirm(`Hapus mustahiq ${m.name}?`)) onDeleteMustahiq(m.id);
                              }}
                              className="inline-flex rounded-lg border border-red-200 bg-red-50 p-2 text-red-700 hover:bg-red-105 cursor-pointer"
                            >
                              <XCircle size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400 font-medium">
                  Menampilkan <span className="font-bold text-gray-700">{startIndex + 1}</span> sampai{" "}
                  <span className="font-bold text-gray-700">{Math.min(startIndex + itemsPerPage, filteredMustahiq.length)}</span> dari{" "}
                  <span className="font-bold text-gray-700">{filteredMustahiq.length}</span> penerima sembako / kupon
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
      </div>

      {/* Mustahiq registration modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-100">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-md font-bold text-gray-950 font-sans">Tambah Kupon Penerima Baru</h3>
              <button onClick={() => setIsAddOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">✕</button>
            </div>

            <form onSubmit={submitAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Mustahiq (Penerima) *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Ibu Rina Sumiati"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nomor WhatsApp Mustahiq (Opsional - Kirim Kupon Otomatis)</label>
                <input 
                  type="text" 
                  placeholder="Contoh: 0812xxxx"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Asnaf / Golongan Mustahiq</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="Fakir & Miskin">Fakir & Miskin</option>
                  <option value="Kerabat / Tetangga">Kerabat / Tetangga</option>
                  <option value="Musafir">Musafir</option>
                  <option value="Panitia Kurban">Panitia Kurban</option>
                  <option value="Orang yang Berkurban">Orang yang Berkurban</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Alamat Domisili Lengkap *</label>
                <textarea 
                  required
                  placeholder="Contoh: Jln Manggarai Gang VII, RT 09/RW 02"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700 h-20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Jadwal Sesi Ambil Daging</label>
                <select
                  value={formSession}
                  onChange={(e) => setFormSession(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  {sessionsList.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-emerald-900 cursor-pointer shadow-sm"
                >
                  Daftarkan Mustahiq
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Coupon QR Preview Modal */}
      {printCoupon && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="w-full max-w-sm rounded-[24px] bg-white p-6 shadow-2xl border border-gray-200 text-center space-y-4 my-auto max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-xs font-bold text-gray-900 font-sans tracking-wide uppercase">Cetak Kupon Qurban</h3>
              <button onClick={() => setPrintCoupon(null)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">✕</button>
            </div>

            {/* Print Area layout - Redesigned to support beautiful vertical ticket style */}
            <div ref={couponCardRef} className="mx-auto w-[250px] border-4 border-emerald-700 bg-emerald-950 p-5 rounded-2xl relative text-white space-y-4 shadow-xl text-center">
              {/* Ticket clip slot visual loop */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 h-2.5 w-10 bg-black/40 rounded-full border border-gray-500/20" />
              
              <div className="pt-2 text-center text-[8px] font-bold text-teal-300 uppercase tracking-widest leading-none">
                Kupon Resmi Pengambilan Qurban
              </div>
              <div className="border-b border-emerald-800 pb-2 font-mono text-[9px] text-teal-200 font-bold">
                Masjid Al-Barkah Manggarai
              </div>

              <div className="space-y-1">
                <span className="text-[8px] font-bold text-teal-400 tracking-wider uppercase block">NO. KUPON</span>
                <div className="bg-emerald-900 border border-emerald-850 rounded-xl px-4 py-1 text-lg font-black text-teal-300 tracking-wider inline-block">
                  {printCoupon.code}
                </div>
              </div>

              {/* QR verification */}
              <div className="flex justify-center bg-white p-2.5 w-28 h-28 mx-auto rounded-xl border border-emerald-850">
                {printQrUrl ? (
                  <img src={printQrUrl} alt="Claim Coupon QR Verification" className="w-full h-full" />
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-black text-white px-1 leading-tight">{printCoupon.name}</h4>
                <span className="inline-block rounded-[10px] bg-teal-500/20 border border-teal-500/30 px-2.5 py-0.5 text-[9px] font-bold text-teal-350 uppercase tracking-wider mt-1">{printCoupon.category}</span>
                <p className="text-[8px] text-gray-400 block mt-2 line-clamp-2 px-1" title={printCoupon.address}>{printCoupon.address}</p>
                <div className="text-[8px] text-teal-400 font-bold block pt-3 leading-tight border-t border-emerald-800 mt-2">
                  Tunjukkan QR ini pada meja pelayanan pendistribusian daging qurban.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button 
                onClick={handlePrintCoupon}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-800 text-white px-2.5 py-2 text-xs font-bold hover:bg-emerald-900 cursor-pointer shadow-sm"
              >
                <Printer size={13} />
                <span>Cetak Kupon</span>
              </button>
              <button 
                onClick={handleDownloadCoupon}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-teal-800 text-white px-2.5 py-2 text-xs font-bold hover:bg-teal-900 cursor-pointer shadow-sm"
              >
                <Download size={13} />
                <span>Unduh Gambar</span>
              </button>
              <button 
                onClick={() => setPrintCoupon(null)}
                className="col-span-2 rounded-xl border border-red-150 bg-red-50 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 cursor-pointer"
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
