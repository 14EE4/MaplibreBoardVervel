# MaplibreBoardVercel

## 간단 요약
Next.js(페이지 + API Routes) 기반의 지도형 게시판입니다. MapLibre GL을 사용해 그리드 단위 보드를 시각화하고, 게시글 CRUD는 Next.js API Routes로 제공합니다. 운영 DB로 Neon/Postgres를 사용합니다.

## Vercel 배포 주소
- https://maplibreboard.vercel.app

## 빠른 링크
- 맵 페이지: `/map`
- 보드(게시판) 페이지: `/board?id=<id>` 또는 `/board?grid_x=<x>&grid_y=<y>`
- 관리자 페이지: `/admin` (클라이언트 사이드 게이트: 비밀번호 `1q2w3e4r!`)

---

## 핵심 기능

### 🗺️ 지도 (Map)
- **MapLibre GL JS** 기반 인터랙티브 지도
- **모드 전환:** OSM(기본), Satellite(위성), Globe(지구본)
- **상태 유지:** localStorage에 지도 뷰(중심, 줌, 모드) 저장
- **보드 시각화:** 게시물 수(posts_count) 기반 heatmap 스타일 오버레이
  - 게시물 수 적음: 파란색 (`#3B82F6`)
  - 게시물 수 많음: 빨간색 (`#EF4444`)
  - 반투명도(opacity): 0.25~0.4

### 🎯 그리드 & 보드 (Board)
- **그리드 클릭:** 해당 좌표에 보드가 없으면 자동 생성 후 `/board?grid_x=...&grid_y=...`로 이동
- **보드 정보 표시:**
  - 보드 id	
  - 이름, 그리드 좌표(X, Y)
  - 게시물 수
  - 중심 좌표(경도, 위도)
- **게시글 CRUD:**
  - **생성 (POST):** 이름(선택), 내용(필수), 비밀번호(선택)
  - **조회 (GET):** 작성 시간 역순 정렬
  - **수정 (PUT):** 비밀번호 검증 후 수정 (내용, 작성자만)
  - **삭제 (DELETE):** 비밀번호 검증 필수
- **단축키:** Ctrl + Enter로 글 전송

---

## 프로젝트 구조

```
MaplibreBoardVercel/
├── pages/
│   ├── _app.js                          # Next.js 앱 진입점
│   ├── map.js                           # 🗺️ MapLibre 지도 페이지 (모드 전환 포함)
│   ├── rasterMap2.js                    # (리디렉트) /map으로 리디렉트
│   ├── board.js                         # 📝 보드(게시판) 페이지 (게시글 CRUD)
│   ├── admin.js                         # 🔐 관리자 페이지 (클라이언트 사이드 게이트)
│   └── api/
│       ├── boards.js                    # 보드 CRUD API
│       │   ├── GET /api/boards          → 전체 보드 목록
│       │   ├── GET /api/boards?id=...   → 단일 보드 (ID)
│       │   ├── GET /api/boards?grid_x=...&grid_y=... → 단일 보드 (그리드)
│       │   └── POST /api/boards         → 새 보드 생성
│       ├── posts.js                     # 게시글 CRUD API
│       │   ├── GET /api/posts?board_id=...  → 보드별 게시글 목록
│       │   ├── POST /api/posts              → 새 게시글 생성
│       │   ├── PUT /api/posts               → 게시글 수정
│       │   └── DELETE /api/posts?id=...     → 게시글 삭제
│       ├── posts/
│       │   └── verify.js                # 게시글 비밀번호 검증 API
│       │       └── POST /api/posts/verify → 비밀번호 검증
│       └── boards/
│           └── grid/
│               └── [gridX]/
│                   └── [gridY]/
│                       └── ensure.js    # 그리드 보드 보장(자동 생성) API
│                           └── POST /api/boards/grid/:x/:y/ensure
├── lib/
│   └── db.js                            # PostgreSQL 연결 풀 (서버리스 친화적)
├── migrations/
│   └── neon_init.sql                    # Postgres 스키마 + 초기 데이터
├── public/
│   ├── index.html                       # 정적 랜딩 페이지
│   ├── icon.png                         # 파비콘
│   └── ...
├── .env.local                           # 로컬 환경변수 (git 무시)
├── package.json
├── next.config.js
└── README.md                            # 이 파일
```

