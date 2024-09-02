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

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  public location1: any;
  public head1: any;
  public location2: any;
  public head2: any;
  public map: Map | undefined;
  public roomlength = 5;
  public payload: any;
  public newLength = 0;
  public initLength = 0;
  public vehicleList: any[] = [];
  public robotarrn: VectorLayer<FeatureLike>[] = [];
  public payarr: any[] = [];
  public paylod: any;

  constructor(
    public webSoc: WebsocketService,
    public gpsDat: GpsdataService,
    private location: Location,
    private route: Router
  ) {}

  ngOnInit() {
    this.webSoc.conn();
    this.gpsDat.Init();

    this.webSoc.listen("vehicle-list").subscribe((data: any) => {
      this.vehicleList = data;
      this.newLength = this.vehicleList.length;

      if (this.newLength !== this.initLength && this.initLength !== 0) {
        this.refreshPage();
      }
      if (this.initLength === 0) {
        this.layerdev(this.newLength);
        this.tableColor(this.newLength);
        this.initLength = this.newLength;
      }
    });

      this.webSoc.listen("gps-then").subscribe((data: any) => {
        this.updateGpsData(data);
      });

    setTimeout(() => {
      for (let i = 0; i < this.newLength; i++) {
        const element = document.getElementById(this.vehicleList[i]);
        if (element) {
          element.style.backgroundColor = this.iconColor(this.vehicleList[i]);
        }
      }
    }, 2000);
  }

  updateGpsData(data: any) {
    this.paylod = data;
    this.payarr[parseInt(this.paylod.id) - 1] = this.paylod.data;
    const refFeature = new Feature({
      geometry: new Point(
        fromLonLat([
          this.payarr[parseInt(this.paylod.id) - 1].longitude,
          this.payarr[parseInt(this.paylod.id) - 1].latitude
        ])
      )
    });

    refFeature.setStyle(
      new Style({
        image: new Icon({
          src: 'assets/arrow.svg',
          size: [600, 600],
          scale: 0.1,
          color: this.iconColor(this.paylod.id)
        })
      })
    );

    const refSource = new VectorSource<FeatureLike>({
      features: [refFeature]
    });

    this.robotarrn[parseInt(this.paylod.id) - 1].setSource(refSource);
  }

  iconVisible() {
    for (let i = 0; i < this.newLength; i++) {
      const elm = document.getElementById("check" + this.vehicleList[i]) as HTMLInputElement;
      if (elm.checked === true) {
        this.robotarrn[i].setVisible(true);
      } else {
        this.robotarrn[i].setVisible(false);
      }
    }
  }

  refreshPage() {
    this.location.go(this.location.path());
    window.location.reload();
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

  tableColor(list: any) {
    for (let i = 0; i < list.length; i++) {
      const element = document.getElementById(list[i]);
      if (element) {
        element.style.backgroundColor = this.iconColor(i + 1);
      }
    }
  }

  roomi(room: any) {
    this.webSoc.emit("room", room);
    this.webSoc.listen("location1").subscribe((data: any) => {
      if (data.room === "robot1") {
        this.location1 = data.data;
      } else if (data.room === "robot2") {
        this.location2 = data.data;
      }
    });
    this.webSoc.listen("heading1").subscribe((data: any) => {
      if (data.room === "robot1") {
        this.head1 = data.data;
      } else if (data.room === "robot2") {
        this.head2 = data.data;
      }
    });
  }

  toggleTable() {
    const toggleBtn = document.querySelector('.burger-table');
    const sidebar = document.querySelector('.device-list');

    if (toggleBtn && sidebar) {
      toggleBtn.classList.toggle('is-closed');
      sidebar.classList.toggle('is-closed');
    }
  }

  newZoom(lon: any, lat: any) {
    if (this.map) {
      this.map.setView(new View({
        center: fromLonLat([lon, lat]),
        zoom: 20,
        enableRotation: false
      }));
    }
  }

  layerdev(length: any) {
    const aslilength = length;
    this.robotarrn = [];

    for (let i = 0; i < aslilength; i++) {
      const gpsFeature = new Feature({
        geometry: new Point(fromLonLat([106.920671 - 0.0001 * Math.random(), -6.167175 - 0.0001 * Math.random()]))
      });

      gpsFeature.setStyle(new Style({
        image: new Icon({
          src: 'assets/arrow.svg',
          size: [600, 600],
          scale: 0.1,
        })
      }));

      const gpsLayer = new VectorLayer<FeatureLike>({
        source: new VectorSource<FeatureLike>({
          features: [gpsFeature]
        })
      });

      this.robotarrn.push(gpsLayer);
    }

    this.map = new Map({
      target: 'map',
      controls: [],
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: fromLonLat([106.920671, -6.167175]),
        zoom: 1,
        enableRotation: false
      })
    });

    this.map.addControl(new Zoom({
      className: 'zoom-control',
      zoomInLabel: '+',
      zoomOutLabel: '-'
    }));

    for (let i = 0; i < aslilength; i++) {
      this.map.addLayer(this.robotarrn[i]);
    }
  }
}

