import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { MapComponent } from './map/map-component'
import { TestComponent } from './main/main.component'
import { IpInsertComponent } from './ip-insert/ip-insert.component'
import { LocationStrategy } from '@angular/common'
import { HashLocationStrategy } from '@angular/common'

const routes: Routes = [
  {
    path: 'dashboard',
    component: MapComponent,
  },
  {
    path: 'main',
    component: TestComponent,
  },
  {
    path: 'config',
    component: IpInsertComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/main',
  },
]

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy,
    },
  ],
})
export class AppRoutingModule {}
