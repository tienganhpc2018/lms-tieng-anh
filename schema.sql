-- ============================================================================
-- EDUTECH AI MANAGING SYSTEM - PRODUCTION-READY SUPABASE DATABASE SCHEMA
-- Global Success Grades 6-9, AI Writing/Speaking Grader & Virtual Exam Room
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. PROFILES TABLE (Extends Supabase Auth users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for profile queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ----------------------------------------------------------------------------
-- 2. CLASSES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    code VARCHAR(10) UNIQUE NOT NULL,
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    grade_level INTEGER CHECK (grade_level BETWEEN 6 AND 9),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_classes_teacher ON public.classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_code ON public.classes(code);

-- ----------------------------------------------------------------------------
-- 3. CLASS MEMBERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.class_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(class_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_class_members_class ON public.class_members(class_id);
CREATE INDEX IF NOT EXISTS idx_class_members_student ON public.class_members(student_id);

-- ----------------------------------------------------------------------------
-- 4. MATERIALS & GAME HUB TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    type TEXT NOT NULL CHECK (type IN ('document', 'video', 'game_iframe', 'game_html5')),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT false NOT NULL,
    grade_level INTEGER CHECK (grade_level BETWEEN 6 AND 9),
    unit_number INTEGER,
    topic TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_materials_author ON public.materials(author_id);
CREATE INDEX IF NOT EXISTS idx_materials_grade ON public.materials(grade_level);
CREATE INDEX IF NOT EXISTS idx_materials_type ON public.materials(type);

-- ----------------------------------------------------------------------------
-- 5. ASSIGNMENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID REFERENCES public.materials(id) ON DELETE SET NULL,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    assignment_type TEXT DEFAULT 'material' CHECK (assignment_type IN ('material', 'exam', 'ai_writing', 'ai_speaking')),
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    test_config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_assignments_class ON public.assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_assignments_material ON public.assignments(material_id);

-- ----------------------------------------------------------------------------
-- 6. STUDENT PROGRESS & SUBMISSIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    score NUMERIC(5, 2),
    completion_time_seconds INTEGER,
    submission_content JSONB DEFAULT '{}'::jsonb,
    feedback JSONB DEFAULT '{}'::jsonb,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_assignment ON public.student_progress(assignment_id);
CREATE INDEX IF NOT EXISTS idx_progress_student ON public.student_progress(student_id);

-- ----------------------------------------------------------------------------
-- 7. GLOBAL SUCCESS CURRICULUM UNITS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.curriculum_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grade INTEGER NOT NULL CHECK (grade BETWEEN 6 AND 9),
    unit_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    topic TEXT NOT NULL,
    vocabulary JSONB DEFAULT '[]'::jsonb,
    grammar JSONB DEFAULT '[]'::jsonb,
    UNIQUE(grade, unit_number)
);

CREATE INDEX IF NOT EXISTS idx_curriculum_grade_unit ON public.curriculum_units(grade, unit_number);

-- ----------------------------------------------------------------------------
-- 8. QUESTION BANK TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.question_bank (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grade INTEGER NOT NULL CHECK (grade BETWEEN 6 AND 9),
    unit_number INTEGER,
    topic TEXT NOT NULL,
    skill TEXT NOT NULL CHECK (skill IN ('grammar', 'vocabulary', 'reading', 'writing', 'speaking')),
    question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'fill_in_blank', 'essay', 'audio_speaking')),
    content TEXT NOT NULL,
    options JSONB DEFAULT '[]'::jsonb,
    correct_answer TEXT,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_question_grade ON public.question_bank(grade);
CREATE INDEX IF NOT EXISTS idx_question_skill ON public.question_bank(skill);

