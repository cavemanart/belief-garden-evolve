-- Create storage buckets for media uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('audio', 'audio', true);

-- Create policies for image uploads
CREATE POLICY "Images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'images');

CREATE POLICY "Users can upload images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policies for video uploads
CREATE POLICY "Videos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'videos');

CREATE POLICY "Users can upload videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'videos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own videos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own videos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policies for audio uploads
CREATE POLICY "Audio files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'audio');

CREATE POLICY "Users can upload audio" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'audio' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own audio" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own audio" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'audio' AND auth.uid()::text = (storage.foldername(name))[1]);