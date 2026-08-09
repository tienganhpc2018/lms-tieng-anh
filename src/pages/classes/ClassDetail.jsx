import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Users, UserPlus, Key, ArrowLeft, BookOpen, Upload, Trash2, CheckCircle2 } from 'lucide-react';

export const ClassDetail = () => {
  const { id: classId } = useParams();
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add student modal
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [csvText, setCsvText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchClassDetails();
  }, [classId]);

  const fetchClassDetails = async () => {
    if (!classId || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // 1. Fetch class info
      const { data: clsData, error: clsError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();
      if (clsError) throw clsError;
      setClassInfo(clsData);

      // 2. Fetch enrolled students
      const { data: memberData } = await supabase
        .from('class_members')
        .select('id, joined_at, profiles(*)')
        .eq('class_id', classId);

      setStudents(memberData?.map((m) => ({ ...m.profiles, member_id: m.id, joined_at: m.joined_at })) || []);

      // 3. Fetch class assignments
      const { data: assignData } = await supabase
        .from('assignments')
        .select('*, materials(*)')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      setAssignments(assignData || []);
    } catch (err) {
      console.error('Error fetching class details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudentByEmail = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const { data: studentProfile, error: profileErr } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', studentEmail.trim())
        .single();

      if (profileErr || !studentProfile) {
        throw new Error('Không tìm thấy tài khoản học sinh có email này.');
      }

      const { error: insertErr } = await supabase.from('class_members').insert({
        class_id: classId,
        student_id: studentProfile.id,
      });

      if (insertErr) throw insertErr;

      alert('Đã thêm học sinh vào lớp!');
      setStudentEmail('');
      setShowAddStudentModal(false);
      fetchClassDetails();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBatchImportCsv = async () => {
    if (!csvText.trim()) return;
    setActionLoading(true);
    const emails = csvText.split('\n').map((line) => line.trim()).filter(Boolean);

    try {
      let added = 0;
      for (const email of emails) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single();

        if (profile) {
          await supabase.from('class_members').insert({
            class_id: classId,
            student_id: profile.id,
          }).catch(() => {});
          added++;
        }
      }
      alert(`Đã thêm ${added}/${emails.length} học sinh thành công!`);
      setCsvText('');
      setShowAddStudentModal(false);
      fetchClassDetails();
    } catch (err) {
      alert('Lỗi import: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Đang tải dữ liệu lớp học..." />;
  }

  if (!classInfo) {
    return (
      <EmptyState
        title="Không tìm thấy lớp học"
        description="Lớp học này có thể đã bị xóa hoặc bạn không có quyền xem."
        actionText="Trở về Danh Sách Lớp"
        onAction={() => navigate('/classes')}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate('/classes')} variant="ghost" size="sm" icon={ArrowLeft}>
          Quay lại
        </Button>
      </div>

      {/* Class Banner Header */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="emerald">Khối Lớp {classInfo.grade_level || 6}</Badge>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-slate-900 text-brand-300 border border-slate-800 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" /> Mã Lớp: {classInfo.code}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-100">{classInfo.name}</h1>
          <p className="text-xs text-slate-400 max-w-xl">{classInfo.description || 'Chưa có mô tả chi tiết cho lớp học này.'}</p>
        </div>

        {(role === 'teacher' || role === 'admin') && (
          <div className="flex items-center gap-3 shrink-0">
            <Button onClick={() => setShowAddStudentModal(true)} variant="primary" icon={UserPlus}>
              Thêm Học Sinh
            </Button>
            <Button onClick={() => navigate('/materials')} variant="emerald" icon={BookOpen}>
              Giao Bài Học / Game
            </Button>
          </div>
        )}
      </div>

      {/* Grid Layout: Student Roster & Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Roster */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-400" /> Danh Sách Học Sinh ({students.length})
            </h2>
          </div>

          {students.length === 0 ? (
            <EmptyState
              title="Lớp chưa có học sinh"
              description="Hãy chia sẻ Mã Gia Nhập Lớp (Join Code) hoặc Thêm Học Sinh theo email."
            />
          ) : (
            <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-900/80 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Học Sinh</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Ngày Gia Nhập</th>
                      <th className="px-4 py-3 text-right">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {students.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-900/40">
                        <td className="px-4 py-3 font-semibold text-slate-100 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-brand-500/20 text-brand-300 font-bold flex items-center justify-center text-xs">
                            {st.full_name?.charAt(0).toUpperCase() || 'S'}
                          </div>
                          {st.full_name || 'Chưa cập nhật'}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">{st.email}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {new Date(st.joined_at).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Đang Học
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Assigned Materials & Assignments */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" /> Học Liệu Đã Giao ({assignments.length})
          </h2>

          {assignments.length === 0 ? (
            <EmptyState
              title="Chưa giao bài tập"
              description="Giáo viên chưa chọn học liệu hay trò chơi nào để giao cho lớp này."
            />
          ) : (
            <div className="space-y-3">
              {assignments.map((asgn) => (
                <Card key={asgn.id} hoverable className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="purple">{asgn.assignment_type.toUpperCase()}</Badge>
                    <span className="text-[11px] text-amber-400 font-medium">
                      Hạn: {asgn.due_date ? new Date(asgn.due_date).toLocaleDateString('vi-VN') : 'Không hạn'}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-100">{asgn.title}</h4>
                  <p className="text-xs text-slate-400">{asgn.description || 'Chưa có yêu cầu chi tiết.'}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      <Modal isOpen={showAddStudentModal} onClose={() => setShowAddStudentModal(false)} title="Thêm Học Sinh Vào Lớp">
        <div className="space-y-6">
          <form onSubmit={handleAddStudentByEmail} className="space-y-3">
            <h4 className="font-bold text-sm text-slate-200">Cách 1: Thêm trực tiếp theo Email</h4>
            <div className="flex gap-2">
              <input
                type="email"
                required
                placeholder="student@school.edu.vn"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
              />
              <Button type="submit" loading={actionLoading} variant="primary">
                Thêm Email
              </Button>
            </div>
          </form>

          <hr className="border-slate-800" />

          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-200 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-emerald-400" /> Cách 2: Import Danh Sách Email từ CSV / Excel
            </h4>
            <textarea
              rows={4}
              placeholder="Dán danh sách Email học sinh (Mỗi email một dòng)..."
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-brand-500"
            />
            <Button onClick={handleBatchImportCsv} loading={actionLoading} variant="emerald" className="w-full">
              Thực Hiện Import Hàng Loạt
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
