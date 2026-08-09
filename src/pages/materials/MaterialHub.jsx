import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, FileText, Video, Plus, Send, ExternalLink, Shield, Sparkles } from 'lucide-react';

export const MaterialHub = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [materials, setMaterials] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Assign Modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [targetClassId, setTargetClassId] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    fetchMaterialsAndClasses();
  }, [user, role, selectedGrade, selectedType]);

  const fetchMaterialsAndClasses = async () => {
    if (!user || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      let query = supabase.from('materials').select('*, profiles(full_name)').order('created_at', { ascending: false });

      if (selectedGrade !== 'all') {
        query = query.eq('grade_level', Number(selectedGrade));
      }

      if (selectedType !== 'all') {
        query = query.eq('type', selectedType);
      }

      const { data: matData, error: matErr } = await query;
      if (matErr) throw matErr;
      setMaterials(matData || []);

      if (role === 'teacher' || role === 'admin') {
        const { data: clsData } = await supabase.from('classes').select('id, name, grade_level');
        setClasses(clsData || []);
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssignModal = (mat) => {
    setSelectedMaterial(mat);
    setAssignmentTitle(`Bài Tập: ${mat.title}`);
    if (classes.length > 0) setTargetClassId(classes[0].id);
    setShowAssignModal(true);
  };

  const handleAssignToClass = async (e) => {
    e.preventDefault();
    if (!selectedMaterial || !targetClassId) return;

    setAssignLoading(true);
    try {
      const { error } = await supabase.from('assignments').insert({
        material_id: selectedMaterial.id,
        class_id: targetClassId,
        title: assignmentTitle,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        assignment_type: 'material',
      });

      if (error) throw error;
      alert('Đã giao học liệu/trò chơi cho lớp thành công!');
      setShowAssignModal(false);
    } catch (err) {
      alert('Lỗi giao bài: ' + err.message);
    } finally {
      setAssignLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'game_iframe':
      case 'game_html5':
        return <Gamepad2 className="w-5 h-5 text-emerald-400" />;
      case 'video':
        return <Video className="w-5 h-5 text-purple-400" />;
      default:
        return <FileText className="w-5 h-5 text-brand-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-100">Kho Học Liệu & Trò Chơi Tương Tác</h1>
          <p className="text-xs text-slate-400">Tài liệu, Video, iFrame Wordwall/Quizizz & Game HTML5 Zip đóng gói</p>
        </div>

        {(role === 'teacher' || role === 'admin') && (
          <Button onClick={() => navigate('/materials/create')} variant="primary" icon={Plus}>
            Tải Học Liệu / Game Mới
          </Button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 glass-panel rounded-2xl p-4 border border-slate-800">
        <span className="text-xs font-bold text-slate-400">Bộ lọc:</span>
        
        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
        >
          <option value="all">Tất cả Khối Lớp</option>
          <option value="6">Khối 6</option>
          <option value="7">Khối 7</option>
          <option value="8">Khối 8</option>
          <option value="9">Khối 9</option>
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
        >
          <option value="all">Tất cả Định dạng</option>
          <option value="document">Tài liệu (PDF, Word, PPTX)</option>
          <option value="video">Video Giảng Dạy (MP4)</option>
          <option value="game_iframe">Game Embed (Wordwall / Quizizz)</option>
          <option value="game_html5">Game HTML5 Packaged Zip</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner label="Đang nạp kho học liệu..." />
      ) : materials.length === 0 ? (
        <EmptyState
          icon={Gamepad2}
          title="Chưa có học liệu phù hợp"
          description="Kho tài liệu chưa có dữ liệu cho bộ lọc được chọn."
          actionText={role !== 'student' ? 'Tải Học Liệu Mới' : undefined}
          onAction={role !== 'student' ? () => navigate('/materials/create') : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((mat) => (
            <Card key={mat.id} hoverable className="flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(mat.type)}
                    <Badge variant={mat.type.includes('game') ? 'emerald' : 'brand'}>
                      {mat.type.toUpperCase()}
                    </Badge>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">Lớp {mat.grade_level || 'Chung'}</span>
                </div>

                <h3 className="font-bold text-base text-slate-100 mb-1 hover:text-brand-300 transition-colors">
                  {mat.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2">{mat.description || 'Chưa có mô tả.'}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <Button
                  onClick={() => navigate(`/materials/${mat.id}`)}
                  variant="ghost"
                  size="sm"
                  icon={ExternalLink}
                >
                  Mở Trải Nghiệm
                </Button>

                {(role === 'teacher' || role === 'admin') && (
                  <Button
                    onClick={() => handleOpenAssignModal(mat)}
                    variant="emerald"
                    size="sm"
                    icon={Send}
                  >
                    Giao Cho Lớp
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Assign Modal */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Giao Học Liệu / Game Cho Lớp">
        <form onSubmit={handleAssignToClass} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Tiêu Đề Bài Giao</label>
            <input
              type="text"
              required
              value={assignmentTitle}
              onChange={(e) => setAssignmentTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Chọn Lớp Học Hướng Tới</label>
            <select
              value={targetClassId}
              onChange={(e) => setTargetClassId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Lớp {c.grade_level})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Hạn Chót Nộp (Deadline)</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setShowAssignModal(false)}>
              Hủy
            </Button>
            <Button type="submit" loading={assignLoading} variant="emerald">
              Xác Nhận Giao Bài
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
