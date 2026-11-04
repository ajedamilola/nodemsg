import net, { Server, Socket } from 'node:net';

class TCP {
  static server: Server
  static startServer(port: number, handle: (socket: Socket) => void) {
    //Do handling of errors
    return new Promise((resolve) => {
      TCP.server = net.createServer((socket) => {
        console.log("Recieved request from:", socket.remoteAddress, socket.remotePort)
        socket.on('end', () => console.log('client disconnected'));

        //TODO: Handle flushing messages to the SQL Persistent Database
        socket.on('error', (err) => console.error('socket error:', err.message));

        handle(socket)

      })

      TCP.server.listen(port, () => {
        console.log("Server is running on ", port)
      })


    })

  }

  static startClient(port: number) {
    const client = net.createConnection({ host: '127.0.0.1', port }, () => { });
    return client
  }
}

export default TCP