import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEditarBeneficiarioComponent } from './modal-editar-beneficiario.component';

describe('ModalEditarBeneficiarioComponent', () => {
  let component: ModalEditarBeneficiarioComponent;
  let fixture: ComponentFixture<ModalEditarBeneficiarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalEditarBeneficiarioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalEditarBeneficiarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
