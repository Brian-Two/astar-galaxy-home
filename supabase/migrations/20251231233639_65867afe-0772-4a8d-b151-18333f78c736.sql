-- Create storage bucket for source files
INSERT INTO storage.buckets (id, name, public) VALUES ('source-files', 'source-files', true);

-- Create policies for source-files bucket
CREATE POLICY "Users can upload their own source files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'source-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own source files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'source-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own source files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'source-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add file metadata columns to sources table
ALTER TABLE public.sources
ADD COLUMN IF NOT EXISTS file_name text,
ADD COLUMN IF NOT EXISTS mime_type text,
ADD COLUMN IF NOT EXISTS size_bytes bigint;