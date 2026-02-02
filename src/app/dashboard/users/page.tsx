"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Trash2, Pencil, UserPlus } from "lucide-react";
import UserFormDialog from "@/components/user-form-dialog";
import { Button } from "@/components/ui/button";
import DownloadTemplate from "@/components/download-template";
import ImportUserExcel from "@/components/import-user-excel";

export default function ManageUsersPage() {
  const users = useQuery(api.users.getAllUsers);
  const removeUser = useMutation(api.users.deleteUser);

    const handleEdit = (user: any) => {
        setSelectedUser(user);
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setSelectedUser(null);
        setIsDialogOpen(true);
    };
  
  // States Filter
  const [search, setSearch] = useState("");
  const [filterRT, setFilterRT] = useState("all");
  const [filterRW, setFilterRW] = useState("all");
  const [filterRole, setFilterRole] = useState("all");

  // State Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Fungsi Warna Badge Role
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-600 hover:bg-red-700">Admin</Badge>;
      case "pengurus":
        return <Badge className="bg-purple-600 hover:bg-purple-700">Pengurus</Badge>;
      case "petugas":
        return <Badge className="bg-blue-600 hover:bg-blue-700">Petugas</Badge>;
      default:
        return <Badge variant="outline" className="text-slate-600">Warga</Badge>;
    }
  };

  // Logika Filter
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((u) => {
      const matchSearch = u.nama.toLowerCase().includes(search.toLowerCase());
      const matchRT = filterRT === "all" || u.rt === filterRT;
      const matchRW = filterRW === "all" || u.rw === filterRW;
      const matchRole = filterRole === "all" || u.role === filterRole;
      return matchSearch && matchRT && matchRW && matchRole;
    });
  }, [users, search, filterRT, filterRW, filterRole]);

  // Ekstrak list unik untuk dropdown
  const uniqueRT = Array.from(new Set(users?.map(u => u.rt))).sort();
  const uniqueRW = Array.from(new Set(users?.map(u => u.rw))).sort();

  return (
    <div className="p-8 space-y-6 max-w-8xl">
        <div className="flex flex-col gap-4 bg-slate-50 p-6 rounded-xl border border-dashed mb-6">
            <div className="flex items-center justify-between">
                <div>
                <h3 className="font-semibold text-slate-800">Import Data Massal</h3>
                <p className="text-sm text-slate-500">Gunakan fitur ini untuk memasukkan data warga dalam jumlah banyak sekaligus.</p>
                </div>
                <div className="flex gap-2">
                <DownloadTemplate />
                <ImportUserExcel />
                <Button onClick={handleAdd}><UserPlus className="mr-2 h-4 w-4"/> Tambah Manual</Button>
                </div>
            </div>
        </div>

      {/* FILTER TOOLBAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Cari nama..." 
            className="pl-9" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={filterRT} onValueChange={setFilterRT}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih RT" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua RT</SelectItem>
            {uniqueRT.map(rt => <SelectItem key={rt} value={rt}>RT {rt}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filterRW} onValueChange={setFilterRW}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih RW" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua RW</SelectItem>
            {uniqueRW.map(rw => <SelectItem key={rw} value={rw}>RW {rw}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Role</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="pengurus">Pengurus</SelectItem>
            <SelectItem value="petugas">Petugas</SelectItem>
            <SelectItem value="warga">Warga</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b text-slate-600">
            <tr>
              <th className="p-4 text-left font-semibold">Nama</th>
              <th className="p-4 text-left font-semibold">Lokasi</th>
              <th className="p-4 text-left font-semibold">Role</th>
              <th className="p-4 text-center font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u._id} className="border-b hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium">{u.nama}</td>
                <td className="p-4">
                  <div className="text-slate-600">RT {u.rt} / RW {u.rw}</div>
                  <div className="text-xs text-slate-400">No. {u.noRumah}</div>
                </td>
                <td className="p-4">{getRoleBadge(u.role)}</td>
                <td className="p-4 text-center">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500"
                    onClick={() => confirm("Hapus warga?") && removeUser({ id: u._id })}
                  >
                    <Trash2 className="h-4 w-4"/>
                  </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(u)}>
                        <Pencil className="h-4 w-4"/>
                    </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="p-10 text-center text-slate-400 italic">Data tidak ditemukan...</div>
        )}
      </div>

      <UserFormDialog open={isDialogOpen} setOpen={setIsDialogOpen} userToEdit={selectedUser} />
    </div>
  );
}