---

## 환경 변수

### 필수
- `DATABASE_URL` — Postgres 연결 문자열
  ```
  postgresql://user:password@host:5432/dbname?sslmode=require
  ```

### 선택 (권장)
- `ADMIN_PASSWORD` — 관리자 비밀번호 (현재 클라이언트 사이드: `1q2w3e4r!`)

---

## 핵심 API 상세 설명

### 🏠 보드 API (`/api/boards`)

#### GET 요청

**1. 전체 보드 목록**
```bash
GET /api/boards
```
응답: 배열 (JSON)
```json
[
  {
    "id": 123,
    "name": "grid_61_25",
    "x": 61,
    "y": 25,
    "lng": 127.5,
    "lat": 37.5,
    "count": 5
  }
]
```

**2. ID로 단일 보드 조회**
```bash
GET /api/boards?id=123
```
응답: 객체 (JSON) 또는 404

**3. 그리드 좌표로 단일 보드 조회**
```bash
GET /api/boards?grid_x=61&grid_y=25
```
응답: 객체 (JSON)
```json
{
  "id": 123,
  "name": "grid_61_25",
  "x": 61,
  "y": 25,
  "lng": 127.5,
  "lat": 37.5,
  "count": 5
}
```
또는 404 Not Found: `{"error": "not found"}`

**사용 SQL:**
```sql
-- 전체 목록
SELECT id, name, grid_x, grid_y, posts_count, center_lng, center_lat 
FROM boards ORDER BY id

-- ID로 조회
SELECT id, name, grid_x, grid_y, posts_count, center_lng, center_lat 
FROM boards WHERE id = $1

-- 그리드 좌표로 조회
SELECT id, name, grid_x, grid_y, posts_count, center_lng, center_lat 
FROM boards WHERE grid_x = $1 AND grid_y = $2
```

#### POST 요청

**보드 생성**
```bash
POST /api/boards
Content-Type: application/json

{
  "name": "my-board",
  "grid_x": 61,
  "grid_y": 25,
  "center_lng": 127.5,
  "center_lat": 37.5
}
```
응답: 201 Created

**사용 SQL:**
```sql
INSERT INTO boards(name, grid_x, grid_y, center_lng, center_lat, meta)
VALUES($1,$2,$3,$4,$5) RETURNING id, name, grid_x, grid_y, center_lng, center_lat, meta
```

---

### 📝 게시글 API (`/api/posts`)

#### GET 요청

**게시글 목록 조회**
```bash
GET /api/posts?board_id=123
```
응답: 배열 (시간 역순 정렬)

**사용 SQL:**
```sql
-- 보드별 게시글
SELECT * FROM posts WHERE board_id = $1 ORDER BY created_at DESC

-- 전체 게시글
SELECT * FROM posts ORDER BY created_at DESC
```

#### POST 요청

**게시글 생성**
```bash
POST /api/posts
Content-Type: application/json

{
  "board_id": 123,
  "author": "John",
  "content": "Hello World",
  "password": "mypassword"
}
```
- `board_id`: 필수
- `content`: 필수
- `author`: 선택 (null 가능)
- `password`: 선택 (미지정 시 null, 서버에서 SHA-256 해싱)

응답: 201 Created

**사용 SQL (트랜잭션):**
```sql
BEGIN;
INSERT INTO posts (board_id, author, content, password) 
VALUES($1,$2,$3,$4) RETURNING *;
UPDATE boards SET posts_count = posts_count + 1 WHERE id = $1;
COMMIT;
```

#### PUT 요청

**게시글 수정**
```bash
PUT /api/posts
Content-Type: application/json

{
  "id": 1,
  "author": "Jane",
  "content": "Updated content",
  "password": "mypassword"
}
```
응답: 200 OK

**사용 SQL:**
```sql
UPDATE posts SET author=$1, content=$2, password=$3, updated_at=now() 
WHERE id=$4 RETURNING *
```

