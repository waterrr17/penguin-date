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
