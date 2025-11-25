# MaplibreBoardVervel

현재 상태
-
- 프레임워크: Next.js (페이지 + API Routes)
- 배포 대상: Vercel (서버리스)
- DB: PostgreSQL (외부 Neon 권장)
- 포팅된 기능: `board` 페이지, `rasterMap2` 페이지(맵 관련 기능)
- 제거/비활성: 기존 Spring Boot(자바/Gradle) 관련 파일은 레포에서 제거됨

주요 파일/위치
-
- `pages/board.js` — 게시판(보드) UI 및 클라이언트 로직 포팅
- `pages/rasterMap2.js` — MapLibre 기반 레스터맵 클라이언트 포팅
- `pages/api/...` — 서버리스 API 엔드포인트(boards/posts 등)
- `lib/db.js` — Postgres 연결(Pool) 헬퍼(서버리스 환경 재사용 패턴)
- `migrations/postgres_create_tables.sql` — Postgres DDL
- `scripts/migrate.js` — 간단한 마이그레이션 실행기

사전 준비
-
1. Node.js (권장 최신 LTS)
2. Powershell 환경(Windows): `npm.cmd` 사용 권장
3. 외부 PostgreSQL 인스턴스 (예: Neon)

환경 변수
-
- `DATABASE_URL` — PostgreSQL 연결 문자열 (예: `postgresql://user:pass@host:5432/dbname`)

로컬 개발 (PowerShell 예시)
-
1. 저장소 루트에서 의존성 설치

```powershell
npm.cmd install
```

2. 로컬 환경 파일 생성 (예제)

```powershell
"""
DATABASE_URL=postgresql://user:pass@host:5432/dbname
""" > .env.local
```

3. 마이그레이션 실행(데이터베이스가 준비되어 있어야 함)

```powershell
node scripts/migrate.js
```

4. 개발 서버 시작

```powershell
npm.cmd run dev
```

프로덕션 빌드
-
```powershell
npm.cmd run build
```

Vercel 배포
-
1. Vercel 프로젝트를 생성합니다.
2. Vercel 환경 변수에 `DATABASE_URL` 값을 추가합니다.
3. 레포를 연결하면 Vercel이 자동으로 빌드/배포합니다.

데이터베이스 관련 메모
-
- `migrations/postgres_create_tables.sql` 파일에 스키마 정의가 있습니다. Neon 같은 외부 Postgres 인스턴스에 먼저 적용해야 합니다.
- 마이그레이션/샘플 데이터 삽입 시 중복 인덱스나 FK 제약으로 실패하는 경우가 있으니, 오류 메시지를 확인하고 중복 레코드 정리 후 재시도하세요.

제한사항 & TODO
-
- 일부 서버측 비즈니스 로직(예: 패스워드 해싱/검증)이 아직 Node API로 완전히 포팅되지 않았을 수 있습니다. 그 부분은 `pages/api` 내부에서 추가 구현이 필요합니다.
- 테스트: 마이그레이션 적용 후 엔드투엔드 테스트(게시글 생성/수정/삭제, 맵 연동)를 권장합니다.

주요 변경 사항
- `rasterMap.html`에 `map.html`과 동일한 노트(메모) 기능 추가
  - 지도 클릭으로 입력 팝업(경도/위도 표시, 텍스트 입력, 저장/취소)
  - 저장 시 `/api/notes`로 POST하여 DB에 저장, 팝업이 읽기 전용으로 전환
  - 기존 노트는 `/api/notes` GET으로 로드하여 팝업으로 표시
  - 노트 수정 지원: 읽기 팝업에서 "수정" 버튼으로 편집 팝업을 열어 PUT으로 업데이트
  - 노트 삭제 지원: 읽기 팝업의 "삭제" 버튼으로 DELETE /api/notes/{id} 호출하여 삭제
  - 10초 주기 폴링(poll)으로 새 노트가 있으면 자동으로 표시

**프로젝트: MaplibreBoardVercel**

**한줄 요약:** Next.js 기반 프론트엔드(페이지 + API Routes)와 PostgreSQL(Neon) 연동으로 지도 기반 게시판을 제공하는 프로젝트입니다. 기존 Spring Boot 소스는 보존되어 있으나, 주요 UI/API는 Next.js로 포팅되어 Vercel에 배포하기 쉽도록 구성되어 있습니다.

