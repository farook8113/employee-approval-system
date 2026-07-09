-- Create custom check constraints in tables
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('employee', 'manager')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Leave', 'Equipment', 'Software Access', 'Budget', 'Travel', 'Other')),
  priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  attachment_url TEXT,
  status TEXT DEFAULT 'Pending' NOT NULL CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  manager_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Allow read access to all authenticated users" ON public.profiles;
CREATE POLICY "Allow read access to all authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
CREATE POLICY "Allow users to update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Requests Policies
DROP POLICY IF EXISTS "Allow employees to select their own requests" ON public.requests;
CREATE POLICY "Allow employees to select their own requests"
ON public.requests FOR SELECT
TO authenticated
USING (
  employee_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'manager'
  )
);

DROP POLICY IF EXISTS "Allow employees to insert their own requests" ON public.requests;
CREATE POLICY "Allow employees to insert their own requests"
ON public.requests FOR INSERT
TO authenticated
WITH CHECK (
  employee_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'employee'
  )
);

DROP POLICY IF EXISTS "Allow employees to update their own pending requests" ON public.requests;
CREATE POLICY "Allow employees to update their own pending requests"
ON public.requests FOR UPDATE
TO authenticated
USING (
  employee_id = auth.uid() AND status = 'Pending'
)
WITH CHECK (
  employee_id = auth.uid() AND status = 'Pending'
);

DROP POLICY IF EXISTS "Allow managers to update any request" ON public.requests;
CREATE POLICY "Allow managers to update any request"
ON public.requests FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'manager'
  )
);

DROP POLICY IF EXISTS "Allow employees to delete their own pending requests" ON public.requests;
CREATE POLICY "Allow employees to delete their own pending requests"
ON public.requests FOR DELETE
TO authenticated
USING (
  employee_id = auth.uid() AND status = 'Pending'
);

-- Automate user profiles on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Employee User'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'employee')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
