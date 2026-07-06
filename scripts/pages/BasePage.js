import assert from 'assert';

export class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  async findElement(selector) {
    return await this.driver.$(selector);
  }

  async assertDisplayed(element, name = "Element") {
    const isDisplayed = await element.isDisplayed();
    assert.ok(isDisplayed, `${name} is not displayed`);
  }

  async assertEnabled(element, name = "Element") {
    const isEnabled = await element.isEnabled();
    assert.ok(isEnabled, `${name} is not enabled`);
  }

  async assertText(element, expectedText, name = "Element") {
    const text = await element.getText();
    const contentDesc = await element.getAttribute("content-desc");
    assert.ok(
      text === expectedText || contentDesc === expectedText,
      `${name} text/content-desc is not "${expectedText}". Got text: "${text}", content-desc: "${contentDesc}"`
    );
  }

  async click(selector, name = "Element") {
    const element = await this.findElement(selector);
    await element.waitForDisplayed({ timeout: 20000 });
    await this.assertDisplayed(element, name);
    await this.assertEnabled(element, name);
    await element.click();
  }

  async setValue(selector, value, name = "Element") {
    const element = await this.findElement(selector);
    await element.waitForDisplayed({ timeout: 20000 });
    await this.assertDisplayed(element, name);
    await this.assertEnabled(element, name);
    await element.clearValue();
    await element.setValue(value);
  }
}
