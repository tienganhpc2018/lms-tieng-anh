import React, { useState } from 'react';
import { Plus, Filter, Calendar, Users, Award, CheckCircle2, Clock, FileText, Send } from 'lucide-react';
import { DEFAULT_CLASSES } from '../examStorage';

export default function AssignmentsTab() {
  const [filterSkill, setFilterSkill] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [assignments, setAssignments] = useState([
    {
      id: 'asg-1',
      title: 'Luyện tập Nghe Unit 1: Hobbies and Leisure',
      skill: 'Listening',
      targetClass: '8A1, 8A2',
      deadline: '2026-10-25 22:00',
      status: 'active',
      submittedCount: 32,
      totalCount: 74,
      rewardPoints: 50
    },
    {
      id: 'asg-2',
      title: 'Viết đoạn văn ngắn về cuộc sống làng quê (Unit 2)',
      skill: 'Writing',
      targetClass: '8A1',
      deadline: '2026-10-23 23:59',
      status: 'active',
      submittedCount: 38,
      totalCount: 38,
      rewardPoints: 100
    },
    {
      id: 'asg-3',
      title: 'Trắc nghiệm Từ vựng & Ngữ pháp Unit 1-2',
      skill: 'Grammar',
      targetClass: '8A3, 8A4',
      deadline: '2026-10-15 20:00',
      status: 'closed',
      submittedCount: 70,
      totalCount: 72,
      rewardPoints: 30
    },
    {
      id: 'asg-4',
      title: 'Thu âm bài nói: Giới thiệu câu lạc bộ yêu thích (Unit 3)',
      skill: 'Speaking',
      targetClass: '8A1, 8A2, 8A3, 8A4',
      deadline: '2026-10-28 23:59',
      status: 'active',
      submittedCount: 45,
      totalCount: 146,
      rewardPoints: 80
    }
  ]);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSkill, setNewSkill] = useState('Vocabulary');
  const [newClass, setNewClass] = useState('8A1');
  const [newDeadline, setNewDeadline] = useState('2026-10-30 23:59');
  const [newPoints, setNewPoints] = useState(50);

  const filteredAssignments = assignments.filter((a) => {
    if (filterSkill !== 'ALL' && a.skill !== filterSkill) return false;
    if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;
    return true;
  });

  const handleCreateAssignment = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newAsg = {
      id: `asg-${Date.now()}`,
      title: newTitle.trim(),
      skill: newSkill,
      targetClass: newClass,
      deadline: newDeadline,
      status: 'active',
      submittedCount: 0,
      totalCount: DEFAULT_CLASSES.find((c) => c.id === newClass)?.studentCount || 38,
      rewardPoints: Number(newPoints) || 50
    };

    setAssignments([newAsg, ...assignments]);
    setIsCreateModalOpen(false);
    setNewTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-sm">
              📚
            </span>
            <h2 className="text-lg font-black text-slate-800">Quản Lý & Giao Bài Tập Kỹ Năng</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Giao bài tập bổ trợ theo từng kỹ năng: Nghe, Nói, Đọc, Viết, Từ vựng, Ngữ pháp cho các lớp khối 8
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Giao bài tập mới</span>
        </button>
      </div>

      {/* Bộ lọc Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center space-x-2 text-slate-600 font-bold">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Bộ lọc:</span>
        </div>

        <select
          value={filterSkill}
          onChange={(e) => setFilterSkill(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
        >
          <option value="ALL">Tất cả kỹ năng</option>
          <option value="Listening">🎧 Kỹ năng Nghe (Listening)</option>
          <option value="Speaking">🗣️ Kỹ năng Nói (Speaking)</option>
          <option value="Reading">📖 Kỹ năng Đọc (Reading)</option>
          <option value="Writing">✍️ Kỹ năng Viết (Writing)</option>
          <option value="Vocabulary">🔤 Từ vựng (Vocabulary)</option>
          <option value="Grammar">🧩 Ngữ pháp (Grammar)</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="active">🟢 Đang mở nộp bài</option>
          <option value="closed">🔴 Đã quá hạn nộp</option>
        </select>
      </div>

      {/* Danh sách bài tập đã giao */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAssignments.map((asg) => (
          <div
            key={asg.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {asg.skill}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    asg.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {asg.status === 'active' ? '🟢 Đang mở' : '🔴 Đã đóng'}
                </span>
              </div>

              <h3 className="font-extrabold text-slate-900 text-sm mb-2">{asg.title}</h3>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Lớp nhận bài: <b className="text-slate-800">{asg.targetClass}</b></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hạn chót: <b className="text-slate-800">{asg.deadline}</b></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Điểm thưởng hoàn thành: <b className="text-amber-700">+{asg.rewardPoints} sao</b></span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs">
                <span className="text-slate-500 font-medium">Tiến độ nộp bài: </span>
                <span className="font-bold text-emerald-700">
                  {asg.submittedCount}/{asg.totalCount} HS
                </span>
              </div>
              <button
                onClick={() => alert(`Xem chi tiết bài nộp của ${asg.title}`)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
              >
                Xem chi tiết bài nộp
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Giao Bài Tập Mới */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="font-black text-slate-800 text-base mb-3">Soạn & Giao Bài Tập Kỹ Năng Mới</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Tiêu đề bài tập:</label>
                <input
                  type="text"
                  placeholder="VD: Luyện tập thì hiện tại đơn Unit 1..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Kỹ năng:</label>
                  <select
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Listening">Nghe (Listening)</option>
                    <option value="Speaking">Nói (Speaking)</option>
                    <option value="Reading">Đọc (Reading)</option>
                    <option value="Writing">Viết (Writing)</option>
                    <option value="Vocabulary">Từ vựng (Vocabulary)</option>
                    <option value="Grammar">Ngữ pháp (Grammar)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Lớp nhận:</label>
                  <select
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="8A1">Lớp 8A1</option>
                    <option value="8A2">Lớp 8A2</option>
                    <option value="8A3">Lớp 8A3</option>
                    <option value="8A4">Lớp 8A4</option>
                    <option value="8A1, 8A2, 8A3, 8A4">Tất cả các lớp</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Hạn nộp bài:</label>
                  <input
                    type="text"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Điểm thưởng sao:</label>
                  <input
                    type="number"
                    value={newPoints}
                    onChange={(e) => setNewPoints(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                >
                  Giao bài tập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
