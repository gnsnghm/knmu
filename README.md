# Household Consumables Manager

This repo contains an iOS client and a Node.js backend that track household consumable stock by scanning JAN barcodes. The system runs locally via Docker Desktop (Hyper‑V) and is deployed through a Cloudflare Tunnel.

## Quick start (local)

```bash
git clone https://github.com/yourname/consumables.git
cd consumables
cp backend/.env.sample backend/.env
# edit environment variables

# build & start all services
docker compose up -d --build
```
