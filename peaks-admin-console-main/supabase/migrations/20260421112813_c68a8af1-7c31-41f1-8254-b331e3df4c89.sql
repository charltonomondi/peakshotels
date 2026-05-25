INSERT INTO storage.buckets (id, name, public) VALUES ('rooms','rooms', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "rooms images public read" ON storage.objects FOR SELECT USING (bucket_id = 'rooms');
CREATE POLICY "rooms images staff insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'rooms' AND public.is_staff(auth.uid()));
CREATE POLICY "rooms images staff update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'rooms' AND public.is_staff(auth.uid()));
CREATE POLICY "rooms images staff delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'rooms' AND public.is_staff(auth.uid()));