import { withCancellation } from '@appHelpers/cancellationToken';
import { apiHandler } from '@backendHelpers/apiHelper';
import { processRequest } from '@backendHelpers/formidableHelper';
import { PuppeteerService } from '@services/puppeteerService';
import { NextApiRequest, NextApiResponse } from 'next';
import Container from 'typedi';

const uploadCsv = async (req: NextApiRequest, res: NextApiResponse) => {
  processRequest(res, async () => {
    console.log('Uploading csv...');
    await withCancellation('upload_csv', async (cancellationToken) => {
      const puppeteerService = Container.get(PuppeteerService);
      const url = req.body.url;
      console.log(`url: ${url}`);
      const fileContent = req.body.fileContent;
      console.log(`fileContent: ${fileContent}`);

      await puppeteerService.uploadFile(url, fileContent, cancellationToken);
    });
  });
};

export const config = {
  api: {
    bodyParser: true,
  },
};

export default apiHandler({
  POST: uploadCsv,
});
