import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import Feature, { FeatureLike } from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import { Icon, Style } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { WebsocketService } from '../services/websocket.service';
import { GpsdataService } from '../services/gpsdata.service';
import { Geometry } from 'ol/geom';
import { getRandomColorHex } from '../utils/get-random-color';

@Component({
  selector: 'app-map',
  templateUrl: './map-component.html',
  styleUrls: ['./map-component.css']
})
export class MapComponent implements OnInit {
  public map: Map | undefined;
  public satelitecnt: any;
  public hdop: any;
  public longi: any;
  public lati: any;
  public temploc = [0, 0];
  public ipAdd: any;

  constructor(
    public webSoc: WebsocketService,
    public gpsData: GpsdataService
  ) {}

  ngOnInit() {
    this.initgps();
  }

  initgps() {
    this.gpsData.Init();

    this.addcount();
    setTimeout(() => {
      this.longi = this.gpsData.long;
      this.lati = this.gpsData.lat;
      console.log("longitude again: " + this.longi);
      console.log("latitude again: " + this.lati);
      this.initmap(this.gpsData, this.longi, this.lati);
    }, 500);
  }

  addcount() {
    this.satelitecnt = this.gpsData.sateliteCount();
    this.hdop = this.gpsData.gethdop();
    console.log("satelite: " + this.satelitecnt);
    console.log("hdop: " + this.hdop);
  }

  // Function to initiate GPS data visualization in map
  initmap(gpsdataservice: any, lon: any, lat: any) {
    console.log("calling initmap");

    // Create a new feature for GPS icon
    const gpsFeature = new Feature<Point>({
      geometry: new Point(fromLonLat(gpsdataservice.coordinate()))
    });

    // Set the style for GPS icon
    gpsFeature.setStyle(
      new Style({
        image: new Icon({
          src: 'assets/arrow.svg',
          size: [600, 600],
          scale: 0.1,
          color: getRandomColorHex()
        })
      })
    );

    // Make a vector source for new GPS layer from GPS feature
    const gpsSource = new VectorSource<FeatureLike>({
      features: [gpsFeature]
    });

    // Make a new vector layer from GPS source
    const gpsLayer = new VectorLayer<FeatureLike>({
      source: gpsSource
    });

    // Make a map and setup the map source, layer, and view
    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        gpsLayer
      ],
      view: new View({
        center: fromLonLat([lon, lat]),
        zoom: 20,
        enableRotation: false
      })
    });

    // Make an interval function that will update position and heading of GPS icon every 0.1 second
    setInterval(() => {
      gpsSource.clear();
      const temp_gpsFeature = new Feature<Point>({
        geometry: new Point(fromLonLat(gpsdataservice.coordinate()))
      });

      temp_gpsFeature.setStyle(
        new Style({
          image: new Icon({
            src: 'assets/arrow.svg',
            size: [600, 600],
            scale: 100,
          })
        })
      );
      gpsSource.addFeature(temp_gpsFeature);
    }, 100);
  }
}
