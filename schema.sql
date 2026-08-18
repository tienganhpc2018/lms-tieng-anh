-- ========================================================
-- LMS HỌC LIỆU - SUPABASE DATABASE SCHEMA MIGRATION SCRIPT
-- Chạy 1-Click trong Supabase SQL Editor để khởi tạo DB & RLS
-- ========================================================

-- 1. BẢNG PROFILES (Hồ sơ người dùng)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('teacher', 'student')) DEFAULT 'student',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. BẢNG COURSES (Khóa học)
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. BẢNG COURSE_SECTIONS (Các Tuần/Chủ đề học)
CREATE TABLE IF NOT EXISTS public.course_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. BẢNG ACTIVITIES (Các bài học & hoạt động tương tác)
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

-- 5. BẢNG QUESTIONS (Ngân hàng câu hỏi Quiz)
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('multiple_choice', 'fill_blank_dropdown')),
    content JSONB NOT NULL DEFAULT '{}'::jsonb, -- Chứa câu hỏi, danh sách lựa chọn, đáp án
    marks NUMERIC DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. BẢNG SUBMISSIONS (Bài làm & Nộp bài của Học sinh)
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

-- 7. BẢNG SCORM_H5P_TRACKING (Theo dõi tiến trình & điểm số bài SCORM/H5P)
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

-- ========================================================
-- INDEXES TỐI ƯU HIỆU NĂNG TRUY VẤN
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_courses_teacher ON public.courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_sections_course ON public.course_sections(course_id);
CREATE INDEX IF NOT EXISTS idx_activities_section ON public.activities(section_id);
CREATE INDEX IF NOT EXISTS idx_questions_activity ON public.questions(activity_id);
CREATE INDEX IF NOT EXISTS idx_submissions_activity_student ON public.submissions(activity_id, student_id);
CREATE INDEX IF NOT EXISTS idx_tracking_activity_student ON public.scorm_h5p_tracking(activity_id, student_id);

-- ========================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ========================================================
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

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scorm_h5p_tracking ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 2. COURSES POLICIES
CREATE POLICY "Courses are viewable by authenticated users" 
ON public.courses FOR SELECT TO authenticated USING (true);

CREATE POLICY "Teachers can insert courses" 
ON public.courses FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own courses" 
ON public.courses FOR UPDATE TO authenticated 
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own courses" 
ON public.courses FOR DELETE TO authenticated 
USING (auth.uid() = teacher_id);

-- 3. COURSE SECTIONS POLICIES
CREATE POLICY "Sections are viewable by authenticated users" 
ON public.course_sections FOR SELECT TO authenticated USING (true);

CREATE POLICY "Teachers can manage sections" 
ON public.course_sections FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = course_sections.course_id AND courses.teacher_id = auth.uid()
  )
);

-- 4. ACTIVITIES POLICIES
CREATE POLICY "Activities are viewable by authenticated users" 
ON public.activities FOR SELECT TO authenticated USING (true);

CREATE POLICY "Teachers can manage activities" 
ON public.activities FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.course_sections 
    JOIN public.courses ON courses.id = course_sections.course_id
    WHERE course_sections.id = activities.section_id AND courses.teacher_id = auth.uid()
  )
);

-- 5. QUESTIONS POLICIES
CREATE POLICY "Questions are viewable by authenticated users" 
ON public.questions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Teachers can manage questions" 
ON public.questions FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.activities
    JOIN public.course_sections ON course_sections.id = activities.section_id
    JOIN public.courses ON courses.id = course_sections.course_id
    WHERE activities.id = questions.activity_id AND courses.teacher_id = auth.uid()
  )
);

-- 6. SUBMISSIONS POLICIES
CREATE POLICY "Submissions viewable by submission owner or course teacher" 
ON public.submissions FOR SELECT TO authenticated 
USING (
  student_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.activities
    JOIN public.course_sections ON course_sections.id = activities.section_id
    JOIN public.courses ON courses.id = course_sections.course_id
    WHERE activities.id = submissions.activity_id AND courses.teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can insert their own submission" 
ON public.submissions FOR INSERT TO authenticated 
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own in_progress submission or teachers grade" 
ON public.submissions FOR UPDATE TO authenticated 
USING (
  student_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.activities
    JOIN public.course_sections ON course_sections.id = activities.section_id
    JOIN public.courses ON courses.id = course_sections.course_id
    WHERE activities.id = submissions.activity_id AND courses.teacher_id = auth.uid()
  )
);

-- 7. SCORM_H5P_TRACKING POLICIES
CREATE POLICY "Tracking data viewable by student owner or course teacher" 
ON public.scorm_h5p_tracking FOR SELECT TO authenticated 
USING (
  student_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.activities
    JOIN public.course_sections ON course_sections.id = activities.section_id
    JOIN public.courses ON courses.id = course_sections.course_id
    WHERE activities.id = scorm_h5p_tracking.activity_id AND courses.teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can manage their own tracking data" 
ON public.scorm_h5p_tracking FOR ALL TO authenticated 
USING (student_id = auth.uid());

-- ========================================================
-- STORAGE BUCKETS SETUP (Khuyến nghị tạo qua Dashboard hoặc script)
-- ========================================================
-- Bảng storage.buckets mặc định có sẵn trên Supabase
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lms-files', 'lms-files', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload LMS files" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'lms-files');

CREATE POLICY "Public read access for LMS files" 
ON storage.objects FOR SELECT TO public 
USING (bucket_id = 'lms-files');
