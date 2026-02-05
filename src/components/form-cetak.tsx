import { format } from "date-fns";
import { id } from "date-fns/locale";

export const FormJimpitanWarga = ({ warga, bulan, bulanLalu }: any) => {
  const [year, month] = bulan.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const namaBulan = format(new Date(year, month - 1), "MMMM yyyy", { locale: id });
  const namaBulanLalu = format(new Date(year, month - 2), "MMMM", { locale: id });

  const getKeteranganSaldo = (nominal: number) => {
    if (nominal < 0) {
      return `Per bulan ${namaBulanLalu} kurang Rp ${Math.abs(nominal).toLocaleString('id-ID')};`;
    } else if (nominal > 0) {
      return `Sisa bulan ${namaBulanLalu} Rp ${nominal.toLocaleString('id-ID')};`;
    }
    return "";
  };

  return (
    /* Ukuran diubah agar muat 2 form dalam satu kertas A4 Landscape */
    <div className="w-full bg-white border-2 border-black p-6 box-border flex flex-col justify-between min-h-[180mm]">
      <div>
        <div className="text-center border-b-2 border-black pb-1 mb-3">
          <h1 className="text-lg font-bold uppercase leading-tight">Form Jimpitan {namaBulan}</h1>
        </div>

        <div className="flex justify-between mb-2 text-xs font-bold">
          <div className="truncate max-w-[180px]">NAMA : {warga.nama || warga.namaWarga}</div>
          <div>NO : {warga.noRumah}</div>
        </div>

        <table className="w-full border-collapse border-[1.5px] border-black text-[10px]">
          <thead>
            <tr className="bg-slate-50 print:bg-transparent">
              <th className="border border-black p-0.5 w-8">Tgl</th>
              <th className="border border-black p-0.5">Paraf</th>
              <th className="border border-black p-0.5 w-8">Tgl</th>
              <th className="border border-black p-0.5">Paraf</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 16 }, (_, i) => (
              <tr key={i} className="h-6">
                <td className="border border-black text-center font-bold">{i + 1}</td>
                <td className="border border-black"></td>
                <td className="border border-black text-center font-bold">
                  {i + 17 <= daysInMonth ? i + 17 : ""}
                </td>
                <td className="border border-black"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <div className="mt-3 border-[1.5px] border-black p-2 min-h-[60px]">
          <p className="text-[10px] font-bold underline mb-1">Keterangan:</p>
          <p className="text-[9px] italic leading-tight">{getKeteranganSaldo(warga.saldoAwal)}</p>
        </div>

        <div className="mt-4 flex justify-end">
          <div className="text-center w-32 text-[10px]">
            <p>Petugas Jimpitan,</p>
            <div className="h-10"></div>
            <p className="border-t border-black font-bold">( ............................ )</p>
          </div>
        </div>
      </div>
    </div>
  );
};