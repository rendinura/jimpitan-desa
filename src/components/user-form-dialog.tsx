"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  userToEdit?: any; // Data user jika sedang mode edit
}

export default function UserFormDialog({ open, setOpen, userToEdit }: UserFormProps) {
  const upsert = useMutation(api.users.upsertUser);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nama: "",
    rt: "",
    rw: "",
    noRumah: "",
    alamat: "",
    role: "warga",
    status: "aktif",
  });

  // Isi form jika dalam mode edit
  useEffect(() => {
    if (userToEdit) {
      setFormData({
        nama: userToEdit.nama,
        rt: userToEdit.rt,
        rw: userToEdit.rw,
        noRumah: userToEdit.noRumah,
        alamat: userToEdit.alamat,
        role: userToEdit.role,
        status: userToEdit.status,
      });
    } else {
      setFormData({ nama: "", rt: "", rw: "", noRumah: "", alamat: "", role: "warga", status: "aktif" });
    }
  }, [userToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await upsert({
        id: userToEdit?._id,
        ...formData,
        role: formData.role as any,
      });
      setOpen(false);
    } catch (error) {
      alert("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{userToEdit ? "Edit Data Warga" : "Tambah Warga Baru"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nama">Nama Lengkap</Label>
            <Input 
              id="nama" 
              value={formData.nama} 
              onChange={(e) => setFormData({...formData, nama: e.target.value})} 
              required 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="rt">RT</Label>
              <Input 
                id="rt" placeholder="001"
                value={formData.rt} 
                onChange={(e) => setFormData({...formData, rt: e.target.value})} 
                required 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rw">RW</Label>
              <Input 
                id="rw" placeholder="005"
                value={formData.rw} 
                onChange={(e) => setFormData({...formData, rw: e.target.value})} 
                required 
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="noRumah">Nomor Rumah</Label>
            <Input 
              id="noRumah" 
              value={formData.noRumah} 
              onChange={(e) => setFormData({...formData, noRumah: e.target.value})} 
              required 
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select 
              value={formData.role} 
              onValueChange={(val) => setFormData({...formData, role: val})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="warga">Warga</SelectItem>
                <SelectItem value="petugas">Petugas</SelectItem>
                <SelectItem value="pengurus">Pengurus</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}