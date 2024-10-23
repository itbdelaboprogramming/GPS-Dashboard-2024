import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { WebsocketService } from '../services/websocket.service';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import Feature, { FeatureLike } from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import { Icon, Style } from 'ol/style';
import html2canvas from 'html2canvas';
import { fromLonLat } from 'ol/proj';
import { getRandomColorHex } from '../utils/get-random-color';
import { state } from '@angular/animations';
import { visibility } from 'html2canvas/dist/types/css/property-descriptors/visibility';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  public map: Map | undefined;
  public vectorSource = new VectorSource();
  private previousVehicleNumber  = 0;

  constructor(
    public socket: WebsocketService,
  ) {}

  ngOnInit() {
    this.initMap();
    this.socket.listen("vehicle-list").subscribe((data: any) => {
      this.updateMapFeature(data);
      this.updateTable(data);
    });
  }

  showNotification() {
    const notification = document.querySelector('.toast-notification')!!;
    if (notification) {
      notification.classList.remove('hidden');
    }
    notification.innerHTML = '&#9432 The location displayed for the disconnected robot is the last location it was connected';
  }

  updateTable(data: any) {
    const table = document.getElementById('device-table') as HTMLTableElement;
    const prevVehicle = data.slice(0, this.previousVehicleNumber);
    prevVehicle.forEach((vehc: any, i: any) => {
      const row = document.getElementById(`vehicle-item-${i}`);
      if (row) {
        const nameCell = row.querySelector('.name') as HTMLTableCellElement;
        const latCell = row.querySelector('.coordinate') as HTMLTableCellElement;
        const longCell = latCell.nextElementSibling as HTMLTableCellElement;
        const stateCell = longCell.nextElementSibling as HTMLTableCellElement;
        latCell.innerText = vehc.latitude;
        longCell.innerText = vehc.longitude;
        stateCell.innerText = vehc.state;
        if (stateCell.innerText === 'Working') {
          latCell.style.backgroundColor = '#D9FEFA';
          longCell.style.backgroundColor = '#D9FEFA';
          stateCell.style.backgroundColor = '#D9FEFA';
          nameCell.style.backgroundColor = '#D9FEFA';
        } else {
          latCell.style.backgroundColor = '#D498A9';
          longCell.style.backgroundColor = '#D498A9';
          stateCell.style.backgroundColor = '#D498A9';
          nameCell.style.backgroundColor = '#D498A9';
        }
      }
    });
    const newVehicle = data.slice(this.previousVehicleNumber);
    this.previousVehicleNumber = data.length;
    newVehicle.forEach((vehc: any, i: any) => {
      const row = document.createElement('tr');
      row.style.height = 'auto';
      row.style.background = '#e6f3f7';
      row.style.opacity = '0.8';
      row.style.alignItems = 'center';
      row.style.justifyContent = 'center';
      row.style.textAlign = 'center';

      row.id = `vehicle-item-${i}`;
  
      
      const indexCell = document.createElement('td');
      indexCell.style.backgroundColor = getRandomColorHex(vehc.id);
      indexCell.style.border = '3px solid #0567a6';
      const indexText = document.createElement('p');
      indexText.innerText = i + 1;
      indexCell.appendChild(indexText);
      row.appendChild(indexCell);
  
      const nameCell = document.createElement('td');
      nameCell.style.backgroundColor = vehc.state === 'Working' ? '#D9FEFA' : '#D498A9';
      nameCell.style.border = '3px solid #0567a6';
      const nameText = document.createElement('p');
      nameText.innerText = vehc.name;
      nameCell.appendChild(nameText);
      row.appendChild(nameCell);
  

      const latCell = document.createElement('td');
      latCell.style.backgroundColor = vehc.state === 'Working' ? '#D9FEFA' : '#D498A9';
      latCell.style.border = '3px solid #0567a6';
      latCell.classList.add('coordinate');
      const latText = document.createElement('p');
      latText.innerText = vehc.latitude;
      latCell.appendChild(latText);
      row.appendChild(latCell);
  
      const longCell = document.createElement('td');
      longCell.style.backgroundColor = vehc.state === 'Working' ? '#D9FEFA' : '#D498A9';
      longCell.style.border = '3px solid #0567a6';
      longCell.classList.add('coordinate');
      const longText = document.createElement('p');
      longText.innerText = vehc.longitude;
      longCell.appendChild(longText);
      row.appendChild(longCell);
  
      const stateCell = document.createElement('td');
      stateCell.style.backgroundColor = vehc.state === 'Working' ? '#D9FEFA' : '#D498A9';
      stateCell.style.border = '3px solid #0567a6';
      const stateText = document.createElement('p');
      stateText.innerText = vehc.state;
      stateCell.appendChild(stateText);
      row.appendChild(stateCell);
  
      const focusCell = document.createElement('td');
      focusCell.style.border = '3px solid #0567a6'; 
      const focusIcon = document.createElement('img');
      focusIcon.src = 'assets/focus.svg';
      focusIcon.style.width = '20px';
      focusIcon.style.height = '20px';
      focusIcon.onclick = () => {
        this.moveFocus(vehc.longitude, vehc.latitude);
      }
      focusCell.appendChild(focusIcon);
      row.appendChild(focusCell);
  
      const checkboxCell = document.createElement('td');
      checkboxCell.style.border = '3px solid #0567a6';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `check-${i}`;
      checkbox.checked = true;
      checkbox.classList.add('view-checkbox');
      checkbox.onclick =  () => {
        this.viewCheckbox(`check-${i}`, vehc.id);
      };
      checkboxCell.appendChild(checkbox);
      row.appendChild(checkboxCell);
  
      // Append the row to the table body
      table.appendChild(row);
    });
      
  }

  
  

  updateMapFeature(data: any) {
    console.log("Updating map features");
    let foundDisconnected = false;
    for (let i = 0; i < data.length; i++) {
      if (data[i].state == "Disconnected") {
        foundDisconnected = true;
      }

      const feature = new Feature({
        geometry: new Point(
          fromLonLat([
            data[i].longitude,
            data[i].latitude
          ])
        )
      });
      
      feature.setStyle(
        new Style({
          image: new Icon({
            src: 'assets/arrow.svg',
            size: [600, 600],
            scale: 0.1,
            color: getRandomColorHex(data[i].id)
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

  viewCheckbox(checkboxId: any, vehicleId: any) {
    const checkbox = document.getElementById(checkboxId) as HTMLInputElement;
    if (checkbox) {
      if (checkbox.checked) {
        this.vectorSource.getFeatureById(vehicleId)!!.setStyle(
          new Style({
            image: new Icon({
              src: 'assets/arrow.svg',
              size: [600, 600],
              scale: 0.1,
              color: getRandomColorHex(vehicleId)
            })
          })
        );
      } else {
        this.vectorSource.getFeatureById(vehicleId)!!.setStyle(
          new Style(undefined)
        );
      } 
    }
  }

  // iconVisible() {
  //   for (let i = 0; i < this.vehicleList.length; i++) {
  //     const elm = document.getElementById("check" + this.vehicleList[i]) as HTMLInputElement;
  //     if (elm.checked === true) {
  //       this.vectorSource.getFeatureById(this.vehicleList[i].id)!!.setStyle(
  //         new Style({
  //           image: new Icon({
  //             src: 'assets/arrow.svg',
  //             size: [600, 600],
  //             scale: 0.1
  //           })
  //         })
  //       );
  //     } else {
  //       this.vectorSource.getFeatureById(this.vehicleList[i].id)!!.setStyle(
  //         undefined
  //       );

  //     }
  //   }
  // }


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

  moveFocus(longitude: any, latitude:any) {
    console.log("Moving focus");
    if (this.map) {
      this.map.setView(new View({
        center: fromLonLat([longitude, latitude]),
        zoom: 20,
        enableRotation: false
      }));
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

  getRandomColorHex(num: any): string {
    return getRandomColorHex(num);
  }
}

