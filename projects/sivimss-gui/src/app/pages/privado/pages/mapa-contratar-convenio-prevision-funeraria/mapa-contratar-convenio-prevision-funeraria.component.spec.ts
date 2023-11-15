import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaContratarConvenioPrevisionFunerariaComponent } from './mapa-contratar-convenio-prevision-funeraria.component';

describe('ContratarConvenioPrevisionFunerariaComponent', () => {
  let component: MapaContratarConvenioPrevisionFunerariaComponent;
  let fixture: ComponentFixture<MapaContratarConvenioPrevisionFunerariaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapaContratarConvenioPrevisionFunerariaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapaContratarConvenioPrevisionFunerariaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
