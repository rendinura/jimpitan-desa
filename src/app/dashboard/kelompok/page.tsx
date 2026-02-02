"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, MapPin, Pencil, Trash2 } from "lucide-react";
import KelompokFormDialog from "@/components/kelompok-form-dialog";

export default function KelompokPage() {
  const kelompok = useQuery(api.kelompok.getSemuaKelompok);
  const remove = useMutation(api.kelompok.deleteKelompok);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedKelompok, setSelectedKelompok] = useState<any>(null);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Kelompok Petugas</h1>
          <p className="text-slate-500 text-sm">Manajemen tim penarikan jimpitan per RW.</p>
        </div>
        <Button onClick={() => { setSelectedKelompok(null); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Kelompok
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kelompok?.map((k) => (
          <Card key={k._id} className="overflow-hidden border-t-4 border-t-blue-500">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{k.namaKelompok}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedKelompok(k); setIsDialogOpen(true); }}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => confirm("Hapus kelompok?") && remove({ id: k._id })}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                <MapPin className="w-4 h-4" />
                <span>RW {k.rw} • RT: {k.rtList.join(", ")}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <Users className="w-3 h-3" /> Anggota ({k.anggotaIds.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {k.anggota.map((m: any) => (
                    <Badge key={m._id} variant="secondary" className="font-normal">
                      {m.nama}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <KelompokFormDialog 
        open={isDialogOpen} 
        setOpen={setIsDialogOpen} 
        dataToEdit={selectedKelompok} 
      />
    </div>
  );
}