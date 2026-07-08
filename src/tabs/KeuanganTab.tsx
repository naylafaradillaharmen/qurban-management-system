import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { 
  Landmark, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight,
  Printer,
  FileText,
  Search,
  Filter,
  CheckCircle,
  Clock
} from "lucide-react";
import { LaporanKeuangan } from "../types";

interface KeuanganTabProps {
  keuanganList: LaporanKeuangan[];
  onAddKeuangan: (data: Partial<LaporanKeuangan>) => void;
  totalPemasukan: number;
  totalPengeluaran: number;
  saldoSisa: number;
}

export default function KeuanganTab({
  keuanganList,
  onAddKeuangan,
  totalPemasukan,
  totalPengeluaran,
  saldoSisa
}: KeuanganTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Add modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formType, setFormType] = useState<"Pemasukan" | "Pengeluaran">("Pemasukan");
  const [formCategory, setFormCategory] = useState("Sapi Patungan");
  const [formDesc, setFormDesc] = useState("");
  const [formAmount, setFormAmount] = useState(100000);

  // Filter lists
  const filteredKeuangan = keuanganList.filter(k => {
    const matchesSearch = k.desc.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          k.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "" || k.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleTypeFilterChange = (val: string) => {
    setTypeFilter(val);
    setCurrentPage(1);
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(value);
  };

  // Pagination bounds
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredKeuangan.length / itemsPerPage);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages || 1);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedKeuangan = filteredKeuangan.slice(startIndex, startIndex + itemsPerPage);

  // Excel/CSV Real Exporter (Native-compatible stylized XLS spreadsheet for perfect multi-platform Excel parsing)
  const handleExportExcel = () => {
    const headers = ["Tanggal Ledger", "Kategori Akun", "Rincian Deskripsi Item", "Tipe Kas", "Nominal Anggaran (IDR)"];
    const rows = filteredKeuangan.map(k => [
      k.date,
      k.category,
      k.desc.replace(/[;\n\r"']/g, ' '),
      k.type,
      k.amount
    ]);

    const title = `LAPORAN ARUS KAS KEUANGAN QURBAN`;
    const masjid = `Masjid Al-Barkah Manggarai`;
    const printedAt = new Date().toLocaleString('id-ID');

    const htmlTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Laporan Kas Utama</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; }
          .header-table { margin-bottom: 20px; }
          table { border-collapse: collapse; width: 100%; margin-top: 10px; }
          th { background-color: #065f46; color: #ffffff; border: 1px solid #cccccc; padding: 10px; font-weight: bold; text-align: center; }
          td { border: 1px solid #dddddd; padding: 8px; text-align: left; font-size: 10pt; }
          tr:nth-child(even) { background-color: #f2fbf7; }
          .amount-col { text-align: right; }
          .type-pemasukan { color: #047857; font-weight: bold; }
          .type-pengeluaran { color: #b91c1c; font-weight: bold; }
        </style>
      </head>
      <body>
        <table style="border:none; margin-bottom:20px;">
          <tr style="border:none;background:none;"><td colspan="5" style="border:none;font-size:16pt;font-weight:bold;color:#1e3a8a;">${title}</td></tr>
          <tr style="border:none;background:none;"><td colspan="5" style="border:none;font-size:11pt;color:#555;">Kepanitiaan: ${masjid}</td></tr>
          <tr style="border:none;background:none;"><td colspan="5" style="border:none;font-size:9pt;color:#888;">Dicetak pada: ${printedAt} WIB</td></tr>
        </table>
        
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <td style="text-align: center;">${r[0]}</td>
                <td>${r[1]}</td>
                <td>${r[2]}</td>
                <td style="text-align: center;" class="${r[3] === "Pemasukan" ? "type-pemasukan" : "type-pengeluaran"}">${r[3]}</td>
                <td class="amount-col" style="text-align: right;">${Number(r[4]).toLocaleString('id-ID')}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlTemplate], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Laporan_Kas_Qurban_Al_Barkah_${new Date().getFullYear()}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // High-performance client-side PDF Generator (direct file download)
  const handlePrintPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // Outer Border Accent
    doc.setDrawColor(13, 46, 46); // Emerald Tone #0d2e2e
    doc.setLineWidth(0.7);
    doc.rect(7, 7, 196, 283);

    // Decorative corner headers
    doc.setFillColor(13, 46, 46);
    doc.rect(7, 7, 4, 4, "F");
    doc.rect(199, 7, 4, 4, "F");
    doc.rect(7, 286, 4, 4, "F");
    doc.rect(199, 286, 4, 4, "F");

    // Title / Header Text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(13, 46, 46);
    doc.text("LAPORAN KAS JURNAL UMUM KEPANITIAAN QURBAN", 14, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Masjid Al-Barkah Manggarai - Tahun ${new Date().getFullYear()}`, 14, 25);
    doc.text(`Tgl Hubungan: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} WIB`, 14, 30);

    // Separator line
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(14, 34, 196, 34);

    // Summary Metric Widgets
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 38, 55, 18, "F");
    doc.rect(14, 38, 55, 18, "S");
    
    doc.rect(74, 38, 55, 18, "F");
    doc.rect(74, 38, 55, 18, "S");

    doc.setFillColor(13, 46, 46);
    doc.rect(134, 38, 62, 18, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("TOTAL INCOMING", 18, 42.5);
    doc.text("TOTAL OUTGOING", 78, 42.5);
    doc.setTextColor(167, 243, 208); // Emerald light
    doc.text("SALDO KAS WALISYUKUR", 138, 42.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(21, 128, 61); // Green
    doc.text(formatRupiah(totalPemasukan), 18, 50.5);
    doc.setTextColor(194, 65, 12); // Red/Orange
    doc.text(formatRupiah(totalPengeluaran), 78, 50.5);
    doc.setTextColor(252, 211, 77); // Golden yellow
    doc.text(formatRupiah(saldoSisa), 138, 50.5);

    // Draw table heading
    let y = 64;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text("No", 16, y + 5.5);
    doc.text("Tanggal", 26, y + 5.5);
    doc.text("Kategori Akun", 50, y + 5.5);
    doc.text("Rincian Deskripsi Item", 82, y + 5.5);
    doc.text("Tipe", 146, y + 5.5);
    doc.text("Anggaran (IDR)", 194, y + 5.5, { align: "right" });

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);

    // List products
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    filteredKeuangan.forEach((k, idx) => {
      // Check pagination break limits
      if (y > 265) {
        doc.addPage();
        
        // Redraw outer borders
        doc.setDrawColor(13, 46, 46);
        doc.setLineWidth(0.7);
        doc.rect(7, 7, 196, 283);
        doc.setFillColor(13, 46, 46);
        doc.rect(7, 7, 4, 4, "F");
        doc.rect(199, 7, 4, 4, "F");
        doc.rect(7, 286, 4, 4, "F");
        doc.rect(199, 286, 4, 4, "F");

        y = 20;
        doc.setFillColor(241, 245, 249);
        doc.rect(14, y, 182, 8, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);
        doc.text("No", 16, y + 5.5);
        doc.text("Tanggal", 26, y + 5.5);
        doc.text("Kategori Akun", 50, y + 5.5);
        doc.text("Rincian Deskripsi Item", 82, y + 5.5);
        doc.text("Tipe", 146, y + 5.5);
        doc.text("Anggaran (IDR)", 194, y + 5.5, { align: "right" });
        y += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
      }

      doc.setTextColor(100, 116, 139);
      doc.text(String(idx + 1), 16, y + 5.5);
      doc.text(k.date, 26, y + 5.5);

      // Truncated labels strings
      doc.setTextColor(30, 41, 59);
      const categoryTrunc = k.category.length > 16 ? k.category.substring(0, 14) + ".." : k.category;
      doc.text(categoryTrunc, 50, y + 5.5);

      const descTrunc = k.desc.length > 34 ? k.desc.substring(0, 31) + "..." : k.desc;
      doc.text(descTrunc, 82, y + 5.5);

      // Tipe Kas and colors
      doc.setFont("helvetica", "bold");
      if (k.type === "Pemasukan") {
        doc.setTextColor(21, 128, 61);
        doc.text("MASUK", 146, y + 5.5);
      } else {
        doc.setTextColor(194, 65, 12);
        doc.text("KELUAR", 146, y + 5.5);
      }
      doc.setFont("helvetica", "normal");

      // Balance
      doc.setTextColor(30, 41, 59);
      doc.text(formatRupiah(k.amount), 194, y + 5.5, { align: "right" });

      doc.setDrawColor(226, 232, 240);
      doc.line(14, y + 8, 196, y + 8);
      y += 8;
    });

    // Signature Area
    if (y > 240) {
      doc.addPage();
      doc.setDrawColor(13, 46, 46);
      doc.setLineWidth(0.7);
      doc.rect(7, 7, 196, 283);
      doc.setFillColor(13, 46, 46);
      doc.rect(7, 7, 4, 4, "F");
      doc.rect(199, 7, 4, 4, "F");
      doc.rect(7, 286, 4, 4, "F");
      doc.rect(199, 286, 4, 4, "F");
      y = 20;
    }

    y += 15;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`Jakarta, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 140, y);
    doc.setFont("helvetica", "bold");
    doc.text("Bendahara Umum Panitia Qurban", 140, y + 20);
    doc.setFont("helvetica", "normal");
    doc.text("Masjid Al-Barkah Manggarai", 140, y + 24);

    doc.save(`Laporan_Buku_Kas_Qurban_${new Date().getFullYear()}.pdf`);
  };

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDesc.trim() || formAmount <= 0) {
      alert("Isikan rincian deskripsi & nominal transaksi!");
      return;
    }
    onAddKeuangan({
      type: formType,
      category: formCategory,
      desc: formDesc,
      amount: Number(formAmount)
    });
    setFormDesc("");
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Cards */}
      <div className="grid gap-5 sm:grid-cols-3">
        {/* Total Pemasukan */}
        <div className="rounded-[20px] bg-white p-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <ArrowUpRight size={22} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-400">Total Pemasukan</h4>
              <p className="text-lg font-black text-gray-900 mt-1">{formatRupiah(totalPemasukan)}</p>
            </div>
          </div>
        </div>

        {/* Total Pengeluaran */}
        <div className="rounded-[20px] bg-white p-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
              <ArrowDownRight size={22} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-400">Total Pengeluaran</h4>
              <p className="text-lg font-black text-gray-900 mt-1">{formatRupiah(totalPengeluaran)}</p>
            </div>
          </div>
        </div>

        {/* Balance */}
        <div className="rounded-[20px] bg-emerald-950 p-5 text-white shadow-sm border border-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-900 p-3 text-amber-400">
              <Landmark size={22} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-emerald-200">Sisa Saldo Kas</h4>
              <p className="text-lg font-black text-amber-300 mt-1">{formatRupiah(saldoSisa)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial ledger catalog and actions */}
      <div className="rounded-[24px] bg-white p-6 shadow-sm border border-gray-100 space-y-4">
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-md font-bold text-gray-950 font-sans">Buku Besar Ledger Keuangan Qurban</h3>
            <p className="text-xs text-gray-400">Pencatatan uang masuk qorban jemaah dan pengeluaran kepanitiaan.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button 
              onClick={handlePrintPDF}
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 h-10 px-4 text-xs font-semibold text-gray-750 transition-all shadow-sm"
              title="Cetak & simpan sebagai PDF"
            >
              <Printer size={14} className="text-emerald-700" />
              <span>Cetak Rekap PDF</span>
            </button>
            <button 
              onClick={handleExportExcel}
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 h-10 px-4 text-xs font-semibold text-gray-750 transition-all shadow-sm"
              title="Unduh laporan kas terformat rapi (.xls)"
            >
              <FileText size={14} className="text-teal-700" />
              <span>Unduh Laporan Excel</span>
            </button>
            <button 
              onClick={() => setIsAddOpen(true)}
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 h-10 px-4 text-xs font-bold text-white transition-all shadow-sm"
            >
              <Plus size={14} />
              <span>Input Buku Kas</span>
            </button>
          </div>
        </div>

        {/* Searching bar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Cari rincian transaksi (Contoh: sewa terpal, pendaftaran, dll)..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 bg-gray-50/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-500">Tipe Transaksi:</span>
            <select 
              value={typeFilter}
              onChange={(e) => handleTypeFilterChange(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              <option value="">Semua Transaksi</option>
              <option value="Pemasukan">Pemasukan (In)</option>
              <option value="Pengeluaran">Pengeluaran (Out)</option>
            </select>
          </div>
        </div>

        {/* Financial table view */}
        {filteredKeuangan.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs font-semibold">
            Belum ada transaksi terdata.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="min-w-full divide-y divide-gray-100 text-left text-xs font-semibold">
                <thead className="bg-gray-50/75 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                  <tr>
                    <th className="px-5 py-4">Tanggal Ledger</th>
                    <th className="px-5 py-4">Kategori Akun</th>
                    <th className="px-5 py-4">Rincian Deskripsi Item</th>
                    <th className="px-5 py-4 text-center">Tipe Kas</th>
                    <th className="px-5 py-4 text-right">Nominal Anggaran (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white text-gray-700 leading-normal">
                  {paginatedKeuangan.map((k) => (
                    <tr key={k.id} className="hover:bg-gray-50/80 transition-all font-sans">
                      {/* Date */}
                      <td className="px-5 py-4 font-mono font-bold text-gray-500">
                        {k.date}
                      </td>
                      {/* Category */}
                      <td className="px-5 py-4">
                        <span className="inline-block rounded-lg bg-gray-100 border border-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-650">
                          {k.category}
                        </span>
                      </td>
                      {/* Description */}
                      <td className="px-5 py-4 text-gray-900 font-bold">
                        {k.desc}
                      </td>
                      {/* Type Indicator */}
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-extrabold ${
                          k.type === "Pemasukan" 
                            ? "bg-green-100 text-green-800"
                            : "bg-red-150 text-red-800"
                        }`}>
                          {k.type === "Pemasukan" ? "+" : "-"} {k.type}
                        </span>
                      </td>
                      {/* Amount */}
                      <td className={`px-5 py-4 text-right font-black ${
                        k.type === "Pemasukan" ? "text-green-700" : "text-red-650"
                      }`}>
                        {formatRupiah(k.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400 font-medium">
                  Menampilkan <span className="font-bold text-gray-700">{startIndex + 1}</span> sampai{" "}
                  <span className="font-bold text-gray-700">{Math.min(startIndex + itemsPerPage, filteredKeuangan.length)}</span> dari{" "}
                  <span className="font-bold text-gray-700">{filteredKeuangan.length}</span> rekap keuangan
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={safeCurrentPage === 1}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-650 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
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
                              : "border border-gray-200 bg-white text-gray-650 hover:bg-gray-50"
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
                    className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-650 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Transaction Modal Dialog */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-100">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-md font-bold text-gray-950 font-sans">Input Pembukuan Kas Qurban</h3>
              <button onClick={() => setIsAddOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">✕</button>
            </div>

            <form onSubmit={submitAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tipe Transaksi</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: "Pemasukan", label: "Pemasukan (In)" },
                    { val: "Pengeluaran", label: "Pengeluaran (Out)" }
                  ].map((x) => (
                    <button
                      key={x.val}
                      type="button"
                      onClick={() => {
                        setFormType(x.val as any);
                        setFormCategory(x.val === "Pemasukan" ? "Sapi Patungan" : "Operasional");
                      }}
                      className={`rounded-xl border py-2.5 text-xs font-extrabold transition-all cursor-pointer ${
                        formType === x.val 
                          ? "bg-emerald-800 text-white border-emerald-950 shadow-sm"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {x.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Kategori Transaksi</label>
                {formType === "Pemasukan" ? (
                  <select 
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value="Sapi Patungan">Pendaftaran Sapi Patungan</option>
                    <option value="Sapi Mandiri">Pendaftaran Sapi Mandiri</option>
                    <option value="Kambing">Pendaftaran Kambing</option>
                    <option value="Donasi Umum">Donasi Umum Jemaah / Masjid</option>
                  </select>
                ) : (
                  <select 
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value="Pembelian Hewan">Pengadaan Pembelian Hewan</option>
                    <option value="Operasional">Alat Jagal, Plastik, & Terpal</option>
                    <option value="Konsumsi">Konsumsi & Rapat Panitia/Jagal</option>
                    <option value="Humas & Transport">Humas, Transport & Distribusi</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Deskripsi & Rincian Transaksi *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Pembelian bumbu gulai konsumsi panitia"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nominal Transaksi Anggaran (Rp) *</label>
                <input 
                  type="number" 
                  required
                  value={formAmount}
                  onChange={(e) => setFormAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700 font-bold"
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
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
