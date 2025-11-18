-- boards table: grid coords, center coords, meta, posts_count
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

-- posts table: unified posts referenced by board_id
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
