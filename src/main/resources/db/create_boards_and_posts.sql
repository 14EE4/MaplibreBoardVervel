-- boards 테이블: 격자 좌표와 중심 좌표, 메타 정보 포함
CREATE TABLE IF NOT EXISTS boards (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  grid_x INT NOT NULL,
  grid_y INT NOT NULL,
  center_lng DECIMAL(10,7) NOT NULL,
  center_lat DECIMAL(10,7) NOT NULL,
  meta JSON DEFAULT NULL,
  posts_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_boards_grid (grid_x, grid_y)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 통합 posts 테이블: 각 게시글은 board_id로 참조
CREATE TABLE IF NOT EXISTS posts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  board_id BIGINT NOT NULL,
  author VARCHAR(100) DEFAULT NULL,
  content TEXT NOT NULL,
  password VARCHAR(128) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_board_created (board_id, created_at),
  CONSTRAINT fk_posts_board FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 예시: 격자별로 따로 테이블을 두는 방식의 샘플 테이블 (선택적)
-- 샘플: 격자별 전용 테이블(코드에서 생성되는 스키마와 동일하게 구성)
CREATE TABLE IF NOT EXISTS posts_grid_0_0 (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  board_id BIGINT,
  author VARCHAR(255),
  content TEXT,
  password VARCHAR(128),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_board_created (board_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 예시 데이터 삽입
INSERT INTO boards (name, grid_x, grid_y, center_lng, center_lat, meta)
VALUES ('Grid 0,0', 0, 0, 127.0000000, 37.5000000, JSON_OBJECT('table','posts_grid_0_0'));

INSERT INTO posts (board_id, author, content)
VALUES (LAST_INSERT_ID(), 'system', '통합 posts 테이블에 저장된 예시 글');

INSERT INTO posts_grid_0_0 (lng, lat, content)
VALUES (127.0012345, 37.5012345, '격자 전용 테이블에 저장된 예시 글');

-- 마이그레이션: 기존 데이터베이스에 변경 사항을 적용하는 예시 SQL
-- 1) 통합 posts 테이블에 password 컬럼이 없다면 추가
-- ALTER TABLE posts ADD COLUMN password VARCHAR(128) DEFAULT NULL;

-- 2) 기존에 생성된 posts_grid_* 테이블에 password 컬럼이 없다면 다음과 같이 추가
-- (모든 posts_grid_* 테이블에 대해 실행할 수 있는 예시:)
-- SELECT CONCAT('ALTER TABLE `', TABLE_NAME, '` ADD COLUMN password VARCHAR(128) DEFAULT NULL;')
-- FROM information_schema.TABLES
-- WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME LIKE 'posts_grid_%';

-- 복사/붙여넣기 후 실행 예시:
-- ALTER TABLE `posts_grid_0_0` ADD COLUMN password VARCHAR(128) DEFAULT NULL;

-- 참고: 코드에서 posts_grid 테이블은 아래와 같은 스키마로 생성됩니다.
-- CREATE TABLE IF NOT EXISTS `posts_grid_{x}_{y}` (
--   id BIGINT PRIMARY KEY AUTO_INCREMENT,
--   board_id BIGINT,
--   author VARCHAR(255),
--   content TEXT,
--   password VARCHAR(128),
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 활동량 집계 예시 (hour_bucket, cnt 반환)
-- 파라미터: ? = board_id, ? = hours 범위 (예: 24)
SELECT DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00') AS hour_bucket,
       COUNT(*) AS cnt
FROM posts
WHERE board_id = ? AND created_at >= NOW() - INTERVAL ? HOUR
GROUP BY hour_bucket
ORDER BY hour_bucket;