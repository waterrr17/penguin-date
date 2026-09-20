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

- **홈** (`/`) — 서비스 소개와 등록 / 둘러보기 진입점 (빙산 모양 버튼)
- **프로필 등록** (`/register`) — 맨 위에서 **내 펭귄**을 직접 꾸미고(프로필 사진 대체), 이름·출생연도·성별·키·직업·주선자(드롭다운 선택)·관계·자기소개를 입력해 Supabase에 저장
- **프로필 둘러보기** (`/browse`) — 네모 카드 목록 대신 **내 펭귄들이 화면을 돌아다니는 화면**입니다. 펭귄 머리 위에는 닉네임만 작게 표시되고, 펭귄을 터치하면 말풍선으로 프로필 요약(년생·키·직업·MBTI, 한마디, 주선자)이 뜹니다. 말풍선 아래 "상세보기" 버튼으로 상세 페이지에 갑니다. 전체 / 남성 / 여성 필터 제공. 비활성(쉬는 중) 프로필은 돌아다니지 않고 왼쪽 아래 구석에서 💤을 띄운 채 자고 있으며, 인원 수에서는 빠집니다. DB 미연결 시 샘플 프로필 표시
- **프로필 상세** (`/profile?id=...`) — 말풍선의 "상세보기"를 누르면 펭귄, 출생연도(나이), 키, 직업, 주선자·관계, 자기소개 전문, 등록일까지 모든 정보를 보여줍니다. 정적 배포 환경이라 동적 라우트 대신 쿼리 파라미터를 사용합니다
- **프로필 수정/삭제/비활성화** — 등록 시 숫자 4자리 비밀번호를 설정하고, 상세 페이지의 수정하기/비활성화/삭제하기 버튼에서 비밀번호 확인 후 실행합니다. 비밀번호 검증은 Supabase RPC 함수(서버)에서 수행하며, 비활성화된 프로필은 둘러보기에서 흑백으로 표시됩니다. 삭제는 확인 경고를 한 번 더 거칩니다
- **주선자 관리** — 주선자는 `matchmakers` 테이블로 관리(주선자 1 : 프로필 N). 앱에서는 조회만 가능하며, 주선자 추가는 Supabase 대시보드 > Table Editor에서 합니다
- **매칭 현황 관리** (`/admin` "매칭 현황" 탭) — 서로 관심을 보내 성사된 매칭을 관리자 화면에서 확인합니다. 양쪽 펭귄과 각자의 주선자 이름이 함께 보이고, 관리자가 오프라인(카톡 등)으로 연락처를 전달한 뒤 "연결 완료로 표시"를 누르면 상태가 바뀝니다. 앱이 직접 연락처를 주고받지는 않습니다. 아직 주선자 개별 로그인이 없어 기존 관리자 비밀번호로 대신 확인합니다
- **펭귄 아바타 꾸미기** (`/avatar`) — 32×32 도트(픽셀 아트) 펭귄을 몸 색 8 / 모자 3 / 안경 3 / 목 3 / 소품 7 레이어로 겹쳐 꾸밉니다. 썸네일은 이름 없이 펭귄 모습만 보여주고, '없음'은 ✕ 표식으로 구분합니다. 옵션을 고르면 미리보기에 바로 반영되고, "랜덤" 버튼으로 무작위 조합을 만들 수 있습니다. 고른 조합은 `localStorage('penguin-look')`에 저장되어 새로고침해도 유지됩니다. 같은 커스터마이저를 등록 화면에서도 그대로 써서 프로필용 펭귄을 고릅니다. 홈 화면에 링크는 없고 주소로 직접 들어갑니다
- **펭귄이 프로필 사진을 대체** — 프로필 사진(동물 이미지) 대신 각자의 펭귄이 목록·상세·말풍선에 쓰입니다. 아직 펭귄을 고르지 않은 기존 프로필은 **프로필 id로 항상 같은 펭귄이 자동 배정**됩니다(`src/lib/profileLook.ts`)

### 펭귄 아바타 에셋

- 에셋 경로/네이밍: `public/avatar/{카테고리}-{이름}.svg` (예: `hat-beanie.svg`)
- 모두 같은 32×32 그리드 위에 그린 투명 배경 SVG로, 1픽셀 = `<rect>` 1개 + `shape-rendering="crispEdges"` 입니다
- 겹치는 순서(아래→위): `body` → `neck` → `glasses` → `hat` → `item`
- 소품 좌표는 몸 기준으로 정렬되어 있습니다 — 눈 `x12,13`·`x18,19` (`y9~10`), 부리 `x14~17` (`y11~12`), 목 `y14`, 바닥 `y30`. 새 에셋을 추가할 때 이 기준을 맞추면 겹쳐도 어긋나지 않습니다
- 옵션 목록은 `src/config/penguinLook.ts`의 `CATEGORIES`에 등록합니다 (`label`은 화면에 안 보이고 스크린 리더용으로만 씁니다)
- 표시 전용 컴포넌트 `<PenguinAvatar look={look} size={240} />`는 다른 화면에서도 재사용할 수 있습니다

## Supabase 설정

1. [supabase.com](https://supabase.com)에서 무료 프로젝트를 생성합니다.
2. 대시보드 > **SQL Editor**에서 `docs/supabase-schema.sql` 내용을 실행해 `matchmakers`, `profiles` 테이블을 만듭니다.
   - 이미 이전 버전 스키마로 운영 중이라면, 테이블을 다시 만드는 대신 `docs/supabase-migration-penguin-look.sql`을 한 번 실행해 `penguin_look` 컬럼을 추가하세요.
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
  config/       # 펭귄 아바타 옵션 등 설정
  data/         # 샘플 데이터
  lib/          # Supabase 클라이언트, 경로 헬퍼
  types/        # 공용 타입
docs/           # 기획 문서, DB 스키마
design/         # 디자인 참고 자료
```
