import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/contexts/**/*.{js,ts,jsx,tsx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
    './src/utils/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {},
  plugins: [],
}
export default config