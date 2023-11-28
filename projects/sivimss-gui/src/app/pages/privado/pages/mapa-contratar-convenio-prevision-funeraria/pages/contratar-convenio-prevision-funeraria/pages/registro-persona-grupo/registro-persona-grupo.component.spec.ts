import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroPersonaGrupoComponent } from './registro-persona-grupo.component';

describe('RegistroPersonaGrupoComponent', () => {
  let component: RegistroPersonaGrupoComponent;
  let fixture: ComponentFixture<RegistroPersonaGrupoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistroPersonaGrupoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroPersonaGrupoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
