import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { MainComponent } from './main/main.component'
import { IpInsertComponent } from './ip-insert/ip-insert.component'
import { LocationStrategy } from '@angular/common'
import { HashLocationStrategy } from '@angular/common'

const routes: Routes = [
  {
    path: 'main',
    component: MainComponent,
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
