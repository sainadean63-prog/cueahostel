#!/usr/bin/env bash
set -euo pipefail

cd /root/gaba-hostel-management-system

echo "==> Fetching latest main..."
git fetch origin main
git reset --hard origin/main

echo "==> Rebuilding and restarting containers..."
docker compose up -d --build

echo "==> Deploy complete: $(git rev-parse --short HEAD)"
