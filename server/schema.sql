create table if not exists auth_users (
  id text primary key,
  email text not null unique,
  name text not null,
  role text not null check (role in ('owner', 'admin', 'user')),
  status text not null check (status in ('active', 'disabled')),
  password_hash text not null,
  password_salt text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists auth_sessions (
  id text primary key,
  user_id text not null references auth_users(id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists auth_sessions_user_id_idx on auth_sessions(user_id);
create index if not exists auth_sessions_expires_at_idx on auth_sessions(expires_at);

create table if not exists user_watched_sources (
  user_id text not null references auth_users(id) on delete cascade,
  source_id text not null,
  source_title text not null,
  watched_at timestamptz not null default now(),
  primary key (user_id, source_id)
);

create index if not exists user_watched_sources_user_id_idx on user_watched_sources(user_id);

create table if not exists content_meta (
  id text primary key,
  site_version integer not null default 1,
  updated_at timestamptz not null default now()
);

create table if not exists content_entries (
  key text primary key,
  type text not null,
  status text not null check (status in ('draft', 'published')),
  draft jsonb not null,
  published jsonb not null,
  version integer not null default 1,
  updated_at timestamptz not null default now(),
  published_at timestamptz not null default now()
);

create index if not exists content_entries_type_idx on content_entries(type);
create index if not exists content_entries_status_idx on content_entries(status);

create table if not exists content_events (
  id text primary key,
  type text not null,
  keys text[] not null default '{}',
  version integer not null,
  message text not null default '',
  actor_id text,
  actor_name text,
  actor_role text check (actor_role is null or actor_role in ('owner', 'admin', 'user')),
  created_at timestamptz not null default now()
);

create index if not exists content_events_created_at_idx on content_events(created_at desc);

create table if not exists posts (
  id text primary key,
  author_id text references auth_users(id) on delete set null,
  title text not null,
  slug text not null unique,
  summary text,
  content text not null default '',
  cover_url text,
  status text not null check (status in ('draft', 'pending', 'published', 'hidden', 'rejected', 'archived')) default 'draft',
  visibility text not null check (visibility in ('public', 'private', 'unlisted')) default 'public',
  tags text[] not null default '{}',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_author_id_idx on posts(author_id);
create index if not exists posts_status_idx on posts(status);
create index if not exists posts_published_at_idx on posts(published_at desc);

create table if not exists post_revisions (
  id text primary key,
  post_id text not null references posts(id) on delete cascade,
  editor_id text references auth_users(id) on delete set null,
  title text not null,
  summary text,
  content text not null,
  cover_url text,
  tags text[] not null default '{}',
  status text not null,
  created_at timestamptz not null default now()
);

create index if not exists post_revisions_post_id_idx on post_revisions(post_id);

create table if not exists post_comments (
  id text primary key,
  post_id text not null references posts(id) on delete cascade,
  author_id text references auth_users(id) on delete set null,
  author_name text not null,
  content text not null,
  status text not null check (status in ('published', 'hidden', 'deleted')) default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists post_comments_post_id_idx on post_comments(post_id, created_at desc);
create index if not exists post_comments_status_idx on post_comments(status);

create table if not exists media_assets (
  id text primary key,
  owner_id text references auth_users(id) on delete set null,
  kind text not null check (kind in ('image', 'video', 'audio', 'document', 'other')) default 'image',
  url text not null,
  thumbnail_url text,
  original_name text,
  mime_type text,
  file_size bigint,
  width integer,
  height integer,
  hash text,
  status text not null check (status in ('draft', 'pending', 'published', 'hidden', 'deleted')) default 'published',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists media_assets_owner_id_idx on media_assets(owner_id);
create index if not exists media_assets_status_idx on media_assets(status);

create table if not exists artwork_items (
  id text primary key,
  media_id text references media_assets(id) on delete set null,
  author_id text references auth_users(id) on delete set null,
  title text not null,
  description text not null default '',
  image_url text not null,
  thumbnail_url text,
  tags text[] not null default '{}',
  series_name text,
  series_index integer,
  item_index integer,
  import_batch_id text,
  import_year integer,
  import_week integer,
  import_date date,
  status text not null check (status in ('draft', 'pending', 'published', 'hidden', 'rejected', 'archived')) default 'pending',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists artwork_items_status_idx on artwork_items(status);
create index if not exists artwork_items_import_batch_id_idx on artwork_items(import_batch_id);
create index if not exists artwork_items_series_idx on artwork_items(series_name, series_index);

create table if not exists content_submissions (
  id text primary key,
  submitter_id text references auth_users(id) on delete set null,
  kind text not null check (kind in ('post', 'artwork', 'screening_source', 'feedback', 'other')),
  target_id text,
  title text not null default '',
  payload jsonb not null default '{}',
  contact text,
  status text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
  review_note text,
  reviewed_by text references auth_users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_submissions_kind_idx on content_submissions(kind);
create index if not exists content_submissions_status_idx on content_submissions(status);
create index if not exists content_submissions_submitter_id_idx on content_submissions(submitter_id);

create table if not exists screening_sources (
  id text primary key,
  title text not null,
  original_title text,
  type text not null default 'movie',
  category text not null default 'other',
  year text,
  duration text,
  rating numeric,
  poster_url text,
  description text not null default '',
  tags text[] not null default '{}',
  source_url text,
  source_note text,
  fanshi_review text,
  status text not null check (status in ('available', 'planned', 'watched', 'hidden', 'rejected')) default 'available',
  priority text not null check (priority in ('low', 'normal', 'high')) default 'normal',
  times_watched integer not null default 0,
  last_watched_at timestamptz,
  added_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists screening_sources_status_idx on screening_sources(status);
create index if not exists screening_sources_category_idx on screening_sources(category);

create table if not exists screening_weeks (
  id text primary key,
  date date not null,
  starts_at timestamptz,
  title text not null,
  theme text,
  status text not null check (status in ('planned', 'preview', 'live', 'ended', 'cancelled', 'rest')),
  status_text text not null default '',
  movies jsonb not null default '[]',
  notes text,
  viewer_count integer,
  discussion_count integer,
  record_url text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists screening_weeks_date_idx on screening_weeks(date desc);
create index if not exists screening_weeks_status_idx on screening_weeks(status);

create table if not exists analytics_hourly (
  hour timestamptz not null,
  path text not null,
  title text not null,
  views integer not null default 0,
  unique_visitors integer not null default 0,
  last_visited_at timestamptz not null default now(),
  primary key (hour, path)
);

create index if not exists analytics_hourly_hour_idx on analytics_hourly(hour desc);
create index if not exists analytics_hourly_path_idx on analytics_hourly(path);

create table if not exists analytics_visitors (
  hour timestamptz not null,
  path text not null,
  visitor_hash text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  primary key (hour, path, visitor_hash)
);

create index if not exists analytics_visitors_hour_idx on analytics_visitors(hour desc);

create table if not exists server_metric_samples (
  id text primary key,
  sampled_at timestamptz not null default now(),
  cpu_percent numeric not null default 0,
  memory_total_bytes bigint not null default 0,
  memory_used_bytes bigint not null default 0,
  memory_percent numeric not null default 0,
  disk_total_bytes bigint not null default 0,
  disk_used_bytes bigint not null default 0,
  disk_percent numeric not null default 0,
  process_memory_bytes bigint not null default 0,
  uptime_seconds numeric not null default 0,
  requests integer not null default 0,
  errors integer not null default 0,
  avg_response_ms numeric not null default 0,
  db_latency_ms numeric,
  status text not null default 'healthy'
);

create index if not exists server_metric_samples_sampled_at_idx on server_metric_samples(sampled_at desc);

create table if not exists server_alerts (
  id text primary key,
  fingerprint text not null unique,
  type text not null,
  severity text not null check (severity in ('info', 'warning', 'critical')),
  title text not null,
  message text not null,
  status text not null check (status in ('open', 'ack', 'resolved')) default 'open',
  metric_value numeric,
  threshold numeric,
  opened_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  acknowledged_by text references auth_users(id) on delete set null,
  resolved_at timestamptz,
  last_seen_at timestamptz not null default now()
);

create index if not exists server_alerts_status_idx on server_alerts(status);
create index if not exists server_alerts_last_seen_at_idx on server_alerts(last_seen_at desc);
