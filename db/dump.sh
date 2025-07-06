#!/bin/bash

set -euo pipefail

# --- 設定項目 ---
# 環境変数から読み込むか、直接値を設定してください
DB_HOST="${PGHOST:-localhost}"
DB_PORT="${PGPORT:-5432}"
DB_USER="${PGUSER:-postgres}"
DB_NAME="${PGDATABASE:-household}"
# PGPASSWORD環境変数 or ~/.pgpass の使用を推奨 (後述)

DUMP_DIR="."
DUMP_FILENAME="dump-$(date +%Y%m%d_%H%M%S).dump"
DUMP_FILE_PATH="${DUMP_DIR}/${DUMP_FILENAME}"
# ---

echo "データベース '${DB_NAME}' のダンプを開始します..."

# pg_dump実行
# -Fc: カスタムフォーマットでダンプ (圧縮され、柔軟なリストアが可能)
pg_dump \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --username="${DB_USER}" \
  --format=c \
  --file="${DUMP_FILE_PATH}" \
  "${DB_NAME}"

echo "--------------------------------------------------"
echo "ダンプが完了しました: ${DUMP_FILE_PATH}"
echo "--------------------------------------------------"
