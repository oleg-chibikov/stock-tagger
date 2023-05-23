import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let isSocketInitializing = false;

const initializeSocket = () => {
  return new Promise<Socket>((resolve, reject) => {
    if (socket) {
      resolve(socket);
    } else {
      const newSocket = io({
        path: '/api/socketio',
      }); // Connect to the same host and port as the client

      newSocket.on('connect', () => {
        console.log(`Socket connected: ${newSocket.id}`);
        socket = newSocket;
        resolve(socket);
      });

      newSocket.on('disconnect', () => {
        console.log(`Socket disconnected: ${newSocket.id}`);
      });

      newSocket.on('connect_error', (error: Error) => {
        console.error(`Socket connection error: ${newSocket.id}. `, error);
        reject(error);
      });
    }
  });
};

const getSocket = async (): Promise<Socket> => {
  if (socket) {
    return socket;
  }

  if (!isSocketInitializing) {
    isSocketInitializing = true;
    try {
      return await initializeSocket();
    } finally {
      isSocketInitializing = false;
    }
  }

  // Wait for the socket to initialize if another initialization is in progress
  return new Promise<Socket>((resolve) => {
    const checkSocket = () => {
      if (socket) {
        resolve(socket);
      } else {
        setTimeout(checkSocket, 100);
      }
    };

    checkSocket();
  });
};

export { getSocket };
