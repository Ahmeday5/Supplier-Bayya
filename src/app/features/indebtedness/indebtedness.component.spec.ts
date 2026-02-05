import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndebtednessComponent } from './indebtedness.component';

describe('IndebtednessComponent', () => {
  let component: IndebtednessComponent;
  let fixture: ComponentFixture<IndebtednessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndebtednessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndebtednessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
