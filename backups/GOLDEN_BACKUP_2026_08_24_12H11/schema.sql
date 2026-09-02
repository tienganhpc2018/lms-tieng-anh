-- ========================================================
-- LMS HỌC LIỆU TIẾNG ANH - SUPABASE DATABASE SCHEMA FULL V2
-- Project: wjphcawebrxdvituvuac
-- Hướng dẫn: Copy dán 1 lần duy nhất vào SQL Editor và nhấn RUN
-- ========================================================

-- 1. BẢNG PROFILES (Hồ sơ người dùng & Phụ huynh)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('teacher', 'student', 'manager')) DEFAULT 'student',
    avatar_url TEXT,
    phone TEXT,
    school TEXT,
    class_name TEXT,
    parent_pin TEXT, -- Mã PIN cho phụ huynh tra cứu
    status TEXT NOT NULL CHECK (status IN ('active', 'locked')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. BẢNG COURSES (Khóa học & Mã Join Code 6 ký tự)
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    join_code TEXT UNIQUE NOT NULL, -- Mã gia nhập 6 ký tự (ví dụ: E9GS26)
    is_private BOOLEAN DEFAULT true,
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. BẢNG COURSE_ENROLLMENTS (Ghi danh người học Enrolled Users)
CREATE TABLE IF NOT EXISTS public.course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'student',
    status TEXT NOT NULL CHECK (status IN ('active', 'suspended')) DEFAULT 'active',
    enrolled_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(course_id, user_id)
);

-- 4. BẢNG COURSE_SECTIONS (Chủ đề / Tuần học)
CREATE TABLE IF NOT EXISTS public.course_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. BẢNG ACTIVITIES (Hoạt động bài học: Quiz, SCORM, H5P, Assignment, Video, Page, URL)
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES public.course_sections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('quiz', 'h5p', 'scorm', 'assignment', 'url', 'page', 'video')),
    content_url TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. BẢNG QUESTIONS (Ngân hàng câu hỏi Quiz)
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('multiple_choice', 'fill_blank_dropdown', 'true_false', 'matching', 'essay')),
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    marks NUMERIC DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. BẢNG SUBMISSIONS (Bài nộp & Điểm số của Học sinh)
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    answers_data JSONB DEFAULT '{}'::jsonb,
    file_url TEXT,
    score NUMERIC DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('in_progress', 'submitted', 'graded')) DEFAULT 'in_progress',
    feedback TEXT,
    submitted_at TIMESTAMPTZ DEFAULT now(),
    graded_at TIMESTAMPTZ
);

-- 8. BẢNG SCORM_H5P_TRACKING (Theo dõi tiến trình bài SCORM/H5P)
CREATE TABLE IF NOT EXISTS public.scorm_h5p_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tracking_data JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'not_attempted',
    score NUMERIC DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(activity_id, student_id)
);

-- 9. BẢNG ATTENDANCE (Điểm danh lớp học thời gian thực)
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent_permitted', 'absent_unpermitted', 'late')) DEFAULT 'present',
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(course_id, student_id, date)
);

-- ========================================================
-- INDEXES TỐI ƯU HIỆU NĂNG TRUY VẤN
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_courses_teacher ON public.courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_join_code ON public.courses(join_code);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_user ON public.course_enrollments(course_id, user_id);
CREATE INDEX IF NOT EXISTS idx_sections_course ON public.course_sections(course_id);
CREATE INDEX IF NOT EXISTS idx_activities_section ON public.activities(section_id);
CREATE INDEX IF NOT EXISTS idx_questions_activity ON public.questions(activity_id);
CREATE INDEX IF NOT EXISTS idx_submissions_activity_student ON public.submissions(activity_id, student_id);
CREATE INDEX IF NOT EXISTS idx_tracking_activity_student ON public.scorm_h5p_tracking(activity_id, student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_course_date ON public.attendance(course_id, date);

-- TRIGGER TỰ ĐỘNG KHỞI TẠO PROFILES KHỦNG KHI CÓ USER ĐĂNG KÝ
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- BẬT ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scorm_h5p_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles are viewable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 2. COURSES POLICIES
DROP POLICY IF EXISTS "Courses are viewable by authenticated users" ON public.courses;
CREATE POLICY "Courses are viewable by authenticated users" ON public.courses FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Teachers can insert courses" ON public.courses;
CREATE POLICY "Teachers can insert courses" ON public.courses FOR INSERT TO authenticated WITH CHECK (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can update their own courses" ON public.courses;
CREATE POLICY "Teachers can update their own courses" ON public.courses FOR UPDATE TO authenticated USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can delete their own courses" ON public.courses;
CREATE POLICY "Teachers can delete their own courses" ON public.courses FOR DELETE TO authenticated USING (auth.uid() = teacher_id);

-- 3. ENROLLMENTS POLICIES
DROP POLICY IF EXISTS "Enrollments viewable by enrolled user or teacher" ON public.course_enrollments;
CREATE POLICY "Enrollments viewable by enrolled user or teacher" ON public.course_enrollments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can enroll" ON public.course_enrollments;
CREATE POLICY "Authenticated users can enroll" ON public.course_enrollments FOR ALL TO authenticated USING (true);

-- 4. COURSE SECTIONS POLICIES
DROP POLICY IF EXISTS "Sections are viewable by authenticated users" ON public.course_sections;
CREATE POLICY "Sections are viewable by authenticated users" ON public.course_sections FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Teachers can manage sections" ON public.course_sections;
CREATE POLICY "Teachers can manage sections" ON public.course_sections FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_sections.course_id AND courses.teacher_id = auth.uid())
);

