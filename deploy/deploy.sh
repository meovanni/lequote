#!/usr/bin/env bash
# Rilascio sul VPS dal PC (Git Bash): copia i file del repo (quelli sotto git e quelli nuovi non
# ignorati), aggiorna il proxy, ricostruisce Le Quote e rigenera la vetrina.
#   bash deploy/deploy.sh
set -euo pipefail

HOST="${VPS_HOST:-root@80.211.141.123}"
KEY="${VPS_KEY:-$HOME/.ssh/vps-siti}"
cd "$(dirname "$0")/.."

echo "Copio i file sul VPS..."
git ls-files -co --exclude-standard -z \
  | tar --null --ignore-failed-read -czf - -T - \
  | ssh -i "$KEY" "$HOST" 'set -e
      rm -rf /srv/lequote/app.new && mkdir -p /srv/lequote/app.new /srv/lequote/data /srv/www/le-quote
      tar -xzf - -C /srv/lequote/app.new
      if [ -f /srv/lequote/app/deploy/lequote/.env ]; then cp -p /srv/lequote/app/deploy/lequote/.env /srv/lequote/app.new/deploy/lequote/.env; fi
      rm -rf /srv/lequote/app.old; [ -d /srv/lequote/app ] && mv /srv/lequote/app /srv/lequote/app.old
      mv /srv/lequote/app.new /srv/lequote/app'

ssh -i "$KEY" "$HOST" 'set -e
  ENV=/srv/lequote/app/deploy/lequote/.env
  if [ ! -f "$ENV" ]; then
    cp /srv/lequote/app/deploy/lequote/env.production.template "$ENV"
    for name in DB_PASSWORD JWT_SECRET COOKIE_SECRET; do
      sed -i "s|^$name=__GENERA__|$name=$(openssl rand -hex 32)|" "$ENV"
    done
    chmod 600 "$ENV"
    echo "Creato $ENV: completa SMTP_PASS e ORDER_ALERT_EMAIL."
  fi

  mkdir -p /srv/proxy/sites
  cp /srv/lequote/app/deploy/proxy/compose.yml /srv/lequote/app/deploy/proxy/Caddyfile /srv/proxy/
  cp /srv/lequote/app/deploy/proxy/sites/le-quote.caddy /srv/proxy/sites/
  docker network inspect web >/dev/null 2>&1 || docker network create web >/dev/null

  cd /srv/lequote/app/deploy/lequote
  docker compose up -d --build
  echo "Attendo il back end..."
  for i in $(seq 1 60); do
    docker compose exec -T medusa node -e "fetch(\"http://localhost:9000/health\").then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" && break
    sleep 5
  done
  docker compose exec -T medusa build-site

  cd /srv/proxy && docker compose up -d && docker compose exec -T caddy caddy reload --config /etc/caddy/Caddyfile
  docker image prune -f >/dev/null
  echo "Rilascio completato."'
