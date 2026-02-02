"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar, Save, RefreshCw, AlertCircle } from "lucide-react";

export default function SetupRotasiPage() {
  const config = useQuery(api.rotasi.getConfig);
  const update = useMutation(api.rotasi.updateConfig);

  const [date, setDate] = useState("");
  const [total, setTotal] = useState(7);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (config) {
      setDate(config.anchorDate);
      setTotal(config.totalKelompok);
    }
  }, [config]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await update({ anchorDate: date, totalKelompok: total });
      alert({
        title: "Konfigurasi Disimpan",
        description: "Rotasi jimpitan otomatis telah diperbarui.",
      });
    } catch (error) {
      alert({
        variant: "destructive",
        title: "Gagal menyimpan",
        description: "Terjadi kesalahan saat memperbarui data.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="w-5 h-5 text-blue-600" />
            <CardTitle>Inisiasi Rotasi Kontinu</CardTitle>
          </div>
          <CardDescription>
            Atur titik awal perhitungan rotasi kelompok. Perubahan di sini akan mempengaruhi jadwal di semua bulan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex gap-3 text-amber-800 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>
              <strong>Perhatian:</strong> Mengubah Tanggal Acuan akan menggeser seluruh urutan kelompok yang sudah berjalan. Pastikan tanggal ini adalah hari di mana <strong>Kelompok 1</strong> mulai bertugas.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="anchorDate">Tanggal Acuan (Kelompok 1 Mulai)</Label>
            <div className="relative">
              <Input
                id="anchorDate"
                type="date"
                className="pl-10"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalGroup">Jumlah Kelompok dalam Rotasi</Label>
            <Input
              id="totalGroup"
              type="number"
              min="1"
              value={total}
              onChange={(e) => setTotal(parseInt(e.target.value))}
            />
            <p className="text-[10px] text-slate-400 italic">
              *Masukkan jumlah kelompok (7).
            </p>
          </div>

          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700" 
            onClick={handleSave}
            disabled={loading || !date}
          >
            {loading ? "Menyimpan..." : "Simpan Konfigurasi"}
          </Button>
          
          {/* Preview Section */}
            {date && (
            <div className="mt-8 space-y-3 border-t pt-6">
                <h3 className="text-sm font-bold flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Simulasi 7 Hari Pertama:
                </h3>
                <div className="grid grid-cols-1 gap-2">
                {[...Array(7)].map((_, i) => {
                    const simDate = new Date(date);
                    simDate.setDate(simDate.getDate() + i);
                    const tglStr = simDate.toISOString().split('T')[0];
                    
                    // Logika hitung sederhana untuk preview
                    const diff = i; // karena mulai dari anchor date
                    const shift = Math.floor(diff / 7);
                    const groupNum = ((diff + shift) % total) + 1;

                    return (
                    <div key={i} className="flex justify-between p-2 bg-slate-50 rounded border text-xs">
                        <span className="font-mono">{tglStr}</span>
                        <span className="font-bold text-blue-600 uppercase">Kelompok {groupNum}</span>
                    </div>
                    );
                })}
                </div>
            </div>
            )}
        </CardContent>
      </Card>

      {config && (
        <div className="mt-6 p-4 border rounded-lg bg-slate-50 text-xs text-slate-500">
          <h4 className="font-bold mb-1 text-slate-700 uppercase">Status Saat Ini:</h4>
          <p>Sistem dimulai pada: <span className="font-mono text-blue-600">{config.anchorDate}</span></p>
          <p>Siklus Rotasi: <span className="font-mono text-blue-600">{config.totalKelompok} Kelompok</span></p>
        </div>
      )}
    </div>
  );
}