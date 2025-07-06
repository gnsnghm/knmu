#!/bin/bash

set -euo pipefail

# --- 設定項目 ---
DB_HOST="${PGHOST:-localhost}"
DB_PORT="${PGPORT:-5432}"
DB_USER="${PGUSER:-postgres}"
DB_NAME="${PGDATABASE:-household}"
# PGPASSWORD環境変数 or ~/.pgpass の使用を推奨 (後述)
# ---

DUMP_FILE=$1

if [ -z "${DUMP_FILE}" ]; then
  echo "エラー: リストアするダンプファイル(*.dump)を引数で指定してください。" >&2
  echo "使用法: $0 <path/to/dump-file.dump>" >&2
  exit 1
fi

if [ ! -f "${DUMP_FILE}" ]; then
  echo "エラー: ファイルが見つかりません: ${DUMP_FILE}" >&2
  exit 1
fi

echo "リストア先のデータベース '${DB_NAME}' が存在することを確認してください。"
echo "リストアを開始しますか？ (y/N)"
read -r answer
if [[ ! "$answer" =~ ^[yY]$ ]]; then
    echo "リストアを中止しました。"
    exit 0
fi

echo "ダンプファイル '${DUMP_FILE}' をデータベース '${DB_NAME}' にリストアします..."
# -c, --clean: リストア前にデータベースオブジェクトを削除
# -j, --jobs: 並列実行数 (CPUコア数などに合わせると高速化)
pg_restore --host="${DB_HOST}" --port="${DB_PORT}" --username="${DB_USER}" --dbname="${DB_NAME}" --clean --jobs=4 "${DUMP_FILE}"

echo "------------------------"
echo "リストアが完了しました。"
echo "------------------------"
