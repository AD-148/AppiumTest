import { BasePage } from './BasePage.js';

export class YouTubePage extends BasePage {
  constructor(driver) {
    super(driver);
    const env = process.env;
    this.searchButtonSelector = env.YOUTUBE_SEARCH_ENTRY_SELECTOR ?? '//android.widget.ImageView[@content-desc="Search"]';
    this.searchInputSelector = env.YOUTUBE_SEARCH_FIELD_SELECTOR ?? '//android.widget.EditText[@resource-id="com.google.android.youtube:id/search_edit_text"]';
    this.scrollableContainer = 'android=new UiScrollable(new UiSelector().resourceId("com.google.android.youtube:id/results"))';
    this.targetSelector = 'new UiSelector().className("android.view.ViewGroup").descriptionMatches(".+")';
  }

  async searchFor(text) {
    // Assert search button is displayed before clicking
    const searchBtn = await this.findElement(this.searchButtonSelector);
    await searchBtn.waitForDisplayed({ timeout: 20000 });
    await this.assertDisplayed(searchBtn, "Search Button");
    await this.assertText(searchBtn, "Search", "Search Button");

    // Click search button (click helper checks enabled/displayed)
    await this.click(this.searchButtonSelector, "Search Button");

    // Enter search text (setValue helper checks enabled/displayed)
    await this.setValue(this.searchInputSelector, text, "Search Input");
    await this.driver.pressKeyCode(66); // Enter key
  }

  async playThirdResult() {
    // Scroll until the 3rd (index 2) item is found and click it
    const selector = `${this.scrollableContainer}.scrollIntoView(${this.targetSelector}.instance(2))`;
    await this.click(selector, "Third Search Result");
  }
}
