import { NavLink } from "react-router-dom";
import { BarChart3, Boxes, CircleDollarSign, FolderSearch, FolderTree, LayoutDashboard, ListFilter, PackageSearch, Search, ShoppingBag, Users, X } from "lucide-react";

const navigation = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard, group: "Workspace", end: true },
  { label: "Products", to: "/admin/products", icon: ShoppingBag, group: "Manage" },
  { label: "Categories", to: "/admin/categories", icon: FolderTree, group: "Manage" },
  { label: "Customers", to: "/admin/users", icon: Users, group: "Manage" },
  { label: "Orders", to: "/admin/orders", icon: Boxes, group: "Manage" },
  { label: "Order analytics", to: "/admin/orders-over-time", icon: BarChart3, group: "Insights" },
  { label: "Sales by category", to: "/admin/sales-by-category", icon: CircleDollarSign, group: "Insights" },
  { label: "Order statuses", to: "/admin/order-status-distribution", icon: ListFilter, group: "Insights" },
  { label: "Top products", to: "/admin/top-products", icon: PackageSearch, group: "Insights" },
  { label: "Total revenue", to: "/admin/total-revenue", icon: CircleDollarSign, group: "Insights" },
  { label: "Find a product", to: "/admin/search-product", icon: Search, group: "Tools" },
  { label: "Find a category", to: "/admin/search-category", icon: FolderSearch, group: "Tools" },
  { label: "Products by category", to: "/admin/products-by-category", icon: FolderTree, group: "Tools" },
  { label: "Filter by stock", to: "/admin/filter-by-stock", icon: ListFilter, group: "Tools" },
  { label: "Filter by price", to: "/admin/filter-by-price", icon: CircleDollarSign, group: "Tools" },
  { label: "Low-stock alerts", to: "/admin/low-stock-products", icon: PackageSearch, group: "Tools" },
];

const groups = ["Workspace", "Manage", "Insights", "Tools"];

export default function AdminSidebar({ mobileOpen, onClose }) {
  return <>
    {mobileOpen && <button type="button" aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-30 bg-[#18212b]/50 xl:hidden" />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-[#18212b] px-4 py-5 text-white shadow-[14px_0_45px_rgba(24,33,43,0.18)] transition-transform duration-300 xl:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="mb-7 flex items-center justify-between px-2">
        <NavLink to="/admin" end onClick={onClose} className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f4b942] text-[#18212b] shadow-lg shadow-[#f4b942]/10"><LayoutDashboard size={20} /></span>
          <span><span className="block text-base font-semibold tracking-tight">Luma Market</span><span className="block text-xs text-slate-400">Admin workspace</span></span>
        </NavLink>
        <button type="button" onClick={onClose} aria-label="Close navigation" className="rounded-xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white xl:hidden"><X size={18} /></button>
      </div>

      <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
        {groups.map((group) => <div key={group}><p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f4b942]">{group}</p><div className="space-y-1">{navigation.filter((item) => item.group === group).map(({ label, to, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-[#f4b942] text-[#18212b] shadow-md shadow-black/10" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}><Icon size={17} strokeWidth={2} /><span>{label}</span></NavLink>)}</div></div>)}
      </nav>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-3.5"><p className="text-xs font-semibold text-slate-200">Store management</p><p className="mt-1 text-xs leading-5 text-slate-400">Everything you need to run your catalog and orders.</p></div>
    </aside>
  </>;
}
