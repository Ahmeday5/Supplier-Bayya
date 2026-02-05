import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnDetailsComponent } from './return-details.component';

describe('ReturnDetailsComponent', () => {
  let component: ReturnDetailsComponent;
  let fixture: ComponentFixture<ReturnDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReturnDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