**현재 상태(요약)**
- `pages/board.js` : `board.html`을 React로 포팅 — 게시글 조회/작성/수정/삭제(비밀번호 검증) 클라이언트 로직 포함.
- `pages/rasterMap2.js` : `rasterMap2.html`을 React로 포팅 — MapLibre(래스터 타일) 기반 그리드 및 보드 오버레이, 그리드 클릭 시 보드 생성/열기 기능 포함.
- DB: PostgreSQL(Neon) 사용 권장. 마이그레이션 파일은 `migrations/postgres_create_tables.sql`에 있음 (단일 `posts` 테이블 방식).
- DB 유틸: `lib/db.js` (pg Pool 전역 캐시) — Vercel 같은 서버리스 환경에서 연결 관리용.
- 스프링부트 소스는 `src/main/java/...`에 그대로 존재(보관/참고용).

**프로젝트 구조(핵심)**
- `package.json` — Next.js, 스크립트, 의존성
- `pages/` — Next.js 페이지 및 API 라우트
  - `pages/board.js`, `pages/rasterMap2.js`
  - `pages/api/boards.js`, `pages/api/posts.js` 등
- `lib/db.js` — PostgreSQL 연결 풀
- `migrations/postgres_create_tables.sql` — Postgres용 DDL
- `scripts/migrate.js` — 마이그레이션 실행 스크립트 (NODE 환경에서 `DATABASE_URL` 사용)
- `src/main/...` — 기존 Spring Boot Java 코드(컨트롤러/서비스/템플릿)

**필수 환경 변수**
- `DATABASE_URL` — Neon/Postgres 연결 문자열 (예: `postgresql://user:pass@host:port/dbname?sslmode=require`)

로컬 개발 (PowerShell 예)
1) 세션에 `DATABASE_URL` 설정
```powershell
$env:DATABASE_URL="postgresql://<user>:<pass>@<host>:<port>/<db>?sslmode=require"
```
2) 의존성 설치 및 마이그레이션 실행
```powershell
npm.cmd install
npm.cmd run migrate
```
3) 개발 서버 시작
```powershell
npm.cmd run dev
```
4) 확인 URL
- 보드 페이지: `http://localhost:3000/board?id=<BOARD_ID>`
- 레스터 맵: `http://localhost:3000/rasterMap2`

DB 마이그레이션/구현 노트
- 현재 `migrations/postgres_create_tables.sql`은 단일 `posts` 테이블과 `boards` 테이블을 생성합니다. `updated_at` 자동 갱신을 위한 트리거 함수도 포함되어 있습니다.
- 기존 MySQL 스타일(격자별 `posts_grid_x_y` 테이블)은 운영·관리 부담이 커서 기본적으로 단일 테이블(또는 파티셔닝) 접근을 권장합니다.
- 테이블 및 인덱스 생성 중 중복(예: `idx_boards_grid`) 오류가 발생하면 중복 `boards` 행을 제거/병합해야 합니다. (중복 탐지 및 병합 스크립트가 필요하면 도와드립니다.)

API/기능 현황
- `/api/boards` : 보드 조회/생성, 그리드 보드 보장(`grid/{x}/{y}/ensure`) 등 (Next API로 이식됨)
- `/api/boards/:id/posts` : 게시글 CRUD (생성/수정/삭제/비밀번호 검증) — 클라이언트는 비밀번호(4자리 PIN)를 전송하고, 서버가 해시/검증해야 합니다. 현재 API가 DB 연동을 사용하지만, 비밀번호 해시 로직(예: bcrypt 또는 `pgcrypto`)이 완전히 포팅되었는지 확인하세요.

운영/배포 (Vercel)
- Vercel은 Next.js를 자동 인식합니다. 레포를 연결한 후 `Settings > Environment Variables`에 `DATABASE_URL`을 추가하세요.
- `lib/db.js`의 전역 Pool 캐시를 사용해 Vercel의 커넥션 제한을 완화하십시오.
- 마이그레이션은 배포 전에 실행하세요(Neon SQL Editor 권장). 프로덕션에서 DDL을 애플리케이션이 직접 실행하는 것은 권장하지 않습니다.

테스트 데이터(예제)
- 보드 생성 및 게시글 삽입(트랜잭션 예):
```sql
BEGIN;
WITH b AS (
  INSERT INTO boards (name, grid_x, grid_y, center_lng, center_lat, meta)
  VALUES ('트랜잭션 보드', 1, 2, 128.1, 36.9, '{}'::jsonb)
  RETURNING id
)
INSERT INTO posts (board_id, author, content, password)
SELECT id, '테스트', '트랜잭션 글', 'pw123' FROM b;
UPDATE boards SET posts_count = posts_count + 1 WHERE id = (SELECT id FROM b);
COMMIT;
```

다음 작업(권장)
- API: `BoardService` 수준의 비즈니스 로직(특히 비밀번호 해시/검증, 트랜잭션으로 posts_count 유지)을 Next.js API에 완전히 이식 및 테스트.
- UI: 추가적인 반응형 스타일과 로딩 UX 개선.