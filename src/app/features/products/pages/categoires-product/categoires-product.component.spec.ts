import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoiresProductComponent } from './categoires-product.component';

describe('CategoiresProductComponent', () => {
  let component: CategoiresProductComponent;
  let fixture: ComponentFixture<CategoiresProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoiresProductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoiresProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
