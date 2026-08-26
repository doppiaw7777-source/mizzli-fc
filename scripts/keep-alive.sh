#!/usr/bin/env bash
# Keeps Next.js and a public HTTPS tunnel alive.
# Health-checks the public URL (DNS + HTTP 200 + app HTML), not just PIDs.
# Cloudflare quick tunnels often stay running after the hostname dies.
# Never pkill -f: that has killed Next.js before. Kill only PIDs we own.
set -u

ROOT=/agent
LOG=/tmp/noldi-keepalive.log
URL_FILE=/tmp/noldi-public-url.txt
BACKUP_URL_FILE=/tmp/noldi-backup-url.txt
CF_BIN=/tmp/cloudflared
CF_PID_FILE=/tmp/noldi-cf.pid
CF_LOG=/tmp/noldi-cf.log
CF_URL_FILE=/tmp/noldi-cf-url.txt
CF_FAIL_FILE=/tmp/noldi-cf.fails
LHR_PID_FILE=/tmp/noldi-lhr.pid
LHR_LOG=/tmp/noldi-lhr.log
LHR_URL_FILE=/tmp/noldi-lhr-url.txt
LHR_FAIL_FILE=/tmp/noldi-lhr.fails
FAIL_LIMIT=3
NAMED_PID_FILE=/tmp/noldi-named.pid
NAMED_LOG=/tmp/noldi-named.log
NEXT_PID_FILE=/tmp/noldi-next.pid
ENV_FILE="$ROOT/.env.local"
UA='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'

log() { echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) $*" >> "$LOG"; }

load_env() {
  if [ -f "$ENV_FILE" ]; then
    set -a
    # shellcheck disable=SC1090
    . "$ENV_FILE"
    set +a
  fi
}

kill_pid() {
  local pid="${1:-}"
  [ -n "$pid" ] || return 0
  if kill -0 "$pid" 2>/dev/null; then
    kill "$pid" 2>/dev/null || true
    sleep 1
    if kill -0 "$pid" 2>/dev/null; then
      kill -9 "$pid" 2>/dev/null || true
    fi
  fi
}

kill_pidfile() {
  local f="$1"
  [ -f "$f" ] || return 0
  local pid
  pid=$(tr -d ' \n' < "$f" 2>/dev/null || true)
  kill_pid "$pid"
  rm -f "$f"
}

pid_alive() {
  local pid="${1:-}"
  [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null
}

url_ok() {
  local url="${1:-}"
  [ -n "$url" ] || return 1
  local attempt tmp code
  for attempt in 1 2; do
    tmp=$(mktemp)
    code=$(curl -sS -o "$tmp" -w '%{http_code}' --max-time 12 -A "$UA" "$url/" 2>/dev/null || echo 000)
    if [ "$code" = "200" ] && grep -q 'lang="it"' "$tmp"; then
      rm -f "$tmp"
      return 0
    fi
    rm -f "$tmp"
    sleep 1
  done
  return 1
}

fail_count() {
  local f="$1"
  local n
  n=$(tr -d ' \n' < "$f" 2>/dev/null || echo 0)
  case "$n" in
    ''|*[!0-9]*) echo 0 ;;
    *) echo "$n" ;;
  esac
}

mark_ok() {
  echo 0 > "$1"
}

mark_fail() {
  local f="$1"
  local n
  n=$(fail_count "$f")
  echo $((n + 1)) > "$f"
}

write_urls() {
  local primary="${1:-}"
  local backup="${2:-}"
  if [ -n "$primary" ]; then
    printf '%s\n' "$primary" > "$URL_FILE"
  fi
  if [ -n "$backup" ]; then
    printf '%s\n' "$backup" > "$BACKUP_URL_FILE"
  else
    rm -f "$BACKUP_URL_FILE"
  fi
}

pick_published_urls() {
  local named="" cf="" lhr=""
  named="${PUBLIC_TUNNEL_URL:-}"
  cf=$(tr -d ' \n' < "$CF_URL_FILE" 2>/dev/null || true)
  lhr=$(tr -d ' \n' < "$LHR_URL_FILE" 2>/dev/null || true)

  if [ -n "$named" ] && url_ok "$named"; then
    write_urls "$named" "${lhr:-$cf}"
    return 0
  fi
  # Cloudflare hostname stays the same while the process lives.
  # localhost.run prints "no tunnel here" and changes URL on every SSH drop.
  if [ -n "$cf" ] && url_ok "$cf"; then
    write_urls "$cf" "$lhr"
    return 0
  fi
  if [ -n "$lhr" ] && url_ok "$lhr"; then
    write_urls "$lhr" "$cf"
    return 0
  fi
  return 1
}

