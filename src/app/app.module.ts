import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { FormsModule } from '@angular/forms'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { MapComponent } from './map/map-component'
import { TestComponent } from './test/test.component'
import { HeaderComponent } from './header/header.component'
import { IpInsertComponent } from './ip-insert/ip-insert.component'
import { HashLocationStrategy, LocationStrategy } from '@angular/common'

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    TestComponent,
    HeaderComponent,
    IpInsertComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
