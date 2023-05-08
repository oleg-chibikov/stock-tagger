import { EventEmitter } from 'events';
import { NextApiResponse } from 'next';
import Container from 'typedi';

export function eventHandler(event: string, res: NextApiResponse) {
  console.log(`Listening for ${event} events...`);
  const emitter = Container.get(EventEmitter);
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  res.write('data: Connected\n\n');
  emitter.on(event, (data) => {
    const dataStr = JSON.stringify(data);
    console.log(`Received backend internal event ${event}: ${dataStr}`);
    res.write(`event: ${event}\ndata: ${dataStr}\n\n`);
  });
}
