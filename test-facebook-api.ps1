# Test Facebook Ads API with new token
Write-Host "Testing Facebook Ads API..." -ForegroundColor Cyan

# Read environment variables
$envFile = Get-Content .env.local
$token = ($envFile | Select-String "FACEBOOK_ACCESS_TOKEN=(.+)").Matches.Groups[1].Value
$accountId = ($envFile | Select-String "FACEBOOK_AD_ACCOUNT_ID=(.+)").Matches.Groups[1].Value

Write-Host "`nToken (first 50 chars): $($token.Substring(0,50))..." -ForegroundColor Yellow
Write-Host "Account ID: $accountId" -ForegroundColor Yellow

# Test 1: Get account info
Write-Host "`n=== Test 1: Get Account Info ===" -ForegroundColor Green
$url1 = "https://graph.facebook.com/v24.0/$accountId`?access_token=$token&fields=name,account_id,account_status"
try {
    $response1 = Invoke-RestMethod -Uri $url1 -Method Get
    Write-Host "✓ Account Name: $($response1.name)" -ForegroundColor Green
    Write-Host "✓ Account Status: $($response1.account_status)" -ForegroundColor Green
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get campaigns
Write-Host "`n=== Test 2: Get Campaigns ===" -ForegroundColor Green
$url2 = "https://graph.facebook.com/v24.0/$accountId/campaigns?access_token=$token&fields=id,name,status&limit=5"
try {
    $response2 = Invoke-RestMethod -Uri $url2 -Method Get
    Write-Host "✓ Found $($response2.data.Count) campaigns" -ForegroundColor Green
    $response2.data | ForEach-Object {
        Write-Host "  - $($_.name) (Status: $($_.status))" -ForegroundColor Cyan
    }
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get insights for today
Write-Host "`n=== Test 3: Get Insights (Today) ===" -ForegroundColor Green
$url3 = "https://graph.facebook.com/v24.0/$accountId/insights?access_token=$token&level=ad&date_preset=today&fields=ad_id,ad_name,spend,impressions,clicks&limit=5"
try {
    $response3 = Invoke-RestMethod -Uri $url3 -Method Get
    Write-Host "✓ Found $($response3.data.Count) ad insights" -ForegroundColor Green
    $response3.data | ForEach-Object {
        Write-Host "  - Ad: $($_.ad_name)" -ForegroundColor Cyan
        Write-Host "    Spend: $($_.spend), Impressions: $($_.impressions), Clicks: $($_.clicks)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Get ad creative
Write-Host "`n=== Test 4: Get Ad Creative ===" -ForegroundColor Green
if ($response3.data.Count -gt 0) {
    $firstAdId = $response3.data[0].ad_id
    $url4 = "https://graph.facebook.com/v24.0/$firstAdId`?access_token=$token&fields=creative{id,thumbnail_url,image_url,video_id}"
    try {
        $response4 = Invoke-RestMethod -Uri $url4 -Method Get
        Write-Host "✓ Creative ID: $($response4.creative.id)" -ForegroundColor Green
        if ($response4.creative.thumbnail_url) {
            Write-Host "✓ Thumbnail URL: $($response4.creative.thumbnail_url.Substring(0,60))..." -ForegroundColor Green
        }
        if ($response4.creative.video_id) {
            Write-Host "✓ Video ID: $($response4.creative.video_id)" -ForegroundColor Green
        }
    } catch {
        Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠ No ads found to test creative" -ForegroundColor Yellow
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
Write-Host "If all tests passed, the Facebook Access Token is working correctly!" -ForegroundColor Green
