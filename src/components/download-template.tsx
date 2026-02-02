"use client";

import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function DownloadTemplate() {
  const handleDownload = () => {
    // 1. Definisikan header dan contoh data
    const data = [
      {
        Nama: "Ahmad Budi",
        RT: "001",
        RW: "005",
        NoRumah: "12",
        Alamat: "Jl. Mawar No. 12",
        Role: "warga",
      },
      {
        Nama: "Siti Aminah",
        RT: "002",
        RW: "005",
        NoRumah: "45B",
        Alamat: "Blok C Gang Melati",
        Role: "warga",
      },
    ];

    // 2. Buat worksheet dan workbook
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daftar Warga");

    // 3. Trigger download file
    XLSX.writeFile(wb, "template_import_warga.xlsx");
  };

  return (
    <Button variant="outline" onClick={handleDownload}>
      <Download className="w-4 h-4 mr-2" />
      Unduh Template Excel
    </Button>
  );
}