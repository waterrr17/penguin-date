# DB 추천 — Penguin Date

GitHub Pages는 **정적 호스팅**이라 서버를 직접 올릴 수 없어요.
그래서 DB는 **BaaS(Backend-as-a-Service)** 중 하나를 골라야 해요.

---

## ✅ 추천: Supabase (1순위)

**왜 Supabase인가?**
- PostgreSQL 기반 → 관계형 DB라 매칭 데이터 구조에 딱 맞음
- 무료 플랜: 500MB DB + 인증 + API 모두 포함
- Row Level Security(RLS)로 "본인 데이터만 보기" 구현 가능
- 대시보드가 직관적 → 주선자가 직접 데이터 볼 수도 있음
- React SDK 지원 (`@supabase/supabase-js`)

**적합한 이유:**
소개팅 서비스는 users ↔ matches 같은 **관계형 구조**가 자연스럽고,
Supabase는 이런 JOIN 쿼리를 코드 없이도 처리할 수 있어요.

---

## Firebase Firestore (2순위)

- Google 운영, 안정적
- NoSQL → 스키마 없이 빠르게 시작 가능
- 무료 플랜 넉넉함
- 단점: 관계형 데이터(매칭 로직)를 직접 구현해야 해서 코드가 복잡해질 수 있음

---

## 비교 요약

| 항목 | Supabase | Firebase |
|------|----------|----------|
| DB 종류 | PostgreSQL (관계형) | NoSQL (문서형) |
| 무료 플랜 | 500MB | 1GB |
| 인증 | ✅ 내장 | ✅ 내장 |
| 매칭 로직 구현 | 쉬움 (JOIN) | 직접 구현 필요 |
| 대시보드 | 직관적 | 복잡한 편 |
| 추천도 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 시작하는 법 (Supabase)

```bash
npm install @supabase/supabase-js
```

```ts
// src/utils/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
```

환경변수는 `.env` 파일에 저장하고, `.gitignore`에 꼭 추가하세요!