-- 5. ACTIVITIES POLICIES
DROP POLICY IF EXISTS "Activities are viewable by authenticated users" ON public.activities;
CREATE POLICY "Activities are viewable by authenticated users" ON public.activities FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Teachers can manage activities" ON public.activities;
CREATE POLICY "Teachers can manage activities" ON public.activities FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.course_sections 
    JOIN public.courses ON courses.id = course_sections.course_id
    WHERE course_sections.id = activities.section_id AND courses.teacher_id = auth.uid()
  )
);

-- 6. QUESTIONS POLICIES
DROP POLICY IF EXISTS "Questions are viewable by authenticated users" ON public.questions;
CREATE POLICY "Questions are viewable by authenticated users" ON public.questions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Teachers can manage questions" ON public.questions;
CREATE POLICY "Teachers can manage questions" ON public.questions FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.activities
    JOIN public.course_sections ON course_sections.id = activities.section_id
    JOIN public.courses ON courses.id = course_sections.course_id
    WHERE activities.id = questions.activity_id AND courses.teacher_id = auth.uid()
  )
);

-- 7. SUBMISSIONS POLICIES
DROP POLICY IF EXISTS "Submissions viewable by submission owner or course teacher" ON public.submissions;
CREATE POLICY "Submissions viewable by submission owner or course teacher" ON public.submissions FOR SELECT TO authenticated USING (
  student_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.activities
    JOIN public.course_sections ON course_sections.id = activities.section_id
    JOIN public.courses ON courses.id = course_sections.course_id
    WHERE activities.id = submissions.activity_id AND courses.teacher_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Students can insert their own submission" ON public.submissions;
CREATE POLICY "Students can insert their own submission" ON public.submissions FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can update their own in_progress submission or teachers grade" ON public.submissions;
CREATE POLICY "Students can update their own in_progress submission or teachers grade" ON public.submissions FOR UPDATE TO authenticated USING (
  student_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.activities
    JOIN public.course_sections ON course_sections.id = activities.section_id
    JOIN public.courses ON courses.id = course_sections.course_id
    WHERE activities.id = submissions.activity_id AND courses.teacher_id = auth.uid()
  )
);

-- 8. SCORM_H5P_TRACKING POLICIES
DROP POLICY IF EXISTS "Tracking data viewable by student owner or course teacher" ON public.scorm_h5p_tracking;
CREATE POLICY "Tracking data viewable by student owner or course teacher" ON public.scorm_h5p_tracking FOR SELECT TO authenticated USING (
  student_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.activities
    JOIN public.course_sections ON course_sections.id = activities.section_id
    JOIN public.courses ON courses.id = course_sections.course_id
    WHERE activities.id = scorm_h5p_tracking.activity_id AND courses.teacher_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Students can manage their own tracking data" ON public.scorm_h5p_tracking;
CREATE POLICY "Students can manage their own tracking data" ON public.scorm_h5p_tracking FOR ALL TO authenticated USING (student_id = auth.uid());

-- 9. ATTENDANCE POLICIES
DROP POLICY IF EXISTS "Attendance viewable by student or teacher" ON public.attendance;
CREATE POLICY "Attendance viewable by student or teacher" ON public.attendance FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Teachers manage attendance" ON public.attendance;
CREATE POLICY "Teachers manage attendance" ON public.attendance FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.courses WHERE courses.id = attendance.course_id AND courses.teacher_id = auth.uid())
);

-- STORAGE BUCKETS SETUP
INSERT INTO storage.buckets (id, name, public) VALUES ('lms-files', 'lms-files', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload LMS files" ON storage.objects;
CREATE POLICY "Authenticated users can upload LMS files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'lms-files');

DROP POLICY IF EXISTS "Public read access for LMS files" ON storage.objects;
CREATE POLICY "Public read access for LMS files" ON storage.objects FOR SELECT TO public USING (bucket_id = 'lms-files');
