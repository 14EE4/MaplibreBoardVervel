# MaplibreBoardVercel

한줄 요약
-
Next.js (페이지 + API Routes) 기반의 지도형 게시판 프로젝트입니다. 서버리스(Vercel) 환경에 배포되어 있으며, 운영 DB로 Neon의 PostgreSQL을 사용합니다.

라이브 데모
-
- https://maplibreboard.vercel.app

핵심 상태(요약)
-
- 포팅된 기능: `board` 페이지, `map` 페이지(맵 + 그리드), 게시글 CRUD API
- DB: Neon PostgreSQL (운영 DB)
- 배포: Vercel (서버리스)

핵심 파일/위치
-
- `pages/board.js` — 보드(게시판) UI 및 클라이언트 로직
- `pages/map.js` — MapLibre 기반 맵 + 그리드 뷰 및 보드 오버레이
- `pages/api/boards.js`, `pages/api/posts.js` — 보드·게시글 서버리스 API
- `lib/db.js` — PostgreSQL 연결(Pool 재사용 패턴)
- `migrations/postgres_create_tables.sql` — DB 스키마
- `scripts/migrate.js` — 마이그레이션 실행 스크립트

MapLibre (지도 라이브러리)
-
-- 이 프로젝트는 MapLibre GL JS를 사용합니다. 클라이언트 지도 코드는 `pages/map.js`(및 일부 `pages/*.js`)에 있으며, MapLibre 관련 CSS/JS는 `public/`의 정적 파일이나 CDN을 통해 로드됩니다.
-- 기본 타일/스타일: 레스터 맵은 OpenStreetMap (OSM) 타일을 기본으로 사용합니다 (예: `https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png`). 타일 공급자를 바꾸려면 `pages/map.js` 안의 `style` 또는 `raster` 레이어 설정을 편집하세요. OSM을 사용할 경우 저작권 표기(Attribution)를 유지하세요.
- 커스터마이즈 포인트:
  - Map 초기 옵션: 중심 좌표, 줌, min/max zoom, bearing 등은 `pages/map.js`에서 설정됩니다.
  - 타일/스타일 변경: `map.addSource`/`map.addLayer` 호출에서 `url` 또는 `tiles` 값을 교체합니다.
  - CSS: MapLibre의 기본 스타일은 `public/maplibre.css` 또는 페이지 내 `<link>`로 로드된 CSS를 통해 적용됩니다.
  - 성능/디바이스: 모바일 성능을 개선하려면 `antialias`, `pitchWithRotate` 등의 옵션을 조정하세요.

 - 맵 모드 전환 (Raster / Satellite / Globe)
  - UI: `pages/map.js`에 사용자 인터페이스(상단 우측 컨트롤)가 추가되어 기본 래스터( OpenStreetMap )와 위성(Satellite), 지구본(Globe) 모드 사이를 전환할 수 있습니다.
   - 기본값: 기본 모드는 OpenStreetMap(OSM) 래스터입니다. 사용자가 선택한 모드는 `localStorage`의 `rasterMap2-state`에 `mode`로 저장되어 새로고침 시에도 유지됩니다.
   - Satellite: 현재 구현은 Esri World Imagery(예: `https://server.arcgisonline.com/.../tile/{z}/{y}/{x}`)를 사용합니다. Esri 등의 타일 제공자는 이용약관/저작권이 있으니 상업적 사용 시 확인하세요.
  - Globe: `projection: 'globe'`를 사용해 지구본 투영을 시도합니다. 현재 구현은 MapLibre 데모의 globe 스타일을 사용합니다: `https://demotiles.maplibre.org/globe.json`.
    - 참고 예시(로컬/외부 스타일): `https://demotiles.maplibre.org/globe.json`.
    - 래스터 타일을 globe에 사용하는 것은 지도 품질이 환경에 따라 다를 수 있으므로, 더 나은 시각화가 필요하면 벡터 타일 + globe-friendly 스타일 사용을 권장합니다.
  - 변경 위치: 기본 타일 URL 또는 모드 동작을 변경하려면 `pages/map.js` 상단의 `createMap(mode)` 함수 내부의 `tiles`/`sources` 부분을 수정하세요.
   - 저작권/Attribution: OSM과 Esri 등 각 타일 제공자의 저작권 표기를 유지해야 합니다. README나 페이지 하단에 적절한 attribution을 표시하세요.


환경 변수
-
- `DATABASE_URL` — PostgreSQL 연결 문자열 (예: `postgresql://user:pass@host:5432/dbname?sslmode=require`)
- (선택) `ADMIN_PASSWORD` — 관리자 페이지 구현 시 사용

