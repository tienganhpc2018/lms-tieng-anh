import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, UserPlus, Upload, Search, X, CheckCircle, Shield, GraduationCap, Lock, Trash2 } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

export default function EnrolledUsersModal({ isOpen, onClose, courseId, isTeacher }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'manual' | 'file'

  // State Thêm Thủ Công
  const [searchEmail, setSearchEmail] = useState('');
  const [assignRole, setAssignRole] = useState('student');
  const [enrolling, setEnrolling] = useState(false);

  // State Upload File CSV
  const [fileContent, setFileContent] = useState('');

  const fetchEnrolledUsers = async () => {
    setLoading(true);
    // Fetch Enrollments kèm Profile
    const { data, error } = await supabase
      .from('course_enrollments')
      .select('*, profile:user_id (*)')
      .eq('course_id', courseId)
      .order('enrolled_at', { ascending: false });

    if (!error) {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && courseId) fetchEnrolledUsers();
  }, [isOpen, courseId]);

  if (!isOpen) return null;

  // Thêm Người Học Thủ Công
  const handleEnrolManual = async (e) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;
    setEnrolling(true);

    // 1. Tìm profile theo email
    const { data: targetProfile, error: pErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', searchEmail.trim())
      .maybeSingle();

    if (pErr || !targetProfile) {
      alert(`Không tìm thấy tài khoản người dùng với email "${searchEmail}". Học viên cần đăng ký tài khoản trước!`);
      setEnrolling(false);
      return;
    }

    // 2. Ghi danh (Enrol)
    const { error: eErr } = await supabase.from('course_enrollments').upsert([
      {
        course_id: courseId,
        user_id: targetProfile.id,
        role: assignRole,
        status: 'active',
      },
    ]);

    if (eErr) {
      alert('Lỗi thêm người học: ' + eErr.message);
    } else {
      alert(`Đã thêm thành công "${targetProfile.full_name}" vào khóa học!`);
      setSearchEmail('');
      setActiveTab('list');
      await fetchEnrolledUsers();
    }
    setEnrolling(false);
  };

  // Xóa Người Học Khỏi Khóa Học
  const handleRemoveUser = async (enrollmentId, userName) => {
    if (!confirm(`Bạn có chắc muốn xóa người học "${userName}" khỏi khóa học?`)) return;

    await supabase.from('course_enrollments').delete().eq('id', enrollmentId);
    await fetchEnrolledUsers();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 my-8">
        {/* Header Modal */}
        <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-base">Quản Lý Người Học Khóa Học (Enrolled Users)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 space-x-4">
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-3 text-xs font-bold transition flex items-center space-x-1.5 border-b-2 ${
              activeTab === 'list'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Danh Sách Người Học ({users.length})</span>
          </button>

          {isTeacher && (
            <button
              onClick={() => setActiveTab('manual')}
              className={`pb-3 text-xs font-bold transition flex items-center space-x-1.5 border-b-2 ${
                activeTab === 'manual'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Enrol Users (Thêm Thủ Công)</span>
            </button>
          )}
        </div>

        {/* TAB 1: DANH SÁCH ENROLLED USERS */}
        {activeTab === 'list' && (
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {loading ? (
              <LoadingSpinner text="Đang tải danh sách người học..." />
            ) : users.length === 0 ? (
              <div className="p-8 text-center border border-dashed rounded-2xl text-slate-400 text-xs">
                Chưa có người học nào trong khóa học này. Bấm "Enrol Users" để thêm học sinh!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 text-[11px] uppercase font-bold border-b border-slate-200">
                      <th className="py-3 px-4">Người Học (Avatar)</th>
                      <th className="py-3 px-4">Email Address</th>
                      <th className="py-3 px-4">Vai Trò (Role)</th>
                      <th className="py-3 px-4">Trạng Thái</th>
                      {isTeacher && <th className="py-3 px-4 text-right">Thao Tác</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium">
                    {users.map((item) => {
                      const p = item.profile;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-4 flex items-center space-x-3">
                            <img
                              src={p?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${p?.email || 'user'}`}
                              alt={p?.full_name}
                              className="w-8 h-8 rounded-full bg-slate-200 border"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block">{p?.full_name || 'Người dùng'}</span>
                              <span className="text-[10px] text-slate-400">{p?.class_name || 'Học viên'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{p?.email}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.role === 'teacher' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                            }`}>
                              {item.role === 'teacher' ? 'Teacher' : 'Student'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold uppercase">
                              {item.status}
                            </span>
                          </td>
                          {isTeacher && (
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleRemoveUser(item.id, p?.full_name)}
                                title="Xóa khỏi khóa học"
                                className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: THÊM NGƯỜI HỌC THỦ CÔNG (ENROL USERS) */}
        {activeTab === 'manual' && (
          <form onSubmit={handleEnrolManual} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nhập Email Người Học Cần Thêm *
              </label>
              <input
                type="email"
                required
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="nguyenvana@gmail.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Gán Vai Trò Trong Khóa Học (Assign Role)
              </label>
              <select
                value={assignRole}
                onChange={(e) => setAssignRole(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="student">Student (Học Sinh)</option>
                <option value="teacher">Teacher (Giáo Viên Phụ Trách)</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-4 py-2 text-slate-600 rounded-xl text-xs font-semibold"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                disabled={enrolling}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
              >
                {enrolling ? 'Đang thêm...' : 'Enrol Users (Ghi Danh)'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
