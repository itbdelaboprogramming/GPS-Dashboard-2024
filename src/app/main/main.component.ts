import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { WebsocketService } from '../services/websocket.service';
import { GpsdataService } from '../services/gpsdata.service';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import Feature, { FeatureLike } from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import { Icon, Style } from 'ol/style';
import Zoom from 'ol/control/Zoom';
import html2canvas from 'html2canvas';
import { fromLonLat } from 'ol/proj';
import { Geometry } from 'ol/geom';
import { Vector } from 'ol/source';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class TestComponent implements OnInit {
  public location1: any;
  public head1: any;
  public location2: any;
  public head2: any;
  public map: Map | undefined;
  public roomlength = 5;
  public payload: any;
  public vehicleList: any[] = [];
  public vectorSource = new VectorSource();
  constructor(
    public webSoc: WebsocketService,
    public gpsDat: GpsdataService,
    private location: Location,
    private route: Router
  ) {}

  ngOnInit() {
    this.webSoc.conn();
    this.gpsDat.Init();
    this.initMap();

    this.webSoc.listen("vehicle-list").subscribe((data: any) => {
      this.vehicleList = data;
      this.updateMapFeature(data);
    });
  }

  showNotification() {
    const notification = document.querySelector('.toast-notification')!!;
    if (notification) {
      notification.classList.remove('hidden');
    }
    notification.innerHTML = '&#9432 The location displayed for the disconnected robot is the last location it was connected';
  }
  updateMapFeature(data: any) {
    console.log("Updating map features");
    console.log(data);
    let foundDisconnected = false;
    for (let i = 0; i < data.length; i++) {
      if (data[i].data.state == "Disconnected") {
        foundDisconnected = true;
      }

      const feature = new Feature({
        geometry: new Point(
          fromLonLat([
            data[i].data.long,
            data[i].data.lat
          ])
        )
      });

      feature.setStyle(
        new Style({
          image: new Icon({
            src: 'assets/arrow.svg',
            size: [600, 600],
            scale: 0.1,
            color: "#97E5F4"
          })
        })
      );

      feature.setId(data[i].id);
      this.vectorSource.addFeature(feature);
    }
    if (foundDisconnected) {
      this.showNotification();
    } else {
      const notification = document.querySelector('.toast-notification')!!;
      notification.classList.add('hidden');
    }
  }


  iconVisible() {
    for (let i = 0; i < this.vehicleList.length; i++) {
      const elm = document.getElementById("check" + this.vehicleList[i]) as HTMLInputElement;
      if (elm.checked === true) {
        this.vectorSource.getFeatureById(this.vehicleList[i].id)!!.setStyle(
          new Style({
            image: new Icon({
              src: 'assets/arrow.svg',
              size: [600, 600],
              scale: 0.1
            })
          })
        );
      } else {
        this.vectorSource.getFeatureById(this.vehicleList[i].id)!!.setStyle(
          undefined
        );

      }
    }
  }

  deletevehc(id: any) {
    this.webSoc.emit("dellist", id);
  }

  getdisDate() {
    const months = [
      "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ];
    const dt = new Date();
    return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`;
  }

  getdisTime() {
    const now = new Date();
    const formattedHours = now.getHours().toString().padStart(2, '0');
    const formattedMinutes = now.getMinutes().toString().padStart(2, '0');
    return `${formattedHours}-${formattedMinutes}`;
  }

  captureScreenshot() {
    const element = document.getElementById('wholeapp') as HTMLInputElement;
    html2canvas(element).then((canvas) => {
      const screenshotData = canvas.toDataURL();
      const link = document.createElement('a');
      link.href = screenshotData;
      link.download = `${this.getdisTime()}_${this.getdisDate()}`;
      link.click();
    });
  }

  parseinteg(int: any) {
    return parseInt(int);
  }

  rgbToHex(red: any, green: any, blue: any) {
    const redHex = red.toString(16).padStart(2, '0');
    const greenHex = green.toString(16).padStart(2, '0');
    const blueHex = blue.toString(16).padStart(2, '0');
    return `#${redHex}${greenHex}${blueHex}`;
  }

  iconColor(i: any) {
    const inum = parseInt(i);
    if (inum < 8 && inum % 2 === 1) {
      return this.rgbToHex(230 - inum * 30, 50, 230);
    } else if (inum < 8) {
      return this.rgbToHex(50, 230 - inum * 30, 230);
    } else if (inum < 22 && inum % 2 === 1) {
      return this.rgbToHex(230, 50, 230 - inum * 10);
    } else {
      return this.rgbToHex(50, 230, 230 - inum * 10);
    }
  }

  toggleTable() {
    const toggleBtn = document.querySelector('.burger-table');
    const sidebar = document.querySelector('.device-list');

    if (toggleBtn && sidebar) {
      toggleBtn.classList.toggle('is-closed');
      sidebar.classList.toggle('is-closed');
    }
  }

  initMap() {
    const vectorLayer = new VectorLayer({
      source: this.vectorSource, 
    });

    this.map = new Map({
    target: 'map',
    controls: [],
    layers: [
      new TileLayer({
        source: new OSM()
      }),
      vectorLayer
    ],
    view: new View({
      center: fromLonLat([0, 0]),
      zoom: 2,
      enableRotation: false
    })
  });

  }

  zoomIn() {
    if (this.map) {
      const zoom = this.map.getView().getZoom()
      this.map?.getView().setZoom(zoom!! + 1);
    }
  }

  zoomOut() {
    if (this.map) {
      const zoom = this.map.getView().getZoom()
      this.map?.getView().setZoom(zoom!! - 1);
    }
  }

  newZoom(lon: any, lat: any) {
    if (this.map) {
      this.map.setView(new View({
        center: fromLonLat([lon, lat]),
        zoom: this.map.getView().getZoom(),
        enableRotation: false
      }));
    }
  }
}

