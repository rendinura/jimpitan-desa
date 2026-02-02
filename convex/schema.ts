import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    nama: v.string(),
    role: v.union(v.literal("admin"), v.literal("pengurus"), v.literal("petugas"), v.literal("warga")),
    rt: v.string(),      // Contoh: "001"
    rw: v.string(),      // Contoh: "005"
    noRumah: v.string(), // Contoh: "12" atau "45B"
    alamat: v.string(),
    status: v.string(), // 'aktif' | 'non-aktif'
  }).index("by_role", ["role"]),

  kelompok: defineTable({
    namaKelompok: v.string(),
    nomorUrut: v.number(),
    rw: v.string(),               
    rtList: v.array(v.string()), 
    anggotaIds: v.array(v.id("users")),
  }).index("by_rw", ["rw"]),

  rotasiConfig: defineTable({
    anchorDate: v.string(), // Tanggal mulai rotasi (misal: "2026-01-01")
    totalKelompok: v.number(),
  }),

  jimpitan: defineTable({
    wargaId: v.id("users"),
    petugasId: v.id("users"),
    tanggal: v.string(), // YYYY-MM-DD
    jumlah: v.number(),
  })
    .index("by_tanggal", ["tanggal"])
    .index("by_warga", ["wargaId"]),
});