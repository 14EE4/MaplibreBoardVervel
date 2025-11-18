MaplibreTest - README

이 프로젝트는 Spring Boot + MyBatis + Lombok + Thymeleaf 기반의 웹 애플리케이션으로, 여러 MapLibre 지도를 제공하고 지도에서 위치 기반 메모(노트)를 추가/수정/삭제하여 MySQL에 저장할 수 있습니다.

주요 변경 사항
- `rasterMap.html`에 `map.html`과 동일한 노트(메모) 기능 추가
  - 지도 클릭으로 입력 팝업(경도/위도 표시, 텍스트 입력, 저장/취소)
  - 저장 시 `/api/notes`로 POST하여 DB에 저장, 팝업이 읽기 전용으로 전환
  - 기존 노트는 `/api/notes` GET으로 로드하여 팝업으로 표시
  - 노트 수정 지원: 읽기 팝업에서 "수정" 버튼으로 편집 팝업을 열어 PUT으로 업데이트
  - 노트 삭제 지원: 읽기 팝업의 "삭제" 버튼으로 DELETE /api/notes/{id} 호출하여 삭제
  - 10초 주기 폴링(poll)으로 새 노트가 있으면 자동으로 표시

사전 준비
- Java 17 JDK
- Gradle wrapper (`gradlew.bat`) — 프로젝트에 포함됨
- MySQL 서버 (로컬 또는 접근 가능한 DB 서버)
- (선택) curl 등 HTTP 테스트 도구

데이터베이스 설정 예시
- DB 이름: `maplibretest`
- DB 사용자: `maptest`
- DB 비밀번호: `maptest`

`src/main/resources/application.yml` 예시:
```yaml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://127.0.0.1:3306/maplibretest?serverTimezone=Asia/Seoul&characterEncoding=UTF-8
    username: maptest
    password: maptest
```

MySQL에서 DB/계정 생성(예):
```sql
CREATE DATABASE IF NOT EXISTS maplibretest CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'maptest'@'localhost' IDENTIFIED BY 'maptest';
GRANT ALL PRIVILEGES ON maplibretest.* TO 'maptest'@'localhost';
FLUSH PRIVILEGES;
```
테이블 스키마는 `create_table_notes.sql`을 참고하세요.

서버 실행 방법
- 프로젝트 루트에서 (Windows cmd):
```cmd
cd /d "C:\Users\user\Documents\workspace\MaplibreTest"
gradlew.bat bootRun
```
- 기본 포트는 8080입니다. 포트 충돌이 있을 경우 `--args="--server.port=8081"` 같은 방식으로 다른 포트로 실행할 수 있습니다.

주요 엔드포인트
- GET `/api/notes` : 모든 노트 조회 (클라이언트에서 로드/폴링에 사용)
- POST `/api/notes` : 새로운 노트 저장 (payload: { lng, lat, content })
- PUT `/api/notes` : 기존 노트 수정 (payload: { id, lng, lat, content })
- DELETE `/api/notes/{id}` : 기존 노트 삭제 (경로 변수로 id 전달)

rasterMap/map 동작(사용자 관점)
1. 브라우저에서 `/rasterMap` 또는 `/map` 접속
2. 지도 클릭 → 입력 팝업이 열림 → 메모 입력 → 저장(서버에 POST) → 읽기 팝업으로 전환
3. 저장된 노트는 다른 클라이언트가 페이지를 새로 고치거나 폴링에 의해 10초 이내로 표시
4. 읽기 팝업의 "수정" 버튼을 누르면 편집 팝업이 열리고 저장하면 PUT으로 업데이트
5. 읽기 팝업의 "삭제" 버튼을 누르면 확인창 이후 DELETE 요청이 호출되어 노트가 삭제되고 팝업이 제거됨

간단한 API 테스트 예시 (cmd)
- GET:
```cmd
curl http://localhost:8080/api/notes
```
- POST 예시:
```cmd
curl -H "Content-Type: application/json" -d "{\"lng\":127.0246,\"lat\":37.5326,\"content\":\"테스트 노트\"}" http://localhost:8080/api/notes
```
- PUT 예시 (id가 4인 노트 수정):
```cmd
curl -H "Content-Type: application/json" -X PUT -d "{\"id\":4,\"lng\":127.0246,\"lat\":37.5326,\"content\":\"수정된 내용\"}" http://localhost:8080/api/notes
```
- DELETE 예시 (id가 4인 노트 삭제):
```cmd
curl -X DELETE http://localhost:8080/api/notes/4
```
(포트가 8081로 실행한 경우 위에서 8080을 8081로 변경)

문제 해결(자주 발생하는 이슈)
- 지도가 보이지 않을 때
  - 브라우저 콘솔(F12) 확인: `maplibregl is not defined`, CSS/JS 404, 또는 자바스크립트 파싱 오류 등이 있는지 확인
  - CDN 차단(회사 네트워크 등)일 경우 MapLibre JS/CSS를 로컬로 내려받아 프로젝트의 정적 리소스로 서빙하도록 변경
- 서버가 포트 8080/8081에 실패할 경우: 포트가 이미 사용 중인지 확인하고 해당 프로세스를 중지하거나 다른 포트로 실행

추가로 할 수 있는 개선
- 실시간 동기화: 폴링 대신 WebSocket 또는 Server-Sent Events(SSE)로 노트 동기화
- 인증/권한: 사용자 계정과 노트 소유권 연동
- UI 개선: 삭제 시 로딩 표시, 삭제 취소(undo) 기능, 최대 문자열 길이 등

