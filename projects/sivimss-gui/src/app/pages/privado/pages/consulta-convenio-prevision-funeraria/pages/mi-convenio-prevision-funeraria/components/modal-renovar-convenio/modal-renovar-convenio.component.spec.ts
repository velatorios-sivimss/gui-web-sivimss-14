import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRenovarConvenioComponent } from './modal-renovar-convenio.component';

describe('ModalRenovarConvenioComponent', () => {
  let component: ModalRenovarConvenioComponent;
  let fixture: ComponentFixture<ModalRenovarConvenioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalRenovarConvenioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalRenovarConvenioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
