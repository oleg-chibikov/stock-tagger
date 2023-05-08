import type { NextApiRequest, NextApiResponse } from 'next';
import bootHandler from '../../src/backend/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const bootedServices = await bootHandler();

  res.status(200).json({ bootedServices });
}
