import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiPlanServiciosFunerariosPagoAnticipadoComponent } from './mi-plan-servicios-funerarios-pago-anticipado.component';

describe('MiPlanServiciosFunerariosPagoAnticipadoComponent', () => {
  let component: MiPlanServiciosFunerariosPagoAnticipadoComponent;
  let fixture: ComponentFixture<MiPlanServiciosFunerariosPagoAnticipadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiPlanServiciosFunerariosPagoAnticipadoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiPlanServiciosFunerariosPagoAnticipadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
