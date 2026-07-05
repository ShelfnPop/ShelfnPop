$ErrorActionPreference = "Stop"
$Mode = if ($args.Count -gt 0) { $args[0] } else { "start" }
$RootDir = Split-Path -Parent $PSScriptRoot
Set-Location $RootDir

function Show-Usage {
  @"
usage: ./script/build_and_run.ps1 [mode]

Modes:
  start, run        Start the Expo dev server
  --ios, ios        Start Expo and open iOS
  --android, android
                   Start Expo and open Android
  --web, web        Start Expo for web
  --dev-client, dev-client
                   Start Expo in development-client mode
  --tunnel, tunnel Start Expo using tunnel transport
  --export-web, export-web
                   Export the web build locally
  --doctor, doctor Run Expo diagnostics
  --help, help     Show this help
"@
}

function Invoke-Expo {
  param([string[]]$ExpoArgs)

  if ($env:EXPO_CLI) {
    $parts = $env:EXPO_CLI -split " "
    $cliArgs = if ($parts.Length -gt 1) { $parts[1..($parts.Length - 1)] } else { @() }
    & $parts[0] @cliArgs @ExpoArgs
    exit $LASTEXITCODE
  }

  if ((Test-Path "pnpm-lock.yaml") -and (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    & pnpm exec expo @ExpoArgs
    exit $LASTEXITCODE
  }

  if ((Test-Path "yarn.lock") -and (Get-Command yarn -ErrorAction SilentlyContinue)) {
    & yarn expo @ExpoArgs
    exit $LASTEXITCODE
  }

  if (((Test-Path "bun.lock") -or (Test-Path "bun.lockb")) -and (Get-Command bun -ErrorAction SilentlyContinue)) {
    & bunx expo @ExpoArgs
    exit $LASTEXITCODE
  }

  & npx expo @ExpoArgs
  exit $LASTEXITCODE
}

function Invoke-ExpoDoctor {
  if ((Test-Path "pnpm-lock.yaml") -and (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    & pnpm exec expo-doctor
    exit $LASTEXITCODE
  }

  if ((Test-Path "yarn.lock") -and (Get-Command yarn -ErrorAction SilentlyContinue)) {
    & yarn expo-doctor
    exit $LASTEXITCODE
  }

  if (((Test-Path "bun.lock") -or (Test-Path "bun.lockb")) -and (Get-Command bun -ErrorAction SilentlyContinue)) {
    & bunx expo-doctor
    exit $LASTEXITCODE
  }

  & npx expo-doctor
  exit $LASTEXITCODE
}

switch ($Mode) {
  { $_ -in @("start", "run") } { Invoke-Expo @("start") }
  { $_ -in @("--ios", "ios") } { Invoke-Expo @("start", "--ios") }
  { $_ -in @("--android", "android") } { Invoke-Expo @("start", "--android") }
  { $_ -in @("--web", "web") } { Invoke-Expo @("start", "--web") }
  { $_ -in @("--dev-client", "dev-client") } { Invoke-Expo @("start", "--dev-client") }
  { $_ -in @("--tunnel", "tunnel") } { Invoke-Expo @("start", "--tunnel") }
  { $_ -in @("--export-web", "export-web") } { Invoke-Expo @("export", "--platform", "web") }
  { $_ -in @("--doctor", "doctor") } { Invoke-ExpoDoctor }
  { $_ -in @("--help", "help") } { Show-Usage }
  default {
    Show-Usage
    exit 2
  }
}
