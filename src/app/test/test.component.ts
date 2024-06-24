import { WebsocketService } from '../services/websocket.service'
import 'ol/ol.css'
import Tile from 'ol/layer/Tile'
import Map from 'ol/Map'
import Overlay from 'ol/Overlay'
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'
import { toLonLat } from 'ol/proj.js'
import { fromLonLat } from 'ol/proj.js'
import View from 'ol/View'
import OSM from 'ol/source/OSM.js'

import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import { Icon, Style } from 'ol/style'
import Zoom from 'ol/control/Zoom.js'
import html2canvas from 'html2canvas'
import { Location } from '@angular/common'
import { Route, Router } from '@angular/router'

import { Title } from '@angular/platform-browser'
import { GpsdataService } from '../services/gpsdata.service'

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css'],
})
export class TestComponent implements OnInit {
  public location1: any
  public head1: any
  public location2: any
  public head2: any
  public map: Map | undefined
  public tesobj: any
  public roomlength = 5
  public payload: any
  public newLength = 0
  public initLength = 0
  public vehicleList = []
  public robotarrn: VectorLayer[] = []
  public paylod: any
  public payarr: any = []

  constructor(
    public webSoc: WebsocketService,
    public gpsDat: GpsdataService,
    private location: Location,
    private route: Router,
  ) {}

  ngOnInit() {
    this.webSoc.conn()
    this.gpsDat.Init()
    this.webSoc.listen('vehicle-list').subscribe((data: any) => {
      this.vehicleList = data
      console.log(this.vehicleList)
      this.newLength = this.vehicleList.length
      console.log('dari initLength : ' + this.initLength)

      if (this.newLength != this.initLength && this.initLength != 0) {
        //  this.layerdev(this.newLength)
        //  this.tableColor(this.newLength)
        //  this.initLength = this.newLength
        this.refreshPage()
      }
      if (this.initLength == 0) {
        this.layerdev(this.newLength)
        this.tableColor(this.newLength)
        this.initLength = this.newLength
      }

      // this.initLength = this.newLength
    })

    this.payarr = new Array(this.newLength)

    this.webSoc.listen('gps-then').subscribe((data: any) => {
      console.log(data)

      this.paylod = data
      this.payarr[parseInt(this.paylod.id) - 1] = this.paylod.data
      // console.log(this.payarr)
      var checkbox = document.getElementById(this.paylod.id)

      var refFeature = new Feature({
        // geometry : new Point(fromLonLat(MavlinkService.getCoordinate()))
        geometry: new Point(
          fromLonLat([
            this.payarr[parseInt(this.paylod.id) - 1].longitude,
            this.payarr[parseInt(this.paylod.id) - 1].latitude,
          ]),
        ),
      })

      refFeature.setStyle(
        new Style({
          image: new Icon({
            src: 'assets/arrow.svg',
            imgSize: [600, 600],
            scale: 0.1,
            color: this.iconColor(this.paylod.id),
          }),
        }),
      )

      var refSource = new VectorSource({
        features: [refFeature],
      })

      this.robotarrn[parseInt(this.paylod.id) - 1].setSource(refSource)
    })
    setTimeout(() => {
      for (var i = 0; i < this.newLength; i++) {
        var element = document.getElementById(this.vehicleList[i]) // Replace 'custom-element' with the ID of your HTML component
        if (element) {
          element.style.backgroundColor = this.iconColor(this.vehicleList[i])
        }
      }
    }, 2000)
  }

  iconVisible() {
    for (var i = 0; i < this.newLength; i++) {
      var elm = document.getElementById(
        'check' + this.vehicleList[i],
      ) as HTMLInputElement
      if (elm.checked == true) {
        this.robotarrn[i].setVisible(true)
      } else {
        this.robotarrn[i].setVisible(false)
      }
    }
  }
  refreshPage() {
    this.location.go(this.location.path()) // Navigates to the current route
    window.location.reload() // Reloads the page
    // this.route.navigate(['/main'])
  }

  deletevehc(id: any) {
    this.webSoc.emit('dellist', id)
  }

  getdisDate() {
    var months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]
    var dt = new Date()
    var curmonth = months[dt.getMonth()]
    var curdate = dt.getDate()
    var textdate = curdate.toString()
    var curyear = dt.getFullYear()
    var textyear = curyear.toString()