로컬 개발 (PowerShell)
-
1. 의존성 설치

```powershell
npm.cmd install
```

2. 환경변수(임시 세션 예)

```powershell
$env:DATABASE_URL = "postgresql://<user>:<pass>@<host>:<port>/<db>?sslmode=require"
```

3. 마이그레이션 실행 (DB 준비 필요)

```powershell
node scripts/migrate.js
```

4. 개발 서버 시작

```powershell
npm.cmd run dev
```

확인 URL
-
- 보드: `http://localhost:3000/board?id=<BOARD_ID>` 또는 `http://localhost:3000/board?grid_x=<X>&grid_y=<Y>`
- 레스터맵: `http://localhost:3000/map`

프로덕션 빌드 / Vercel 배포
-
1. Vercel 프로젝트 생성 및 레포 연결
2. Vercel 설정에서 `DATABASE_URL`(및 필요 시 `ADMIN_PASSWORD`)를 Environment Variables에 추가
3. (권장) 마이그레이션을 Vercel 배포 전에 수동으로 실행
4. Vercel이 자동으로 빌드/배포합니다 (빌드 커맨드: `npm run build`)

운영(라이브)
-
- 라이브 사이트: https://maplibreboard.vercel.app
- 운영 DB: Neon PostgreSQL

지도 상태 유지 및 보드 가시화(Heatmap)
-
- 지도 뷰 상태 유지
  - `pages/map.js`는 사용자가 보고 있던 지도 상태(중심 좌표, 줌, 베어링 등)를 `localStorage`(`rasterMap2-state`)에 저장합니다.
  - 지도 이동/줌/회전 이벤트에서 상태를 갱신하고, 페이지 로드 시 해당 상태가 있으면 복원합니다.
  - 초기화: 개발자 도구에서 `localStorage.removeItem('rasterMap2-state')`로 초기화할 수 있습니다.

- 보드 기반 색상 오버레이(Heatmap-like)
  - 데이터: API에서 반환되는 각 보드의 `count` 또는 DB의 `posts_count`를 사용합니다.
  - 색상 매핑: 게시글 수를 0..1로 정규화한 값 `v`를 기준으로 `#3B82F6`(파랑) → `#EF4444`(빨강)으로 선형 보간합니다.
  - 불투명도: 기본 반투명(예: alpha 0.25~0.4)으로 설정하여 지도 타일을 가리지 않게 합니다.
  - 조정 위치: `pages/map.js`의 상수(스케일, 불투명도, 컬러)에서 커스터마이즈 가능합니다.
  - 주의: `posts_count`가 최신이어야 하므로 게시글 생성/삭제 시 서버가 `boards.posts_count`를 유지하도록 구현되어 있는지 확인하세요.

API 요약
-
- `GET /api/boards?id=<id>` — 단일 보드 조회
- `GET /api/boards?grid_x=<x>&grid_y=<y>` — 그리드 기준 단일 보드 조회
- `POST /api/boards` — 보드 생성 (옵션: `grid_x`,`grid_y`,`center_lng`,`center_lat`)
- `GET /api/posts?board_id=<id>` — 게시글 조회
- `POST /api/posts` — 게시글 생성(비밀번호는 서버에서 해시)
- `PUT /api/posts/:id`, `DELETE /api/posts/:id` — 수정/삭제(비밀번호 검증 필요)

샘플 데이터 삽입 (트랜잭션 예)

```sql
BEGIN;
WITH b AS (
  INSERT INTO boards (name, grid_x, grid_y, center_lng, center_lat, meta)
  VALUES ('예시 보드', 61, 25, 128.5, 36.2, '{}'::jsonb)
  RETURNING id
)
INSERT INTO posts (board_id, author, content, password)
SELECT id, '테스트', '안녕하세요', 'pw' FROM b;
UPDATE boards SET posts_count = posts_count + 1 WHERE id = (SELECT id FROM b);
COMMIT;
```

자주 발생하는 문제 및 점검
-
- DB 연결 오류: `DATABASE_URL`이 정확한지, 외부 접속(방화벽/SSL) 설정을 확인하세요.
- 마이그레이션 실패: 기존 테이블/인덱스가 남아있을 경우 수동 정리 후 재실행하세요.
- 보드 메타 정보가 보이지 않을 때: `/api/boards?grid_x=...&grid_y=...` 호출 결과(200/404)를 확인하세요.

다음 권장 작업
-
- 서버사이드 관리자 인증(토큰/HttpOnly cookie) 구현
- API 입력 검증 강화 (Joi 등)
- E2E 테스트 및 샘플 데이터 시드 추가

