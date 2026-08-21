import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import CourseSidebar from '../components/lms/CourseSidebar';
import EnrolledUsersModal from '../components/lms/EnrolledUsersModal';
import CenterToastModal from '../components/common/CenterToastModal';
import { BookOpen, Plus, Users, ArrowLeft, Key, Eye, EyeOff, Copy, Check, Lock, ChevronRight, PlayCircle, FileText, CheckSquare, Palette } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function CourseView() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { user, profile, isTeacher } = useAuth();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [newActTitle, setNewActTitle] = useState('');
  const [newActType, setNewActType] = useState('whiteboard'); // Mặc định chọn Whiteboard chuẩn Ảnh
  const [creatingAct, setCreatingAct] = useState(false);

  const [isEnrolledModalOpen, setIsEnrolledModalOpen] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, type: 'info', title: '', message: '' });

  // Modals Quản trị Bài học (Sửa, Xóa, Ẩn/Hiện, Hẹn giờ)
  const [editingAct, setEditingAct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState('quiz');

  const [schedulingAct, setSchedulingAct] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const showToast = (type, title, message) => {
    setToast({ isOpen: true, type, title, message });
  };

  // 1-Click Ẩn / Hiện Bài học
  const handleToggleHideActivity = async (act, e) => {
    e.stopPropagation();
    const newIsHidden = !act.is_hidden;
    try {
      await supabase.from('activities').update({ is_hidden: newIsHidden }).eq('id', act.id);
    } catch (err) {}

    setActivities((prev) =>
      prev.map((a) => (a.id === act.id ? { ...a, is_hidden: newIsHidden } : a))
    );
    showToast(
      'success',
      newIsHidden ? 'Đã Ẩn Bài Học' : 'Đã Mở Hiện Bài Học',
      `Bài học "${act.title}" ${newIsHidden ? 'đã ẩn khỏi Học sinh.' : 'đã hiển thị cho Học sinh.'}`
    );
  };

  // 1-Click Xóa Bài học
  const handleDeleteActivity = async (act, e) => {
    e.stopPropagation();
    if (!window.confirm(`Thầy có chắc chắn muốn xóa bài học "${act.title}" này không?`)) return;
    try {
      await supabase.from('activities').delete().eq('id', act.id);
    } catch (err) {}

    setActivities((prev) => prev.filter((a) => a.id !== act.id));
    showToast('success', 'Đã Xóa Bài Học', `Đã xóa bài học "${act.title}" thành công!`);
  };

  // Cập nhật Sửa Bài học
  const handleSaveEditActivity = async (e) => {
    e.preventDefault();
    if (!editingAct) return;
    try {
      await supabase
        .from('activities')
        .update({ title: editTitle, type: editType })
        .eq('id', editingAct.id);
    } catch (err) {}

    setActivities((prev) =>
      prev.map((a) => (a.id === editingAct.id ? { ...a, title: editTitle, type: editType } : a))
    );
    setIsEditModalOpen(false);
    showToast('success', 'Đã Sửa Bài Học', 'Cập nhật tên và loại bài học thành công!');
  };

  // Cập nhật Cài Lịch Hẹn Giờ Khóa / Mở Tự Động
  const handleSaveScheduleActivity = async (e) => {
    e.preventDefault();
    if (!schedulingAct) return;
    const startIso = startTime ? new Date(startTime).toISOString() : null;
    const endIso = endTime ? new Date(endTime).toISOString() : null;

    try {
      await supabase
        .from('activities')
        .update({ start_time: startIso, end_time: endIso })
        .eq('id', schedulingAct.id);
    } catch (err) {}

    setActivities((prev) =>
      prev.map((a) => (a.id === schedulingAct.id ? { ...a, start_time: startIso, end_time: endIso } : a))
    );
    setIsScheduleModalOpen(false);
    showToast('success', 'Đã Cài Lịch Hẹn Giờ', 'Lịch tự động mở/khóa bài học đã được cập nhật!');
  };

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      const { data: cData } = await supabase
        .from('courses')
        .select('*, teacher:teacher_id (full_name, email)')
        .eq('id', courseId)
        .single();
      setCourse(cData);

      const { data: sData } = await supabase
        .from('course_sections')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (sData && sData.length > 0) {
        setSections(sData);
        setActiveSectionId(sData[0].id);
      }
    } catch (e) {}
    setLoading(false);
  };

  const fetchActivities = async () => {
    if (!activeSectionId) return;
    try {
      const { data: aData } = await supabase
        .from('activities')
        .select('*')
        .eq('section_id', activeSectionId)
        .order('order_index', { ascending: true });
      setActivities(aData || []);
    } catch (e) {}
  };

  const [isEnrolled, setIsEnrolled] = useState(true);

  const checkEnrollment = async () => {
    const userIsTeacher = isTeacher || profile?.is_teacher || false;
    if (userIsTeacher) {
      setIsEnrolled(true);
      return;
    }
    if (!user) {
      setIsEnrolled(false);
      return;
    }
    try {
      const { data: eData } = await supabase
        .from('course_enrollments')
        .select('id')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .maybeSingle();

      setIsEnrolled(!!eData);
    } catch (e) {
      setIsEnrolled(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
    checkEnrollment();
  }, [courseId, user]);

  useEffect(() => {
    fetchActivities();
  }, [activeSectionId]);

  const handleSelectSection = (sId) => {
    setActiveSectionId(sId);
  };

  const handleAddSection = async (title) => {
    try {
      const { data, error } = await supabase
        .from('course_sections')
        .insert([
          {
            course_id: courseId,
            title,
            order_index: sections.length,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        setSections([...sections, data]);
        setActiveSectionId(data.id);
        setToast({ isOpen: true, type: 'success', title: 'Thành Công', message: 'Đã thêm chủ đề mới!' });
      }
    } catch (e) {}
  };

  // TẠO BÀI HỌC MỚI VÀ FIX TRIỆT ĐỂ LỖI LƯU (TỰ ĐỘNG TẠO CHỦ ĐỀ NẾU CHƯA CÓ VÀ ĐẢM BẢO COMPATIBILITY BẢNG SUPABASE)
  const handleCreateActivity = async (e) => {
    e.preventDefault();
    if (!newActTitle.trim()) {
      alert('Vui lòng nhập tên bài học!');
      return;
    }

    setCreatingAct(true);
    try {
      let targetSectionId = activeSectionId;

      // Nếu chưa có chủ đề (section) nào trong khóa học, tự động tạo "Chủ đề 1: Bài Học & Giảng Dạy"
      if (!targetSectionId) {
        const { data: newSec, error: secErr } = await supabase
          .from('course_sections')
          .insert([
            {
              course_id: courseId,
              title: 'Chủ đề 1: Bài Học & Giảng Dạy',
              order_index: 0,
            },
          ])
          .select()
          .single();

        if (secErr || !newSec) {
          throw new Error('Khóa học chưa có chủ đề bài học. Không thể tạo bài mới!');
        }
        targetSectionId = newSec.id;
        setSections([newSec]);
        setActiveSectionId(newSec.id);
      }

      // Hỗ trợ lưu type = 'whiteboard' trực tiếp vào DB Supabase theo SQL Constraint mới
      const isWhiteboardAct = newActType === 'whiteboard';
      const dbType = newActType;
      const formattedTitle = isWhiteboardAct && !newActTitle.includes('[WHITEBOARD]')
        ? `[WHITEBOARD] ${newActTitle.trim()}`
        : newActTitle.trim();

      const { data: newAct, error: actErr } = await supabase
        .from('activities')
        .insert([
          {
            section_id: targetSectionId,
            title: formattedTitle,
            type: dbType,
            order_index: activities.length,
          },
        ])
        .select()
        .single();

      if (actErr) {
        throw new Error(actErr.message || 'Lỗi lưu bài học vào hệ thống!');
      }

      if (newAct) {
        setIsAddActivityOpen(false);
        setNewActTitle('');
        setActivities((prev) => [...prev, newAct]);
        setToast({ isOpen: true, type: 'success', title: 'Thành Công', message: 'Đã tạo bài học mới thành công!' });

        if (newActType === 'whiteboard') {
          // Mở ngay trang Whiteboard với ID bài học này
          navigate(`/whiteboard?activityId=${newAct.id}`);
        }
      }
    } catch (err) {
      alert('❌ LỖI LƯU BÀI HỌC: ' + err.message);
    } finally {
      setCreatingAct(false);
    }
  };

  const handleActivityClick = (act) => {
    const isWhiteboard = act.type === 'whiteboard' || (act.title && act.title.includes('[WHITEBOARD]'));
    if (isWhiteboard) {
      navigate(`/whiteboard/${act.id}`);
    } else {
      navigate(`/assignment/${act.id}`);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Đang nạp dữ liệu chi tiết khóa học..." />;
  }

  if (!isEnrolled) {
    return (
      <div className="min-h-screen bg-slate-100 p-6 flex items-center justify-center font-sans">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto text-3xl font-extrabold shadow-2xs">
            🔒
          </div>
          <h3 className="text-base font-extrabold text-slate-900 uppercase">
            BẠN CHƯA THAM GIA KHÓA HỌC NÀY
          </h3>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            Vui lòng về lại Trang chủ, nhấp nút <span className="font-extrabold text-amber-600">"🔑 Nhập Mã Gia Nhập Lớp"</span> và dán mã do Thầy Hải cung cấp để tham gia học nhé!
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-extrabold text-xs transition shadow-md cursor-pointer"
          >
            🏠 Về Trang Chủ Khóa Học
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-100 p-8 flex items-center justify-center font-sans">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto text-3xl font-extrabold shadow-2xs">
            ⚠️
          </div>
          <h3 className="text-base font-extrabold text-slate-900 uppercase">
            KHÔNG TÌM THẤY DỮ LIỆU KHÓA HỌC
          </h3>
          <p className="text-xs text-slate-500 font-semibold">
            Khóa học này hiện không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            Quay Lại Trang Chủ Khóa Học
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8 font-sans select-none">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-600 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md">
                Khóa Học E-Learning
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                {course?.title || 'Chi Tiết Khóa Học'}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Giáo viên phụ trách: {course?.teacher?.full_name || 'Nguyễn Văn Hải'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isTeacher && (
              <button
                onClick={() => setIsEnrolledModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-lg transition flex items-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>Danh Sách Học Viên Enrolled</span>
              </button>
            )}
          </div>
        </div>

        {/* CẤU TRÚC 2 CỘT SIDEBAR & BÀI HỌC */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <CourseSidebar
              sections={sections}
              activeSectionId={activeSectionId}
              onSelectSection={handleSelectSection}
              onAddSection={handleAddSection}
              isTeacher={isTeacher}
              activities={activities}
            />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {sections.find((s) => s.id === activeSectionId)?.title || 'Danh Sách Bài Học'}
                  </h2>
                  <p className="text-xs text-slate-500">Hiển thị {activities.length} bài học trong chủ đề này</p>
                </div>

                {isTeacher && (
                  <button
                    onClick={() => setIsAddActivityOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Thêm Bài Học Mới</span>
                  </button>
                )}
              </div>

              {loading ? (
                <LoadingSpinner text="Đang tải bài học..." />
              ) : (() => {
                const displayableActivities = activities.filter((act) => {
                  if (isTeacher) return true;
                  if (act.is_hidden) return false; // HỌC SINH TUYỆT ĐỐI KHÔNG NHÌN THẤY BÀI HỌC ĐÃ ẨN
                  return true;
                });

                if (displayableActivities.length === 0) {
                  return (
                    <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl space-y-3">
                      <p className="text-xs text-slate-400 font-semibold">Chủ đề này chưa có bài học nào mở cho học sinh.</p>
                      {isTeacher && (
                        <button
                          onClick={() => setIsAddActivityOpen(true)}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md"
                        >
                          + Thêm Bài Học Mới Ngay
                        </button>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {displayableActivities.map((act) => {
                      const isWhiteboard = act.type === 'whiteboard' || (act.title && act.title.includes('[WHITEBOARD]'));
                      const now = new Date();
                      const isNotOpenYet = act.start_time && now < new Date(act.start_time);
                      const isExpired = act.end_time && now > new Date(act.end_time);
                      const isTimeLocked = isNotOpenYet || isExpired;

                      return (
                        <div
                          key={act.id}
                          onClick={() => {
                            if (!isTeacher && isTimeLocked) {
                              showToast('warning', 'Bài Học Đang Khóa', 'Bài học này hiện đang tạm khóa theo lịch hẹn của Thầy Hải!');
                              return;
                            }
                            handleActivityClick(act);
                          }}
                          className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group ${
                            act.is_hidden
                              ? 'bg-slate-200/60 border-slate-300 opacity-75'
                              : isTimeLocked
                              ? 'bg-rose-50/70 border-rose-200'
                              : isWhiteboard
                              ? 'bg-amber-50 hover:bg-amber-100 border-amber-300'
                              : 'bg-slate-50 hover:bg-emerald-50 border-slate-200 hover:border-emerald-300'
                          } ${!isTeacher && isTimeLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold shadow-2xs flex-shrink-0 ${
                              act.is_hidden
                                ? 'bg-slate-500 text-white'
                                : isTimeLocked
                                ? 'bg-rose-600 text-white'
                                : isWhiteboard
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-emerald-600 text-white'
                            }`}>
                              {act.is_hidden ? <Lock className="w-5 h-5" /> : isWhiteboard ? <Palette className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                            </div>

                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-2 flex-wrap gap-1">
                                <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                                  {act.title.replace('[WHITEBOARD]', '').trim()}
                                </h3>
                                {act.is_hidden && (
                                  <span className="px-2 py-0.5 bg-slate-900 text-amber-300 font-extrabold text-[10px] rounded-md border border-amber-500/40">
                                    🔒 ĐÃ ẨN KHỎI HỌC SINH
                                  </span>
                                )}
                                {isTimeLocked && (
                                  <span className="px-2 py-0.5 bg-rose-600 text-white font-extrabold text-[10px] rounded-md">
                                    ⏰ TỰ ĐỘNG KHÓA HẸN GIỜ
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-medium flex-wrap gap-y-1">
                                <span className="font-extrabold text-slate-600 uppercase">
                                  {isWhiteboard ? '🎨 Whiteboard Bảng Tương Tác' : act.type}
                                </span>
                                {(act.start_time || act.end_time) && (
                                  <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                    📅 Lịch mở: {act.start_time ? new Date(act.start_time).toLocaleDateString('vi-VN') : 'Mở ngay'} ➔ {act.end_time ? new Date(act.end_time).toLocaleDateString('vi-VN') : 'Vô thời hạn'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 flex-shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                            {/* CÁC THAO TÁC CỦA GIÁO VIÊN: SỬA - ẨN - HẸN GIỜ KHÓA - XÓA */}
                            {isTeacher && (
                              <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  title="Chỉnh sửa tên & loại bài học"
                                  onClick={() => {
                                    setEditingAct(act);
                                    setEditTitle(act.title.replace('[WHITEBOARD]', '').trim());
                                    setEditType(act.type || 'quiz');
                                    setIsEditModalOpen(true);
                                  }}
                                  className="px-2 py-1 bg-sky-100 hover:bg-sky-200 text-sky-800 font-extrabold text-[11px] rounded-lg transition border border-sky-300"
                                >
                                  ✏️ Sửa
                                </button>

                                <button
                                  type="button"
                                  title={act.is_hidden ? "Hiện bài học cho Học sinh" : "Ẩn bài học khỏi Học sinh"}
                                  onClick={(e) => handleToggleHideActivity(act, e)}
                                  className={`px-2 py-1 font-extrabold text-[11px] rounded-lg transition border ${
                                    act.is_hidden
                                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-500'
                                      : 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300'
                                  }`}
                                >
                                  {act.is_hidden ? '👁️ Mở Hiện' : '🔒 Ẩn HS'}
                                </button>

                                <button
                                  type="button"
                                  title="Cài lịch tự động mở/khóa bài học từ ngày nào đến ngày nào"
                                  onClick={() => {
                                    setSchedulingAct(act);
                                    setStartTime(act.start_time ? new Date(act.start_time).toISOString().slice(0, 16) : '');
                                    setEndTime(act.end_time ? new Date(act.end_time).toISOString().slice(0, 16) : '');
                                    setIsScheduleModalOpen(true);
                                  }}
                                  className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 font-extrabold text-[11px] rounded-lg transition border border-purple-300"
                                >
                                  ⏰ Hẹn Giờ Khóa
                                </button>

                                <button
                                  type="button"
                                  title="Xóa bài học này"
                                  onClick={(e) => handleDeleteActivity(act, e)}
                                  className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 font-extrabold text-[11px] rounded-lg transition border border-rose-300"
                                >
                                  🗑️ Xóa
                                </button>
                              </div>
                            )}

                            <span className={`px-3 py-1 rounded-lg text-xs font-extrabold shadow-2xs border ${
                              !isTeacher && isTimeLocked
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : 'bg-white text-slate-700'
                            }`}>
                              {isWhiteboard ? 'Vào Giảng Dạy' : !isTeacher && isTimeLocked ? '🔒 Bài Đang Khóa' : 'Mở Bài Học'}
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL THÊM BÀI HỌC / HOẠT ĐỘNG MỚI (TÍCH HỢP WHITEBOARD - FIX LỖI LƯU 100%) */}
      {isAddActivityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-scale-up">
            <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base">+ Thêm Bài Học / Hoạt Động Mới</h3>
              <button onClick={() => setIsAddActivityOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateActivity} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">TÊN BÀI HỌC (TÊN TIẾT HỌC)</label>
                <input
                  type="text"
                  required
                  value={newActTitle}
                  onChange={(e) => setNewActTitle(e.target.value)}
                  placeholder="Ví dụ: A closer look 2, Getting started..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">LOẠI HOẠT ĐỘNG</label>
                <select
                  value={newActType}
                  onChange={(e) => setNewActType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 bg-amber-50 text-slate-900"
                >
                  <option value="whiteboard">🎨 Whiteboard (Bảng Tương Tác Giảng Dạy - Lưu Trực Tiếp)</option>
                  <option value="quiz">Quiz (Bài Kiểm Tra Trắc Nghiệm / Reading / Listening)</option>
                  <option value="page">Page (Trang Bài Giảng / Tài Liệu)</option>
                  <option value="video">Interactive Video H5P (Video Tương Tác)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddActivityOpen(false)}
                  className="px-4 py-2 text-slate-600 text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingAct}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  {creatingAct ? 'Đang Tạo Bài Học...' : '🚀 Tạo Bài Học & Mở Bảng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT SỬA TÊN VÀ LOẠI BÀI HỌC */}
      {isEditModalOpen && editingAct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-scale-up">
            <div className="bg-sky-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base">✏️ Sửa Tên & Loại Bài Học</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveEditActivity} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">TÊN BÀI HỌC (TÊN TIẾT HỌC)</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-sky-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">LOẠI BÀI HỌC</label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-sky-500 text-slate-900"
                >
                  <option value="whiteboard">🎨 Whiteboard (Bảng Tương Tác Giảng Dạy)</option>
                  <option value="quiz">Quiz (Bài Kiểm Tra Trắc Nghiệm / Reading / Listening)</option>
                  <option value="page">Page (Trang Bài Giảng / Tài Liệu)</option>
                  <option value="video">Interactive Video H5P (Video Tương Tác)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-slate-600 text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  💾 Lưu Cập Nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CÀI ĐẶT LỊCH HẸN GIỜ KHÓA / MỞ BÀI HỌC TỰ ĐỘNG (DATE/TIME LOCK SCHEDULE) */}
      {isScheduleModalOpen && schedulingAct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 font-sans select-none">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-scale-up">
            <div className="bg-purple-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base flex items-center space-x-2">
                <span>⏰ Cài Lịch Mở & Tự Động Khóa Bài Học</span>
              </h3>
              <button onClick={() => setIsScheduleModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveScheduleActivity} className="p-6 space-y-4">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-950 leading-relaxed font-medium">
                💡 Cài đặt ngày/giờ bài học bắt đầu mở và tự động khóa lại sau khi Học sinh học xong. Hết thời gian khóa, bài học tự động đổi sang trạng thái 🔒 Khóa!
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">📅 BẮT ĐẦU MỞ TỪ NGÀY / GIỜ</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 bg-white"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Để trống nếu muốn mở bài học ngay lập tức.</span>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">📅 TỰ ĐỘNG KHÓA LẠI VÀO NGÀY / GIỜ</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 bg-white"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Khi qua mốc thời gian này, bài học tự động khóa lại không cho HS vào nữa.</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStartTime('');
                    setEndTime('');
                  }}
                  className="text-xs text-rose-600 font-extrabold hover:underline"
                >
                  🔄 Xóa Lịch (Gỡ Khóa Hẹn Giờ)
                </button>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsScheduleModalOpen(false)}
                    className="px-3 py-2 text-slate-600 text-xs font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                  >
                    💾 Lưu Cài Đặt Lịch
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENROLLED USERS MODAL */}
      <EnrolledUsersModal
        isOpen={isEnrolledModalOpen}
        onClose={() => setIsEnrolledModalOpen(false)}
        courseId={courseId}
        courseTitle={course?.title}
      />

      {/* TOAST MODAL */}
      <CenterToastModal
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        type={toast.type}
        title={toast.title}
        message={toast.message}
      />
    </div>
  );
}
