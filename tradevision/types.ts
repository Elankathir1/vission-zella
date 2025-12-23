
export type TradeType = 'LONG' | 'SHORT';
export type TradeStatus = 'WIN' | 'LOSS' | 'BREAKEVEN';
export type AccountType = 'PROP' | 'PERSONAL' | 'IRA';
export type PropAccountStage = 'PAPER' | 'EVALUATION' | 'LIVE' | 'QUALIFIED' | 'OTHER';
export type PlanStatus = 'WATCHING' | 'READY' | 'TRIGGERED' | 'CANCELLED';
export type DrawdownType = 'EQUITY' | 'BALANCE' | 'TRAILING' | 'STATIC';
export type HoldingCategory = 'SCALPING' | 'INTRADAY' | 'SWING' | 'LONG-TERM';

export interface SessionTime {
  start: string;
  end: string;
}

export interface SessionConfig {
  Asian: SessionTime;
  London: SessionTime;
  NewYork: SessionTime;
}

export interface TradePlan {
  id: string;
  symbol: string;
  type: TradeType;
  triggerPrice: number;
  stopLoss: number;
  takeProfit: number;
  plannedRisk: number; 
  logic: string;
  ifScenario: string;
  thenScenario: string;
  status: PlanStatus;
  setup: string;
  createdAt: string;
  tags: string[];
}

export interface Trade {
  id: string;
  symbol: string;
  type: TradeType;
  entryPrice: number;
  exitPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  quantity: number;
  entryDate: string; 
  exitDate: string;  
  pnl: number;
  status: TradeStatus;
  setup: string;
  notes: string;
  tags: string[];
  mistakes?: string[];
  accountId?: string;
  propAccountStage?: PropAccountStage;
  
  // Temporal & Session Data
  entryTimestamp: string; 
  exitTimestamp: string;  
  holdingDuration: string; 
  holdingCategory: HoldingCategory;
  session: string; 
  dayOfWeek: string;
  weekOfMonth: number;
  month: string;
  
  // Psychology & Discipline Lifecycle
  preTradeMindset: string;    
  duringTradeMindset: string; 
  postTradeMindset: string;   
  riskReasoning: string;      
  
  // Advanced Risk Metrics
  riskUsedPct?: number;       
  riskUsedAmt?: number;       
  rrPlanned?: number;         
  rrAchieved?: number;        
  marketCondition?: string;   
  entryReason?: string;
  exitReason?: string;
  screenshotLink?: string;

  mentalState: string;        
  stressLevel: number;        
  disciplineRating: number;   
  isPlanned: boolean;
  tradeSequenceNum?: number; 
  
  maxPriceDuringTrade?: number; 
  minPriceDuringTrade?: number; 
}

export interface TemporalStats {
  winRate: number;
  lossRate: number;
  totalPnl: number;
  avgRR: number;
  tradeCount: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  broker: string;
  maxTradesPerDay?: number;   
  maxLossPerDay?: number;     
  dailyDrawdownLimit?: number; 
  overallDrawdownLimit?: number;
  drawdownType?: DrawdownType;
  profitTarget?: number;
  maxLots?: number;
  maxTradingDays?: number;
}

export interface PerformanceStats {
  totalTrades: number;
  winRate: number;
  totalPnl: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  sharpeRatio: number;
  expectancy: number;
  maxDrawdown: number;
  avgHoldTime: string;
  avgRMultiple: number;
}

export interface AIInsight {
  title: string;
  content: string;
  type: 'positive' | 'negative' | 'neutral';
}

export interface ChartDataPoint {
  date: string;
  equity: number;
  pnl: number;
  drawdown: number;
  discipline?: number;
}

export interface SetupStats {
  name: string;
  trades: number;
  winRate: number;
  pnl: number;
}
