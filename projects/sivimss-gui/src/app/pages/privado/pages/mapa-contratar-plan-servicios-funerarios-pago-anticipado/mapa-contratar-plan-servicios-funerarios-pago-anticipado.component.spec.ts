import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaContratarPlanServiciosFunerariosPagoAnticipadoComponent } from './mapa-contratar-plan-servicios-funerarios-pago-anticipado.component';

describe('MapaContratarPlanServiciosFunerariosPagoAnticipadoComponent', () => {
  let component: MapaContratarPlanServiciosFunerariosPagoAnticipadoComponent;
  let fixture: ComponentFixture<MapaContratarPlanServiciosFunerariosPagoAnticipadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapaContratarPlanServiciosFunerariosPagoAnticipadoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapaContratarPlanServiciosFunerariosPagoAnticipadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
