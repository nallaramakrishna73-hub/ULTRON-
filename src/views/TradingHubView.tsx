import React, { useState, useEffect } from 'react';
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
  RefreshCw,
} from 'lucide-react';
import { MarketTicker } from '../types';

interface TradingHubViewProps {
  tickers: MarketTicker[];
}

interface RealKline {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const TradingHubView: React.FC<TradingHubViewProps> = ({ tickers }) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');
  const [activeTab, setActiveTab] = useState<'chart' | 'smc' | 'calculator' | 'journal'>('chart');
  const [klines, setKlines] = useState<RealKline[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState<boolean>(false);

  // Risk Calculator State
  const [accountBalance, setAccountBalance] = useState<number>(10000);
  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const [entryPrice, setEntryPrice] = useState<number>(92000);
  const [stopLossPrice, setStopLossPrice] = useState<number>(91200);

  // Paper Trading Orders from SQLite
  const [trades, setTrades] = useState<any[]>([]);
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderNotes, setOrderNotes] = useState('');

  const activeTicker = tickers.find((t) => t.symbol === selectedSymbol) || tickers[0] || {
    symbol: 'BTCUSDT',
    name: 'Bitcoin',
    price: 92450,
    change24h: 2.14,
  };

  const fetchKlines = async (symbol: string) => {
    setIsLoadingChart(true);
    try {
      const res = await fetch(`/api/trading/klines?symbol=${symbol}&interval=1h&limit=24`);
      if (res.ok) {
        const data = await res.json();
        setKlines(data);
      }
    } catch (e) {
      console.error('Failed to load klines:', e);
    } finally {
      setIsLoadingChart(false);
    }
  };

  const fetchTrades = async () => {
    try {
      const res = await fetch('/api/trading/orders');
      if (res.ok) {
        const data = await res.json();
        setTrades(data);
      }
    } catch {}
  };

  useEffect(() => {
    fetchKlines(selectedSymbol);
    setEntryPrice(activeTicker.price);
    setStopLossPrice(Math.round(activeTicker.price * 0.985));
  }, [selectedSymbol]);

  useEffect(() => {
    fetchTrades();
  }, []);

