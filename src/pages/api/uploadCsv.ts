import { PuppeteerService } from '@services/puppeteerService';
import { NextApiRequest, NextApiResponse } from 'next';
import Container from 'typedi';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('Uploading csv...');
  const puppeteerService = Container.get(PuppeteerService);
  const url = req.body.url;
  console.log(`url: ${url}`);
  const fileContent = req.body.fileContent;
  console.log(`fileContent: ${fileContent}`);

  try {
    await puppeteerService.uploadFile(url, fileContent);
    res.status(200).json({ message: 'File uploaded successfully' });
  } catch (error) {
    console.error('File upload failed: ' + error);
    res.status(500).json({ message: 'File upload failed', error });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
