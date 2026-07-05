export const adjectives = [
  "느긋한",
  "다정한",
  "열정적인",
  "수줍은",
  "호기심 많은",
  "조용한",
  "운이 좋은",
  "행복한",
  "귀여운",
  "카리스마",
  "도시의",
  "야생의",
  "야행성",
  "마이 웨이",
  "트렌디한",
  "수상한",
  "낭만적인",
  "미래에서 온",
  "이른바",
  "당신의",
];

export const nouns = [
  "사람",
  "남자친구",
  "여자친구",
  "여행광",
  "영화광",
  "요리사",
  "댄서",
  "파이터",
  "닌자",
  "탐험가",
  "AI",
  "장발",
  "단발머리",
  "마스터",
  "리더",
  "영혼",
  "유령",
  "마법사",
  "먹보",
  "수다쟁이",
  "킹",
  "퀸",
  "프린스",
  "프린세스",
  "고양이",
  "강아지",
  "토끼",
  "곰",
  "여우",
  "공룡",
];

export const ALL_NICKNAMES: string[] = adjectives.flatMap((adj) =>
  nouns.map((noun) => `${adj} ${noun}`),
);

export function generateNickname(): string {
  return ALL_NICKNAMES[Math.floor(Math.random() * ALL_NICKNAMES.length)];
}
