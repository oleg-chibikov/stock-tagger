import { delay } from '@appHelpers/promiseHelper';
import {
  clickBySelector,
  clickByXPath,
  getCountOfSelectedElements,
  selectOptionBySelector,
  uploadFileBySelector,
} from '@backendHelpers/puppeteerHelper';
import * as fs from 'fs';
import * as os from 'os';
import path from 'path';
import puppeteer from 'puppeteer';
import { Service } from 'typedi';

interface PuppeteerResult {
  caption: string;
  similarity: number;
}

const chromeExecutablePath = process.env.CHROME_ANOTHER_INSTANCE_PATH;
const chromeUserDataDir = process.env.CHROME_ANOTHER_INSTANCE_USER_DATA_PATH;

const countLines = (csvString: string): number => {
  // Split the string by newline characters
  const lines = csvString.split('\n');

  // Subtract one for the header line
  return lines.length - 1;
};

@Service()
class PuppeteerService {
  async uploadFile(url: string, fileContent: string) {
    console.log('Save the fileContent to a temporary file');
    const fileCount = countLines(fileContent);
    console.log(`${fileCount} files in the csv`);
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
        await uploadFileBySelector(page, 'input[type=file]', tmpFilePath);
        await clickBySelector(page, "button[data-t='csv-modal-upload']");

        console.log('Click the "Refresh to view changes" button');
        await clickByXPath(
          page,
          "//button[contains(@class, 'button') and descendant::span[contains(text(), 'Refresh to view changes')]]"
        );

        let selectedImages = 0;
        while (selectedImages !== fileCount) {
          console.log('Click the checkbox to select all images');
          await clickByXPath(
            page,
            "//a[contains(@class, 'nav__link') and descendant::span[contains(text(), 'Select All')]]"
          );
          await delay(1000);
          selectedImages = await getCountOfSelectedElements(
            page,
            'div[role="option"][aria-selected="true"]'
          );
          console.log(
            `There are ${selectedImages} selected images on the page`
          );
        }

        console.log('Select the "Illustrations" option');
        selectOptionBySelector(page, 'select[aria-label="File type"]', '2');

        // console.log('Click on the No recognizable people radio button');
        // await clickByXPath(page, '//label[contains(span/span/text(), "No")]');

        console.log('Click the Generative AI checkbox');
        await clickBySelector(page, '#content-tagger-generative-ai-checkbox');

        console.log('Click the People and Property are fictional checkbox');
        await clickBySelector(
          page,
          '#content-tagger-generative-ai-property-release-checkbox'
        );

        console.log('Click the Submit Button');
        await clickBySelector(
          page,
          "button[data-t='submit-moderation-button']"
        );

        console.log('Click the Reviewed Guidelines');
        await clickBySelector(page, '#tc-reviewed-guidelines');

        console.log('Click the Understand Guidelines');
        await clickBySelector(page, '#tc-understand-guidelines');

        console.log('Click the Continue Button in Modal');
        await clickBySelector(
          page,
          "button[data-t='continue-moderation-button']"
        );

        console.log('Click the Send Button in Modal');
        await clickBySelector(page, "button[data-t='send-moderation-button']");

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

export { PuppeteerService };
export type { PuppeteerResult };
