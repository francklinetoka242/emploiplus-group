-- Allow authenticated users to manage candidate documents in the candidate documents bucket
create policy if not exists "Authenticated users can read candidate documents"
on storage.objects
for select
to authenticated
using (bucket_id = 'candidat-doc');

create policy if not exists "Authenticated users can upload candidate documents"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'candidat-doc');

create policy if not exists "Authenticated users can update candidate documents"
on storage.objects
for update
to authenticated
using (bucket_id = 'candidat-doc')
with check (bucket_id = 'candidat-doc');

create policy if not exists "Authenticated users can delete candidate documents"
on storage.objects
for delete
to authenticated
using (bucket_id = 'candidat-doc');
