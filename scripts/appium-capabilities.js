const env = process.env;

export function androidCapabilities({
  appPackage,
  appActivity,
  deviceName = env.ANDROID_DEVICE_NAME ?? "OnePlus 7 Pro",
  platformVersion = env.ANDROID_PLATFORM_VERSION ?? "12",
  udid = env.ANDROID_UDID ?? "77eff566",
} = {}) {
  return {
    platformName: "Android",
    "appium:automationName": "UiAutomator2",
    "appium:deviceName": deviceName,
    "appium:platformVersion": platformVersion,
    "appium:noReset": true,
    "appium:newCommandTimeout": 180,
    "appium:appPackage": appPackage,
    "appium:appActivity": appActivity,
    "appium:appWaitActivity": "*",
    "appium:udid": udid,
    "appium:forceAppLaunch": true,
  };
}

export function serverOptions(url, capabilities) {
  const parsed = new URL(url);

  return {
    protocol: parsed.protocol.replace(":", ""),
    hostname: parsed.hostname,
    port: Number(parsed.port || (parsed.protocol === "https:" ? 443 : 80)),
    path: parsed.pathname === "/" ? "/" : parsed.pathname,
    capabilities,
  };
}
