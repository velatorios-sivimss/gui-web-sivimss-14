import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComprobantePagoComponent } from './comprobante-pago.component';

describe('ComprobantePagoComponent', () => {
  let component: ComprobantePagoComponent;
  let fixture: ComponentFixture<ComprobantePagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComprobantePagoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComprobantePagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
