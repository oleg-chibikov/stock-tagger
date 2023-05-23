import { apiHandler } from '@backendHelpers/apiHelper';
import { Server as HTTPServer } from 'http';
import { Socket as NetSocket } from 'net';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as IOServer, ServerOptions } from 'socket.io';

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
    const io = new IOServer(httpServer, {
      path: '/api/socketio',
      addTrailingSlash: false, // super important for latest version of Next.js
    } as ServerOptions); // Type assertion to ServerOptions
    // append SocketIO server to Next.js socket server response
    socketRes.socket.server.io = io;
    io.on('connect', () => {
      console.log('Socket connected');
    });
    io.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }
  res.end();
};

export type { NextApiResponseWithSocket };
export default apiHandler({
  GET: handle,
});
