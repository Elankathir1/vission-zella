
import React, { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  symbol: string;
  height?: number | string;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol, height = 500 }) => {
  const containerId = useRef(`tradingview_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (window.TradingView) {
      new window.TradingView.widget({
        "width": "100%",
        "height": height,
        "symbol": symbol.includes(':') ? symbol : `NASDAQ:${symbol}`, // Fallback to NASDAQ if no exchange specified
        "interval": "15",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "toolbar_bg": "#0b0e11",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "container_id": containerId.current,
        "backgroundColor": "#12151a",
        "gridColor": "rgba(42, 46, 57, 0.1)",
      });
    }
  }, [symbol, height]);

  return (
    <div className="tradingview-widget-container rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
      <div id={containerId.current} />
    </div>
  );
};

export default TradingViewChart;