start_next() {
  if curl -sf --max-time 3 http://127.0.0.1:3000/ >/dev/null; then
    return 0
  fi
  log "restart next"
  if [ -f "$NEXT_PID_FILE" ]; then
    kill_pidfile "$NEXT_PID_FILE"
  fi
  cd "$ROOT" || return 1
  nohup npx next dev --hostname 0.0.0.0 --port 3000 >/tmp/noldi-next.log 2>&1 &
  echo $! > "$NEXT_PID_FILE"
  local i
  for i in $(seq 1 30); do
    sleep 1
    if curl -sf --max-time 3 http://127.0.0.1:3000/ >/dev/null; then
      return 0
    fi
  done
  log "next still down"
  return 1
}

wait_for_url() {
  local logf="$1"
  local regex="$2"
  local i url
  for i in $(seq 1 25); do
    url=$(grep -oE "$regex" "$logf" 2>/dev/null | tail -1 || true)
    if [ -n "$url" ]; then
      printf '%s' "$url"
      return 0
    fi
    sleep 1
  done
  return 1
}

adopt_cloudflared() {
  local pid url
  pid=$(pgrep -n -f '^/tmp/cloudflared tunnel --url' || true)
  if ! pid_alive "$pid"; then
    return 1
  fi
  url=$(tr -d ' \n' < "$CF_URL_FILE" 2>/dev/null || true)
  if [ -z "$url" ]; then
    url=$(tr -d ' \n' < "$URL_FILE" 2>/dev/null || true)
  fi
  if [ -n "$url" ] && url_ok "$url"; then
    echo "$pid" > "$CF_PID_FILE"
    echo "$url" > "$CF_URL_FILE"
    log "adopted cloudflared pid=$pid url=$url"
    return 0
  fi
  return 1
}

start_named_cloudflare() {
  if [ -z "${CLOUDFLARE_TUNNEL_TOKEN:-}" ]; then
    return 1
  fi
  local pid
  pid=$(tr -d ' \n' < "$NAMED_PID_FILE" 2>/dev/null || true)
  if pid_alive "$pid"; then
    if [ -n "${PUBLIC_TUNNEL_URL:-}" ] && url_ok "$PUBLIC_TUNNEL_URL"; then
      return 0
    fi
    # Token tunnels keep a stable hostname; process up is enough if URL unknown.
    if [ -z "${PUBLIC_TUNNEL_URL:-}" ]; then
      return 0
    fi
  fi
  log "start named cloudflare tunnel"
  kill_pidfile "$NAMED_PID_FILE"
  : > "$NAMED_LOG"
  nohup "$CF_BIN" tunnel --no-autoupdate run --token "$CLOUDFLARE_TUNNEL_TOKEN" \
    >"$NAMED_LOG" 2>&1 &
  echo $! > "$NAMED_PID_FILE"
  sleep 3
  pid=$(tr -d ' \n' < "$NAMED_PID_FILE")
  if pid_alive "$pid"; then
    log "named cloudflare pid=$pid"
    return 0
  fi
  log "named cloudflare failed to start"
  return 1
}

start_cf_quick() {
  local pid url fails
  pid=$(tr -d ' \n' < "$CF_PID_FILE" 2>/dev/null || true)
  url=$(tr -d ' \n' < "$CF_URL_FILE" 2>/dev/null || true)
  if pid_alive "$pid" && url_ok "$url"; then
    mark_ok "$CF_FAIL_FILE"
    return 0
  fi
  if adopt_cloudflared; then
    mark_ok "$CF_FAIL_FILE"
    return 0
  fi
  if pid_alive "$pid"; then
    mark_fail "$CF_FAIL_FILE"
    fails=$(fail_count "$CF_FAIL_FILE")
    log "cloudflared url unhealthy ($fails/$FAIL_LIMIT) url=${url:-none}"
    if [ "$fails" -lt "$FAIL_LIMIT" ]; then
      return 0
    fi
  fi
  log "restart cloudflared quick tunnel (pid=${pid:-none} url=${url:-none})"
  kill_pidfile "$CF_PID_FILE"
  : > "$CF_LOG"
  nohup "$CF_BIN" tunnel --url http://127.0.0.1:3000 \
    --edge-ip-version 4 --protocol http2 --ha-connections 4 --no-autoupdate \
    >"$CF_LOG" 2>&1 &
  echo $! > "$CF_PID_FILE"
  url=$(wait_for_url "$CF_LOG" 'https://[a-z0-9-]+\.trycloudflare\.com' || true)
  if [ -n "$url" ] && url_ok "$url"; then
    echo "$url" > "$CF_URL_FILE"
    mark_ok "$CF_FAIL_FILE"
    log "cloudflared ready $url"
    return 0
  fi
  log "cloudflared started but public url failed url=${url:-none}"
  return 1
}

