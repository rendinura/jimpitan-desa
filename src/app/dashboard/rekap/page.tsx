"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Wallet, Users, Home, TrendingUp } from "lucide-react";

export default function RekapPage() {
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7));
  const stats = useQuery(api.jimpitan.getRekapBulanan, { bulan });

  if (!stats) return <div className="p-8 text-center text-slate-500">Menghitung statistik...</div>;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-8xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Rekapitulasi Dana</h1>
          <p className="text-slate-500">Laporan pemasukan jimpitan tingkat desa.</p>
        </div>
        <Input 
          type="month" 
          value={bulan} 
          onChange={(e) => setBulan(e.target.value)} 
          className="w-full md:w-48 bg-white"
        />
      </div>

      {/* RINGKASAN KARTU */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Terkumpul" 
          value={`Rp ${stats.totalKeseluruhan.toLocaleString()}`} 
          icon={<Wallet className="text-blue-600" />}
          description="Bulan ini"
        />
        <StatCard 
          title="Partisipasi Warga" 
          value={`${stats.wargaSudahBayar}/${stats.totalWarga}`} 
          icon={<Users className="text-purple-600" />}
          description="Rumah yang mengisi"
        />
        <StatCard 
          title="Rata-rata / RT" 
          value={`Rp ${Math.round(stats.totalKeseluruhan / (stats.perRT.length || 1)).toLocaleString()}`} 
          icon={<TrendingUp className="text-green-600" />}
          description="Pemerataan kas"
        />
        <StatCard 
          title="Total RT" 
          value={stats.perRT.length.toString()} 
          icon={<Home className="text-orange-600" />}
          description="Aktif melaporkan"
        />
      </div>

      {/* TABEL PER RT */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50">
          <h3 className="font-semibold text-slate-700">Perincian per RT</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
            <tr>
              <th className="p-4 text-left">Wilayah</th>
              <th className="p-4 text-center">Partisipasi Rumah</th>
              <th className="p-4 text-right">Total Dana</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {stats.perRT.map((item) => (
              <tr key={item.rt} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold text-slate-700">RT {item.rt}</td>
                <td className="p-4 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-slate-600">{item.jumlahWargaBayar} / {item.totalWargaRT}</span>
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-full bg-blue-500" 
                        style={{ width: `${(item.jumlahWargaBayar / item.totalWargaRT) * 100}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="p-4 text-right font-semibold text-blue-600">
                  Rp {item.total.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, description }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
        <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-slate-400 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}