import { delay } from '@appHelpers/promiseHelper';
import * as fs from 'fs';
import * as os from 'os';
import path from 'path';
import puppeteer, { ElementHandle, Page } from 'puppeteer';
import { Service } from 'typedi';

interface PuppeteerResult {
  caption: string;
  similarity: number;
}

const chromeExecutablePath = process.env.CHROME_ANOTHER_INSTANCE_PATH;
const chromeUserDataDir = process.env.CHROME_ANOTHER_INSTANCE_USER_DATA_PATH;

const clickByXPath = async (page: Page, selector: string) => {
  await page.waitForXPath(selector);
  const [uploadCsvLink] = await page.$x(selector);
  await (uploadCsvLink as ElementHandle<Element>).click();
};

@Service()
class PuppeteerService {
  async uploadFile(url: string, fileContent: string) {
    console.log('Save the fileContent to a temporary file');
    const tmpDir = os.tmpdir();
    const tmpFilePath = path.join(tmpDir, 'temp_upload.csv');
    fs.writeFileSync(tmpFilePath, fileContent);

    console.log('Launch a new browser and open a new page');
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: chromeExecutablePath,
      userDataDir: chromeUserDataDir,
      defaultViewport: null, // full width
    });

    try {
      let [page] = await browser.pages();
      if (!page) {
        page = await browser.newPage();
      }

      try {
        console.log('Go to the website');
        await page.goto(url); // Use the provided URL

        console.log('Click the button to open the file upload dialog');
        await clickByXPath(
          page,
          "//a[contains(@class, 'nav__link') and descendant::span[contains(text(), 'Upload CSV')]]"
        );

        console.log('Upload the file');
        const fileInputSelector = 'input[type=file]';
        await page.waitForSelector(fileInputSelector);
        const fileInputElement = await page.$(fileInputSelector);
        const filePath = tmpFilePath; // Use the temporary file path
        await fileInputElement!.uploadFile(filePath);

        const uploadButtonSelector = "button[data-t='csv-modal-upload']";
        await page.waitForSelector(uploadButtonSelector);
        await page.click(uploadButtonSelector);

        console.log('Click the "Refresh to view changes" button');

        await clickByXPath(
          page,
          "//button[contains(@class, 'button') and descendant::span[contains(text(), 'Refresh to view changes')]]"
        );

        console.log('Click the checkbox to select all images');
        await clickByXPath(
          page,
          "//a[contains(@class, 'nav__link') and descendant::span[contains(text(), 'Select All')]]"
        );

        await delay(2000);

        console.log('Click on the No recognizable people radio button');
        await clickByXPath(page, '//label[contains(span/span/text(), "No")]');

        console.log('Click the Generative AI checkbox');
        const generativeAiCheckboxSelector =
          '#content-tagger-generative-ai-checkbox';
        await page.waitForSelector(generativeAiCheckboxSelector);
        await page.click(generativeAiCheckboxSelector);

        console.log('Select the "Illustrations" option');
        const contentTypeSelector = 'select[aria-label="File type"]';
        await page.waitForSelector(contentTypeSelector);
        await page.select(contentTypeSelector, '2');

        console.log('Click the Submit Button');
        const submitButtonSelector =
          "button[data-t='submit-moderation-button']";
        await page.waitForSelector(submitButtonSelector);
        await page.click(submitButtonSelector);

        await delay(2000);

        console.log('Click the Submit Button in Modal');
        const submitButtonInModalSelector =
          "button[data-t='send-moderation-button']";
        await page.waitForSelector(submitButtonInModalSelector);
        await page.click(submitButtonInModalSelector);

        await delay(2000);
      } finally {
        console.log('Close the page');
        await page.close();
      }
    } finally {
      console.log('Close the browser');
      await browser.close();

      console.log('Clean up the temporary file');
      fs.unlinkSync(tmpFilePath);
    }
  }
}

export type { PuppeteerResult };
export { PuppeteerService };
