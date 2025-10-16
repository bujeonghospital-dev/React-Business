# SET Market Data API Integration

## Overview

This document describes the integration of the Stock Exchange of Thailand (SET) Market Data API into the Investor Financials page.

## API Endpoint

```
https://marketplace.set.or.th/api/public/realtime-data/stock
```

## Features Implemented

### 1. Real-time Stock Widget

- **Component**: `StockMarketWidget`
- **Features**:
  - Display current stock price with real-time updates
  - Show price change (absolute and percentage)
  - Display high/low prices
  - Show trading volume and value
  - Visual indicators for positive/negative changes (green/red)
  - Customizable stock symbol input
  - Auto-refresh every 5 minutes

### 2. Market Overview

- **Component**: `MarketOverview`
- **Features**:
  - Display top 10 stocks by trading value
  - Real-time price updates
  - Sortable table view
  - Color-coded price changes
  - Auto-refresh every 5 minutes

## Data Structure

### StockData Interface

```typescript
interface StockData {
  symbol: string; // Stock symbol (e.g., "TVO")
  last: number; // Last traded price
  change: number; // Price change from previous close
  percentChange: number; // Percentage change
  high: number; // Highest price of the day
  low: number; // Lowest price of the day
  volume: number; // Trading volume (shares)
  value: number; // Trading value (Baht)
  prior: number; // Previous closing price
  marketStatus: string; // Market status (OPEN/CLOSED)
}
```

## Usage

### Viewing Stock Data

1. Navigate to the Investor Financials page
2. The default stock symbol is "TVO"
3. To view other stocks, enter the symbol in the input field

### Common Stock Symbols

- **TVO**: Thai Vegetable Oil Public Company Limited
- **PTT**: PTT Public Company Limited
- **KBANK**: Kasikornbank Public Company Limited
- **CPALL**: CP ALL Public Company Limited
- **AOT**: Airports of Thailand Public Company Limited

## Technical Implementation

### Fetch Strategy

- Initial fetch on component mount
- Auto-refresh every 5 minutes (300,000ms)
- Error handling with user-friendly messages
- Loading states with skeleton screens

### Performance Optimizations

- Component-level state management
- Cleanup of intervals on unmount
- Memoized calculations
- Conditional rendering for loading/error states

### Styling

- Responsive grid layout
- Smooth animations and transitions
- Scroll-triggered animations
- Hover effects
- Color-coded indicators (green for positive, red for negative)

## Error Handling

### Common Issues

1. **API Not Responding**

   - Fallback message displayed
   - Retry mechanism available

2. **Stock Symbol Not Found**

   - User-friendly error message
   - Suggestion to check symbol

3. **Network Issues**
   - Graceful degradation
   - Last known data cached

## CORS Considerations

If you encounter CORS issues during development:

### Option 1: Proxy Configuration (Recommended)

Add to `next.config.mjs`:

```javascript
async rewrites() {
  return [
    {
      source: '/api/stock/:path*',
      destination: 'https://marketplace.set.or.th/api/public/realtime-data/:path*',
    },
  ];
}
```

### Option 2: API Route

Create `src/app/api/stock/route.ts`:

```typescript
export async function GET() {
  const response = await fetch(
    "https://marketplace.set.or.th/api/public/realtime-data/stock",
    { next: { revalidate: 300 } }
  );
  const data = await response.json();
  return Response.json(data);
}
```

## Future Enhancements

### Planned Features

1. **Historical Data Charts**

   - Integration with charting library
   - Multiple timeframe options

2. **Price Alerts**

   - User-configurable alerts
   - Browser notifications

3. **Comparison Tool**

   - Side-by-side stock comparison
   - Relative performance metrics

4. **Advanced Filters**

   - Filter by sector
   - Sort by various metrics

5. **Export Functionality**
   - CSV/Excel export
   - PDF reports

## API Rate Limits

- The API is public and free to use
- Recommended refresh interval: 5 minutes
- For higher frequency updates, consider SET Premium API

## Browser Compatibility

Tested and working on:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

No additional packages required. Uses native browser APIs:

- Fetch API
- Intersection Observer API

## Troubleshooting

### Stock Not Updating

1. Check browser console for errors
2. Verify internet connection
3. Confirm SET market hours (9:30 AM - 4:30 PM ICT, Mon-Fri)

### Styling Issues

1. Clear browser cache
2. Check for CSS conflicts
3. Verify Tailwind CSS configuration

## Support

For API-related issues, contact SET Market Data Support:

- Website: https://www.set.or.th
- Email: market.data@set.or.th

## License

This integration follows SET's Terms of Service for Market Data API usage.

---

**Last Updated**: October 15, 2025
**Version**: 1.0.0
