import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getJimpitanBulanan = query({
  args: { 
    bulan: v.string(), // Format: "2026-01"
  },
  handler: async (ctx, args) => {
    // 1. Ambil semua warga
    const warga = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "warga"))
      .collect();

    // 2. Ambil data jimpitan di bulan tersebut
    const dataJimpitan = await ctx.db
      .query("jimpitan")
      .withIndex("by_tanggal", (q) => 
        q.gte("tanggal", `${args.bulan}-01`)
         .lte("tanggal", `${args.bulan}-31`)
      )
      .collect();

    return { warga, dataJimpitan };
  },
});

export const getRekapBulanan = query({
  args: { bulan: v.string() }, // YYYY-MM
  handler: async (ctx, args) => {
    const start = `${args.bulan}-01`;
    const end = `${args.bulan}-31`;

    const jimpitan = await ctx.db
      .query("jimpitan")
      .withIndex("by_tanggal", (q) => q.gte("tanggal", start).lte("tanggal", end))
      .collect();

    const warga = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "warga"))
      .collect();

    const rekapRT: Record<string, { total: number; wargaBayar: Set<string> }> = {};
    let totalKeseluruhan = 0;

    jimpitan.forEach((j) => {
      const user = warga.find((w) => w._id === j.wargaId);
      if (user) {
        const rt = user.rt;
        if (!rekapRT[rt]) rekapRT[rt] = { total: 0, wargaBayar: new Set() };
        
        rekapRT[rt].total += j.jumlah;
        rekapRT[rt].wargaBayar.add(j.wargaId);
        totalKeseluruhan += j.jumlah;
      }
    });

    return {
      totalKeseluruhan,
      totalWarga: warga.length,
      wargaSudahBayar: new Set(jimpitan.map(j => j.wargaId)).size,
      perRT: Object.entries(rekapRT).map(([rt, data]) => ({
        rt,
        total: data.total,
        jumlahWargaBayar: data.wargaBayar.size,
        totalWargaRT: warga.filter(w => w.rt === rt).length
      })).sort((a, b) => a.rt.localeCompare(b.rt))
    };
  },
});

export const upsertJimpitan = mutation({
    args: {
      wargaId: v.id("users"),
      petugasId: v.id("users"), // ID petugas yang sedang login
      tanggal: v.string(),
      jumlah: v.number(),
    },
    handler: async (ctx, args) => {
      // Cari apakah sudah ada catatan di tanggal tersebut untuk warga tersebut
      const existing = await ctx.db
        .query("jimpitan")
        .withIndex("by_warga", (q) => q.eq("wargaId", args.wargaId))
        .filter((q) => q.eq(q.field("tanggal"), args.tanggal))
        .first();
  
      if (existing) {
        // Jika ada dan jumlahnya jadi 0, hapus record (opsional, untuk hemat storage)
        if (args.jumlah === 0) {
          await ctx.db.delete(existing._id);
          return "deleted";
        }
        // Update data yang sudah ada
        await ctx.db.patch(existing._id, { 
          jumlah: args.jumlah,
          petugasId: args.petugasId 
        });
        return "updated";
      } else {
        // Jika belum ada dan jumlah > 0, buat baru
        if (args.jumlah > 0) {
          await ctx.db.insert("jimpitan", args);
          return "inserted";
        }
      }
    },
  });