TODO
- rastermap2에 지역별 게시판 
- 게시판 활동량만큼 지도에 표시(글/시간)
- 시간당 게시판의 글의 최대->빨강
- 나머지는 적을수록 파란색으로
- 0이면 검정
- 지도를 격자로 나눈 후 클릭시 해당 격자 타일의 게시판을 새 탭으로 열기


게시판 db구조(maplibretest db 사용)
- ~~지역별 게시판을 미리 생성~~
- 게시판 목록 테이블
- ~~게시판 테이블 형식 생성 sql문으로 게시판 진입시 테이블 생성 후 게시판 목록 테이블에 추가~~
- ~~게시판 테이블 이름은 지역 이름으로 동적 생성~~
- 격자 형식으로 쪼갠 후 게시판 테이블을 미리 생성
- 활동량을 격자 사각형 위에 색(활동량(TODO))을 반투명으로 입힘


변경 완료: README를 갱신하여 삭제 API 및 UI 사용법을 추가했습니다. (git 관련 명령은 요청에 따라 수행하지 않았습니다.)

## 프로젝트 업데이트(요약)

아래는 이 저장소에 적용한 주요 변경 사항의 한국어 요약입니다.

- 지도에서 5도 격자를 표시하고, 사용자가 격자를 클릭하면 해당 격자용 게시판을 생성하거나(없을 경우) 기존 게시판을 반환하도록 구현했습니다.
- 각 격자에 대해 필요 시 `posts_grid_{x}_{y}` 형식의 테이블을 동적으로 생성합니다.
- 게시글은 해당 격자의 테이블로 저장/조회되도록 저장 로직을 라우팅했습니다.
- `boards` 테이블에 `posts_count`를 유지하여 지도 위에서 게시글 수에 따라 색으로 시각화할 수 있게 했습니다.
- 게시판 UI 개선: 작성 폼을 목록 위로 이동시키고, Ctrl+Enter 단축키로 빠르게 작성할 수 있도록 했습니다.
- 게시글 비밀번호 보호: 작성 시 4자리 PIN(선택)을 입력하면 서버에서 SHA-256 해시로 저장하고, 수정/삭제는 해당 PIN으로만 가능하도록 구현했습니다.
- 수정(편집) UI는 클라이언트에서 비밀번호를 입력한 뒤 서버 검증이 통과해야 편집 폼을 보여주도록 변경했습니다(편집/삭제 시 서버에서 다시 비밀번호 검증을 수행함).
- 템플릿의 Thymeleaf 인라인 파싱 문제와 Gradle toolchain 관련 빌드 문제를 완화하여 로컬 환경에서 빌드가 가능하도록 수정했습니다.

### 향후 권장 작업

- 서버측 PIN 형식 검증(숫자 4자리 강제) 추가
- 기존에 생성된 `posts_grid_*` 테이블에 `password` 컬럼이 누락된 경우를 위한 ALTER TABLE 마이그레이션 스크립트 추가
- 비밀번호 저장 방식 개선(단순 SHA-256 대신 salt+bcrypt/argon2 권장)
- 장기 운영 환경에서는 다수의 동적 테이블 대신 단일 `posts` 테이블에 `grid_x/grid_y` 컬럼을 두는 설계가 더 관리하기 쉽습니다.

필요하시면 위 권장 작업들 중 우선순위에 따라 바로 적용해 드리겠습니다.

---

## Next.js 마이그레이션 안내 (간단한 시작 가이드)

이 저장소를 Vercel에 올리기 위해 Spring Boot를 Next.js로 단계적으로 마이그레이션하는 최소 스캐폴드를 함께 추가했습니다 (프론트엔드와 API 라우트 포함).

빠른 시작:

1. Node(또는 npm)가 설치되어 있는지 확인하세요.

2. 의존성 설치 및 개발 서버 실행:

```powershell
npm install
npm run dev
```

3. 브라우저에서 http://localhost:3000 에 접속하면 간단한 보드 리스트와 API 연동 예시를 확인할 수 있습니다.

API 설명(임시, 인메모리 저장소):
- `GET /api/boards` : 게시판 목록 조회
- `POST /api/boards` : 게시판 생성 (body: { name })
- `GET /api/notes` : 노트 목록 조회
- `POST /api/notes` : 노트 생성 (body: { lng, lat, content })
- `PUT /api/notes` : 노트 수정 (body: { id, lng, lat, content })
- `DELETE /api/notes?id=ID` : 노트 삭제

주의: 현재 API는 데모용으로 서버 메모리에 저장하는 방식입니다. 실제 DB 연동(예: Supabase, PlanetScale, Cloud SQL)을 원하시면 DB 모듈과 환경변수를 추가해 드리겠습니다.

Vercel 배포:
- 이 프로젝트는 Next.js 표준 프로젝트 구조를 따르고 있어 Vercel에 연결하면 자동으로 빌드/배포됩니다.
- Vercel에서 환경변수(예: DB 연결 문자열)를 설정하려면 프로젝트 설정 > Environment Variables에서 추가하세요.

추가 지원이 필요하면 어떤 범위로(프론트만 정적화 / 전체 API + DB 연동 / 외부 DB 연동) 진행할지 알려주세요. 바로 이어서 필요한 파일을 완성하고 로컬 검증을 도와드리겠습니다.