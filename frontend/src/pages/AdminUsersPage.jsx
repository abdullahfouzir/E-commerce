import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ShieldCheck, UserX, Users, Trash2 } from "lucide-react";
import api from "../api/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const res = await api.get("/auth/admin/getUsers");
      setUsers(Array.isArray(res.data?.users) ? res.data.users : []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/auth/admin/deleteUser/${id}`);
      toast.success("User deleted.");
      await loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete user.");
    }
  };

  const verifiedUsers = users.filter((user) => user.emailVerified).length;
  const unverifiedUsers = users.length - verifiedUsers;

  return (
    <div className="min-h-screen bg-[#f4f1eb] px-4 py-6 text-[#18212b] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-4xl bg-[#18212b] p-6 text-white shadow-[0_24px_60px_rgba(24,33,43,0.16)]">
          <p className="mb-2 text-sm font-semibold tracking-[0.18em] text-[#f4b942] uppercase">Members</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Users</h1>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <StatCard icon={Users} label="Total users" value={users.length} />
          <StatCard icon={ShieldCheck} label="Verified" value={verifiedUsers} tone="success" />
          <StatCard icon={UserX} label="Pending" value={unverifiedUsers} tone="warning" />
        </div>

        <div className="rounded-4xl border border-[#e9e1d9] bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#18212b]">Account list</h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-18 animate-pulse rounded-2xl bg-slate-200" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
              No users found.
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user._id} className="flex flex-col gap-3 rounded-2xl border border-[#e9e1d9] bg-[#fffdfb] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#f4f1eb] text-[#18212b]">
                      {user.avatar?.secure_url ? (
                        <img src={user.avatar.secure_url} alt={user.username} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm font-semibold">{user.username?.slice(0, 1).toUpperCase() || "U"}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-[#18212b]">{user.username}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.emailVerified ? "bg-[#ecfdf5] text-[#15803d]" : "bg-[#fff7ed] text-[#b45309]"}`}>
                      {user.emailVerified ? "Verified" : "Pending"}
                    </span>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff0ed] text-[#e65b4d] transition hover:bg-[#fde8e4]"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone = "default" }) {
  const toneClasses =
    tone === "success"
      ? "bg-[#ecfdf5] text-[#15803d]"
      : tone === "warning"
        ? "bg-[#fff7ed] text-[#b45309]"
        : "bg-[#fff0ed] text-[#e65b4d]";

  return (
    <div className="rounded-3xl border border-[#e9e1d9] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${toneClasses}`}>
          <Icon size={17} />
        </span>
      </div>
      <p className="text-3xl font-semibold tracking-tight text-[#18212b]">{value}</p>
    </div>
  );
}
