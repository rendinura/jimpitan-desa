import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getJadwalMingguan = query({
  handler: async (ctx) => {
    const semuaJadwal = await ctx.db.query("jadwal").collect();
    return Promise.all(
      semuaJadwal.map(async (j) => {
        const kelompok = await ctx.db.get(j.kelompokId);
        return { ...j, kelompok };
      })
    );
  },
});

export const upsertJadwal = mutation({
  args: {
    id: v.optional(v.id("jadwal")),
    hari: v.union(
      v.literal("Senin"),
      v.literal("Selasa"),
      v.literal("Rabu"),
      v.literal("Kamis"),
      v.literal("Jumat"),
      v.literal("Sabtu"),
      v.literal("Minggu")
    ),
    kelompokId: v.id("kelompok"),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    if (id) {
      return await ctx.db.patch(id, data);
    }
    return await ctx.db.insert("jadwal", data);
  },
});