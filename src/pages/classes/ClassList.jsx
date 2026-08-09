import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Key, LogIn, Sparkles, BookOpen } from 'lucide-react';

export const ClassList = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Form states
  const [className, setClassName] = useState('');
  const [description, setDescription] = useState('');
  const [gradeLevel, setGradeLevel] = useState(6);
  const [joinCode, setJoinCode] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, [user, role]);

  const fetchClasses = async () => {
    if (!user || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (role === 'teacher' || role === 'admin') {
        const { data, error } = await supabase
          .from('classes')
          .select('*, class_members(count)')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setClasses(data || []);
      } else {
        // Student enrolled classes
        const { data, error } = await supabase
          .from('class_members')
          .select('classes(*)')
          .eq('student_id', user.id);

        if (error) throw error;
        setClasses(data?.map((item) => item.classes).filter(Boolean) || []);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateClassCode = () => {
    return 'ENG' + Math.floor(10000 + Math.random() * 90000);
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const code = generateClassCode();
      const { data, error } = await supabase
        .from('classes')
        .insert({
          name: className,
          description,
          code,
          grade_level: Number(gradeLevel),
          teacher_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      alert(`Tạo lớp học thành công! Mã tham gia lớp: ${code}`);
      setShowCreateModal(false);
      setClassName('');
      setDescription('');
      fetchClasses();
    } catch (err) {
      console.error(err);
      alert('Lỗi tạo lớp học: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinClass = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const { data: targetClass, error: findError } = await supabase
        .from('classes')
        .select('id, name')
        .eq('code', joinCode.trim().toUpperCase())
        .single();

      if (findError || !targetClass) {
        throw new Error('Mã lớp học không tồn tại. Vui lòng kiểm tra lại!');
      }

      const { error: joinError } = await supabase
        .from('class_members')
        .insert({
          class_id: targetClass.id,
          student_id: user.id,
        });

      if (joinError) {
        if (joinError.code === '23505') {
          throw new Error('Bạn đã gia nhập lớp học này trước đó rồi.');
        }
        throw joinError;
      }

      alert(`Gia nhập thành công lớp: ${targetClass.name}`);
      setShowJoinModal(false);
      setJoinCode('');
      fetchClasses();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-100">Quản Lý Lớp Học & Học Sinh</h1>
          <p className="text-xs text-slate-400">Danh sách các lớp học Tiếng Anh chương trình Global Success 6-9</p>
        </div>

        <div className="flex items-center gap-3">
          {role === 'student' && (
            <Button onClick={() => setShowJoinModal(true)} variant="emerald" icon={LogIn}>
              Nhập Mã Vào Lớp
            </Button>
          )}
          {(role === 'teacher' || role === 'admin') && (
            <Button onClick={() => setShowCreateModal(true)} variant="primary" icon={Plus}>
              Tạo Lớp Học Mới
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Đang nạp danh sách lớp từ cơ sở dữ liệu Supabase..." />
      ) : classes.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Chưa có lớp học nào"
          description={
            role === 'student'
              ? 'Bạn chưa gia nhập lớp học nào. Nhập mã join code do giáo viên cung cấp để tham gia.'
              : 'Bạn chưa tạo lớp học nào. Hãy tạo lớp học mới để bắt đầu giao bài và quản lý học sinh.'
          }
          actionText={role === 'student' ? 'Nhập Mã Vào Lớp' : 'Tạo Lớp Học Mới'}
          onAction={role === 'student' ? () => setShowJoinModal(true) : () => setShowCreateModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => {
            const studentCount = cls.class_members?.[0]?.count || 0;
            return (
              <Card
                key={cls.id}
                hoverable
                onClick={() => navigate(`/classes/${cls.id}`)}
                className="space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="emerald">Lớp {cls.grade_level || 6}</Badge>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-900 text-brand-300 border border-slate-800 flex items-center gap-1">
                      <Key className="w-3 h-3" /> {cls.code}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mb-1 hover:text-brand-400 transition-colors">
                    {cls.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {cls.description || 'Chưa có mô tả lớp học.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-brand-400" /> Sĩ số: <strong className="text-slate-200">{studentCount}</strong> học sinh
                  </span>
                  <span className="text-brand-400 font-bold hover:underline">Chi tiết →</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Class Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Tạo Lớp Học Tiếng Anh Mới">
        <form onSubmit={handleCreateClass} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Tên Lớp Học</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Tiếng Anh 7A1 - Global Success"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Khối Lớp</label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
              >
                <option value={6}>Lớp 6</option>
                <option value={7}>Lớp 7</option>
                <option value={8}>Lớp 8</option>
                <option value={9}>Lớp 9</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Mã Lớp (Tự động sinh)</label>
              <input
                type="text"
                disabled
                value="Sẽ được cấp ngẫu nhiên"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Mô tả / Ghi chú</label>
            <textarea
              rows={3}
              placeholder="Nhập thông tin giới thiệu lớp học, lịch học..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>
              Hủy
            </Button>
            <Button type="submit" loading={actionLoading} variant="primary">
              Xác Nhận Tạo Lớp
            </Button>
          </div>
        </form>
      </Modal>

      {/* Join Class Modal */}
      <Modal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} title="Nhập Mã Để Gia Nhập Lớp Học">
        <form onSubmit={handleJoinClass} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Mã Gia Nhập (Join Code)</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: ENG12345"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-center font-mono text-lg tracking-widest text-brand-300 font-bold uppercase focus:outline-none focus:border-brand-500"
            />
          </div>
          <p className="text-xs text-slate-400">
            Mã lớp học gồm 8 ký tự do Giáo viên bộ môn cung cấp cho bạn.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setShowJoinModal(false)}>
              Hủy
            </Button>
            <Button type="submit" loading={actionLoading} variant="emerald">
              Tham Gia Lớp
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
