# Vercel Environment Variables Setup Script
# Run this script to add all environment variables to Vercel

Write-Host "🚀 Setting up Vercel Environment Variables..." -ForegroundColor Cyan
Write-Host ""

# Check if vercel is installed
if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI is not installed. Installing..." -ForegroundColor Red
    npm install -g vercel
}

# Check if .env.local exists
if (!(Test-Path ".env.local")) {
    Write-Host "❌ .env.local file not found!" -ForegroundColor Red
    Write-Host "Please create .env.local file first." -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Reading environment variables from .env.local..." -ForegroundColor Green
Write-Host ""

# Load .env.local
$envVars = Get-Content ".env.local" | Where-Object { 
    $_ -notmatch "^\s*#" -and $_ -notmatch "^\s*$" 
}

# Parse environment variables
$envMap = @{}
foreach ($line in $envVars) {
    if ($line -match "^([^=]+)=(.*)$") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        
        # Remove quotes if present
        $value = $value -replace '^"(.*)"$', '$1'
        
        $envMap[$key] = $value
    }
}

Write-Host "✅ Found $($envMap.Count) environment variables" -ForegroundColor Green
Write-Host ""

# Ask user which environment to add
Write-Host "📍 Select environment(s) to add variables:" -ForegroundColor Cyan
Write-Host "  1. Production only"
Write-Host "  2. Preview only"
Write-Host "  3. Development only"
Write-Host "  4. All environments (Production, Preview, Development)"
Write-Host ""
$choice = Read-Host "Enter your choice (1-4)"

$environments = @()
switch ($choice) {
    "1" { $environments = @("production") }
    "2" { $environments = @("preview") }
    "3" { $environments = @("development") }
    "4" { $environments = @("production", "preview", "development") }
    default { 
        Write-Host "❌ Invalid choice. Defaulting to production only." -ForegroundColor Yellow
        $environments = @("production")
    }
}

Write-Host ""
Write-Host "🔐 Adding environment variables to: $($environments -join ', ')..." -ForegroundColor Cyan
Write-Host ""

# Priority variables to add
$priorityVars = @(
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "GOOGLE_SPREADSHEET_ID",
    "GOOGLE_SERVICE_ACCOUNT_EMAIL",
    "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY",
    "SURGERY_SCHEDULE_WEBHOOK_SECRET"
)

$addedCount = 0
$skippedCount = 0

foreach ($varName in $priorityVars) {
    if ($envMap.ContainsKey($varName)) {
        $value = $envMap[$varName]
        
        Write-Host "➕ Adding: $varName" -ForegroundColor Yellow
        
        foreach ($env in $environments) {
            try {
                # Create a temporary file with the value
                $tempFile = [System.IO.Path]::GetTempFileName()
                $value | Out-File -FilePath $tempFile -Encoding UTF8 -NoNewline
                
                # Add to Vercel using the temp file
                $output = vercel env add $varName $env --force 2>&1 < $tempFile
                
                # Clean up temp file
                Remove-Item $tempFile -Force
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "   ✅ Added to $env" -ForegroundColor Green
                } else {
                    Write-Host "   ⚠️ Warning for $env : $output" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "   ❌ Error adding to $env : $_" -ForegroundColor Red
            }
        }
        
        $addedCount++
        Write-Host ""
    } else {
        Write-Host "⚠️ Skipping: $varName (not found in .env.local)" -ForegroundColor Yellow
        $skippedCount++
    }
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "   Added: $addedCount variables" -ForegroundColor Green
Write-Host "   Skipped: $skippedCount variables" -ForegroundColor Yellow
Write-Host "   Environments: $($environments -join ', ')" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Environment variables setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Verify variables: vercel env ls" -ForegroundColor White
Write-Host "   2. Deploy to production: vercel --prod" -ForegroundColor White
Write-Host ""
