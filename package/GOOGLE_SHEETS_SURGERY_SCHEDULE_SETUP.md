# Google Sheets API Setup Guide

This guide will help you set up the Google Sheets API integration for the Performance Surgery Schedule.

## Step 1: Get Google Sheets API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Sheets API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"
4. Create API credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key
   - **Important**: Restrict your API key:
     - Click on the created API key
     - Under "Application restrictions", select "HTTP referrers (web sites)"
     - Add your domain (e.g., `https://yourdomain.com/*`)
     - Under "API restrictions", select "Restrict key"
     - Select "Google Sheets API"
     - Click "Save"

## Step 2: Prepare Your Google Sheet

1. Open your Google Sheet named **"Film data"**
2. Make sure it has the following columns (in any order):

   - หมอ (Doctor)
   - ผู้ติดต่อ (Contact Person)
   - ชื่อ (Name)
   - เบอร์โทร (Phone Number)
   - วันที่ได้นัดผ่าตัด (Surgery Date)
   - เวลาที่นัด (Appointment Time)
   - ยอดนำเสนอ (Proposed Amount)

3. **Important**: Make the sheet publicly viewable:

   - Click "Share" button
   - Under "General access", select "Anyone with the link"
   - Set permission to "Viewer"
   - Click "Done"

4. Get your Spreadsheet ID:
   - Look at your sheet URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
   - Copy the `{SPREADSHEET_ID}` part

## Step 3: Configure Environment Variables

Add the following to your `.env.local` file:

```env
NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY=your_api_key_here
NEXT_PUBLIC_SPREADSHEET_ID=your_spreadsheet_id_here
```

Example:

```env
NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY=AIzaSyAbc123def456ghi789jkl012mno345pqr
NEXT_PUBLIC_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
```

## Step 4: Date Format in Google Sheets

The system supports multiple date formats:

- ISO format: `YYYY-MM-DD` (e.g., `2024-03-15`)
- Thai format: `DD/MM/YYYY` (e.g., `15/03/2024` or `15/03/2567`)
- Other formats recognized by JavaScript Date

**Recommended**: Use `DD/MM/YYYY` format in your Google Sheet for consistency.

## Step 5: Contact Person Mapping

Make sure the **ผู้ติดต่อ** (Contact Person) column in your sheet uses these exact values:

- สา
- พิชชา
- ตั้งโอ๋
- Test
- จีน
- มุก
- เจ
- ว่าน

These will be matched to the table rows:

- 101-สา → สา
- 102-พิชชา → พิชชา
- 103-ตั้งโอ๋ → ตั้งโอ๋
- 104-Test → Test
- 105-จีน → จีน
- 106-มุก → มุก
- 107-เจ → เจ
- 108-ว่าน → ว่าน

## Step 6: Test the Integration

1. Restart your development server:

   ```bash
   npm run dev
   ```

2. Navigate to the Performance Surgery Schedule page

3. You should see:
   - Loading indicator while fetching data
   - Numbers appearing in cells where there are scheduled surgeries
   - Clickable cells with a green background
   - Popup modal when clicking on cells with data

## Troubleshooting

### No data showing up?

- Check if your API key and Spreadsheet ID are correct
- Verify the sheet is publicly accessible
- Check browser console for error messages
- Ensure the sheet name is exactly "Film data"
- Verify column headers match exactly (including Thai characters)

### API quota exceeded?

- Google Sheets API has a quota limit
- Consider implementing caching in the future
- Check your API usage in Google Cloud Console

### Date not parsing correctly?

- Check the date format in your sheet
- The date must be in a recognizable format
- Try using `DD/MM/YYYY` format

## Security Notes

⚠️ **Important Security Considerations:**

1. **API Key Security**:

   - Never commit your `.env.local` file to Git
   - Always restrict your API key to specific domains
   - Restrict API key to only Google Sheets API

2. **Sheet Access**:

   - Only make the sheet "Viewer" accessible, not "Editor"
   - Consider using a service account for better security in production

3. **Production Deployment**:
   - Add environment variables to your hosting platform (Vercel, Netlify, etc.)
   - Keep your API key secret and rotate it regularly

## Next Steps

Once the integration is working, you can:

1. Implement caching to reduce API calls
2. Add a refresh button to manually reload data
3. Implement the "L" (วันที่ฝาด) table if needed
4. Calculate estimated revenue (ประมาณการรายรับ) based on ยอดนำเสนอ
5. Add export functionality (PDF, Excel)
6. Implement real-time updates using Google Sheets webhooks
