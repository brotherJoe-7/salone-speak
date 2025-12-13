-- Add sentiment analysis and email field to feedback table
alter table public.feedback add column if not exists email text;
alter table public.feedback add column if not exists sentiment text default 'neutral' check (sentiment in ('positive', 'negative', 'neutral'));

-- Add index for faster queries
create index if not exists feedback_sentiment_idx on public.feedback(sentiment);
create index if not exists feedback_email_idx on public.feedback(email);
