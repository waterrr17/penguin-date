import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-noto-sans-kr)', 'sans-serif'],
        display: ['var(--font-do-hyeon)', 'sans-serif'],
      },
      colors: {
        // 브랜드 포인트 컬러 (#AAC4F5 기반 페리윙클 블루)
        peri: {
          50: '#F4F8FE',
          100: '#E3ECFC',
          200: '#C8DAF9',
          300: '#AAC4F5',
          400: '#7FA3EE',
          500: '#5B84E4',
          600: '#4169D2',
        },
      },
    },
  },
  plugins: [],
}

export default config
