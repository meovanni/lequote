# Le Quote in produzione: back end Medusa (con il back office in /app) e i sorgenti della vetrina,
# che il server rigenera quando i titolari premono "Pubblica" (ADR 0006). Contesto: radice del repo.
FROM node:22-bookworm-slim

ENV MEDUSA_DISABLE_TELEMETRY=true
RUN apt-get update \
  && apt-get install -y --no-install-recommends rsync \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY server/package.json server/package-lock.json server/
RUN cd server && npm ci --include=dev --no-audit --no-fund
COPY client/package.json client/package-lock.json client/
RUN cd client && npm ci --include=dev --no-audit --no-fund

COPY server server
COPY client client
# medusa-config pretende queste variabili anche per compilare: qui bastano valori finti, quelle
# vere arrivano dal .env all'avvio.
RUN cd server \
  && DATABASE_URL=postgres://build:build@localhost:5432/build STORE_CORS=x ADMIN_CORS=x AUTH_CORS=x \
     JWT_SECRET=build COOKIE_SECRET=build npx medusa build \
  && cd .medusa/server && npm install --omit=dev --no-audit --no-fund

COPY deploy/lequote/entrypoint.sh /usr/local/bin/entrypoint
COPY deploy/lequote/build-site.sh /usr/local/bin/build-site
RUN chmod +x /usr/local/bin/entrypoint /usr/local/bin/build-site

ENV NODE_ENV=production
WORKDIR /app/server/.medusa/server
EXPOSE 9000
ENTRYPOINT ["entrypoint"]
