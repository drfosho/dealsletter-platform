import type { Signal } from './v3-metros'

export type Strategy = 'BRRRR' | 'Fix & Flip' | 'Buy & Hold' | 'House Hack'
export type PipelineStatus = 'Watching' | 'Reviewing' | 'Saved' | 'Strong Buy' | 'Passed'

export type Deal = {
  id: string
  address: string
  city: string
  state: string
  strategy: Strategy
  beds: number
  baths: number
  sqft: number
  cap: number | null
  coc: number | null
  cashFlow: number | null
  price: number
  arv: number | null
  signal: Signal
  status: PipelineStatus
  addedDate: string // e.g. "Apr 12"
  scoutReason?: string
}

export const NEW_MATCHES: Deal[] = [
  {
    id: 'new-1',
    address: '2847 Magnolia Ave',
    city: 'Memphis',
    state: 'TN',
    strategy: 'BRRRR',
    beds: 3,
    baths: 2,
    sqft: 1420,
    cap: 11.8,
    coc: 14.2,
    cashFlow: 842,
    price: 178000,
    arv: 265000,
    signal: 'STRONG BUY',
    status: 'Strong Buy',
    addedDate: 'Today',
    scoutReason:
      'Post-refi cash flow $842/mo at 75% LTV refi. Submarket trending 4.3% YoY rent growth.',
  },
  {
    id: 'new-2',
    address: '1290 N Prospect Rd',
    city: 'Indianapolis',
    state: 'IN',
    strategy: 'Buy & Hold',
    beds: 4,
    baths: 2,
    sqft: 1680,
    cap: 9.4,
    coc: 10.8,
    cashFlow: 612,
    price: 220000,
    arv: 248000,
    signal: 'BUY',
    status: 'Reviewing',
    addedDate: 'Today',
    scoutReason:
      'Stable Class B neighborhood. Rent comps support $1,650/mo. 24-day avg DOM in zip.',
  },
  {
    id: 'new-3',
    address: '3104 Clearwater Blvd',
    city: 'Tampa',
    state: 'FL',
    strategy: 'BRRRR',
    beds: 3,
    baths: 2,
    sqft: 1290,
    cap: 10.1,
    coc: 12.4,
    cashFlow: 710,
    price: 285000,
    arv: 365000,
    signal: 'STRONG BUY',
    status: 'Strong Buy',
    addedDate: 'Today',
    scoutReason:
      'ARV spread $80K above list. HOT metro signal. Rehab estimate $42K for full value-add.',
  },
]

export const PIPELINE: Deal[] = [
  {
    id: 'p-1',
    address: '412 Birch St',
    city: 'Kansas City',
    state: 'MO',
    strategy: 'BRRRR',
    beds: 3,
    baths: 2,
    sqft: 1340,
    cap: 10.2,
    coc: 11.4,
    cashFlow: 890,
    price: 198000,
    arv: 272000,
    signal: 'STRONG BUY',
    status: 'Reviewing',
    addedDate: 'Apr 12',
  },
  {
    id: 'p-2',
    address: '891 Lake Ave',
    city: 'Memphis',
    state: 'TN',
    strategy: 'Buy & Hold',
    beds: 3,
    baths: 2,
    sqft: 1510,
    cap: 9.8,
    coc: 10.6,
    cashFlow: 720,
    price: 165000,
    arv: 205000,
    signal: 'BUY',
    status: 'Watching',
    addedDate: 'Apr 10',
  },
  {
    id: 'p-3',
    address: '2201 Elm Dr',
    city: 'Charlotte',
    state: 'NC',
    strategy: 'Fix & Flip',
    beds: 4,
    baths: 3,
    sqft: 2140,
    cap: null,
    coc: null,
    cashFlow: null,
    price: 312000,
    arv: 455000,
    signal: 'BUY',
    status: 'Reviewing',
    addedDate: 'Apr 8',
  },
  {
    id: 'p-4',
    address: '55 Orchard Ln',
    city: 'Tampa',
    state: 'FL',
    strategy: 'BRRRR',
    beds: 3,
    baths: 2,
    sqft: 1380,
    cap: 8.9,
    coc: 9.7,
    cashFlow: 580,
    price: 278000,
    arv: 348000,
    signal: 'BUY',
    status: 'Watching',
    addedDate: 'Apr 5',
  },
  {
    id: 'p-5',
    address: '1100 Riverside',
    city: 'Jacksonville',
    state: 'FL',
    strategy: 'Buy & Hold',
    beds: 3,
    baths: 1.5,
    sqft: 1210,
    cap: 8.1,
    coc: 8.9,
    cashFlow: 490,
    price: 255000,
    arv: 290000,
    signal: 'WATCH',
    status: 'Watching',
    addedDate: 'Apr 3',
  },
  {
    id: 'p-6',
    address: '2847 Magnolia Ave',
    city: 'Memphis',
    state: 'TN',
    strategy: 'BRRRR',
    beds: 3,
    baths: 2,
    sqft: 1420,
    cap: 11.8,
    coc: 14.2,
    cashFlow: 842,
    price: 178000,
    arv: 265000,
    signal: 'STRONG BUY',
    status: 'Strong Buy',
    addedDate: 'Today',
  },
  {
    id: 'p-7',
    address: '3104 Clearwater Blvd',
    city: 'Tampa',
    state: 'FL',
    strategy: 'BRRRR',
    beds: 3,
    baths: 2,
    sqft: 1290,
    cap: 10.1,
    coc: 12.4,
    cashFlow: 710,
    price: 285000,
    arv: 365000,
    signal: 'STRONG BUY',
    status: 'Strong Buy',
    addedDate: 'Today',
  },
]
