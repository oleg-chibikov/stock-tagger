import { EventEmitter } from 'events';
import { NextApiResponse } from 'next';
import Container from 'typedi';

interface EventHandler {
  event: string;
  handler: (data: any) => void;
}

const eventHandlers: EventHandler[] = [];

export function eventHandler(event: string, res: NextApiResponse) {
  console.log(`Listening for ${event} events...`);

  // Remove previous event handler, if it exists
  const existingHandlerIndex = eventHandlers.findIndex(
    (handler) => handler.event === event
  );
  if (existingHandlerIndex !== -1) {
    const existingHandler = eventHandlers[existingHandlerIndex];
    const emitter = Container.get(EventEmitter);
    emitter.removeListener(existingHandler.event, existingHandler.handler);
    eventHandlers.splice(existingHandlerIndex, 1);
  }

  const emitter = Container.get(EventEmitter);
  const eventHandler = (data: any) => {
    const dataStr = JSON.stringify(data);
    console.log(`Received backend internal event ${event}: ${dataStr}`);
    res.write(`event: ${event}\ndata: ${dataStr}\n\n`);
  };

  // Store the event handler reference
  eventHandlers.push({ event, handler: eventHandler });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  res.write('data: Connected\n\n');
  emitter.on(event, eventHandler);
}
