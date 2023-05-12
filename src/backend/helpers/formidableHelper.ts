import { Fields, Files, IncomingForm } from 'formidable';
import { NextApiRequest, NextApiResponse } from 'next';

const processRequestWithFiles = (
  req: NextApiRequest,
  res: NextApiResponse,
  process: (fields: Fields, files: Files) => Promise<void>
) => {
  const form = new IncomingForm({
    keepExtensions: true,
    multiples: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      res.status(500).send('Request form has errors: ' + err);
      return;
    }
    try {
      await process(fields, files);
    } catch (error: any) {
      console.error(err);
      res.status(500).send('Cannot process request: ' + error);
    }
  });
};

export { processRequestWithFiles };
