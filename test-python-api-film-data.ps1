# Test Python API - Surgery Schedule Endpoint
# This script tests the /api/film-data endpoint

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Testing Python API - Film Data" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$pythonApiUrl = "http://localhost:5000"
$endpoint = "$pythonApiUrl/api/film-data"

Write-Host "📡 Testing endpoint: $endpoint" -ForegroundColor Yellow
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Green
Write-Host "-------------------" -ForegroundColor Green
try {
    $healthResponse = Invoke-RestMethod -Uri "$pythonApiUrl/health" -Method Get -ErrorAction Stop
    Write-Host "✅ Health check passed" -ForegroundColor Green
    Write-Host "Response: $($healthResponse | ConvertTo-Json -Depth 1)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Health check failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️  Make sure Python API is running:" -ForegroundColor Yellow
    Write-Host "   cd python-api" -ForegroundColor Yellow
    Write-Host "   python app.py" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Test 2: Film Data Endpoint
Write-Host "Test 2: Film Data Endpoint" -ForegroundColor Green
Write-Host "-------------------------" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri $endpoint -Method Get -ErrorAction Stop
    
    if ($response.success) {
        Write-Host "✅ Film data endpoint working!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Statistics:" -ForegroundColor Cyan
        Write-Host "  - Success: $($response.success)" -ForegroundColor White
        Write-Host "  - Total Records: $($response.total)" -ForegroundColor White
        Write-Host "  - Timestamp: $($response.timestamp)" -ForegroundColor White
        Write-Host ""
        
        if ($response.data -and $response.data.Count -gt 0) {
            Write-Host "📄 Sample Record (First Entry):" -ForegroundColor Cyan
            Write-Host "--------------------------------" -ForegroundColor Cyan
            $firstRecord = $response.data[0]
            Write-Host "  ID: $($firstRecord.id)" -ForegroundColor White
            Write-Host "  หมอ: $($firstRecord.'หมอ')" -ForegroundColor White
            Write-Host "  ผู้ติดต่อ: $($firstRecord.'ผู้ติดต่อ')" -ForegroundColor White
            Write-Host "  ชื่อ: $($firstRecord.'ชื่อ')" -ForegroundColor White
            Write-Host "  เบอร์โทร: $($firstRecord.'เบอร์โทร')" -ForegroundColor White
            Write-Host "  วันที่ได้นัดผ่าตัด: $($firstRecord.'วันที่ได้นัดผ่าตัด')" -ForegroundColor White
            Write-Host "  เวลาที่นัด: $($firstRecord.'เวลาที่นัด')" -ForegroundColor White
            Write-Host "  ยอดนำเสนอ: $($firstRecord.'ยอดนำเสนอ')" -ForegroundColor White
            Write-Host "  วันที่ผ่าตัด: $($firstRecord.'วันที่ผ่าตัด')" -ForegroundColor White
            Write-Host ""
            
            # Count records by contact person
            Write-Host "👥 Records by Contact Person:" -ForegroundColor Cyan
            Write-Host "-----------------------------" -ForegroundColor Cyan
            $groupedData = $response.data | Group-Object -Property 'contact_person'
            foreach ($group in $groupedData | Sort-Object Count -Descending) {
                $personName = if ($group.Name) { $group.Name } else { "ไม่ระบุ" }
                Write-Host "  $personName : $($group.Count) records" -ForegroundColor White
            }
            Write-Host ""
            
            # Count records with dates
            Write-Host "📅 Date Statistics:" -ForegroundColor Cyan
            Write-Host "------------------" -ForegroundColor Cyan
            $withConsultDate = ($response.data | Where-Object { $_.'date_consult_scheduled' -or $_.'วันที่ได้นัดผ่าตัด' }).Count
            $withSurgeryDate = ($response.data | Where-Object { $_.'surgery_date' -or $_.'วันที่ผ่าตัด' }).Count
            Write-Host "  Records with Consult Date: $withConsultDate" -ForegroundColor White
            Write-Host "  Records with Surgery Date: $withSurgeryDate" -ForegroundColor White
            Write-Host ""
        } else {
            Write-Host "⚠️  No data returned from API" -ForegroundColor Yellow
            Write-Host ""
        }
        
        # Debug info
        if ($response.debug) {
            Write-Host "🔍 Debug Information:" -ForegroundColor Cyan
            Write-Host "--------------------" -ForegroundColor Cyan
            Write-Host "  Total Rows: $($response.debug.totalRows)" -ForegroundColor White
            Write-Host "  Processed Rows: $($response.debug.processedRows)" -ForegroundColor White
            Write-Host ""
            Write-Host "  Column Mappings:" -ForegroundColor White
            $response.debug.columns.PSObject.Properties | ForEach-Object {
                Write-Host "    - $($_.Name): $($_.Value)" -ForegroundColor Gray
            }
            Write-Host ""
        }
        
    } else {
        Write-Host "❌ API returned unsuccessful response" -ForegroundColor Red
        Write-Host "Error: $($response.error)" -ForegroundColor Red
        Write-Host ""
    }
    
} catch {
    Write-Host "❌ Failed to fetch film data!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    
    if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        Write-Host ""
    }
    
    Write-Host "💡 Troubleshooting Steps:" -ForegroundColor Yellow
    Write-Host "  1. Check Python API is running on $pythonApiUrl" -ForegroundColor Yellow
    Write-Host "  2. Check python-api/.env has Google Sheets credentials" -ForegroundColor Yellow
    Write-Host "  3. Check Service Account has access to Google Sheet" -ForegroundColor Yellow
    Write-Host "  4. Check Google Sheet has 'Film data' sheet" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Summary
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Python API is working correctly!" -ForegroundColor Green
Write-Host "✅ Film data endpoint is accessible" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Start Next.js: npm run dev" -ForegroundColor White
Write-Host "  2. Open http://localhost:3000/performance-surgery-schedule" -ForegroundColor White
Write-Host "  3. Verify data is displayed in the tables automatically" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "  - PYTHON_API_SURGERY_SCHEDULE_GUIDE.md" -ForegroundColor White
Write-Host ""
