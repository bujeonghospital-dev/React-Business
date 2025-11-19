# Test Facebook Ads Creative API
Write-Host "Testing Facebook Ads Creative API..." -ForegroundColor Cyan

# Get first ad ID from today's insights
$envFile = Get-Content .env.local
$token = ($envFile | Select-String "FACEBOOK_ACCESS_TOKEN=(.+)").Matches.Groups[1].Value
$accountId = ($envFile | Select-String "FACEBOOK_AD_ACCOUNT_ID=(.+)").Matches.Groups[1].Value

Write-Host "`nStep 1: Get today's ads..." -ForegroundColor Yellow
$insightsUrl = "https://graph.facebook.com/v24.0/$accountId/insights?access_token=$token&level=ad&date_preset=today&fields=ad_id,ad_name&limit=5"

try {
    $insights = Invoke-RestMethod -Uri $insightsUrl -Method Get
    Write-Host "✓ Found $($insights.data.Count) ads" -ForegroundColor Green
    
    if ($insights.data.Count -gt 0) {
        Write-Host "`nStep 2: Testing creative fetch for each ad..." -ForegroundColor Yellow
        
        foreach ($ad in $insights.data) {
            $adId = $ad.ad_id
            $adName = $ad.ad_name
            
            Write-Host "`n--- Testing Ad: $adName ($adId) ---" -ForegroundColor Cyan
            
            # Test via Next.js API
            Write-Host "Testing via Next.js API (http://localhost:3000)..." -ForegroundColor Gray
            try {
                $nextApiUrl = "http://localhost:3000/api/facebook-ads-creative?ad_id=$adId"
                $nextResult = Invoke-RestMethod -Uri $nextApiUrl -Method Get
                
                if ($nextResult.success -and $nextResult.data) {
                    Write-Host "✓ Next.js API Success!" -ForegroundColor Green
                    Write-Host "  Creative ID: $($nextResult.data.id)" -ForegroundColor Cyan
                    
                    if ($nextResult.data.thumbnail_url) {
                        Write-Host "  ✓ Thumbnail URL: $($nextResult.data.thumbnail_url.Substring(0,[Math]::Min(80, $nextResult.data.thumbnail_url.Length)))..." -ForegroundColor Green
                    } else {
                        Write-Host "  ✗ No thumbnail_url" -ForegroundColor Yellow
                    }
                    
                    if ($nextResult.data.image_url) {
                        Write-Host "  ✓ Image URL: $($nextResult.data.image_url.Substring(0,[Math]::Min(80, $nextResult.data.image_url.Length)))..." -ForegroundColor Green
                    } else {
                        Write-Host "  ✗ No image_url" -ForegroundColor Yellow
                    }
                    
                    if ($nextResult.data.video_id) {
                        Write-Host "  ✓ Video ID: $($nextResult.data.video_id)" -ForegroundColor Green
                    }
                } else {
                    Write-Host "✗ Next.js API returned no data" -ForegroundColor Red
                    Write-Host "  Response: $($nextResult | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
                }
            } catch {
                Write-Host "✗ Next.js API Error: $($_.Exception.Message)" -ForegroundColor Red
                Write-Host "  Make sure dev server is running: npm run dev" -ForegroundColor Yellow
            }
            
            # Test direct Facebook API
            Write-Host "Testing direct Facebook Graph API..." -ForegroundColor Gray
            try {
                $fbApiUrl = "https://graph.facebook.com/v24.0/$adId`?access_token=$token&fields=creative{id,thumbnail_url,image_url,video_id,object_story_spec}"
                $fbResult = Invoke-RestMethod -Uri $fbApiUrl -Method Get
                
                if ($fbResult.creative) {
                    Write-Host "✓ Direct API Success!" -ForegroundColor Green
                    Write-Host "  Creative ID: $($fbResult.creative.id)" -ForegroundColor Cyan
                    
                    if ($fbResult.creative.thumbnail_url) {
                        Write-Host "  ✓ Thumbnail URL: $($fbResult.creative.thumbnail_url.Substring(0,[Math]::Min(80, $fbResult.creative.thumbnail_url.Length)))..." -ForegroundColor Green
                    }
                    
                    if ($fbResult.creative.image_url) {
                        Write-Host "  ✓ Image URL: $($fbResult.creative.image_url.Substring(0,[Math]::Min(80, $fbResult.creative.image_url.Length)))..." -ForegroundColor Green
                    }
                    
                    if ($fbResult.creative.video_id) {
                        Write-Host "  ✓ Video ID: $($fbResult.creative.video_id)" -ForegroundColor Green
                    }
                } else {
                    Write-Host "✗ No creative data" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "✗ Direct API Error: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "⚠ No ads found for today. Try changing date range." -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
Write-Host "If images don't show, possible reasons:" -ForegroundColor Yellow
Write-Host "1. Facebook API doesn't return thumbnail_url for some ad types" -ForegroundColor Gray
Write-Host "2. CORS issues (images hosted on Facebook servers)" -ForegroundColor Gray
Write-Host "3. Token doesn't have ads_read permission" -ForegroundColor Gray
