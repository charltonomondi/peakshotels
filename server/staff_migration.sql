-- Staff Members table
CREATE TABLE IF NOT EXISTS public.staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'receptionist',
  department TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Staff Tasks table
CREATE TABLE IF NOT EXISTS public.staff_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES public.staff_members(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  due_time TEXT,
  completed BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Staff Meetings table
CREATE TABLE IF NOT EXISTS public.staff_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  location TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Staff Documents table
CREATE TABLE IF NOT EXISTS public.staff_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_documents ENABLE ROW LEVEL SECURITY;

-- Staff can read/update their own record
CREATE POLICY "staff_read_own" ON public.staff_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "staff_insert_own" ON public.staff_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Staff can manage their own tasks
CREATE POLICY "staff_tasks_own" ON public.staff_tasks
  FOR ALL USING (
    staff_id IN (SELECT id FROM public.staff_members WHERE user_id = auth.uid())
  );

-- All active staff can read meetings and documents
CREATE POLICY "staff_meetings_read" ON public.staff_meetings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.staff_members WHERE user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "staff_documents_read" ON public.staff_documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.staff_members WHERE user_id = auth.uid() AND status = 'active')
  );
