import { silentLog } from '@/cli/utils.js';
import net, { Server, Socket } from 'node:net';

class TCP {
  static server: Server
  static startServer(port: number, handle: (socket: Socket) => void) {
    //Do handling of errors
    TCP.server = net.createServer((socket) => {
      socket.on('end', () => console.log('client disconnected'));
      socket.on('error', (err) => console.error('socket error:', err.message));
      handle(socket)

    })

    TCP.server.listen(port, () => {
      console.log("Server is running on ", port)
    })

    return TCP.server

  }

  static startClient(host: string, port: number, handle: (client: Socket) => void) {
    const client = net.createConnection({ port, host }, () => {
    });

    client.on("connect", () => {
      handle(client)
    })

    client.on("error", (err: any) => {
      console.log("An error occured", err)
      if (err.code == "EHOSTUNREACH" || err.code == "ECONNREFUSED") {
        client.end()
      }
    })
    return client
  }
}

export default TCP