    return textdate + ' ' + curmonth + ' ' + textyear
  }

  getdisTime() {
    var now = new Date()
    var hours = now.getHours()
    var minutes = now.getMinutes()

    // Formatting the hours and minutes to have leading zeros if needed
    var formattedHours = hours < 10 ? '0' + hours : hours
    var formattedMinutes = minutes < 10 ? '0' + minutes : minutes

    return formattedHours + '-' + formattedMinutes
  }

  captureScreenshot() {
    const element = document.getElementById('wholeapp') as HTMLInputElement // Replace 'elementId' with the ID of the element you want to capture
    html2canvas(element).then((canvas) => {
      const screenshotData = canvas.toDataURL() // Convert the canvas image to base64 data URL
      const link = document.createElement('a')
      link.href = screenshotData
      link.download = this.getdisTime() + '_' + this.getdisDate() // Set the desired filename for the downloaded screenshot
      link.click()
    })
  }

  parseinteg(int: any) {
    return parseInt(int)
  }
  rgbToHex(red: any, green: any, blue: any) {
    // Convert each RGB component to hexadecimal
    var redHex = red.toString(16).padStart(2, '0')
    var greenHex = green.toString(16).padStart(2, '0')
    var blueHex = blue.toString(16).padStart(2, '0')

    // Concatenate the components to form the hex code
    var hexCode = '#' + redHex + greenHex + blueHex

    return hexCode
  }

  iconColor(i: any) {
    var foricon: any
    var inum = parseInt(i)

    if (inum < 8 && inum % 2 == 1) {
      foricon = this.rgbToHex(230 - inum * 30, 50, 230)
    }
    if (inum < 8 && inum % 2 != 1) {
      foricon = this.rgbToHex(50, 230 - inum * 30, 230)
    }

    if (inum >= 8 && inum < 22 && inum % 2 == 1) {
      foricon = this.rgbToHex(230, 50, 230 - inum * 10)
    }
    if (inum >= 8 && inum < 22 && inum % 2 != 1) {
      foricon = this.rgbToHex(50, 230, 230 - inum * 10)
    }

    return foricon
  }

  tableColor(list: any) {
    for (var i = 0; i < list.length; i++) {
      const element = document.getElementById(list[i]) // Replace 'custom-element' with the ID of your HTML component
      if (element) {
        element.style.backgroundColor = this.iconColor(i + 1)
      }
    }
  }

  roomi(room: any) {
    this.webSoc.emit('room', room)
    this.webSoc.listen('location1').subscribe((data: any) => {
      console.log(data)
      if (data.room == 'robot1') {
        this.location1 = data.data
      }
      if (data.room == 'robot2') {
        this.location2 = data.data
      }
    })
    this.webSoc.listen('heading1').subscribe((data: any) => {
      console.log(data)
      if (data.room == 'robot1') {
        this.head1 = data.data
      }
      if (data.room == 'robot2') {
        this.head2 = data.data
      }
    })
  }

  toggleTable() {
    var toggleBtn = document.querySelector('.burger-table')
    var sidebar = document.querySelector('.device-list')

    if (toggleBtn != null && sidebar != null) {
      toggleBtn.classList.toggle('is-closed')
      sidebar.classList.toggle('is-closed')
    }
  }
  newZoom(lon: any, lat: any) {
    if (this.map) {
      this.map.setView(
        new View({
          center: fromLonLat([lon, lat]),
          zoom: 20,
          enableRotation: false,
        }),
      )
    }
  }

  layerdev(length: any) {
    var aslilength = length
    var robotarr: VectorLayer[] = []

    for (var i = 0; i < aslilength; i++) {
      var gpsFeature = new Feature({
        geometry: new Point(
          fromLonLat([
            106.920671 - 0.0001 * Math.random(),
            -6.167175 - 0.0001 * Math.random(),
          ]),
        ),
      })

      gpsFeature.setStyle(
        new Style({
          image: new Icon({
            src: 'assets/arrow.svg',
            imgSize: [600, 600],
            scale: 0.1,
          }),
        }),
      )

      // gpsFeature.setId(listRoom[i])

      var gpsLayer = new VectorLayer({
        source: new VectorSource({
          features: [gpsFeature],
        }),
      })

      robotarr.push(gpsLayer)
      this.robotarrn.push(gpsLayer)
    }

    // Make a map and setup the map source, layer, and view
    this.map = new Map({
      target: 'map',
      controls: [],
      layers: [
        new Tile({
          source: new OSM(),
        }),
        //MapLayer
      ],
      view: new View({
        center: fromLonLat([106.920671, -6.167175]),
        zoom: 1,
        enableRotation: false,
      }),
    })

    this.map.addControl(
      new Zoom({
        className: 'zoom-control',
        zoomInLabel: '+',
        zoomOutLabel: '-',
      }),
    )

    // this.map.addLayer(gpsLayer)
    for (var i = 0; i < aslilength; i++) {
      this.map.addLayer(this.robotarrn[i])
    }
  }
}
