import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  loadClasses,
  loadStudents,
  saveStudents,
  loadSelectedClassId,
  saveSelectedClassId,
} from '../behavior/behaviorStorage';
import {
  loadAssessmentConfig,
  saveAssessmentConfig,
  loadEvaluations,
  saveEvaluations,
  exportEvaluationsToCSV,
} from './utils/assessmentStorage';
import { playClick, playCorrect } from '../../utils/soundEffects';

import AssessmentHeader from './components/AssessmentHeader';
import AssessmentTable from './components/AssessmentTable';
import ConfigAssessmentModal from './components/ConfigAssessmentModal';
import AiCommentModal from './components/AiCommentModal';
import ImportGradesModal from './components/ImportGradesModal';
import QuickAddStudentsModal from './components/QuickAddStudentsModal';
import EditStudentModal from './components/EditStudentModal';

export default function AssessmentPage() {
  // 1. Quản lý cấu hình sổ điểm
  const [config, setConfig] = useState(loadAssessmentConfig);

  // 2. Danh sách lớp học và học sinh (Lấy từ State/LocalStorage thực tế, KHÔNG DÙNG MẪU GIẢ)
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [students, setStudents] = useState([]);

  // 3. Môn học & Học kỳ đang chọn
  const [selectedSubject, setSelectedSubject] = useState(config.defaultSubject || 'Tiếng Anh');
  const [selectedSemester, setSelectedSemester] = useState(config.defaultSemester || 'HKI');

  // 4. Bảng điểm dạng map { [studentId]: { tx1, tx2, ..., gk, ck, comment } }
  const [evaluationsMap, setEvaluationsMap] = useState({});

  // 5. Trạng thái giao diện
  const [isCompactView, setIsCompactView] = useState(false);
  const [lastSavedText, setLastSavedText] = useState('');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isAiCommentOpen, setIsAiCommentOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const autoSaveTimerRef = useRef(null);

  // Nạp danh sách lớp học
  const refreshClassesAndStudents = useCallback(() => {
    const cls = loadClasses() || [];
    setClasses(cls);

    let activeClassId = selectedClassId;
    if (!activeClassId || !cls.some((c) => c.id === activeClassId)) {
      const savedClassId = loadSelectedClassId();
      if (savedClassId && cls.some((c) => c.id === savedClassId)) {
        activeClassId = savedClassId;
      } else if (cls.length > 0) {
        activeClassId = cls[0].id;
      } else {
        activeClassId = null;
      }
    }

    setSelectedClassId(activeClassId);
    if (activeClassId) {
      saveSelectedClassId(activeClassId);
      const studs = loadStudents(activeClassId) || [];
      setStudents(studs);
    } else {
      setStudents([]);
    }
  }, [selectedClassId]);

  useEffect(() => {
    refreshClassesAndStudents();

    // Lắng nghe sự kiện nếu danh sách học sinh được cập nhật từ Sổ Nề Nếp
    const handleStudentsUpdated = () => refreshClassesAndStudents();
    window.addEventListener('behaviorStudentsUpdated', handleStudentsUpdated);

    return () => {
      window.removeEventListener('behaviorStudentsUpdated', handleStudentsUpdated);
    };
  }, [refreshClassesAndStudents]);

  // Nạp bảng điểm khi thay đổi Lớp, Môn hoặc Học kỳ
  useEffect(() => {
    if (selectedClassId) {
      const data = loadEvaluations(selectedClassId, selectedSubject, selectedSemester);
      setEvaluationsMap(data);
    } else {
      setEvaluationsMap({});
    }
  }, [selectedClassId, selectedSubject, selectedSemester]);

  // Chuyển đổi lớp học
  const handleChangeClassId = (newClassId) => {
    setSelectedClassId(newClassId);
    saveSelectedClassId(newClassId);
    const studs = loadStudents(newClassId) || [];
    setStudents(studs);
  };

  // Cơ chế Tự động lưu bảng điểm (Debounced Auto-save)
  const triggerAutoSave = (updatedMap) => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      if (selectedClassId) {
        saveEvaluations(selectedClassId, selectedSubject, selectedSemester, updatedMap);
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        setLastSavedText(`✓ Đã lưu lúc ${timeStr}`);
      }
    }, 600);
  };

  // Cập nhật điểm cho 1 học sinh
  const handleUpdateGrade = (studentId, colKey, value) => {
    const currentStudentData = evaluationsMap[studentId] || {};
    const updatedStudentData = {
      ...currentStudentData,
      [colKey]: value,
    };

    const updatedMap = {
      ...evaluationsMap,
      [studentId]: updatedStudentData,
    };

    setEvaluationsMap(updatedMap);
    triggerAutoSave(updatedMap);
  };

  // Cập nhật nhận xét cho 1 học sinh
  const handleUpdateComment = (studentId, comment) => {
    const currentStudentData = evaluationsMap[studentId] || {};
    const updatedStudentData = {
      ...currentStudentData,
      comment,
    };

    const updatedMap = {
      ...evaluationsMap,
      [studentId]: updatedStudentData,
    };

    setEvaluationsMap(updatedMap);
    triggerAutoSave(updatedMap);
  };

  // Áp dụng nhận xét hàng loạt từ AI
  const handleApplyBatchComments = (updatedMap) => {
    setEvaluationsMap(updatedMap);
    if (selectedClassId) {
      saveEvaluations(selectedClassId, selectedSubject, selectedSemester, updatedMap);
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setLastSavedText(`✓ Đã lưu lúc ${timeStr}`);
    }
  };

  // Áp dụng điểm nhập từ Excel
  const handleApplyImportedGrades = (importedMap) => {
    const updatedMap = { ...evaluationsMap };
    Object.keys(importedMap).forEach((stId) => {
      updatedMap[stId] = {
        ...(updatedMap[stId] || {}),
        ...importedMap[stId],
      };
    });

    setEvaluationsMap(updatedMap);
    if (selectedClassId) {
      saveEvaluations(selectedClassId, selectedSubject, selectedSemester, updatedMap);
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setLastSavedText(`✓ Đã lưu lúc ${timeStr}`);
    }
  };

  // Lưu thủ công khi bấm nút Lưu Điểm
  const handleManualSave = () => {
    playCorrect();
    if (selectedClassId) {
      saveEvaluations(selectedClassId, selectedSubject, selectedSemester, evaluationsMap);
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      setLastSavedText(`✓ Đã lưu lúc ${timeStr}`);
    }
  };

  // Xuất file CSV Excel chuẩn UTF-8 BOM
  const handleExportCSV = () => {
    playClick();
    const currClass = classes.find((c) => c.id === selectedClassId);
    const classNameDisplay = currClass?.name ? (currClass.name.startsWith('Lớp') ? currClass.name : `Lớp ${currClass.name}`) : 'Toan_Truong';

    exportEvaluationsToCSV({
      students,
      evaluationsMap,
      schoolName: config.schoolName,
      academicYear: config.academicYear,
      className: classNameDisplay,
      subject: selectedSubject,
      semester: selectedSemester,
      txCount: config.txCount || 4,
    });
  };

  // Lưu cấu hình
  const handleSaveConfig = (newConfig) => {
    setConfig(newConfig);
    saveAssessmentConfig(newConfig);
  };

  // Tên lớp hiện tại
  const currentClassObj = classes.find((c) => c.id === selectedClassId);
  const currentClassName = currentClassObj?.name
    ? currentClassObj.name.startsWith('Lớp')
      ? currentClassObj.name
      : `Lớp ${currentClassObj.name}`
    : 'Lớp Học';

  // Lưu cập nhật thông tin học sinh (Giới tính, Avatar, Họ tên)
  const handleSaveEditedStudent = (updatedStudent) => {
    if (!selectedClassId) return;
    const updatedList = students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
    setStudents(updatedList);
    saveStudents(selectedClassId, updatedList);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16 pt-4 px-3 sm:px-6 max-w-7xl mx-auto space-y-6">
      {/* 1. THANH TIÊU ĐỀ, BỘ LỌC VÀ CỤM NÚT TÁC VỤ */}
      <AssessmentHeader
        config={config}
        classes={classes}
        selectedClassId={selectedClassId}
        onChangeClassId={handleChangeClassId}
        selectedSubject={selectedSubject}
        onChangeSubject={setSelectedSubject}
        selectedSemester={selectedSemester}
        onChangeSemester={setSelectedSemester}
        onOpenConfig={() => {
          playClick();
          setIsConfigOpen(true);
        }}
        onOpenAiComment={() => {
          playClick();
          setIsAiCommentOpen(true);
        }}
        onOpenImport={() => {
          playClick();
          setIsImportOpen(true);
        }}
        onExportCSV={handleExportCSV}
        onManualSave={handleManualSave}
        lastSavedText={lastSavedText}
        isCompactView={isCompactView}
        onToggleCompactView={() => {
          playClick();
          setIsCompactView(!isCompactView);
        }}
      />

      {/* 2. BẢNG ĐIỂM CHUẨN THÔNG TƯ 22 */}
      <AssessmentTable
        students={students}
        evaluationsMap={evaluationsMap}
        txCount={config.txCount || 4}
        subject={selectedSubject}
        semester={selectedSemester}
        isCompactView={isCompactView}
        onUpdateGrade={handleUpdateGrade}
        onUpdateComment={handleUpdateComment}
        onOpenQuickAddStudents={() => {
          playClick();
          setIsQuickAddOpen(true);
        }}
        onEditStudent={(st) => setEditingStudent(st)}
      />

      {/* 3. CÁC MODAL HỖ TRỢ */}
      <ConfigAssessmentModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />

      <AiCommentModal
        isOpen={isAiCommentOpen}
        onClose={() => setIsAiCommentOpen(false)}
        students={students}
        evaluationsMap={evaluationsMap}
        txCount={config.txCount || 4}
        subject={selectedSubject}
        onApplyComments={handleApplyBatchComments}
      />

      <ImportGradesModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        students={students}
        txCount={config.txCount || 4}
        onApplyImportedGrades={handleApplyImportedGrades}
      />

      <QuickAddStudentsModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        classId={selectedClassId}
        className={currentClassName}
        onStudentsAdded={(newClassId, newStudents) => {
          refreshClassesAndStudents();
          setSelectedClassId(newClassId);
          setStudents(newStudents);
        }}
      />

      {/* 4. MODAL CHỈNH SỬA HỌC SINH (GIỚI TÍNH, AVATAR TỪ MÁY TÍNH, HỌ TÊN) */}
      <EditStudentModal
        isOpen={Boolean(editingStudent)}
        onClose={() => setEditingStudent(null)}
        student={editingStudent}
        onSaveStudent={handleSaveEditedStudent}
      />
    </div>
  );
}
