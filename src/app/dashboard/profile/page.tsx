"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, MapPin, Home, Save, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user: clerkUser } = useUser();
  const userProfile = useQuery(api.users.getMyProfile, { clerkId: clerkUser?.id || "" });
  const update = useMutation(api.users.updateProfile);

  const [formData, setFormData] = useState({
    nama: "",
    rt: "",
    rw: "",
    noRumah: "",
    alamat: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        nama: userProfile.nama || "",
        rt: userProfile.rt || "",
        rw: userProfile.rw || "",
        noRumah: userProfile.noRumah || "",
        alamat: userProfile.alamat || "",
      });
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!clerkUser) return;
    setLoading(true);
    try {
      await update({ clerkId: clerkUser.id, ...formData });
      alert("Profil berhasil diperbarui!");
    } catch (error) {
      alert("Gagal memperbarui profil.");
    } finally {
      setLoading(false);
    }
  };

  if (userProfile === undefined) return <div className="p-8 text-center">Memuat profil...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-600 rounded-lg text-white">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Pengaturan Profil</h1>
          <p className="text-slate-500 text-sm">Lengkapi data diri Anda untuk keperluan pendataan jimpitan.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informasi Domisili</CardTitle>
          <CardDescription>Pastikan data RT dan RW sesuai dengan alamat tinggal saat ini.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Lengkap</Label>
            <Input 
              id="nama" 
              value={formData.nama} 
              onChange={(e) => setFormData({...formData, nama: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rt">RT</Label>
              <Input 
                id="rt" 
                placeholder="001" 
                value={formData.rt} 
                onChange={(e) => setFormData({...formData, rt: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rw">RW</Label>
              <Input 
                id="rw" 
                placeholder="005" 
                value={formData.rw} 
                onChange={(e) => setFormData({...formData, rw: e.target.value})} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="noRumah">Nomor Rumah</Label>
            <div className="relative">
              <Input 
                id="noRumah" 
                className="pl-10" 
                placeholder="A-12" 
                value={formData.noRumah} 
                onChange={(e) => setFormData({...formData, noRumah: e.target.value})} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat Lengkap (Jalan/Gang)</Label>
            <div className="relative">
              <Input 
                id="alamat" 
                className="pl-10" 
                placeholder="Jl. Melati No. 5" 
                value={formData.alamat} 
                onChange={(e) => setFormData({...formData, alamat: e.target.value})} 
              />
            </div>
          </div>

          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 mt-4" 
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Simpan Perubahan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}