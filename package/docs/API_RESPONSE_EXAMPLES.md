# SET Market Data API - Response Examples

## Complete API Response Structure

### Endpoint

```
GET https://marketplace.set.or.th/api/public/realtime-data/stock
```

### Example Response (Full)

```json
{
  "data": [
    {
      "symbol": "TVO",
      "last": 24.5,
      "change": 0.5,
      "percentChange": 2.08,
      "high": 25.0,
      "low": 24.0,
      "volume": 15500000,
      "value": 380250000,
      "prior": 24.0,
      "marketStatus": "OPEN"
    },
    {
      "symbol": "PTT",
      "last": 38.5,
      "change": 0.75,
      "percentChange": 1.99,
      "high": 39.0,
      "low": 37.75,
      "volume": 320000000,
      "value": 12450250000,
      "prior": 37.75,
      "marketStatus": "OPEN"
    },
    {
      "symbol": "KBANK",
      "last": 142.0,
      "change": -1.5,
      "percentChange": -1.04,
      "high": 144.0,
      "low": 141.5,
      "volume": 58500000,
      "value": 8320500000,
      "prior": 143.5,
      "marketStatus": "OPEN"
    }
  ]
}
```

## Proxy API Response Examples

### 1. Get All Stocks

```bash
GET /api/stock
```

**Response:**

```json
{
  "data": [
    { "symbol": "TVO", "last": 24.50, ... },
    { "symbol": "PTT", "last": 38.50, ... },
    { "symbol": "KBANK", "last": 142.00, ... }
  ]
}
```

### 2. Get Specific Stock

```bash
GET /api/stock?symbol=TVO
```

**Response:**

```json
{
  "data": [
    {
      "symbol": "TVO",
      "last": 24.5,
      "change": 0.5,
      "percentChange": 2.08,
      "high": 25.0,
      "low": 24.0,
      "volume": 15500000,
      "value": 380250000,
      "prior": 24.0,
      "marketStatus": "OPEN"
    }
  ]
}
```

### 3. Stock Not Found

```bash
GET /api/stock?symbol=INVALID
```

**Response (404):**

```json
{
  "error": "Stock symbol INVALID not found"
}
```

### 4. API Error

**Response (500):**

```json
{
  "error": "Failed to fetch stock data",
  "message": "SET API returned 503"
}
```

## Field Descriptions

### StockData Fields

| Field           | Type   | Unit   | Description                   | Example   |
| --------------- | ------ | ------ | ----------------------------- | --------- |
| `symbol`        | string | -      | Stock ticker symbol           | "TVO"     |
| `last`          | number | THB    | Last traded price             | 24.50     |
| `change`        | number | THB    | Price change from prior close | 0.50      |
| `percentChange` | number | %      | Percentage change             | 2.08      |
| `high`          | number | THB    | Highest price of the day      | 25.00     |
| `low`           | number | THB    | Lowest price of the day       | 24.00     |
| `volume`        | number | shares | Total shares traded           | 15500000  |
| `value`         | number | THB    | Total trading value           | 380250000 |
| `prior`         | number | THB    | Previous closing price        | 24.00     |
| `marketStatus`  | string | -      | Current market status         | "OPEN"    |

### Market Status Values

- `"OPEN"` - Market is currently open for trading
- `"CLOSED"` - Market is closed
- `"PREOPEN"` - Pre-opening session
- `"BREAK"` - Lunch break
- `"HOLIDAY"` - Market holiday

## Data Formats

### Numbers

- **Prices**: 2 decimal places (e.g., 24.50)
- **Percentages**: 2 decimal places (e.g., 2.08)
- **Volume**: Integer (shares)
- **Value**: Integer (Baht)

### Display Formatting

#### In Thai Format

```typescript
// Price
24.50 → "24.50"

// Volume (millions)
15500000 → "15.50M"

// Value (millions)
380250000 → "380.25M"

// Percentage
2.08 → "+2.08%"
-1.04 → "-1.04%"
```

#### In Code

```typescript
// Format price
price
  .toFixed(2)
  (
    // "24.50"

    // Format volume
    volume / 1000000
  )
  .toFixed(2) +
  "M"(
    // "15.50M"

    // Format value
    value / 1000000
  ).toFixed(2) +
  "M"(
    // "380.25M"

    // Format percentage
    percentChange >= 0 ? "+" : ""
  ) +
  percentChange.toFixed(2) +
  "%"; // "+2.08%"
```

## Common Stocks in SET

### Top 50 SET Stocks (Alphabetical)

