import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContratarPlanServiciosFunerariosPagoAnticipadoComponent } from './contratar-plan-servicios-funerarios-pago-anticipado.component';

describe('ContratarPlanServiciosFunerariosPagoAnticipadoComponent', () => {
  let component: ContratarPlanServiciosFunerariosPagoAnticipadoComponent;
  let fixture: ComponentFixture<ContratarPlanServiciosFunerariosPagoAnticipadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContratarPlanServiciosFunerariosPagoAnticipadoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContratarPlanServiciosFunerariosPagoAnticipadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
