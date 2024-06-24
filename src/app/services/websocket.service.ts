import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { io } from 'socket.io-client'

declare var WebSocket: any

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  public socket: any
  public webSocket: any
  public gpsdata: any
  public ipAdd: any

  constructor() {}

  conn() {
    // var ip = localStorage.getItem("ip")
    // this.socket = io("http://"+ip)
    this.socket = io('http://localhost:3000')
    console.log('connected to server')
  }

  // Function to listen to an event
  listen(eventName: string) {
    // this.socket = io("http://"+this.ipAdd)
    this.socket.on('hello', (arg: any) => {
      // console.log(arg); // world
      // console.log(-6.5360378062373)
    })

    return new Observable((subscriber: any) => {
      this.socket.on(eventName, (data: any) => {
        subscriber.next(data)
        // console.log('test')
      })
    })
  }

  // Function to send a message/data in specific event
  emit(eventName: any, data: any) {
    this.socket.emit(eventName, data)
  }
}
