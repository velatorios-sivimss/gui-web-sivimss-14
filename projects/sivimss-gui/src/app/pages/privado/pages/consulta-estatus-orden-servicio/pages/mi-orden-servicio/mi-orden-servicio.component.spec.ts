import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiOrdenServicioComponent } from './mi-orden-servicio.component';

describe('MiOrdenServicioComponent', () => {
  let component: MiOrdenServicioComponent;
  let fixture: ComponentFixture<MiOrdenServicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiOrdenServicioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiOrdenServicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
