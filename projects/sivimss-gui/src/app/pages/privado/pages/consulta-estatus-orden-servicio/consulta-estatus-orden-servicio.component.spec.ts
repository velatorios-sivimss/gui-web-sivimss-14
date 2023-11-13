import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaEstatusOrdenServicioComponent } from './consulta-estatus-orden-servicio.component';

describe('ConsultaEstatusOrdenServicioComponent', () => {
  let component: ConsultaEstatusOrdenServicioComponent;
  let fixture: ComponentFixture<ConsultaEstatusOrdenServicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultaEstatusOrdenServicioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultaEstatusOrdenServicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
