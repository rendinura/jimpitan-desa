import JimpitanTable from "@/components/jimpitan-table";

export default function CatatJimpitanPage() {
  return (
    <div className="p-8 max-w-8xl space-y-6 mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Pencatatan Jimpitan Harian</h1>
        <p className="text-slate-500">Input data jimpitan warga.</p>
      </header>
      
      <main className="bg-white p-6 rounded-xl shadow-sm border">
        <JimpitanTable />
      </main>
    </div>
  );
}