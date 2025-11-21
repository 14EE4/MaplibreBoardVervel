-- migrations/neon_init.sql
-- Cleaned and consolidated DDL for Neon (Postgres) deployment
-- Creates `boards` and unified `posts` tables, optional sample grid table, indexes,
-- and triggers to auto-update `updated_at` timestamps.

BEGIN;

-- BOARDS table
CREATE TABLE IF NOT EXISTS boards (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT,
  grid_x INTEGER,
  grid_y INTEGER,
  center_lng DOUBLE PRECISION,
  center_lat DOUBLE PRECISION,
  meta JSONB,
  posts_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (grid_x, grid_y)
);

CREATE INDEX IF NOT EXISTS idx_boards_grid ON boards (grid_x, grid_y);

-- UNIFIED POSTS table
CREATE TABLE IF NOT EXISTS posts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  board_id BIGINT REFERENCES boards(id) ON DELETE CASCADE,
  author TEXT,
  content TEXT,
  password VARCHAR(128),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_board_created ON posts (board_id, created_at);

-- Updated_at auto-update function and triggers (idempotent)
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Posts trigger
DROP TRIGGER IF EXISTS trg_posts_updated_at ON posts;
CREATE TRIGGER trg_posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

-- Boards trigger
DROP TRIGGER IF EXISTS trg_boards_updated_at ON boards;
CREATE TRIGGER trg_boards_updated_at
BEFORE UPDATE ON boards
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

-- Optional: example grid-specific posts table (used when you partition by grid)
-- This is provided as an example; create grid tables only if your app requires them.
CREATE TABLE IF NOT EXISTS posts_grid_0_0 (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  board_id BIGINT,
  author TEXT,
  content TEXT,
  password VARCHAR(128),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_grid_0_0_board_created ON posts_grid_0_0 (board_id, created_at);

-- Add FK to boards if posts_grid table exists (safe: only adds if boards table present)
ALTER TABLE IF EXISTS posts_grid_0_0
  ADD CONSTRAINT IF NOT EXISTS fk_pgrid_board FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE;

-- Sample seed data (idempotent)
INSERT INTO boards (name, grid_x, grid_y, center_lng, center_lat, meta)
VALUES ('Grid 0,0', 0, 0, 127.0000000, 37.5000000, jsonb_build_object('table','posts_grid_0_0'))
ON CONFLICT (grid_x, grid_y) DO NOTHING;

-- Example post insert (unified posts table) - uncomment to insert sample post
-- INSERT INTO posts (board_id, author, content) VALUES ((SELECT id FROM boards WHERE grid_x=0 AND grid_y=0 LIMIT 1), 'system', '예시 글');

COMMIT;
