create table if not exists comments (
  id bigserial primary key,
  external_comment_id text not null unique,
  external_post_id text not null,
  text text not null,
  commented_at timestamptz not null,
  parent_external_id text,
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists comments_post_idx on comments (external_post_id);