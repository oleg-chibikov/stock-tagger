import { apiHandler } from '@backendHelpers/apiHelper';
import { eventHandler } from '@backendHelpers/sseHelper';
import { PROGRESS } from '@dataTransferTypes/event';
import { NextApiRequest, NextApiResponse } from 'next';

const streamProgressEvents = (req: NextApiRequest, res: NextApiResponse) => {
  eventHandler(PROGRESS, req, res);
};

export default apiHandler({
  GET: streamProgressEvents,
});
