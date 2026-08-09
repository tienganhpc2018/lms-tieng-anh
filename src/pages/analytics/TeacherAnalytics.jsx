import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { BarChart3, Users, Award, CheckCircle2, Clock } from 'lucide-react';

export const TeacherAnalytics = () => {
  const { user, role } = useAuth();

  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_progress')
        .select('*, assignments(*), profiles(*)')
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setProgressList(data || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = progressList.filter((p) => p.status === 'completed').length;
  const avgScore = progressList.length > 0
    ? (progressList.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0) / progressList.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-black text-slate-100">Báo Cáo Tiến Độ & Bảng Điểm Học Sinh</h1>
        <p className="text-xs text-slate-400">Theo dõi tỉ lệ hoàn thành, bảng điểm trung bình và nhật ký làm bài</p>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-brand-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Tổng Lượt Làm Bài</p>
              <h3 className="text-3xl font-black text-slate-100 mt-1">{progressList.length}</h3>
            </div>
            <BarChart3 className="w-8 h-8 text-brand-400" />
          </div>
        </Card>

        <Card className="border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Đã Hoàn Thành</p>
              <h3 className="text-3xl font-black text-emerald-400 mt-1">{completedCount}</h3>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
        </Card>

        <Card className="border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Điểm Trung Bình</p>
              <h3 className="text-3xl font-black text-purple-400 mt-1">{avgScore} / 10.0</h3>
            </div>
            <Award className="w-8 h-8 text-purple-400" />
          </div>
        </Card>
      </div>

      {/* Gradebook Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-200">Bảng Điểm & Hoạt Động Làm Bài Gần Đây</h2>

        {loading ? (
          <LoadingSpinner label="Đang tải dữ liệu tiến độ..." />
        ) : progressList.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="Chưa có dữ liệu tiến độ"
            description="Học sinh chưa hoàn thành bài tập hay đề thi nào trong hệ thống."
          />
        ) : (
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/80 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Học Sinh</th>
                    <th className="px-4 py-3">Bài Tập / Đề Thi</th>
                    <th className="px-4 py-3">Trạng Thái</th>
                    <th className="px-4 py-3">Điểm Số</th>
                    <th className="px-4 py-3 text-right">Ngày Hoàn Thành</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {progressList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/40">
                      <td className="px-4 py-3 font-semibold text-slate-100">
                        {item.profiles?.full_name || item.profiles?.email || 'Học sinh'}
                      </td>
                      <td className="px-4 py-3 font-medium text-brand-300">
                        {item.assignments?.title || 'Bài tập tổng hợp'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={item.status === 'completed' ? 'emerald' : 'amber'}>
                          {item.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-100">
                        {item.score !== null ? `${item.score} điểm` : 'Chưa chấm'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 text-right">
                        {item.completed_at ? new Date(item.completed_at).toLocaleDateString('vi-VN') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
