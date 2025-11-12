# Python Google Sheets API

Flask-based API server for fetching Google Sheets data for Film call status tracking.

## Setup

### 1. Install Python Dependencies

```powershell
cd python-api
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Google credentials:

```powershell
cp .env.example .env
```

Required variables:

- `GOOGLE_SPREADSHEET_ID`: Your Google Sheets ID
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Service account email
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`: Service account private key (must include `\n` for newlines)

### 3. Run the API Server

```powershell
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check

```
GET /health
```

Response:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Film Call Status

```
GET /api/film-call-status
```

Returns all records from Film_dev sheet with status "อยู่ระหว่างโทรออก"

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "film-123",
      "name": "John Doe",
      "phone": "0812345678",
      "status": "อยู่ระหว่างโทรออก"
    }
  ],
  "total": 1,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "debug": {
    "totalRows": 5218,
    "matchedRows": 1,
    "statusCallColumn": "สถานะ",
    "phoneColumn": "เบอร์โทร",
    "nameColumn": "ชื่อ",
    "uniqueStatuses": ["อยู่ระหว่างโทรออก", "โทรสำเร็จ", "ไม่รับสาย"]
  }
}
```

## Integration with Next.js Frontend

Update the `fetchFilmCallStatusData` function in your Next.js `page.tsx`:

```typescript
const fetchFilmCallStatusData = async () => {
  try {
    setIsLoading(true);
    const response = await fetch("http://localhost:5000/api/film-call-status");
    const result = await response.json();

    if (result.success) {
      setFilmCallStatusData(result.data);
      console.log("Film call status data:", result.data);
    }
  } catch (error) {
    console.error("Error fetching film call status:", error);
  } finally {
    setIsLoading(false);
  }
};
```

## Features

- ✅ Flask CORS enabled for Next.js integration
- ✅ Google Sheets API v4 integration
- ✅ Service Account authentication
- ✅ 2-row header detection (handles column names like AS, AT, AU)
- ✅ Flexible column name matching (English + Thai)
- ✅ Comprehensive debug logging
- ✅ Error handling and validation
- ✅ Health check endpoint

## Troubleshooting

### Missing environment variables

Make sure your `.env` file has all required variables:

```
GOOGLE_SPREADSHEET_ID
GOOGLE_SERVICE_ACCOUNT_EMAIL
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
```

### Authentication errors

Verify your service account has access to the Google Sheet. Share the sheet with the service account email.

### No data returned

Check the console logs for:

- Column detection (status_call, phone, name)
- Unique status values found in sheet
- Matched rows count

The API logs all unique status values to help identify exact strings in your sheet.