-- ----------------------------------------------------------------------------
-- 9. VIRTUAL EXAMS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.virtual_exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    grade INTEGER NOT NULL CHECK (grade BETWEEN 6 AND 9),
    duration_minutes INTEGER NOT NULL DEFAULT 45,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- AUTOMATIC PROFILE TRIGGER ON USER REGISTRATION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, avatar_url)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'role', 'student'),
        COALESCE(new.raw_user_meta_data->>'avatar_url', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_exams ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check teacher role
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('teacher', 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- PROFILES POLICIES ---
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Admins full management on profiles" 
ON public.profiles FOR ALL TO authenticated USING (public.is_admin());

-- --- CLASSES POLICIES ---
CREATE POLICY "Anyone authenticated can view classes" 
ON public.classes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Teachers can create classes" 
ON public.classes FOR INSERT TO authenticated 
WITH CHECK (public.is_teacher() AND auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own classes" 
ON public.classes FOR UPDATE TO authenticated 
USING (teacher_id = auth.uid() OR public.is_admin());

CREATE POLICY "Teachers can delete own classes" 
ON public.classes FOR DELETE TO authenticated 
USING (teacher_id = auth.uid() OR public.is_admin());

-- --- CLASS MEMBERS POLICIES ---
CREATE POLICY "Class members viewable by authenticated users" 
ON public.class_members FOR SELECT TO authenticated USING (true);

CREATE POLICY "Students can join class or Teachers can add students" 
ON public.class_members FOR INSERT TO authenticated 
WITH CHECK (
    student_id = auth.uid() OR 
    public.is_teacher()
);

CREATE POLICY "Teachers or Admins can remove class members" 
ON public.class_members FOR DELETE TO authenticated 
USING (
    student_id = auth.uid() OR 
    public.is_teacher()
);

-- --- MATERIALS POLICIES ---
CREATE POLICY "Public materials viewable by all, private by owner" 
ON public.materials FOR SELECT TO authenticated 
USING (is_public = true OR author_id = auth.uid() OR public.is_admin() OR public.is_teacher());

CREATE POLICY "Teachers and Admins can create materials" 
ON public.materials FOR INSERT TO authenticated 
WITH CHECK (public.is_teacher());

CREATE POLICY "Authors and Admins can update materials" 
ON public.materials FOR UPDATE TO authenticated 
USING (author_id = auth.uid() OR public.is_admin());

CREATE POLICY "Authors and Admins can delete materials" 
ON public.materials FOR DELETE TO authenticated 
USING (author_id = auth.uid() OR public.is_admin());

-- --- ASSIGNMENTS POLICIES ---
CREATE POLICY "Assignments viewable by class members & teachers" 
ON public.assignments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Teachers can create assignments" 
ON public.assignments FOR INSERT TO authenticated 
WITH CHECK (public.is_teacher());

CREATE POLICY "Teachers can update assignments" 
ON public.assignments FOR UPDATE TO authenticated 
USING (public.is_teacher());

CREATE POLICY "Teachers can delete assignments" 
ON public.assignments FOR DELETE TO authenticated 
USING (public.is_teacher());

-- --- STUDENT PROGRESS POLICIES ---
CREATE POLICY "Students view own progress, teachers view class progress" 
ON public.student_progress FOR SELECT TO authenticated 
USING (student_id = auth.uid() OR public.is_teacher());

CREATE POLICY "Students can insert own progress" 
ON public.student_progress FOR INSERT TO authenticated 
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students or Teachers can update progress" 
ON public.student_progress FOR UPDATE TO authenticated 
USING (student_id = auth.uid() OR public.is_teacher());

-- --- CURRICULUM UNITS & QUESTION BANK ---
CREATE POLICY "Curriculum units readable by all authenticated" 
ON public.curriculum_units FOR SELECT TO authenticated USING (true);

CREATE POLICY "Teachers/Admins manage curriculum units" 
ON public.curriculum_units FOR ALL TO authenticated USING (public.is_teacher());

CREATE POLICY "Question bank readable by teachers/admins" 
ON public.question_bank FOR SELECT TO authenticated USING (true);

CREATE POLICY "Teachers/Admins manage question bank" 
ON public.question_bank FOR ALL TO authenticated USING (public.is_teacher());

-- --- VIRTUAL EXAMS ---
CREATE POLICY "Exams readable by authenticated" 
ON public.virtual_exams FOR SELECT TO authenticated USING (true);

CREATE POLICY "Teachers manage virtual exams" 
ON public.virtual_exams FOR ALL TO authenticated USING (public.is_teacher());


-- ============================================================================
-- STORAGE BUCKETS SETUP (Run via SQL or Supabase Dashboard)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('materials', 'materials', true) 
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Public Read Access on Materials Bucket" 
ON storage.objects FOR SELECT TO authenticated 
USING (bucket_id = 'materials');

CREATE POLICY "Authenticated Users Upload Access on Materials Bucket" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'materials');


-- ============================================================================
-- GLOBAL SUCCESS CURRICULUM SEED DATA (Lớp 6 đến Lớp 9)
-- ============================================================================

INSERT INTO public.curriculum_units (grade, unit_number, title, topic, vocabulary, grammar) VALUES
(6, 1, 'My New School', 'School Things & Activities', 
 '[{"word": "calculator", "pos": "n", "mean": "máy tính bỏ túi"}, {"word": "uniform", "pos": "n", "mean": "đồng phục"}, {"word": "compass", "pos": "n", "mean": "com-pa"}, {"word": "boarding school", "pos": "n", "mean": "trường nội trú"}]'::jsonb,
 '[{"title": "The Present Simple", "rule": "S + V(s/es) for permanent habits or general truths.", "examples": ["I study English every day.", "He wears uniform on Mondays."]}, {"title": "Adverbs of Frequency", "rule": "always, usually, often, sometimes, never before main verbs.", "examples": ["She usually plays badminton after school."]}]'::jsonb
),
(6, 2, 'My House', 'Types of House & Rooms', 
 '[{"word": "stilt house", "pos": "n", "mean": "nhà sàn"}, {"word": "country house", "pos": "n", "mean": "nhà ở quê"}, {"word": "town house", "pos": "n", "mean": "nhà phố"}, {"word": "dishwasher", "pos": "n", "mean": "máy rửa bát"}]'::jsonb,
 '[{"title": "Possessive Nouns", "rule": "Add ''s for singular nouns (Nam''s desk) and '' for plural ends in s.", "examples": ["This is Elena''s bedroom."]}, {"title": "Prepositions of Place", "rule": "in, on, under, behind, in front of, next to, between.", "examples": ["The dog is sleeping under the table."]}]'::jsonb
),
(7, 1, 'Hobbies', 'Free Time Activities & Hobbies', 
 '[{"word": "gardening", "pos": "n", "mean": "làm vườn"}, {"word": "collecting coins", "pos": "n", "mean": "sưu tầm tiền xu"}, {"word": "dollhouse", "pos": "n", "mean": "nhà búp bê"}, {"word": "cardboard", "pos": "n", "mean": "bìa cứng"}]'::jsonb,
 '[{"title": "The Present Simple for Hobbies", "rule": "Express habits, hobbies, routines.", "examples": ["My brother loves building models."]}, {"title": "Verbs of Liking + V-ing", "rule": "love, like, enjoy, hate, dislike + V-ing.", "examples": ["She enjoys making origami."]}]'::jsonb
),
(8, 1, 'Life in the Countryside', 'Rural Life & Activities', 
 '[{"word": "harvest time", "pos": "n", "mean": "mùa thu hoạch"}, {"word": "cattle", "pos": "n", "mean": "gia súc"}, {"word": "paddy field", "pos": "n", "mean": "cánh đồng lúa"}, {"word": "hospitable", "pos": "adj", "mean": "hiếu khách"}]'::jsonb,
 '[{"title": "Comparative Forms of Adverbs", "rule": "Short adverbs: S + V + adv-er + than; Long adverbs: S + V + more + adv + than.", "examples": ["Farmers work harder at harvest time.", "City people drive more carefully."]}]'::jsonb
),
(9, 1, 'Local Environment', 'Craft Villages & Traditional Crafts', 
 '[{"word": "artisan", "pos": "n", "mean": "nGHệ nhân"}, {"word": "handicraft", "pos": "n", "mean": "sản phẩm thủ công"}, {"word": "pottery", "pos": "n", "mean": "đồ gốm"}, {"word": "conical hat", "pos": "n", "mean": "nón lá"}]'::jsonb,
 '[{"title": "Complex Sentences with Adverbial Clauses", "rule": "Clause of result, purpose, time, concession (although, so that, because, when).", "examples": ["Although it rained, artisans kept working on pottery."]}]'::jsonb
)
ON CONFLICT (grade, unit_number) DO NOTHING;

-- Seed Sample Questions into Question Bank
INSERT INTO public.question_bank (grade, unit_number, topic, skill, question_type, content, options, correct_answer, explanation) VALUES
(6, 1, 'School Things', 'grammar', 'multiple_choice', 
 'My brother _______ to school by bicycle every morning.', 
 '["go", "goes", "is going", "went"]'::jsonb, 
 'goes', 
 'Hiện tại đơn với chủ ngữ số ít "My brother" chia động từ thêm -es: goes.'),
(6, 1, 'School Things', 'vocabulary', 'multiple_choice', 
 'You need a _______ to draw circles in math class.', 
 '["calculator", "compass", "ruler", "rubber"]'::jsonb, 
 'compass', 
 'Compass nghĩa là com-pa dùng để vẽ hình tròn.'),
(7, 1, 'Hobbies', 'grammar', 'multiple_choice', 
 'My father hates _______ fast food because it is unhealthy.', 
 '["eat", "eating", "eaten", "ate"]'::jsonb, 
 'eating', 
 'Sau các động từ chỉ sự yêu/ghét như hate, enjoy, like dùng V-ing.'),
(8, 1, 'Countryside Life', 'grammar', 'multiple_choice', 
 'In the countryside, children play _______ than in crowded cities.', 
 '["freely", "more freely", "freelier", "most freely"]'::jsonb, 
 'more freely', 
 'Trạng từ dài "freely" dùng hình thức so sánh hơn "more freely".'),
(9, 1, 'Local Environment', 'grammar', 'multiple_choice', 
 'Bat Trang is famous for pottery _______ it has a rich history of craftsmanship.', 
 '["because", "although", "so that", "in order that"]'::jsonb, 
 'because', 
 'Mệnh đề chỉ lý do dùng "because".')
ON CONFLICT DO NOTHING;
