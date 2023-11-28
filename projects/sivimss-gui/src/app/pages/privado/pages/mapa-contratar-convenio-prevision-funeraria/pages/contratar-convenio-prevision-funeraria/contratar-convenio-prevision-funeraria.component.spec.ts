import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContratarConvenioPrevisionFunerariaComponent } from './contratar-convenio-prevision-funeraria.component';

describe('ContratarConvenioPrevisionFunerariaComponent', () => {
  let component: ContratarConvenioPrevisionFunerariaComponent;
  let fixture: ComponentFixture<ContratarConvenioPrevisionFunerariaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContratarConvenioPrevisionFunerariaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContratarConvenioPrevisionFunerariaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
