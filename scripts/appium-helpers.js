import { remote } from "webdriverio";
import { androidCapabilities, serverOptions } from "./appium-capabilities.js";
import assert from "assert";

export async function waitForDisplayed(driver, selector, timeout = 20000) {
  const element = await driver.$(selector);
  await element.waitForDisplayed({ timeout });
  return element;
}

export async function click(driver, selector, timeout = 20000) {
  const element = await waitForDisplayed(driver, selector, timeout);
  assert.ok(await element.isDisplayed(), `Element with selector ${selector} is not displayed`);
  assert.ok(await element.isEnabled(), `Element with selector ${selector} is not enabled`);
  await element.click();
  return element;
}

export async function setValue(driver, selector, value, timeout = 20000) {
  const element = await waitForDisplayed(driver, selector, timeout);
  assert.ok(await element.isDisplayed(), `Element with selector ${selector} is not displayed`);
  assert.ok(await element.isEnabled(), `Element with selector ${selector} is not enabled`);
  await element.clearValue();
  await element.setValue(value);
  return element;
}

export async function scrollDown(driver) {
  const { width, height } = await driver.getWindowSize();
  const x = Math.floor(width / 2);
  const startY = Math.floor(height * 0.7);
  const endY = Math.floor(height * 0.35);

  await driver.performActions([
    {
      type: "pointer",
      id: "finger1",
      parameters: { pointerType: "touch" },
      actions: [
        { type: "pointerMove", duration: 0, x, y: startY },
        { type: "pointerDown", button: 0 },
        { type: "pause", duration: 100 },
        { type: "pointerMove", duration: 500, x, y: endY },
        { type: "pointerUp", button: 0 },
      ],
    },
  ]);
  await driver.releaseActions();
}

export async function nthDisplayedElement(
  driver,
  selector,
  index,
  timeout = 30000,
) {
  let matchingElements = [];

  await driver.waitUntil(
    async () => {
      const elements = await driver.$$(selector);
      matchingElements = [];

      for (const element of elements) {
        if (await element.isDisplayed()) {
          matchingElements.push(element);
        }
      }

      return matchingElements.length >= index;
    },
    {
      timeout,
      interval: 1000,
      timeoutMsg: `Expected at least ${index} displayed search results for selector: ${selector}`,
    },
  );

  return matchingElements[index - 1];
}

export function positiveInteger(value, fallback, name) {
  const parsed = Number(value ?? fallback);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer. Received: ${value}`);
  }

  return parsed;
}

export async function playSearchResult(
  driver,
  {
    selectors,
    searchText,
    resultIndex,
    submitSearch,
    scrollBeforeResult = false,
    playbackSelector,
    playbackPauseMs = 20000,
  },
) {
  await click(driver, selectors.searchButton);
  await setValue(driver, selectors.searchInput, searchText);

  if (submitSearch) {
    await submitSearch(driver);
  }

  await waitForDisplayed(driver, selectors.resultsPage);

  if (scrollBeforeResult) {
    await scrollDown(driver);
  }

  const result = await nthDisplayedElement(
    driver,
    selectors.searchResults,
    resultIndex,
  );
  await result.click();

  if (playbackSelector) {
    await waitForDisplayed(driver, playbackSelector);
  }

  await driver.pause(playbackPauseMs);
}

export async function runAndroidTest({ appPackage, appActivity, testFn }) {
  const env = process.env;
  const appiumServerUrl = env.APPIUM_SERVER_URL ?? "http://127.0.0.1:4723";
  const capabilities = androidCapabilities({ appPackage, appActivity });

  let driver;
  try {
    driver = await remote(serverOptions(appiumServerUrl, capabilities));
    await testFn(driver);
  } catch (error) {
    console.error("Test execution failed:", error);
    process.exitCode = 1;
  } finally {
    if (driver) {
      try {
        await driver.terminateApp(appPackage);
      } catch (err) {
        console.warn(`Failed to terminate app ${appPackage}:`, err.message);
      }
      await driver.deleteSession();
    }
  }
}