#### DELETE 요청

**게시글 삭제**
```bash
DELETE /api/posts?id=1
Content-Type: application/json

{
  "password": "mypassword"
}
```
응답: 200 OK (`{ "ok": true }`) 또는 403 Forbidden

**사용 SQL (트랜잭션):**
```sql
-- 비밀번호 확인
SELECT password, board_id FROM posts WHERE id = $1;

-- 삭제 및 카운트 감소
BEGIN;
DELETE FROM posts WHERE id=$1 RETURNING *;
UPDATE boards SET posts_count = GREATEST(posts_count - 1, 0) WHERE id = $1;
COMMIT;
```

---

### 🔐 게시글 비밀번호 검증 API (`/api/posts/verify`)

```bash
POST /api/posts/verify
Content-Type: application/json

{
  "id": 1,
  "password": "mypassword"
}
```
응답: 200 OK (`{ "ok": true }`) 또는 403 Forbidden

**용도:** 수정/삭제 전 비밀번호 미리 검증 (UX 개선)

**사용 SQL:**
```sql
SELECT password FROM posts WHERE id = $1
```

---

### 🎁 그리드 보드 자동 생성 API (`/api/boards/grid/:x/:y/ensure`)

```bash
POST /api/boards/grid/61/25/ensure
```
- 해당 그리드에 보드가 없으면 자동 생성
- 이미 있으면 기존 보드 반환

응답: 200/201 + 보드 객체

**사용 SQL (트랜잭션):**
```sql
-- 기존 보드 확인
SELECT id, meta FROM boards WHERE grid_x = $1 AND grid_y = $2 LIMIT 1;

-- 없으면 생성
BEGIN;
INSERT INTO boards(name, grid_x, grid_y, center_lng, center_lat, meta) 
VALUES($1,$2,$3,$4,$5,$6) RETURNING id;
COMMIT;
```

---

## 지도 / 클라이언트 노트
- 맵 모드: `osm`(OSM 래스터), `sat`(예: Esri 래스터), `globe`(MapLibre globe 스타일)
- 선택된 모드는 로컬스토리지 키 `rasterMap2-state`에 저장됩니다(키 변경 시 클라이언트 전역 수정 필요).
- 보드 오버레이(heatmap-like)는 API의 `posts_count` 값을 기반으로 색상을 보간해 반투명으로 표시합니다.

## MapLibre (지도 라이브러리)
이 프로젝트는 MapLibre GL JS를 사용합니다. 클라이언트 지도 코드는 `pages/map.js`(및 일부 `pages/*.js`)에 있으며, MapLibre 관련 CSS/JS는 `public/`의 정적 파일이나 CDN을 통해 로드됩니다.
기본 타일/스타일: 레스터 맵은 OpenStreetMap (OSM) 타일을 기본으로 사용합니다.
- 커스터마이즈 포인트:
  - Map 초기 옵션: 중심 좌표, 줌, min/max zoom, 모드 등은 `pages/map.js`에서 설정됩니다.
  - 타일/스타일 변경: `map.addSource`/`map.addLayer` 호출에서 `url` 또는 `tiles` 값을 교체합니다.
  - CSS: MapLibre의 기본 스타일은 `public/maplibre.css` 또는 페이지 내 `<link>`로 로드된 CSS를 통해 적용됩니다.
  - 성능/디바이스: 모바일 성능을 개선하려면 `antialias`, `pitchWithRotate` 등의 옵션을 조정하세요.

 - 맵 모드 전환 (Raster / Satellite / Globe)
  - UI: `pages/map.js`에 사용자 인터페이스(상단 우측 컨트롤)가 추가되어 기본 래스터( OpenStreetMap )와 위성(Satellite), 지구본(Globe) 모드 사이를 전환할 수 있습니다.
   - 기본값: 기본 모드는 OpenStreetMap(OSM) 래스터입니다. 사용자가 선택한 모드는 `localStorage`의 `rasterMap2-state`에 `mode`로 저장되어 새로고침 시에도 유지됩니다.
   - Satellite: 현재 구현은 Esri World Imagery(예: `https://server.arcgisonline.com/.../tile/{z}/{y}/{x}`)를 사용합니다.
  - Globe: `projection: 'globe'`를 사용해 지구본 투영을 시도합니다. 현재 구현은 MapLibre 데모의 globe 스타일을 사용합니다: `https://demotiles.maplibre.org/globe.json`.
    - 참고 예시(로컬/외부 스타일): `https://demotiles.maplibre.org/globe.json`.
    - 래스터 타일을 globe에 사용하는 것은 지도 품질이 환경에 따라 다를 수 있으므로, 더 나은 시각화가 필요하면 벡터 타일 + globe-friendly 스타일 사용을 권장합니다.
  - 변경 위치: 기본 타일 URL 또는 모드 동작을 변경하려면 `pages/map.js` 상단의 `createMap(mode)` 함수 내부의 `tiles`/`sources` 부분을 수정하세요.
  - grid 체크 시 격자 시각화

