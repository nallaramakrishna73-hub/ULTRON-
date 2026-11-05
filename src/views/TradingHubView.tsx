import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart2,
  BookOpen,
  Calculator,
  Shield,
  HelpCircle,
  Plus,
  Clock,
} from 'lucide-react';
import { MarketTicker } from '../types';

interface TradingHubViewProps {
  tickers: MarketTicker[];
}

export const TradingHubView: React.FC<TradingHubViewProps> = ({ tickers }) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');
  const [activeTab, setActiveTab] = useState<'chart' | 'smc' | 'calculator' | 'journal'>('chart');

  // Risk Calculator State
  const [accountBalance, setAccountBalance] = useState<number>(10000);
  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const [entryPrice, setEntryPrice] = useState<number>(108300);
  const [stopLossPrice, setStopLossPrice] = useState<number>(107500);

  // Paper Trading Journal
  const [trades, setTrades] = useState<{
    id: string;
    symbol: string;
    side: 'LONG' | 'SHORT';
    entry: number;
    exit: number;
    pnl: number;
    notes: string;
    date: string;
  }[]>([
    {
      id: '1',
      symbol: 'BTCUSDT',
      side: 'LONG',
      entry: 106800,
      exit: 108200,
      pnl: 1400,
      notes: 'Bullish 4H FVG mitigation followed by MSS on 15m timeframe.',
      date: '2026-11-04',
    },
    {
      id: '2',
      symbol: 'ETHUSDT',
      side: 'SHORT',
      entry: 3910,
      exit: 3840,
      pnl: 350,
      notes: 'Bearish liquidity sweep above Asian Highs and aggressive displacement.',
      date: '2026-11-03',
    },
  ]);

  const activeTicker = tickers.find((t) => t.symbol === selectedSymbol) || tickers[0];

  // Risk Calculations
  const riskAmount = (accountBalance * riskPercent) / 100;
  const slDistance = Math.abs(entryPrice - stopLossPrice);
  const calculatedPositionSize = slDistance > 0 ? (riskAmount / slDistance).toFixed(4) : '0';

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      {/* Top Header */}
      <div className="p-4 rounded-2xl glass-panel flex flex-col md:flex-row items-center justify-between gap-4 border border-indigo-900/40">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-600/30 border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="font-orbitron font-bold text-xl text-white">
              TRADING HUB & MARKET RESEARCH
            </h1>
            <p className="text-xs font-rajdhani text-slate-300">
              Institutional order flow, Smart Money Concepts (SMC), paper trading, and risk management calculator
            </p>
          </div>
        </div>

        {/* Ticker Selector Pills */}
        <div className="flex items-center gap-2">
          {tickers.map((t) => (
            <button
              key={t.symbol}
              onClick={() => setSelectedSymbol(t.symbol)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                selectedSymbol === t.symbol
                  ? 'bg-purple-600/40 border-purple-400 text-cyan-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                  : 'bg-black/40 border-indigo-950 text-slate-400 hover:text-white'
              }`}
            >
              <div className="font-bold">{t.symbol}</div>
              <div className="text-[10px] text-emerald-400">${t.price.toLocaleString()}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-indigo-950 pb-2">
        <button
          onClick={() => setActiveTab('chart')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
            activeTab === 'chart'
              ? 'bg-cyan-600/30 border border-cyan-400 text-cyan-200'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Market Chart & Indicators
        </button>
        <button
          onClick={() => setActiveTab('smc')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
            activeTab === 'smc'
              ? 'bg-purple-600/30 border border-purple-400 text-purple-200'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Smart Money Concepts (SMC) AI Explainer
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
            activeTab === 'calculator'
              ? 'bg-indigo-600/30 border border-indigo-400 text-indigo-200'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Risk Calculator
        </button>
        <button
          onClick={() => setActiveTab('journal')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
            activeTab === 'journal'
              ? 'bg-emerald-600/30 border border-emerald-400 text-emerald-200'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Paper Trading Journal ({trades.length})
        </button>
      </div>

      {/* View Content */}
      {activeTab === 'chart' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Chart Canvas */}
          <div className="lg:col-span-8 rounded-2xl glass-panel p-4 border border-indigo-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-orbitron font-bold text-lg text-white">
                  {activeTicker.symbol} • Perpetual Futures
                </span>
                <span className="text-xs font-mono text-emerald-400 ml-2">
                  ${activeTicker.price.toLocaleString()} (+{activeTicker.change24h}%)
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-900 text-cyan-400">15M</span>
                <span className="px-2 py-0.5 rounded bg-slate-900">1H</span>
                <span className="px-2 py-0.5 rounded bg-slate-900">4H</span>
                <span className="px-2 py-0.5 rounded bg-slate-900">1D</span>
              </div>
            </div>

            {/* Simulated Interactive Candlestick / Area SVG Graph */}
            <div className="h-72 w-full bg-slate-950/80 rounded-xl border border-indigo-950 p-4 relative overflow-hidden flex flex-col justify-between">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 p-4">
                <div className="border-b border-indigo-500 w-full" />
                <div className="border-b border-indigo-500 w-full" />
                <div className="border-b border-indigo-500 w-full" />
                <div className="border-b border-indigo-500 w-full" />
              </div>

              {/* Price Candlesticks simulation */}
              <div className="relative z-10 flex items-end justify-between h-48 px-4">
                {[
                  { o: 60, c: 75, h: 80, l: 55, up: true },
                  { o: 75, c: 70, h: 78, l: 65, up: false },
                  { o: 70, c: 85, h: 90, l: 68, up: true },
                  { o: 85, c: 82, h: 88, l: 78, up: false },
                  { o: 82, c: 98, h: 105, l: 80, up: true },
                  { o: 98, c: 92, h: 100, l: 88, up: false },
                  { o: 92, c: 110, h: 115, l: 90, up: true },
                  { o: 110, c: 125, h: 130, l: 108, up: true },
                  { o: 125, c: 120, h: 128, l: 115, up: false },
                  { o: 120, c: 138, h: 145, l: 118, up: true },
                  { o: 138, c: 132, h: 140, l: 128, up: false },
                  { o: 132, c: 150, h: 155, l: 130, up: true },
                ].map((candle, idx) => (
                  <div key={idx} className="flex flex-col items-center group relative cursor-crosshair">
                    {/* Wick */}
                    <div
                      className={`w-[1.5px] ${candle.up ? 'bg-emerald-400' : 'bg-rose-400'}`}
                      style={{ height: `${candle.h - candle.l}px` }}
                    />
                    {/* Body */}
                    <div
                      className={`w-3 rounded-xs ${
                        candle.up ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-rose-500'
                      }`}
                      style={{ height: `${Math.abs(candle.c - candle.o) * 1.5}px` }}
                    />
                  </div>
                ))}
              </div>

              {/* FVG Highlight Box */}
              <div className="absolute top-24 left-1/3 w-36 h-10 border border-dashed border-cyan-400 bg-cyan-500/10 rounded flex items-center justify-center text-[10px] font-mono text-cyan-300 pointer-events-none">
                Bullish FVG (4H Target)
              </div>

              {/* Bottom Time Axis */}
              <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-indigo-950">
                <span>12:00</span>
                <span>15:00</span>
                <span>18:00</span>
                <span>21:00</span>
                <span>CURRENT</span>
              </div>
            </div>

            {/* Technical Indicators Summary */}
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-black/40 border border-indigo-950">
                <span className="text-slate-400 text-[10px]">RSI (14): </span>
                <span className="text-emerald-400 font-bold">58.4 (Neutral/Bullish)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-indigo-950">
                <span className="text-slate-400 text-[10px]">EMA (20/50/200): </span>
                <span className="text-cyan-400 font-bold">Golden Cross on 4H</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-indigo-950">
                <span className="text-slate-400 text-[10px]">MACD: </span>
                <span className="text-purple-400 font-bold">+128.4 Bullish Divergence</span>
              </div>
            </div>
          </div>

          {/* Right: Market Sentiment & Liquidity */}
          <div className="lg:col-span-4 rounded-2xl glass-panel p-4 border border-indigo-900/40 space-y-4">
            <h3 className="font-orbitron font-bold text-xs text-white">
              Institutional Order Flow Monitor
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-indigo-950">
                <span className="text-slate-400">Buy Volume (24h)</span>
                <span className="text-emerald-400 font-bold">$1.42B (54%)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-indigo-950">
                <span className="text-slate-400">Sell Volume (24h)</span>
                <span className="text-rose-400 font-bold">$1.21B (46%)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-indigo-950">
                <span className="text-slate-400">Open Interest</span>
                <span className="text-cyan-300 font-bold">$4.89B (+3.2%)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-indigo-950">
                <span className="text-slate-400">Funding Rate</span>
                <span className="text-yellow-300 font-bold">+0.0100% (Neutral)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs font-rajdhani text-purple-200">
              <strong>ULTRON Market Brief:</strong> Strong liquidity buildup observed above $109,200 swing high. Smart money footprint indicates accumulation before potential expansion. Paper trading recommended.
            </div>
          </div>
        </div>
      )}

      {/* SMC Explainer Tab */}
      {activeTab === 'smc' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl glass-panel border border-cyan-500/30 space-y-2">
            <h3 className="font-orbitron font-bold text-sm text-cyan-300">
              FVG (Fair Value Gap)
            </h3>
            <p className="text-xs font-rajdhani text-slate-300 leading-relaxed">
              A 3-candle price imbalance created when aggressive institutional buying or selling occurs. The wick of candle 1 does not overlap the wick of candle 3, leaving an unfilled price void that price frequently returns to mitigate.
            </p>
          </div>

          <div className="p-4 rounded-2xl glass-panel border border-purple-500/30 space-y-2">
            <h3 className="font-orbitron font-bold text-sm text-purple-300">
              BOS (Break of Structure)
            </h3>
            <p className="text-xs font-rajdhani text-slate-300 leading-relaxed">
              Occurs when the current trend continues by convincingly closing a candle body beyond a previous significant swing high (in an uptrend) or swing low (in a downtrend), validating institutional momentum.
            </p>
          </div>

          <div className="p-4 rounded-2xl glass-panel border border-emerald-500/30 space-y-2">
            <h3 className="font-orbitron font-bold text-sm text-emerald-300">
              MSS (Market Structure Shift)
            </h3>
            <p className="text-xs font-rajdhani text-slate-300 leading-relaxed">
              The earliest signal of a trend reversal. Occurs when price sweeps liquidity at a key level and violently displaces through the opposing swing point, creating an unmitigated FVG in the direction of the new trend.
            </p>
          </div>

          <div className="p-4 rounded-2xl glass-panel border border-indigo-500/30 space-y-2">
            <h3 className="font-orbitron font-bold text-sm text-indigo-300">
              Liquidity Pools (BSL / SSL)
            </h3>
            <p className="text-xs font-rajdhani text-slate-300 leading-relaxed">
              Buy-Side Liquidity (resting above equal highs / swing highs) and Sell-Side Liquidity (resting below equal lows). Institutional algorithms target these stop-loss clusters to fill their large block orders.
            </p>
          </div>

          <div className="p-4 rounded-2xl glass-panel border border-amber-500/30 space-y-2">
            <h3 className="font-orbitron font-bold text-sm text-amber-300">
              Order Blocks (OB)
            </h3>
            <p className="text-xs font-rajdhani text-slate-300 leading-relaxed">
              The last opposing candle prior to a rapid impulsive displacement that broke structure. Represents institutional sponsored orders where large players engineered liquidity.
            </p>
          </div>

          <div className="p-4 rounded-2xl glass-panel border border-rose-500/30 space-y-2">
            <h3 className="font-orbitron font-bold text-sm text-rose-300">
              Risk-to-Reward (RRR)
            </h3>
            <p className="text-xs font-rajdhani text-slate-300 leading-relaxed">
              The fundamental foundation of long-term trader profitability. High-probability setups demand at least a 1:3 or 1:4 RRR so a 40% win rate produces solid equity growth.
            </p>
          </div>
        </div>
      )}

      {/* Risk Calculator Tab */}
      {activeTab === 'calculator' && (
        <div className="max-w-xl mx-auto rounded-2xl glass-panel p-6 border border-indigo-900/40 space-y-4">
          <h2 className="font-orbitron font-bold text-base text-white text-center">
            Position Sizing & Risk Management Calculator
          </h2>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-slate-300 block mb-1">Account Balance ($ USD):</label>
              <input
                type="number"
                value={accountBalance}
                onChange={(e) => setAccountBalance(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-indigo-800/40 text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Risk Percentage Per Trade (%):</label>
              <input
                type="number"
                step="0.1"
                value={riskPercent}
                onChange={(e) => setRiskPercent(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-indigo-800/40 text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 block mb-1">Entry Price ($):</label>
                <input
                  type="number"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-indigo-800/40 text-cyan-300 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Stop Loss Price ($):</label>
                <input
                  type="number"
                  value={stopLossPrice}
                  onChange={(e) => setStopLossPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-indigo-800/40 text-rose-300 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 space-y-2 font-mono text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Max Dollar Risk at Stop Loss:</span>
              <span className="text-rose-400 font-bold">${riskAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Calculated Position Size:</span>
              <span className="text-cyan-300 font-bold">{calculatedPositionSize} units</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Notional Trade Value:</span>
              <span className="text-white font-bold">
                ${(Number(calculatedPositionSize) * entryPrice).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Paper Trading Journal */}
      {activeTab === 'journal' && (
        <div className="rounded-2xl glass-panel p-4 border border-indigo-900/40 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-indigo-950">
            <span className="font-orbitron font-bold text-sm text-white">
              Paper Trading Performance Record
            </span>
            <span className="text-xs font-mono text-emerald-400">
              Net Paper P&L: +$1,750.00
            </span>
          </div>

          <div className="space-y-2">
            {trades.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-indigo-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 font-mono text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded font-bold ${
                      t.side === 'LONG' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                    }`}
                  >
                    {t.side}
                  </span>
                  <span className="text-white font-bold">{t.symbol}</span>
                  <span className="text-slate-400">
                    Entry: ${t.entry} → Exit: ${t.exit}
                  </span>
                </div>
                <div className="text-slate-300 text-[11px] font-rajdhani">{t.notes}</div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold">+${t.pnl}</span>
                  <span className="text-[10px] text-slate-500">{t.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
