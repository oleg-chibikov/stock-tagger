import { CAPTION_AVAILIABLE } from '@dataTransferTypes/event';
import { NextApiRequest, NextApiResponse } from 'next';
import { eventHandler } from '../../backend/helpers/sseHelper';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  eventHandler(CAPTION_AVAILIABLE, res);
}
