// 출생연도 기반 나이 (연 나이: 올해 − 출생연도)
export const ageFromBirthYear = (birthYear: number) =>
  new Date().getFullYear() - birthYear

// '1998' → '98년생'
export const birthYearLabel = (birthYear: number) =>
  `${String(birthYear).slice(-2)}년생`
