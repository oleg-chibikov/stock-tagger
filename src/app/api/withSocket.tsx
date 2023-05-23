import React, { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket } from './socket';

const withSocket = (WrappedComponent: React.ComponentType<any>) => {
  const WithSocket = (props: any) => {
    useEffect(() => {
      let socket: Socket | null = null;

      const init = async () => {
        socket = await getSocket();
      };

      init();

      return () => {
        socket?.disconnect();
      };
    }, []);

    return <WrappedComponent {...props} />;
  };

  // Set the display name for the wrapped component
  WithSocket.displayName = `WithSocket(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithSocket;
};

export { withSocket };