  const handlePlaceOrder = async () => {
    try {
      const res = await fetch('/api/trading/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedSymbol,
          side: orderSide,
          entryPrice: activeTicker.price,
          notes: orderNotes || `SMC 1H confirmation setup on ${selectedSymbol}`,
        }),
      });
      if (res.ok) {
        setOrderNotes('');
        fetchTrades();
        alert(`Order Placed: ${orderSide} ${selectedSymbol} @ $${activeTicker.price}`);
      }
    } catch (e: any) {
      alert(`Order error: ${e.message}`);
    }
  };

  // Risk Calculations
  const riskAmount = (accountBalance * riskPercent) / 100;
  const slDistance = Math.abs(entryPrice - stopLossPrice);
  const calculatedPositionSize = slDistance > 0 ? (riskAmount / slDistance).toFixed(4) : '0';

  // SVG Chart Scaling
  const maxPrice = klines.length > 0 ? Math.max(...klines.map(k => k.high)) : 100000;
  const minPrice = klines.length > 0 ? Math.min(...klines.map(k => k.low)) : 90000;
  const priceRange = Math.max(1, maxPrice - minPrice);

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
              Live Binance feeds, Smart Money Concepts (SMC), paper trading, and institutional liquidity tracking
            </p>
          </div>
        </div>

        {/* Ticker Selector Pills */}
        <div className="flex items-center gap-2 flex-wrap">
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
      <div className="flex items-center gap-2 border-b border-indigo-950 pb-2 flex-wrap">
        <button
          onClick={() => setActiveTab('chart')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
            activeTab === 'chart'
              ? 'bg-cyan-600/30 border border-cyan-400 text-cyan-200'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Live K-Line Chart & Indicators
        </button>
        <button
          onClick={() => setActiveTab('smc')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
            activeTab === 'smc'
              ? 'bg-purple-600/30 border border-purple-400 text-purple-200'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Smart Money Concepts (SMC) AI
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
          Paper Trades ({trades.length})
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
                  {activeTicker.symbol}
                </span>
                <span className="text-xs font-mono text-emerald-400 ml-2">
                  ${activeTicker.price.toLocaleString()} ({activeTicker.change24h >= 0 ? '+' : ''}{activeTicker.change24h}%)
                </span>
              </div>
              <button
                onClick={() => fetchKlines(selectedSymbol)}
                className="p-1.5 rounded bg-slate-900 text-cyan-400 hover:text-cyan-200"
                title="Refresh Candles"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingChart ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Real Candlestick Chart */}
            <div className="h-72 w-full bg-slate-950/80 rounded-xl border border-indigo-950 p-4 relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10 flex items-end justify-between h-48 px-2 gap-1">
                {klines.map((candle, idx) => {
                  const isUp = candle.close >= candle.open;
                  const bodyHeight = Math.max(3, (Math.abs(candle.close - candle.open) / priceRange) * 160);
                  const wickHeight = Math.max(5, ((candle.high - candle.low) / priceRange) * 160);

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-crosshair">
                      <div
                        className={`w-[1px] ${isUp ? 'bg-emerald-400' : 'bg-rose-400'}`}
                        style={{ height: `${wickHeight}px` }}
                      />
                      <div
                        className={`w-full max-w-[12px] rounded-xs ${
                          isUp ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
                        }`}
                        style={{ height: `${bodyHeight}px` }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* FVG Highlight Box */}
              <div className="absolute top-20 left-1/3 w-40 h-8 border border-dashed border-cyan-400 bg-cyan-500/10 rounded flex items-center justify-center text-[10px] font-mono text-cyan-300 pointer-events-none">
                Bullish FVG (Institutional Target)
              </div>

              {/* Bottom Time Axis */}
              <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-indigo-950">
                <span>24h Ago</span>
                <span>12h Ago</span>
                <span>6h Ago</span>
                <span>Current Price: ${activeTicker.price.toLocaleString()}</span>
              </div>
            </div>

            {/* Quick Order Execution Panel */}
            <div className="p-3.5 rounded-xl bg-black/60 border border-indigo-900/40 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOrderSide('BUY')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold ${
                    orderSide === 'BUY' ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  BUY / LONG
                </button>
                <button
                  onClick={() => setOrderSide('SELL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold ${
                    orderSide === 'SELL' ? 'bg-rose-600 text-white shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  SELL / SHORT
                </button>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Strategy notes (e.g. 15m BOS)"
                  className="px-2.5 py-1 rounded bg-black border border-indigo-950 text-xs font-mono text-white w-48"
                />
              </div>

              <button
                onClick={handlePlaceOrder}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 font-orbitron font-bold text-xs text-white"
              >
                EXECUTE PAPER ORDER
              </button>
            </div>
          </div>

          {/* Right: Market Sentiment & Liquidity */}
          <div className="lg:col-span-4 rounded-2xl glass-panel p-4 border border-indigo-900/40 space-y-4">
            <h3 className="font-orbitron font-bold text-xs text-white">
              Institutional Order Flow Monitor
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-indigo-950">
                <span className="text-slate-400">Current Symbol</span>
                <span className="text-cyan-400 font-bold">{activeTicker.symbol}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-indigo-950">
                <span className="text-slate-400">Mark Price</span>
                <span className="text-emerald-400 font-bold">${activeTicker.price.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-indigo-950">
                <span className="text-slate-400">Open Orders</span>
                <span className="text-purple-300 font-bold">{trades.length} active in SQLite</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs font-rajdhani text-purple-200">
              <strong>ULTRON Market Heuristic:</strong> Smart Money footprint identifies accumulation near the psychological handle. Respect the stop loss at ${stopLossPrice.toLocaleString()}.
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
          </div>
        </div>
      )}

      {/* Paper Trading Journal */}
      {activeTab === 'journal' && (
        <div className="rounded-2xl glass-panel p-4 border border-indigo-900/40 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-indigo-950">
            <span className="font-orbitron font-bold text-sm text-white">
              Paper Trading Records (Stored in SQLite)
            </span>
            <span className="text-xs font-mono text-emerald-400">
              {trades.length} Positions Tracked
            </span>
          </div>

          <div className="space-y-2">
            {trades.length === 0 ? (
              <div className="text-center py-8 text-xs font-mono text-slate-500">
                No paper trades placed yet. Use the chart tab to execute your first order.
              </div>
            ) : (
              trades.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-indigo-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 font-mono text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        t.side === 'BUY' || t.side === 'LONG' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                      }`}
                    >
                      {t.side}
                    </span>
                    <span className="text-white font-bold">{t.symbol}</span>
                    <span className="text-slate-400">
                      Entry: ${t.entry_price || t.entry}
                    </span>
                  </div>
                  <div className="text-slate-300 text-[11px] font-rajdhani">{t.notes}</div>
                  <span className="text-[10px] text-slate-500">{t.created_at || t.date}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
