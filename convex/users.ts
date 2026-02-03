import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

// Ambil semua user (untuk tabel manajemen)
export const getAllUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const createOrUpdateUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    nama: v.string(),
    pictureUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // Gunakan withIndex untuk performa lebih baik dan menghindari error TS
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { 
        nama: args.nama, 
        pictureUrl: args.pictureUrl 
      });
    } else {
      await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        nama: args.nama,
        pictureUrl: args.pictureUrl,
        role: "warga", // Default role untuk pendaftar baru
        rt: "-",
        rw: "-",
        noRumah: "-",
        alamat: "-",
        status: "aktif",
      });
    }
  },
});

export const getMyProfile = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    if (!args.clerkId) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const updateProfile = mutation({
  args: {
    clerkId: v.string(),
    nama: v.string(),
    rt: v.string(),
    rw: v.string(),
    noRumah: v.string(),
    alamat: v.string(),
  },
  handler: async (ctx, args) => {
    const { clerkId, ...data } = args;
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), clerkId))
      .first();

    if (!user) throw new Error("Pengguna tidak ditemukan");
    
    return await ctx.db.patch(user._id, data);
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