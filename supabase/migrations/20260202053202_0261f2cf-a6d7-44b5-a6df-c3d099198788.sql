-- Create extension_tokens table for Chrome extension authentication
CREATE TABLE public.extension_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.extension_tokens ENABLE ROW LEVEL SECURITY;

-- Students can view and manage their own tokens
CREATE POLICY "Students can view their own tokens"
ON public.extension_tokens
FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "Students can create their own tokens"
ON public.extension_tokens
FOR INSERT
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can delete their own tokens"
ON public.extension_tokens
FOR DELETE
USING (student_id = auth.uid());

-- Create event_stream table for activity tracking from extension
CREATE TABLE public.event_stream (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  project_id UUID REFERENCES public.projects(id),
  event_type TEXT NOT NULL,
  url TEXT,
  platform TEXT,
  duration_seconds INTEGER DEFAULT 0,
  characters_added INTEGER DEFAULT 0,
  characters_deleted INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_stream ENABLE ROW LEVEL SECURITY;

-- Students can insert their own events
CREATE POLICY "Students can insert their own events"
ON public.event_stream
FOR INSERT
WITH CHECK (student_id = auth.uid());

-- Students can view their own events
CREATE POLICY "Students can view their own events"
ON public.event_stream
FOR SELECT
USING (student_id = auth.uid());

-- Teachers can view events for their projects
CREATE POLICY "Teachers can view events for their projects"
ON public.event_stream
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM projects
  WHERE projects.id = event_stream.project_id
  AND projects.teacher_id = auth.uid()
));

-- Create index for faster queries
CREATE INDEX idx_event_stream_student_id ON public.event_stream(student_id);
CREATE INDEX idx_event_stream_project_id ON public.event_stream(project_id);
CREATE INDEX idx_event_stream_timestamp ON public.event_stream(timestamp);
CREATE INDEX idx_extension_tokens_token ON public.extension_tokens(token);
CREATE INDEX idx_extension_tokens_student_id ON public.extension_tokens(student_id);