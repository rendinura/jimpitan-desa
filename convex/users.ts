import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Ambil semua user (untuk tabel manajemen)
export const getAllUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// Tambah/Update User tunggal
export const upsertUser = mutation({
    args: {
      id: v.optional(v.id("users")),
      nama: v.string(),
      rt: v.string(),
      rw: v.string(),
      noRumah: v.string(),
      alamat: v.string(),
      role: v.union(v.literal("admin"), v.literal("pengurus"), v.literal("petugas"), v.literal("warga")),
      status: v.string(),
    },
    handler: async (ctx, args) => {
      const { id, ...data } = args;
      if (id) {
        await ctx.db.patch(id, data);
        return "updated";
      }
      await ctx.db.insert("users", data);
      return "created";
    },
  });

// Import banyak user sekaligus dari Excel
export const importUsers = mutation({
  args: {
    data: v.array(v.object({
      nama: v.string(),
      rt: v.string(),
      rw: v.string(),
      noRumah: v.string(),
      alamat: v.string(),
      role: v.union(
        v.literal("admin"),
        v.literal("pengurus"),
        v.literal("petugas"),
        v.literal("warga")
      ),
      status: v.literal("aktif"),
    })),
  },
  handler: async (ctx, args) => {
    for (const user of args.data) {
      await ctx.db.insert("users", user);
    }
  },
});

export const deleteUser = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});