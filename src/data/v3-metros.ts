export type Signal = 'STRONG BUY' | 'HOT' | 'BUY' | 'WATCH' | 'CAUTION'

export type Metro = {
  metro: string
  state: string
  cap: number
  coc: number
  yoy: number
  dom: number
  price: number // median price, thousands
  signal: Signal
  spark: number[]
}

export const METROS: Metro[] = [
  {
    metro: 'Memphis',
    state: 'TN',
    cap: 11.8,
    coc: 14.2,
    yoy: 4.3,
    dom: 18,
    price: 178,
    signal: 'STRONG BUY',
    spark: [6.8, 7.2, 8.1, 9.0, 9.8, 10.4, 11.2, 11.8],
  },
  {
    metro: 'Indianapolis',
    state: 'IN',
    cap: 9.4,
    coc: 10.8,
    yoy: 2.1,
    dom: 24,
    price: 220,
    signal: 'BUY',
    spark: [7.1, 7.4, 7.9, 8.2, 8.6, 9.0, 9.2, 9.4],
  },
  {
    metro: 'Tampa',
    state: 'FL',
    cap: 8.7,
    coc: 9.2,
    yoy: 5.8,
    dom: 15,
    price: 340,
    signal: 'HOT',
    spark: [5.2, 5.8, 6.4, 7.0, 7.6, 8.0, 8.4, 8.7],
  },
  {
    metro: 'Charlotte',
    state: 'NC',
    cap: 7.9,
    coc: 8.4,
    yoy: 1.8,
    dom: 28,
    price: 295,
    signal: 'BUY',
    spark: [6.4, 6.6, 6.9, 7.0, 7.2, 7.5, 7.7, 7.9],
  },
  {
    metro: 'Kansas City',
    state: 'MO',
    cap: 10.2,
    coc: 11.4,
    yoy: 3.6,
    dom: 21,
    price: 195,
    signal: 'STRONG BUY',
    spark: [7.8, 8.2, 8.8, 9.1, 9.4, 9.8, 10.0, 10.2],
  },
  {
    metro: 'Jacksonville',
    state: 'FL',
    cap: 8.1,
    coc: 8.9,
    yoy: 3.2,
    dom: 22,
    price: 265,
    signal: 'BUY',
    spark: [6.2, 6.5, 6.8, 7.1, 7.4, 7.7, 7.9, 8.1],
  },
  {
    metro: 'Cleveland',
    state: 'OH',
    cap: 9.8,
    coc: 10.6,
    yoy: -0.4,
    dom: 31,
    price: 158,
    signal: 'BUY',
    spark: [9.0, 9.4, 9.8, 9.6, 9.3, 9.5, 9.7, 9.8],
  },
  {
    metro: 'Detroit',
    state: 'MI',
    cap: 11.4,
    coc: 12.8,
    yoy: 1.2,
    dom: 26,
    price: 142,
    signal: 'STRONG BUY',
    spark: [9.2, 9.8, 10.2, 10.6, 10.9, 11.0, 11.2, 11.4],
  },
]

export const SIGNAL_LEGEND: {
  signal: Signal
  color: string
  description: string
}[] = [
  { signal: 'STRONG BUY', color: '#10B981', description: 'Cap ≥ 10% · rent growth positive · inventory tight' },
  { signal: 'HOT', color: '#34D399', description: 'Fast-moving · strong momentum · DOM under 25 days' },
  { signal: 'BUY', color: '#3B82F6', description: 'Solid fundamentals · cash flow positive · steady demand' },
  { signal: 'WATCH', color: '#F59E0B', description: 'Mixed signals · evaluate by submarket' },
  { signal: 'CAUTION', color: '#EF4444', description: 'Compressed cap rates · inventory building · rent flat or falling' },
]
