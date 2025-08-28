import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { CONFIG } from '../config/buildConfig';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children, userId }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(CONFIG.SOCKET_URL, { transports: ['websocket'] });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      if (__DEV__) console.log('Connected to socket server');
      if (userId) {
        newSocket.emit('join', userId);
        if (__DEV__) console.log(`User ${userId} joined room`);
      }
    });

    newSocket.on('disconnect', () => {
      if (__DEV__) console.log('Disconnected from socket server');
    });

    return () => newSocket.close();
  }, [userId]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
