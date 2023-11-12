import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaPlanServiciosFunerariosPagoAnticipadoComponent } from './consulta-plan-servicios-funerarios-pago-anticipado.component';

describe('ConsultaPlanServiciosFunerariosPagoAnticipadoComponent', () => {
  let component: ConsultaPlanServiciosFunerariosPagoAnticipadoComponent;
  let fixture: ComponentFixture<ConsultaPlanServiciosFunerariosPagoAnticipadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultaPlanServiciosFunerariosPagoAnticipadoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultaPlanServiciosFunerariosPagoAnticipadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
