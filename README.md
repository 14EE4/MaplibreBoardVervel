MaplibreTest - README

이 프로젝트는 **Spring Boot**, **MyBatis**, **Lombok**, **Thymeleaf**를 사용하여 개발되었습니다.

This project is a Spring Boot (Java 17) web app that serves several MapLibre map pages and allows users to add location-based notes (popups) that can be shared between users by storing them in a MySQL database.

This README focuses on the MySQL setup and how to run and test the application locally.

1) Prerequisites
- Java 17 JDK
- Gradle (the project uses the included Gradle wrapper `gradlew.bat`)
- MySQL server (local or reachable from the application)
- Optional: curl for testing endpoints

2) Database setup

**이 프로젝트는 아래와 같은 데이터베이스 정보를 사용합니다:**
- DB 이름: `maplibretest`
- DB 사용자: `maptest`
- DB 비밀번호: `maptest`

`src/main/resources/application.yml` 예시:
```yaml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://127.0.0.1:3306/maplibretest?serverTimezone=Asia/Seoul&CharacterEncoding=UTF-8
    username: maptest
    password: maptest
```

MySQL에서 아래 SQL로 데이터베이스와 계정을 생성하세요:
```sql
CREATE DATABASE IF NOT EXISTS maplibretest
  CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'maptest'@'localhost' IDENTIFIED BY 'maptest';
GRANT ALL PRIVILEGES ON maplibretest.* TO 'maptest'@'localhost';
FLUSH PRIVILEGES;
```

테이블 생성은 `create_table_notes.sql` 파일을 참고하세요.

3) 실행 방법
- `./gradlew.bat bootRun` 명령어로 서버를 실행합니다.
- 브라우저에서 [http://localhost:8080](http://localhost:8080) 접속

4) 주요 파일
- `src/main/resources/application.yml` : DB 및 서버 설정
- `src/main/resources/mapper/note-mapper.xml` : MyBatis 매퍼
- `src/main/resources/mybatis-config.xml` : MyBatis 설정
- `src/main/resources/templates/` : 템플릿 파일

5) 참고
- 포트는 기본적으로 8080번을 사용합니다.
- DB 계정 및 비밀번호는 필요에 따라 변경 가능합니다.

6) How the sharing works
- Notes added from the map (save) are posted to `/api/notes` and persist to MySQL.
- When a user loads the `/map` page the client requests `/api/notes` to display stored notes. Other users will see saved notes when they load or refresh the page.

7) Optional improvements (recommended)
- Real-time sync: implement polling, SSE, or WebSocket to push new notes to connected clients without a page refresh.
- Authentication/authorization: add user accounts and associate notes with users if you need ownership or write access control.
- Server-side validation: validate coordinates and content length before saving.
- Pagination / viewport-based queries: if many notes exist, avoid loading all notes on each page load.

8) Troubleshooting
- DB connection errors: check `application.yml` config and that MySQL is running and reachable from the app machine / container. Check MySQL server logs and Spring Boot startup logs for the exact JDBC error.
- MyBatis mapper errors: ensure `src/main/resources/mapper/note-mapper.xml` exists and the namespace matches repository SQL calls (namespace `Note` with ids `getAll` and `save`).
- External resources blocked: map tiles and maplibre assets are fetched from public CDNs; if you're behind a proxy/firewall, they may be blocked.

If you'd like, I can also:
- Add polling or SSE so notes appear in real-time to all connected users.
- Add edit/delete endpoints and UI for notes.
- Configure local hosting of MapLibre JS/CSS if you need to avoid CDN dependencies.