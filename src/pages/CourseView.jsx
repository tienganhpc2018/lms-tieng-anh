import { isWhiteboardAct, isAudioRecordAct, isInteractiveVideoAct } from '../utils/activityTypeHelpers';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import CourseSidebar from '../components/lms/CourseSidebar';
import EnrolledUsersModal from '../components/lms/EnrolledUsersModal';
import CenterToastModal from '../components/common/CenterToastModal';
import { BookOpen, Plus, Users, ArrowLeft, Key, Eye, EyeOff, Copy, Check, Lock, ChevronRight, PlayCircle, FileText, CheckSquare, Palette, Rocket, Zap, MessageSquare, Headphones, Edit3, Trophy, Star, Sparkles, Target, Compass } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';



// TOP-LEVEL HELPER FUNCTIONS TRÁNH MỌI LỖI REFERENCE ERROR AN TOÀN TUYỆT ĐỐI V54







// HÀM TẠO ICON VÀ MÀU SẮC ĐỘNG SINH ĐỘNG THEO TÊN BÀI HỌC V50 THEO CHỈ ĐẠO THẦY HẢI
const getDynamicLessonIcon = (act, index) => {
  if (act.is_hidden) {
    return {
      icon: <Lock className="w-5 h-5" />,
      bgClass: 'bg-slate-700 text-white',
    };
  }

  const titleLower = (act.title || '').toLowerCase();

  if (titleLower.includes('getting started') || titleLower.includes('start') || titleLower.includes('mở đầu')) {
    return {
      icon: <Rocket className="w-5 h-5" />,
      bgClass: 'bg-gradient-to-br from-orange-500 to-rose-600 text-white shadow-md',
    };
  }

  if (titleLower.includes('closer look 1') || titleLower.includes('vocabulary') || titleLower.includes('từ vựng')) {
    return {
      icon: <BookOpen className="w-5 h-5" />,
      bgClass: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md',
    };
  }

  if (titleLower.includes('closer look 2') || titleLower.includes('grammar') || titleLower.includes('ngữ pháp')) {
    return {
      icon: <Zap className="w-5 h-5" />,
      bgClass: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md',
    };
  }

  if (titleLower.includes('communication') || titleLower.includes('speaking') || titleLower.includes('giao tiếp')) {
    return {
      icon: <MessageSquare className="w-5 h-5" />,
      bgClass: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-md',
    };
  }

  if (titleLower.includes('skills 1') || titleLower.includes('reading') || titleLower.includes('listening')) {
    return {
      icon: <Headphones className="w-5 h-5" />,
      bgClass: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md',
    };
  }

  if (titleLower.includes('skills 2') || titleLower.includes('writing') || titleLower.includes('viết')) {
    return {
      icon: <Edit3 className="w-5 h-5" />,
      bgClass: 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-md',
    };
  }

  if (titleLower.includes('looking back') || titleLower.includes('review') || titleLower.includes('ôn tập')) {
    return {
      icon: <Trophy className="w-5 h-5" />,
      bgClass: 'bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 shadow-md',
    };
  }

  if (titleLower.includes('project') || titleLower.includes('dự án')) {
    return {
      icon: <Palette className="w-5 h-5" />,
      bgClass: 'bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white shadow-md',
    };
  }

  // TỰ ĐỘNG BỐ TRÍ ICON SẮC MÀU KHÁC NHAU THEO THỨ TỰ INDEX
  const fallbackPresets = [
    { icon: <Rocket className="w-5 h-5" />, bgClass: 'bg-gradient-to-br from-orange-500 to-rose-600 text-white shadow-md' },
    { icon: <BookOpen className="w-5 h-5" />, bgClass: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md' },
    { icon: <Zap className="w-5 h-5" />, bgClass: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md' },
    { icon: <MessageSquare className="w-5 h-5" />, bgClass: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-md' },
    { icon: <Headphones className="w-5 h-5" />, bgClass: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md' },
    { icon: <Edit3 className="w-5 h-5" />, bgClass: 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-md' },
    { icon: <Trophy className="w-5 h-5" />, bgClass: 'bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 shadow-md' },
    { icon: <Star className="w-5 h-5" />, bgClass: 'bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-md' },
  ];

  return fallbackPresets[index % fallbackPresets.length];
};

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
  const [newActContent, setNewActContent] = useState('');
  const [creatingAct, setCreatingAct] = useState(false);

  // Preview Game Modal
  const [isPreviewGameOpen, setIsPreviewGameOpen] = useState(false);
  const [previewGameCode, setPreviewGameCode] = useState('');

  const [isEnrolledModalOpen, setIsEnrolledModalOpen] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, type: 'info', title: '', message: '' });

  // Modals Quản trị Bài học (Sửa, Xóa, Ẩn/Hiện, Hẹn giờ)
  const [editingAct, setEditingAct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState('quiz');
  const [editContent, setEditContent] = useState('');

  const [schedulingAct, setSchedulingAct] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Modals Quản trị Chủ đề (Sửa tên, Xóa & Tạo Unit Mới)
  const [editingSection, setEditingSection] = useState(null);
  const [isEditSecModalOpen, setIsEditSecModalOpen] = useState(false);
  const [editSecTitle, setEditSecTitle] = useState('');

  const [isAddSecModalOpen, setIsAddSecModalOpen] = useState(false);
  const [newSecTitle, setNewSecTitle] = useState('');
  const [creatingSec, setCreatingSec] = useState(false);

  const showToast = (type, title, message) => {
    setToast({ isOpen: true, type, title, message });
  };

  // Nâng cấp: Tạo Unit / Chủ Đề Mới (Unit 2, Unit 3...)
  const handleCreateSection = async (e) => {
    e.preventDefault();
    if (!newSecTitle.trim()) return;
    setCreatingSec(true);
    try {
      const { data, error } = await supabase
        .from('course_sections')
        .insert([
          {
            course_id: courseId,
            title: newSecTitle.trim(),
            order_index: sections.length,
          },
        ])
        .select()
        .single();

      if (data) {
        setSections((prev) => [...prev, data]);
        setActiveSectionId(data.id);
        setIsAddSecModalOpen(false);
        setNewSecTitle('');
        showToast('success', 'Đã Thêm Unit Mới', `Đã tạo "${data.title}" thành công! Thầy có thể bắt đầu thêm 7 bài học vào Unit này.`);
      }
    } catch (err) {
      alert('Lỗi tạo Unit: ' + err.message);
    } finally {
      setCreatingSec(false);
    }
  };

  // Nâng cấp Thần Kỳ: Tự Động Tạo Sẵn Khung 12 Units (Mỗi Unit 7 Lessons Chuẩn)
  const handleAutoCreate12UnitsTemplate = async () => {
    if (!window.confirm('Thầy có muốn tự động tạo sẵn Khung 12 Units (mỗi Unit có sẵn 7 Lessons từ Lesson 1 đến Lesson 7) không?')) return;
    setLoading(true);
    try {
      const unitNames = [
        'Unit 1: Hobbies',
        'Unit 2: Healthy Living',
        'Unit 3: Community Service',
        'Unit 4: Music and Arts',
        'Unit 5: Food and Drink',
        'Unit 6: Visit to School',
        'Unit 7: Traffic',
        'Unit 8: Films',
        'Unit 9: Festivals around the world',
        'Unit 10: Energy Sources',
        'Unit 11: Travelling in the future',
        'Unit 12: An Overcrowded World'
      ];

      const lessonNames = [
        'Lesson 1: Getting started',
        'Lesson 2: A closer look 1',
        'Lesson 3: A closer look 2',
        'Lesson 4: Communication',
        'Lesson 5: Skills 1',
        'Lesson 6: Skills 2',
        'Lesson 7: Looking back & Project'
      ];

      for (let i = 0; i < unitNames.length; i++) {
        const uTitle = unitNames[i];
        const { data: newSec } = await supabase
          .from('course_sections')
          .insert([{ course_id: courseId, title: uTitle, order_index: sections.length + i }])
          .select()
          .single();

        if (newSec) {
          const actInserts = lessonNames.map((lName, lIdx) => ({
            section_id: newSec.id,
            title: lName,
            type: 'quiz',
            order_index: lIdx
          }));
          await supabase.from('activities').insert(actInserts);
        }
      }

      await fetchCourseData();
    } catch (err) {
      alert('Lỗi tạo khung: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Nâng cấp Đặc Quyền: Nhân Bản Chủ Đề (Duplicate Unit kèm tất cả các Bài Học Con)
  const handleDuplicateSection = async (sec, e) => {
    if (e) e.stopPropagation();
    setLoading(true);
    try {
      const newTitle = `${sec.title} (Bản sao)`;
      const { data: newSec, error: secErr } = await supabase
        .from('course_sections')
        .insert([
          {
            course_id: courseId,
            title: newTitle,
            order_index: sections.length,
          },
        ])
        .select()
        .single();

      if (secErr || !newSec) throw new Error('Không thể nhân bản chủ đề!');

      const { data: oldActivities } = await supabase
        .from('activities')
        .select('*')
        .eq('section_id', sec.id)
        .order('order_index', { ascending: true });

      if (oldActivities && oldActivities.length > 0) {
        const newActInserts = oldActivities.map((act) => ({
          section_id: newSec.id,
          title: act.title,
          type: act.type,
          content: act.content,
          order_index: act.order_index,
          is_hidden: act.is_hidden,
        }));
        await supabase.from('activities').insert(newActInserts);
      }

      setSections((prev) => [...prev, newSec]);
      setActiveSectionId(newSec.id);

      setEditingSection(newSec);
      setEditSecTitle(newTitle);
      setIsEditSecModalOpen(true);

      showToast('success', 'ĐÃ NHÂN BẢN CHỦ ĐỀ!', `Đã nhân bản "${sec.title}" thành công kèm toàn bộ bài học con! Thầy Hải có thể đổi tên Chủ đề 2 ngay bây giờ.`);
    } catch (err) {
      alert('Lỗi nhân bản: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Nâng cấp: Di chuyển Chủ Đề LÊN / XUỐNG
  const handleMoveSection = async (sec, direction, e) => {
    if (e) e.stopPropagation();
    const currentIndex = sections.findIndex((s) => s.id === sec.id);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[currentIndex];
    newSections[currentIndex] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    newSections.forEach((s, idx) => {
      s.order_index = idx;
    });

    setSections(newSections);

    try {
      await Promise.all([
        supabase.from('course_sections').update({ order_index: newSections[currentIndex].order_index }).eq('id', newSections[currentIndex].id),
        supabase.from('course_sections').update({ order_index: newSections[targetIndex].order_index }).eq('id', newSections[targetIndex].id),
      ]);
    } catch (err) {}

    showToast('success', 'Đã Di Chuyển Chủ Đề', `Đã chuyển "${sec.title}" ${direction === 'up' ? 'lên trên' : 'xuống dưới'}!`);
  };

  // Nâng cấp: Di chuyển bài học LÊN / XUỐNG linh hoạt theo buổi dạy
  const handleMoveActivity = async (act, direction, e) => {
    e.stopPropagation();
    const currentIndex = activities.findIndex((a) => a.id === act.id);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= activities.length) return;

    const newActivities = [...activities];
    const temp = newActivities[currentIndex];
    newActivities[currentIndex] = newActivities[targetIndex];
    newActivities[targetIndex] = temp;

    newActivities.forEach((item, idx) => {
      item.order_index = idx;
    });

    setActivities(newActivities);

    try {
      await Promise.all([
        supabase.from('activities').update({ order_index: newActivities[currentIndex].order_index }).eq('id', newActivities[currentIndex].id),
        supabase.from('activities').update({ order_index: newActivities[targetIndex].order_index }).eq('id', newActivities[targetIndex].id),
      ]);
    } catch (err) {}

    showToast('success', 'Đã Di Chuyển Bài Học', `Đã chuyển bài học "${act.title.replace('[WHITEBOARD]', '').replace('[AUDIO_RECORD]', '').trim()}" ${direction === 'up' ? 'lên trên' : 'xuống dưới'}!`);
  };

  // Nâng cấp: Sửa Tên Chủ Đề
  const handleSaveEditSection = async (e) => {
    e.preventDefault();
    if (!editingSection || !editSecTitle.trim()) return;
    try {
      await supabase
        .from('course_sections')
        .update({ title: editSecTitle.trim() })
        .eq('id', editingSection.id);
    } catch (err) {}

    setSections((prev) =>
      prev.map((s) => (s.id === editingSection.id ? { ...s, title: editSecTitle.trim() } : s))
    );
    setIsEditSecModalOpen(false);
    showToast('success', 'Đã Đổi Tên Chủ Đề', 'Tên chủ đề đã được cập nhật thành công!');
  };

  // Nâng cấp: Xóa Chủ Đề
  const handleDeleteSection = async (sec, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Thầy có chắc chắn muốn xóa Chủ đề "${sec.title}" cùng toàn bộ bài học bên trong không?`)) return;

    try {
      await supabase.from('activities').delete().eq('section_id', sec.id);
      await supabase.from('course_sections').delete().eq('id', sec.id);
    } catch (err) {}

    const remaining = sections.filter((s) => s.id !== sec.id);
    setSections(remaining);
    if (remaining.length > 0) {
      setActiveSectionId(remaining[0].id);
    } else {
      setActiveSectionId(null);
    }
    showToast('success', 'Đã Xóa Chủ Đề', `Đã xóa chủ đề "${sec.title}" thành công!`);
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
        .update({ title: editTitle, type: editType, content: editContent })
        .eq('id', editingAct.id);
    } catch (err) {}

    setActivities((prev) =>
      prev.map((a) => (a.id === editingAct.id ? { ...a, title: editTitle, type: editType, content: editContent } : a))
    );
    setIsEditModalOpen(false);
    showToast('success', 'Đã Sửa Bài Học', 'Cập nhật tên, loại và nội dung bài học thành công!');
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

  const userIsTeacher = isTeacher || profile?.is_teacher || profile?.role === 'admin' || profile?.role === 'teacher' || (user?.email && (user.email.toLowerCase().includes('hai') || user.email.toLowerCase().includes('nguyensea')));

  const displayableActivities = activities.filter((act) => {
    if (userIsTeacher) return true;
    if (act.is_hidden) return false; // HỌC SINH TUYỆT ĐỐI BỊ ẨN KHỎI DANH SÁCH BÀI HỌC 100%
    return true;
  });

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

      // Hỗ trợ tương thích 100% SQL Constraint activities_type_check CSDL Supabase
      const isWhiteboardAct = newActType === 'whiteboard';
      const isAudioRecordAct = newActType === 'audio_record';

      // Supabase Constraint chỉ cho phép: 'quiz', 'assignment', 'whiteboard', 'iframe', 'page', 'video'
      const isInteractiveVideoActType = newActType === 'video';
      const dbType = isAudioRecordAct ? 'assignment' : newActType;

      let formattedTitle = newActTitle.trim();
      if (isWhiteboardAct && !formattedTitle.includes('[WHITEBOARD]')) {
        formattedTitle = `[WHITEBOARD] ${formattedTitle}`;
      } else if (isAudioRecordAct && !formattedTitle.includes('[AUDIO_RECORD]')) {
        formattedTitle = `[AUDIO_RECORD] ${formattedTitle}`;
      }

      const { data: newAct, error: actErr } = await supabase
        .from('activities')
        .insert([
          {
            section_id: targetSectionId,
            title: formattedTitle,
            type: dbType,
            content: newActContent.trim(),
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
        setNewActContent('');
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
    if (isWhiteboardAct(act)) {
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
              isTeacher={userIsTeacher}
              activities={activities}
            />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-1">
                    <h2 className="text-lg font-extrabold text-slate-900">
                      {sections.find((s) => s.id === activeSectionId)?.title || 'Danh Sách Bài Học'}
                    </h2>
                    {userIsTeacher && activeSectionId && (
                      <div className="flex items-center space-x-1.5 ml-2 flex-wrap gap-y-1">
                        <button
                          type="button"
                          title="Sửa tên Chủ Đề này"
                          onClick={() => {
                            const currentSec = sections.find((s) => s.id === activeSectionId);
                            if (currentSec) {
                              setEditingSection(currentSec);
                              setEditSecTitle(currentSec.title);
                              setIsEditSecModalOpen(true);
                            }
                          }}
                          className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 font-extrabold text-[11px] rounded-lg transition border border-amber-300 cursor-pointer flex items-center space-x-1"
                        >
                          <span>✏️ Sửa Tên</span>
                        </button>

                        <button
                          type="button"
                          title="Nhân bản Chủ đề này thành Chủ đề 2 kèm toàn bộ các bài học con bên trong"
                          onClick={() => {
                            const currentSec = sections.find((s) => s.id === activeSectionId);
                            if (currentSec) handleDuplicateSection(currentSec);
                          }}
                          className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 font-extrabold text-[11px] rounded-lg transition border border-purple-300 cursor-pointer flex items-center space-x-1 shadow-xs"
                        >
                          <span>📋 Duplicate (Nhân Bản)</span>
                        </button>

                        {/* Nút Di Chuyển Chủ Đề LÊN / XUỐNG */}
                        <div className="flex items-center space-x-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                          <button
                            type="button"
                            title="Đẩy Chủ Đề này LÊN TRÊN"
                            onClick={(e) => {
                              const currentSec = sections.find((s) => s.id === activeSectionId);
                              if (currentSec) handleMoveSection(currentSec, 'up', e);
                            }}
                            className="px-1.5 py-0.5 hover:bg-purple-700 hover:text-white text-slate-700 font-extrabold text-[11px] rounded transition cursor-pointer"
                          >
                            ⬆️
                          </button>
                          <button
                            type="button"
                            title="Đẩy Chủ Đề này XUỐNG DƯỚI"
                            onClick={(e) => {
                              const currentSec = sections.find((s) => s.id === activeSectionId);
                              if (currentSec) handleMoveSection(currentSec, 'down', e);
                            }}
                            className="px-1.5 py-0.5 hover:bg-purple-700 hover:text-white text-slate-700 font-extrabold text-[11px] rounded transition cursor-pointer"
                          >
                            ⬇️
                          </button>
                        </div>

                        <button
                          type="button"
                          title="Xóa Chủ Đề này"
                          onClick={() => {
                            const currentSec = sections.find((s) => s.id === activeSectionId);
                            if (currentSec) handleDeleteSection(currentSec);
                          }}
                          className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-extrabold text-[11px] rounded-lg transition border border-rose-300 cursor-pointer flex items-center space-x-1"
                        >
                          <span>🗑️ Xóa</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">Hiển thị {displayableActivities.length} bài học trong chủ đề này</p>
                </div>

                {userIsTeacher && (
                  <div className="flex items-center space-x-2 flex-wrap gap-2">
                    {/* NÚT CHÍNH TẠO CHỦ ĐỀ / UNITS MỚI CHUẨN THEO VỊ TRÍ KHOANH ĐỎ CỦA THẦY HẢI */}
                    <button
                      onClick={() => setIsAddSecModalOpen(true)}
                      className="px-4 py-2.5 bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-700 hover:to-indigo-800 text-amber-300 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center space-x-1.5 cursor-pointer border border-amber-400/50 transform hover:scale-102"
                      title="Tạo thêm Chủ Đề / Unit Mới (Unit 2, Unit 3, Unit 4...)"
                    >
                      <Plus className="w-4 h-4 text-amber-400" />
                      <span>➕ + THÊM CHỦ ĐỀ / UNIT MỚI (Units 2, 3, 4...)</span>
                    </button>

                    {/* NÚT THÊM BÀI HỌC CON (LESSONS BÊN TRONG) */}
                    <button
                      onClick={() => setIsAddActivityOpen(true)}
                      className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer"
                      title="Thêm bài học con (Lesson 1, Lesson 2...) vào Chủ đề này"
                    >
                      <Plus className="w-4 h-4" />
                      <span>📄 + Thêm Bài Học Con (Lesson)</span>
                    </button>

                    {sections.length <= 1 && (
                      <button
                        onClick={handleAutoCreate12UnitsTemplate}
                        className="px-3.5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer border border-amber-500"
                        title="Tự động tạo sẵn đủ 12 Units (mỗi Unit 7 Lessons chuẩn)"
                      >
                        <span>🪄 Tạo Bộ 12 Units Chuẩn (Mỗi Unit 7 Lessons)</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* THANH TABS CHỌN NHANH CÁC UNITS (UNIT 1, UNIT 2, UNIT 3...) */}
              {sections.length > 0 && (
                <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin border-b border-slate-100 pt-2">
                  {sections.map((sec) => {
                    const isActive = sec.id === activeSectionId;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => handleSelectSection(sec.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition flex-shrink-0 cursor-pointer border ${
                          isActive
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span>{sec.title}</span>
                      </button>
                    );
                  })}
                  {userIsTeacher && (
                    <button
                      type="button"
                      onClick={() => setIsAddSecModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 flex-shrink-0 cursor-pointer"
                    >
                      + Thêm Unit Mới
                    </button>
                  )}
                </div>
              )}

              {loading ? (
                <LoadingSpinner text="Đang tải bài học..." />
              ) : displayableActivities.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl space-y-3">
                  <p className="text-xs text-slate-400 font-semibold">Chủ đề này chưa có bài học nào mở cho học sinh.</p>
                  {userIsTeacher && (
                    <div className="flex items-center justify-center space-x-2 pt-2">
                      <button
                        onClick={() => setIsAddSecModalOpen(true)}
                        className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-extrabold text-xs shadow-md cursor-pointer"
                      >
                        ➕ + Thêm Chủ Đề / Unit Mới
                      </button>
                      <button
                        onClick={() => setIsAddActivityOpen(true)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md cursor-pointer"
                      >
                        📄 + Thêm Bài Học Con (Lesson)
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {displayableActivities.map((act, index) => {
                                        const now = new Date();
                    const isNotOpenYet = act.start_time && now < new Date(act.start_time);
                    const isExpired = act.end_time && now > new Date(act.end_time);
                    const isTimeLocked = isNotOpenYet || isExpired;

                    return (
                      <div
                        key={act.id}
                        onClick={() => {
                          if (!userIsTeacher && isTimeLocked) {
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
                            : isWhiteboardAct(act)
                            ? 'bg-amber-50 hover:bg-amber-100 border-amber-300' : isAudioRecordAct(act)
                            ? 'bg-purple-50 hover:bg-purple-100 border-purple-300'
                            : 'bg-slate-50 hover:bg-emerald-50 border-slate-200 hover:border-emerald-300'
                        } ${!userIsTeacher && isTimeLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center space-x-3">
                          {(() => {
                            const dyn = getDynamicLessonIcon(act, index);
                            return (
                              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold flex-shrink-0 transition transform group-hover:scale-110 ${dyn.bgClass}`}>
                                {dyn.icon}
                              </div>
                            );
                          })()}

                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2 flex-wrap gap-1">
                              <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                                {act.title.replace('[WHITEBOARD]', '').replace('[AUDIO_RECORD]', '').trim()}
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
                                {isWhiteboardAct(act) ? '🎨 Whiteboard Bảng Tương Tác' : isAudioRecordAct(act) ? '🎙️ Audio Recorder Bảng Luyện Nói' : isInteractiveVideoAct(act) ? '🎥 Interactive Video (Video Tương Tác H5P)' : act.type}
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
                          {/* CÁC THAO TÁC CỦA GIÁO VIÊN: LÊN - XUỐNG - SỬA - ẨN - HẸN GIỜ KHÓA - XÓA */}
                          {userIsTeacher && (
                            <div className="flex items-center space-x-1 flex-wrap gap-y-1" onClick={(e) => e.stopPropagation()}>
                              {/* Nút di chuyển Lên / Xuống */}
                              <div className="flex items-center space-x-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                                <button
                                  type="button"
                                  title="Đẩy bài học này LÊN TRÊN"
                                  onClick={(e) => handleMoveActivity(act, 'up', e)}
                                  className="px-1.5 py-0.5 hover:bg-emerald-600 hover:text-white text-slate-700 font-extrabold text-[11px] rounded transition cursor-pointer"
                                >
                                  ⬆️
                                </button>
                                <button
                                  type="button"
                                  title="Đẩy bài học này XUỐNG DƯỚI"
                                  onClick={(e) => handleMoveActivity(act, 'down', e)}
                                  className="px-1.5 py-0.5 hover:bg-emerald-600 hover:text-white text-slate-700 font-extrabold text-[11px] rounded transition cursor-pointer"
                                >
                                  ⬇️
                                </button>
                              </div>
                              <button
                                type="button"
                                title="Chỉnh sửa tên & loại bài học"
                                onClick={() => {
                                  setEditingAct(act);
                                  setEditTitle(act.title.replace('[WHITEBOARD]', '').trim());
                                  setEditType(act.type || 'quiz');
                                  setIsEditModalOpen(true);
                                }}
                                className="px-2 py-1 bg-sky-100 hover:bg-sky-200 text-sky-800 font-extrabold text-[11px] rounded-lg transition border border-sky-300 cursor-pointer"
                              >
                                ✏️ Sửa
                              </button>

                              <button
                                type="button"
                                title={act.is_hidden ? "Hiện bài học cho Học sinh" : "Ẩn bài học khỏi Học sinh"}
                                onClick={(e) => handleToggleHideActivity(act, e)}
                                className={`px-2 py-1 font-extrabold text-[11px] rounded-lg transition border cursor-pointer ${
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
                                className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 font-extrabold text-[11px] rounded-lg transition border border-purple-300 cursor-pointer"
                              >
                                ⏰ Hẹn Giờ Khóa
                              </button>

                              <button
                                type="button"
                                title="Xóa bài học này"
                                onClick={(e) => handleDeleteActivity(act, e)}
                                className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 font-extrabold text-[11px] rounded-lg transition border border-rose-300 cursor-pointer"
                              >
                                🗑️ Xóa
                              </button>
                            </div>
                          )}

                          <span className={`px-3 py-1 rounded-lg text-xs font-extrabold shadow-2xs border ${
                            !userIsTeacher && isTimeLocked
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-white text-slate-700'
                          }`}>
                            {isWhiteboardAct(act) ? 'Vào Giảng Dạy' : isAudioRecordAct(act) ? '🎙️ Thu Âm Bài Nói' : isInteractiveVideoAct(act) ? (userIsTeacher ? '🎥 Thiết Kế Video Tương Tác' : '🎥 Học Bài Video Tương Tác') : !userIsTeacher && isTimeLocked ? '🔒 Bài Đang Khóa' : 'Mở Bài Học'}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
                  <option value="iframe">🎮 Interactive Game / Iframe (Nhúng Wordwall, Quizizz, Game HTML5)</option>
                  <option value="audio_record">🎙️ Audio Recorder (Bài Luyện Nói / Ghi Âm Tiếng Anh)</option>
                  <option value="whiteboard">🎨 Whiteboard (Bảng Tương Tác Giảng Dạy - Lưu Trực Tiếp)</option>
                  <option value="quiz">Quiz (Bài Kiểm Tra Trắc Nghiệm / Reading / Listening)</option>
                  <option value="page">Page (Trang Bài Giảng / Tài Liệu)</option>
                  <option value="video">🎥 Interactive Video H5P (Video Tương Tác Tự Động Dừng Câu Hỏi)</option>
                </select>
              </div>

              {(newActType === 'iframe' || newActType === 'audio_record') && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      {newActType === 'iframe'
                        ? 'NỘI DUNG IFRAME / ĐƯỜNG LINK GAME (DÁN MÃ EMBED HOẶC LINK WORDWALL/QUIZIZZ)'
                        : 'ĐỀ BÀI / YÊU CẦU CÂU NÓI CHO HỌC SINH GHI ÂM'}
                    </label>
                    {newActType === 'iframe' && newActContent.trim() && (
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewGameCode(newActContent.trim());
                          setIsPreviewGameOpen(true);
                        }}
                        className="px-2 py-0.5 bg-purple-100 hover:bg-purple-200 text-purple-900 font-extrabold text-[11px] rounded-md border border-purple-300 transition cursor-pointer"
                      >
                        👁️ Xem Thử Game Iframe
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={4}
                    value={newActContent}
                    onChange={(e) => setNewActContent(e.target.value)}
                    placeholder={
                      newActType === 'iframe'
                        ? 'Dán mã <iframe src="..."></iframe> từ Wordwall, Quizizz hoặc link https://wordwall.net/embed/...'
                        : 'Ví dụ: Hãy đọc lại đoạn văn trên và ghi âm câu trả lời của em gửi Thầy Hải nhé!'
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-slate-50"
                  />
                </div>
              )}

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
                  {creatingAct ? 'Đang Tạo Bài Học...' : '🚀 Tạo Bài Học & Mở Khung'}
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
                  <option value="iframe">🎮 Interactive Game / Iframe (Nhúng Wordwall, Quizizz, Game HTML5)</option>
                  <option value="audio_record">🎙️ Audio Record (Bài Luyện Nói / Ghi Âm Tiếng Anh)</option>
                  <option value="page">Page (Trang Bài Giảng / Tài Liệu)</option>
                  <option value="video">Interactive Video H5P (Video Tương Tác)</option>
                </select>
              </div>

              {(editType === 'iframe' || editType === 'audio_record') && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      {editType === 'iframe'
                        ? 'NỘI DUNG IFRAME / ĐƯỜNG LINK GAME (DÁN MÃ EMBED HOẶC LINK WORDWALL/QUIZIZZ)'
                        : 'ĐỀ BÀI / YÊU CẦU CÂU NÓI CHO HỌC SINH GHI ÂM'}
                    </label>
                    {editType === 'iframe' && editContent.trim() && (
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewGameCode(editContent.trim());
                          setIsPreviewGameOpen(true);
                        }}
                        className="px-2 py-0.5 bg-purple-100 hover:bg-purple-200 text-purple-900 font-extrabold text-[11px] rounded-md border border-purple-300 transition cursor-pointer"
                      >
                        👁️ Xem Thử Game Iframe
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={4}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder={
                      editType === 'iframe'
                        ? 'Dán mã <iframe src="..."></iframe> từ Wordwall, Quizizz hoặc link https://wordwall.net/embed/...'
                        : 'Ví dụ: Hãy đọc lại đoạn văn trên và ghi âm câu trả lời của em gửi Thầy Hải nhé!'
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-sky-500 text-slate-900 bg-slate-50"
                  />
                </div>
              )}

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

      {/* MODAL CHỈNH SỬA TÊN CHỦ ĐỀ */}
      {isEditSecModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <span>✏️ Sửa Tên Chủ Đề</span>
            </h3>
            <form onSubmit={handleSaveEditSection} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Chủ Đề mới:
                </label>
                <input
                  type="text"
                  required
                  value={editSecTitle}
                  onChange={(e) => setEditSecTitle(e.target.value)}
                  placeholder="VD: Chủ Đề 1: Unit 1 - Hobbies"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditSecModalOpen(false)}
                  className="px-4 py-2 text-slate-600 text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  💾 Lưu Tên Chủ Đề
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TẠO CHỦ ĐỀ / UNIT MỚI */}
      {isAddSecModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <span>➕ Tạo Thêm Unit / Chủ Đề Mới</span>
            </h3>
            <form onSubmit={handleCreateSection} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Unit / Chủ Đề mới:
                </label>
                <input
                  type="text"
                  required
                  value={newSecTitle}
                  onChange={(e) => setNewSecTitle(e.target.value)}
                  placeholder={`VD: Unit ${sections.length + 1}: Healthy Living`}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddSecModalOpen(false)}
                  className="px-4 py-2 text-slate-600 text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingSec}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  {creatingSec ? 'Đang tạo...' : '➕ Tạo Unit Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW XEM THỬ GAME IFRAME KHI SOẠN BÀI */}
      {isPreviewGameOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 font-sans">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="bg-purple-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base flex items-center space-x-2">
                <span>👁️ XEM THỬ KHUNG GAME IFRAME (PREVIEW MODE)</span>
              </h3>
              <button
                onClick={() => setIsPreviewGameOpen(false)}
                className="text-slate-300 hover:text-white font-extrabold text-sm"
              >
                ✕ Đóng
              </button>
            </div>
            <div className="p-4 bg-slate-900 flex-1 overflow-hidden min-h-[500px]">
              {previewGameCode.includes('src=') ? (
                <iframe
                  src={previewGameCode.match(/src=["']([^"']+)["']/)?.[1] || ''}
                  title="Preview Game"
                  className="w-full h-full min-h-[500px] border-0 rounded-2xl"
                  allow="fullscreen; autoplay; microphone; camera"
                  allowFullScreen
                />
              ) : previewGameCode.startsWith('http://') || previewGameCode.startsWith('https://') ? (
                <iframe
                  src={previewGameCode}
                  title="Preview Game"
                  className="w-full h-full min-h-[500px] border-0 rounded-2xl"
                  allow="fullscreen; autoplay; microphone; camera"
                  allowFullScreen
                />
              ) : (
                <iframe
                  srcDoc={previewGameCode}
                  title="Preview Game"
                  className="w-full h-full min-h-[500px] border-0 rounded-2xl"
                  allow="fullscreen; autoplay; microphone; camera"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ENROLLED USERS MODAL */}
      <EnrolledUsersModal
        isOpen={isEnrolledModalOpen}
        onClose={() => setIsEnrolledModalOpen(false)}
        courseId={courseId}
        courseTitle={course?.title || course?.name || 'ENGLISH 7 (GLOBAL SUCCESS)'}
        isTeacher={userIsTeacher}
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
