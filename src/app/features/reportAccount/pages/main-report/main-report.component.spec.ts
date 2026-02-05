import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainReportComponent } from './main-report.component';

describe('MainReportComponent', () => {
  let component: MainReportComponent;
  let fixture: ComponentFixture<MainReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
