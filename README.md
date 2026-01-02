# MaplibreBoard (Self-Hosted)

## 📝 프로젝트 요약
Next.js(Pages Router + API Routes) 기반의 인터랙티브 지도 게시판입니다. **MapLibre GL**을 사용하여 그리드 단위로 보드를 시각화하며, **Prisma ORM**을 통해 **Neon/PostgreSQL**에 데이터를 저장합니다. Vercel 배포 환경에서 벗어나 로컬 리눅스 서버와 Nginx 환경에서 안정적으로 구동되도록 최적화되었습니다.

## 🌐 배포 및 접속 정보
- **배포 주소:** [https://pyeong.p-e.kr](https://pyeong.p-e.kr)
- **운영 환경:** Ubuntu (Linux) / Nginx (Reverse Proxy) / Node.js v24
- **프로세스 관리:** PM2 (무중단 운영)

---

## 🚀 빠른 시작 (Local/Server Setup)

### 1. 환경 변수 설정 (.env)
프로젝트 루트 폴더에 `.env` 파일을 생성하고 아래 형식에 맞춰 실제 정보를 입력합니다.
**주의: .env 파일은 절대로 Git에 업로드하지 마세요.**

    DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]/neondb?sslmode=require"
    NEXT_PUBLIC_MAPLIBRE_API_KEY="YOUR_API_KEY_HERE"

### 2. 의존성 설치 및 데이터베이스 설정
터미널에서 아래 명령어를 순서대로 입력합니다.

    # 패키지 설치
    npm install

    # Prisma 설정
    npx prisma db pull
    npx prisma generate

### 3. 빌드 및 서버 실행 (PM2 권장)
서버를 백그라운드에서 상시 가동하기 위한 설정입니다.

    # 프로젝트 빌드
    npm run build

    # PM2 실행
    pm2 start npm --name "map-board" -- start

    # 서버 재부팅 시 자동 실행 저장
    pm2 save
    pm2 startup

---

## 🛠 핵심 기능

### 🗺️ 인터랙티브 지도 (MapLibre GL JS)
- **모드 전환:** OSM(기본), Satellite(위성), Globe(지구본) 뷰 지원
- **상태 유지:** 사용자의 마지막 위치를 localStorage에 저장하여 재접속 시 복원
- **그리드 오버레이:** 게시물 수에 따른 히트맵 스타일 시각화 (Blue ↔ Red)

### 🎯 그리드 보드 및 게시글
- **자동 보드 생성:** 지도 클릭 시 해당 좌표에 보드가 없으면 즉시 생성 및 이동
- **게시글 CRUD:**
  - 비밀번호 기반의 수정/삭제 권한 검증 (SHA-256 해싱 적용)
  - Ctrl + Enter 단축키를 이용한 빠른 게시글 등록
- **접근성:** 보드 ID 또는 그리드 좌표(X, Y)를 통한 유연한 페이지 접속

---

## 🏗 시스템 아키텍처



- **Reverse Proxy:** Nginx가 80(HTTP) 요청을 443(HTTPS)으로 리다이렉트하고, 내부 3000번 포트의 Next.js로 트래픽을 전달합니다.
- **Database:** Neon Serverless PostgreSQL (Prisma ORM 연결)
- **SSL:** Certbot (Let's Encrypt)을 통한 HTTPS 보안 적용

---

## 📂 프로젝트 구조
    MaplibreBoardVervel/
    ├── prisma/            # DB 모델 및 설정
    ├── pages/
    │   ├── api/           # API 엔드포인트
    │   ├── map.js         # 지도 인터페이스
    │   └── board.js       # 게시판 페이지
    ├── lib/               # DB 연결 라이브러리
    ├── public/            # 정적 자산
    └── next.config.js     # Next.js 설정

---

## 🚨 확인된 이슈 및 향후 계획 (TODO)
- [ ] 0,0 좌표 보정: 특정 좌표 클릭 시 비정상 이동 문제 디버깅
- [ ] 검색 기능 강화: 지명 검색을 통한 위치 이동(flyTo) 기능 도입
- [ ] 인증 고도화: 하드코딩된 비밀번호 방식을 서버사이드 JWT 인증으로 교체

---

## 📄 라이선스 및 참고
- Map Library: MapLibre GL JS
- Map Tiles: OpenStreetMap, Esri World Imagery
