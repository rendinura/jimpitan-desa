"use client";

import { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, X } from "lucide-react";

export default function KelompokFormDialog({ open, setOpen, dataToEdit }: any) {
  const upsert = useMutation(api.kelompok.upsertKelompok);
  const calonAnggota = useQuery(api.kelompok.getCalonAnggota);
  const semuaKelompok = useQuery(api.kelompok.getSemuaKelompok);
  const [nomorUrut, setNomorUrut] = useState(1);
  const [searchPetugas, setSearchPetugas] = useState("");
  
  const [nama, setNama] = useState("");
  const [rw, setRw] = useState("");
  const [rtInput, setRtInput] = useState(""); // String dipisah koma: "001, 002"
  const [selectedAnggota, setSelectedAnggota] = useState<string[]>([]);

  useEffect(() => {
    if (dataToEdit) {
      setNama(dataToEdit.namaKelompok);
      setNomorUrut(dataToEdit.nomorUrut);
      setRw(dataToEdit.rw);
      setRtInput(dataToEdit.rtList.join(", "));
      setSelectedAnggota(dataToEdit.anggotaIds);
    } else {
      setNama(""); setRw(""); setRtInput(""); setSelectedAnggota([]);
    }
  }, [dataToEdit, open]);

  const toggleAnggota = (id: string) => {
    setSelectedAnggota(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    const rtList = rtInput.split(",").map(s => s.trim()).filter(Boolean);
    await upsert({
      id: dataToEdit?._id,
      namaKelompok: nama,
      nomorUrut: nomorUrut, // Pastikan dikirim
      rw,
      rtList,
      anggotaIds: selectedAnggota as any,
    });
    setOpen(false);
  };

  const petugasTersedia = useMemo(() => {
    if (!calonAnggota || !semuaKelompok) return [];
  
    // 1. Ambil semua ID petugas yang sudah tergabung di kelompok lain
    const idPetugasSudahAda = semuaKelompok.flatMap((k) => k.anggotaIds);
  
    return calonAnggota.filter((person) => {
      // 2. Filter berdasarkan ketersediaan (logic sebelumnya)
      const isMemberOfThisGroup = dataToEdit?.anggotaIds.includes(person._id);
      const isAvailable = !idPetugasSudahAda.includes(person._id) || isMemberOfThisGroup;
  
      // 3. Filter berdasarkan input search (logic baru)
      const matchSearch = person.nama.toLowerCase().includes(searchPetugas.toLowerCase());
  
      return isAvailable && matchSearch;
    });
  }, [calonAnggota, semuaKelompok, dataToEdit, searchPetugas]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{dataToEdit ? "Edit Kelompok" : "Tambah Kelompok"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nama Kelompok</Label>
            <Input placeholder="Contoh: Tim Mawar" value={nama} onChange={e => setNama(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>RW</Label>
              <Input placeholder="005" value={rw} onChange={e => setRw(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Daftar RT (Pisah koma)</Label>
              <Input placeholder="001, 002, 003" value={rtInput} onChange={e => setRtInput(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Nomor Urut Rotasi</Label>
              <Input 
                type="number" 
                placeholder="1" 
                min={1}
                value={nomorUrut} 
                onChange={e => setNomorUrut(parseInt(e.target.value))} 
              />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex flex-col gap-2">
              <Label className="flex justify-between items-end">
                <span>Pilih Anggota Petugas</span>
                <span className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">
                  {petugasTersedia.length} Tersedia
                </span>
              </Label>

              {/* INPUT SEARCH PETUGAS */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Cari nama petugas..."
                  value={searchPetugas}
                  onChange={(e) => setSearchPetugas(e.target.value)}
                  className="h-8 pl-8 text-xs bg-slate-50/50 focus-visible:ring-blue-500"
                />
                {searchPetugas && (
                  <button 
                    onClick={() => setSearchPetugas("")}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* DAFTAR CHECKLIST */}
            <div className="border rounded-md p-2 max-h-52 overflow-y-auto space-y-1 bg-white shadow-inner">
              {petugasTersedia.length > 0 ? (
                petugasTersedia.map(person => (
                  <div 
                    key={person._id} 
                    className="flex items-center gap-2 p-1.5 hover:bg-blue-50/50 rounded-md transition-colors group"
                  >
                    <Checkbox 
                      id={person._id} 
                      checked={selectedAnggota.includes(person._id)} 
                      onCheckedChange={() => toggleAnggota(person._id)}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <label 
                      htmlFor={person._id} 
                      className="text-sm cursor-pointer flex-1 flex justify-between items-center"
                    >
                      <span className="font-medium text-slate-700 group-hover:text-blue-700 transition-colors">
                        {person.nama}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-bold uppercase">
                        {person.role}
                      </span>
                    </label>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center space-y-2">
                  <p className="text-xs text-slate-400 italic">
                    {searchPetugas ? "Nama tidak ditemukan..." : "Semua petugas sudah memiliki kelompok."}
                  </p>
                  {searchPetugas && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-[10px]" 
                      onClick={() => setSearchPetugas("")}
                    >
                      Bersihkan Pencarian
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Simpan Kelompok</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}