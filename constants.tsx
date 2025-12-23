
import { Trade } from './types';

const now = new Date();

// Helper to get dates relative to today with specific times
const getDatedTimestamp = (daysAgo: number, hour: number, minute: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

// Temporal helpers for INITIAL_TRADES
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const t1Date = getDatedTimestamp(2, 9, 30);
const d1 = new Date(t1Date);
const t2Date = getDatedTimestamp(15, 14, 0);
const d2 = new Date(t2Date);

export const INITIAL_TRADES: Trade[] = [
  {
    id: '1',
    symbol: 'NVDA',
    type: 'LONG',
    entryPrice: 125.50,
    exitPrice: 132.20,
    quantity: 100,
    entryDate: t1Date,
    exitDate: getDatedTimestamp(2, 11, 45),
    entryTimestamp: t1Date,
    exitTimestamp: getDatedTimestamp(2, 11, 45),
    holdingDuration: "02:15",
    holdingCategory: "INTRADAY",
    session: "New York",
    // Added missing temporal properties
    dayOfWeek: DAYS[d1.getDay()],
    weekOfMonth: Math.ceil(d1.getDate() / 7),
    month: MONTHS[d1.getMonth()],
    pnl: 670,
    status: 'WIN',
    setup: 'Breakout',
    notes: 'Clean daily breakout with high volume support.',
    tags: ['Tech', 'Momentum', 'High Conviction'],
    mistakes: [],
    preTradeMindset: 'Patient & Calculated',
    duringTradeMindset: 'Calm and observing levels',
    postTradeMindset: 'Satisfied with execution',
    riskReasoning: 'Strong daily trend, 1:3 RR targeted.',
    riskUsedPct: 1,
    rrPlanned: 3,
    rrAchieved: 2.6,
    marketCondition: 'Bullish Trending',
    mentalState: 'Focused',
    stressLevel: 3,
    disciplineRating: 10,
    isPlanned: true
  },
  {
    id: '2',
    symbol: 'TSLA',
    type: 'SHORT',
    entryPrice: 180.20,
    exitPrice: 185.50,
    quantity: 50,
    entryDate: t2Date,
    exitDate: getDatedTimestamp(15, 14, 15),
    entryTimestamp: t2Date,
    exitTimestamp: getDatedTimestamp(15, 14, 15),
    holdingDuration: "00:15",
    holdingCategory: "SCALPING",
    session: "New York",
    // Added missing temporal properties
    dayOfWeek: DAYS[d2.getDay()],
    weekOfMonth: Math.ceil(d2.getDate() / 7),
    month: MONTHS[d2.getMonth()],
    pnl: -265,
    status: 'LOSS',
    setup: 'VWAP Rejection',
    notes: 'Failed to break VWAP, but reversed quickly on macro news.',
    tags: ['Mean Reversion', 'Stop Loss Hit'],
    mistakes: ['Chasing Price'],
    preTradeMindset: 'Rushed / Fear of Missing Out',
    duringTradeMindset: 'Anxious, staring at P&L',
    postTradeMindset: 'Frustrated, revenge trade urge',
    riskReasoning: 'Chasing a breakdown that already moved.',
    riskUsedPct: 0.5,
    rrPlanned: 2,
    rrAchieved: -1,
    marketCondition: 'Volatile',
    mentalState: 'Anxious',
    stressLevel: 7,
    disciplineRating: 4,
    isPlanned: false
  }
];

export const SETUPS = ['Breakout', 'VWAP Rejection', 'Dip Buy', 'Mean Reversion', 'Trend Follow', 'Scalp'];
export const MISTAKES = ['Chasing Price', 'No Stop Loss Plan', 'FOMO', 'Early Exit', 'Too Large Size', 'Overtrading'];
export const SENTIMENT_OPTIONS = ['Focused', 'Calm', 'Anxious', 'Aggressive', 'Patient', 'Hesitant', 'Confident', 'Bored'];
