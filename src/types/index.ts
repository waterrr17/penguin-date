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
  matchmakerId: string | null;
  matchmakerName: string; // matchmakers 테이블 조인 결과
  relationship: string;
  bio: string;
  photoUrl: string | null;
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
