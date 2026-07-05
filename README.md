# 펭귄팅 (Penguin Date) 🐧

친구들이 서로를 소개해주는 비공개 소개팅 웹사이트입니다.

## 실행 방법

```bash
npm install
npm run dev       # 로컬 개발 서버 (localhost:3000)
npm run build     # 프로덕션 빌드 (out/ 에 정적 파일 생성)
npm run lint      # ESLint 검사
npm run deploy    # GitHub Pages 배포 (빌드 후 gh-pages -d out)
```

배포 주소: https://waterrr17.github.io/penguin-date

## 개발 환경

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS
- Supabase (PostgreSQL BaaS) — `@supabase/supabase-js`
- `output: 'export'` 정적 빌드로 GitHub Pages 배포

## 주요 기능

- **홈** (`/`) — 서비스 소개와 등록 / 둘러보기 진입점
- **프로필 등록** (`/register`) — 이름, 출생연도, 성별, 키, 직업, 주선자(드롭다운 선택), 관계, 자기소개를 입력해 Supabase에 저장
- **프로필 둘러보기** (`/browse`) — 등록된 전체 프로필 목록. 성별 / 나이대 필터 제공. 카드에 "○○년생(○○세)"와 주선자 이름 표시. DB 미연결 시 샘플 프로필 표시
- **프로필 상세** (`/profile?id=...`) — 목록에서 프로필 카드를 누르면 사진, 출생연도(나이), 키, 직업, 주선자·관계, 자기소개 전문, 등록일까지 모든 정보를 보여줍니다. 정적 배포 환경이라 동적 라우트 대신 쿼리 파라미터를 사용합니다
- **주선자 관리** — 주선자는 `matchmakers` 테이블로 관리(주선자 1 : 프로필 N). 앱에서는 조회만 가능하며, 주선자 추가는 Supabase 대시보드 > Table Editor에서 합니다

## Supabase 설정

1. [supabase.com](https://supabase.com)에서 무료 프로젝트를 생성합니다.
2. 대시보드 > **SQL Editor**에서 `docs/supabase-schema.sql` 내용을 실행해 `matchmakers`, `profiles` 테이블을 만듭니다.
3. 대시보드 > **Table Editor**에서 `matchmakers` 테이블에 주선자 이름을 추가합니다.
4. 대시보드 > **Settings > API**에서 Project URL과 anon key를 확인합니다.
5. `.env.local.example`을 `.env.local`로 복사하고 값을 채웁니다:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> 정적 빌드 시 env 값이 번들에 포함되므로, 배포(`npm run deploy`) 전에 `.env.local`이 설정되어 있어야 배포본에서도 DB가 동작합니다. env가 없으면 샘플 데이터 모드로 동작합니다.

## 폴더 구조

```
src/
  app/          # 페이지 라우팅 (App Router)
  components/   # 공통 UI 컴포넌트
  config/       # 프로필 사진 등 설정
  data/         # 샘플 데이터
  lib/          # Supabase 클라이언트, 경로 헬퍼
  types/        # 공용 타입
docs/           # 기획 문서, DB 스키마
design/         # 디자인 참고 자료
```
