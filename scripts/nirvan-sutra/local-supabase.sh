#!/usr/bin/env bash
# Nirvan Sutra v2 with accounts, fully local: a Docker Supabase (127.0.0.1:54321, Studio :54323, test mail :54324), the ns_* tables,
# and `next dev` on port 3100 pointed at it. Production Supabase is never touched (the env below overrides .env.local for this process only).
#   bash scripts/nirvan-sutra/local-supabase.sh            start everything and run the dev server
#   bash scripts/nirvan-sutra/local-supabase.sh guide you@example.com   make an existing local account a guide
#   bash scripts/nirvan-sutra/local-supabase.sh stop       stop the Docker stack
set -euo pipefail
cd "$(dirname "$0")/../.."
WD=.data/supabase-local
SB="npx --yes supabase@2"
DB=supabase_db_nirvan-sutra-local

case "${1:-run}" in
  stop) $SB stop --workdir "$WD"; exit 0 ;;
  guide)
    email="${2:?email}"
    docker exec -i "$DB" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -v email="$email" -q <<'SQL'
insert into public.ns_guides (user_id) select id from auth.users where email = :'email' on conflict do nothing;
select case when exists (select 1 from public.ns_guides g join auth.users u on u.id = g.user_id where u.email = :'email') then 'guide added' else 'no such account (sign up first)' end;
SQL
    exit 0 ;;
esac

if [ ! -f "$WD/supabase/config.toml" ]; then
  mkdir -p "$WD"
  (cd "$WD" && $SB init --workdir . --force >/dev/null)
  sed -i 's/^project_id = .*/project_id = "nirvan-sutra-local"/' "$WD/supabase/config.toml"
fi
docker info >/dev/null 2>&1 || { echo "Docker Desktop is not running"; exit 1; }
$SB start --workdir "$WD" -x realtime,storage-api,imgproxy,edge-runtime,logflare,vector,supavisor,postgres-meta >/dev/null
docker exec -i "$DB" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -q < supabase/nirvan-sutra-v2.sql 2>/dev/null

eval "$($SB status --workdir "$WD" -o env 2>/dev/null | grep -E '^(API_URL|ANON_KEY)=')"
echo "local Supabase: $API_URL · Studio http://127.0.0.1:54323 · test mail http://127.0.0.1:54324"
echo "course: http://localhost:3100/nirvan-sutra/yatra  (sign up at /signup; guide desk at /nirvan-sutra/yatra/guide)"
export NEXT_PUBLIC_SUPABASE_URL="$API_URL" NEXT_PUBLIC_SUPABASE_ANON_KEY="$ANON_KEY" NIRVAN_SUTRA_STORE=supabase
exec npx next dev -p 3100