## 관리자 페이지 접근(현재 구현)
- 현재 `pages/admin.js`에는 간단한 클라이언트 사이드 비밀번호 게이트가 구현되어 있습니다. 하드코딩된 비밀번호는 다음과 같습니다: 1q2w3e4r!

- 동작: 올바른 비밀번호 입력 시 `sessionStorage`에 `admin-authed=1`을 저장하여 같은 브라우저 세션에서는 재입력 없이 접근할 수 있습니다.
- 주의: 이 방법은 클라이언트에 비밀번호가 노출되므로 보안에 취약합니다. 프로덕션 환경에서는 아래의 서버사이드 인증 방식을 권장합니다.

서버사이드 인증(권장) — 간단한 구현 가이드
1. `ADMIN_PASSWORD`를 Vercel 환경변수 또는 로컬 `.env.local`에 설정합니다.
2. `pages/api/login.js` 엔드포인트를 만들어 POST로 전달된 비밀번호를 서버에서 검증합니다.
3. 검증이 성공하면 HttpOnly 세션 쿠키(또는 JWT)를 발급합니다.
4. `pages/admin.js`는 서버에 인증 상태를 확인하거나, API 호출마다 쿠키로 인증을 확인하도록 합니다.

## 파비콘(favicon)
- 사이트 아이콘은 `public/icon.png`로 추가되어 있으며, 정적 랜딩 페이지(`public/index.html`)와 Next.js 헤드(`pages/_app.js`)에 파비콘 링크가 설정되어 있습니다.

## 지도 상태 유지 및 보드 가시화 (Heatmap Overlay)

### 지도 뷰 상태 유지
`pages/map.js`는 사용자가 보고 있던 지도 상태(중심 좌표, 줌 레벨, 모드)를 `localStorage`에 저장합니다. 기본 동작은 다음과 같습니다:
- 저장 키: `rasterMap2-state`
- 저장 시점: 지도 이동/줌/모드 변경 이벤트 발생 시 업데이트
- 로드 시점: 페이지 마운트 시 `localStorage`에 저장된 값이 있으면 해당 상태로 초기화합니다.
- 재현성: 브라우저 새로고침 또는 탭 재오픈 시 이전 위치와 줌 상태가 그대로 복원됩니다.
- 초기화 방법: 개발자 도구에서 `localStorage.removeItem('rasterMap2-state')` 또는 응용 프로그램 코드에서 초기화 로직을 추가하세요.

