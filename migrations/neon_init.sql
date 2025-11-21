-- Neon initialization SQL
-- Consolidated schema for `boards` and `posts` (unified), triggers, indexes and sample data

-- boards 테이블
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
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_boards_grid ON boards (grid_x, grid_y);

-- posts 테이블 (단일 테이블 방식)
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

-- updated_at 자동 갱신 함수 및 트리거 (한 번만 생성)
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_posts_updated_at ON posts;
CREATE TRIGGER trg_posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_boards_updated_at ON boards;
CREATE TRIGGER trg_boards_updated_at
BEFORE UPDATE ON boards
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();


-- boards table: grid coords, center coords, meta, posts_count (alternative definition)
CREATE TABLE IF NOT EXISTS boards (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  grid_x INTEGER NOT NULL,
  grid_y INTEGER NOT NULL,
  center_lng NUMERIC(10,7) NOT NULL,
  center_lat NUMERIC(10,7) NOT NULL,
  meta JSONB DEFAULT NULL,
  posts_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (grid_x, grid_y)
);

-- posts table: unified posts referenced by board_id (alternative definition)
CREATE TABLE IF NOT EXISTS posts (
  id BIGSERIAL PRIMARY KEY,
  board_id BIGINT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  author VARCHAR(100) DEFAULT NULL,
  content TEXT NOT NULL,
  password VARCHAR(128) DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_board_created ON posts(board_id, created_at);
-- sample data (optional)
INSERT INTO boards (name, grid_x, grid_y, center_lng, center_lat, meta)
VALUES ('Grid 0,0', 0, 0, 127.0000000, 37.5000000, jsonb_build_object('table','posts_grid_0_0'))
ON CONFLICT DO NOTHING;

-- Example insert into posts (if board exists)
-- INSERT INTO posts (board_id, author, content) VALUES ((SELECT id FROM boards WHERE grid_x=0 AND grid_y=0 LIMIT 1), 'system', '예시 글');
