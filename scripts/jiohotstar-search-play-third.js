import {runAndroidTest, click, setValue, assertText} from "./appium-helpers.js";

const env = process.env;

const searchText = env.JIOHOTSTAR_SEARCH_TEXT ?? "cricket";
const jioHotstarAppPackage = env.JIOHOTSTAR_APP_PACKAGE ?? "in.startv.hotstar";
const jioHotstarAppActivity =
  env.JIOHOTSTAR_APP_ACTIVITY ?? "com.hotstar.MainActivity";



    const selectors = {
      searchButton:
          env.JIOHOTSTAR_SEARCH_ENTRY_SELECTOR ??
          '//android.view.View[@content-desc="Search"]',
      searchInput:
          env.JIOHOTSTAR_SEARCH_FIELD_SELECTOR ??
          '//android.widget.EditText[@resource-id="tag_search_bar"]',
      resultsPage:
          env.JIOHOTSTAR_RESULTS_PAGE_SELECTOR ??
          '//android.view.View[@resource-id="tag_search_results_page"]',
      searchResults:
          env.JIOHOTSTAR_RESULT_SELECTOR ??
          'android=new UiSelector().resourceId("tag_search_result_horizontal_card_playable").instance(2)',
    };

    await runAndroidTest({
      appPackage: jioHotstarAppPackage,
      appActivity: jioHotstarAppActivity,
      testFn: async (driver) => {
        await assertText(driver, selectors.searchButton, "Search", "Search Button");
        await click(driver, selectors.searchButton);
        await setValue(driver, selectors.searchInput, searchText);
        await driver.pressKeyCode(66);
        await click(driver, selectors.searchResults);
        console.log(
            `Started JioHotstar playback for result of "${searchText}".`,
        );
        await driver.pause(30000);

      },
    });


