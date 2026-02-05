"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Printer, Loader2, Search, Filter, X } from "lucide-react";
import { FormJimpitanWarga } from "@/components/form-cetak";
import { Input } from "@/components/ui/input";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function GenerateFormPage() {
  // 1. Ambil data warga dan saldo secara bersamaan
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7));
  const [selectedRT, setSelectedRT] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const chunkArray = (arr: any[], size: number) => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );
  };

  const getBulanLalu = (str: string) => {
    const [y, m] = str.split("-").map(Number);
    const date = new Date(y, m - 2, 1);
    return date.toISOString().slice(0, 7);
  };

  const bulanLalu = getBulanLalu(bulan);

  // Ambil semua data yang diperlukan dari backend
  const allUsers = useQuery(api.users.getUsersByRole, { role: "warga" });
  const allSaldos = useQuery(api.jimpitan.getSaldoBulanLalu, { bulan: bulanLalu });

  // 2. Logika Filter (Sama seperti di tabel jimpitan)
  const listRT = useMemo(() => {
    if (!allUsers) return [];
    return Array.from(new Set(allUsers.map((u) => u.rt))).sort();
  }, [allUsers]);

  const filteredData = useMemo(() => {
    if (!allUsers) return [];
    return allUsers
      .filter((w) => {
        const matchRT = selectedRT === "all" || w.rt === selectedRT;
        const matchSearch = w.nama.toLowerCase().includes(searchTerm.toLowerCase());
        return matchRT && matchSearch;
      })
      .map((w) => ({
        ...w,
        saldoAwal: allSaldos?.find((s) => s.wargaId === w._id)?.jumlah || 0,
      }));
  }, [allUsers, allSaldos, selectedRT, searchTerm]);

  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Form_Jimpitan_${selectedRT}_${bulan}`,
  });

  if (!allUsers) return (
    <div className="flex items-center justify-center p-20 italic text-slate-500">
      <Loader2 className="animate-spin mr-2" /> Menyiapkan data warga...
    </div>
  );

  return (
    <div className="p-6">
      {/* TOOLBAR FILTER (print:hidden agar tidak ikut tercetak) */}
      <div className="mb-8 flex flex-wrap gap-4 items-end bg-white p-6 rounded-2xl border shadow-sm print:hidden">
        
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-slate-400">Periode</label>
          <Input 
            type="month" 
            value={bulan} 
            onChange={(e) => setBulan(e.target.value)} 
            className="w-40 h-10"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-slate-400">Filter RT</label>
          <Select value={selectedRT} onValueChange={setSelectedRT}>
            <SelectTrigger className="w-32 h-10">
              <SelectValue placeholder="Semua RT" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua RT</SelectItem>
              {listRT.map((rt) => (
                <SelectItem key={rt} value={rt}>RT {rt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 flex-1 min-w-[250px]">
          <label className="text-[10px] font-bold uppercase text-slate-400">Cari Nama Warga</label>
          <div className="relative">
            <Input 
              placeholder="Ketik nama untuk cetak per orang..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10"
            />
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            {searchTerm && (
              <X 
                className="w-4 h-4 absolute right-3 top-3 text-slate-400 cursor-pointer" 
                onClick={() => setSearchTerm("")} 
              />
            )}
          </div>
        </div>


        <Button 
          onClick={handlePrint} 
          className="bg-blue-600 hover:bg-blue-700 h-10 px-6 font-bold"
          disabled={filteredData.length === 0}
        >
          <Printer className="mr-2 h-4 w-4" /> 
          Cetak {filteredData.length} Form
        </Button>

        {/* Filter RT & Bulan tetap di sini */}
        <Button onClick={handlePrint} className="bg-green-600 h-10 px-6 font-bold">
        <Printer className="mr-2 h-4 w-4" /> 
            Simpan PDF
        </Button>
      </div>

      {/* AREA CETAK */}
    <div ref={contentRef} id="print-area" className="bg-slate-100 p-4 print:p-0 print:bg-white">
        {chunkArray(filteredData, 2).map((pair, pageIdx) => (
            <div 
            key={pageIdx} 
            className="flex flex-row items-stretch bg-white mx-auto shadow-md mb-8 
                        print:shadow-none print:m-0 print:w-[297mm] print:h-[210mm] print:page-break-after-always print:overflow-hidden"
            >
            {pair.map((w, idx) => (
                <div 
                key={w._id} 
                /* flex-1 membagi 297mm menjadi dua bagian sama besar (148.5mm) */
                className="relative flex-1 flex items-center justify-center p-8 box-border
                            border-r border-dashed border-slate-300 print:border-slate-400 last:border-r-0"
                >
                {/* Kontainer Form: Pastikan width bersifat fleksibel atau pas di tengah */}
                <div className="w-full max-w-[135mm] flex items-center justify-center">
                    <FormJimpitanWarga 
                    warga={w} 
                    bulan={bulan} 
                    bulanLalu={bulanLalu} 
                    />
                </div>

                {/* Garis Potong Tengah */}
                {idx === 0 && pair.length > 1 && (
                    <div className="absolute top-0 right-0 bottom-0 z-50 transform translate-x-1/2 flex flex-col justify-between items-center py-4 pointer-events-none">
                    <span className="text-[12px] bg-white px-1">✂️</span>
                    <div className="flex-1 w-0 border-r-[1px] border-dashed border-slate-500"></div>
                    <span className="text-[12px] bg-white px-1 transform rotate-180">✂️</span>
                    </div>
                )}
                </div>
            ))}
            
            {/* Filler jika ganjil tetap harus flex-1 agar kolom kiri tidak melebar ke kanan */}
            {pair.length === 1 && <div className="flex-1"></div>}
            </div>
        ))}
    </div>
    </div>
  );
}