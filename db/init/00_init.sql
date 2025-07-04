-- db/init/00_init.sql
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS groups (
  id          SERIAL PRIMARY KEY,
  name        TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id         SERIAL PRIMARY KEY,
  barcode    TEXT UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  image_url  TEXT,
  image_path TEXT,
  brand      TEXT,
  group_key  TEXT,
  group_id   INT REFERENCES groups(id),   -- ← 紐づけ
  meta_json  JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shelves (
  id    SERIAL PRIMARY KEY,
  label TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE stock (
    id              SERIAL PRIMARY KEY,
    product_id      INTEGER NOT NULL,
    shelf_id        INTEGER NOT NULL,
    add_quantity    INTEGER NOT NULL DEFAULT 0,
    total_quantity  INTEGER NOT NULL DEFAULT 0
                     CHECK (total_quantity >= 0),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE (product_id, shelf_id)
);

CREATE INDEX idx_stock_product_shelf
    ON stock (product_id, shelf_id);

CREATE TABLE stock_history (
    id              SERIAL PRIMARY KEY,
    product_id      INTEGER NOT NULL,
    shelf_id        INTEGER NOT NULL,
    add_quantity    INTEGER NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT now()
);


-- インデックス
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_group   ON products(group_id);

-- updated_at を自動更新するための共通関数
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルにトリガーを設定
CREATE OR REPLACE TRIGGER set_timestamp
BEFORE UPDATE ON groups
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE OR REPLACE TRIGGER set_timestamp
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE OR REPLACE TRIGGER set_timestamp
BEFORE UPDATE ON shelves
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();