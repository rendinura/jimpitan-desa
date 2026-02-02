"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const petugasHariIni = useQuery(api.rotasi.getPetugasHariIni);
  
  const hariIni = new Intl.DateTimeFormat('id-ID', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }).format(new Date());

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <Card className="border-t-4 border-t-blue-600">
          <CardHeader className="p-3 border-b">
                <CardTitle className="text-sm text-center font-bold">Petugas Hari Ini <br /> {hariIni}</CardTitle>
              </CardHeader>
          <CardContent className="p-4">
            {petugasHariIni === undefined ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
              </div>
            ) : petugasHariIni ? (
              <div className="space-y-4">
                <div>
                  <div className="text-xl font-black text-center text-blue-700 uppercase tracking-tight">
                    {petugasHariIni.namaKelompok}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>Wilayah Tugas: RW {petugasHariIni.rw}</span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 italic text-sm">
                Tidak ada jadwal petugas untuk hari ini.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Anda bisa menambahkan card statistik lainnya di sini nanti */}
      </div>
    </div>
  );
}