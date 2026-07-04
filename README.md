# MatGourmand

MatGourmand 프로젝트를 위한 모노레포입니다.

## 구조

- `backend/`: Spring Boot API
- `ai/`: FastAPI AI 서비스
- `web/`: React 웹 앱
- `mobile/`: Flutter 모바일 앱
- `docs/`: 프로젝트 및 아키텍처 문서
- `.github/`: GitHub 워크플로우 및 템플릿

## 참고

- Git history와 remote 설정은 저장소 루트에 유지합니다.
- 기존 Spring Boot 프로젝트는 `backend/`로 이동했습니다.

## 작업 방식

- 작업자별 작업에는 기능 기준 브랜치를 사용합니다.
- 가능하면 한 브랜치에는 한 기능만 담습니다.
- 같은 사용자 기능이라면 하나의 브랜치에 `backend/`와 `web/` 변경이 함께 들어가도 괜찮습니다.
- 같은 기능 브랜치 안에서도 커밋은 작게 나누는 것을 권장합니다.
- 커밋 메시지는 한글로 작성합니다.
- 커밋 전에는 메시지를 먼저 공유하고 검수를 받은 뒤 커밋합니다.
- 필요하면 `feat(백엔드): ...`, `feat(웹): ...`처럼 영역 기준으로 커밋 메시지를 구분합니다.
- 관련 없는 변경이 섞이지 않도록 `git add backend`, `git add web`처럼 경로 기준으로 stage 합니다.

## 작업 문서

- 백엔드 작업 규칙은 [backend/WORK_RULES.md](C:/Users/USER-PC/Desktop/MatGourmand/backend/WORK_RULES.md)를 참고합니다.

## 브랜치 예시

- `feature/login`
- `feature/store-onboarding`
- `feature/reservation-flow`
