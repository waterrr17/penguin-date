// 주선자 (matchmakers 테이블). 주선자 1 : 프로필 N
export interface Matchmaker {
  id: string;
  name: string;
}

// 등록 폼 / DB(profiles 테이블)와 일치하는 프로필 타입
export interface Profile {
  id: string;
  name: string;
  birthYear: number;
  gender: 'male' | 'female';
  height: number | null;
  job: string;
  mbti: string;
  residence: string;
  drinking: string; // 좋아해요 | 보통 | 싫어해요
  smoking: string; // 흡연자 | 비흡연자
  religion: string; // 개신교 | 가톨릭 | 불교 | 그 외 종교 | 무교
  idealBirthYearMin: number | null;
  idealBirthYearMax: number | null;
  idealHeightMin: number | null;
  idealHeightMax: number | null;
  idealAppearance: string; // 두부상 | 아랍상 | 고양이상 | 강아지상 | 토끼상 | 곰상 | 공룡상 | 직접 입력값
  idealMustHave: string; // 포기할 수 없는 한 가지
  matchmakerId: string | null;
  matchmakerName: string; // matchmakers 테이블 조인 결과
  relationship: string;
  bio: string;
  photoUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

// 사용자 프로필 타입
export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  bio: string;
  interests: string[];
  photoUrl?: string;
  contactInfo: {
    kakaoId?: string;
    instagram?: string;
  };
  createdAt: Date;
  isMatched: boolean;
}

// 매칭 타입
export interface Match {
  id: string;
  userAId: string;
  userBId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  matchedAt?: Date;
}

// 관심사 카테고리
export type InterestCategory =
  | '영화/드라마'
  | '음악'
  | '스포츠'
  | '독서'
  | '여행'
  | '요리'
  | '게임'
  | '반려동물'
  | '아웃도어'
  | '카페/맛집';
