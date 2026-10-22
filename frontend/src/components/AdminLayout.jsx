import { useState } from "react";
import { Menu } from "lucide-react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return <div className="min-h-screen bg-[#f4f1eb] xl:pl-72">
    <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    <div className="xl:hidden sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#e9e1d9] bg-[#f4f1eb]/95 px-4 backdrop-blur sm:px-6"><span className="text-sm font-semibold text-[#18212b]">Luma Market <span className="font-normal text-slate-500">Admin</span></span><button type="button" onClick={() => setMobileOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#18212b] px-3 py-2 text-sm font-medium text-white"><Menu size={17} /> Menu</button></div>
    <Outlet />
  </div>;
}
