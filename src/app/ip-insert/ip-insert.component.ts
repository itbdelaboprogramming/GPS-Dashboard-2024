import { Component, OnInit } from '@angular/core'
import { WebsocketService } from '../services/websocket.service'
import { Router } from '@angular/router'

@Component({
  selector: 'app-ip-insert',
  templateUrl: './ip-insert.component.html',
  styleUrls: ['./ip-insert.component.css'],
})
export class IpInsertComponent implements OnInit {
  constructor(
    public webSoc: WebsocketService,
    private rout: Router,
  ) {}

  public ipadd: any

  ngOnInit(): void {}

  toMain(ip: any) {
    this.rout.navigate(['/main'])
    localStorage.setItem('ip', ip)
  }
}
