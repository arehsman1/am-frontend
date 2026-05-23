
DROP POLICY IF EXISTS "Profile images are publicly accessible" ON storage.objects;

CREATE POLICY "Profile images listing for authenticated users"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'profile-images');
