import { Component, OnInit } from '@angular/core';
import {MENU_ORDEN_ENTRADA} from "../../constants/tab-orden-entrada";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {ORDEN_ENTRADA_BREADCRUMB} from "../../constants/breadcrumb";

@Component({
  selector: 'app-orden-entrada',
  templateUrl: './orden-entrada.component.html',
  styleUrls: ['./orden-entrada.component.scss']
})
export class OrdenEntradaComponent implements OnInit {

  menu: string[] = MENU_ORDEN_ENTRADA;
  index: number = 0;

  constructor(private breadcrumbService: BreadcrumbService) { }

  ngOnInit(): void {
    this.index = +JSON.parse(localStorage.getItem('indexOrdenEntrada') as string);
    localStorage.removeItem("indexOrdenEntrada")
    this.actualizarBreadCrumb();
  }

  actualizarBreadCrumb(): void {
    this.breadcrumbService.actualizar(ORDEN_ENTRADA_BREADCRUMB);
  }

}
