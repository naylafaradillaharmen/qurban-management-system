import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Beef, 
  CheckCircle, 
  Play, 
  TrendingUp, 
  User, 
  Award, 
  ChevronRight,
  Calculator,
  Smile,
  Circle,
  Clock,
  Trash2
} from "lucide-react";
import { HewanQurban, Mudhohi } from "../types";

interface HewanTabProps {
  hewanList: HewanQurban[];
  mudhohiList: Mudhohi[];
  onAddHewan: (data: Partial<HewanQurban>) => void;
  onUpdateHewan: (id: string, data: Partial<HewanQurban>) => void;
  onDeleteHewan: (id: string) => void;
}

export default function HewanTab({
  hewanList,
  mudhohiList,
  onAddHewan,
  onUpdateHewan,
  onDeleteHewan
}: HewanTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Add dialog state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formType, setFormType] = useState<"Sapi" | "Kambing">("Sapi");
  const [formWeight, setFormWeight] = useState(400);
  const [formPrice, setFormPrice] = useState(24500000);
  const [formStatus, setFormStatus] = useState<any>("Menunggu");

  // Filter lists
  const filteredHewan = hewanList.filter(h => {
    const matchesSearch = h.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (h.group_id && h.group_id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === "" || h.type === typeFilter;
    const matchesStatus = statusFilter === "" || h.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Hewan pagination bounds
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredHewan.length / itemsPerPage);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages || 1);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedHewan = filteredHewan.slice(startIndex, startIndex + itemsPerPage);

  // Calculate totals
  const totalWeight = hewanList.reduce((sum, h) => sum + h.weight, 0);
  const totalExpenditure = hewanList.reduce((sum, h) => sum + h.price, 0);

  // Status map of Indonesian stages
  const statusLabels = ["Menunggu", "Disembelih", "Dikuliti", "Dibagikan", "Selesai"];
  
  const handleAdvanceStatus = (hewan: HewanQurban) => {
    const currIdx = statusLabels.indexOf(hewan.status);
    const nextStatus = statusLabels[(currIdx + 1) % statusLabels.length];
    onUpdateHewan(hewan.id, { status: nextStatus as any });
  };

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddHewan({
      type: formType,
      weight: Number(formWeight),
      price: Number(formPrice),
      status: formStatus
    });
    setIsAddOpen(false);
    // reset defaults
    setFormWeight(400);
    setFormPrice(24500000);
  };

  return (
    <div className="space-y-6">
      {/* Top statistical summaries for butcher crew */}
      <div className="grid gap-5 sm:grid-cols-3">
        {/* Total physical count */}
        <div className="rounded-[20px] bg-white p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="rounded-xl bg-emerald-50 p-3.5 text-emerald-800">
            <Beef size={22} />
          </div>
          <div>
            <h4 className="text-xl font-black text-gray-900">{hewanList.length} Ekor</h4>
            <p className="text-xs font-semibold text-gray-400 mt-0.5">Fisik Sapi/Kambing di Kandang</p>
          </div>
        </div>

        {/* Estimated Total weight */}
        <div className="rounded-[20px] bg-white p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="rounded-xl bg-teal-50 p-3.5 text-teal-800">
            <Calculator size={22} />
          </div>
          <div>
            <h4 className="text-xl font-black text-gray-900">{totalWeight.toLocaleString('id-ID')} Kg</h4>
            <p className="text-xs font-semibold text-gray-400 mt-0.5">Total Bobot Hidup Bruto</p>
          </div>
        </div>

        {/* Total Price Asset */}
        <div className="rounded-[20px] bg-white p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="rounded-xl bg-amber-50 p-3.5 text-amber-700">
            <TrendingUp size={22} />
          </div>
          <div>
            <h4 className="text-lg font-black text-gray-900">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(totalExpenditure)}</h4>
            <p className="text-xs font-semibold text-gray-400 mt-0.5">Nilai Total Pengadaan Hewan</p>
          </div>
        </div>
      </div>

      {/* Control panel and filters toolbar */}
      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Cari kode hewan (Contoh: SAPI-01)..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-xs font-sans text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 bg-gray-50/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Type filter */}
            <select 
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              <option value="">Semua Jenis</option>
              <option value="Sapi">Sapi</option>
              <option value="Kambing">Kambing</option>
            </select>

            {/* Status filter */}
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              <option value="">Semua Status</option>
              {statusLabels.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <button 
              onClick={() => setIsAddOpen(true)}
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 h-9 px-4 text-xs font-bold text-white transition-all shadow-sm"
            >
              <Plus size={14} />
              <span>Tambah Hewan Qurban</span>
            </button>
          </div>
        </div>

        {/* List of Animals */}
        {filteredHewan.length === 0 ? (
          <div className="py-12 text-center text-gray-450 text-xs font-bold">
            Tidak ada hewan qurban terdaftar yang sesuai filter.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedHewan.map((hewan) => {
                const assignedMembers = mudhohiList.filter(m => hewan.assignees.includes(m.id));
                const currentStepIdx = statusLabels.indexOf(hewan.status);
                
                return (
                  <div key={hewan.id} className="group rounded-3xl border border-gray-100 bg-white p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow relative overflow-hidden">
                    
                    {/* Card upper row */}
                    <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`rounded-xl p-2.5 ${hewan.type === "Sapi" ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : "bg-teal-50 text-teal-800 border border-teal-100"}`}>
                          <Beef size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-gray-950 font-sans">{hewan.code}</h4>
                          <span className="text-[10px] text-gray-400 font-bold block mt-0.5">{hewan.type} • {hewan.weight} Kg</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-gray-400 font-extrabold tracking-tight uppercase">Update:</span>
                        <select 
                          value={hewan.status}
                          onChange={(e) => onUpdateHewan(hewan.id, { status: e.target.value as any })}
                          className={`rounded-xl px-2 py-1 text-[9px] font-extrabold cursor-pointer border border-gray-200 outline-none focus:ring-1 focus:ring-emerald-700 ${
                            hewan.status === "Selesai" ? "bg-green-100 text-green-800" :
                            hewan.status === "Dibagikan" ? "bg-cyan-150 text-cyan-800" :
                            hewan.status === "Dikuliti" ? "bg-blue-100 text-blue-800" :
                            hewan.status === "Disembelih" ? "bg-amber-100 text-amber-800" :
                            "bg-red-100 text-red-800"
                          }`}
                        >
                          {statusLabels.map(s => (
                            <option key={s} value={s} className="bg-white text-gray-950 font-semibold">{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Horizontal steps visual display */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-black text-gray-400">
                        <span>Penyembelihan</span>
                        <span>Selesai</span>
                      </div>
                      {/* Visual bar tracking progress */}
                      <div className="relative flex items-center justify-between w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full bg-emerald-600 transition-all duration-300" 
                          style={{ width: `${(currentStepIdx / (statusLabels.length - 1)) * 100}%` }}
                        />
                      </div>
                      
                      {/* Mini inline status descriptions */}
                      <div className="flex justify-between text-[9px] font-semibold text-gray-400 mt-1">
                        {statusLabels.map((s, idx) => (
                          <span 
                            key={s} 
                            className={`transition-colors duration-200 ${idx === currentStepIdx ? "text-emerald-800 font-black scale-105" : "text-gray-400"}`}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Mudhohi Assignees associated */}
                    <div className="space-y-1.5 pt-1.5">
                      <p className="text-[10px] font-bold text-gray-450 uppercase tracking-widest">Saham Jemaah Mudhohi ({hewan.assignees.length})</p>
                      {assignedMembers.length === 0 ? (
                        <p className="text-[10px] text-gray-400 italic font-medium">Belum ada jemaah yg dialokasikan ke nomor ini.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {assignedMembers.map(m => (
                            <span key={m.id} className="inline-flex items-center gap-1 rounded-lg bg-gray-50 border border-gray-150 p-1 text-[10px] font-bold text-gray-800">
                              <User size={9} className="text-gray-400" />
                              <span>{m.name}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Control update status button */}
                    <div className="border-t border-gray-50 pt-3 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-bold">Harga: Rp {hewan.price.toLocaleString('id-ID')}</span>
                      
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleAdvanceStatus(hewan)}
                          className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-extrabold text-white cursor-pointer shadow-sm transition-all ${
                            hewan.status === "Selesai" 
                              ? "bg-slate-700 hover:bg-slate-800" 
                              : "bg-emerald-800 hover:bg-emerald-950"
                          }`}
                        >
                          <span>Lanjut ke {statusLabels[(currentStepIdx + 1) % statusLabels.length]}</span>
                          <ChevronRight size={12} />
                        </button>

                        <button 
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus data hewan ${hewan.code}?`)) {
                              onDeleteHewan(hewan.id);
                            }
                          }}
                          className="rounded-xl border border-red-200 bg-red-50 p-1.5 text-red-700 hover:bg-red-105 cursor-pointer"
                          title="Hapus hewan"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400 font-medium">
                  Menampilkan <span className="font-bold text-gray-700">{startIndex + 1}</span> sampai{" "}
                  <span className="font-bold text-gray-700">{Math.min(startIndex + itemsPerPage, filteredHewan.length)}</span> dari{" "}
                  <span className="font-bold text-gray-700">{filteredHewan.length}</span> ekor hewan qurban
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

      {/* Add Animal Modal Form */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-100">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-md font-bold text-gray-950 font-sans">Tambah Inventaris Hewan Qurban</h3>
              <button onClick={() => setIsAddOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">✕</button>
            </div>

            <form onSubmit={submitAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Jenis Hewan Qurban</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: "Sapi", label: "Sapi" },
                    { val: "Kambing", label: "Kambing" }
                  ].map((x) => (
                    <button
                      key={x.val}
                      type="button"
                      onClick={() => {
                        setFormType(x.val as any);
                        if (x.val === "Sapi") {
                          setFormWeight(400);
                          setFormPrice(24500000);
                        } else {
                          setFormWeight(40);
                          setFormPrice(3200000);
                        }
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
                <label className="block text-xs font-bold text-gray-700 mb-1">Bobot / Berat Hidup Estimasi (Kg)</label>
                <input 
                  type="number" 
                  required
                  value={formWeight}
                  onChange={(e) => setFormWeight(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Harga Beli Pengadaan (Rp)</label>
                <input 
                  type="number" 
                  required
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700 font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Status Awal</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  {statusLabels.map(s => (
                    <option key={s} value={s}>{s}</option>
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
                  Simpan Hewan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
