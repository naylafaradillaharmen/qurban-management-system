import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Award, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  QrCode, 
  Share2, 
  Smartphone, 
  UserPlus, 
  HelpCircle,
  FileText,
  DollarSign,
  User,
  Group
} from "lucide-react";
import QRCode from "qrcode";
import { Mudhohi, KelompokQurban, HewanQurban } from "../types";

interface MudhohiTabProps {
  mudhohiList: Mudhohi[];
  kelompokList: KelompokQurban[];
  hewanList: HewanQurban[];
  onAddMudhohi: (data: Partial<Mudhohi>) => void;
  onUpdateMudhohi: (id: string, data: Partial<Mudhohi>) => void;
  onDeleteMudhohi: (id: string) => void;
  onSendWhatsappSimulate: (mudhohiId: string, messageType: string) => void;
  hargaPatungan: number;
}

export const ANIMAL_BREEDS = {
  "Sapi (Patungan)": [
    {
      breed: "Sapi Bali Premium",
      nominal: 3500000,
      description: "Sapi Bali tangguh pilihan panitia. Memiliki persentase karkas (daging murni) sangat tinggi, rendah lemak, dirawat secara organik, bersertifikat bebas penyakit mulut & kuku (PMK) serta Halal."
    },
    {
      breed: "Sapi Madura Unggul",
      nominal: 4250000,
      description: "Sapi Madura kualitas tinggi dengan punuk indah, berdaya tahan prima. Daging bercorak serat halus padat berisi, dijamin sehat walafiat bebas PMK."
    }
  ],
  "Sapi (Mandiri)": [
    {
      breed: "Sapi Jawa Putih (PO)",
      nominal: 24500000,
      description: "Sapi Peranakan Ongole (PO) putih bersih berukuran besar. Berbahu tinggi kuat, tegap berpunuk, daging melimpah, diniatkan atas nama keluarga (7 jiwa)."
    },
    {
      breed: "Sapi Limosin Super",
      nominal: 45000000,
      description: "Sapi Limosin raksasa kualitas ekspor. Bobot ekstra besar, dipelihara dengan nutrisi konsentrat pilihan, jaminan tegap, bersih, dan gagah untuk syiar kurban agung."
    }
  ],
  "Kambing": [
    {
      breed: "Kambing Jawa (Kacang) Standard",
      nominal: 3200000,
      description: "Kambing lokal berotot kencang. Bulu mulus berkilat, lincah aktif, asupan hijau segar terkontrol, gigi taring sudah ganti (kupak), sah mutlak secara syari'at."
    },
    {
      breed: "Kambing Etawa Jumbo",
      nominal: 3800000,
      description: "Peranakan Etawa tinggi gagah berpostur elok bertelinga panjang melambai. Daging padat berisi berukuran besar, mantap dan berkah untuk ibadah qurban."
    }
  ]
};

