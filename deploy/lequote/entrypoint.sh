#!/bin/sh
# Avvio del back end: rimette nella vetrina le modifiche già pubblicate (sopravvivono ai rilasci in
# /data/published), aggiorna il database e parte.
set -e
mkdir -p /data/www /data/published /data/contenuti /data/filiera
if [ -f /data/published/published.generated.json ]; then
  cp /data/published/published.generated.json /app/client/src/data/published/published.generated.json
fi
npx medusa db:migrate
exec npx medusa start
