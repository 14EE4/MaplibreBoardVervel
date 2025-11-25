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
-
- `rasterMap.html`에 `map.html`과 동일한 노트(메모) 기능 추가
  - 지도 클릭으로 입력 팝업(경도/위도 표시, 텍스트 입력, 저장/취소)
  - 저장 시 `/api/notes`로 POST하여 DB에 저장, 팝업이 읽기 전용으로 전환
  - 기존 노트는 `/api/notes` GET으로 로드하여 팝업으로 표시
  - 노트 수정 지원: 읽기 팝업에서 "수정" 버튼으로 편집 팝업을 열어 PUT으로 업데이트
  - 노트 삭제 지원: 읽기 팝업의 "삭제" 버튼으로 DELETE /api/notes/{id} 호출하여 삭제
  - 10초 주기 폴링(poll)으로 새 노트가 있으면 자동으로 표시

**프로젝트: MaplibreBoardVercel**

**한줄 요약:** Next.js 기반 프론트엔드(페이지 + API Routes)와 PostgreSQL(Neon) 연동으로 지도 기반 게시판을 제공하는 프로젝트입니다. 주요 UI/API는 Next.js로 포팅되어 Vercel에 배포하기 쉽도록 구성되어 있습니다.

**현재 상태(요약)**
- `pages/board.js` : `board.html`을 React로 포팅 — 게시글 조회/작성/수정/삭제(비밀번호 검증) 클라이언트 로직 포함.
- `pages/rasterMap2.js` : `rasterMap2.html`을 React로 포팅 — MapLibre(래스터 타일) 기반 그리드 및 보드 오버레이, 그리드 클릭 시 보드 생성/열기 기능 포함.
- DB: PostgreSQL(Neon) 사용 권장. 마이그레이션 파일은 `migrations/postgres_create_tables.sql`에 있음 (단일 `posts` 테이블 방식).
- DB 유틸: `lib/db.js` (pg Pool 전역 캐시) — Vercel 같은 서버리스 환경에서 연결 관리용.

**프로젝트 구조(핵심)**
- `package.json` — Next.js, 스크립트, 의존성
- `pages/` — Next.js 페이지 및 API 라우트
  - `pages/board.js`, `pages/rasterMap2.js`
  - `pages/api/boards.js`, `pages/api/posts.js` 등
- `lib/db.js` — PostgreSQL 연결 풀
- `migrations/postgres_create_tables.sql` — Postgres용 DDL
- `scripts/migrate.js` — 마이그레이션 실행 스크립트 (NODE 환경에서 `DATABASE_URL` 사용)

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

관리자 페이지 접근(현재 구현)
-
- 현재 `pages/admin.js`에는 간단한 클라이언트 사이드 비밀번호 게이트가 구현되어 있습니다. 하드코딩된 비밀번호는 다음과 같습니다:

```
1q2w3e4r!
```

- 동작: 올바른 비밀번호 입력 시 `sessionStorage`에 `admin-authed=1`을 저장하여 같은 브라우저 세션에서는 재입력 없이 접근할 수 있습니다.
- 주의: 이 방법은 클라이언트에 비밀번호가 노출되므로 보안에 취약합니다. 프로덕션 환경에서는 아래의 서버사이드 인증 방식을 권장합니다.

서버사이드 인증(권장) — 간단한 구현 가이드
-
1. `ADMIN_PASSWORD`를 Vercel 환경변수 또는 로컬 `.env.local`에 설정합니다.
2. `pages/api/login.js` 엔드포인트를 만들어 POST로 전달된 비밀번호를 서버에서 검증합니다.
3. 검증이 성공하면 HttpOnly 세션 쿠키(또는 JWT)를 발급합니다.
4. `pages/admin.js`는 서버에 인증 상태를 확인하거나, API 호출마다 쿠키로 인증을 확인하도록 합니다.

제가 원하시면 이 레포에서 서버사이드 로그인 엔드포인트와 쿠키 기반 보호로 `pages/admin.js`를 업그레이드해 드리겠습니다.

파비콘(favicon)
-
- 사이트 아이콘은 `public/icon.png`로 추가되어 있으며, 정적 랜딩 페이지(`public/index.html`)와 Next.js 헤드(`pages/_app.js`)에 파비콘 링크가 설정되어 있습니다.
- 일부 브라우저에서 파비콘이 나타나지 않으면 캐시 문제일 수 있으니 강력 새로고침(Ctrl+F5) 또는 시크릿 창에서 확인해 보세요.
- `favicon.ico`를 추가로 생성하려면 `public/icon.png`에서 변환하여 `public/favicon.ico`로 두면 대부분의 브라우저에서 자동으로 사용됩니다. 원하시면 제가 `favicon.ico`를 생성해 추가해 드립니다.

**확인된 문제**
0,0클릭시 72,0으로 이동되는 문제