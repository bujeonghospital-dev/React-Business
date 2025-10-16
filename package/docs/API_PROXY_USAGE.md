# Using the Stock API Proxy

If you encounter CORS errors when calling the SET API directly, you can use the proxy API route instead.

## Quick Fix

In `src/app/investor-financials/page.tsx`, replace the API endpoint:

### Before (Direct API Call):

```typescript
const response = await fetch(
  "https://marketplace.set.or.th/api/public/realtime-data/stock",
  {
    headers: {
      Accept: "application/json",
    },
  }
);
```

### After (Using Proxy):

```typescript
const response = await fetch("/api/stock");
```

## Full Component Updates

### StockMarketWidget - Update fetchStockData:

```typescript
const fetchStockData = async () => {
  try {
    setLoading(true);
    // Use proxy route with symbol parameter
    const response = await fetch(`/api/stock?symbol=${symbol}`);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data: ApiResponse = await response.json();

    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      setStockData(data.data[0]);
    } else {
      setError(`ไม่พบข้อมูลหุ้น ${symbol}`);
    }
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการดึงข้อมูล"
    );
  } finally {
    setLoading(false);
  }
};
```

### MarketOverview - Update fetchMarketData:

```typescript
const fetchMarketData = async () => {
  try {
    setLoading(true);
    // Use proxy route
    const response = await fetch("/api/stock");

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data: ApiResponse = await response.json();

    if (data.data && Array.isArray(data.data)) {
      const topStocks = data.data
        .filter((stock) => stock.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
      setMarketData(topStocks);
    }
  } catch (err) {
    console.error("Market data fetch error:", err);
  } finally {
    setLoading(false);
  }
};
```

## Benefits of Using the Proxy

1. **No CORS Issues**: Server-side requests bypass CORS restrictions
2. **Caching**: Next.js can cache responses for better performance
3. **Security**: Hide API keys if needed in the future
4. **Rate Limiting**: Add rate limiting on your server if needed
5. **Error Handling**: Centralized error handling

## Testing

Test the proxy endpoint directly:

```bash
# Get all stocks
curl http://localhost:3000/api/stock

# Get specific stock
curl http://localhost:3000/api/stock?symbol=TVO
```

## Environment Variables (Optional)

If SET requires an API key in the future, add to `.env.local`:

```env
SET_API_KEY=your_api_key_here
SET_API_URL=https://marketplace.set.or.th/api/public/realtime-data/stock
```

Then update `route.ts`:

```typescript
const response = await fetch(
  process.env.SET_API_URL ||
    "https://marketplace.set.or.th/api/public/realtime-data/stock",
  {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${process.env.SET_API_KEY}`,
    },
  }
);
```

## Deployment

When deploying to Vercel/production:

1. The proxy will automatically work
2. No additional configuration needed
3. Serverless function handles all requests
