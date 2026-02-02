"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import * as XLSX from 'xlsx';

export default function RotasiPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const rotasi = useQuery(api.rotasi.getSemuaRotasi, { bulan: selectedMonth });

  const handleExport = () => {
    if (!rotasi) return;
    
    const dataExport = rotasi.map(r => ({
      Tanggal: r.fullDate,
      Hari: r.namaHari,
      Petugas: r.kelompok?.namaKelompok || "-"
    }));

    const ws = XLSX.utils.json_to_sheet(dataExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Jadwal Jimpitan");
    XLSX.writeFile(wb, `Jadwal_Jimpitan_${selectedMonth}.xlsx`);
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Rotasi Jadwal Jimpitan</h1>
          <p className="text-slate-500">Jadwal full selama satu bulan petugas jimpitan.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month Picker */}
          <Input 
            type="month" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-40"
          />
          
          <Button onClick={handleExport} variant="outline" className="flex gap-2">
            <Download className="w-4 h-4" /> Export Excel
          </Button>
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 text-left">Hari</th>
              <th className="p-4 text-center">Tanggal</th>
              <th className="p-4 text-right">Kelompok Bertugas</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rotasi?.map((r) => (
              <tr key={r.fullDate} className="hover:bg-slate-50">
                <td className="p-4">
                  <span className="font-bold">{r.namaHari}</span>
                </td>
                <td align="center">
                  <span className="font-bold">{r.tanggal}</span>
                </td>
                <td className="p-4 text-right">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">
                    {r.kelompok?.namaKelompok}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}