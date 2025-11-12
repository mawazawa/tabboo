-- Fix security vulnerability: Add fixed search_path to prevent function hijacking
-- This addresses the function_search_path_mutable security finding

CREATE OR REPLACE FUNCTION public.update_personal_info_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;