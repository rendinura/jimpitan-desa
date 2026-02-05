"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileUp, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2,
  Table as TableIcon,
  FileDown
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PreviewState {
  transaksi: any[];
  saldo: any[];
}

export default function ImportJimpitanExcel() {
  // State previewData diinisialisasi sebagai objek dengan array kosong
  const [previewData, setPreviewData] = useState<PreviewState>({ transaksi: [], saldo: [] });
  const [uploading, setUploading] = useState(false);
  
  const currentPeriod = new Date().toISOString().slice(0, 7); 
  const [yearMonth, setYearMonth] = useState(currentPeriod);
  
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteByMonth = useMutation(api.jimpitan.deleteJimpitanByMonth);
  const importMutation = useMutation(api.jimpitan.importJimpitanBulanan);

  // Fungsi pembantu untuk mendapatkan bulan sebelumnya (YYYY-MM)
  const getPrevMonth = (yearMonthStr: string) => {
    const [y, m] = yearMonthStr.split("-").map(Number);
    const date = new Date(y, m - 2, 1);
    return date.toISOString().slice(0, 7);
  };

  const handleFilePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[];
      
      const prevMonthStr = getPrevMonth(yearMonth);
      const results: any[] = [];
      const saldoAwalData: any[] = [];
      
      // Parsing data mulai dari baris ke-4 (index 3) sesuai template
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || !row[1]) continue; // Skip jika baris atau nama kosong
      
        const noRumah = String(row[0] || "");
        const namaWarga = String(row[1] || "");
        const rt = String(row[2] || "");
        
        // Membersihkan data numerik dari format "Rp 1.500" atau "Rp -"
        const parseAmount = (val: any) => {
          if (typeof val === 'number') return val;
          if (typeof val === 'string') {
            const clean = val.replace(/[^0-9-]/g, "");
            return clean ? parseInt(clean, 10) : 0;
          }
          return 0;
        };
  
        // 1. Ambil Saldo Sisa (Kolom D / Index 2)
        const saldoSisa = parseAmount(row[3]);
        saldoAwalData.push({
          namaWarga,
          noRumah,
          rt,
          jumlah: isNaN(saldoSisa) ? 0 : saldoSisa,
          bulan: prevMonthStr
        });
      
        // 2. Ambil Transaksi Harian (Kolom E s/d AI / Index 3-33)
        for (let t = 1; t <= 31; t++) {
          const rawVal = row[t + 3];
          const jumlahVal = parseAmount(rawVal);
  
          if (jumlahVal > 0) {
            results.push({
              namaWarga,
              noRumah,
              rt,
              tanggal: `${yearMonth}-${String(t).padStart(2, "0")}`,
              jumlah: jumlahVal
            });
          }
        }
      }
      // Update state dengan objek yang berisi dua array
      setPreviewData({ transaksi: results, saldo: saldoAwalData });
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = async () => {
    if (previewData.transaksi.length === 0 && previewData.saldo.length === 0) return;
    
    setUploading(true);
    try {
      // Mengirimkan objek transaksi dan saldo sesuai validator backend
      await importMutation({ 
        transaksi: previewData.transaksi, 
        saldoBulanLalu: previewData.saldo
      });
      
      alert(`Berhasil mengimport data jimpitan dan saldo!`);
      setPreviewData({ transaksi: [], saldo: [] }); 
    } catch (err) {
      console.error(err);
      alert("Gagal mengimport data. Pastikan koneksi server stabil.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMonthData = async () => {
    if (!confirm(`Hapus permanen semua data bulan ${yearMonth}?`)) return;
    setIsDeleting(true);
    try {
      const count = await deleteByMonth({ yearMonth });
      alert(`Berhasil menghapus ${count} data.`);
    } catch (err) {
      alert("Gagal menghapus data.");
    } finally {
      setIsDeleting(false);
    }
  };

  const downloadTemplate = () => {
    const header = [["No Rumah", "Nama Warga", "RT", "Saldo Sisa", ...Array.from({length: 31}, (_, i) => i + 1)]];
    const ws = XLSX.utils.aoa_to_sheet(header);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Jimpitan");
    XLSX.writeFile(wb, `Template_Jimpitan_${yearMonth}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* SEKSI UPLOAD */}
      <Card className="p-6 shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-semibold text-slate-700">Pilih Periode & File Excel</label>
            <div className="flex gap-2">
              <Input 
                type="month" 
                value={yearMonth} 
                onChange={(e) => setYearMonth(e.target.value)} 
                className="w-44 h-10"
              />
              <Input type="file" accept=".xlsx, .xls" onChange={handleFilePreview} className="h-10" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadTemplate} className="h-10">
              <FileDown className="w-4 h-4 mr-2" /> Template
            </Button>
            {previewData.transaksi.length > 0 && (
              <Button variant="destructive" onClick={() => setPreviewData({ transaksi: [], saldo: [] })} className="h-10">
                <Trash2 className="w-4 h-4 mr-2" /> Batal
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* SEKSI PREVIEW */}
      {previewData.transaksi.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/30 overflow-hidden shadow-md">
          <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TableIcon className="w-5 h-5" />
              <span className="font-bold">Preview: {previewData.transaksi.length} Transaksi & {previewData.saldo.length} Saldo</span>
            </div>
            <Button 
              onClick={handleConfirmImport} 
              disabled={uploading}
              className="bg-white text-blue-600 hover:bg-blue-50 font-bold border-none"
            >
              {uploading ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <CheckCircle2 className="mr-2 w-4 h-4" />}
              Konfirmasi & Simpan
            </Button>
          </div>
          
          <div className="max-h-[500px] overflow-auto bg-white">
            <Table>
              <TableHeader className="bg-slate-50 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-1/3">Warga / No.Rumah</TableHead>
                  <TableHead className="text-center">Sisa Bulan Lalu</TableHead>
                  <TableHead className="text-center">Aktivitas Harian</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.saldo.map((s, idx) => {
                  const activityCount = previewData.transaksi.filter(t => t.noRumah === s.noRumah).length;
                  return (
                    <TableRow key={idx} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="font-bold text-slate-800">{s.namaWarga}</div>
                        <div className="text-[10px] text-slate-500 font-mono">NO. RUMAH: {s.noRumah}</div>
                      </TableCell>
                      <TableCell className={cn(
                        "text-center font-mono font-bold",
                        s.jumlah < 0 ? "text-red-600" : "text-green-600"
                      )}>
                        Rp {s.jumlah.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {activityCount} Hari Terisi
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* ZONA BAHAYA */}
      <div className="p-4 border border-red-200 bg-red-50 rounded-xl flex items-center justify-between hidden">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-500 w-5 h-5" />
            <div>
              <div className="text-sm font-bold text-red-700">Zona Bahaya</div>
              <div className="text-xs text-red-600">
                Gunakan ini jika terjadi kesalahan fatal pada import bulan {yearMonth}.
              </div>
            </div>
          </div>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDeleteMonthData}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
            Hapus Data {yearMonth}
          </Button>
        </div>
    </div>
  );
}