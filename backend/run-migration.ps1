# Migration Runner Script for MedMatch Platform

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MedMatch Platform - Database Migration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the backend directory
if (!(Test-Path "package.json")) {
    Write-Host "Error: Please run this script from the backend directory" -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "Error: node_modules not found. Please run 'npm install' first" -ForegroundColor Red
    exit 1
}

# Check if migration file exists
$migrationFile = "src/migrations/1693123456789-RestructureUserProfiles.ts"
if (!(Test-Path $migrationFile)) {
    Write-Host "Error: Migration file not found at $migrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "Pre-migration checklist:" -ForegroundColor Yellow
Write-Host "* Backend directory confirmed" -ForegroundColor Green
Write-Host "* Node modules installed" -ForegroundColor Green
Write-Host "* Migration file found" -ForegroundColor Green
Write-Host ""

# Prompt for confirmation
Write-Host "WARNING: This migration will restructure your database!" -ForegroundColor Red
Write-Host "   - Student profiles will be migrated to user profiles" -ForegroundColor Yellow
Write-Host "   - Clinic profiles will become clinic organizations" -ForegroundColor Yellow
Write-Host "   - All clinic users will become clinic_admin role" -ForegroundColor Yellow
Write-Host "   - All clinic users will be assigned to one default clinic" -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Are you sure you want to proceed? (yes/no)"
if ($confirmation -ne "yes") {
    Write-Host "Migration cancelled by user" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Building TypeScript files..." -ForegroundColor Cyan

try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed"
    }
    Write-Host "Build successful" -ForegroundColor Green
} catch {
    Write-Host "Build failed. Please fix TypeScript errors first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Running migration..." -ForegroundColor Cyan
Write-Host "Migration: RestructureUserProfiles" -ForegroundColor Yellow

try {
    npx typeorm migration:run -d dist/data-source.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "Migration completed successfully!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Changes made:" -ForegroundColor Cyan
        Write-Host "- Created user_profiles table" -ForegroundColor White
        Write-Host "- Converted clinic_profiles to clinics table" -ForegroundColor White
        Write-Host "- Updated user roles (clinic to clinic_admin)" -ForegroundColor White
        Write-Host "- Created default clinic organization" -ForegroundColor White
        Write-Host "- Migrated all student profile data" -ForegroundColor White
        Write-Host "- Updated foreign key relationships" -ForegroundColor White
        Write-Host ""
    } else {
        throw "Migration command failed"
    }
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Migration failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "The migration encountered an error." -ForegroundColor Yellow
    Write-Host "Check the error messages above for details." -ForegroundColor Yellow
    exit 1
}

Write-Host "Migration script completed!" -ForegroundColor Green