```json
[
  "ADVANC",
  "AOT",
  "AWC",
  "BANPU",
  "BBL",
  "BDMS",
  "BEM",
  "BGRIM",
  "BH",
  "BTS",
  "CBG",
  "CENTEL",
  "COM7",
  "CPALL",
  "CPF",
  "CPN",
  "DELTA",
  "DTAC",
  "EA",
  "EGCO",
  "GLOBAL",
  "GPSC",
  "GULF",
  "HMPRO",
  "INTUCH",
  "IVL",
  "JAS",
  "KBANK",
  "KCE",
  "KTB",
  "KTC",
  "LH",
  "MINT",
  "MTC",
  "OR",
  "OSP",
  "PTT",
  "PTTEP",
  "PTTGC",
  "QH",
  "RATCH",
  "ROBINS",
  "SCB",
  "SCC",
  "SCGP",
  "SPRC",
  "TASCO",
  "TCAP",
  "TOP",
  "TVO",
  "TRUE",
  "TTW",
  "TU",
  "VGI",
  "WHA"
]
```

## Testing Examples

### Using cURL

```bash
# Get all stocks
curl -X GET "https://marketplace.set.or.th/api/public/realtime-data/stock" \
  -H "Accept: application/json"

# Using proxy
curl -X GET "http://localhost:3000/api/stock"

# Get specific stock via proxy
curl -X GET "http://localhost:3000/api/stock?symbol=TVO"
```

### Using JavaScript Fetch

```javascript
// Get all stocks
fetch("/api/stock")
  .then((res) => res.json())
  .then((data) => console.log(data));

// Get specific stock
fetch("/api/stock?symbol=TVO")
  .then((res) => res.json())
  .then((data) => console.log(data));
```

### Using React Hook

```typescript
const [stockData, setStockData] = useState<StockData | null>(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch("/api/stock?symbol=TVO");
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        setStockData(data.data[0]);
      }
    } catch (error) {
      console.error("Error fetching stock data:", error);
    }
  };

  fetchData();
  const interval = setInterval(fetchData, 300000); // 5 minutes
  return () => clearInterval(interval);
}, []);
```

## Error Handling

### Common Error Scenarios

#### 1. Network Error

```json
{
  "error": "Failed to fetch stock data",
  "message": "Network request failed"
}
```

#### 2. Invalid Symbol

```json
{
  "error": "Stock symbol XYZ not found"
}
```

#### 3. API Unavailable

```json
{
  "error": "Failed to fetch stock data",
  "message": "SET API returned 503"
}
```

#### 4. Timeout

```json
{
  "error": "Failed to fetch stock data",
  "message": "Request timeout"
}
```

## Rate Limiting

### Recommended Practices

- ✅ Cache responses for 5 minutes
- ✅ Use server-side proxy
- ✅ Implement exponential backoff
- ✅ Add request queuing
- ❌ Don't poll every second
- ❌ Don't make parallel requests for same data

### Example Rate Limiter

```typescript
class RateLimiter {
  private lastFetch: number = 0;
  private minInterval: number = 300000; // 5 minutes

  canFetch(): boolean {
    const now = Date.now();
    if (now - this.lastFetch >= this.minInterval) {
      this.lastFetch = now;
      return true;
    }
    return false;
  }
}
```

## Data Validation

### TypeScript Type Guards

```typescript
function isValidStockData(data: any): data is StockData {
  return (
    typeof data.symbol === "string" &&
    typeof data.last === "number" &&
    typeof data.change === "number" &&
    typeof data.percentChange === "number" &&
    typeof data.high === "number" &&
    typeof data.low === "number" &&
    typeof data.volume === "number" &&
    typeof data.value === "number" &&
    typeof data.prior === "number" &&
    typeof data.marketStatus === "string"
  );
}

// Usage
if (isValidStockData(responseData)) {
  setStockData(responseData);
} else {
  console.error("Invalid stock data format");
}
```

## Real-world Usage Example

```typescript
import { useState, useEffect } from "react";

interface StockData {
  symbol: string;
  last: number;
  change: number;
  percentChange: number;
  // ... other fields
}

function useStockData(symbol: string) {
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchStock = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/stock?symbol=${symbol}`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        if (result.error) {
          throw new Error(result.error);
        }

        if (mounted && result.data && result.data[0]) {
          setData(result.data[0]);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchStock();
    const interval = setInterval(fetchStock, 300000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [symbol]);

  return { data, loading, error };
}

// Usage in component
function StockWidget({ symbol }: { symbol: string }) {
  const { data, loading, error } = useStockData(symbol);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div>
      <h3>{data.symbol}</h3>
      <p>Price: {data.last.toFixed(2)}</p>
      <p>
        Change: {data.change.toFixed(2)} ({data.percentChange.toFixed(2)}%)
      </p>
    </div>
  );
}
```

---

**Last Updated**: October 15, 2025
**API Version**: Public v1
**Documentation Status**: Complete
