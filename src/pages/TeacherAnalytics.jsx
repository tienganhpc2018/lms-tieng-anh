import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { BarChart2, Users, Award, BookOpen, Search, Download } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function TeacherAnalytics() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [trackings, setTrackings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch danh sách khóa học của giáo viên
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('courses')
        .select('*')
        .eq('teacher_id', user.id);

      const list = data || [];
      setCourses(list);
      if (list.length > 0) {
        setSelectedCourseId(list[0].id);
      }
      setLoading(false);
    };

    if (user) fetchCourses();
  }, [user]);

  // Fetch dữ liệu điểm số & tracking của khóa học chọn
  useEffect(() => {
    if (!selectedCourseId) return;

    const fetchAnalytics = async () => {
      setLoading(true);

      // 1. Fetch tất cả submissions trong các activity thuộc course này
      const { data: subData } = await supabase
        .from('submissions')
        .select('*, profiles:student_id (full_name, email), activities:activity_id (title, type)')
        .order('submitted_at', { ascending: false });

      // 2. Fetch tracking SCORM/H5P
      const { data: trackData } = await supabase
        .from('scorm_h5p_tracking')
        .select('*, profiles:student_id (full_name, email), activities:activity_id (title, type)')
        .order('updated_at', { ascending: false });

      setSubmissions(subData || []);
      setTrackings(trackData || []);
      setLoading(false);
    };

    fetchAnalytics();
  }, [selectedCourseId]);

  if (loading) return <LoadingSpinner text="Đang tổng hợp báo cáo kết quả học tập..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <BarChart2 className="w-6 h-6 text-emerald-600" />
            <span>Thống Kê Tiến Độ & Bảng Điểm Tổng Hợp</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý tỷ lệ hoàn thành bài tập, điểm số bài Quiz, SCORM & H5P của từng học sinh.
          </p>
        </div>

        {/* Selector Khóa học */}
        {courses.length > 0 && (
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Grid Stats tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Tổng Số Lượt Nộp Bài</span>
            <h3 className="text-2xl font-extrabold text-slate-900">{submissions.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Gói SCORM/H5P Đã Tương Tác</span>
            <h3 className="text-2xl font-extrabold text-slate-900">{trackings.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Điểm Số Trung Bình Lớp</span>
            <h3 className="text-2xl font-extrabold text-emerald-600">
              {submissions.length > 0
                ? (submissions.reduce((acc, s) => acc + (parseFloat(s.score) || 0), 0) / submissions.length).toFixed(1)
                : '0.0'}
            </h3>
          </div>
        </div>
      </div>

      {/* Bảng Chi Tiết Bài Nộp Quiz / Assignment */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
          Bảng Điểm Quiz & Bài Tập Về Nhà
        </h3>

        {submissions.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6 italic">Chưa có kết quả bài nộp.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Học Sinh</th>
                  <th className="py-3 px-4">Tên Hoạt Động</th>
                  <th className="py-3 px-4">Loại Module</th>
                  <th className="py-3 px-4">Điểm Số</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4">Thời Gian Nộp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {sub.profiles?.full_name || 'Học sinh'}
                      <span className="block text-xs font-normal text-slate-400">{sub.profiles?.email}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{sub.activities?.title || 'Bài tập'}</td>
                    <td className="py-3 px-4 uppercase text-xs font-bold text-slate-500">
                      {sub.activities?.type}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-emerald-600">
                      {sub.score} / 10
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        sub.status === 'graded' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {sub.status === 'graded' ? 'Đã chấm' : 'Đã nộp'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {new Date(sub.submitted_at).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bảng Chi Tiết SCORM & H5P Tracking */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
          Theo Dõi Bài Học SCORM & H5P Interactive
        </h3>

        {trackings.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6 italic">Chưa có dữ liệu SCORM/H5P.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Học Sinh</th>
                  <th className="py-3 px-4">Gói Học Liệu</th>
                  <th className="py-3 px-4">Loại Package</th>
                  <th className="py-3 px-4">Điểm SCORM</th>
                  <th className="py-3 px-4">Trạng Thái CMI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {trackings.map((tr) => (
                  <tr key={tr.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {tr.profiles?.full_name || 'Học sinh'}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{tr.activities?.title}</td>
                    <td className="py-3 px-4 uppercase text-xs font-bold text-slate-500">
                      {tr.activities?.type}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-amber-600">
                      {tr.score} / 100
                    </td>
                    <td className="py-3 px-4 uppercase text-xs font-bold text-emerald-600">
                      {tr.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
