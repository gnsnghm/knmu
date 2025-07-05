# --------- build stage ---------
FROM node:current-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev
COPY . .

FROM deps AS builder
ARG NEXT_PUBLIC_LOGO_IMAGE_URL
ENV NEXT_PUBLIC_LOGO_IMAGE_URL=${NEXT_PUBLIC_LOGO_IMAGE_URL}
ARG NEXT_PUBLIC_CLOUDFRONT_DOMAIN
ENV NEXT_PUBLIC_CLOUDFRONT_DOMAIN=${NEXT_PUBLIC_CLOUDFRONT_DOMAIN}
RUN npm run build

# --------- production runner ---------
FROM node:current-alpine AS runner
WORKDIR /app

RUN mkdir -p /app/public

COPY --from=builder /app/.next/standalone/ ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]