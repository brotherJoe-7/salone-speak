-- Create messages table for WhatsApp integration
create table if not exists messages (
  id bigint primary key generated always as identity,
  sender text not null,
  body text not null,
  received_at timestamp default now()
);

-- Enable Row Level Security
alter table messages enable row level security;

-- Drop existing policies if they exist
drop policy if exists "public_can_read_messages" on messages;
drop policy if exists "service_can_insert_messages" on messages;

-- Create RLS policy - anyone can read messages
create policy "public_can_read_messages" on messages for select to public using (true);

-- Create RLS policy - service role and authenticated users can insert
create policy "service_can_insert_messages" on messages for insert with check (true);

-- Create index on received_at for sorting
create index if not exists messages_received_at_idx on messages(received_at desc);

-- Grant permissions
grant select on messages to anon;
grant select on messages to authenticated;
grant select,insert on messages to service_role;
