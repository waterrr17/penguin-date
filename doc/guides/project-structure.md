# 🐧 Penguin Date — 프로젝트 구조 가이드

## 폴더 구조

```
penguin-date/
├── src/                        # 리액트 소스코드
│   ├── components/             # 재사용 컴포넌트
│   │   ├── common/             # 공통 UI (버튼, 입력창, 카드 등)
│   │   ├── profile/            # 프로필 관련 컴포넌트
│   │   ├── match/              # 매칭 관련 컴포넌트
│   │   └── admin/              # 주선자(관리자) 전용 컴포넌트
│   ├── pages/                  # 라우팅 페이지 컴포넌트
│   ├── hooks/                  # 커스텀 React Hooks
│   ├── utils/                  # 유틸리티 함수
│   ├── assets/                 # 이미지, 아이콘 등 정적 파일
│   ├── styles/                 # 전역 CSS / 테마
│   ├── context/                # React Context (전역 상태)
│   └── types/                  # TypeScript 타입 정의
├── design/                     # 디자인 작업물
│   ├── wireframes/             # 와이어프레임 (Figma 링크 or 이미지)
│   ├── assets/                 # 디자인 원본 파일
│   └── mockups/                # 목업 이미지
├── doc/                        # 문서
│   ├── api/                    # API 명세 (DB 연동 시)
│   └── guides/                 # 개발 가이드 (이 파일 포함)
└── public/                     # CRA public 폴더 (index.html 등)
```

## 주요 페이지 계획

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 홈 | `/` | 서비스 소개, 신청 버튼 |
| 프로필 등록 | `/register` | 친구가 자기 정보 입력 |
| 매칭 현황 | `/matches` | 주선자가 매칭 결과 확인 |
| 관리자 | `/admin` | 주선자 전용 대시보드 |

## 배포 (GitHub Pages)

```bash
npm install
npm run deploy
```

`package.json`의 `homepage` 필드에 본인 GitHub 주소를 맞게 수정하세요.
