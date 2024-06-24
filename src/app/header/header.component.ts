import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  public dt = new Date()
  clock: any

  constructor() {}

  ngOnInit() {
    this.getdisTime()
    setInterval(() => {
      this.getdisTime()
    }, 5000)
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
    var curmonth = months[this.dt.getMonth()]
    var curdate = this.dt.getDate()
    var textdate = curdate.toString()
    var curyear = this.dt.getFullYear()
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

    this.clock = formattedHours + ':' + formattedMinutes

    // return formattedHours + ":" + formattedMinutes
  }
}
