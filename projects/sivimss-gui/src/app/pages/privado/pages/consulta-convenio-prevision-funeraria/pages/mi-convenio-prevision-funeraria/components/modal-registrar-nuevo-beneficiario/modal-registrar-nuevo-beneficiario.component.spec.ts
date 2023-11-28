import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRegistrarNuevoBeneficiarioComponent } from './modal-registrar-nuevo-beneficiario.component';

describe('ModalRegistrarNuevoBeneficiarioComponent', () => {
  let component: ModalRegistrarNuevoBeneficiarioComponent;
  let fixture: ComponentFixture<ModalRegistrarNuevoBeneficiarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalRegistrarNuevoBeneficiarioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalRegistrarNuevoBeneficiarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
