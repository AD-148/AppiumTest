# JioHotstar Appium Automation

This project launches the Android JioHotstar app, searches for a video, and taps the third visible search result.

## Prerequisites

- Appium server running with Android SDK variables exported
- Android device or emulator connected: `adb devices`
- JioHotstar already installed and signed in if login is required

## Setup

Install Node dependencies:

```powershell
npm install
```

Create environment variables from the example file:

```powershell
Copy-Item .env.example .env
```

PowerShell does not automatically load `.env` files. For a quick run, set the values in the same terminal:

```powershell
$env:ANDROID_SDK_ROOT="C:\Users\USER\AppData\Local\Android\Sdk"
$env:ANDROID_HOME=$env:ANDROID_SDK_ROOT
$env:JIOHOTSTAR_SEARCH_TEXT="movie trailer"
$env:JIOHOTSTAR_APP_PACKAGE="com.jiohotstar.android"
npm run test:jiohotstar
```

Start Appium from a terminal that has the SDK variables set. This repo includes a PowerShell launcher that defaults to `%LOCALAPPDATA%\Android\Sdk`:

```powershell
npm run appium
```

Keep that Appium terminal open, then run the test in another terminal:

```powershell
npm run test:jiohotstar
```

## Find Package and Activity

If the package or launch activity differs on your device, use:

```powershell
adb shell pm list packages | Select-String -Pattern "hotstar|jio"
adb shell cmd package resolve-activity --brief com.jiohotstar.android
```

If `resolve-activity` prints an activity name, set it before running:

```powershell
$env:JIOHOTSTAR_APP_ACTIVITY=".MainActivity"
```

## Tune Selectors

Open Appium Inspector and copy stable selectors for:

- Search tab/button: `SEARCH_ENTRY_SELECTOR`
- Search input: `SEARCH_FIELD_SELECTOR`
- Video result card: `RESULT_SELECTOR`

Example:

```powershell
$env:JIOHOTSTAR_SEARCH_ENTRY_SELECTOR='android=new UiSelector().resourceId("com.jiohotstar.android:id/search")'
$env:JIOHOTSTAR_SEARCH_FIELD_SELECTOR='android=new UiSelector().resourceId("com.jiohotstar.android:id/search_input")'
$env:JIOHOTSTAR_RESULT_SELECTOR='android=new UiSelector().resourceId("com.jiohotstar.android:id/video_card")'
npm run test:jiohotstar
```

The default result selector is intentionally broad because app UI resource IDs vary by version. For reliable testing, replace it with the exact video-card selector from Appium Inspector.
