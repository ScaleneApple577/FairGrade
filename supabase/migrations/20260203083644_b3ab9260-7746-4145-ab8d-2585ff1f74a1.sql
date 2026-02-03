-- Create meetings table
CREATE TABLE public.meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255),
  created_by UUID NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meeting_attendees table
CREATE TABLE public.meeting_attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'invited',
  attended BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE,
  left_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meeting_polls table
CREATE TABLE public.meeting_polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  created_by UUID NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE,
  is_finalized BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll_options table
CREATE TABLE public.poll_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.meeting_polls(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll_votes table
CREATE TABLE public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_option_id UUID NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  vote_type VARCHAR(50) NOT NULL DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_option_id, student_id)
);

-- Enable RLS on all tables
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- RLS for meetings
CREATE POLICY "Students can view meetings for their projects"
ON public.meetings FOR SELECT
USING (EXISTS (
  SELECT 1 FROM project_students
  WHERE project_students.project_id = meetings.project_id
  AND project_students.student_id = auth.uid()
));

CREATE POLICY "Students can create meetings for their projects"
ON public.meetings FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM project_students
  WHERE project_students.project_id = meetings.project_id
  AND project_students.student_id = auth.uid()
) AND created_by = auth.uid());

CREATE POLICY "Meeting creators can update their meetings"
ON public.meetings FOR UPDATE
USING (created_by = auth.uid());

CREATE POLICY "Meeting creators can delete their meetings"
ON public.meetings FOR DELETE
USING (created_by = auth.uid());

CREATE POLICY "Teachers can manage meetings for their projects"
ON public.meetings FOR ALL
USING (EXISTS (
  SELECT 1 FROM projects
  WHERE projects.id = meetings.project_id
  AND projects.teacher_id = auth.uid()
));

-- RLS for meeting_attendees
CREATE POLICY "Students can view attendees for their project meetings"
ON public.meeting_attendees FOR SELECT
USING (EXISTS (
  SELECT 1 FROM meetings m
  JOIN project_students ps ON ps.project_id = m.project_id
  WHERE m.id = meeting_attendees.meeting_id
  AND ps.student_id = auth.uid()
));

CREATE POLICY "Students can update their own attendance"
ON public.meeting_attendees FOR UPDATE
USING (student_id = auth.uid());

CREATE POLICY "Meeting creators can manage attendees"
ON public.meeting_attendees FOR ALL
USING (EXISTS (
  SELECT 1 FROM meetings m
  WHERE m.id = meeting_attendees.meeting_id
  AND m.created_by = auth.uid()
));

CREATE POLICY "Teachers can manage attendees"
ON public.meeting_attendees FOR ALL
USING (EXISTS (
  SELECT 1 FROM meetings m
  JOIN projects p ON p.id = m.project_id
  WHERE m.id = meeting_attendees.meeting_id
  AND p.teacher_id = auth.uid()
));

-- RLS for meeting_polls
CREATE POLICY "Students can view polls for their projects"
ON public.meeting_polls FOR SELECT
USING (EXISTS (
  SELECT 1 FROM project_students
  WHERE project_students.project_id = meeting_polls.project_id
  AND project_students.student_id = auth.uid()
));

CREATE POLICY "Students can create polls for their projects"
ON public.meeting_polls FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM project_students
  WHERE project_students.project_id = meeting_polls.project_id
  AND project_students.student_id = auth.uid()
) AND created_by = auth.uid());

CREATE POLICY "Poll creators can update their polls"
ON public.meeting_polls FOR UPDATE
USING (created_by = auth.uid());

CREATE POLICY "Poll creators can delete their polls"
ON public.meeting_polls FOR DELETE
USING (created_by = auth.uid());

CREATE POLICY "Teachers can manage polls"
ON public.meeting_polls FOR ALL
USING (EXISTS (
  SELECT 1 FROM projects
  WHERE projects.id = meeting_polls.project_id
  AND projects.teacher_id = auth.uid()
));

-- RLS for poll_options
CREATE POLICY "Students can view poll options for their projects"
ON public.poll_options FOR SELECT
USING (EXISTS (
  SELECT 1 FROM meeting_polls mp
  JOIN project_students ps ON ps.project_id = mp.project_id
  WHERE mp.id = poll_options.poll_id
  AND ps.student_id = auth.uid()
));

CREATE POLICY "Poll creators can manage options"
ON public.poll_options FOR ALL
USING (EXISTS (
  SELECT 1 FROM meeting_polls mp
  WHERE mp.id = poll_options.poll_id
  AND mp.created_by = auth.uid()
));

CREATE POLICY "Teachers can manage poll options"
ON public.poll_options FOR ALL
USING (EXISTS (
  SELECT 1 FROM meeting_polls mp
  JOIN projects p ON p.id = mp.project_id
  WHERE mp.id = poll_options.poll_id
  AND p.teacher_id = auth.uid()
));

-- RLS for poll_votes
CREATE POLICY "Students can view votes for their project polls"
ON public.poll_votes FOR SELECT
USING (EXISTS (
  SELECT 1 FROM poll_options po
  JOIN meeting_polls mp ON mp.id = po.poll_id
  JOIN project_students ps ON ps.project_id = mp.project_id
  WHERE po.id = poll_votes.poll_option_id
  AND ps.student_id = auth.uid()
));

CREATE POLICY "Students can vote on polls"
ON public.poll_votes FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM poll_options po
  JOIN meeting_polls mp ON mp.id = po.poll_id
  JOIN project_students ps ON ps.project_id = mp.project_id
  WHERE po.id = poll_votes.poll_option_id
  AND ps.student_id = auth.uid()
) AND student_id = auth.uid());

CREATE POLICY "Students can update their own votes"
ON public.poll_votes FOR UPDATE
USING (student_id = auth.uid());

CREATE POLICY "Students can delete their own votes"
ON public.poll_votes FOR DELETE
USING (student_id = auth.uid());

CREATE POLICY "Teachers can view all votes"
ON public.poll_votes FOR SELECT
USING (EXISTS (
  SELECT 1 FROM poll_options po
  JOIN meeting_polls mp ON mp.id = po.poll_id
  JOIN projects p ON p.id = mp.project_id
  WHERE po.id = poll_votes.poll_option_id
  AND p.teacher_id = auth.uid()
));