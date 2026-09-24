import React from 'react';
import CourseIntroBanner from './CourseIntroBanner';
import FeaturedCoursesBox from './FeaturedCoursesBox';
import MemoriesFilmReelBox from './MemoriesFilmReelBox';
import TopStudentsBox from './TopStudentsBox';
import ClassForumBox from './ClassForumBox';

export default function HomeLandingView({ courses = [], userIsTeacher = false }) {
  const scrollToCourses = () => {
    const el = document.getElementById('box-cac-khoa-hoc');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-12 pb-12 animate-fade-in font-sans">
      {/* (1) GIỚI THIỆU CÁC KHÓA HỌC & KHẨU HIỆU "HỌC ĐỂ KHẲNG ĐỊNH MÌNH" */}
      <CourseIntroBanner onExploreClick={scrollToCourses} />

      {/* (2) CÁC KHÓA HỌC (ENGLISH 9, 8, 7) */}
      <FeaturedCoursesBox
        courses={courses}
        userIsTeacher={userIsTeacher}
      />

      {/* (3) CUỘN PHIM HỒI ỨC (3 BÀI MẪU PHIM 35MM) */}
      <MemoriesFilmReelBox userIsTeacher={userIsTeacher} />

      {/* (4) HỌC VIÊN TIÊU BIỂU (3 HỌC SINH) */}
      <TopStudentsBox userIsTeacher={userIsTeacher} />

      {/* (5) FORUM & THÔNG BÁO LỚP HỌC (3 NỘI DUNG MẪU) */}
      <ClassForumBox />
    </div>
  );
}
