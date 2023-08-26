import { collectionToString } from '@appHelpers/collectionHelper';
import { apiHandler } from '@backendHelpers/apiHelper';
import { CANCEL } from '@dataTransferTypes/event';
import { Operation } from '@dataTransferTypes/operation';
import { EventEmitter } from 'events';
import { Server as HTTPServer } from 'http';
import { Socket as NetSocket } from 'net';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  Server as IOServer,
  Socket as IOSocket,
  ServerOptions,
} from 'socket.io';
import Container from 'typedi';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface SocketServer extends HTTPServer {
  io?: IOServer | undefined;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

const handle = async (_req: NextApiRequest, res: NextApiResponse) => {
  const socketRes = res as NextApiResponseWithSocket;
  if (!socketRes.socket.server.io) {
    console.log('New Socket.io server...');
    // adapt Next's net Server to http Server
    const httpServer = socketRes.socket.server;
    const eventEmitter = Container.get(EventEmitter);
    const io = new IOServer(httpServer, {
      path: '/api/socketio',
      addTrailingSlash: false, // super important for latest version of Next.js
    } as ServerOptions); // Type assertion to ServerOptions
    // append SocketIO server to Next.js socket server response
    socketRes.socket.server.io = io;
    io.on('connect', (socket: IOSocket) => {
      console.log('Socket connected: ' + socket.id);

      socket.on(CANCEL, (operations: Operation[]) => {
        console.log(
          `Got cancellation request for ${collectionToString(
            operations
          )} operations`
        );
        eventEmitter.emit(CANCEL, operations);
      });
    });
    io.on('disconnect', (socket: IOSocket) => {
      console.log('Socket disconnected: ' + socket.id);
    });
  }
  res.end();
};

export type { NextApiResponseWithSocket };
export default apiHandler({
  GET: handle,
});
