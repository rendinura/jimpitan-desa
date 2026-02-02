"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Input } from "./ui/input";

export default function ImportUserExcel() {
  const importData = useMutation(api.users.importUsers);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const rawData = XLSX.utils.sheet_to_json(ws);

      // Mapping data Excel ke format database
      const formattedData = rawData.map((item: any) => ({
        nama: String(item.Nama || ""),
        rt: String(item.RT || "000"),
        rw: String(item.RW || "000"),
        noRumah: String(item.NoRumah || "-"),
        alamat: String(item.Alamat || ""),
        role: String(item.Role || ""),
        status: "aktif" as const,
      }));

      try {
        await importData({ data: formattedData });
        alert("Import Berhasil!");
      } catch (err) {
        alert("Gagal import data.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        className="w-64"
        disabled={loading}
      />
      <Button disabled={loading}>
        <Upload className="w-4 h-4 mr-2" />
        {loading ? "Proses..." : "Import Excel"}
      </Button>
    </div>
  );
}