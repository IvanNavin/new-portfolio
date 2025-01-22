import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '@app/types';
import { log } from '@repo/utils';
import { Server as HttpServer } from 'http';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer, Socket } from 'socket.io';

type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: {
      io?: SocketIOServer<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
      >;
    };
  };
};

export default function SocketHandler(
  _req: NextApiRequest,
  res: NextApiResponseWithSocket,
) {
  // Перевірка чи сервер уже ініціалізований
  if (!res.socket.server.io) {
    log('Initializing Socket.IO server...');
    const httpServer: HttpServer = res.socket.server as unknown as HttpServer;

    const io = new SocketIOServer<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >(httpServer, {
      path: '/api/socket',
    });

    io.on(
      'connection',
      (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
        log('New player connected:', socket.id);

        // Обробка подій від клієнта
        socket.on('move', (data) => {
          log('Player moved:', data);
          socket.broadcast.emit('playerMoved', data); // Pass the event on to other customers
        });

        socket.on('disconnect', () => {
          log('Player disconnected:', socket.id);
        });
      },
    );

    res.socket.server.io = io;
  } else {
    log('Socket.IO server already running.');
  }

  res.end();
}
