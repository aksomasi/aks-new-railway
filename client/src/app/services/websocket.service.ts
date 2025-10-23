import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000');
  }

  onNewOrder(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('newOrder', (order) => observer.next(order));
    });
  }

  onOrderUpdate(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('orderUpdate', (order) => observer.next(order));
    });
  }

  disconnect() {
    this.socket.disconnect();
  }
}