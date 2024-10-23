import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { io } from 'socket.io-client'

declare var WebSocket: any

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  public socket: any
  public gpsData: any

  constructor() {
    this.socket = io('http://localhost:3000/consumer')
  }

  listen(eventName: string, namespace: string = '/consumer') {
    return new Observable((subscriber: any) => {
      this.socket.on(eventName, (data: any) => {
        subscriber.next(data);
      });
    });
  }

  emit(eventName: any, data: any, namespace: string = '/consumer') {
    this.socket.emit(eventName, data, namespace);
  }
}
