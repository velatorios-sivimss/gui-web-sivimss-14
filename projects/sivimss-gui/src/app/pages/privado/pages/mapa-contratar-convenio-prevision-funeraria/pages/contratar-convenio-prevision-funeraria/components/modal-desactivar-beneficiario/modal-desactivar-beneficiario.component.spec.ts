import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDesactivarBeneficiarioComponent } from './modal-desactivar-beneficiario.component';

describe('ModalDesactivarBeneficiarioComponent', () => {
  let component: ModalDesactivarBeneficiarioComponent;
  let fixture: ComponentFixture<ModalDesactivarBeneficiarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalDesactivarBeneficiarioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalDesactivarBeneficiarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
