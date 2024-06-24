import { Injectable, OnInit } from '@angular/core'
import { WebsocketService } from './websocket.service'

@Injectable({
  providedIn: 'root',
})
export class GpsdataService {
  public parsedData: any
  public long: any
  public lat: any
  public head: any
  public sat: any
  public hdop: any
  public longi: any
  public lati: any
  public listLength: any
  public carList: any
  public payload: any
  public location1 = {
    longitude: 0,
    latitude: 0,
  }
  public location2 = {
    longitude: 0,
    latitude: 0,
  }

  constructor(private webSoc: WebsocketService) {}

  // Function to start receiving data from websocket
  Init() {
    this.webSoc.listen('vehicle-list').subscribe((data: any) => {
      // console.log("this is from gps service")
      this.carList = data
      // console.log("this is the car list")
      // console.log(this.carList)
      this.listLength = this.carList.length
    })
    // this.webSoc.emit("room","robot1")
    // this.webSoc.emit("room","robot2")

    this.webSoc.listen('location-next').subscribe((data: any) => {
      // The data from raspberry pi client needs to be converted from string to json format
      this.parsedData = JSON.parse(data)

      this.long = this.parsedData.longitude
      this.lat = this.parsedData.latitude
      // this.head=this.parsedData.heading
      // this.head=0
      this.sat = this.parsedData.satelite
      this.hdop = this.parsedData.hdop
    })
    this.webSoc.listen('heading-next').subscribe((data: any) => {
      // The data from raspberry pi client needs to be converted from string to json format
      this.parsedData = JSON.parse(data)

      this.head = this.parsedData.heading
    })
  }

  // Function to get heading data
  heading() {
    console.log('Heading : ' + this.head)
    return this.head
  }

  // Function to get hdop data
  gethdop() {
    console.log('HDOP : ' + this.hdop)
    return this.hdop
  }

  // Function to get number of satelite
  sateliteCount() {
    console.log('Satelite : ' + this.sat)

    return this.sat
  }

  // Function to get coordinate data
  coordinate() {
    console.log('Latitude : ' + this.lat)
    console.log('Longitude : ' + this.long)
    return [this.long, this.lat]
  }

  carlistgan() {
    console.log(this.carList)
    return [this.carList]
  }

  gpsSwarm() {
    // var nextpayload
    // if(room==this.payload.room){
    //   nextpayload = this.payload.data

    // }

    return this.payload

    // this.webSoc.listen("gps").subscribe((data:any)=>{
    //   if(room==data.room){
    //     console.log(data)
    //     return data.data
    //   }
    // })
  }
}
