import { ElementHandle, Page } from 'puppeteer';

const clickByXPath = async (page: Page, selector: string) => {
  console.log('xpath///' + selector);
  const element = await page.waitForSelector('xpath///' + selector);

  if (!element) {
    throw new Error(`Element not found for selector: ${selector}`);
  }

  await element.evaluate((b) => (b as any).click());
};

const clickBySelector = async (page: Page, selector: string) => {
  await page.waitForSelector(selector);

  const element = await page.$(selector);
  if (!element) {
    throw new Error(`Element not found for selector: ${selector}`);
  }

  await element.click();
};

const uploadFileBySelector = async (
  page: Page,
  selector: string,
  filePath: string
) => {
  await page.waitForSelector(selector);

  const fileInputElement = await page.$(selector);
  if (!fileInputElement) {
    throw new Error(`File input element not found for selector: ${selector}`);
  }

  await (fileInputElement as ElementHandle<HTMLInputElement>).uploadFile(
    filePath
  );
};

const selectOptionBySelector = async (
  page: Page,
  selector: string,
  value: string
) => {
  await page.waitForSelector(selector);

  const selectElement = await page.$(selector);
  if (!selectElement) {
    throw new Error(`Select element not found for selector: ${selector}`);
  }

  await page.select(selector, value);
};

const getCountOfSelectedElements = async (
  page: Page,
  selector: string
): Promise<number> => {
  // Evaluate the count of elements that match the criteria
  const count = await page.$$eval(selector, (elements) => elements.length);
  return count;
};

export {
  clickBySelector,
  clickByXPath,
  getCountOfSelectedElements,
  selectOptionBySelector,
  uploadFileBySelector,
};
