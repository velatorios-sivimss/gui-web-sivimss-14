import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuServiciosComponent } from './menu-servicios.component';

describe('MenuServiciosComponent', () => {
  let component: MenuServiciosComponent;
  let fixture: ComponentFixture<MenuServiciosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuServiciosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuServiciosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