### 보드 기반 색상 오버레이 (Heatmap-like)
맵 위에 그려지는 각 그리드(보드)는 DB의 `posts_count`(또는 API가 반환하는 `count`) 값에 따라 반투명 색상으로 표시됩니다. 동작 방식 요약:
- 데이터 소스: `pages/map.js`가 호출하는 `GET /api/boards` 또는 보드 리스트 API에서 각 보드의 `count`(또는 `posts_count`) 값을 사용합니다.
- 색상 매핑: 게시글 수를 최소값(min)과 최대값(max) 사이에서 정규화한 값 `v`(0..1)를 만든 후, `v=0`일 때 파란색(예: `#3B82F6`), `v=1`일 때 빨간색(예: `#EF4444`)을 선형 보간(interpolate)합니다.
- 불투명도(알파): 기본적으로 0.25~0.4 사이의 반투명으로 설정하여 지도 타일을 가리지 않게 합니다(코드에서 `opacity` 상수로 조정 가능).
- 시각적 효과: 게시글 수가 적으면 파란색(차가움), 많을수록 빨간색(뜨거움)으로 바뀌며, 색상은 그리드 단위로 채워집니다.
- 조정 포인트: `pages/map.js`의 상수 또는 컬러/스케일 함수를 변경하여 최소/최대 컷오프, 컬러 스케일(hsl/rgb), 불투명도 등을 조절할 수 있습니다.

참고: 색상 오버레이가 보이려면 보드 테이블의 `posts_count`가 최신 상태여야 합니다. `POST /api/posts`나 게시물 삭제/수정 시 서버가 `boards.posts_count`를 갱신하도록 구현되어 있는지 확인하세요. 샘플 데이터로 테스트하려면 README의 샘플 SQL로 몇 개 보드를 삽입한 뒤 `posts_count` 값을 변경해 보세요.

## 게시판
지도에서 클릭으로 게시판 진입
게시판 이름과 좌표, 게시물 수 정보 확인 가능
  - 글 작성  
    - 이름(선택), 내용(필수), 비밀번호(선택)
    - 비밀번호를 입력하고 전송하면 글 목록에서 해당 비밀번호로 수정, 삭제 가능
    - Ctrl + Enter 단축키로 전송 가능
  - 글 목록
    - 작성된 게시판의 글을 불러와서 확인가능
    - 비밀번호 입력 후 수정, 삭제 가능(비밀번호가 다르면 불가 팝업 메시지)
    - 비밀번호가 없는 글의 경우 삭제, 수정 불가

## DB 구조
github 레포지트리의 backup에서 테이블 확인가능
  - boards 테이블
    - 기본키: id, 속성(name, grid_x, grid_y, center_lng, center_lat, meta, posts_count, created_at,
  updated_at)
    - 지도에서 타일 클릭시 해당 좌표의 게시판이 없으면 boards에 추가
  - posts 테이블
    - 기본키: id, 속성(board_id, author, content, password, created_at, updated_at)
    - 왜래키: board_id(boards(id) 참조)
  - 글 작성 시 posts에 해당 board_id와 정보의 행 추가, 해당 게시판의 posts_count값 1 증가
  
## 확인된 문제
- 0,0 클릭 시 72,0으로 이동되는 문제(디버깅 필요)

## TODO
- 검색 기능: 지명 검색 → flyTo
- 로그인 기능(ex: google)
- 관리자 비밀번호를 하드코딩에서 서버사이드 인증으로 변경

## 문제점, 해결
- board 주소 id, 좌표 둘 중 어느 url로 들어가도 게시판 나오게
	- useRouter()로 id, grid_x, grid_y를 읽어와서 
		- id가 있으면 loadBoardById(id) → /api/boards?id=...로 단일 보드 조회 후 posts 로드.
    	- 그렇지 않고 grid_x·grid_y 둘 다 있으면 loadBoardByGrid(grid_x, grid_y) → /api/boards?grid_x=...&grid_y=...로 조회 후 posts 로드.
- 비밀번호 일치해도 작동 안됨
	- verify.js api: 비밀번호 검증 api (수정, 삭제 시 입력 비밀번호 해싱하여(sha256) db와 같으면 res.status(200).json({ ok: true }))
- 클릭해도 게시판 안나옴
	- 커서를 크로스헤어로 변경
- 새로고침하면 위치 초기화
	- 브라우저 localstorage에 위치를 저장하여 유지되게
- 게시판 정보 안나옴
	- ① 서버 API에 ?id=, ?grid_x=&grid_y= 쿼리 파라미터 지원 추가 → ② 클라이언트 로드 함수를 전체 목록 조회에서 직접 쿼리로 변경 → ③ loadBoardByGrid()에 setBoardMeta(obj) 한 줄 추가해 보드 메타 상태 설정.
