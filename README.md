# MaplibreBoardVercel

간단 요약
- Next.js(페이지 + API Routes) 기반의 지도형 게시판 프로젝트입니다. MapLibre GL을 사용해 그리드 단위 보드를 시각화하고, 게시글 CRUD는 Next.js API Routes로 제공합니다. 운영 DB로 Neon/Postgres를 권장합니다.

vercel 배포 페이지
- https://maplibreboard.vercel.app

빠른 링크
- 맵 페이지: `/map` (이전 `/rasterMap2`는 `/map`으로 리디렉트됨)

핵심 기능
- 그리드 단위 보드 시각화(heatmap 스타일)
- 그리드 클릭 → 보드 보장(생성) → `/board?grid_x=...&grid_y=...`로 이동
- 게시글 CRUD: `/api/posts` (POST/GET/PUT/DELETE)
- 보드 API: `/api/boards`, 그리드 보장: `/api/boards/grid/:x/:y/ensure`

프로젝트 구조(요약)
- `pages/`
  - `map.js` — MapLibre 기반 지도(모드 전환 포함)
  - `rasterMap2.js` — 호환 리디렉트(`/map`)
  - `board.js` — 보드 페이지 (게시글 조회·작성·수정·삭제)
  - `admin.js` — 간단 관리자 페이지(비밀번호 입력으로 진입)
  - `api/boards.js`, `api/posts.js`, `api/boards/grid/[gridX]/[gridY]/ensure.js`
- `lib/db.js` — `pg` Pool 전역 캐시(서버리스 친화적)
- `migrations/neon_init.sql` — Postgres 스키마(boards, posts, 트리거 등)
- `public/` — 정적 파일(랜딩 `index.html`, `icon.png`)

환경 변수
- `DATABASE_URL` — Postgres 연결 문자열 (예: `postgresql://user:pass@host:5432/dbname?sslmode=require`)
- (선택) `ADMIN_PASSWORD` — 관리용 비밀번호(권장: 서버사이드로 관리)

마이그레이션
- 저장소에 `migrations/neon_init.sql`이 있습니다. Neon이나 `psql`을 사용해 수동으로 적용하세요.

예: psql 사용 예 (PowerShell)
```powershell
# psql이 설치된 환경에서
psql "${env:DATABASE_URL}" -f migrations/neon_init.sql
```

핵심 API 요약
- `GET /api/boards` — 보드 목록
- `GET /api/boards?id=<id>` — 단일 보드
- `GET /api/boards?grid_x=<x>&grid_y=<y>` — 그리드 보드
- `POST /api/boards` — 보드 생성
- `POST /api/boards/grid/:x/:y/ensure` — 그리드 보장

- `GET /api/posts?board_id=<id>` — 게시글 목록
- `POST /api/posts` — 게시글 생성 (비밀번호는 서버에서 해시)
- `PUT /api/posts` — 게시글 수정
- `DELETE /api/posts?id=<id>` — 게시글 삭제(비밀번호 검증)

지도/클라이언트 노트
- 맵 모드: `osm`(OSM 래스터), `sat`(예: Esri 래스터), `globe`(MapLibre globe 스타일)
- 선택된 모드는 로컬스토리지 키 `rasterMap2-state`에 저장됩니다(키 변경 시 클라이언트 전역 수정 필요).
- 보드 오버레이(heatmap-like)는 API의 `posts_count` 값을 기반으로 색상을 보간해 반투명으로 표시합니다.

주의 및 권장 작업
- 타일 제공자(OSM, Esri 등)의 이용약관과 저작권 표기를 지켜야 합니다. 페이지에 attribution을 표시하세요.
- 배포 전에 `migrations/neon_init.sql`을 적용하고 API가 정상 동작하는지 검증하세요.
- (선택) 로컬스토리지 키를 `map-state`로 변경하려면 클라이언트 코드 전체를 함께 수정하세요.

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
~~globe를 진짜 지구본으로~~
검색 기능 - 검색창에 지명 입력하면 flyto로 해당 지점으로 날아감