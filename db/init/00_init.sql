-- db/init/00_init.sql
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS groups (
  id          SERIAL PRIMARY KEY,
  name        TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id         SERIAL PRIMARY KEY,
  barcode    TEXT UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  image_url  TEXT,
  brand      TEXT,
  group_key  TEXT,
  group_id   INT REFERENCES groups(id),   -- ← 紐づけ
  meta_json  JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shelves (
  id    SERIAL PRIMARY KEY,
  label TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS stock (
  id         SERIAL PRIMARY KEY,
  user_id    INT REFERENCES users(id)    ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  shelf_id   INT REFERENCES shelves(id),
  quantity   INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id, shelf_id)
);

CREATE TABLE IF NOT EXISTS stock_history (
  id          BIGSERIAL PRIMARY KEY,
  stock_id    INT REFERENCES stock(id) ON DELETE CASCADE,
  delta       INT,
  after_qty   INT,
  changed_at  TIMESTAMPTZ DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_group   ON products(group_id);