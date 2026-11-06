import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(token: string): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      // função: a cada reconexão pega o token atualizado
      auth: (cb) => cb({ token }),
      autoConnect: false,
    });
  }
  return socket;
}