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

CREATE TRIGGER trg_posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

CREATE TRIGGER trg_boards_updated_at
BEFORE UPDATE ON boards
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();