export default function MudhohiTab({
  mudhohiList,
  kelompokList,
  hewanList,
  onAddMudhohi,
  onUpdateMudhohi,
  onDeleteMudhohi,
  onSendWhatsappSimulate,
  hargaPatungan
}: MudhohiTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"daftar" | "patungan">("daftar");

  // Selected for editing / certificate / WA simulate
  const [selectedMudhohi, setSelectedMudhohi] = useState<Mudhohi | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [certQrUrl, setCertQrUrl] = useState("");

  // Form states
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formType, setFormType] = useState<"Sapi (Patungan)" | "Sapi (Mandiri)" | "Kambing">("Sapi (Patungan)");
  const [formNominal, setFormNominal] = useState(3500000);
  const [formBayar, setFormBayar] = useState(3500000);
  const [formBreed, setFormBreed] = useState("Sapi Bali Premium");
  const [formDescription, setFormDescription] = useState("Sapi Bali tangguh pilihan panitia. Memiliki persentase karkas (daging murni) sangat tinggi, rendah lemak, dirawat secara organik, bersertifikat bebas penyakit mulut & kuku (PMK) serta Halal.");

  // Calculate current slot allocations and maximum ceilings
  const countPatungan = mudhohiList.filter(m => m.type_hewan === "Sapi (Patungan)").length;
  const countMandiri = mudhohiList.filter(m => m.type_hewan === "Sapi (Mandiri)").length;
  const countKambing = mudhohiList.filter(m => m.type_hewan === "Kambing").length;

  const maxPatungan = kelompokList.reduce((acc, k) => acc + k.max_quota, 0) || 14;
  const maxMandiri = 5;
  const maxKambing = 10;

  // Sync nominal to type
  const handleTypeChange = (type: string) => {
    setFormType(type as any);
    const breeds = ANIMAL_BREEDS[type as keyof typeof ANIMAL_BREEDS] || [];
    if (breeds.length > 0) {
      setFormBreed(breeds[0].breed);
      setFormNominal(breeds[0].nominal);
      setFormBayar(breeds[0].nominal);
      setFormDescription(breeds[0].description);
    }
  };

  const handleOpenCertificate = async (mudhohi: Mudhohi) => {
    setSelectedMudhohi(mudhohi);
    setIsCertificateOpen(true);
    try {
      // Generate QR Code containing the certificate token URL
      const dataUrl = await QRCode.toDataURL(`QURBAN-CERT-${mudhohi.id}-${mudhohi.name}`);
      setCertQrUrl(dataUrl);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrintCertificate = (m: Mudhohi) => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    // Outer Background
    doc.setFillColor(13, 34, 23); // #0d2217 dark forest value
    doc.rect(0, 0, 297, 210, "F");

    // Double frame accent lines
    doc.setDrawColor(217, 119, 6); // Amber #d97706
    doc.setLineWidth(1.5);
    doc.rect(10, 10, 277, 190);
    doc.setLineWidth(0.5);
    doc.rect(13, 13, 271, 184);

    // Decorative corners
    doc.setFillColor(217, 119, 6);
    doc.rect(10, 10, 8, 8, "F");
    doc.rect(279, 10, 8, 8, "F");
    doc.rect(10, 192, 8, 8, "F");
    doc.rect(279, 192, 8, 8, "F");

    // Title Block
    doc.setTextColor(245, 158, 11); // Amber #f59e0b
    doc.setFont("times", "bold");
    doc.setFontSize(26);
    doc.text("SERTIFIKAT DIGITAL SHAHIBUL QURBAN", 148, 40, { align: "center" });

    // Subtitle
    doc.setTextColor(154, 227, 184); // light mint green
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Tahun Qurban 1447 H / 2026 M", 148, 48, { align: "center" });

    // Decorative line
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.5);
    doc.line(80, 54, 217, 54);

    // Quran quote
    doc.setTextColor(209, 250, 229);
    doc.setFont("times", "italic");
    doc.setFontSize(10);
    doc.text(
      `"Daging unta, sapi dan kambing itu tidak dapat mencapai keridhaan Allah, tetapi ketakwaan darimulahlah yang mencapainya..." (QS. Al-Hajj: 37)`,
      148,
      64,
      { align: "center" }
    );

    // Salutation
    doc.setTextColor(229, 231, 235);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Diberikan secara takzim kepada jemaah mulia:", 148, 85, { align: "center" });

    // Jemaah name
    doc.setTextColor(253, 224, 71); // bright yellow
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(m.name, 148, 98, { align: "center" });

    // Jemaah code
    doc.setTextColor(245, 158, 11);
    doc.setFont("courier", "bold");
    doc.setFontSize(10);
    doc.text(`KODE REGISTRASI: ${m.id}`, 148, 105, { align: "center" });

    // Statement of qurban item
    doc.setTextColor(229, 231, 235);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(
      "Segenap Pengurus & Panitia Masjid Al-Barkah Manggarai menyatakan bahwa yang bersangkutan",
      148,
      120,
      { align: "center" }
    );
    doc.text(
      "telah menunaikan ibadah qurban secara syari'ah & sah berupa:",
      148,
      126,
      { align: "center" }
    );

    // Qurban details
    const qurbanText = m.type_hewan === "Kambing" 
      ? "1 Ekor Kambing Premium" 
      : `1/7 Saham Sapi Kolektif (${m.type_hewan})`;
    doc.setTextColor(110, 231, 183); // emerald green
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(qurbanText, 148, 138, { align: "center" });

    // QR section & Sign section
    if (certQrUrl) {
      try {
        doc.addImage(certQrUrl, "PNG", 50, 150, 24, 24);
      } catch (e) {
        console.error("No QR image integrated", e);
      }
    }
    doc.setTextColor(154, 227, 184);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("KUPON & VALIDASI QR", 62, 178, { align: "center" });

    // Sign section
    doc.setTextColor(229, 231, 235);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Jakarta, 26 Mei 2026", 215, 152, { align: "center" });
    
    doc.setTextColor(245, 158, 11);
    doc.setFont("times", "bolditalic");
    doc.setFontSize(11);
    doc.text("Ustadz Ahmad Fauzi", 215, 168, { align: "center" });
    
    doc.setTextColor(200, 200, 200);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Ketua Panitia Pelaksana", 215, 173, { align: "center" });

    // Footer decoration
    doc.setTextColor(154, 227, 184);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("SISTEM MANAGEMENT SYARIAH MODERN - MASJID AL-BARKAH", 148, 195, { align: "center" });

    doc.save(`Sertifikat_Qurban_${m.name.replace(/\s+/g, '_')}.pdf`);
  };

  const handleShareCertificate = async (m: Mudhohi) => {
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      // Outer Background
      doc.setFillColor(13, 34, 23); // #0d2217 dark forest value
      doc.rect(0, 0, 297, 210, "F");

      // Double frame accent lines
      doc.setDrawColor(217, 119, 6); // Amber #d97706
      doc.setLineWidth(1.5);
      doc.rect(10, 10, 277, 190);
      doc.setLineWidth(0.5);
      doc.rect(13, 13, 271, 184);

      // Decorative corners
      doc.setFillColor(217, 119, 6);
      doc.rect(10, 10, 8, 8, "F");
      doc.rect(279, 10, 8, 8, "F");
      doc.rect(10, 192, 8, 8, "F");
      doc.rect(279, 192, 8, 8, "F");

      // Title Block
      doc.setTextColor(245, 158, 11); // Amber #f59e0b
      doc.setFont("times", "bold");
      doc.setFontSize(26);
      doc.text("SERTIFIKAT DIGITAL SHAHIBUL QURBAN", 148, 40, { align: "center" });

      // Subtitle
      doc.setTextColor(154, 227, 184); // light mint green
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Tahun Qurban 1447 H / 2026 M", 148, 48, { align: "center" });

      // Decorative line
      doc.setDrawColor(245, 158, 11);
      doc.setLineWidth(0.5);
      doc.line(80, 54, 217, 54);

      // Quran quote
      doc.setTextColor(209, 250, 229);
      doc.setFont("times", "italic");
      doc.setFontSize(10);
      doc.text(
        `"Daging unta, sapi dan kambing itu tidak dapat mencapai keridhaan Allah, tetapi ketakwaan darimulahlah yang mencapainya..." (QS. Al-Hajj: 37)`,
        148,
        64,
        { align: "center" }
      );

      // Salutation
      doc.setTextColor(229, 231, 235);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text("Diberikan secara takzim kepada jemaah mulia:", 148, 85, { align: "center" });

      // Jemaah name
      doc.setTextColor(253, 224, 71); // bright yellow
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text(m.name, 148, 98, { align: "center" });

      // Jemaah code
      doc.setTextColor(245, 158, 11);
      doc.setFont("courier", "bold");
      doc.setFontSize(10);
      doc.text(`KODE REGISTRASI: ${m.id}`, 148, 105, { align: "center" });

      // Statement of qurban item
      doc.setTextColor(229, 231, 235);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(
        "Segenap Pengurus & Panitia Masjid Al-Barkah Manggarai menyatakan bahwa yang bersangkutan",
        148,
        120,
        { align: "center" }
      );
      doc.text(
        "telah menunaikan ibadah qurban secara syari'ah & sah berupa:",
        148,
        126,
        { align: "center" }
      );

      // Qurban details
      const matchingHewan = hewanList.find(h => h.assignees.includes(m.id));
      const myBreed = matchingHewan?.breed || (m.type_hewan === "Kambing" ? "Kambing Standard" : "Sapi Bali Premium");
      const qurbanText = m.type_hewan === "Kambing" 
        ? `1 Ekor Kambing (${myBreed})` 
        : `1/7 Saham Sapi Kolektif (${myBreed})`;
      doc.setTextColor(110, 231, 183); // emerald green
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text(qurbanText, 148, 138, { align: "center" });

      // QR section & Sign section
      if (certQrUrl) {
        doc.addImage(certQrUrl, "PNG", 50, 150, 24, 24);
      }
      doc.setTextColor(154, 227, 184);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("SCAN VALIDASI RESMI", 62, 178, { align: "center" });

      doc.setDrawColor(245, 158, 11);
      doc.setLineWidth(0.25);
      doc.line(175, 170, 255, 170);

      doc.setFont("times", "bolditalic");
      doc.setTextColor(253, 224, 71);
      doc.setFontSize(14);
      doc.text("Ustadz Ahmad Fauzi", 215, 165, { align: "center" });

      doc.setTextColor(200, 200, 200);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("Ketua Panitia Pelaksana", 215, 173, { align: "center" });

      // Footer decoration
      doc.setTextColor(154, 227, 184);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("SISTEM MANAGEMENT SYARIAH MODERN - MASJID AL-BARKAH", 148, 195, { align: "center" });

      const pdfBlob = doc.output("blob");
      const fileName = `Sertifikat_Qurban_${m.name.replace(/\s+/g, '_')}.pdf`;

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([pdfBlob], fileName, { type: "application/pdf" })] })) {
        const file = new File([pdfBlob], fileName, { type: "application/pdf" });
        navigator.share({
          title: `Sertifikat Qurban - ${m.name}`,
          text: `Silakan unduh atau cetak sertifikat qurban resmi Yayasan Masjid Al-Barkah Manggarai.`,
          files: [file]
        }).then(() => {
          alert("Sertifikat PDF Berhasil Dibagikan!");
        }).catch(() => {
          doc.save(fileName);
          alert("Sertifikat PDF Berhasil Diunduh!");
        });
      } else {
        doc.save(fileName);
        alert("Sertifikat PDF berhasil diunduh secara lokal untuk dibagikan via WhatsApp!");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal membagikan berkas PDF.");
    }
  };

  const handleOpenEdit = (mudhohi: Mudhohi) => {
    setSelectedMudhohi(mudhohi);
    setFormName(mudhohi.name);
    setFormPhone(mudhohi.phone);
    setFormEmail(mudhohi.email || "");
    setFormType(mudhohi.type_hewan);
    setFormNominal(mudhohi.nominal_patungan);
    setFormBayar(mudhohi.total_pembayaran);
    setIsEditOpen(true);
  };

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      alert("Nama dan No. WhatsApp wajib diisi!");
      return;
    }
    onAddMudhohi({
      name: formName,
      phone: formPhone,
      email: formEmail,
      type_hewan: formType,
      detail_qurban: formType === "Sapi (Patungan)" ? `Patungan Sapi (${formBreed})` : `${formBreed} (${formType === "Kambing" ? "Kambing" : "Sapi Mandiri"})`,
      nominal_patungan: Number(formNominal),
      total_pembayaran: Number(formBayar),
      breed: formBreed,
      description: formDescription
    });
    // reset form
    setFormName("");
    setFormPhone("");
    setFormEmail("");
    setIsAddOpen(false);
  };

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMudhohi) return;
    onUpdateMudhohi(selectedMudhohi.id, {
      name: formName,
      phone: formPhone,
      email: formEmail,
      type_hewan: formType,
      nominal_patungan: Number(formNominal),
      total_pembayaran: Number(formBayar)
    });
    setIsEditOpen(false);
    setSelectedMudhohi(null);
  };

  // Filter list
  const filteredMudhohi = mudhohiList.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.phone.includes(searchTerm) || 
                          (m.email && m.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "" || m.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Mudhohi pagination bounds
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredMudhohi.length / itemsPerPage);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages || 1);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedMudhohi = filteredMudhohi.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Top action header and switches */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab("daftar")}
            className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "daftar" 
                ? "bg-emerald-800 text-white shadow-sm" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Daftar Mudhohi Jemaah
          </button>
          <button 
            onClick={() => setActiveTab("patungan")}
            className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "patungan" 
                ? "bg-emerald-800 text-white shadow-sm" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Sistem Patungan Sapi Qurban
          </button>
        </div>

        <button 
          onClick={() => {
            handleTypeChange("Sapi (Patungan)");
            setIsAddOpen(true);
          }}
          className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white hover:scale-102 hover:shadow h-10 px-4 text-xs font-semibold transition-all shadow-sm"
        >
          <Plus size={16} />
          <span>Tambah Mudhohi Baru</span>
        </button>
      </div>

      {activeTab === "daftar" ? (
        <>
          {/* Main mudhohi directory card list */}
          <div className="rounded-[24px] bg-white p-6 shadow-sm border border-gray-100 space-y-5">
            {/* Filtering bar */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Cari nama jemaah, nomor WA, atau email..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-xs font-sans text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 bg-gray-50/50"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter size={14} className="text-gray-400" />
                <span className="text-xs font-semibold text-gray-500">Filter Status:</span>
                <select 
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="">Semua Status</option>
                  <option value="Lunas">Lunas</option>
                  <option value="Belum Lunas">Belum Lunas</option>
                </select>
              </div>
            </div>

            {/* List Table Grid or Empty view */}
            {filteredMudhohi.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm font-semibold text-gray-400">Tidak ada qurban mudhohi ditemukan sesuai kriteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="min-w-full divide-y divide-gray-100 text-left text-xs font-sans">
                    <thead className="bg-gray-50/75 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                      <tr>
                        <th className="px-5 py-4">Informasi Mudhohi</th>
                        <th className="px-5 py-4">Tipe Hewan</th>
                        <th className="px-5 py-4">Total Rincian Saham</th>
                        <th className="px-5 py-4 text-center">Status Bayar</th>
                        <th className="px-5 py-4 text-center">Notifikasi WhatsApp</th>
                        <th className="px-5 py-4 text-right">Aksi Operasional</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white font-medium text-gray-700">
                      {paginatedMudhohi.map((m) => {
                        const percentage = Math.min(100, Math.round((m.total_pembayaran / m.nominal_patungan) * 100));
                        return (
                          <tr key={m.id} className="hover:bg-gray-50/80 transition-all">
                            {/* Profile */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-100">
                                  {m.name.charAt(0)}
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-950 font-sans">{m.name}</h4>
                                  <span className="text-[10px] text-gray-400 font-mono block mt-0.5">{m.phone}</span>
                                </div>
                              </div>
                            </td>
                            {/* Animal choice */}
                            <td className="px-5 py-4">
                              <span className={`inline-block rounded-lg px-2.5 py-1 text-[10px] font-bold ${
                                m.type_hewan.includes("Sapi") 
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-100" 
                                  : "bg-teal-50 text-teal-800 border border-teal-100"
                              }`}>
                                {m.type_hewan}
                              </span>
                              <span className="block text-[10px] text-gray-400 mt-1 max-w-[150px] truncate">{m.detail_qurban}</span>
                            </td>
                            {/* Money rincian */}
                            <td className="px-5 py-4 text-gray-900 font-bold">
                              <div>Rp {m.total_pembayaran.toLocaleString('id-ID')}</div>
                              <span className="text-[10px] font-semibold text-gray-400">Target: Rp {m.nominal_patungan.toLocaleString('id-ID')}</span>
                            </td>
                            {/* Payment progress */}
                            <td className="px-5 py-4">
                              <div className="flex flex-col items-center">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold ${
                                  m.payment_status === "Lunas" 
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}>
                                  {m.payment_status === "Lunas" ? <CheckCircle size={10} /> : <Clock size={10} />}
                                  {m.payment_status}
                                </span>
                                {m.payment_status !== "Lunas" && (
                                  <div className="mt-1 w-20 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-red-500 h-full" style={{ width: `${percentage}%` }} />
                                  </div>
                                )}
                              </div>
                            </td>
                            {/* Dispatch Notification button list */}
                            <td className="px-5 py-4">
                              <div className="flex flex-col gap-1 items-center">
                                <button 
                                  onClick={() => onSendWhatsappSimulate(m.id, m.payment_status === "Lunas" ? "whatsapp_lunas" : "whatsapp_reminder")}
                                  className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[9px] font-extrabold text-emerald-800 hover:bg-emerald-100 transition-all cursor-pointer"
                                >
                                  <Smartphone size={10} />
                                  <span>Kirim WA {m.payment_status === "Lunas" ? "Syukron" : "Remind"}</span>
                                </button>
                              </div>
                            </td>
                            {/* Actions */}
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-2 text-right">
                                <button 
                                  onClick={() => handleOpenCertificate(m)}
                                  className="inline-flex rounded-lg border border-amber-200 bg-amber-50 p-2 text-amber-700 hover:bg-amber-100 transition-all cursor-pointer"
                                  title="Sertifikat Qurban"
                                >
                                  <Award size={14} />
                                </button>
                                <button 
                                  onClick={() => handleOpenEdit(m)}
                                  className="inline-flex rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50 hover:text-emerald-800 transition-all cursor-pointer"
                                  title="Edit Mudhohi"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button 
                                  onClick={() => {
                                    if (confirm(`Yakin ingin menghapus qurban atas nama ${m.name}? Semua data kolompok & pembayaran terkait akan diupdate.`)) {
                                      onDeleteMudhohi(m.id);
                                    }
                                  }}
                                  className="inline-flex rounded-lg border border-red-200 bg-red-50 p-2 text-red-700 hover:bg-red-100 transition-all cursor-pointer"
                                  title="Hapus Mudhohi"
                                >
                                  <Trash2 size={14} />
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
                      <span className="font-bold text-gray-700">{Math.min(startIndex + itemsPerPage, filteredMudhohi.length)}</span> dari{" "}
                      <span className="font-bold text-gray-700">{filteredMudhohi.length}</span> jemaah mudhohi
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
        </>
      ) : (
        /* Joint-venture Sapi groups container representation */
        <div className="space-y-6">
          <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
            <h3 className="text-md font-bold text-gray-950">Sistem Patungan Sapi Qurban (Kolektif 7 Jemaah)</h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Sesuai kaidah Fikih syariah, seekor sapi diperkenankan dipatungkan secara kolektif maksimal oleh 7 jemaah qurban. Sistem asisten cerdas Qurban App akan mengelompokkan jemaah pendaftar patungan sapi secara otomatis berurutan sesuai kuota kelompok.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {kelompokList.map((kel) => {
              const assignedAnimal = hewanList.find(h => h.group_id === kel.id);
              return (
                <div key={kel.id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                  {/* Card head bar */}
                  <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                    <div>
                      <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wide">{kel.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">Kode Sapi: <span className="font-bold text-gray-700">{assignedAnimal ? assignedAnimal.code : "Menunggu Alokasi"}</span></p>
                    </div>
                    <div className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800 border border-emerald-100">
                      Aktif ({kel.members_count} / {kel.max_quota})
                    </div>
                  </div>

                  {/* Progressive Meter bar of joint slots filled */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 mb-1">
                      <span>Progres Kelompok</span>
                      <span>{Math.round((kel.members_count/7)*100)}% Terisi</span>
                    </div>
                    <div className="w-full bg-gray-150 h-2 rounded-full overflow-hidden flex gap-0.5">
                      {[...Array(7)].map((_, i) => (
                        <div key={i} className={`flex-1 h-full ${i < kel.members_count ? "bg-emerald-600" : "bg-gray-200"}`} />
                      ))}
                    </div>
                  </div>

                  {/* List of slots of 7 people */}
                  <div className="space-y-1.5 pt-1.5">
                    {[...Array(7)].map((_, index) => {
                      const memberId = kel.list_members[index];
                      const memberData = memberId ? mudhohiList.find(m => m.id === memberId) : null;
                      
                      return (
                        <div key={index} className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold ${
                          memberData ? "bg-emerald-50/40 text-gray-900 border border-emerald-100/50" : "bg-gray-50/50 text-gray-400 border border-dashed border-gray-200"
                        }`}>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center ${
                              memberData ? "bg-emerald-800 text-white" : "bg-gray-200 text-gray-400"
                            }`}>{index + 1}</span>
                            <span className="truncate max-w-[150px]">{memberData ? memberData.name : "(Slot Kosong)"}</span>
                          </div>
                          {memberData && (
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                              memberData.payment_status === "Lunas" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}>{memberData.payment_status === "Lunas" ? "Lunas" : "DP"}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL DIALOGS OF THE APPLICATION MUDHOHI */}

      {/* Add Mudhohi Modal Container */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 overflow-y-auto max-h-[90vh]">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-md font-bold text-gray-950 font-sans">Pendaftaran Jemaah Mudhohi</h3>
              <button onClick={() => setIsAddOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">✕</button>
            </div>
            
            <form onSubmit={submitAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Jemaah (Mudhohi) *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Pak H. Budi Mulyono"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nomor WhatsApp *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: 0812XXXXXXXX"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email (Opsional)</label>
                  <input 
                    type="email" 
                    placeholder="budi@domain.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Pilihan Hewan Qurban * (Slot & Presensi)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: "Sapi (Patungan)", label: "Patungan Sapi", count: countPatungan, max: maxPatungan },
                    { val: "Sapi (Mandiri)", label: "Sapi Mandiri", count: countMandiri, max: maxMandiri },
                    { val: "Kambing", label: "Kambing", count: countKambing, max: maxKambing }
                  ].map((x) => {
                    const isFull = x.count >= x.max;
                    return (
                      <button
                        key={x.val}
                        type="button"
                        disabled={isFull}
                        onClick={() => handleTypeChange(x.val)}
                        className={`rounded-xl border py-2 text-xs font-extrabold transition-all relative ${
                          isFull
                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                            : formType === x.val 
                            ? "bg-emerald-800 text-white border-emerald-950 shadow-sm"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 cursor-pointer"
                        }`}
                        title={isFull ? "Kuota tipe hewan ini telah penuh!" : ""}
                      >
                        <div className="text-center">
                          <span>{x.label}</span>
                          <span className="block text-[8px] font-semibold mt-0.5 opacity-80">
                            {isFull ? "PENUH" : `${x.count}/${x.max} Slot`}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Breed Selector depending on general animal category */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Pilihan Jenis / Paket Ras Qurban *</label>
                <select
                  value={formBreed}
                  onChange={(e) => {
                    const selectedName = e.target.value;
                    setFormBreed(selectedName);
                    const selectedObj = ANIMAL_BREEDS[formType as keyof typeof ANIMAL_BREEDS]?.find(b => b.breed === selectedName);
                    if (selectedObj) {
                      setFormNominal(selectedObj.nominal);
                      setFormBayar(selectedObj.nominal);
                      setFormDescription(selectedObj.description);
                    }
                  }}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700 font-bold bg-white text-gray-850"
                >
                  {(ANIMAL_BREEDS[formType as keyof typeof ANIMAL_BREEDS] || []).map((b) => (
                    <option key={b.breed} value={b.breed} className="font-semibold text-gray-800">
                      {b.breed} - Rp {b.nominal.toLocaleString("id-ID")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Detailed animal descriptions displaying live on screen */}
              <div className="rounded-2xl border border-teal-100 bg-teal-50/50 p-4 space-y-2">
                <span className="text-[10px] font-black uppercase text-teal-850 tracking-wider">Deskripsi Fisik & Kelebihan Syar'i:</span>
                <p className="text-[11px] leading-relaxed text-teal-900 font-sans font-medium whitespace-pre-wrap">
                  {formDescription}
                </p>
                <div className="flex justify-between items-center text-[9px] font-bold text-teal-700 pt-1 border-t border-teal-100">
                  <span>Standard Bobot Hidup: ~{
                    formType === "Kambing" 
                      ? (formBreed === "Kambing Etawa Jumbo" ? "48-55" : "35-42") 
                      : (formBreed === "Sapi Limosin Super" ? "800-900" : "380-450")
                  } Kg</span>
                  <span>100% Bebas Penyakit & Cacat</span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Biaya / Harga Saham (Rp)</label>
                  <input 
                    type="number" 
                    required
                    value={formNominal}
                    onChange={(e) => setFormNominal(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Jumlah Bayar Awal (Rp)</label>
                  <input 
                    type="number" 
                    required
                    value={formBayar}
                    onChange={(e) => setFormBayar(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700 font-bold text-emerald-800"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">Wajib sama dengan harga jika ingin LUNAS langsung.</span>
                </div>
              </div>

              <div className="rounded-xl bg-orange-50 p-3 border border-orange-100 text-[10px] text-orange-850 space-y-1">
                <p className="font-bold">Informasi Penting Syariah:</p>
                <p>Jemaah yang memilih Patungan Sapi akan otomatis diurutkan masuk ke Kelompok Sapi beranggotakan 7 orang yang masih terbuka.</p>
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
                  Daftarkan & Kirim Notif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Mudhohi modal */}
      {isEditOpen && selectedMudhohi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 overflow-y-auto max-h-[90vh]">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-md font-bold text-gray-950 font-sans">Ubah Data Mudhohi</h3>
              <button onClick={() => { setIsEditOpen(false); setSelectedMudhohi(null); }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">✕</button>
            </div>
            
            <form onSubmit={submitEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Jemaah (Mudhohi)</label>
                <input 
                  type="text" 
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nomor WhatsApp</label>
                  <input 
                    type="text" 
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nominal Saham (Rp)</label>
                  <input 
                    type="number" 
                    required
                    value={formNominal}
                    onChange={(e) => setFormNominal(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Jumlah Terbayar (Rp)</label>
                  <input 
                    type="number" 
                    required
                    value={formBayar}
                    onChange={(e) => setFormBayar(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700 font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button 
                  type="button" 
                  onClick={() => { setIsEditOpen(false); setSelectedMudhohi(null); }}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-emerald-900 cursor-pointer shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Qurban Certificate Modal Preview */}
      {isCertificateOpen && selectedMudhohi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl rounded-3xl bg-amber-50/20 p-6 shadow-2xl border border-amber-500/30 overflow-y-auto max-h-[90vh]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-md font-bold text-amber-100 font-sans">Sertifikat Qurban Digital</h3>
              <button 
                onClick={() => { setIsCertificateOpen(false); setSelectedMudhohi(null); }} 
                className="rounded-lg bg-emerald-900/60 p-1.5 text-amber-300 hover:bg-emerald-800"
              >
                ✕
              </button>
            </div>

            {/* Certificate visual box layout (Traditional Islamic ornaments look) */}
            <div className="relative border-8 border-double border-amber-600 bg-[#0d2217] p-8 text-center text-white rounded-2xl shadow-inner overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,45,30,0.8)_0%,rgba(5,15,10,0.95)_100%)] pointer-events-none" />
              
              {/* Decorative arabesque border simulation */}
              <div className="relative space-y-6 z-10 select-none">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 border-2 border-amber-500 text-amber-400">
                  <Award size={32} />
                </div>

                <div className="space-y-1">
                  <h2 className="font-serif text-amber-400 text-lg md:text-xl font-bold tracking-wider uppercase">Sertifikat Qurban Digital</h2>
                  <p className="text-[9px] uppercase tracking-widest text-[#9ae3b8] font-semibold">Tahun Qurban 1447 H / 2026 M</p>
                </div>

                <p className="font-serif text-[11px] italic text-emerald-100 max-w-md mx-auto leading-relaxed">
                  "Daging unta, sapi dan kambing itu tidak dapat mencapai keridhaan Allah, tetapi ketakwaan darimulahlah yang mencapainya..." (QS. Al-Hajj: 37)
                </p>

                <div className="py-2.5 border-y border-dashed border-amber-600/30 max-w-xs mx-auto">
                  <p className="text-[10px] text-gray-300">Diberikan secara takzim kepada:</p>
                  <h3 className="text-lg font-black text-amber-300 mt-1 font-sans">{selectedMudhohi.name}</h3>
                  <span className="inline-block text-[9px] font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 text-amber-400 mt-1 uppercase tracking-wider">{selectedMudhohi.id}</span>
                </div>

                <div className="space-y-1 max-w-md mx-auto text-xs text-center">
                  <p className="text-gray-300">
                    Warga / Panitia Masjid Al-Barkah Manggarai menyatakan bahwa yang bersangkutan telah menunaikan ibadah qurban berupa:
                  </p>
                  <p className="font-black text-white text-md mt-1 font-sans text-emerald-300">
                    {selectedMudhohi.type_hewan === "Kambing" ? "1 Ekor Kambing" : "1/7 Saham Sapi Kolektif"} ({selectedMudhohi.type_hewan})
                  </p>
                </div>

                {/* Lower grid area containing custom QR and sign area */}
                <div className="grid grid-cols-2 gap-4 items-center pt-4 max-w-sm mx-auto">
                  {/* QR Image */}
                  <div className="text-center flex flex-col items-center">
                    {certQrUrl ? (
                      <img src={certQrUrl} alt="QR Token Code" className="w-24 h-24 rounded border-2 border-amber-500 bg-white p-1" />
                    ) : (
                      <div className="w-24 h-24 bg-white/10 rounded flex items-center justify-center">Loading QR...</div>
                    )}
                    <span className="text-[9px] text-[#9ae3b8] mt-1 font-mono tracking-wide uppercase">Scan Verifikasi</span>
                  </div>

                  {/* Chief Sign */}
                  <div className="text-center space-y-6">
                    <p className="text-[10px] text-gray-400">Jakarta, 26 Mei 2026</p>
                    <div className="font-serif text-amber-400 text-xs italic font-semibold border-b border-gray-100/30 pb-1 max-w-[120px] mx-auto">
                      Ust. Ahmad Fauzi
                    </div>
                    <p className="text-[9px] text-gray-300">Ketua Panitia Qurban</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2 justify-center">
              <button 
                onClick={() => handlePrintCertificate(selectedMudhohi)}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 text-emerald-950 px-5 py-2.5 text-xs font-black hover:bg-amber-400 cursor-pointer shadow-sm"
              >
                <FileText size={14} />
                <span>Cetak Sertifikat Jemaah</span>
              </button>
              <button 
                onClick={() => handleShareCertificate(selectedMudhohi)}
                className="flex items-center gap-1.5 rounded-xl border border-[#2d5c41] bg-black/20 text-emerald-100 px-4 py-2.5 text-xs font-semibold hover:bg-black/40 cursor-pointer"
              >
                <Share2 size={12} />
                <span>Bagikan (Share)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
