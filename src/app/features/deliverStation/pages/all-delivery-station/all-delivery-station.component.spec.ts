import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllDeliveryStationComponent } from './all-delivery-station.component';

describe('AllDeliveryStationComponent', () => {
  let component: AllDeliveryStationComponent;
  let fixture: ComponentFixture<AllDeliveryStationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllDeliveryStationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllDeliveryStationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
