import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen, Layers, Users, Award, FileText, Activity, CheckSquare, Sparkles, Home, Globe, Folder, PlayCircle } from 'lucide-react';

export default function CourseSidebar({ sections, activeSectionId, onSelectSection, isTeacher, courseTitle, onOpenEnrolledModal }) {
  const [navExpanded, setNavExpanded] = useState({
    dashboard: true,
    myCourses: true,
    courseContent: true,
    unit1: true,
  });

  const toggleNav = (key) => {
    setNavExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside className="w-full lg:w-72 bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-sm h-fit">
      {/* KHỐI NAVIGATION MOODLE CHUẨN 100% ẢNH 3 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Navigation</h2>
          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Moodle LMS</span>
        </div>

        <div className="space-y-1 text-xs font-semibold text-slate-700">
          {/* Dashboard */}
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
                <div className="flex items-center space-x-2 p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
                  <Globe className="w-3.5 h-3.5 text-sky-500" />
                  <span>Site home</span>
                </div>
                <div className="flex items-center space-x-2 p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
                  <Folder className="w-3.5 h-3.5 text-amber-500" />
                  <span>Site pages</span>
                </div>
              </div>
            )}
          </div>

          {/* My courses */}
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
                {/* Nội dung bài học */}
                <div>
                  <button
                    onClick={() => toggleNav('courseContent')}
                    className="w-full flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg transition font-bold text-slate-800"
                  >
                    <span>Nội dung bài học</span>
                    {navExpanded.courseContent ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>

                  {navExpanded.courseContent && (
                    <div className="pl-4 space-y-1 text-[11px] font-medium text-slate-600">
                      <div
                        onClick={onOpenEnrolledModal}
                        className="flex items-center space-x-2 p-1 hover:bg-emerald-50 hover:text-emerald-800 rounded cursor-pointer"
                      >
                        <Users className="w-3 h-3 text-emerald-600" />
                        <span>Participants (Học viên)</span>
                      </div>
                      <div className="flex items-center space-x-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                        <Award className="w-3 h-3 text-amber-500" />
                        <span>Badges</span>
                      </div>
                      <div className="flex items-center space-x-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                        <CheckSquare className="w-3 h-3 text-purple-500" />
                        <span>Competencies</span>
                      </div>
                      <div className="flex items-center space-x-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                        <FileText className="w-3 h-3 text-teal-500" />
                        <span>Grades</span>
                      </div>
                      <div className="flex items-center space-x-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                        <Activity className="w-3 h-3 text-rose-500" />
                        <span>Activities</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  DANH SÁCH CÁC BÀI HỌC
                </div>

                {/* English 9 - UNIT 1 */}
                <div>
                  <button
                    onClick={() => toggleNav('unit1')}
                    className="w-full flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg transition font-bold text-sky-700"
                  >
                    <span>English 9 - UNIT 1</span>
                    {navExpanded.unit1 ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>

                  {navExpanded.unit1 && (
                    <div className="pl-3 space-y-1 text-[11px] font-medium text-slate-700">
                      <div className="p-1 hover:bg-sky-50 hover:text-sky-800 rounded cursor-pointer flex items-center space-x-1.5">
                        <PlayCircle className="w-3 h-3 text-sky-600" />
                        <span>Getting started</span>
                      </div>
                      <div className="p-1 hover:bg-sky-50 hover:text-sky-800 rounded cursor-pointer flex items-center space-x-1.5">
                        <span className="px-1 bg-sky-100 text-sky-800 text-[9px] font-bold rounded">H5P</span>
                        <span>Unit 1- E9 (Find the words)</span>
                      </div>
                      <div className="p-1 hover:bg-sky-50 hover:text-sky-800 rounded cursor-pointer flex items-center space-x-1.5">
                        <span className="px-1 bg-purple-100 text-purple-800 text-[9px] font-bold rounded">H5P</span>
                        <span>Vocabulary (Dialog Card)</span>
                      </div>
                      <div className="p-1 hover:bg-sky-50 hover:text-sky-800 rounded cursor-pointer flex items-center space-x-1.5">
                        <span className="px-1 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded">H5P</span>
                        <span>#Flashcard-Unit 1- E9</span>
                      </div>
                      <div className="p-1 hover:bg-sky-50 hover:text-sky-800 rounded cursor-pointer flex items-center space-x-1.5">
                        <span className="px-1 bg-amber-100 text-amber-800 text-[9px] font-bold rounded">H5P</span>
                        <span>Unit 1-E9_Speak the words set</span>
                      </div>
                      <div className="p-1 hover:bg-sky-50 hover:text-sky-800 rounded cursor-pointer flex items-center space-x-1.5">
                        <span className="px-1 bg-rose-100 text-rose-800 text-[9px] font-bold rounded">H5P</span>
                        <span>Unit 1-E9 (Cross the word)</span>
                      </div>
                      <div className="p-1 hover:bg-sky-50 hover:text-sky-800 rounded cursor-pointer flex items-center space-x-1.5">
                        <span className="px-1 bg-indigo-100 text-indigo-800 text-[9px] font-bold rounded">H5P</span>
                        <span>Unit 1- E9 (Interactive book)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DANH SÁCH SECTIONS THỰC TẾ TRONG KHOÁ HỌC */}
      <div className="border-t border-slate-100 pt-4 space-y-2">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">CHỦ ĐỀ BÀI HỌC HIỆN CÓ</h3>
        <div className="space-y-1">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => onSelectSection(sec.id)}
              className={`w-full text-left p-2.5 rounded-xl font-bold text-xs transition flex items-center space-x-2 ${
                activeSectionId === sec.id
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-xs'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-600" />
              <span className="truncate">{sec.title}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
