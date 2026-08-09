import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { useNavigate } from 'react-router-dom';
import { BookOpenCheck, Clock, ShieldAlert, Sparkles, Play } from 'lucide-react';

export const ExamList = () => {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('virtual_exams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExams(data || []);
    } catch (err) {
      console.error('Error fetching exams:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-100">Khảo Thí Phòng Thi Ảo (Virtual Exam Room)</h1>
          <p className="text-xs text-slate-400">Thi trực tuyến với đồng hồ đếm ngược, chống gian lận & chấm điểm tự động</p>
        </div>

        <Button onClick={() => navigate('/ai-test-gen')} variant="primary" icon={Sparkles}>
          Sinh Đề Mới Bằng AI
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner label="Đang nạp danh sách đề thi phòng thi ảo..." />
      ) : exams.length === 0 ? (
        <EmptyState
          icon={BookOpenCheck}
          title="Chưa có đề thi ảo nào"
          description="Hãy dùng công cụ AI Sinh Đề Thi để tự động khởi tạo bộ đề thi trắc nghiệm mới."
          actionText="Sinh Đề Thi Mới"
          onAction={() => navigate('/ai-test-gen')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <Card key={exam.id} hoverable className="space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="emerald">LỚP {exam.grade}</Badge>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-brand-400" /> {exam.duration_minutes} Phút
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-100 mb-1">{exam.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{exam.description || 'Đề thi khảo thí trực tuyến.'}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  {exam.questions?.length || 0} Câu Hỏi
                </span>
                <Button
                  onClick={() => navigate(`/exams/${exam.id}`)}
                  variant="emerald"
                  size="sm"
                  icon={Play}
                >
                  Vào Phòng Thi
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
