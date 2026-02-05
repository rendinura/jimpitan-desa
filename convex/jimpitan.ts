import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getJimpitanBulanan = query({
  args: { 
    bulan: v.string(), // Format: "2026-01"
  },
  handler: async (ctx, args) => {
    const warga = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "warga"))
      .collect();

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

export const importJimpitanBulanan = mutation({
  args: {
    transaksi: v.array(
      v.object({
        namaWarga: v.string(),
        noRumah: v.string(),
        rt: v.string(),
        tanggal: v.string(),
        jumlah: v.number(),
      })
    ),
    saldoBulanLalu: v.array(
      v.object({
        namaWarga: v.string(),
        noRumah: v.string(),
        rt: v.string(),
        jumlah: v.number(),
        bulan: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const s of args.saldoBulanLalu) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_rt_noRumah", (q) => 
          q.eq("rt", s.rt).eq("noRumah", s.noRumah)
        )
        .first();

      if (user) {
        const existingSaldo = await ctx.db
          .query("saldo")
          .withIndex("by_warga_bulan", (q) => 
            q.eq("wargaId", user._id).eq("bulan", s.bulan)
          )
          .first();

        if (existingSaldo) {
          await ctx.db.patch(existingSaldo._id, { jumlah: s.jumlah });
        } else {
          await ctx.db.insert("saldo", {
            wargaId: user._id,
            bulan: s.bulan,
            jumlah: s.jumlah,
          });
        }
      }
    }

    let count = 0;
    for (const t of args.transaksi) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_rt_noRumah", (q) => 
          q.eq("rt", t.rt).eq("noRumah", t.noRumah)
        )
        .first();

      if (user) {
        await ctx.db.insert("jimpitan", {
          wargaId: user._id,
          tanggal: t.tanggal,
          jumlah: t.jumlah,
        });
        count++;
      }
    }
    
    return count;
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
      petugasId: v.optional(v.id("users")), // ID petugas yang sedang login
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

export const deleteJimpitanByMonth = mutation({
  args: {
    yearMonth: v.string(), // Format: "2026-02"
  },
  handler: async (ctx, args) => {
    // Ambil semua data jimpitan yang diawali dengan string yearMonth
    const records = await ctx.db
      .query("jimpitan")
      .withIndex("by_tanggal")
      .filter((q) => q.lt(q.field("tanggal"), `${args.yearMonth}-32`))
      .filter((q) => q.gte(q.field("tanggal"), `${args.yearMonth}-01`))
      .collect();

    let deletedCount = 0;
    for (const record of records) {
      await ctx.db.delete(record._id);
      deletedCount++;
    }

    return deletedCount;
  },
});

export const getSaldoBulanLalu = query({
  args: { 
    bulan: v.string()
  },
  handler: async (ctx, args) => {
    const saldos = await ctx.db
      .query("saldo")
      .filter((q) => q.eq(q.field("bulan"), args.bulan))
      .collect();

    return saldos;
  },
});

export const getFormDataWarga = query({
  args: { 
    rt: v.string(), 
    bulan: v.string(), // Format: "2026-02"
    bulanLalu: v.string() // Format: "2026-01"
  },
  handler: async (ctx, args) => {
    const warga = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "warga"))
      .filter((q) => q.eq(q.field("rt"), args.rt))
      .collect();

    const result = await Promise.all(
      warga.map(async (w) => {
        const saldo = await ctx.db
          .query("saldo")
          .withIndex("by_warga_bulan", (q) => 
            q.eq("wargaId", w._id).eq("bulan", args.bulanLalu)
          )
          .first();
        
        return {
          ...w,
          saldoAwal: saldo?.jumlah || 0
        };
      })
    );

    return result;
  },
});