adopt_lhr() {
  local pid url
  pid=$(pgrep -n -f 'nokey@localhost.run' || true)
  if ! pid_alive "$pid"; then
    return 1
  fi
  url=$(tr -d ' \n' < "$LHR_URL_FILE" 2>/dev/null || true)
  if [ -z "$url" ]; then
    url=$(grep -oE 'https://[a-z0-9]+\.lhr\.life' /tmp/lhr.log "$LHR_LOG" 2>/dev/null | tail -1 || true)
  fi
  if [ -n "$url" ] && url_ok "$url"; then
    echo "$pid" > "$LHR_PID_FILE"
    echo "$url" > "$LHR_URL_FILE"
    log "adopted localhost.run pid=$pid url=$url"
    return 0
  fi
  return 1
}

start_lhr() {
  local pid url fails
  pid=$(tr -d ' \n' < "$LHR_PID_FILE" 2>/dev/null || true)
  url=$(tr -d ' \n' < "$LHR_URL_FILE" 2>/dev/null || true)
  if pid_alive "$pid" && url_ok "$url"; then
    mark_ok "$LHR_FAIL_FILE"
    return 0
  fi
  if adopt_lhr; then
    mark_ok "$LHR_FAIL_FILE"
    return 0
  fi
  if pid_alive "$pid"; then
    mark_fail "$LHR_FAIL_FILE"
    fails=$(fail_count "$LHR_FAIL_FILE")
    log "localhost.run url unhealthy ($fails/$FAIL_LIMIT) url=${url:-none}"
    if [ "$fails" -lt "$FAIL_LIMIT" ]; then
      return 0
    fi
  fi
  log "restart localhost.run (pid=${pid:-none} url=${url:-none})"
  kill_pidfile "$LHR_PID_FILE"
  : > "$LHR_LOG"
  nohup ssh \
    -o StrictHostKeyChecking=accept-new \
    -o UserKnownHostsFile=/home/ubuntu/.ssh/known_hosts \
    -o ServerAliveInterval=15 \
    -o ServerAliveCountMax=4 \
    -o ExitOnForwardFailure=yes \
    -R 80:127.0.0.1:3000 \
    nokey@localhost.run \
    >"$LHR_LOG" 2>&1 &
  echo $! > "$LHR_PID_FILE"
  url=$(wait_for_url "$LHR_LOG" 'https://[a-z0-9]+\.lhr\.life' || true)
  if [ -n "$url" ] && url_ok "$url"; then
    echo "$url" > "$LHR_URL_FILE"
    mark_ok "$LHR_FAIL_FILE"
    log "localhost.run ready $url"
    return 0
  fi
  log "localhost.run started but public url failed url=${url:-none}"
  return 1
}

seed_known_urls() {
  # Last known working Cloudflare quick URL for this pod, if still live.
  local cf_guess=https://dans-schools-earthquake-landscape.trycloudflare.com
  if [ ! -s "$CF_URL_FILE" ] && url_ok "$cf_guess"; then
    echo "$cf_guess" > "$CF_URL_FILE"
  fi
}

log "keepalive start"
load_env
seed_known_urls

while true; do
  load_env
  start_next || true
  if [ -n "${CLOUDFLARE_TUNNEL_TOKEN:-}" ]; then
    start_named_cloudflare || true
  else
    start_cf_quick || true
    cf=$(tr -d ' \n' < "$CF_URL_FILE" 2>/dev/null || true)
    if ! url_ok "$cf"; then
      start_lhr || true
    fi
  fi
  pick_published_urls || log "no healthy public url"
  sleep 15
done
