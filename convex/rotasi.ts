import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getSemuaRotasi = query({
    args: { bulan: v.string() }, // Format "YYYY-MM"
    handler: async (ctx, args) => {
      const config = await ctx.db.query("rotasiConfig").first();
      const semuaKelompok = await ctx.db.query("kelompok").collect();
      
      if (!config || semuaKelompok.length === 0) return [];
  
      const [year, month] = args.bulan.split("-").map(Number);
      const jumlahHari = new Date(year, month, 0).getDate();
      const anchor = new Date(config.anchorDate);
      
      const jadwalSebulan = [];
  
      for (let i = 1; i <= jumlahHari; i++) {
        const targetDate = new Date(year, month - 1, i);
        const diffTime = targetDate.getTime() - anchor.getTime();
        const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
        if (totalDays >= 0) {
          // Logika pola rotasi Anda (shift +1 tiap 7 hari)
          const shift = Math.floor(totalDays / 7);
          const groupIndex = (totalDays + shift) % config.totalKelompok;
          const nomorUrutTarget = groupIndex + 1;
  
          const kelompok = semuaKelompok.find(k => k.nomorUrut === nomorUrutTarget);
          
          jadwalSebulan.push({
            tanggal: i,
            fullDate: targetDate.toISOString().split('T')[0],
            namaHari: new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(targetDate),
            kelompok: kelompok || { namaKelompok: "Tidak Ada Data" }
          });
        }
      }
      return jadwalSebulan;
    },
  });

export const updateConfig = mutation({
    args: {
      anchorDate: v.string(),
      totalKelompok: v.number(),
    },
    handler: async (ctx, args) => {
      const existing = await ctx.db.query("rotasiConfig").first();
      if (existing) {
        await ctx.db.patch(existing._id, args);
      } else {
        await ctx.db.insert("rotasiConfig", args);
      }
    },
  });
  
export const getConfig = query({
handler: async (ctx) => {
    return await ctx.db.query("rotasiConfig").first();
},
});

export const getPetugasHariIni = query({
    handler: async (ctx) => {
      const config = await ctx.db.query("rotasiConfig").first();
      const semuaKelompok = await ctx.db.query("kelompok").collect();
      if (!config || semuaKelompok.length === 0) return null;
  
      const targetDate = new Date();
      // Reset jam ke 00:00 untuk akurasi perhitungan selisih hari
      targetDate.setHours(0, 0, 0, 0);
      const anchor = new Date(config.anchorDate);
      anchor.setHours(0, 0, 0, 0);
  
      const diffTime = targetDate.getTime() - anchor.getTime();
      const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
      if (totalDays < 0) return null;
  
      const shift = Math.floor(totalDays / 7);
      const groupIndex = (totalDays + shift) % config.totalKelompok;
      const nomorUrutTarget = groupIndex + 1;
  
      return semuaKelompok.find(k => k.nomorUrut === nomorUrutTarget);
    },
  });