import { EventEmitter } from 'events';
import { NextApiRequest, NextApiResponse } from 'next';
import Container from 'typedi';

export function eventHandler(
  event: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(`Listening for ${event} events...`);

  const emitter = Container.get(EventEmitter);

  // const existingHandlers = emitter.listeners(event);
  // console.log('Existing event handlers: ' + existingHandlers.length);

  // // Remove previous event handlers, if they exist. TODO: This seems incorrect as it would remove the requests from all the clients even if they are still needed
  // // Probably we need sockets or to register these listeners once when the app starts
  // existingHandlers.forEach((handler) => {
  //   emitter.removeListener(event, handler as (...args: any[]) => void);
  // });

  const eventHandler = (data: any) => {
    const dataStr = JSON.stringify(data);
    console.log(`Received backend internal event ${event}: ${dataStr}`);
    res.write(`event: ${event}\ndata: ${dataStr}\n\n`);
    if (dataStr.indexOf('_done') !== -1 || dataStr.indexOf('_error') !== -1) {
      res.end();
      emitter.removeListener(event, eventHandler);
      console.log('Removed event listener');
    }
  };

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  res.write('data: Connected\n\n');

  emitter.on(event, eventHandler);
}
