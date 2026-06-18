# Voyager Travel Planner - Run Script
# Pokrece sva tri backend servisa u odvojenim prozorima i pokrece frontend dev server

Write-Host "Pokretanje Voyager Travel Planner-a..." -ForegroundColor Cyan

# 1. Pokretanje backend servisa u novim prozorima
Write-Host "Pokretanje AuthService (port 5001)..." -ForegroundColor Yellow
Start-Process dotnet -ArgumentList "run --project src/Services/AuthService/AuthService.csproj"

Write-Host "Pokretanje TravelService (port 5002)..." -ForegroundColor Yellow
Start-Process dotnet -ArgumentList "run --project src/Services/TravelService/TravelService.csproj"

Write-Host "Pokretanje ActivityService (port 5003)..." -ForegroundColor Yellow
Start-Process dotnet -ArgumentList "run --project src/Services/ActivityService/ActivityService.csproj"

# 2. Pokretanje frontenda u tekucem prozoru
Write-Host "Pokretanje Frontend servera (port 5173)..." -ForegroundColor Green
Set-Location src/Frontend
npm run dev

powershell -ExecutionPolicy Bypass -File .\run-all.ps1
