import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRegistrarBeneficiarioComponent } from './modal-registrar-beneficiario.component';

describe('ModalRegistrarBeneficiarioComponent', () => {
  let component: ModalRegistrarBeneficiarioComponent;
  let fixture: ComponentFixture<ModalRegistrarBeneficiarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalRegistrarBeneficiarioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalRegistrarBeneficiarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
