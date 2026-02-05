"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Filter, CalendarCheck, Search, X } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function JimpitanBulanan() {
  const upsertJimpitan = useMutation(api.jimpitan.upsertJimpitan);
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;
  const todayDate = now.getDate();
  const { user } = useUser();
  const currentUser = useQuery(api.users.getUserByClerkId, { 
    clerkId: user?.id ?? "" 
  });
  
  // States
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedRT, setSelectedRT] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState(""); // State baru untuk pencarian
  const [focusDay, setFocusDay] = useState<number | "all">("all");
  const [editingCell, setEditingCell] = useState<{wargaId: string, day: number} | null>(null);
  
  const data = useQuery(api.jimpitan.getJimpitanBulanan, { bulan: selectedMonth });

  const getBulanSebelumnya = (currentMonthStr: string) => {
    const [year, month] = currentMonthStr.split("-").map(Number);
    const date = new Date(year, month - 2, 1); // month-2 karena Date menggunakan 0-indexed dan kita ingin mundur 1 bulan
    return date.toISOString().slice(0, 7);
  };
  
  const bulanSebelumnya = getBulanSebelumnya(selectedMonth);
  const dataSaldo = useQuery(api.jimpitan.getSaldoBulanLalu, { bulan: bulanSebelumnya });

  // Logic: Ambil daftar RT unik
  const listRT = useMemo(() => {
    if (!data?.warga) return [];
    return Array.from(new Set(data.warga.map((w) => w.rt))).sort();
  }, [data?.warga]);

  if (!data) return <p className="p-10 text-center text-slate-500">Memuat data...</p>;

  const { warga, dataJimpitan } = data;
  const [year, month] = selectedMonth.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  
  const visibleDays = focusDay === "all" 
    ? Array.from({ length: daysInMonth }, (_, i) => i + 1) 
    : [focusDay];

  // LOGIKA FILTER: RT + Pencarian Nama
  const filteredWarga = warga.filter(w => {
    const matchRT = selectedRT === "all" || w.rt === selectedRT;
    const matchSearch = w.nama.toLowerCase().includes(searchTerm.toLowerCase());
    return matchRT && matchSearch;
  });

  const handleSave = async (wargaId: any, day: number, value: string) => {
    // 1. Validasi petugas
    if (!currentUser) return alert("Petugas tidak ditemukan");
  
    // 2. Konversi value string ke number
    const jumlah = Number(value);
    if (isNaN(jumlah) || jumlah < 0) return setEditingCell(null);
  
    // 3. Buat format tanggal (Sesuaikan dengan yearMonth yang aktif di state Anda)
    const tanggal = `${selectedMonth}-${String(day).padStart(2, "0")}`;
  
    try {
      await upsertJimpitan({
        wargaId,
        jumlah,
        tanggal,
        petugasId: currentUser._id, // ID asli dari Convex
      });
      
      // Reset state editing setelah berhasil
      setEditingCell(null);
    } catch (error) {
      console.error("Gagal menyimpan:", error);
      alert("Gagal menyimpan data.");
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* TOOLBAR FILTER */}
      <div className="flex flex-wrap items-end gap-3 bg-white p-4 rounded-xl border shadow-sm">
        
        {/* Filter Periode */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
            <CalendarCheck className="w-3 h-3" /> Periode
          </label>
          <Input 
            type="month" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-36 h-9 text-sm"
          />
        </div>

        {/* Filter RT */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
            <Filter className="w-3 h-3" /> RT
          </label>
          <Select value={selectedRT} onValueChange={setSelectedRT}>
            <SelectTrigger className="w-24 h-9 text-sm">
              <SelectValue placeholder="RT" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              {listRT.map(rt => (
                <SelectItem key={rt} value={rt}>RT {rt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pencarian Nama - FITUR BARU */}
        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
            <Search className="w-3 h-3" /> Cari Warga
          </label>
          <div className="relative">
            <Input 
              placeholder="Masukkan nama warga..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-8 pr-8 text-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant={focusDay === todayDate ? "default" : "outline"} 
            size="sm"
            onClick={() => setFocusDay(focusDay === todayDate ? "all" : todayDate)}
            className="h-9 text-xs"
          >
            {focusDay === todayDate ? "Semua Tanggal" : "Hari Ini"}
          </Button>
        </div>
      </div>

      {/* TABEL */}
      <div className="overflow-x-auto border rounded-xl shadow-md bg-white">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600">
              <th className="border-b border-r p-3 sticky left-0 bg-slate-50 z-20 w-48 text-left">Nama Warga</th>
              <th className="border-b border-r p-2 text-center w-16">RT/RW</th>
              <th className="border-b border-r p-2 text-center w-16">Saldo Awal</th>
              {visibleDays.map((day) => (
                <th key={day} className={`border-b border-r p-1 min-w-[45px] text-center font-bold ${day === todayDate ? 'bg-orange-100 text-orange-700' : ''}`}>
                  {day}
                </th>
              ))}
              <th className="border-b p-3 bg-blue-50 sticky right-0 z-20 text-blue-700">Total</th>
            </tr>
          </thead>
          <tbody>
            {filteredWarga.length > 0 ? (
              filteredWarga.map((w) => {
                const saldoWarga = dataSaldo?.find(s => s.wargaId === w._id)?.jumlah || 0;
                const totalPerWarga = dataJimpitan
                  .filter(j => j.wargaId === w._id)
                  .reduce((acc, curr) => acc + curr.jumlah, 0);

                return (
                  <tr key={w._id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="border-b border-r p-3 sticky left-0 bg-white font-medium z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      {w.nama}
                      <div className="text-[10px] text-slate-400 font-normal uppercase">RT {w.rt} - No.{w.noRumah}</div>
                    </td>
                    <td className="border-b border-r p-2 text-center text-slate-500">
                      {w.rt}/{w.rw}
                    </td>
                    <td className={`border-b border-r p-2 text-center font-bold bg-slate-50 ${saldoWarga < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {saldoWarga.toLocaleString()}
                    </td>
                    {visibleDays.map((day) => {
                      const tglString = `${selectedMonth}-${day.toString().padStart(2, '0')}`;
                      const record = dataJimpitan.find(j => j.wargaId === w._id && j.tanggal === tglString);
                      const jumlah = record?.jumlah || 0;
                      const isEditing = editingCell?.wargaId === w._id && editingCell?.day === day;

                      return (
                        <td 
                          key={day} 
                          className={`border-b border-r p-0 text-center cursor-pointer transition-all 
                            ${day === todayDate ? 'bg-orange-50/30' : ''} 
                            ${jumlah > 0 ? 'bg-green-50/50' : ''}`}
                          onClick={() => setEditingCell({ wargaId: w._id, day })}
                        >
                          {isEditing ? (
                            <input
                              autoFocus
                              className="w-full h-10 p-1 text-center bg-white outline-blue-500 border-2 border-blue-500"
                              defaultValue={jumlah || ""}
                              // Menggunakan currentTarget untuk mendapatkan value input
                              onBlur={(e) => handleSave(w._id, day, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSave(w._id, day, e.currentTarget.value);
                                }
                                if (e.key === 'Escape') {
                                  setEditingCell(null);
                                }
                              }}
                            />
                          ) : (
                            <span className={jumlah > 0 ? "text-green-700 font-bold" : "text-slate-300"}>
                              {/* Menampilkan dalam ribuan agar tabel tetap ringkas */}
                              {jumlah > 0 ? (jumlah / 1000).toLocaleString() : "0"}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  <td className="border-b p-3 bg-blue-50 font-bold text-center sticky right-0 z-10 text-blue-800 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    {(saldoWarga + totalPerWarga).toLocaleString()}
                  </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={visibleDays.length + 3} className="p-10 text-center text-slate-400 italic">
                  Warga tidak ditemukan...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}