import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.optional(v.string()),
    nama: v.string(),
    email: v.optional(v.string()),
    pictureUrl: v.optional(v.string()),
    role: v.union(
      v.literal("admin"),
      v.literal("pengurus"),
      v.literal("petugas"),
      v.literal("warga")
    ),
    rt: v.string(),
    rw: v.string(),
    noRumah: v.string(),
    alamat: v.string(),
    status: v.string(),
  }).index("by_clerkId", ["clerkId"]).index("by_role", ["role"]).index("by_rt_noRumah", ["rt", "noRumah"]),

  kelompok: defineTable({
    namaKelompok: v.string(),
    nomorUrut: v.number(),
    rw: v.string(),               
    rtList: v.array(v.string()), 
    anggotaIds: v.array(v.id("users")),
  }).index("by_rw", ["rw"]),

  rotasiConfig: defineTable({
    anchorDate: v.string(),
    totalKelompok: v.number(),
  }),

  jimpitan: defineTable({
    wargaId: v.id("users"),
    petugasId: v.optional(v.id("users")),
    tanggal: v.string(),
    jumlah: v.number(),
  })
    .index("by_tanggal", ["tanggal"])
    .index("by_warga", ["wargaId"]),
    
  saldo: defineTable({
    wargaId: v.id("users"),
    bulan: v.string(),
    jumlah: v.number(),
  }).index("by_warga_bulan", ["wargaId", "bulan"]),
});
