# LINE Video Share Testing Script
# This script tests the video sharing functionality for LINE inline playback

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$VideoPath = "/images/video/test.mp4"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LINE Video Share Testing" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if dev server is running
Write-Host "[Test 1] Checking server availability..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/check-env" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "  ✓ Server is running at $BaseUrl" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Server not accessible at $BaseUrl" -ForegroundColor Red
    Write-Host "  Run 'npm run dev' first!" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 2: Test share-video API
Write-Host "[Test 2] Testing share-video API..." -ForegroundColor Yellow
try {
    $body = @{
        videoPath = $VideoPath
    } | ConvertTo-Json

    $shareResponse = Invoke-RestMethod -Uri "$BaseUrl/api/share-video" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop

    Write-Host "  ✓ Share URL generated successfully" -ForegroundColor Green
    Write-Host "    Share URL: $($shareResponse.shareUrl)" -ForegroundColor White
    Write-Host "    LINE Video URL: $($shareResponse.lineVideoUrl)" -ForegroundColor White
    Write-Host "    Needs Transcoding: $($shareResponse.needsTranscoding)" -ForegroundColor White
    
    if ($shareResponse.fileSizeMB) {
        Write-Host "    File Size: $($shareResponse.fileSizeMB) MB" -ForegroundColor White
    }
    
    $global:shareUrl = $shareResponse.shareUrl
    $global:lineVideoUrl = $shareResponse.lineVideoUrl
} catch {
    Write-Host "  ✗ Share-video API failed: $_" -ForegroundColor Red
    Write-Host "  Make sure video exists at: public$VideoPath" -ForegroundColor Yellow
}

Write-Host ""

# Test 3: Check OG meta tags on share page
Write-Host "[Test 3] Checking Open Graph meta tags..." -ForegroundColor Yellow
if ($global:shareUrl) {
    try {
        # Convert production URL to localhost for testing
        $localShareUrl = $global:shareUrl -replace "https://app.bjhbangkok.com", $BaseUrl
        Write-Host "    Testing: $localShareUrl" -ForegroundColor Gray
        
        $pageResponse = Invoke-WebRequest -Uri $localShareUrl -Method GET -ErrorAction Stop
        $html = $pageResponse.Content

        # Check for required OG tags
        $ogChecks = @(
            @{ Pattern = 'property="og:type".*?content="video'; Name = "og:type=video" },
            @{ Pattern = 'property="og:video"'; Name = "og:video" },
            @{ Pattern = 'property="og:video:type".*?content="video/mp4"'; Name = "og:video:type=video/mp4" },
            @{ Pattern = 'property="og:image"'; Name = "og:image" }
        )

        $allPassed = $true
        foreach ($check in $ogChecks) {
            if ($html -match $check.Pattern) {
                Write-Host "    ✓ $($check.Name)" -ForegroundColor Green
            } else {
                Write-Host "    ✗ $($check.Name) - Missing!" -ForegroundColor Red
                $allPassed = $false
            }
        }

        if ($allPassed) {
            Write-Host "  ✓ All required OG tags present" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ✗ Could not fetch share page: $_" -ForegroundColor Red
    }
} else {
    Write-Host "  ⊘ Skipped (no share URL available)" -ForegroundColor Gray
}

Write-Host ""

# Test 4: Check video endpoint headers
Write-Host "[Test 4] Checking video endpoint headers..." -ForegroundColor Yellow
if ($global:lineVideoUrl) {
    try {
        $videoResponse = Invoke-WebRequest -Uri $global:lineVideoUrl -Method HEAD -ErrorAction Stop
        
        $headers = $videoResponse.Headers
        $headerChecks = @(
            @{ Name = "Content-Type"; Expected = "video/mp4" },
            @{ Name = "Accept-Ranges"; Expected = "bytes" },
            @{ Name = "Access-Control-Allow-Origin"; Expected = "*" }
        )

        foreach ($check in $headerChecks) {
            $value = $headers[$check.Name]
            if ($value -and $value -like "*$($check.Expected)*") {
                Write-Host "    ✓ $($check.Name): $value" -ForegroundColor Green
            } else {
                Write-Host "    ✗ $($check.Name): Expected '$($check.Expected)', Got '$value'" -ForegroundColor Red
            }
        }
    } catch {
        Write-Host "  ✗ Could not check video endpoint: $_" -ForegroundColor Red
    }
} else {
    Write-Host "  ⊘ Skipped (no video URL available)" -ForegroundColor Gray
}

Write-Host ""

# Test 5: Test range request (required for video streaming)
Write-Host "[Test 5] Testing range request support..." -ForegroundColor Yellow
if ($global:lineVideoUrl) {
    try {
        $rangeResponse = Invoke-WebRequest -Uri $global:lineVideoUrl `
            -Method GET `
            -Headers @{ "Range" = "bytes=0-1023" } `
            -ErrorAction Stop

        if ($rangeResponse.StatusCode -eq 206) {
            Write-Host "  ✓ Range requests supported (206 Partial Content)" -ForegroundColor Green
            
            $contentRange = $rangeResponse.Headers["Content-Range"]
            if ($contentRange) {
                Write-Host "    Content-Range: $contentRange" -ForegroundColor White
            }
        } else {
            Write-Host "  ⚠ Unexpected status: $($rangeResponse.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ✗ Range request failed: $_" -ForegroundColor Red
    }
} else {
    Write-Host "  ⊘ Skipped (no video URL available)" -ForegroundColor Gray
}

Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To test in LINE:" -ForegroundColor Yellow
Write-Host "1. Copy this URL: $global:shareUrl" -ForegroundColor White
Write-Host "2. Paste into a LINE chat" -ForegroundColor White
Write-Host "3. Wait for preview to generate" -ForegroundColor White
Write-Host "4. Tap to play video inline" -ForegroundColor White
Write-Host ""
Write-Host "LINE OG Validator: https://poker.line.naver.jp/" -ForegroundColor Cyan
Write-Host ""
