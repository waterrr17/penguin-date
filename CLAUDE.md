# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Penguin Date / 펭귄팅

친구들을 위한 비공개 소개팅 웹사이트 프로젝트입니다.

## Naming

- 한글 서비스명: 펭귄팅
- 영어 서비스명: Penguin Date
- 프로젝트명 / repository name: penguin-date
- 화면에 노출되는 기본 서비스명은 "펭귄팅"을 사용합니다.
- 코드, 폴더명, 패키지명에서는 영어 기준으로 `penguin-date` 또는 `penguinDate`를 사용합니다.

## Product Concept

- 친구들이 서로를 소개해주는 가벼운 비공개 소개팅 서비스입니다.
- 대규모 공개 데이팅 앱이 아니라, 제한된 친구 그룹 안에서 사용하는 웹사이트입니다.
- 분위기는 귀엽고 친근하지만 너무 유치하지 않게 유지합니다.
- 펭귄 캐릭터를 메인 브랜드 모티프로 사용합니다.

## UI Tone

- 모바일 우선 UI로 만듭니다.
- 색상은 너무 강한 원색보다 부드럽고 산뜻한 색을 사용합니다.
- 귀여운 느낌을 가져가면서 깔끔한 톤을 유지합니다.

## Commands

```bash
npm run dev       # 로컬 개발 서버 (localhost:3000)
npm run build     # 프로덕션 빌드 (out/ 에 정적 파일 생성)
npm run lint      # ESLint 검사
npm run deploy    # GitHub Pages 배포 (빌드 후 gh-pages -d out)
```

## Tech Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS (소프트한 색상 팔레트 기반)
- `output: 'export'` 설정으로 GitHub Pages에 정적 배포
- 백엔드: Supabase (PostgreSQL 기반 BaaS) — `@supabase/supabase-js` 사용
- 공통 UI는 `src/components` 아래에 둡니다.
- 페이지 라우팅은 `src/app/` (App Router) 기준으로 합니다.

## Coding Rules

- 새 기능을 만들 때는 먼저 관련 파일 구조를 확인합니다.
- 기존 스타일과 네이밍을 우선 따릅니다.
- 불필요하게 큰 리팩터링은 하지 않습니다.
- 파일을 수정한 뒤에는 어떤 파일을 왜 수정했는지 요약합니다.
- 임시 테스트 코드나 콘솔 로그는 남기지 않습니다.
- 기능 개발을 한 후에는 새로 개발된 기능을 README에 추가합니다.

## Documentation

- 기획 문서는 `docs/`에 둡니다.
- 디자인 참고 자료는 `design/`에 둡니다.
- README에는 실행 방법, 개발 환경, 주요 기능을 정리합니다.
