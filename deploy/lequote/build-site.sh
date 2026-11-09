#!/bin/sh
# Rigenera le pagine statiche della vetrina e le mette dove Caddy le serve. Lo lancia "Pubblica"
# (STOREFRONT_BUILD_COMMAND) e il rilascio di una nuova versione (deploy.sh).
set -e
cd /app/client
# Il build della vetrina gira in modalità produzione con le variabili VITE_* del container.
NODE_ENV=production npx react-router build
rsync -a --delete build/client/ /data/www/
if [ -f src/data/published/published.generated.json ]; then
  cp src/data/published/published.generated.json /data/published/published.generated.json
else
  rm -f /data/published/published.generated.json
fi
echo "Vetrina rigenerata."
