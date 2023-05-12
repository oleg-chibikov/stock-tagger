import { apiHandler } from '@backendHelpers/apiHelper';
import { eventHandler } from '@backendHelpers/sseHelper';
import { PROGRESS } from '@dataTransferTypes/event';
import { NextApiRequest, NextApiResponse } from 'next';

const streamProgressEvents = (_req: NextApiRequest, res: NextApiResponse) => {
  eventHandler(PROGRESS, res);
};

export default apiHandler({
  POST: streamProgressEvents,
});
