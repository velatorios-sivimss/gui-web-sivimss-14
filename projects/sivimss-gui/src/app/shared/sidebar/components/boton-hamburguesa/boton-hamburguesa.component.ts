import { Component, OnInit } from '@angular/core';
import { MenuSidebarService } from "projects/sivimss-gui/src/app/shared/sidebar/services/menu-sidebar.service";
import { Observable } from "rxjs";

@Component({
  selector: 'app-boton-hamburguesa',
  templateUrl: './boton-hamburguesa.component.html',
  styleUrls: ['./boton-hamburguesa.component.scss']
})
export class BotonHamburguesaComponent implements OnInit {

  activo$!: Observable<boolean>;

  constructor(private menuSidebarService: MenuSidebarService) {
  }

  ngOnInit(): void {
    this.activo$ = this.menuSidebarService.menuSidebar$;
  }

  toggle() {
    this.menuSidebarService.toggle();
  }

}
