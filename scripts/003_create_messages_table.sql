-- Create messages table for WhatsApp integration
create table messages (
  id bigint primary key generated always as identity,
  sender text not null,
  body text not null,
  received_at timestamp default now()
);

-- Enable Row Level Security
alter table messages enable row level security;

-- Create RLS policy - anyone can read messages
create policy "public_can_read_messages" on messages for select to anon using (true);

-- Create RLS policy - service role can insert
create policy "service_can_insert_messages" on messages for insert to service_role with check (true);

-- Create index on received_at for sorting
create index messages_received_at_idx on messages(received_at desc);
