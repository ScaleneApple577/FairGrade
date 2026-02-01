-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('teacher', 'student');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role app_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for role-based access control
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  course_name TEXT,
  description TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  group_size INTEGER DEFAULT 4,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Project URLs table (defines tracking boundaries)
CREATE TABLE public.project_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  platform TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Groups table
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  group_number INTEGER NOT NULL,
  group_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Project students table
CREATE TABLE public.project_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  extension_installed BOOLEAN DEFAULT FALSE,
  extension_last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (project_id, student_id)
);

-- Activity logs table (from extension)
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  platform TEXT,
  url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  characters_added INTEGER DEFAULT 0,
  characters_deleted INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Contribution scores table
CREATE TABLE public.contribution_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_score DECIMAL(5,2) DEFAULT 0,
  document_edit_score DECIMAL(5,2) DEFAULT 0,
  meeting_score DECIMAL(5,2) DEFAULT 0,
  communication_score DECIMAL(5,2) DEFAULT 0,
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (project_id, student_id)
);

-- Student availability table
CREATE TABLE public.student_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Project tasks table
CREATE TABLE public.project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  task_name TEXT NOT NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Teachers can view their own projects"
ON public.projects FOR SELECT
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create projects"
ON public.projects FOR INSERT
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own projects"
ON public.projects FOR UPDATE
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own projects"
ON public.projects FOR DELETE
USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view projects they belong to"
ON public.projects FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_students
    WHERE project_students.project_id = projects.id
    AND project_students.student_id = auth.uid()
  )
);

-- Project URLs policies
CREATE POLICY "Teachers can manage project URLs"
ON public.project_urls FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_urls.project_id
    AND projects.teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view project URLs for their projects"
ON public.project_urls FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_students
    WHERE project_students.project_id = project_urls.project_id
    AND project_students.student_id = auth.uid()
  )
);

-- Groups policies
CREATE POLICY "Teachers can manage groups"
ON public.groups FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = groups.project_id
    AND projects.teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view groups for their projects"
ON public.groups FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_students
    WHERE project_students.project_id = groups.project_id
    AND project_students.student_id = auth.uid()
  )
);

-- Project students policies
CREATE POLICY "Teachers can manage project students"
ON public.project_students FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_students.project_id
    AND projects.teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view their own project enrollment"
ON public.project_students FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "Students can update their own extension status"
ON public.project_students FOR UPDATE
USING (student_id = auth.uid());

-- Activity logs policies
CREATE POLICY "Teachers can view activity for their projects"
ON public.activity_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = activity_logs.project_id
    AND projects.teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view their own activity"
ON public.activity_logs FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "Students can insert their own activity"
ON public.activity_logs FOR INSERT
WITH CHECK (student_id = auth.uid());

-- Contribution scores policies
CREATE POLICY "Teachers can view scores for their projects"
ON public.contribution_scores FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = contribution_scores.project_id
    AND projects.teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view their own scores"
ON public.contribution_scores FOR SELECT
USING (student_id = auth.uid());

-- Student availability policies
CREATE POLICY "Students can manage their own availability"
ON public.student_availability FOR ALL
USING (student_id = auth.uid());

CREATE POLICY "Students can view teammate availability"
ON public.student_availability FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_students ps1
    JOIN public.project_students ps2 ON ps1.project_id = ps2.project_id
    WHERE ps1.student_id = auth.uid()
    AND ps2.student_id = student_availability.student_id
    AND ps1.project_id = student_availability.project_id
  )
);

-- Project tasks policies
CREATE POLICY "Teachers can manage tasks"
ON public.project_tasks FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_tasks.project_id
    AND projects.teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view tasks for their projects"
ON public.project_tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_students
    WHERE project_students.project_id = project_tasks.project_id
    AND project_students.student_id = auth.uid()
  )
);

CREATE POLICY "Students can update tasks assigned to them"
ON public.project_tasks FOR UPDATE
USING (assigned_to = auth.uid());

-- User roles policies
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();