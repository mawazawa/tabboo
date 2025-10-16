-- Create personal data vault table with encryption
CREATE TABLE IF NOT EXISTS public.personal_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  full_name TEXT,
  street_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  telephone_no TEXT,
  fax_no TEXT,
  email_address TEXT,
  attorney_name TEXT,
  firm_name TEXT,
  bar_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.personal_info ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own personal info" 
ON public.personal_info 
FOR SELECT 
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own personal info" 
ON public.personal_info 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own personal info" 
ON public.personal_info 
FOR UPDATE 
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own personal info" 
ON public.personal_info 
FOR DELETE 
USING (auth.uid()::text = user_id);

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_personal_info_updated_at
BEFORE UPDATE ON public.personal_info
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();