확인된 이슈
-
- 0,0 클릭 시 72,0으로 이동되는 문제 (디버깅 필요)

문의/지원
-
원하시면 Vercel 설정(`vercel.json`), 서버사이드 로그인, 또는 마이그레이션/샘플 데이터 적용을 도와드리겠습니다.
**MaplibreBoardVercel — 안내서 (한글)**

**한줄 요약:** Next.js (페이지 + API Routes) 기반의 지도형 게시판 프로젝트. 서버리스(Vercel) 배포를 목표로 하며 데이터는 PostgreSQL(Neon 권장)을 사용합니다.
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
`pages/map.js` : `rasterMap2.html`을 React로 포팅 — MapLibre(래스터 타일) 기반 그리드 및 보드 오버레이, 그리드 클릭 시 보드 생성/열기 기능 포함.
- DB: PostgreSQL(Neon) 사용 권장. 마이그레이션 파일은 `migrations/postgres_create_tables.sql`에 있음 (단일 `posts` 테이블 방식).
- DB 유틸: `lib/db.js` (pg Pool 전역 캐시) — Vercel 같은 서버리스 환경에서 연결 관리용.

**프로젝트 구조(핵심)**
- `package.json` — Next.js, 스크립트, 의존성
- `pages/` — Next.js 페이지 및 API 라우트
  - `pages/board.js`, `pages/map.js`
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
- 레스터 맵: `http://localhost:3000/map`

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

**지도 상태 유지 및 보드 가시화(Heatmap Overlay)**

-- **지도 뷰 상태 유지:** `pages/map.js`는 사용자가 보고 있던 지도 상태(중심 좌표, 줌 레벨, 베어링 등)를 `localStorage`에 저장합니다. 기본 동작은 다음과 같습니다:
  - 저장 키: `rasterMap2-state`
  - 저장 시점: 지도 이동/줌/회전 이벤트 발생 시 업데이트
  - 로드 시점: 페이지 마운트 시 `localStorage`에 저장된 값이 있으면 해당 상태로 초기화합니다.
  - 재현성: 브라우저 새로고침 또는 탭 재오픈 시 이전 위치와 줌 상태가 그대로 복원됩니다.
  - 초기화 방법: 개발자 도구에서 `localStorage.removeItem('rasterMap2-state')` 또는 응용 프로그램 코드에서 초기화 로직을 추가하세요.

- **보드 기반 색상 오버레이(Heatmap-like):** 맵 위에 그려지는 각 그리드(보드)는 DB의 `posts_count`(또는 API가 반환하는 `count`) 값에 따라 반투명 색상으로 표시됩니다. 동작 방식 요약:
  - 데이터 소스: `pages/map.js`가 호출하는 `GET /api/boards` 또는 보드 리스트 API에서 각 보드의 `count`(또는 `posts_count`) 값을 사용합니다.
  - 색상 매핑: 게시글 수를 최소값(min)과 최대값(max) 사이에서 정규화한 값 `v`(0..1)를 만든 후, `v=0`일 때 파란색(예: `#3B82F6`), `v=1`일 때 빨간색(예: `#EF4444`)을 선형 보간(interpolate)합니다.
  - 불투명도(알파): 기본적으로 0.25~0.4 사이의 반투명으로 설정하여 지도 타일을 가리지 않게 합니다(코드에서 `opacity` 상수로 조정 가능).
  - 시각적 효과: 게시글 수가 적으면 파란색(차가움), 많을수록 빨간색(뜨거움)으로 바뀌며, 색상은 그리드 단위로 채워집니다.
  - 조정 포인트: `pages/map.js`의 상수 또는 컬러/스케일 함수를 변경하여 최소/최대 컷오프, 컬러 스케일(hsl/rgb), 불투명도 등을 조절할 수 있습니다.

참고: 색상 오버레이가 보이려면 보드 테이블의 `posts_count`가 최신 상태여야 합니다. `POST /api/posts`나 게시물 삭제/수정 시 서버가 `boards.posts_count`를 갱신하도록 구현되어 있는지 확인하세요. 샘플 데이터로 테스트하려면 README의 샘플 SQL로 몇 개 보드를 삽입한 뒤 `posts_count` 값을 변경해 보세요.

**확인된 문제**
0,0클릭시 72,0으로 이동되는 문제

**TODO**
~~맵 테마를 raster에서 위성, 지구본으로 변경하는 기능~~
globe를 진짜 지구본으로 
검색 기능 - 검색창에 지명 입력하면 flyto로 해당 지점으로 날아감