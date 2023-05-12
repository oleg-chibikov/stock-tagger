import { apiHandler } from '@backendHelpers/apiHelper';
import { PuppeteerService } from '@services/puppeteerService';
import { NextApiRequest, NextApiResponse } from 'next';
import Container from 'typedi';

const uploadCsv = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('Uploading csv...');
  const puppeteerService = Container.get(PuppeteerService);
  const url = req.body.url;
  console.log(`url: ${url}`);
  const fileContent = req.body.fileContent;
  console.log(`fileContent: ${fileContent}`);

  await puppeteerService.uploadFile(url, fileContent);
  res.status(200).json({ message: 'File uploaded successfully' });
};

export const config = {
  api: {
    bodyParser: true,
  },
};

export default apiHandler({
  POST: uploadCsv,
});
