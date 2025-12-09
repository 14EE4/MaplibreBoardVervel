# MaplibreBoardVercel

## 간단 요약
- Next.js(페이지 + API Routes) 기반의 지도형 게시판입니다. MapLibre GL을 사용해 그리드 단위 보드를 시각화하고 게시글 CRUD는 Next.js API Routes로 제공합니다. 운영 DB로 Neon/Postgres를 권장합니다.

## vercel 배포 주소
- https://maplibreboard.vercel.app

## 빠른 링크
- 맵 페이지: `/map` (이전 `/rasterMap2`는 `/map`으로 리디렉트됨)

## 핵심 기능
- 그리드 단위 보드 시각화(heatmap 스타일)
- 그리드 클릭 → 보드 보장(생성) → `/board?grid_x=...&grid_y=...`로 이동
- 게시글 CRUD: `/api/posts` (POST/GET/PUT/DELETE)
- 보드 API: `/api/boards`, 그리드 보장: `/api/boards/grid/:x/:y/ensure`

## 프로젝트 구조 (요약)
- `pages/`
	- `map.js` — MapLibre 기반 지도(모드 전환 포함)
	- `rasterMap2.js` — 호환 리디렉트(`/map`)
	- `board.js` — 보드 페이지 (게시글 조회·작성·수정·삭제)
	- `admin.js` — 간단 관리자 페이지(클라이언트 사이드 게이트)
	- `api/boards.js`, `api/posts.js`, `api/boards/grid/[gridX]/[gridY]/ensure.js`
- `lib/db.js` — `pg` Pool 전역 캐시(서버리스 친화적)
- `migrations/neon_init.sql` — Postgres 스키마(boards, posts, 트리거 등)
- `public/` — 정적 파일(랜딩 `index.html`, `icon.png`)

## 환경 변수
- `DATABASE_URL` — Postgres 연결 문자열 (예: `postgresql://user:pass@host:5432/dbname?sslmode=require`)
- (선택) `ADMIN_PASSWORD` — 관리용 비밀번호(권장: 서버사이드로 관리)

예: psql 사용 예 (PowerShell)
```powershell
# psql이 설치된 환경에서
psql "${env:DATABASE_URL}" -f migrations/neon_init.sql
```

## 핵심 API 요약
- `GET /api/boards` — 보드 목록
- `GET /api/boards?id=<id>` — 단일 보드
- `GET /api/boards?grid_x=<x>&grid_y=<y>` — 그리드 보드
- `POST /api/boards` — 보드 생성
- `POST /api/boards/grid/:x/:y/ensure` — 그리드 보장

- `GET /api/posts?board_id=<id>` — 게시글 목록
- `POST /api/posts` — 게시글 생성 (비밀번호는 서버에서 해시)
- `PUT /api/posts` — 게시글 수정
- `DELETE /api/posts?id=<id>` — 게시글 삭제(비밀번호 검증)

## 지도 / 클라이언트 노트
- 맵 모드: `osm`(OSM 래스터), `sat`(예: Esri 래스터), `globe`(MapLibre globe 스타일)
- 선택된 모드는 로컬스토리지 키 `rasterMap2-state`에 저장됩니다(키 변경 시 클라이언트 전역 수정 필요).
- 보드 오버레이(heatmap-like)는 API의 `posts_count` 값을 기반으로 색상을 보간해 반투명으로 표시합니다.

## 주의 및 권장 작업
- 타일 제공자(OSM, Esri 등)의 이용약관과 저작권 표기를 지켜야 합니다. 페이지에 attribution을 표시하세요.
- 배포 전에 `migrations/neon_init.sql`을 적용하고 API가 정상 동작하는지 검증하세요.
- (선택) 로컬스토리지 키를 `map-state`로 변경하려면 클라이언트 코드 경

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
	- 브라우저에 위치를 저장하여 유지되게
- 게시판 정보 안나옴
	- 
