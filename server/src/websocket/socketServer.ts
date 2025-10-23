import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

export class SocketServer {
  private io: Server;

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"]
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  public emitNewOrder(order: any) {
    this.io.emit('newOrder', order);
  }

  public emitOrderUpdate(order: any) {
    this.io.emit('orderUpdate', order);
  }
}

export let socketServer: SocketServer;