# ---------- build ----------
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# SITE_URL is baked into canonicals, og:url and the QR code at build time.
ARG SITE_URL="https://voucher.alpacode.it"
ENV SITE_URL=$SITE_URL
COPY . .
RUN npm run build

# ---------- runtime ----------
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4321

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

# The referral ledger lives here (mount a volume). Owned by the runtime user
# so a fresh named volume inherits the right permissions.
RUN mkdir -p /app/data && chown node:node /app/data

EXPOSE 4321
USER node
CMD ["node", "./dist/server/entry.mjs"]
