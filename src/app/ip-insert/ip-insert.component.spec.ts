import { ComponentFixture, TestBed } from '@angular/core/testing'

import { IpInsertComponent } from './ip-insert.component'

describe('IpInsertComponent', () => {
  let component: IpInsertComponent
  let fixture: ComponentFixture<IpInsertComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IpInsertComponent],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(IpInsertComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
