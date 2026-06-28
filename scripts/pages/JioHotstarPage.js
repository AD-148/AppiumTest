import { BasePage } from './BasePage.js';

export class JioHotstarPage extends BasePage {
  constructor(driver) {
    super(driver);
    const env = process.env;
    this.searchButtonSelector = env.JIOHOTSTAR_SEARCH_ENTRY_SELECTOR ?? '//android.view.View[@content-desc="Search"]';
    this.searchInputSelector = env.JIOHOTSTAR_SEARCH_FIELD_SELECTOR ?? '//android.widget.EditText[@resource-id="tag_search_bar"]';
    this.resultsPageSelector = env.JIOHOTSTAR_RESULTS_PAGE_SELECTOR ?? '//android.view.View[@resource-id="tag_search_results_page"]';
    this.searchResultsSelector = env.JIOHOTSTAR_RESULT_SELECTOR ?? 'android=new UiSelector().resourceId("tag_search_result_horizontal_card_playable").instance(2)';
  }

  async searchFor(text) {
    // Assert search button is displayed before clicking
    const searchBtn = await this.findElement(this.searchButtonSelector);
    await searchBtn.waitForDisplayed({ timeout: 20000 });
    await this.assertDisplayed(searchBtn, "Search Button");

    // Click search button (click helper checks enabled/displayed)
    await this.click(this.searchButtonSelector, "Search Button");

    // Enter search text (setValue helper checks enabled/displayed)
    await this.setValue(this.searchInputSelector, text, "Search Input");
    await this.driver.pressKeyCode(66); // Enter key
  }

  async playThirdResult() {
    // Wait for the results page to be displayed
    const resultsPage = await this.findElement(this.resultsPageSelector);
    await resultsPage.waitForDisplayed({ timeout: 20000 });

    // Click the third playable search result
    await this.click(this.searchResultsSelector, "Third Search Result");
  }
}
