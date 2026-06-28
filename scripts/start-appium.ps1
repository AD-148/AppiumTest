param(
  [string]$BasePath = "/",
  [string]$AndroidSdkRoot = $env:ANDROID_SDK_ROOT
)

if (-not $AndroidSdkRoot) {
  $AndroidSdkRoot = $env:ANDROID_HOME
}

if (-not $AndroidSdkRoot) {
  $AndroidSdkRoot = Join-Path $env:LOCALAPPDATA "Android\Sdk"
}

if (-not (Test-Path -LiteralPath $AndroidSdkRoot)) {
  throw "Android SDK not found at '$AndroidSdkRoot'. Set ANDROID_SDK_ROOT or ANDROID_HOME to your SDK path."
}

$env:ANDROID_SDK_ROOT = $AndroidSdkRoot
$env:ANDROID_HOME = $AndroidSdkRoot

$platformTools = Join-Path $AndroidSdkRoot "platform-tools"
if ((Test-Path -LiteralPath $platformTools) -and ($env:PATH -notlike "*$platformTools*")) {
  $env:PATH = "$platformTools;$env:PATH"
}

Write-Host "ANDROID_SDK_ROOT=$env:ANDROID_SDK_ROOT"
Write-Host "Starting Appium on base path '$BasePath'..."

appium --base-path $BasePath
