import { apiHandler } from '@backendHelpers/apiHelper';
import { eventHandler } from '@backendHelpers/sseHelper';
import { CAPTION_AVAILIABLE } from '@dataTransferTypes/event';
import { NextApiRequest, NextApiResponse } from 'next';

const streamCaptionEvents = (req: NextApiRequest, res: NextApiResponse) => {
  eventHandler(CAPTION_AVAILIABLE, req, res);
};

export default apiHandler({
  GET: streamCaptionEvents,
});
