import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getSemuaKelompok = query({
  handler: async (ctx) => {
    const kelompok = await ctx.db.query("kelompok").collect();
    return Promise.all(
      kelompok.map(async (k) => {
        const anggota = await Promise.all(
          k.anggotaIds.map((id) => ctx.db.get(id))
        );
        return { ...k, anggota: anggota.filter(Boolean) };
      })
    );
  },
});

export const getCalonAnggota = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .filter((q) => 
        q.or(
          q.eq(q.field("role"), "petugas"),
          q.eq(q.field("role"), "pengurus"),
        )
      )
      .collect();
  },
});

export const upsertKelompok = mutation({
  args: {
    id: v.optional(v.id("kelompok")),
    namaKelompok: v.string(),
    nomorUrut: v.number(),
    rw: v.string(),
    rtList: v.array(v.string()),
    anggotaIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    if (id) return await ctx.db.patch(id, data);
    return await ctx.db.insert("kelompok", data);
  },
});

export const deleteKelompok = mutation({
  args: { id: v.id("kelompok") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
})