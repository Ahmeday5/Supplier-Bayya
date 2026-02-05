import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayToBayyaComponent } from './pay-to-bayya.component';

describe('PayToBayyaComponent', () => {
  let component: PayToBayyaComponent;
  let fixture: ComponentFixture<PayToBayyaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayToBayyaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayToBayyaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
