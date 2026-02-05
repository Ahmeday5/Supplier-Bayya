import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyDeliveryStationComponent } from './my-delivery-station.component';

describe('MyDeliveryStationComponent', () => {
  let component: MyDeliveryStationComponent;
  let fixture: ComponentFixture<MyDeliveryStationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyDeliveryStationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyDeliveryStationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
