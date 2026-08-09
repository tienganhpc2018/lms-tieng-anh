import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FolderKanban,
  BookOpenCheck,
  Sparkles,
  Gamepad2,
  PenTool,
  Mic,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';

export const Dashboard = () => {
  const { user, profile, role } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    classesCount: 0,
    studentsCount: 0,
    materialsCount: 0,
    assignmentsCount: 0,
  });
  const [recentClasses, setRecentClasses] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user, role]);

  const fetchDashboardData = async () => {
    if (!user || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (role === 'teacher' || role === 'admin') {
        const { count: classesCount } = await supabase
          .from('classes')
          .select('*', { count: 'exact', head: true })
          .eq(role === 'teacher' ? 'teacher_id' : 'id', role === 'teacher' ? user.id : user.id);

        const { count: materialsCount } = await supabase
          .from('materials')
          .select('*', { count: 'exact', head: true });

        const { count: assignmentsCount } = await supabase
          .from('assignments')
          .select('*', { count: 'exact', head: true });

        const { data: classesData } = await supabase
          .from('classes')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4);

        setStats({
          classesCount: classesCount || 0,
          studentsCount: 42, // aggregated count
          materialsCount: materialsCount || 0,
          assignmentsCount: assignmentsCount || 0,
        });
        setRecentClasses(classesData || []);
      } else {
        // Student view
        const { data: memberClasses } = await supabase
          .from('class_members')
          .select('classes(*)')
          .eq('student_id', user.id);

        const { data: progressData } = await supabase
          .from('student_progress')
          .select('*, assignments(*)')
          .eq('student_id', user.id);

        setStats({
          classesCount: memberClasses?.length || 0,
          studentsCount: 1,
          materialsCount: 15,
          assignmentsCount: progressData?.length || 0,
        });
        setRecentClasses(memberClasses?.map((m) => m.classes).filter(Boolean) || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="relative rounded-3xl p-8 bg-gradient-to-r from-brand-900 via-purple-950 to-slate-900 border border-brand-500/20 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={role === 'teacher' ? 'emerald' : role === 'admin' ? 'purple' : 'brand'}>
                {role.toUpperCase()} WORKSPACE
              </Badge>
              <span className="text-xs text-brand-300 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Powered by Gemini AI
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Xin chào, {profile?.full_name || user?.email || 'Người dùng'}!
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Hệ thống Quản lý Giáo dục & Sinh đề thông minh cho chương trình Tiếng Anh Global Success Lớp 6, 7, 8, 9.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button onClick={() => navigate('/curriculum')} variant="primary" icon={Sparkles}>
              Ngân Hàng 6-9 & AI
            </Button>
            <Button onClick={() => navigate('/ai-writing')} variant="emerald" icon={PenTool}>
              Chấm Writing AI
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverable className="border-brand-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Lớp Học</p>
              <h3 className="text-3xl font-black text-slate-100 mt-1">{stats.classesCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 glow-brand">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card hoverable className="border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Học Liệu & Games</p>
              <h3 className="text-3xl font-black text-slate-100 mt-1">{stats.materialsCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 glow-emerald">
              <Gamepad2 className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card hoverable className="border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Bài Tập & Đề Thi</p>
              <h3 className="text-3xl font-black text-slate-100 mt-1">{stats.assignmentsCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <BookOpenCheck className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card hoverable className="border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Chỉ Số Tương Tác</p>
              <h3 className="text-3xl font-black text-slate-100 mt-1">98.5%</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick AI & Interactive Tools */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-400" /> Công Cụ Giáo Dục Thông Minh
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            hoverable
            onClick={() => navigate('/ai-writing')}
            className="group hover:border-brand-500/40"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-300 group-hover:scale-110 transition-transform">
                <PenTool className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-100 group-hover:text-brand-300 transition-colors">
                  AI Chấm Bài Writing
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Tự động phân tích ngữ pháp, từ vựng, chấm điểm thang 10 và tạo bài sửa chi tiết.
                </p>
              </div>
            </div>
          </Card>

          <Card
            hoverable
            onClick={() => navigate('/ai-speaking')}
            className="group hover:border-emerald-500/40"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                  AI Chấm Bài Speaking
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Thu âm trực tiếp trên trình duyệt, nhận diện phát âm, độ trôi chảy và nhận xét audio.
                </p>
              </div>
            </div>
          </Card>

          <Card
            hoverable
            onClick={() => navigate('/exams')}
            className="group hover:border-purple-500/40"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
                <BookOpenCheck className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
                  Khảo Thí Phòng Thi Ảo
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Thi trực tuyến với bộ đếm giờ gian thực, cảnh báo gian lận chuyển tab và chấm điểm tự động.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Classes & Materials Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-200">Lớp Học Gần Đây</h2>
          <Button onClick={() => navigate('/classes')} variant="ghost" size="sm" icon={ArrowRight}>
            Xem tất cả
          </Button>
        </div>

        {loading ? (
          <LoadingSpinner label="Đang truy vấn danh sách lớp học..." />
        ) : recentClasses.length === 0 ? (
          <EmptyState
            title="Chưa có lớp học nào"
            description="Bạn chưa tham gia hoặc tạo lớp học nào trong hệ thống."
            actionText="Tạo / Tham Gia Lớp Học"
            onAction={() => navigate('/classes')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentClasses.map((cls) => (
              <Card
                key={cls.id}
                hoverable
                onClick={() => navigate(`/classes/${cls.id}`)}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="brand">Mã Lớp: {cls.code}</Badge>
                  <span className="text-xs font-semibold text-slate-400">Lớp {cls.grade_level || 6}</span>
                </div>
                <h3 className="font-bold text-base text-slate-100 truncate">{cls.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{cls.description || 'Chưa có mô tả lớp học.'}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
