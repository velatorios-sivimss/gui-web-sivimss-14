import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubheaderPrivadoComponent } from './subheader-privado.component';

describe('SubheaderPrivadoComponent', () => {
  let component: SubheaderPrivadoComponent;
  let fixture: ComponentFixture<SubheaderPrivadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubheaderPrivadoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubheaderPrivadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
