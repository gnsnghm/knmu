# ---------- Stage 1 : install dependencies ----------
FROM node:current-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

# ---------- Stage 2 : runtime ----------
FROM node:current-alpine AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node","src/server.js"]