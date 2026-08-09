import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ShieldCheck, UserCheck, ShieldAlert, Edit, Trash2 } from 'lucide-react';

export const AdminUserManagement = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      console.error('Error fetching profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      alert(`Đã cập nhật vai trò thành ${newRole.toUpperCase()}`);
      fetchUsers();
    } catch (err) {
      alert('Lỗi cập nhật: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-400" /> Quản Lý Người Dùng & Vai Trò (Admin)
          </h1>
          <p className="text-xs text-slate-400">Toàn quyền phân quyền Admin, Teacher, Student & Quản trị nhật ký hệ thống</p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Đang tải danh sách người dùng hệ thống..." />
      ) : (
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Người Dùng</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Vai Trò Hiện Tại</th>
                  <th className="px-4 py-3 text-right">Thay Đổi Phân Quyền (RBAC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3 font-bold text-slate-100">{p.full_name || 'Chưa cập nhật'}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{p.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={p.role === 'admin' ? 'purple' : p.role === 'teacher' ? 'emerald' : 'brand'}>
                        {p.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleUpdateRole(p.id, 'student')}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/30"
                        >
                          Student
                        </button>
                        <button
                          onClick={() => handleUpdateRole(p.id, 'teacher')}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        >
                          Teacher
                        </button>
                        <button
                          onClick={() => handleUpdateRole(p.id, 'admin')}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        >
                          Admin
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
