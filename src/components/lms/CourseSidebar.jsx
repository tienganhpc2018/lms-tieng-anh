import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen, Users, Award, FileText, Activity, CheckSquare, Home, Globe, Folder, PlayCircle, HelpCircle, Layers, Video, Database, Headphones, Type, Edit3, Globe as GlobeIcon, Settings, UserPlus, Upload, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserManagementModal from './UserManagementModal';

export default function CourseSidebar({
  courseTitle = 'English 9',
  sections = [],
  activities = [],
  activeSectionId,
  activeActivityId,
  onSelectSection,
  onSelectActivity,
  isTeacher,
  onOpenEnrolledModal,
}) {
  const navigate = useNavigate();
  const [navExpanded, setNavExpanded] = useState({
    dashboard: true,
    myCourses: true,
    questionBank: true,
    siteAdmin: true,
    units: {},
  });

  const [isUserMgmtOpen, setIsUserMgmtOpen] = useState(false);

  const toggleNav = (key) => {
    setNavExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleUnitNav = (secId) => {
    setNavExpanded((prev) => ({
      ...prev,
      units: { ...prev.units, [secId]: !prev.units[secId] },
    }));
  };

  return (
    <aside className="w-full lg:w-72 bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-sm h-fit font-sans select-none">
      {/* KHỐI NAVIGATION MOODLE DỮ LIỆU ĐỘNG THẬT 100% */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Navigation</h2>
          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Live Data</span>
        </div>

        <div className="space-y-1.5 text-xs font-semibold text-slate-700">
          {/* 1. Dashboard */}
          <div>
            <button
              onClick={() => toggleNav('dashboard')}
              className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition text-emerald-800 font-extrabold"
            >
              <div className="flex items-center space-x-2">
                <Home className="w-4 h-4 text-emerald-600" />
                <span>Dashboard</span>
              </div>
              {navExpanded.dashboard ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {navExpanded.dashboard && (
              <div className="pl-6 space-y-1 pt-1 text-slate-600">
                <div onClick={() => navigate('/dashboard')} className="flex items-center space-x-2 p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
                  <Globe className="w-3.5 h-3.5 text-sky-500" />
                  <span>Site home</span>
                </div>
                <div onClick={() => navigate('/dashboard')} className="flex items-center space-x-2 p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
                  <Folder className="w-3.5 h-3.5 text-amber-500" />
                  <span>Site pages</span>
                </div>
              </div>
            )}
          </div>

          {/* 2. My courses */}
          <div>
            <button
              onClick={() => toggleNav('myCourses')}
              className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition text-slate-900 font-extrabold"
            >
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>My courses</span>
              </div>
              {navExpanded.myCourses ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {navExpanded.myCourses && (
              <div className="pl-4 space-y-1 pt-1">
                {/* Quản lý Học viên */}
                <div
                  onClick={onOpenEnrolledModal}
                  className="flex items-center space-x-2 p-1.5 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg cursor-pointer text-slate-700 font-bold"
                >
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Participants (Danh sách Học viên)</span>
                </div>

                <div className="pt-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  DANH SÁCH BÀI HỌC THỰC TẾ ({sections.length} Units)
                </div>

                {/* DỮ LIỆU ĐỘNG LẶP THEO TỪNG UNIT TRONG CSDL */}
                {sections.map((sec) => {
                  const isUnitExpanded = navExpanded.units[sec.id] !== false;
                  const secActivities = activities.filter((a) => a.section_id === sec.id);

                  return (
                    <div key={sec.id} className="pt-1">
                      <button
                        onClick={() => {
                          toggleUnitNav(sec.id);
                          onSelectSection(sec.id);
                        }}
                        className={`w-full flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg transition font-extrabold text-xs ${
                          activeSectionId === sec.id ? 'text-emerald-700 bg-emerald-50/60' : 'text-slate-800'
                        }`}
                      >
                        <span className="truncate">{sec.title}</span>
                        {isUnitExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>

                      {/* DANH SÁCH CÁC TIẾT HỌC / BÀI TẬP ĐỘNG THỰC TẾ TRONG UNIT */}
                      {isUnitExpanded && (
                        <div className="pl-3 space-y-1 pt-1 text-[11px] font-medium">
                          {secActivities.length === 0 ? (
                            <div className="italic text-slate-400 p-1 text-[10px]">Chưa có bài học...</div>
                          ) : (
                            secActivities.map((act) => {
                              const isActActive = activeActivityId === act.id;
                              return (
                                <div
                                  key={act.id}
                                  onClick={() => {
                                    onSelectSection(sec.id);
                                    if (onSelectActivity) onSelectActivity(act.id);
                                  }}
                                  className={`p-1.5 rounded-lg cursor-pointer flex items-center space-x-1.5 transition ${
                                    isActActive
                                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                                      : 'hover:bg-sky-50 text-slate-700 hover:text-sky-800 font-semibold'
                                  }`}
                                >
                                  {act.type === 'quiz' && <HelpCircle className={`w-3.5 h-3.5 ${isActActive ? 'text-white' : 'text-emerald-600'}`} />}
                                  {act.type === 'video' && <Video className={`w-3.5 h-3.5 ${isActActive ? 'text-white' : 'text-rose-500'}`} />}
                                  {act.type === 'h5p' && <span className={`px-1 text-[9px] font-bold rounded ${isActActive ? 'bg-white text-emerald-800' : 'bg-purple-100 text-purple-800'}`}>H5P</span>}
                                  {act.type === 'page' && <FileText className={`w-3.5 h-3.5 ${isActActive ? 'text-white' : 'text-sky-500'}`} />}
                                  <span className="truncate">{act.title}</span>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. QUESTION BANK (NGÂN HÀNG CÂU HỎI & ĐỀ THI DƯỚI NAVIGATION SIDEBAR) */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => toggleNav('questionBank')}
              className="w-full flex items-center justify-between p-2 hover:bg-sky-50 rounded-xl transition text-sky-900 font-extrabold bg-sky-50/50"
            >
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-sky-600" />
                <span>Question Bank (Ngân Hàng Đề)</span>
              </div>
              {navExpanded.questionBank ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {navExpanded.questionBank && (
              <div className="pl-4 space-y-1.5 pt-2 text-[11px] font-bold">
                <div
                  onClick={() => navigate('/question-bank')}
                  className="flex items-center space-x-2 p-1.5 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg cursor-pointer text-slate-800"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>📖 1. READING SECTION (Bài Đọc)</span>
                </div>

                <div
                  onClick={() => navigate('/question-bank')}
                  className="flex items-center space-x-2 p-1.5 hover:bg-purple-50 hover:text-purple-800 rounded-lg cursor-pointer text-slate-800"
                >
                  <Headphones className="w-3.5 h-3.5 text-purple-600" />
                  <span>🎧 2. LISTENING SECTION (Bài Nghe)</span>
                </div>

                <div
                  onClick={() => navigate('/question-bank')}
                  className="flex items-center space-x-2 p-1.5 hover:bg-sky-50 hover:text-sky-800 rounded-lg cursor-pointer text-slate-800"
                >
                  <Type className="w-3.5 h-3.5 text-sky-600" />
                  <span>🔤 3. KNOWLEDGE (Cloze Test Đục Lỗ)</span>
                </div>

                <div
                  onClick={() => navigate('/question-bank')}
                  className="flex items-center space-x-2 p-1.5 hover:bg-amber-50 hover:text-amber-800 rounded-lg cursor-pointer text-slate-800"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                  <span>✍️ 4. WRITING SECTION (3 Parts)</span>
                </div>

                <div
                  onClick={() => navigate('/question-bank')}
                  className="flex items-center space-x-2 p-1.5 hover:bg-teal-50 hover:text-teal-800 rounded-lg cursor-pointer text-slate-800"
                >
                  <GlobeIcon className="w-3.5 h-3.5 text-teal-600" />
                  <span>🌐 5. GLOBAL SUCCESS (Khối 6-9)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. ADMINISTRATION (QUẢN TRỊ VIÊN SITE ADMINISTRATION NGUYÊN BẢN CHUẨN MOODLE GNOMIO) */}
        {isTeacher && (
          <div className="pt-3 border-t border-slate-200">
            <button
              onClick={() => toggleNav('siteAdmin')}
              className="w-full flex items-center justify-between p-2 hover:bg-purple-50 rounded-xl transition text-purple-950 font-extrabold bg-purple-50/60 border border-purple-200/60"
            >
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-purple-600" />
                <span>Administration</span>
              </div>
              {navExpanded.siteAdmin ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {navExpanded.siteAdmin && (
              <div className="pl-4 space-y-1 pt-2 text-[11px] font-bold text-slate-700">
                <div className="text-[10px] uppercase font-extrabold text-purple-800 tracking-wider flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-purple-600" />
                  <span>Site administration</span>
                </div>

                <div
                  onClick={() => setIsUserMgmtOpen(true)}
                  className="flex items-center space-x-2 p-1.5 hover:bg-purple-100 hover:text-purple-900 rounded-lg cursor-pointer text-slate-800 font-extrabold"
                >
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <span>Browse list of users</span>
                </div>

                <div
                  onClick={() => setIsUserMgmtOpen(true)}
                  className="flex items-center space-x-2 p-1.5 hover:bg-purple-100 hover:text-purple-900 rounded-lg cursor-pointer text-slate-700"
                >
                  <UserPlus className="w-3.5 h-3.5 text-sky-600" />
                  <span>Add a new user</span>
                </div>

                <div
                  onClick={() => setIsUserMgmtOpen(true)}
                  className="flex items-center space-x-2 p-1.5 hover:bg-purple-100 hover:text-purple-900 rounded-lg cursor-pointer text-slate-700"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Upload users via CSV</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL QUẢN LÝ TÀI KHOẢN HỌC SINH */}
      <UserManagementModal
        isOpen={isUserMgmtOpen}
        onClose={() => setIsUserMgmtOpen(false)}
      />
    </aside>
  );
}
